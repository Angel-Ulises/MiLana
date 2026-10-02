import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const componente = readFileSync('src/savedStateContext.jsx','utf8');
const main = readFileSync('src/main.jsx','utf8');
const advisor = readFileSync('src/advisorPage.jsx','utf8');
const preference = readFileSync('src/lib/statePreference.js','utf8');

test('contexto estatal solo aparece en rutas de Finanzas y usa preferencia opt-in', () => {
  assert.match(componente, /\/finanzas/);
  assert.match(componente, /leerEstadoGuardado/);
  assert.match(componente, /borrarEstadoGuardado/);
  assert.match(componente, /Contexto estatal guardado/);
  assert.match(main, /SavedStateContext/);
});

test('muestra las tres capas públicas sin inventar costo de vida', () => {
  assert.match(componente, /Ingreso profesional promedio/);
  assert.match(componente, /Desocupación/);
  assert.match(componente, /Informalidad/);
  assert.match(componente, /Mediana avalúo hipotecario/);
  assert.match(componente, /Apreciación vivienda 2026-II/);
  assert.doesNotMatch(componente, /costo de vida estimado|asequibilidad|precio\/ingreso/i);
});

test('estado guardado no prellena ni altera el formulario financiero', () => {
  assert.match(componente, /No cambia tus fórmulas, no rellena tus campos/i);
  assert.doesNotMatch(componente, /setForm|setIngreso|setGastos|advisorCore|crearRadiografiaFinanciera/);
  assert.doesNotMatch(componente, /querySelector\([^)]*(advisor-field|finance-field|input)/i);
  assert.doesNotMatch(advisor, /SavedStateContext/);
});

test('preferencia sigue siendo local, sin geolocalización ni analytics', () => {
  const codigo = `${componente}\n${preference}`;
  assert.match(preference, /localStorage/);
  assert.doesNotMatch(codigo, /navigator\.geolocation/);
  assert.doesNotMatch(codigo, /gtag\(|dataLayer|analytics|fetch\(|XMLHttpRequest/i);
});

test('el usuario conserva control para quitar el estado guardado', () => {
  assert.match(componente, /<button type="button" onClick=\{quitar\}>Quitar<\/button>/);
  assert.match(componente, /borrarEstadoGuardado\(\)/);
  assert.match(componente, /setSlug\(''\)/);
});
