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

test('sin destellos al cambiar de página: el contenedor de carga no pinta nada en cargas rápidas', () => {
  const loading = readFileSync('src/route-loading.css', 'utf8');
  assert.match(loading, /\.ml-route-loading\{[^}]*background:transparent/);
  assert.match(loading, /\.ml-route-loading span\{opacity:0;animation:mlRouteLoadingShow \.2s ease \.7s forwards\}/);
  // Gráficas y glosario de Órbita esperan al contenido real en vez de insertarse en «Cargando contenido…».
  assert.match(readFileSync('public/orbita-v3-visuals.js', 'utf8'), /main\?\.classList\.contains\('ml-route-loading'\)\) return false/);
  assert.match(readFileSync('public/orbita-v3-glossary.js', 'utf8'), /main\.classList\.contains\('ml-route-loading'\)\) return/);
});

test('sin destellos en calculadoras: el formulario completo no se pinta antes del asistente', () => {
  const prepaint = readFileSync('public/orbita-v3-prepaint.css', 'utf8');
  assert.match(prepaint, /\.calculator-main:not\(:has\(> \.ml-calc-assistant\)\) > form\{visibility:hidden;animation:orbFormReveal 0s linear 1\.5s forwards\}/);
  assert.match(prepaint, /@keyframes orbFormReveal\{to\{visibility:visible\}\}/);
  assert.match(prepaint, /#root:not\(:has\(\[data-startup-error\]\)\) \[data-startup-links\]\{visibility:hidden\}/);
});

test('en táctil no se abre el teclado por código ni queda el recuadro de toque de Android', () => {
  assert.match(js, /const touchInput = matchMedia\('\(pointer: coarse\)'\)\.matches/);
  assert.match(js, /if \(!touchInput \|\| !opensKeyboard\(control\)\) \{ control\.focus/);
  assert.match(js, /if \(!touchInput \|\| !opensKeyboard\(control\)\) control\.focus\(\{ preventScroll: true \}\)/);
  assert.match(readFileSync('public/orbita-v3-base.css', 'utf8'), /\[role="button"\],\[tabindex\]\)\{-webkit-tap-highlight-color:transparent\}/);
});

test('la foto del hero se pinta una sola vez: misma fuente en React, prerender y precarga', () => {
  const app = readFileSync('src/App.jsx', 'utf8');
  assert.match(app, /src=\{heroUrl\(1440\)\} srcSet=\{heroSrcSet\(\)\}/);
  assert.doesNotMatch(app, /<Foto name="inicio"/);
  assert.match(readFileSync('scripts/aplicar-orbita-base.mjs', 'utf8'), /imagesrcset="\$\{heroSrcSet\(\)\}"/);
  assert.match(readFileSync('src/lib/homeStartup.js', 'utf8'), /heroNueva\.replaceWith\(heroPrevia\)/);
});
