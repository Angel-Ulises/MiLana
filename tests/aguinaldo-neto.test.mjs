import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calcularAguinaldoNeto, EXENCION_AGUINALDO_2026 } from '../src/lib/calculos-revisados.mjs';

const cerca = (a, b, msg) => assert.ok(Math.abs(a - b) < 0.005, `${msg}: ${a} ≠ ${b}`);

test('exención 2026 = 30 UMA de $117.31 (INEGI) = $3,519.30', () => {
  assert.equal(EXENCION_AGUINALDO_2026, 3519.3);
});

test('los tres casos de la hoja de verificación coinciden con el motor', () => {
  const c1 = calcularAguinaldoNeto({ sueldoMensual: '12000' });
  cerca(c1.bruto, 6000, 'bruto c1'); cerca(c1.isr, 366.29, 'isr c1'); cerca(c1.neto, 5633.71, 'neto c1');
  // Caso 2: salario mínimo general 2026 ($315.04) × 30 (LFT art. 89) — 15 días de mínimo = $4,725.60.
  const c2 = calcularAguinaldoNeto({ sueldoMensual: '9451.20' });
  cerca(c2.salarioDiario, 315.04, 'diario c2'); cerca(c2.bruto, 4725.60, 'bruto c2'); cerca(c2.isr, 131.25, 'isr c2'); cerca(c2.neto, 4594.35, 'neto c2');
  // Diagnóstico pendiente de contador (art. 96 LISR, «únicamente salario mínimo»): retención completa del mes con aguinaldo.
  cerca(c2.isrSueldoMasAguinaldo.retenido, 264.90, 'alternativa c2');
  const c3 = calcularAguinaldoNeto({ sueldoMensual: '30000', fechaIngreso: '2026-07-01' });
  assert.equal(c3.diasPeriodo, 184);
  cerca(c3.bruto, 7561.64, 'bruto c3'); cerca(c3.isr, 863.44, 'isr c3'); cerca(c3.neto, 6698.20, 'neto c3');
  const hoja = readFileSync('docs/mejora-2026-11/hojas/aguinaldo.md', 'utf8');
  for (const cifra of ['$5,633.71', '$4,594.35', '$6,698.20', '$264.90']) assert.ok(hoja.includes(cifra), `la hoja incluye ${cifra}`);
  assert.match(hoja, /No es una validación de contador/);
  // Art. 174 RLISR (opcional): solo difiere cuando el aguinaldo cambia de tramo (caso 1).
  assert.match(hoja, /\| 1 \| \$366\.29 \| \$269\.90 /);
  assert.match(hoja, /\| 2 \| \$131\.25 \| \$131\.25 /);
  assert.doesNotMatch(hoja, /9,577\.22/, 'el caso de salario mínimo usa ÷ 30, no × 30.4');
});

test('un aguinaldo debajo de la exención no paga ISR', () => {
  const r = calcularAguinaldoNeto({ sueldoMensual: '6000' });
  cerca(r.bruto, 3000, 'bruto'); assert.equal(r.isr, 0); assert.equal(r.neto, r.bruto);
});

test('si entró antes de 2026 se toma el año completo; más días de prestación suben el aguinaldo', () => {
  const r = calcularAguinaldoNeto({ sueldoMensual: '15000', fechaIngreso: '2019-03-10', dias: '20' });
  assert.equal(r.diasPeriodo, 365); cerca(r.bruto, 10000, 'bruto 20 días');
  assert.throws(() => calcularAguinaldoNeto({ sueldoMensual: '15000', dias: '10' }), /15 días/);
  assert.throws(() => calcularAguinaldoNeto({ sueldoMensual: 'abc' }));
});

test('la calculadora pide solo sueldo y periodo por defecto; gobierno y SEP quedan en un enlace', () => {
  const jsx = readFileSync('src/calcAguinaldo.jsx', 'utf8');
  assert.match(jsx, /¿Trabajas en gobierno o SEP\?/);
  assert.match(jsx, /¿Te dan más de 15 días\?/);
  assert.match(jsx, /registrarResultado\('aguinaldo'/);
  assert.equal((jsx.match(/<input /g) || []).length, 5, 'sueldo, dos opciones de periodo, fecha (condicional) y días (condicional)');
});

test('las calculadoras ya no montan el asistente «una pregunta a la vez»', () => {
  const js = readFileSync('public/orbita-v3-internal.js', 'utf8');
  assert.match(js, /const CALCULADORA_DIRECTA = true;/);
  assert.match(js, /if \(CALCULADORA_DIRECTA \|\| PENSION_PATH\.test\(location\.pathname\)\)/);
});
