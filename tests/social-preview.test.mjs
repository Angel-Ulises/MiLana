import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(p, 'utf8');

test('el build inyecta previews sociales después de generar las páginas', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.match(pkg.scripts.build, /inyectar-social-preview\.mjs/);
});

test('cada calculadora usa una imagen social propia y no hereda la portada', () => {
  const script = read('scripts/inyectar-social-preview.mjs');
  for (const id of ['finiquito','liquidacion','aguinaldo','isr','resico','ptu','bruto-neto','vacaciones','infonavit','pension']) {
    assert.ok(script.includes(`${id}`), `falta ${id}`);
  }
  assert.ok(script.includes('og:image'));
  assert.ok(script.includes('twitter:image'));
  assert.ok(script.includes('summary_large_image'));
  assert.ok(script.includes('/images/gen/${base}-1440.jpg'));
});
