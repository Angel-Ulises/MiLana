import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Mejoras de comprensión (2026-11-15): frecuencia de pago, comas de miles, escuchar y ayuda para reclamar.
const comun = readFileSync('src/calcComun.jsx', 'utf8');
const resultado = readFileSync('src/resultadoClaro.jsx', 'utf8');
const extraer = (fuente, nombre) => {
  const i = fuente.indexOf(`export function ${nombre}(`);
  let nivel = 0; let j = fuente.indexOf('{', fuente.indexOf(')', i));
  for (let k = j; k < fuente.length; k++) { if (fuente[k] === '{') nivel++; if (fuente[k] === '}' && --nivel === 0) { j = k + 1; break; } }
  return fuente.slice(i, j).replace('export ', '');
};
const limpiarNumero = (texto) => String(texto ?? '').replace(/[$,\s]/g, '');
const sueldoMensual = new Function('limpiarNumero', `${extraer(comun, 'sueldoMensual')}; return sueldoMensual;`)(limpiarNumero);
const conMiles = new Function('limpiarNumero', `${extraer(comun, 'conMiles')}; return conMiles;`)(limpiarNumero);
const textoHablado = new Function(`${extraer(resultado, 'textoHablado')}; return textoHablado;`)();

test('lo que te pagan por semana o quincena se convierte al equivalente mensual (LFT art. 89)', () => {
  assert.equal(sueldoMensual('12,000', 'mes'), '12000');
  assert.equal(sueldoMensual('6000', 'quincena'), '12000');
  assert.equal(sueldoMensual('2800', 'semana'), '12000');
  assert.equal(sueldoMensual('2,205.28', 'semana'), '9451.2', 'salario mínimo semanal (315.04 × 7) = 315.04 × 30 al mes');
  assert.equal(sueldoMensual('', 'semana'), '');
  assert.equal(sueldoMensual('abc', 'quincena'), 'abc', 'un texto inválido llega igual a la validación de la fórmula');
});

test('las cantidades se muestran con comas de miles sin cambiar su valor', () => {
  assert.equal(conMiles('12000'), '12,000');
  assert.equal(conMiles('1234567.5'), '1,234,567.5');
  assert.equal(conMiles('12,000'), '12,000');
  assert.equal(conMiles('doce mil'), 'doce mil');
});

test('«Escuchar» lee el resultado como lo diría una persona y no sale del teléfono', () => {
  assert.equal(textoHablado('Te llegan: $5,633.71. Retienen $366.29 de ISR.'), 'Te llegan: 5633 pesos con 71 centavos. Retienen 366 pesos con 29 centavos de I S R.');
  assert.equal(textoHablado('Tu aguinaldo es de $6,000.00.'), 'Tu aguinaldo es de 6000 pesos.');
  assert.match(resultado, /voz\.lang = 'es-MX'/);
  assert.match(resultado, /registrarEvento\('escuchar_resultado', \{ calculadora:/);
  assert.doesNotMatch(resultado, /fetch\(|XMLHttpRequest/);
});

test('ayuda para reclamar: gratis, con los plazos de la LFT, solo donde aplica', () => {
  assert.match(resultado, /te asesora y te representa <strong>gratis<\/strong>/);
  assert.match(resultado, /<strong>2 meses<\/strong> para reclamar/);
  assert.match(resultado, /<strong>1 año<\/strong> para reclamar/);
  assert.match(resultado, /artículos 516, 518, 530 y 534/);
  assert.match(resultado, /https:\/\/www\.gob\.mx\/profedet/);
  const directas = readFileSync('src/calculadorasDirectas.jsx', 'utf8') + readFileSync('src/calcAguinaldo.jsx', 'utf8');
  assert.equal((directas.match(/reclamo=/g) || []).length, 4, 'aguinaldo, finiquito, liquidación y vacaciones');
  assert.match(directas, /reclamo="despido"/);
});

test('las calculadoras de sueldo preguntan cada cuándo te pagan', () => {
  const directas = readFileSync('src/calculadorasDirectas.jsx', 'utf8');
  assert.equal((directas.match(/<CampoSueldo /g) || []).length, 5);
  assert.equal((directas.match(/opciones=\{\['quincena', 'mes'\]\}/g) || []).length, 2, 'ISR y bruto a neto: quincena o mes (la tarifa es mensual)');
  assert.match(readFileSync('src/calcAguinaldo.jsx', 'utf8'), /<CampoSueldo sueldo=\{sueldo\}/);
});
