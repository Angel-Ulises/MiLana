import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = readFileSync('public/orbita-v3-base.js', 'utf8');
const inject = readFileSync('scripts/aplicar-orbita-base.mjs', 'utf8');

test('las capas dinámicas conservan orden de ejecución', () => {
  assert.match(base, /script\.async = false/);
  assert.ok(base.indexOf('/orbita-v3-internal.js') < base.indexOf('/orbita-v3-experience.js'));
  assert.ok(base.indexOf('/orbita-v3-experience.js') < base.indexOf('/orbita-v3-visuals.js'));
});

test('el shell sale del build con el nombre Letra grande, sin depender del runtime', () => {
  assert.match(inject, />Letra grande<\/button>/);
  assert.match(inject, /title="Letra grande desactivada"/);
  assert.match(inject, /<span>Letra grande<\/span>/);
  assert.doesNotMatch(inject, />Modo fácil<\/button>/);
});
