import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

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

function normalizarHref(href) {
  if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(href)) return null;
  if (href.startsWith(ORIGEN)) return new URL(href).pathname;
  if (/^https?:\/\//i.test(href) || href.startsWith('//')) return null;
  if (!href.startsWith('/')) return null;
  return href.split('#')[0].split('?')[0] || '/';
}

function existeRuta(pathname) {
  if (pathname === '/') return existsSync(join(DIST, 'index.html'));
  const rel = pathname.replace(/^\/+|\/+$/g, '');
  return existsSync(join(DIST, rel)) || existsSync(join(DIST, rel, 'index.html'));
}

const htmls = recorrer(DIST, '.html');
const rotos = new Map();
const destinos = new Set();
const reHref = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;

for (const archivo of htmls) {
  const html = readFileSync(archivo, 'utf8');
  let match;
  while ((match = reHref.exec(html))) {
    const pathname = normalizarHref(match[1]);
    if (!pathname) continue;
    destinos.add(pathname);
    if (existeRuta(pathname)) continue;
    if (!rotos.has(pathname)) rotos.set(pathname, new Set());
    rotos.get(pathname).add(relative(DIST, archivo));
  }
}

const sitemap = join(DIST, 'sitemap.xml');
if (existsSync(sitemap)) {
  const xml = readFileSync(sitemap, 'utf8');
  for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    if (!loc.startsWith(ORIGEN)) continue;
    const pathname = new URL(loc).pathname;
    destinos.add(pathname);
    if (existeRuta(pathname)) continue;
    if (!rotos.has(pathname)) rotos.set(pathname, new Set());
    rotos.get(pathname).add('sitemap.xml');
  }
}

if (rotos.size) {
  console.error(`enlaces internos: ${rotos.size} destino(s) roto(s)`);
  for (const [ruta, fuentes] of rotos) console.error(`  ${ruta} <- ${[...fuentes].join(', ')}`);
  process.exit(1);
}

console.log(`enlaces internos: ${destinos.size} destinos verificados en ${htmls.length} HTML, 0 rotos`);
