import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync('public/widgets/index.html', 'utf8');
const embed = readFileSync('public/embed-mode-2026.js', 'utf8');
const index = readFileSync('index.html', 'utf8');

test('la página de widgets ofrece dos herramientas con atribución enlazada', () => {
  assert.match(page, /calculadoras\/aguinaldo\?embed=1/);
  assert.match(page, /calculadoras\/bruto-a-neto\?embed=1/);
  assert.match(page, /Calculadora por/);
  assert.match(page, /https:\/\/www\.milanaaqui\.mx\/calculadoras\/aguinaldo/);
  assert.match(page, /https:\/\/www\.milanaaqui\.mx\/calculadoras\/bruto-a-neto/);
});

test('el modo embebible reutiliza la calculadora real y no duplica fórmulas', () => {
  assert.doesNotThrow(() => new Function(embed));
  assert.match(embed, /\.calculator-main/);
  assert.match(embed, /querySelector\('form'\)/);
  assert.match(embed, /Abrir completa/);
  assert.doesNotMatch(embed, /ISR_MENSUAL_2026|calcularAguinaldo|SALARIOS_MINIMOS_2026/);
});

test('el modo embebible solo se activa con embed=1', () => {
  assert.match(embed, /params\.get\('embed'\) !== '1'/);
  assert.match(index, /\/embed-mode-2026\.js/);
});
