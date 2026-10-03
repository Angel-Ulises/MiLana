import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = readFileSync('public/orbita-v3-base.js', 'utf8');
const js = readFileSync('public/orbita-v3-glossary.js', 'utf8');
const css = readFileSync('public/orbita-v3-glossary.css', 'utf8');

test('glosario contextual carga fuera de embed y Pensión', () => {
  assert.match(base, /\/orbita-v3-glossary\.css/);
  assert.match(base, /\/orbita-v3-glossary\.js/);
  assert.match(base, /if \(protectedPension\) return/);
  assert.match(js, /pension-imss/);
});

test('ISR y UMA tienen explicación tocable junto con términos frecuentes', () => {
  for (const term of ['ISR', 'UMA', 'CETES', 'CAT', 'RESICO', 'PTU', 'SBC', 'IMSS', 'LFT']) assert.match(js, new RegExp(`${term}:`));
  assert.match(js, /<summary><strong>\$\{term\}<\/strong><span>¿Qué es\?<\/span><\/summary>/);
});

test('el glosario no usa popup ni elemento flotante', () => {
  assert.doesNotMatch(js, /alert\(|confirm\(|prompt\(/);
  assert.doesNotMatch(css, /position\s*:\s*fixed/i);
  assert.match(css, /\.orb-glossary-item summary/);
});

test('solo aparecen términos que existen en el contenido visible', () => {
  assert.match(js, /main\.textContent\.toUpperCase\(\)/);
  assert.match(js, /Object\.keys\(TERMS\)\.filter/);
  assert.match(js, /detected\.slice\(0, 5\)/);
});
