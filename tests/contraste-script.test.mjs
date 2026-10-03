import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const script = readFileSync('scripts/verificar-contraste.mjs', 'utf8');

test('el build ejecuta la auditoría de contraste sobre dist/', () => {
  assert.match(pkg.scripts.build, /verificar-orbita-generada\.mjs && node --experimental-websocket scripts\/verificar-contraste\.mjs/);
});

test('la auditoría cubre el sitemap completo a 390 y 1280 y exige 4.5:1 (3:1 en texto grande)', () => {
  assert.match(script, /const VIEWPORTS = \[390, 1280\]/);
  assert.match(script, /sitemap\.xml/);
  assert.match(script, /const need = large \? 3 : 4\.5/);
  assert.match(script, /process\.exit\(1\)/);
});
