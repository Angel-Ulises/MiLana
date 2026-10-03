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

test('el build verifica que los visuales ocupen >= 90% de su reserva a 390 y 1280', () => {
  const reservas = readFileSync('scripts/verificar-reservas.mjs', 'utf8');
  assert.match(pkg.scripts.build, /verificar-reservas\.mjs/);
  assert.match(reservas, /const VIEWPORTS = \[390, 1280\]/);
  assert.match(reservas, /const MIN_RATIO = 0\.9/);
  assert.doesNotMatch(readFileSync('public/orbita-v3-prepaint.css', 'utf8'), /orb-visual-reservee/);
});
