// Verifica en dist/ las reservas de altura de los visuales de sección, definidas por ruta en
// scripts/reservas-alturas.json (aplicar-orbita-base las escribe como --orb-reserve-m/-d en <html>):
//   - la reserva no puede ser menor que el visual renderizado (empujaría el contenido: CLS), y
//   - el visual debe ocupar >= 90% de la reserva (sin huecos en blanco), a 390 y 1280 px.
//   node scripts/verificar-reservas.mjs [--verbose] [--update] [ruta ...]
//   --update recalcula scripts/reservas-alturas.json (reserva = altura natural + 4%) tras cambiar un visual.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { abrirChrome, cargarPagina, encontrarChrome, rutasDelSitemap, servirDist, sleep } from './lib/navegador.mjs';

const VIEWPORTS = [390, 1280];
const CONCURRENCY = 4;
const MIN_RATIO = 0.9;
const verbose = process.argv.includes('--verbose');
const update = process.argv.includes('--update');
const JSON_PATH = new URL('./reservas-alturas.json', import.meta.url);
const table = existsSync(JSON_PATH) ? JSON.parse(readFileSync(JSON_PATH, 'utf8')) : {};
const MARGEN = 1.04;
const TOLERANCIA = 1.03; // el visual puede superar a la reserva hasta 3% (fuentes distintas entre equipos)
const onlyRoutes = process.argv.slice(2).filter((arg) => arg.startsWith('/'));

const chrome = encontrarChrome();
if (!chrome) { console.warn('reservas: Chrome/Chromium no encontrado; verificación omitida (define MILANA_CHROME).'); process.exit(0); }

const medir = () => {
  const visual = document.querySelector('.orb-section-visual');
  if (!visual) return null;
  const reserved = parseFloat(getComputedStyle(visual).minHeight) || 0;
  const previous = visual.style.minHeight;
  visual.style.minHeight = '0px';
  const natural = visual.getBoundingClientRect().height;
  visual.style.minHeight = previous;
  return { reserved: Math.round(reserved), natural: Math.round(natural) };
};

const servidor = await servirDist();
const navegador = await abrirChrome(chrome);
const SECCIONES = /^\/(carreras|estados|economia|finanzas|aprende)/;
const rutas = (onlyRoutes.length ? onlyRoutes : rutasDelSitemap()).filter((route) => SECCIONES.test(route));
const jobs = rutas.flatMap((route) => VIEWPORTS.map((width) => ({ route, width })));
const total = jobs.length;
const resultados = [];
async function worker() {
  const pestana = await navegador.nuevaPestana();
  for (let job = jobs.shift(); job; job = jobs.shift()) {
    try {
      await cargarPagina(pestana, servidor.base, job.route, job.width);
      for (let i = 0; i < 30 && !(await pestana.evaluar(`!!document.querySelector('.orb-section-visual')`)); i++) await sleep(100);
      resultados.push({ ...job, medida: await pestana.evaluar(`(${medir.toString()})()`) });
    } catch (error) { resultados.push({ ...job, error: String(error.message) }); }
  }
}
try { await Promise.all(Array.from({ length: CONCURRENCY }, worker)); }
finally { await navegador.cerrar(); servidor.close(); }

const fallos = [];
const nuevaTabla = {};
for (const r of resultados.sort((a, b) => a.route.localeCompare(b.route) || a.width - b.width)) {
  if (r.error) { fallos.push(`${r.route} @${r.width}: ${r.error}`); continue; }
  if (!r.medida) { if (verbose) console.log(`${r.route} @${r.width} sin visual`); continue; }
  const { reserved, natural } = r.medida;
  const key = r.width <= 760 ? 'm' : 'd';
  (nuevaTabla[r.route] ??= {})[key] = Math.ceil(natural * MARGEN);
  if (update) continue;
  const esperado = table[r.route]?.[key];
  const tag = `${r.route} @${r.width}`;
  if (esperado === undefined) { fallos.push(`${tag}: sin reserva en reservas-alturas.json (visual ${natural}px); ejecuta verificar-reservas --update`); continue; }
  const corta = natural > reserved * TOLERANCIA;
  const hueco = natural < reserved * 0.9;
  if (verbose) console.log(`${corta ? 'CORTA' : hueco ? 'HUECO' : 'ok   '} ${tag} visual ${natural}px / reserva ${reserved}px`);
  if (corta) fallos.push(`${tag}: reserva ${reserved}px menor que el visual (${natural}px): empuja el contenido`);
  if (hueco) fallos.push(`${tag}: visual ${natural}px < 90% de la reserva ${reserved}px: hueco en blanco`);
}
if (update) {
  const ordenada = Object.fromEntries(Object.entries(nuevaTabla).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(JSON_PATH, JSON.stringify(ordenada, null, 2) + '\n');
  console.log(`reservas: ${Object.keys(ordenada).length} rutas escritas en scripts/reservas-alturas.json`);
  process.exit(0);
}
const conVisual = resultados.filter((r) => r.medida).length;
console.log(`reservas: ${total} páginas/anchos, ${conVisual} con visual, ${fallos.length} problemas.`);
if (!conVisual) { console.error('reservas: ningún visual encontrado (¿cambió el selector .orb-section-visual?).'); process.exit(1); }
if (fallos.length) { for (const f of fallos) console.error(`  ${f}`); process.exit(1); }
