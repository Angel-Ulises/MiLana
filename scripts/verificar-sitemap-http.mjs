// Cada URL del sitemap debe responder 200, sin redirección, y su canonical
// tiene que ser exactamente esa URL. Pensado para `wrangler pages dev dist`.
const origen = process.argv[2];
if (!origen) {
  console.error('Uso: node scripts/verificar-sitemap-http.mjs http://127.0.0.1:8788');
  process.exit(1);
}
const base = new URL(origen);
if (!['127.0.0.1', 'localhost'].includes(base.hostname) || base.username || base.password || base.search || base.hash || base.pathname !== '/') {
  console.error('Usa el servidor local de wrangler pages dev, sin usuario, ruta ni query.');
  process.exit(1);
}

function canonicalDe(html) {
  const etiquetas = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]).filter((tag) => /\brel=["']canonical["']/i.test(tag));
  if (etiquetas.length !== 1) return null;
  return etiquetas[0].match(/\bhref=["']([^"']+)["']/i)?.[1] ?? null;
}

async function traer(ruta) {
  const respuesta = await fetch(new URL(ruta, base), { redirect: 'manual', signal: AbortSignal.timeout(20000) });
  const cuerpo = await respuesta.text();
  return { status: respuesta.status, location: respuesta.headers.get('location'), cuerpo };
}

const sitemap = await traer('/sitemap.xml');
if (sitemap.status !== 200) {
  console.error(`sitemap.xml respondió ${sitemap.status}`);
  process.exit(1);
}
const locs = [...sitemap.cuerpo.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1].trim());
if (!locs.length || new Set(locs).size !== locs.length) {
  console.error('sitemap.xml no tiene URLs únicas');
  process.exit(1);
}

const errores = [];
let cursor = 0;
async function trabajador() {
  while (cursor < locs.length) {
    const loc = locs[cursor++];
    let url;
    try { url = new URL(loc); } catch { errores.push(`${loc}: URL inválida`); continue; }
    const respuesta = await traer(url.pathname + url.search);
    if (respuesta.status !== 200) {
      errores.push(`${loc}: HTTP ${respuesta.status}${respuesta.location ? ` → ${respuesta.location}` : ''}`);
      continue;
    }
    if (respuesta.location) errores.push(`${loc}: 200 con Location ${respuesta.location}`);
    const canonical = canonicalDe(respuesta.cuerpo);
    if (canonical !== loc) errores.push(`${loc}: canonical ${canonical ?? '(ausente)'}`);
  }
}
await Promise.all(Array.from({ length: Math.min(8, locs.length) }, trabajador));

if (errores.length) {
  console.error(`Sitemap HTTP: ${errores.length} error(es) de ${locs.length} URLs`);
  for (const error of errores) console.error(`  ${error}`);
  process.exit(1);
}
console.log(`Sitemap HTTP: ${locs.length} URLs responden 200 sin redirección y su canonical coincide.`);
