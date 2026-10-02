import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyProductShell, productShellMarkup } from '../scripts/aplicar-product-shell.mjs';

const css = readFileSync(new URL('../public/product-shell.css', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('la fachada conserva la marca y objetivos táctiles accesibles', () => {
  assert.match(css, /--ml-product-blue:\s*#2D6CAA/i);
  assert.match(css, /min-height:\s*44px/);
  assert.doesNotMatch(css, /!important/);
  assert.doesNotMatch(css, /opacity:\s*0\b/);
});

test('la fachada deja Mi situación visible y ofrece navegación completa', () => {
  const html = productShellMarkup('/finanzas');
  for (const label of ['Calculadoras', 'Carreras', 'Estados', 'Finanzas', 'Economía', 'Aprende', 'Mi situación']) {
    assert.ok(html.includes(label), `falta ${label}`);
  }
  assert.match(html, /data-shell-section="finanzas" aria-current="page"/);
});

test('embed=1 se detecta antes del contenido y no duplica el header React', () => {
  assert.match(index, /data-milana-embed-boot/);
  assert.match(index, /data-milana-product-shell/);
  assert.match(index, /product-shell\.css/);
  assert.match(app, /className="site-header"/);
  assert.match(css, /\.ml-product-shell \+ #root > \.site-header\s*\{\s*display:\s*none/);
  assert.match(css, /html\.ml-embed \.ml-product-shell\s*\{\s*display:\s*none/);
});

test('el postproceso sustituye headers legacy sin alterar el contenido', () => {
  const sample = '<html><head></head><body><header class="top"><nav>viejo</nav></header><main><h1>Contenido</h1></main></body></html>';
  const out = applyProductShell(sample, '/aprende');
  assert.doesNotMatch(out, /class="top"/);
  assert.match(out, /data-milana-product-shell/);
  assert.match(out, /data-shell-section="aprende" aria-current="page"/);
  assert.match(out, /<h1>Contenido<\/h1>/);
});

test('el build aplica la fachada antes de validar URLs y SEO', () => {
  const build = pkg.scripts.build;
  const shell = build.indexOf('node scripts/aplicar-product-shell.mjs');
  const links = build.indexOf('node scripts/verificar-enlaces-internos.mjs');
  const seo = build.indexOf('node scripts/verificar-seo-estatico.mjs');
  assert.ok(shell > -1 && shell < links && shell < seo);
});
