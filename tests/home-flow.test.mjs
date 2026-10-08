import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync('src/App.jsx','utf8');
const routes = readFileSync('src/homeRoutes.jsx','utf8');
const fallback = readFileSync('public/orbita-v3-experience.js','utf8');
const css = readFileSync('src/home-flow.css','utf8');

test('la explicación de MiLana queda disponible sin repetir un bloque alto', () => {
  assert.match(app, /<details className="ml-how-it-works">/);
  assert.match(app, /<summary>/);
  assert.match(app, /Cómo funciona MiLana/);
  assert.doesNotMatch(app, /<details className="ml-how-it-works" open/);
  for (const palabra of ['Entender','Comparar','Decidir']) assert.ok(app.includes(palabra));
  assert.match(css, /\.path-section/);
  assert.match(css, /padding-block:18px!important/);
  assert.match(css, /prefers-reduced-motion/);
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

test('conserva el conjunto de seis rutas reales y no altera cálculos', () => {
  for (const route of [
    '/calculadoras/liquidacion','/calculadoras/finiquito','/calculadoras/aguinaldo',
    '/finanzas/ahorro','/carreras','/estados/comparar'
  ]) {
    assert.ok(routes.includes(route), route);
    assert.ok(fallback.includes(route), route);
  }
  assert.doesNotMatch(routes, /FormData|\.value|fetch\(/);
});

test('el Inicio mantiene las seis preguntas y áreas, pero reduce el contenido inicial', () => {
  const home = readFileSync('src/financeExpansion.jsx','utf8');
  const cssHome = readFileSync('src/home-expansion-compact.css','utf8');
  const main = readFileSync('src/main.jsx','utf8');
  assert.match(home,/preguntas\.slice\(0, 3\)/);
  assert.match(home,/preguntas\.slice\(3\)/);
  assert.match(home,/<details className="ml-more-questions">/);
  assert.match(home,/\{AREAS\.map\(/);
  assert.match(home,/\{EDITORIAL\.map\(/);
  assert.match(cssHome,/#ml-finance-expansion-root \.ml-money-card/);
  assert.match(cssHome,/\.ml-money-card h3\{grid-column:2/);
  assert.match(cssHome,/\.ml-discovery-photo\{display:none\}/);
  assert.match(main,/home-expansion-compact\.css/);
  assert.match(cssHome,/focus-visible/);
});
