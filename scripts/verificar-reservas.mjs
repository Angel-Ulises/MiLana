// Verifica en dist/ que las reservas de altura de los visuales de sección (prepaint.css) no dejen huecos:
// la altura natural del visual renderizado debe ser >= 90% de la reserva, a 390 y 1280 px.
//   node scripts/verificar-reservas.mjs [--verbose] [ruta ...]
import { abrirChrome, cargarPagina, encontrarChrome, rutasDelSitemap, servirDist, sleep } from './lib/navegador.mjs';

const VIEWPORTS = [390, 1280];
const CONCURRENCY = 4;
const MIN_RATIO = 0.9;
const verbose = process.argv.includes('--verbose');
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
for (const r of resultados.sort((a, b) => a.route.localeCompare(b.route) || a.width - b.width)) {
  if (r.error) { fallos.push(`${r.route} @${r.width}: ${r.error}`); continue; }
  if (!r.medida) { if (verbose) console.log(`${r.route} @${r.width} sin visual`); continue; }
  const { reserved, natural } = r.medida;
  const ok = natural >= reserved * MIN_RATIO;
  if (verbose) console.log(`${ok ? 'ok ' : 'HUECO'} ${r.route} @${r.width} visual ${natural}px / reserva ${reserved}px`);
  if (!ok) fallos.push(`${r.route} @${r.width}: visual ${natural}px < ${Math.round(MIN_RATIO * 100)}% de la reserva ${reserved}px`);
}
const conVisual = resultados.filter((r) => r.medida).length;
console.log(`reservas: ${total} páginas/anchos, ${conVisual} con visual, ${fallos.length} huecos.`);
if (!conVisual) { console.error('reservas: ningún visual encontrado (¿cambió el selector .orb-section-visual?).'); process.exit(1); }
if (fallos.length) { for (const f of fallos) console.error(`  ${f}`); process.exit(1); }
