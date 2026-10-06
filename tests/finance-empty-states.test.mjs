import test from 'node:test';
import assert from 'node:assert/strict';
import { estadoPresupuesto, estadoReferenciaFondo } from '../src/lib/financeResultStates.js';
import { crearRadiografiaFinanciera } from '../src/lib/advisorCore.js';

const base = { ingreso: '10000', esenciales: '6000', variables: '1000', deuda: '0' };
test('presupuesto: vacío, parcial e inválido no afirman saldo ni déficit', () => {
  for (const missing of ['', ' ', null, undefined, '-1', 'Infinity', 'abc']) {
    for (const key of Object.keys(base)) {
      const state = estadoPresupuesto({ ...base, [key]: missing }, -1000);
      assert.equal(state.completo, false);
      assert.equal(state.tone, '');
      assert.match(state.titulo, /Completa/);
    }
  }
});
test('presupuesto: ceros explícitos y saldo equilibrado no son déficit', () => {
  for (const data of [Object.fromEntries(Object.keys(base).map(k => [k, '0'])), base]) {
    const state = estadoPresupuesto(data, 0);
    assert.equal(state.completo, true);
    assert.match(state.titulo, /equilibrados/);
    assert.equal(state.tone, '');
  }
});
test('presupuesto: cero ingreso con gasto es déficit; saldo positivo conserva siguiente paso', () => {
  assert.match(estadoPresupuesto({ ...base, ingreso: '0' }, -7000).titulo, /superan/);
  assert.equal(estadoPresupuesto(base, 3000).tone, 'positive');
});
const fondo = (data) => estadoReferenciaFondo(crearRadiografiaFinanciera(data));
test('asesor: no confunde falta de gastos o fondo con suficiencia', () => {
  assert.equal(fondo({}).mostrarReferencia, false);
  assert.match(fondo({ gastosEsenciales: 0, fondoActual: 0 }).nota, /no hay una referencia útil/);
  assert.match(fondo({ gastosEsenciales: 1000 }).nota, /Captura tu fondo actual/);
  assert.match(fondo({ gastosEsenciales: 1000, fondoActual: 0 }).nota, /Completa ingreso/);
});
test('asesor: conserva suficiencia real, plazo con datos completos y falta de flujo', () => {
  assert.match(fondo({ gastosEsenciales: 1000, fondoActual: 3000 }).nota, /ya alcanza/);
  const data = { ingresoNeto: 2000, gastosEsenciales: 1000, gastosVariables: 0, pagosDeuda: 0, fondoActual: 0 };
  assert.match(fondo(data).nota, /3 meses/);
  assert.match(fondo({ ...data, ingresoNeto: 0 }).nota, /flujo positivo/);
});
