import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync('src/App.jsx','utf8');
const routes = readFileSync('src/homeRoutes.jsx','utf8');
const fallback = readFileSync('public/orbita-v3-experience.js','utf8');
const css = readFileSync('src/home-flow.css','utf8');

test('mejora 2026-11: Inicio tiene un solo objetivo, sin el bloque «Cómo funciona»', () => {
  assert.doesNotMatch(app, /ml-how-it-works/);
  assert.match(app, /Toca tu caso y lo calculas en un minuto/);
});

test('la tarjeta de regreso no introduce rutas arbitrarias o pasos falsos', () => {
  assert.match(routes, /RUTAS\.find\(/);
  assert.match(routes, /DURACION_RUTA/);
  assert.match(routes, /if \(!ruta\) return null/);
  assert.match(routes, /Descartar/);
  assert.doesNotMatch(routes, /paso 1 de 4/);
  assert.match(fallback, /options\.find\(/);
  assert.match(fallback, /if \(!route\) return null/);
  assert.doesNotMatch(fallback, /paso 1 de 4/);
  assert.match(fallback, /if \(saved\) hero\.insertAdjacentElement\('afterend', saved\)/);
});

test('mejora 2026-11: Inicio lista las 10 calculadoras y ahorro, sin alterar cálculos', () => {
  for (const route of [
    '/calculadoras/aguinaldo','/calculadoras/liquidacion','/calculadoras/finiquito','/calculadoras/bruto-a-neto',
    '/calculadoras/isr','/calculadoras/vacaciones','/calculadoras/ptu','/calculadoras/resico',
    '/calculadoras/infonavit','/calculadoras/pension-imss','/finanzas/ahorro'
  ]) {
    assert.ok(routes.includes(route), route);
    assert.ok(fallback.includes(route), route);
  }
  assert.doesNotMatch(routes, /FormData|\.value|fetch\(/);
});

test('el Inicio resume las secciones en seis puertas sin repetir su contenido', () => {
  const home = readFileSync('src/financeExpansion.jsx','utf8');
  const cssHome = readFileSync('src/home-expansion-compact.css','utf8');
  const main = readFileSync('src/main.jsx','utf8');
  for (const href of ['/calculadoras','/finanzas','/invertir','/carreras','/estados','/economia']) assert.ok(home.includes(`href: '${href}'`), href);
  assert.match(home,/\{TEMAS\.map\(/);
  assert.match(home,/href="\/finanzas#explorar"/);
  assert.doesNotMatch(home,/PREGUNTAS|EDITORIAL|images\.pexels\.com/);
  assert.match(cssHome,/\.ml-topics-grid/);
  assert.match(main,/home-expansion-compact\.css/);
  assert.match(cssHome,/focus-visible/);
});
