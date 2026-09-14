import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('public/aprende/aguinaldo-bruto-neto/index.html', 'utf8');

test('la guía de aguinaldo cubre intención estacional 2026 sin crear otra URL', () => {
  assert.match(html, /Aguinaldo 2026: cálculo y fecha límite/);
  assert.match(html, /antes del 20 de diciembre/);
  assert.match(html, /al menos 15 días/);
  assert.match(html, /parte proporcional/);
  assert.match(html, /\/calculadoras\/aguinaldo/);
});

test('el ejemplo editorial coincide con el caso verificado de MiLana', () => {
  assert.match(html, /\$18,000/);
  assert.match(html, /\$9,000/);
  assert.match(html, /mismo motor que usa la calculadora/);
});

test('la guía conserva fuentes oficiales y no promete un neto universal', () => {
  assert.match(html, /diputados\.gob\.mx\/LeyesBiblio\/pdf\/LFT\.pdf/);
  assert.match(html, /diputados\.gob\.mx\/LeyesBiblio\/pdf\/LISR\.pdf/);
  assert.doesNotMatch(html, /recibirás exactamente/i);
});
