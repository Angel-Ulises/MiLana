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

test('el observador de calculadoras no vigila body y se pausa al mutar', () => {
  assert.match(js, /observer\.observe\(observerTarget, \{ childList: true, subtree: true \}\)/);
  assert.match(js, /withObserverPaused/);
  assert.match(js, /observer\.disconnect\(\)/);
  assert.doesNotMatch(js, /observer\.observe\(document\.body/);
  assert.match(js, /setText\(count, `Pregunta/);
});

test('Siguiente vive dentro del formulario, Enter avanza y la pregunta hace scroll', () => {
  assert.match(js, /formHost\.appendChild\(nav\)/);
  assert.match(js, /moveActionsAfterActiveQuestion/);
  assert.match(js, /event\.key !== 'Enter'/);
  assert.match(js, /scrollIntoView\(\{ behavior: reduceMotion \? 'auto' : 'smooth', block: 'start' \}\)/);
  assert.match(js, /HEADER_OFFSET = 82/);
});

test('el resultado se puede corregir y conserva acciones de ruta', () => {
  assert.match(js, /Editar respuestas/);
  assert.match(js, /editing = true/);
  assert.match(js, /result\.hidden = editing/);
  assert.match(js, /Compartir por WhatsApp/);
  assert.match(js, /Siguiente paso de tu ruta/);
});

test('casos duplicados se eliminan por data-case-slug y no separan el flujo', () => {
  assert.match(js, /querySelectorAll\('\.ml-case'\)/);
  assert.match(js, /dataset\.caseSlug/);
  assert.match(js, /seen\.has\(slug\)/);
});

test('campos monetarios ofrecen varios montos de ejemplo sin tocar fórmulas', () => {
  assert.match(js, /return \[10000, 15000, 25000, 40000\]/);
  assert.match(js, /ml-calc-examples/);
  assert.match(js, /setReactInputValue/);
  assert.doesNotMatch(js, /calcularFiniquito2026|calcularLiquidacion2026|calcularBrutoNeto2026|ISR_MENSUAL_2026/);
});

test('Pensión queda fuera de la capa interna', () => {
  assert.match(js, /PENSION_PATH/);
  assert.match(js, /data\.orbitaProtected|dataset\.orbitaProtected/);
  assert.match(js, /PENSION_PATH\.test\(location\.pathname\)/);
});

test('glosario inline incluye ISR y UMA sin popup', () => {
  assert.match(js, /ISR:/);
  assert.match(js, /UMA:/);
  assert.match(js, /<summary>¿Qué es\?<\/summary>/);
  assert.doesNotMatch(js, /alert\(|confirm\(|prompt\(/);
});

test('Letra grande sustituye el nombre Modo fácil en runtime', () => {
  assert.match(base, /Letra grande activada/);
  assert.match(base, /Letra grande desactivada/);
  assert.match(base, /label\.textContent = 'Letra grande'/);
  assert.ok(css.length > 1000);
});
