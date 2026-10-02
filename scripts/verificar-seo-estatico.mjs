import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const DIST = resolve('dist');
const ORIGEN = 'https://www.milanaaqui.mx';
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const redirects = new Map((vercel.redirects ?? []).map(r => [r.source, r.destination]));
const sinSlashFinal = vercel.trailingSlash === false;

function htmls(dir, salida = []) {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    const stat = statSync(ruta);
    if (stat.isDirectory()) htmls(ruta, salida);
    else if (ruta.endsWith('.html')) salida.push(ruta);
  }
  return salida;
}

function capturas(html, regex) {
  return [...html.matchAll(regex)].map(m => (m[1] ?? '').trim());
}

function rutaArchivo(archivo) {
  const rel = relative(DIST, archivo).split(sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'/index.html'.length)}`;
  return `/${rel}`;
}

const errores = [];
const titulos = new Map();
const canonicals = new Map();
const descripciones = new Map();
let indexables = 0;
let legacyRedirects = 0;

function registrar(mapa, valor, archivo, etiqueta) {
  if (!valor) return;
  if (!mapa.has(valor)) mapa.set(valor, []);
  mapa.get(valor).push(archivo);
  if (mapa.get(valor).length === 2) errores.push(`${etiqueta} duplicado: ${valor}`);
}

for (const archivo of htmls(DIST)) {
  const rel = relative(DIST, archivo).split(sep).join('/');
  const ruta = rutaArchivo(archivo);
  const html = readFileSync(archivo, 'utf8');
  const robots = capturas(html, /<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/gi);
  const noindex = robots.some(v => /\bnoindex\b/i.test(v));
  const canonicalA = capturas(html, /<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi);
  const canonicalB = capturas(html, /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["']canonical["'][^>]*>/gi);
  const canonical = [...canonicalA, ...canonicalB];

  if (rel === '404.html') {
    if (!noindex) errores.push('404.html debe conservar meta robots noindex');
    continue;
  }

  // Variantes internas servidas solo por rewrite para ?embed=1. No son rutas canónicas.
  if (ruta.startsWith('/_embed/')) continue;

  if (redirects.has(ruta)) {
    legacyRedirects += 1;
    continue;
  }

  indexables += 1;
  const titles = capturas(html, /<title>([\s\S]*?)<\/title>/gi);
  const h1s = [...html.matchAll(/<h1\b[^>]*>/gi)];
  const descriptions = capturas(html, /<meta\b[^>]*\bname=["']description["'][^>]*\bcontent=["']([^"']*)["'][^>]*>/gi);
  const ogTitles = capturas(html, /<meta\b[^>]*\bproperty=["']og:title["'][^>]*\bcontent=["']([^"']*)["'][^>]*>/gi);
  const ogDescriptions = capturas(html, /<meta\b[^>]*\bproperty=["']og:description["'][^>]*\bcontent=["']([^"']*)["'][^>]*>/gi);
  const ogUrls = capturas(html, /<meta\b[^>]*\bproperty=["']og:url["'][^>]*\bcontent=["']([^"']*)["'][^>]*>/gi);
  const twitterCards = capturas(html, /<meta\b[^>]*\bname=["']twitter:card["'][^>]*\bcontent=["']([^"']*)["'][^>]*>/gi);
  const jsonLd = capturas(html, /<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);

  if (noindex) errores.push(`${rel}: página indexable inesperadamente noindex`);
  if (titles.length !== 1 || !titles[0]) errores.push(`${rel}: debe tener exactamente 1 title no vacío`);
  if (h1s.length !== 1) errores.push(`${rel}: debe tener exactamente 1 H1`);
  if (descriptions.length !== 1 || !descriptions[0]) errores.push(`${rel}: debe tener exactamente 1 meta description no vacía`);
  if (canonical.length !== 1 || !canonical[0]) errores.push(`${rel}: debe tener exactamente 1 canonical`);
  if (ogTitles.length !== 1 || !ogTitles[0]) errores.push(`${rel}: debe tener exactamente 1 og:title no vacío`);
  if (ogDescriptions.length !== 1 || !ogDescriptions[0]) errores.push(`${rel}: debe tener exactamente 1 og:description no vacía`);
  if (ogUrls.length !== 1 || !ogUrls[0]) errores.push(`${rel}: debe tener exactamente 1 og:url no vacío`);
  if (twitterCards.length !== 1 || !twitterCards[0]) errores.push(`${rel}: debe tener exactamente 1 twitter:card no vacío`);
  if (!jsonLd.length) errores.push(`${rel}: falta JSON-LD`);
  for (const bloque of jsonLd) {
    try { JSON.parse(bloque); } catch (error) { errores.push(`${rel}: JSON-LD inválido (${error.message})`); }
  }

  if (titles.length === 1) registrar(titulos, titles[0], rel, 'title');
  if (descriptions.length === 1) registrar(descripciones, descriptions[0], rel, 'description');
  if (canonical.length === 1) {
    registrar(canonicals, canonical[0], rel, 'canonical');
    if (ogUrls.length === 1 && ogUrls[0] !== canonical[0]) errores.push(`${rel}: og:url no coincide con canonical`);
    let url;
    try { url = new URL(canonical[0]); } catch { errores.push(`${rel}: canonical inválido ${canonical[0]}`); }
    if (url) {
      if (url.origin !== ORIGEN) errores.push(`${rel}: canonical fuera del origen oficial ${canonical[0]}`);
      if (sinSlashFinal && url.pathname !== '/' && url.pathname.endsWith('/')) {
        errores.push(`${rel}: canonical provoca redirect por slash final ${canonical[0]}`);
      }
      const actual = url.pathname.replace(/\/$/, '') || '/';
      const esperado = ruta.replace(/\/$/, '') || '/';
      if (actual !== esperado) errores.push(`${rel}: canonical apunta a ${actual}, esperaba ${esperado}`);
    }
  }
}

const sitemapXml = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
const sitemapLocs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
const sitemapUnicos = new Set(sitemapLocs);
if (sitemapUnicos.size !== sitemapLocs.length) errores.push('sitemap.xml contiene URLs duplicadas');

for (const loc of sitemapLocs) {
  let url;
  try { url = new URL(loc); } catch { errores.push(`sitemap URL inválida: ${loc}`); continue; }
  if (url.origin !== ORIGEN) errores.push(`sitemap fuera del origen oficial: ${loc}`);
  const ruta = url.pathname.replace(/\/$/, '') || '/';
  if (redirects.has(ruta)) errores.push(`sitemap contiene fuente redirigida: ${loc}`);
  if (sinSlashFinal && url.pathname !== '/' && url.pathname.endsWith('/')) {
    errores.push(`sitemap provoca redirect por slash final: ${loc}`);
  }
}

for (const canonical of canonicals.keys()) {
  if (!sitemapUnicos.has(canonical)) errores.push(`canonical indexable ausente del sitemap: ${canonical}`);
}
for (const loc of sitemapUnicos) {
  if (!canonicals.has(loc)) errores.push(`URL del sitemap sin canonical indexable equivalente: ${loc}`);
}

if (errores.length) {
  console.error(`SEO estático: ${errores.length} error(es)`);
  for (const error of errores) console.error(`  ${error}`);
  process.exit(1);
}

console.log(`SEO estático: ${indexables} páginas indexables, ${legacyRedirects} HTML legacy redirigidos, ${sitemapUnicos.size} URLs canónicas en sitemap; 404 conserva noindex`);
