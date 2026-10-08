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
