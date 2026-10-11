import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('public/orbita-v3-internal.css', 'utf8');
const js = readFileSync('public/orbita-v3-internal.js', 'utf8');
const hub = readFileSync('src/calculators-hub.css', 'utf8');
const hook = readFileSync('src/lib/useAnimatedNumber.js', 'utf8');
const inv = readFileSync('src/invertirHomePage.jsx', 'utf8');

test('las transiciones de paso solo usan transform y opacity', () => {
  for (const name of ['orbStepInFwd', 'orbStepInBack', 'orbResultIn', 'orbAmountIn', 'orbRowIn']) {
    const body = css.match(new RegExp(`@keyframes ${name}\\{([\\s\\S]*?\\})\\}`))?.[1];
    assert.ok(body, name);
    assert.doesNotMatch(body, /height|width|margin|padding|top:|left:/, `${name} no mueve el layout`);
  }
});

test('los pasos no animan en la carga: solo después de cambiar de pregunta', () => {
  assert.match(js, /lastRenderedStep !== null && lastRenderedStep !== step/);
  assert.match(js, /orbitaStepAnimate = 'true'/);
  assert.match(css, /\[data-orbita-step-animate="true"\]\[data-orbita-step-dir="fwd"\]/);
  assert.match(readFileSync('src/calculatorsHubPage.jsx', 'utf8'), /useState\('none'\)/);
});

test('todo el movimiento se apaga con prefers-reduced-motion', () => {
  assert.match(css, /prefers-reduced-motion:reduce\)\{[\s\S]*\[data-orbita-step="true"\][\s\S]*animation:none!important/);
  assert.match(hub, /prefers-reduced-motion:reduce\)\{\.ml-hub-stage-fwd,\.ml-hub-stage-back\{animation:none\}/);
  assert.match(hook, /prefers-reduced-motion: reduce/);
  assert.match(hook, /t === 1 \? target/);
});

test('las cifras animadas se anuncian una sola vez con su valor final', () => {
  assert.match(inv, /className="ml-inv-sr" aria-live="polite"/);
  assert.match(inv, /className="ml-inv-fees-big" aria-hidden="true"/);
  assert.doesNotMatch(inv, /className="ml-inv-fees-result" aria-live/);
});
