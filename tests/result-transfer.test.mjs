import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { RUTAS_TRANSFERENCIA, NOTAS_ORIGEN, prepararContextoFinanciero, consumirContextoFinanciero } from '../src/lib/financeContextHandoff.js';

function memoria(fn) {
  const original = globalThis.sessionStorage; const datos = new Map();
  globalThis.sessionStorage = { getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => datos.set(k, v), removeItem: (k) => datos.delete(k) };
  try { fn(datos); } finally { if (original === undefined) delete globalThis.sessionStorage; else globalThis.sessionStorage = original; }
}

test('cada calculadora solo lleva su cifra al campo que significa lo mismo', () => {
  for (const origen of ['/calculadoras/aguinaldo', '/calculadoras/finiquito', '/calculadoras/liquidacion']) {
    assert.deepEqual(RUTAS_TRANSFERENCIA[origen], { '/finanzas/fondo-emergencia': ['fondoActual'], '/finanzas/ahorro': ['ahorroMetaActual'] });
    assert.match(NOTAS_ORIGEN[origen], /monto bruto/);
  }
  assert.deepEqual(RUTAS_TRANSFERENCIA['/calculadoras/infonavit'], { '/finanzas/presupuesto': ['pagosDeuda'], '/finanzas/deuda-y-credito': ['pagosDeuda'] });
  assert.equal(RUTAS_TRANSFERENCIA['/calculadoras/pension-imss'], undefined, 'Pensión no envía datos');
  assert.equal(RUTAS_TRANSFERENCIA['/calculadoras/ptu'], undefined, 'PTU calcula el total de la empresa, no lo de una persona');
});

test('un pago único no puede llegar como ingreso mensual ni al presupuesto', () => memoria(() => {
  assert.equal(prepararContextoFinanciero('/calculadoras/aguinaldo', '/finanzas/presupuesto', { ingresoNeto: '9000.00' }, 1), false);
  assert.equal(prepararContextoFinanciero('/calculadoras/aguinaldo', '/finanzas/fondo-emergencia', { gastosEsenciales: '9000.00' }, 1), false);
  assert.equal(prepararContextoFinanciero('/calculadoras/aguinaldo', '/finanzas/fondo-emergencia', { fondoActual: '9000.00', gastosEsenciales: '1' }, 1), true);
  const r = consumirContextoFinanciero('/finanzas/fondo-emergencia', 2);
  assert.deepEqual(r.valores, { fondoActual: '9000.00' });
  assert.match(r.nota, /ISR/);
}));

test('las calculadoras ofrecen el siguiente paso solo con un resultado válido y sin enviar nada sola', () => {
  const app = readFileSync('src/App.jsx', 'utf8');
  const comp = readFileSync('src/resultTransfer.jsx', 'utf8');
  for (const o of ['aguinaldo', 'finiquito', 'liquidacion']) assert.match(app, new RegExp(`PagoUnicoTransfer origen="/calculadoras/${o}"`));
  assert.match(app, /ResultTransfer origen="\/calculadoras\/infonavit" importe=\{result\.pagoMensual\}/);
  assert.match(comp, /importe > 0 \? importe\.toFixed\(2\) : null/);
  assert.match(comp, /onClick=\{\(\) => ir\(d\.href\)\}/);
  assert.doesNotMatch(comp, /useEffect|URLSearchParams|localStorage|fetch\(/);
});
