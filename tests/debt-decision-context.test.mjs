import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { crearContextoDeuda } from '../src/lib/debtDecisionContext.js';

const pagina = readFileSync('src/investmentReadinessPage.jsx','utf8');
const main = readFileSync('src/main.jsx','utf8');

test('deuda completa conserva CAT y tasa separados de los pagos restantes', () => {
  const contexto = crearContextoDeuda({ pagoMensual:4000, saldo:80000, catAnualPct:35.4, tasaAnualPct:28, mesesRestantes:24 });
  assert.equal(contexto.completo, true);
  assert.equal(contexto.estado, 'contexto-capturado');
  assert.equal(contexto.pagosRestantesDeclarados, 96000);
  assert.equal(contexto.diferenciaPagosSaldo, 16000);
  assert.equal(contexto.costoReferencia.tipo, 'CAT');
  assert.equal(contexto.costoReferencia.valorPct, 35.4);
  assert.match(contexto.nota, /no equivale necesariamente a intereses/i);
});

test('deuda incompleta declara exactamente qué datos faltan', () => {
  const contexto = crearContextoDeuda({ pagoMensual:2500, saldo:50000 });
  assert.equal(contexto.completo, false);
  assert.deepEqual(contexto.faltantes, ['meses restantes', 'CAT o tasa anual']);
  assert.equal(contexto.pagosRestantesDeclarados, null);
});

test('pago cero no inventa saldo, plazo ni costo', () => {
  const contexto = crearContextoDeuda({ pagoMensual:0 });
  assert.equal(contexto.estado, 'sin-pago-declarado');
  assert.equal(contexto.pagosRestantesDeclarados, null);
  assert.equal(contexto.costoReferencia, null);
});

test('la capa de deuda no compara CAT contra rendimientos ni ordena pagar o invertir', () => {
  const contexto = crearContextoDeuda({ pagoMensual:3000, saldo:60000, tasaAnualPct:24, mesesRestantes:30 });
  const texto = JSON.stringify(contexto);
  assert.doesNotMatch(texto, /te conviene|paga primero|invierte ahora|rendimiento esperado/i);
  assert.match(texto, /no se convierten en rendimiento de inversión/i);
});

test('la UI muestra deuda solo como contexto y carga sus estilos', () => {
  assert.match(pagina, /Detalle opcional de deuda/i);
  assert.match(pagina, /Diferencia aritmética: pagos declarados menos saldo/i);
  assert.match(pagina, /deudaContexto\.nota/);
  assert.doesNotMatch(pagina, /te conviene|paga primero|debes invertir/i);
  assert.match(main, /investment-debt-context\.css/);
});
