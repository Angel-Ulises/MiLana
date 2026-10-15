// Cloudflare Pages sirve `ruta/index.html` en `/ruta/` y responde 308 desde `/ruta`.
// Las canonical y el sitemap de MiLana usan `/ruta` (trailingSlash:false).
// Mover el HTML a `ruta.html` hace que Pages responda 200 en la URL canónica.
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

export const ORIGEN = 'https://www.milanaaqui.mx';
const SENTINEL_CABECERAS = '# MiLana Pages: seguridad y caché. Sin noindex global.';
const RUTA_LOCAL = /^\/(?:[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*)?$/;

function caminar(dir, salida = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error(`No se admiten enlaces simbólicos: ${entry.name}`);
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'assets' || entry.name === '.vite') continue;
      caminar(path, salida);
    } else salida.push(path);
  }
  return salida;
}

export function canonicales(html) {
  const patrones = [
    /<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi,
    /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["']canonical["'][^>]*>/gi,
  ];
  const hallados = [];
  for (const patron of patrones) {
    for (const match of html.matchAll(patron)) hallados.push(match[1].trim());
  }
  return [...new Set(hallados)];
}

export function archivoCanonico(dist, ruta) {
  if (ruta === '/') return join(dist, 'index.html');
  return join(dist, `${ruta.replace(/^\//, '')}.html`);
}

export function pagesRedirects(routes, legacy = []) {
  const result = new Map();
  const add = (source, destination, status = 308) => {
    // El destino es siempre una ruta canónica. El origen puede ser la variante .html, con slash o index.html.
    if (!source.startsWith('/') || source.startsWith('//') || /[\s*]/.test(source) || source.includes('..') || !RUTA_LOCAL.test(destination)) {
      throw new Error(`Redirect no soportado: ${source} -> ${destination}`);
    }
    if (source === destination) return;
    const prior = result.get(source);
    const line = `${destination} ${status}`;
    if (prior && prior !== line) throw new Error(`Redirect en conflicto: ${source}`);
    result.set(source, line);
  };
  for (const rule of legacy) {
    if (!RUTA_LOCAL.test(rule.source) || !RUTA_LOCAL.test(rule.destination)) throw new Error('Redirect Vercel no soportado');
    for (const suffix of ['', '/', '.html', '/index.html']) add(rule.source + suffix, rule.destination, rule.permanent ? 308 : 307);
  }
  add('/index.html', '/');
  for (const route of routes) {
    if (route === '/') continue;
    if (!legacy.some(rule => rule.source === route)) {
      add(route + '/', route);
      add(route + '/index.html', route);
    }
  }
  for (const source of result.keys()) {
    const seen = new Set([source]);
    let target = result.get(source).split(' ')[0];
    while (result.has(target)) {
      if (seen.has(target)) throw new Error(`Ciclo de redirects: ${source}`);
      seen.add(target);
      target = result.get(target).split(' ')[0];
    }
  }
  if (result.size > 2000) throw new Error('Demasiados redirects estáticos para Pages');
  return '# Generado para Cloudflare Pages. La URL canónica no lleva slash final.\n' +
    '# /ruta.html lo redirige la plataforma; aquí van el slash, index.html y las rutas heredadas.\n' +
    [...result].map(([source, target]) => `${source} ${target}`).join('\n') + '\n';
}

function descubrir(dist) {
  const moves = [];
  const routes = new Set(['/']);
  for (const file of caminar(dist)) {
    const rel = relative(dist, file).split(sep).join('/');
    if (rel === 'index.html' || rel === '404.html') continue;
    if (rel.endsWith('/index.html')) {
      const route = `/${rel.slice(0, -'/index.html'.length)}`;
      if (!RUTA_LOCAL.test(route)) throw new Error(`Ruta no apta para clean URL: ${route}`);
      const targetRel = `${route.slice(1)}.html`;
      moves.push({ from: file, to: join(dist, targetRel), route, targetRel });
      routes.add(route);
    } else if (rel.endsWith('.html')) {
      const route = `/${rel.slice(0, -'.html'.length)}`;
      if (!RUTA_LOCAL.test(route)) throw new Error(`Ruta no apta para clean URL: ${route}`);
      routes.add(route);
    }
  }
  for (const move of moves) {
    if (existsSync(move.to)) throw new Error(`Colisión de clean URL: ${move.targetRel}`);
  }
  return { routes: [...routes].sort((a, b) => a.localeCompare(b, 'es')), moves };
}

function asegurarCabeceras(dist) {
  const path = join(dist, '_headers');
  const actual = existsSync(path) ? readFileSync(path, 'utf8') : '';
  if (actual.includes(SENTINEL_CABECERAS)) return;
  const pagesDev = /:project\.pages\.dev/.test(actual) ? '' : `
https://:project.pages.dev/*
  X-Robots-Tag: noindex

https://:version.:project.pages.dev/*
  X-Robots-Tag: noindex
`;
  const bloque = `${actual.trimEnd()}${actual.trim() ? '\n\n' : ''}${SENTINEL_CABECERAS}
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable
${pagesDev.trim() ? `\n${pagesDev.trim()}\n` : ''}`;
  writeFileSync(path, bloque.endsWith('\n') ? bloque : `${bloque}\n`);
}

export function leerRedirects(dist) {
  const texto = readFileSync(join(dist, '_redirects'), 'utf8');
  const map = new Map();
  for (const line of texto.split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const [source, destination, status] = line.split(/\s+/);
    map.set(source, { destination, status: Number(status) });
  }
  return map;
}

export function verificarSitemapEstatico(dist, origen = ORIGEN) {
  if (!existsSync(join(dist, 'sitemap.xml'))) throw new Error('Falta dist/sitemap.xml');
  if (!existsSync(join(dist, '404.html'))) throw new Error('Falta dist/404.html');
  const xml = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].trim());
  if (new Set(locs).size !== locs.length) throw new Error('sitemap.xml contiene URLs duplicadas');
  const redirects = leerRedirects(dist);
  const errores = [];
  const rutas = [];
  for (const loc of locs) {
    let url;
    try { url = new URL(loc); } catch { errores.push(`sitemap URL inválida: ${loc}`); continue; }
    if (url.origin !== origen) errores.push(`sitemap fuera del origen oficial: ${loc}`);
    if (url.pathname !== '/' && url.pathname.endsWith('/')) errores.push(`sitemap con slash final: ${loc}`);
    const ruta = url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, '');
    rutas.push(ruta);
    if (redirects.has(ruta)) errores.push(`la URL canónica está redirigida: ${ruta} -> ${redirects.get(ruta).destination}`);
    const archivo = archivoCanonico(dist, ruta);
    const anidado = ruta === '/' ? null : join(dist, ruta.slice(1), 'index.html');
    if (!existsSync(archivo)) errores.push(`falta ${relative(dist, archivo)} para servir ${ruta} sin redirect`);
    if (anidado && existsSync(anidado)) errores.push(`${ruta}/index.html provocaría 308 hacia ${ruta}/`);
    if (existsSync(archivo)) {
      const canon = canonicales(readFileSync(archivo, 'utf8'));
      if (canon.length !== 1) errores.push(`${ruta}: se esperaba 1 canonical y hay ${canon.length}`);
      else if (canon[0] !== loc) errores.push(`${ruta}: canonical ${canon[0]} no coincide con ${loc}`);
    }
    if (ruta !== '/') {
      const slash = redirects.get(`${ruta}/`);
      const index = redirects.get(`${ruta}/index.html`);
      if (!slash || slash.destination !== ruta || slash.status !== 308) errores.push(`falta redirect 308 de ${ruta}/ hacia ${ruta}`);
      if (!index || index.destination !== ruta || index.status !== 308) errores.push(`falta redirect 308 de ${ruta}/index.html hacia ${ruta}`);
    }
  }
  if (errores.length) {
    throw new Error(`Sitemap estático incompatible con Pages:\n${errores.map(error => `  ${error}`).join('\n')}`);
  }
  return rutas;
}

export function prepararUrlsPages({ root = resolve('.'), dist = join(resolve(root), 'dist') } = {}) {
  root = resolve(root);
  dist = resolve(dist);
  for (const name of ['index.html', '404.html', 'sitemap.xml']) {
    if (!existsSync(join(dist, name))) throw new Error(`Falta dist/${name}; ejecuta el build antes de preparar Pages`);
  }
  const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
  const { routes, moves } = descubrir(dist);
  for (const move of moves) {
    mkdirSync(dirname(move.to), { recursive: true });
    renameSync(move.from, move.to);
  }
  const redirects = pagesRedirects(routes, vercel.redirects ?? []);
  writeFileSync(join(dist, '_redirects'), redirects);
  asegurarCabeceras(dist);
  const canonicas = verificarSitemapEstatico(dist);
  return {
    routes,
    canonicas,
    moved: moves.map(move => move.targetRel),
    redirects: redirects.split('\n').filter(line => line && !line.startsWith('#')).length,
  };
}
