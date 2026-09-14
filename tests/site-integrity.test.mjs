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

test('hay canal público de correcciones sin pedir datos personales', () => {
  const html = read('public/contacto/index.html');
  assert.ok(html.includes('/issues/new'));
  assert.match(html, /No publiques RFC/);
});

test('la nueva fuente del hero está documentada', () => {
  const fuentes = read('assets-master/FUENTES.json');
  assert.ok(fuentes.includes('6963026'));
  assert.ok(fuentes.includes('Mikhail Nilov'));
});

test('el build genera sitemap final sin lastmod artificial', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.match(pkg.scripts.build, /generar-sitemap-final/);
  const script = read('scripts/generar-sitemap-final.mjs');
  assert.ok(!script.includes('<lastmod>'));
  assert.ok(script.includes('/aprende/finiquito-vs-liquidacion'));
});

test('el sitemap fuente contiene exactamente las 26 rutas públicas esperadas', () => {
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
  assert.ok(js.includes('share_calculator'));
  assert.ok(!js.includes('resultado='));
  assert.ok(!js.includes('salario='));
});

test('no quedan mensajes públicos de canal o importes pendientes', () => {
  const files = ['public/contacto/index.html','public/privacidad/index.html','public/sobre/index.html'];
  for (const file of files) {
    const text = read(file);
    assert.ok(!text.includes('Canal público pendiente'));
    assert.ok(!text.includes('Importes en revisión'));
  }
});
