import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const guiaRutas = {
  'finiquito-vs-liquidacion': ['/calculadoras/finiquito', '/calculadoras/liquidacion'],
  'leer-recibo-nomina': ['/calculadoras/bruto-a-neto', '/calculadoras/isr'],
  'aguinaldo-bruto-neto': ['/calculadoras/aguinaldo'],
  'vacaciones-prima-vacacional': ['/calculadoras/vacaciones'],
  'resico-ingresos-cobrados': ['/calculadoras/resico'],
  'pension-imss-ley-97': ['/calculadoras/pension-imss'],
};
test('Economía usa navegación global y un acceso directo a las señales', () => {
  const s = read('src/economyPages.jsx');
  assert.match(s, /import SiteHeader from/);
  assert.match(s, /<SiteHeader ctaHref=/);
  assert.match(s, /href="#senales"/);
  assert.match(s, /id="senales"/);
  assert.match(s, /aria-pressed=\{categoria === c\}/);
});
test('Economía conserva cifras oficiales sin recalcular al enlazar herramientas', () => {
  const s = read('src/economyPages.jsx');
  assert.match(s, /\{articulo\.datoPrincipal\}/);
  assert.match(s, /\{articulo\.datoEtiqueta\}/);
  assert.match(s, /className="economy-quick-actions"/);
  assert.match(s, /href=\{articulo\.herramienta\.href\}/);
  assert.match(s, /href=\{articulo\.herramientaSecundaria\.href\}/);
  assert.match(s, /no son equivalentes/);
});
test('Economía tiene estilos móvil con métricas antes de fotografía', () => {
  const s = read('src/economy-ux.css');
  assert.match(s, /max-width:640px/);
  assert.match(s, /\.economy-card\.featured \.economy-card-copy\{order:0/);
  assert.match(s, /\.economy-card\.featured figure\{order:1/);
  assert.match(s, /\.economy-article-hero figure\{display:none/);
  assert.match(read('src/main.jsx'), /import '\.\/economy-ux\.css'/);
});
test('Aprende muestra las guías antes del bloque metodológico', () => {
  const s = read('public/aprende/index.html');
  assert.ok(s.indexOf('id="guias"') < s.indexOf('class="learn-method"'));
  assert.match(s, /href="#guias"/);
  assert.equal((s.match(/<article class="card">/g) || []).length, 6);
  assert.equal((s.match(/<a class="card-content"/g) || []).length, 6);
  assert.match(s, /rel="canonical"/);
});
test('Todas las guías muestran destinos reales sin enlaces anidados', () => {
  const hub = read('public/aprende/index.html');
  for (const [slug, urls] of Object.entries(guiaRutas)) {
    const s = read('public/aprende/' + slug + '/index.html');
    assert.match(s, /<nav class="guide-direct"/, slug);
    assert.match(s, /<a href="\/aprende" aria-current="page">Aprende<\/a>/, slug);
    assert.match(hub, new RegExp('<a class="card-content" href="/aprende/' + slug + '">'), slug);
    for (const url of urls) {
      assert.ok(s.includes('href="' + url + '"'), slug + ': ' + url);
      assert.ok(hub.includes('href="' + url + '"'), 'Hub: ' + url);
    }
  }
  assert.equal((hub.match(/<nav class="card-tools"/g) || []).length, 6);
});
test('Los CTAs de Aprende son visibles en móvil y respetan movimiento reducido', () => {
  const s = read('public/static-2026.css');
  assert.match(s, /\.guide-direct a/);
  assert.match(s, /\.card-content:focus-visible/);
  assert.match(s, /max-width:580px/);
  assert.match(s, /prefers-reduced-motion:reduce/);
});