import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compararDeposito } from '../src/lib/calculos-directos.mjs';
import { calcularAguinaldoNeto } from '../src/lib/calculos-revisados.mjs';

test('¿Me pagaron bien?: cuadra, menos o más, con margen de $50 o 1% del aguinaldo', () => {
  const r = calcularAguinaldoNeto({ sueldoMensual: '12000' }); // bruto 6,000 · neto 5,633.71
  assert.equal(compararDeposito({ ...r, deposito: '5,630' }).veredicto, 'cuadra');
  assert.equal(compararDeposito({ ...r, deposito: '5693' }).veredicto, 'cuadra', 'dentro del margen de $60');
  const menos = compararDeposito({ ...r, deposito: '4800' });
  assert.equal(menos.veredicto, 'menos'); assert.equal(menos.diferencia, -833.71);
  const mas = compararDeposito({ ...r, deposito: '6000' });
  assert.equal(mas.veredicto, 'mas'); assert.equal(mas.diferencia, 366.29); assert.equal(mas.superaBruto, false);
  assert.equal(compararDeposito({ ...r, deposito: '9000' }).superaBruto, true);
  for (const vacio of ['', '0', 'abc', null]) assert.equal(compararDeposito({ ...r, deposito: vacio }), null);
});

test('el comparador no acusa a la empresa, remite a la ayuda y no manda importes a la medición', () => {
  const jsx = readFileSync('src/calcAguinaldo.jsx', 'utf8');
  assert.match(jsx, /No siempre es un error/);
  assert.match(jsx, /¿Y si no me lo pagan\?/);
  assert.match(jsx, /registrarEvento\('comparar_deposito', \{ calculadora: 'aguinaldo' \}\)/);
  assert.doesNotMatch(jsx, /registrarEvento\('comparar_deposito',[^)]*(veredicto|diferencia|deposito)/);
  assert.doesNotMatch(jsx, /localStorage|sessionStorage/);
});
