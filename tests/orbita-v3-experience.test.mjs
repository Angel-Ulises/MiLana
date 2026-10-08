import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = readFileSync('public/orbita-v3-base.js', 'utf8');
const js = readFileSync('public/orbita-v3-experience.js', 'utf8');
const css = readFileSync('public/orbita-v3-experience.css', 'utf8');

test('portada V4 carga después del guard de embed y nunca en Pensión', () => {
  const guard = base.indexOf('if (legacyEmbed)');
  const earlyReturn = base.indexOf('return;', guard);
  assert.ok(base.indexOf('/orbita-v3-experience.css') > earlyReturn);
  assert.ok(base.indexOf('/orbita-v3-experience.js') > earlyReturn);
  assert.match(base, /if \(protectedPension\) return/);
});

test('portada usa el copy aprobado y las seis situaciones', () => {
  for (const text of [
    'Entiende tu ', 'lana', ' en un minuto',
    '¿Qué estás viviendo?',
    'Me despidieron', 'Renuncié', 'Voy a cobrar aguinaldo',
    'Quiero ahorrar', 'Estoy eligiendo carrera', 'Pienso mudarme de estado',
    'Busca una calculadora'
  ]) assert.ok(js.includes(text), `falta copy de portada: ${text}`);
});

test('portada mantiene foto separada del texto y elimina overlay', () => {
  assert.match(js, /hero\.querySelector\('\.hero-note'\)\?\.setAttribute\('hidden'/);
  assert.match(css, /\.hero-note[\s\S]{0,260}display:none!important/);
  assert.match(css, /\.hero-grid\{[\s\S]*grid-template-columns:minmax\(0,1\.08fr\) minmax\(340px,.72fr\)!important/);
  assert.match(css, /\.hero-media-wrap\{display:none!important\}/);
});

test('el seguimiento solo se muestra con una ruta guardada y sin pasos ficticios', () => {
  assert.match(js, /if \(!route\) return null/);
  assert.match(js, /Continúa donde te quedaste/);
  assert.match(js, /Retomar herramienta/);
  assert.match(js, /Descartar/);
  assert.doesNotMatch(js, /paso 1 de 4/);
  assert.match(css, /\.orb-situation-card\{[\s\S]*background:#EEF5FA/);
});

test('estética híbrida es clara, redondeada y usa azul MiLana como acción', () => {
  assert.match(css, /background:#F5F7FA!important/);
  assert.match(css, /\.orb-home-route\{[\s\S]*background:#FFF/);
  assert.match(css, /border-radius:16px/);
  assert.match(css, /color:#2D6CAA/);
});

test('no se incorporan marcas, imágenes ni copy de GBM', () => {
  assert.doesNotMatch(js, /GBM|gbm\.com|Pioneros|asesoría financiera/i);
  assert.doesNotMatch(css, /GBM|gbm\.com/i);
});

test('la portada no introduce carruseles ni controles flotantes', () => {
  assert.doesNotMatch(js, /carousel|swiper|slick/i);
  assert.doesNotMatch(css, /position\s*:\s*fixed/i);
});


test('portada reserva la geometría final y se realza con el #root vivo, no con reintentos tardíos', () => {
  const prepaint = readFileSync('public/orbita-v3-prepaint.css', 'utf8');
  assert.match(prepaint, /data-orbita-section="inicio"\] \.hero\{min-height:1104px!important\}/);
  assert.match(prepaint, /max-width:620px\)\{html\.ml-orbita-enabled\[data-orbita-section="inicio"\] \.hero\{min-height:1172px!important\}/);
  assert.match(js, /document\.getElementById\('root'\)/);
  assert.match(js, /new MutationObserver\(queueRun\)/);
  assert.match(js, /rootObserver\.observe\(observedRoot, \{ childList: true, subtree: true \}\)/);
  assert.doesNotMatch(js, /\[80, 220, 600\]\.forEach/);
});


test('Nuevo León evita el swap tardío de Newsreader solo en el título de estado detalle', () => {
  const prepaint = readFileSync('public/orbita-v3-prepaint.css', 'utf8');
  assert.match(prepaint, /font-family:"Newsreader State Optional"/);
  assert.match(prepaint, /font-display:optional/);
  assert.match(prepaint, /cY9AfjOCX1hbuyalUrK4397yjA\.woff2/);
  assert.match(prepaint, /data-orbita-section="estados"\] \.state-detail-hero h1\{font-family:"Newsreader State Optional",Georgia/);
});
