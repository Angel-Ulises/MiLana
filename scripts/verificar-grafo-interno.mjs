import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DIST = resolve('dist');
const ORIGEN = 'https://www.milanaaqui.mx';
const xml = readFileSync(resolve(DIST, 'sitemap.xml'), 'utf8');
const rutas = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => new URL(m[1]).pathname.replace(/\/$/, '') || '/');
const universo = new Set(rutas);

const archivoDe = (ruta) => ruta === '/'
  ? resolve(DIST, 'index.html')
  : resolve(DIST, `.${ruta}`, 'index.html');

const grafo = new Map();
const entrada = new Map(rutas.map((ruta) => [ruta, 0]));

for (const ruta of rutas) {
  const archivo = archivoDe(ruta);
  if (!existsSync(archivo)) throw new Error(`Sitemap sin HTML físico: ${ruta}`);
  const html = readFileSync(archivo, 'utf8');
  const salidas = new Set();
  for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    const href = match[1];
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    let url;
    try { url = new URL(href, `${ORIGEN}${ruta}`); } catch { continue; }
    if (url.origin !== ORIGEN) continue;
    const destino = url.pathname.replace(/\/$/, '') || '/';
    if (destino !== ruta && universo.has(destino)) salidas.add(destino);
  }
  grafo.set(ruta, salidas);
  for (const destino of salidas) entrada.set(destino, (entrada.get(destino) ?? 0) + 1);
}

const visitadas = new Set(['/']);
const cola = ['/'];
for (let i = 0; i < cola.length; i += 1) {
  for (const destino of grafo.get(cola[i]) ?? []) {
    if (!visitadas.has(destino)) { visitadas.add(destino); cola.push(destino); }
  }
}

const huerfanas = rutas.filter((ruta) => ruta !== '/' && (entrada.get(ruta) ?? 0) === 0);
const inalcanzables = rutas.filter((ruta) => !visitadas.has(ruta));
if (huerfanas.length || inalcanzables.length) {
  if (huerfanas.length) console.error(`URLs sin enlaces internos entrantes: ${huerfanas.join(', ')}`);
  if (inalcanzables.length) console.error(`URLs no alcanzables desde Inicio: ${inalcanzables.join(', ')}`);
  process.exit(1);
}

const aristas = [...grafo.values()].reduce((total, destinos) => total + destinos.size, 0);
console.log(`grafo interno: ${rutas.length} URLs del sitemap alcanzables desde Inicio, 0 huérfanas, ${aristas} enlaces únicos entre páginas canónicas`);
