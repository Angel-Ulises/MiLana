import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const scope = readFileSync('src/publicSectorScope.js','utf8');
const css = readFileSync('src/publicSectorScope.css','utf8');
const main = readFileSync('src/main.jsx','utf8');
const enhancements = readFileSync('src/siteEnhancements.jsx','utf8');

test('la capa de alcance se carga globalmente y separa LFT/LFTSE e IMSS/ISSSTE', () => {
  assert.match(main, /publicSectorScope\.js/);
  assert.match(main, /publicSectorScope\.css/);
  for (const route of ['finiquito','liquidacion','aguinaldo','bruto-a-neto','vacaciones','pension-imss','infonavit','ptu']) assert.match(scope, new RegExp(route.replaceAll('-', '\\-')));
  assert.match(scope, /lftse-federal/);
  assert.match(scope, /ISSSTE/);
  assert.match(scope, /FOVISSSTE/);
  assert.match(scope, /40 días/);
});

test('la reserva móvil se compacta y colapsa cuando aparece Paso a paso', () => {
  assert.match(scope, /orb-calc-assistant-ready/);
  assert.match(css, /height:92px!important;min-height:92px!important/);
  assert.match(css, /orb-calc-assistant-ready/);
  assert.match(css, /ml-public-scope-blocked-route/);
});

test('la foto de personas usa focal móvil y finiquito conserva su picture vertical', () => {
  assert.match(css, /img\[src\*="3184465"\]/);
  assert.match(css, /object-position:50% 30%/);
  assert.match(enhancements, /max-width: 640px/);
  assert.match(enhancements, /matches\) return/);
});

test('tarjetas densas móviles ganan padding, tamaño de lectura y una sola columna', () => {
  assert.match(css, /career-state-row\{grid-template-columns:minmax\(0,1fr\)!important/);
  assert.match(css, /padding:20px!important/);
  assert.match(css, /font-size:13px!important/);
  assert.match(css, /saved-state-context-grid,.investment-debt-grid/);
});
