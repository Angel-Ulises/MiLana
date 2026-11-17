import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularFiniquito2026, calcularLiquidacion2026, salariosMinimosDe, SALARIOS_MINIMOS_2026 } from '../src/lib/calculos-laborales-2026.mjs';

const base = { salarioMensual: '18000', fechaIngreso: '2024-01-01', causa: 'renuncia' };

test('R-14: finiquito acepta una salida en 2027 y cuenta el aguinaldo desde el 1 de enero de 2027', () => {
  const r = calcularFiniquito2026({ ...base, fechaSalida: '2027-01-05' });
  assert.equal(r.salida.y, 2027);
  assert.equal(r.diasAguinaldo, 5, 'del 1 al 5 de enero');
  assert.equal(r.diasAnioSalida, 365);
  assert.ok(Math.abs(r.aguinaldoProporcional - 600 * 15 * 5 / 365) < 1e-9);
});

test('R-14: una salida en 2026 da exactamente lo mismo que antes', () => {
  const r = calcularFiniquito2026({ ...base, fechaSalida: '2026-09-30' });
  assert.equal(r.diasAguinaldo, 273); assert.equal(r.diasAnioSalida, 365);
  assert.ok(Math.abs(r.aguinaldoProporcional - 6731.506849315068) < 1e-6, 'igual al caso publicado en casos-calculadoras.json');
  assert.equal(r.salariosMinimosPendientes, false); assert.equal(r.anioSalariosMinimos, 2026);
});

test('R-14: mientras no exista el salario mínimo del año de la salida, se usa el último conocido y se avisa', () => {
  assert.deepEqual(salariosMinimosDe(2026), { anio: 2026, valores: SALARIOS_MINIMOS_2026, pendiente: false });
  const m2027 = salariosMinimosDe(2027);
  assert.equal(m2027.anio, 2026); assert.equal(m2027.pendiente, true);
  const despido = calcularFiniquito2026({ ...base, salarioMensual: '60000', fechaIngreso: '2010-01-01', fechaSalida: '2027-02-15', causa: 'separacion-patron' });
  assert.equal(despido.salariosMinimosPendientes, true);
  assert.equal(despido.topePrimaDiario, SALARIOS_MINIMOS_2026.general * 2);
});

test('R-14: liquidación acepta 2027 y salidas antes de 2026 siguen fuera de alcance', () => {
  const l = calcularLiquidacion2026({ salarioMensual: '18000', fechaIngreso: '2022-03-01', fechaSalida: '2027-03-01', relacionIndeterminada: true });
  assert.ok(l.totalBruto > 0); assert.equal(l.salida.y, 2027);
  assert.throws(() => calcularFiniquito2026({ ...base, fechaSalida: '2025-12-31' }), /desde el 1 de enero de 2026/);
});

test('R-14: en un año bisiesto el aguinaldo de todo el año no rebasa los días que da la empresa', () => {
  const r = calcularFiniquito2026({ ...base, fechaIngreso: '2020-01-01', fechaSalida: '2028-12-31' });
  assert.equal(r.diasAnioSalida, 366); assert.equal(r.diasAguinaldo, 366);
  assert.ok(Math.abs(r.aguinaldoProporcional - 600 * 15) < 1e-9);
});

test('R-14: con el reloj en enero de 2027, el último día de trabajo es hoy y los campos aceptan fechas de 2027', async (t) => {
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
  t.after(() => vite.close());
  const { hoyDesde2026, finDeAnioEnCurso } = await vite.ssrLoadModule('/src/calcComun.jsx');
  const Real = globalThis.Date;
  const fijar = (iso) => {
    const fijo = new Real(iso).getTime();
    globalThis.Date = class extends Real { constructor(...a) { if (a.length === 0) super(fijo); else super(...a); } static now() { return fijo; } };
  };
  try {
    fijar('2027-01-05T12:00:00');
    assert.equal(hoyDesde2026(), '2027-01-05');
    assert.equal(finDeAnioEnCurso(), '2027-12-31');
    fijar('2026-11-17T12:00:00');
    assert.equal(hoyDesde2026(), '2026-11-17');
    assert.equal(finDeAnioEnCurso(), '2026-12-31');
    fijar('2025-06-01T12:00:00');
    assert.equal(hoyDesde2026(), '2026-01-01', 'antes de 2026 se queda en el 1 de enero de 2026');
  } finally { globalThis.Date = Real; }
});
