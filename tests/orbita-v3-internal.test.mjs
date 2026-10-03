import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const base = readFileSync('public/orbita-v3-base.js', 'utf8');
const css = readFileSync('public/orbita-v3-internal.css', 'utf8');
const hybrid = readFileSync('public/orbita-v3-hybrid.css', 'utf8');
const js = readFileSync('public/orbita-v3-internal.js', 'utf8');
const audit = readFileSync('public/orbita-v3-audit.css', 'utf8');
const prepaint = readFileSync('public/orbita-v3-prepaint.css', 'utf8');

test('la capa interna se carga solo después de descartar embed', () => {
  const embedGuard = base.indexOf('if (legacyEmbed)');
  const earlyReturn = base.indexOf('return;', embedGuard);
  const internalCss = base.indexOf('/orbita-v3-internal.css');
  const hybridCss = base.indexOf('/orbita-v3-hybrid.css');
  const internalJs = base.indexOf('/orbita-v3-internal.js');
  assert.ok(embedGuard >= 0 && earlyReturn > embedGuard);
  assert.ok(internalCss > earlyReturn && hybridCss > earlyReturn && internalJs > earlyReturn);
});

test('Pensión queda fuera de la capa interna completa', () => {
  assert.match(base, /protectedPension/);
  assert.match(base, /if \(protectedPension\) return/);
  assert.match(js, /PENSION_PATH/);
});

