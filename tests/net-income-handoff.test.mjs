import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ingresoValido, guardarIngresoTemporal, consumirIngresoTemporal } from '../src/lib/netIncomeHandoff.js';

test('traslado de importe solo por acción explícita, solo a las dos rutas internas', () => {
  const original = globalThis.sessionStorage;
  const store = new Map();
  globalThis.sessionStorage = {
    setItem: (key, value) => store.set(key, value),
    getItem: key => store.get(key) || null,
    removeItem: key => store.delete(key),
  };
  try {
    assert.equal(guardarIngresoTemporal(24200.259, '/finanzas/presupuesto', 1000), true);
    assert.equal(store.size, 1);
    const serialized = [...store.values()][0];
    assert.doesNotMatch(serialized, /password|rfc|periodo|salarioBruto|gravable|sbcDiario/i);
    assert.deepEqual(consumirIngresoTemporal('/finanzas/presupuesto', 1100), { importe: '24200.26', fuente: 'bruto-neto' });
    assert.equal(store.size, 0, 'el importe se elimina después de usarlo');
    assert.equal(consumirIngresoTemporal('/finanzas/presupuesto', 1100), null);
    assert.equal(guardarIngresoTemporal(25000, '/finanzas/mi-situacion', 2000), true);
    assert.equal(consumirIngresoTemporal('/finanzas/presupuesto', 2100), null, 'visitar otra página no consume el destino correcto');
    assert.deepEqual(consumirIngresoTemporal('/finanzas/mi-situacion', 2100), { importe: '25000', fuente: 'bruto-neto' });
    for (const destination of ['/calculadoras/isr','//fraude.com','https://ejemplo.mx','/finanzas/presupuesto?importe=25000']) {
      assert.equal(guardarIngresoTemporal(22000, destination), false);
    }
  } finally {
    if (original === undefined) delete globalThis.sessionStorage;
    else globalThis.sessionStorage = original;
  }
});

test('rechaza cifras, datos manipulados o caducados sin inventar ingresos', () => {
  const original = globalThis.sessionStorage;
  const store = new Map();
  globalThis.sessionStorage = {
    setItem: (key, value) => store.set(key, value),
    getItem: key => store.get(key) || null,
    removeItem: key => store.delete(key),
  };
  try {
    for (const amount of ['', null, undefined, -100, 0, Number.NaN, Number.POSITIVE_INFINITY, 100_000_000.01]) {
      assert.equal(ingresoValido(amount), null);
      assert.equal(guardarIngresoTemporal(amount, '/finanzas/presupuesto'), false);
    }
    assert.equal(guardarIngresoTemporal(22000, '/finanzas/presupuesto', 1000), true);
    assert.equal(consumirIngresoTemporal('/finanzas/presupuesto', 1000 + 15*60*1000 + 1), null);
    assert.equal(store.size, 0);
    assert.equal(guardarIngresoTemporal(15000, '/finanzas/presupuesto', 2000), true);
    assert.equal(consumirIngresoTemporal('/finanzas/presupuesto', 1999), null);
    assert.equal(store.size, 0);
    store.set('ml-net-income-handoff-v1', JSON.stringify({ importe: 24000, destino: '/finanzas/presupuesto', fuente: 'desconocida', creado: 3000 }));
    assert.equal(consumirIngresoTemporal('/finanzas/presupuesto', 3010), null);
    assert.equal(store.size, 0);
  } finally {
    if (original === undefined) delete globalThis.sessionStorage;
    else globalThis.sessionStorage = original;
  }
});

test('Bruto Neto conserva motor y destinos reciben solo el importe explícito', () => {
  const app = readFileSync('src/App.jsx','utf8');
  const finance = readFileSync('src/financePages.jsx','utf8');
  const advisor = readFileSync('src/advisorPage.jsx','utf8');
  const ui = readFileSync('src/netIncomeTransferActions.jsx','utf8');
  const notice = readFileSync('src/incomeTransferNotice.jsx','utf8');
  const css = readFileSync('src/net-income-handoff.css','utf8');
  const main = readFileSync('src/main.jsx','utf8');
  assert.match(app, /calcularBrutoNeto2026\(\{/);
  assert.match(app, /<NetIncomeTransferActions neto=\{resultado\.netoDespuesISRSeguridadSocial\} \/>/);
  assert.match(finance, /consumirIngresoTemporal\('\/finanzas\/presupuesto'\)/);
  assert.match(advisor, /consumirIngresoTemporal\('\/finanzas\/mi-situacion'\)/);
  assert.match(ui, /guardarIngresoTemporal\(importe, href\)/);
  assert.match(ui, /window\.location\.assign\(href\)/);
  assert.match(notice, /Quitar dato/);
  assert.match(css, /focus-visible/);
  assert.match(css, /max-width:540px/);
  assert.match(main, /net-income-handoff\.css/);
  assert.doesNotMatch(ui, /localStorage|FormData|URLSearchParams|fetch\(/);
});
