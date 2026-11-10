import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calcularRESICO, calcularPTUTotal, calcularVacaciones, diasVacacionesLFT2026, calcularCredito, revisarPension, sbcEstimado, FACTOR_INTEGRACION_MINIMO, SEMANAS_MINIMAS_2026 } from '../src/lib/calculos-directos.mjs';
import { calcularBrutoNeto2026 } from '../src/lib/calculos-laborales-2026.mjs';

const cerca = (a, b, msg) => assert.ok(Math.abs(a - b) < 0.005, `${msg}: ${a} ≠ ${b}`);

test('RESICO usa la tabla del art. 113-E', () => {
  assert.equal(calcularRESICO({ ingresoMensual: '25000' }).tasa, 1);
  assert.equal(calcularRESICO({ ingresoMensual: '25000.01' }).tasa, 1.1);
  assert.equal(calcularRESICO({ ingresoMensual: '83333.33' }).tasa, 1.5);
  assert.equal(calcularRESICO({ ingresoMensual: '208333.34' }).tasa, 2.5);
  cerca(calcularRESICO({ ingresoMensual: '40000' }).isr, 440, 'ISR 40,000');
});

test('PTU total = 10% de la renta gravable', () => {
  cerca(calcularPTUTotal({ rentaGravable: '5000000' }).repartoTotal, 500000, 'PTU');
});

test('vacaciones: tabla del art. 76 LFT (reforma 2022) y prima mínima de 25%', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 10, 11, 16, 21].map(diasVacacionesLFT2026), [12, 14, 16, 18, 20, 22, 22, 24, 26, 28]);
  const r = calcularVacaciones({ anios: '3', sueldoMensual: '18000' });
  assert.equal(r.dias, 16); cerca(r.pagoDias, 9600, 'pago'); cerca(r.primaVacacional, 2400, 'prima');
  assert.throws(() => calcularVacaciones({ anios: '3', primaPct: '20' }), /25%/);
});

test('crédito: pago fijo y saldo final en cero', () => {
  const r = calcularCredito({ monto: '800000', tasaAnual: '10.45', plazoAnios: '20' });
  assert.ok(r.pagoMensual > 7900 && r.pagoMensual < 8000, String(r.pagoMensual));
  cerca(r.tablaAnual.at(-1).saldo, 0, 'saldo final');
});

test('pensión: 875 semanas en 2026 y tipo de retiro por edad', () => {
  assert.equal(SEMANAS_MINIMAS_2026, 875);
  const r = revisarPension({ edad: '62', semanas: '800' });
  assert.equal(r.faltan, 75); assert.equal(r.tipo, 'cesantia');
  assert.equal(revisarPension({ edad: '66', semanas: '900' }).cumpleSemanas, true);
});

test('bruto a neto con SBC estimado coincide con la hoja de verificación', () => {
  cerca(FACTOR_INTEGRACION_MINIMO, 383 / 365, 'factor');
  const sbc = sbcEstimado('20000');
  assert.equal(sbc, 699.54);
  const r = calcularBrutoNeto2026({ brutoMensual: '20000', ingresoGravableISR: '20000', seguridadSocial: 'imss', sbcDiario: String(sbc), diasCotizados: '30', soloMinimo: false, periodo: '2026-11' });
  cerca(r.retenido, 2383.65, 'ISR'); cerca(r.cuotaObrera, 540.14, 'IMSS'); cerca(r.netoDespuesISRSeguridadSocial, 17076.21, 'neto');
  const hoja = readFileSync('docs/mejora-2026-11/hojas/bruto-neto.md', 'utf8');
  assert.match(hoja, /\$17,076\.21/);
  assert.match(hoja, /No es una validación de contador/);
});

test('diagnóstico salario mínimo en bruto a neto: el motor ya aplica LISR 96 y LSS 36 solo con la casilla marcada', () => {
  // Documenta el comportamiento actual, sin cambiarlo: la detección automática por monto quedó descartada.
  const base = { brutoMensual: '9451.20', ingresoGravableISR: '9451.20', seguridadSocial: 'imss', sbcDiario: String(sbcEstimado('9451.20')), diasCotizados: '30', periodo: '2026-11' };
  const sinCasilla = calcularBrutoNeto2026({ ...base, soloMinimo: false });
  const conCasilla = calcularBrutoNeto2026({ ...base, soloMinimo: true });
  cerca(sinCasilla.retenido, 133.66, 'ISR sin casilla'); cerca(sinCasilla.cuotaObrera, 235.54, 'IMSS sin casilla'); cerca(sinCasilla.netoDespuesISRSeguridadSocial, 9082.00, 'neto sin casilla');
  assert.equal(conCasilla.retenido, 0); assert.equal(conCasilla.cuotaObrera, 0); cerca(conCasilla.netoDespuesISRSeguridadSocial, 9451.20, 'neto con casilla');
  const hoja = readFileSync('docs/mejora-2026-11/hojas/bruto-neto.md', 'utf8');
  for (const cifra of ['$9,082.00', '$9,451.20']) assert.ok(hoja.includes(cifra), cifra);
  const jsx = readFileSync('src/calculadorasDirectas.jsx', 'utf8');
  assert.doesNotMatch(jsx, /ganaSalarioMinimoGeneral/, 'sin detección automática por monto hasta tener validación');
});

test('las 10 calculadoras usan el resultado común con WhatsApp, siguiente paso y evento GA4', () => {
  const jsx = readFileSync('src/calculadorasDirectas.jsx', 'utf8') + readFileSync('src/calcAguinaldo.jsx', 'utf8');
  for (const id of ['finiquito', 'liquidacion', 'aguinaldo', 'isr', 'resico', 'ptu', 'bruto-neto', 'vacaciones', 'infonavit', 'pension']) {
    assert.match(jsx, new RegExp(`calculadora="${id}"`), id);
  }
  assert.equal((jsx.match(/siguiente=\{/g) || []).length, 10, 'una sola sugerencia por calculadora');
  const comun = readFileSync('src/resultadoClaro.jsx', 'utf8');
  assert.match(comun, /wa\.me\/\?text=/);
  assert.match(comun, /registrarEvento\('compartir_whatsapp'/);
  assert.match(comun, /registrarEvento\('clic_siguiente_paso'/);
  assert.match(comun, /Datos actualizados al/);
});