test('el observador de calculadoras sigue #root y se pausa al mutar', () => {
  assert.match(js, /const liveObserverTarget = \(\) => document\.getElementById\('root'\)/);
  assert.match(js, /observer\.observe\(observerTarget, \{ childList: true, subtree: true \}\)/);
  assert.match(js, /withObserverPaused/);
  assert.match(js, /observer\.disconnect\(\)/);
  assert.doesNotMatch(js, /observerTarget = main/);
  assert.doesNotMatch(js, /observer\.observe\(document\.body/);
  assert.match(js, /!currentMain\?\.isConnected \|\| !currentRoot\?\.isConnected/);
  assert.match(js, /setText\(count, `Pregunta/);
});

test('select hijo directo del form nunca convierte el form en pregunta', () => {
  const helpers = js.match(/const questionControlCount =[\s\S]*?const isQuestionHostSafe =[\s\S]*?\n  \);/)?.[0];
  assert.ok(helpers, 'no se encontró el guard de host de pregunta');
  const context = { safe: null };
  vm.runInNewContext(`const QUESTION_SELECTOR='select'; let formHost=null; ${helpers}; safe=isQuestionHostSafe;`, context);
  const root = { tagName: 'DIV' };
  const directSelect = { tagName: 'SELECT' };
  const form = { tagName: 'FORM', querySelectorAll: () => [directSelect] };
  directSelect.parentElement = form;
  assert.equal(context.safe(form, root), false);
  assert.match(js, /return \[label, control\]\.filter\(Boolean\)/);
  assert.match(js, /host\.tagName !== 'FORM'/);
  assert.match(js, /questionControlCount\(host\) <= 1/);
});

test('Siguiente vive dentro del formulario, Enter avanza y la pregunta hace scroll', () => {
  assert.match(js, /formHost\.appendChild\(nav\)/);
  assert.match(js, /moveActionsAfterActiveQuestion/);
  assert.match(js, /event\.key !== 'Enter'/);
  assert.match(js, /scrollIntoView\(\{ behavior: reduceMotion \? 'auto' : 'smooth', block: 'start' \}\)/);
  assert.match(js, /HEADER_OFFSET = 82/);
});

test('contador fija el total inicial y el resultado oculta preguntas y navegación', () => {
  assert.match(js, /let questionTotal = 0/);
  assert.match(js, /questionTotal = questions\.length/);
  assert.match(js, /const total = Math\.max\(questionTotal, 1\)/);
  assert.match(js, /const active = !showingResult && index === step/);
  assert.match(js, /back\.hidden = step === 0 \|\| showingResult/);
  assert.match(js, /actions\.hidden = showingResult/);
});

test('el resultado se puede corregir y conserva acciones de ruta sin duplicar WhatsApp', () => {
  assert.match(js, /Editar respuestas/);
  assert.match(js, /editing = true/);
  assert.match(js, /result\.hidden = editing/);
  assert.match(js, /Compartir por WhatsApp/);
  assert.match(js, /hasNativeWhatsAppShare/);
  assert.match(js, /if \(!hasNativeWhatsAppShare\(result\)\)/);
  assert.match(js, /Siguiente paso de tu ruta/);
});

test('un error de validación en un paso previo reactiva ese paso y le da foco', () => {
  assert.match(js, /const recoverValidationStep = \(\) =>/);
  assert.match(js, /formHost\.addEventListener\('invalid'/);
  assert.match(js, /step = index;\n\s*renderStep\(\{ focus: true \}\)/);
  assert.match(js, /errorText\.includes\('salario minimo'\)/);
  assert.match(js, /errorText\.includes\('vacaciones'\) && errorText\.includes\('anuales'\)/);
  assert.ok(js.indexOf('const errorText =') < js.indexOf("control.matches(':invalid')"));
  assert.doesNotMatch(js, /getAttribute\('aria-invalid'\)/);
});

test('intro repetido se oculta y el hero móvil deja la pregunta más arriba', () => {
  assert.match(js, /introDuplicatesHero/);
  assert.match(js, /introRepeatsHero = introDuplicatesHero\(intro\)/);
  assert.match(js, /if \(introRepeatsHero && intro\) intro\.hidden = true/);
  assert.match(prepaint, /\.calculator-hero-media\{display:none!important\}/);
  assert.match(prepaint, /\.calculator-purpose\{[^}]*-webkit-line-clamp:1/);
  assert.match(prepaint, /body:has\(\.calculator-hero\) \.calc-intro\{display:none!important\}/);
  assert.match(prepaint, /\.calculator-main::before\{[^}]*height:131px/);
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

test('glosario inline incluye ISR y UMA sin popup', () => {
  assert.match(js, /ISR:/);
  assert.match(js, /UMA:/);
  assert.match(js, /<summary>¿Qué es\?<\/summary>/);
  assert.doesNotMatch(js, /alert\(|confirm\(|prompt\(/);
});

test('Letra grande usa el token tipográfico en calculadoras, carreras y Aprende', () => {
  assert.match(base, /Letra grande activada/);
  assert.match(base, /Letra grande desactivada/);
  assert.match(hybrid, /font-size:var\(--orb-fs\)!important/);
  assert.match(hybrid, /data-orbita-section="aprende"[^\n]*\.article :is\(p,li\)\{font-size:var\(--orb-fs\)!important\}/);
  assert.match(hybrid, /data-orbita-section="carreras"[^\n]*career-state-tool select/);
});

test('Estados limita el relleno oscuro al botón principal', () => {
  assert.match(hybrid, /\.state-selector button\{[^}]*background:#FFF!important[^}]*color:#263744!important/);
  assert.match(hybrid, /\.state-selector :is\(button\[type="submit"\],\.ml-btn,\.primary,\.state-selector-primary\)\{background:#2D6CAA!important;color:#FFF!important/);
});

test('eyebrows y enlaces conservan color de sección con contraste reforzado', () => {
  assert.match(hybrid, /data-orbita-section="estados"[^\n]*#16766C/);
  assert.match(hybrid, /data-orbita-section="economia"[^\n]*#9A6819/);
  assert.match(hybrid, /data-orbita-section="carreras"[^\n]*#6654C7/);
  assert.match(hybrid, /\[style\*="#6a7a87" i\][^\n]*#53616D!important/);
});

test('la capa híbrida usa fondo claro, tarjetas limpias y acción azul', () => {
  assert.match(hybrid, /--orb-bg:#F5F7FA/);
  assert.match(hybrid, /\.ml-orbita-shell\{background:rgba\(255,255,255,.96\)!important/);
  assert.match(hybrid, /\.ml-calc-flow-next\{background:#2D6CAA!important;color:#FFF!important/);
  assert.match(hybrid, /\.orb-result-head/);
  assert.match(hybrid, /\.orb-money-cents/);
});

test('la capa híbrida e interna siguen siendo archivos separados', () => {
  assert.ok(css.length > 1000);
  assert.ok(hybrid.length > 1000);
});
