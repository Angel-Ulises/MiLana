import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = readFileSync('public/orbita-v3-base.js', 'utf8');
const css = readFileSync('public/orbita-v3-internal.css', 'utf8');
const js = readFileSync('public/orbita-v3-internal.js', 'utf8');

test('la capa interna se carga solo después de descartar embed', () => {
  const embedGuard = base.indexOf('if (legacyEmbed)');
  const earlyReturn = base.indexOf('return;', embedGuard);
  const internalCss = base.indexOf('/orbita-v3-internal.css');
  const internalJs = base.indexOf('/orbita-v3-internal.js');
  assert.ok(embedGuard >= 0 && earlyReturn > embedGuard);
  assert.ok(internalCss > earlyReturn && internalJs > earlyReturn);
});

test('etapa 2 existe como capa separada sin tocar fórmulas', () => {
  assert.match(base, /data-orbita-internal-style/);
  assert.match(base, /data-orbita-internal-runtime/);
  assert.match(js, /data-orbita-question/);
  assert.doesNotMatch(js, /calcularFiniquito2026|calcularLiquidacion2026|calcularBrutoNeto2026|ISR_MENSUAL_2026/);
  assert.ok(css.length > 1000);
});

test('Letra grande sustituye el nombre Modo fácil en runtime', () => {
  assert.match(base, /Letra grande activada/);
  assert.match(base, /Letra grande desactivada/);
  assert.match(base, /label\.textContent = 'Letra grande'/);
});
