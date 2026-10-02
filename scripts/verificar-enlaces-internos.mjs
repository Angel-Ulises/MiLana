import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const DIST = resolve('dist');
const ORIGEN = 'https://www.milanaaqui.mx';

function recorrer(dir, extension, salida = []) {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    const stat = statSync(ruta);
    if (stat.isDirectory()) recorrer(ruta, extension, salida);
    else if (ruta.endsWith(extension)) salida.push(ruta);
  }
  return salida;
}

function rutaArchivo(archivo) {
  const rel = relative(DIST, archivo).split(sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'/index.html'.length)}`;
  return `/${rel}`;
}

function analizarHref(href, archivo) {
  if (!href || /^(mailto:|tel:|javascript:)/i.test(href)) return null;
  if (/^https?:\/\//i.test(href) && !href.startsWith(ORIGEN)) return null;
  if (href.startsWith('//')) return null;
  let url;
  try {
    if (href.startsWith('#')) url = new URL(`${rutaArchivo(archivo)}${href}`, ORIGEN);
    else if (href.startsWith('/') || href.startsWith(ORIGEN)) url = new URL(href, ORIGEN);
    else return null;
  } catch { return null; }
  let fragment = '';
  try { fragment = decodeURIComponent(url.hash.slice(1)); } catch { fragment = url.hash.slice(1); }
  return { pathname: url.pathname || '/', fragment };
}

function archivoDestino(pathname) {
  if (pathname === '/') return existsSync(join(DIST, 'index.html')) ? join(DIST, 'index.html') : null;
  const rel = pathname.replace(/^\/+|\/+$/g, '');
  const directo = join(DIST, rel);
  if (existsSync(directo) && statSync(directo).isFile()) return directo;
  const index = join(directo, 'index.html');
  return existsSync(index) ? index : null;
}

function contieneId(archivo, id) {
  if (!id || !archivo?.endsWith('.html')) return !id;
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\bid=["']${escaped}["']`, 'i').test(readFileSync(archivo, 'utf8'));
}

const htmls = recorrer(DIST, '.html');
const rotos = new Map();
const destinos = new Set();
const reHref = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;

function roto(clave, fuente) {
  if (!rotos.has(clave)) rotos.set(clave, new Set());
  rotos.get(clave).add(fuente);
}

for (const archivo of htmls) {
  const html = readFileSync(archivo, 'utf8');
  let match;
  while ((match = reHref.exec(html))) {
    const target = analizarHref(match[1], archivo);
    if (!target) continue;
    const clave = `${target.pathname}${target.fragment ? `#${target.fragment}` : ''}`;
    destinos.add(clave);
    const destino = archivoDestino(target.pathname);
    if (!destino) { roto(clave, relative(DIST, archivo)); continue; }
    if (target.fragment && !contieneId(destino, target.fragment)) roto(clave, `${relative(DIST, archivo)} (ancla sin id)`);
  }
}

const sitemap = join(DIST, 'sitemap.xml');
if (existsSync(sitemap)) {
  const xml = readFileSync(sitemap, 'utf8');
  for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    if (!loc.startsWith(ORIGEN)) continue;
    const pathname = new URL(loc).pathname;
    destinos.add(pathname);
    if (!archivoDestino(pathname)) roto(pathname, 'sitemap.xml');
  }
}

if (rotos.size) {
  console.error(`enlaces internos: ${rotos.size} destino(s) roto(s)`);
  for (const [ruta, fuentes] of rotos) console.error(`  ${ruta} <- ${[...fuentes].join(', ')}`);
  process.exit(1);
}
console.log(`enlaces internos: ${destinos.size} destinos/anclas verificados en ${htmls.length} HTML, 0 rotos`);
