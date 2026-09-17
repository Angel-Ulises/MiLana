import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
const read = p => readFileSync(p, 'utf8');

const guias = [
  'finiquito-vs-liquidacion',
  'leer-recibo-nomina',
  'aguinaldo-bruto-neto',
  'vacaciones-prima-vacacional',
  'resico-ingresos-cobrados',
  'pension-imss-ley-97'
];

const rutasSitemap = [
  '/',
  '/calculadoras/finiquito',
  '/calculadoras/liquidacion',
  '/calculadoras/aguinaldo',
  '/calculadoras/isr',
  '/calculadoras/resico',
  '/calculadoras/ptu',
  '/calculadoras/bruto-a-neto',
  '/calculadoras/vacaciones',
  '/calculadoras/infonavit',
  '/calculadoras/pension-imss',
  '/situaciones/entender-mi-sueldo',
  '/situaciones/revisar-mis-prestaciones',
  '/situaciones/terminar-relacion-laboral',
  '/aprende',
  '/aprende/finiquito-vs-liquidacion',
  '/aprende/leer-recibo-nomina',
  '/aprende/aguinaldo-bruto-neto',
  '/aprende/vacaciones-prima-vacacional',
  '/aprende/resico-ingresos-cobrados',
  '/aprende/pension-imss-ley-97',
  '/widgets',
  '/sobre',
  '/metodo',
  '/contacto',
  '/privacidad',
  '/financiamiento'
];

test('se publican seis guías editoriales', () => {
  for (const slug of guias) assert.ok(existsSync(`public/aprende/${slug}/index.html`), slug);
});

test('la portada usa metadata visible y no FAQ invisible', () => {
  const html = read('index.html');
  assert.ok(!html.includes('FAQPage'));
  assert.ok(!html.includes('astra-content-2026.js'));
  assert.ok(html.includes('WebSite'));
  assert.ok(html.includes('final-2026.css'));
});

test('hay canal de correcciones de MiLana sin exponer el repositorio personal', () => {
  const html = read('public/contacto/index.html');
  assert.ok(html.includes('mailto:contacto.milanaaqui@gmail.com'));
  assert.ok(!html.includes('github.com/Angel-Ulises'));
  assert.ok(!html.includes('/issues/new'));
  assert.match(html, /No envíes RFC/);
});

test('la nueva fuente del hero está documentada', () => {
  const fuentes = read('assets-master/FUENTES.json');
  assert.ok(fuentes.includes('7129713'));
  assert.ok(fuentes.includes('Michael Burrows'));
});

test('el hero y las anclas usan la corrección visual nueva', () => {
  const mejoras = read('src/siteEnhancements.jsx');
  const overrides = read('src/site-overrides.css');
  assert.ok(mejoras.includes("HERO_PEXELS_ID = '7129713'"));
  assert.ok(mejoras.includes('contacto.milanaaqui@gmail.com'));
  assert.match(overrides, /scroll-padding-top:\s*0\s*!important/);
  assert.match(overrides, /scroll-margin-top:\s*12px/);
});

test('el build genera sitemap final sin lastmod artificial', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.match(pkg.scripts.build, /generar-sitemap-final/);
  const script = read('scripts/generar-sitemap-final.mjs');
  assert.ok(!script.includes('<lastmod>'));
  assert.ok(script.includes('/aprende/finiquito-vs-liquidacion'));
  assert.ok(script.includes('/widgets'));
});

test('el sitemap fuente contiene exactamente las 27 rutas públicas esperadas', () => {
  const sitemap = read('public/sitemap.xml');
  assert.ok(!sitemap.includes('<lastmod>'));
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.equal(locs.length, rutasSitemap.length);
  assert.equal(new Set(locs).size, rutasSitemap.length);
  for (const ruta of rutasSitemap) {
    const esperada = `https://www.milanaaqui.mx${ruta === '/' ? '/' : ruta}`;
    assert.ok(locs.includes(esperada), `falta ${esperada}`);
  }
});

test('robots publica el sitemap canónico', () => {
  const robots = read('public/robots.txt');
  assert.match(robots, /Sitemap: https:\/\/www\.milanaaqui\.mx\/sitemap\.xml/);
});

test('el bucle de compartir calculadoras es sintácticamente válido y no serializa resultados', () => {
  const js = read('public/final-2026.js');
  assert.doesNotThrow(() => new Function(js));
  assert.ok(js.includes('data-milana-share') || js.includes('milanaShare'));
  assert.ok(js.includes('navigator.share'));
  assert.ok(js.includes('navigator.clipboard'));
  assert.ok(js.includes("document.execCommand('copy')"));
  assert.ok(js.includes("window.prompt('Copia este enlace:'"));
  assert.ok(js.includes('Tus datos y resultados no se incluyen'));
  assert.ok(js.includes('location.origin+location.pathname'));
  assert.ok(js.includes('share_calculator'));
  assert.ok(!js.includes('location.search'));
  assert.ok(!js.includes('resultado='));
  assert.ok(!js.includes('salario='));
});

test('la medición común cubre páginas estáticas sin capturar valores financieros', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.match(pkg.scripts.build, /inyectar-analytics-estaticos/);
  const js = read('public/milana-analytics.js');
  assert.doesNotThrow(() => new Function(js));
  assert.ok(js.includes('calculator_view'));
  assert.ok(js.includes('calculator_submit'));
  assert.ok(js.includes('internal_to_calculator'));
  assert.ok(!js.includes('FormData'));
  assert.ok(!js.includes('localStorage'));
  assert.ok(!js.includes('sessionStorage'));
  assert.ok(!js.includes('.value'));
  const inyector = read('scripts/inyectar-analytics-estaticos.mjs');
  assert.ok(inyector.includes('/milana-analytics.js'));
});

test('la guía de finiquito responde intención 2026 y enlaza ambas calculadoras', () => {
  const html = read('public/aprende/finiquito-vs-liquidacion/index.html');
  assert.match(html, /Finiquito o liquidación 2026/);
  assert.ok(html.includes('/calculadoras/finiquito'));
  assert.ok(html.includes('/calculadoras/liquidacion'));
  assert.ok(html.includes('/situaciones/terminar-relacion-laboral'));
});

test('no quedan mensajes públicos de canal o importes pendientes', () => {
  const files = ['public/contacto/index.html','public/privacidad/index.html','public/sobre/index.html'];
  for (const file of files) {
    const text = read(file);
    assert.ok(!text.includes('Canal público pendiente'));
    assert.ok(!text.includes('Importes en revisión'));
  }
});
