import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = readFileSync('public/orbita-v3-base.js', 'utf8');
const js = readFileSync('public/orbita-v3-visuals.js', 'utf8');
const css = readFileSync('public/orbita-v3-visuals.css', 'utf8');
const audit = readFileSync('public/orbita-v3-audit.css', 'utf8');

test('las visualizaciones cargan después del guard de embed y fuera de Pensión', () => {
  const guard = base.indexOf('if (legacyEmbed)');
  const earlyReturn = base.indexOf('return;', guard);
  assert.ok(base.indexOf('/orbita-v3-visuals.css') > earlyReturn);
  assert.ok(base.indexOf('/orbita-v3-visuals.js') > earlyReturn);
  assert.match(base, /if \(protectedPension\) return/);
});

test('Carreras usa cifras monetarias ya visibles en el DOM', () => {
  assert.match(js, /collectMoneyRows/);
  assert.match(js, /text\.match\(\/\\\$\\s\*\(\[\\d,\.\]\+\)/);
  assert.match(js, /Las barras usan únicamente cifras que ya aparecen en el contenido/);
  assert.doesNotMatch(js, /Math\.random/);
});

test('Estados usa enlaces existentes y no asigna puntajes', () => {
  assert.match(js, /querySelectorAll\('a\[href\^="\/estados\/"\]'\)/);
  assert.match(js, /México en mosaico/);
  assert.match(js, /no colorea estados como mejores o peores/);
  assert.doesNotMatch(js, /score|ranking\s*=|puntaje/i);
});

test('Finanzas usa una ruta conceptual con degradado y no inventa tasas', () => {
  assert.match(js, /no inventa tasas ni rendimientos/);
  assert.match(js, /Visual conceptual, sin eje monetario/);
  assert.match(js, /orb-projection-stage/);
  assert.match(audit, /\.orb-projection-stage[\s\S]*linear-gradient/);
  assert.match(js, /CETES/);
  assert.match(js, /Ahorro/);
  assert.match(js, /Casa/);
  assert.doesNotMatch(js, /0\.0\d+|rendimiento\s*[:=]\s*\d/i);
});

test('Economía presenta porcentajes independientes sin fingir tendencia', () => {
  assert.match(js, /collectPercentages/);
  assert.match(js, /matchAll\(\/\(-\?\\d\{1,3\}/);
  assert.match(js, /La gráfica solo reutiliza porcentajes presentes en esta página/);
  assert.match(js, /orb-economy-bars/);
  assert.match(js, /Cada barra es un dato independiente/);
  assert.doesNotMatch(js, /createElementNS\(|setAttribute\('points'/);
  assert.match(audit, /\.orb-economy-bar-fill[\s\S]*linear-gradient/);
});

test('Aprende tiene camino de cuatro pasos', () => {
  for (const word of ['Lee', 'Calcula', 'Compara', 'Decide']) assert.ok(js.includes(`'${word}'`));
  assert.match(js, /orb-learn-path/);
});

test('gráficas respetan reducción de movimiento y no usan controles flotantes', () => {
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(css, /position\s*:\s*fixed/i);
  assert.doesNotMatch(audit, /position\s*:\s*fixed/i);
  assert.doesNotMatch(js, /carousel|swiper|slick/i);
});

test('la capa visual no contiene funciones de cálculo de MiLana', () => {
  assert.doesNotMatch(js, /calcISR|calcularFiniquito|calcularLiquidacion|calcularBrutoNeto|ISR_MENSUAL_2026|RESICO_TASAS/);
});
