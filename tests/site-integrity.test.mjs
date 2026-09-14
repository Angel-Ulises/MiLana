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

test('no quedan mensajes públicos de canal o importes pendientes', () => {
  const files = ['public/contacto/index.html','public/privacidad/index.html','public/sobre/index.html'];
  for (const file of files) {
    const text = read(file);
    assert.ok(!text.includes('Canal público pendiente'));
    assert.ok(!text.includes('Importes en revisión'));
  }
});
