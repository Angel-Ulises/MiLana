import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = readFileSync('public/orbita-v3-base.js', 'utf8');
const inject = readFileSync('scripts/aplicar-orbita-base.mjs', 'utf8');
const internal = readFileSync('public/orbita-v3-internal.js', 'utf8');
const audit = readFileSync('public/orbita-v3-audit.css', 'utf8');

test('las capas dinámicas conservan orden de ejecución', () => {
  assert.match(base, /script\.async = false/);
  assert.ok(base.indexOf('/orbita-v3-internal.js') < base.indexOf('/orbita-v3-experience.js'));
  assert.ok(base.indexOf('/orbita-v3-experience.js') < base.indexOf('/orbita-v3-glossary.js'));
  assert.ok(base.indexOf('/orbita-v3-glossary.js') < base.indexOf('/orbita-v3-visuals.js'));
});

test('reservas de layout se crean antes de cargar scripts que insertan contenido', () => {
  assert.ok(base.indexOf('reserveRuntimeSurfaces();') < base.indexOf('ensureInternalLayer();'));
  assert.match(base, /orb-runtime-reserve orb-visual-reserve/);
  assert.match(base, /orb-runtime-reserve orb-glossary-reserve/);
});

test('Pensión permanece fuera de las capas V4', () => {
  assert.match(base, /protectedPension/);
  assert.match(base, /if \(protectedPension\) return/);
  assert.match(internal, /PENSION_PATH/);
  assert.match(audit, /:not\(\[data-orbita-protected="pension"\]\)/);
});

test('capa de auditoría carga al final de los estilos V4', () => {
  const auditIndex=base.indexOf('/orbita-v3-audit.css');
  for(const token of ['/orbita-v3-internal.css','/orbita-v3-hybrid.css','/orbita-v3-experience.css','/orbita-v3-glossary.css','/orbita-v3-visuals.css']) assert.ok(base.indexOf(token)<auditIndex);
});

test('el shell sale del build con el nombre Letra grande, sin depender del runtime', () => {
  assert.match(inject, />Letra grande<\/button>/);
  assert.match(inject, /title="Letra grande desactivada"/);
  assert.match(inject, /<span>Letra grande<\/span>/);
  assert.doesNotMatch(inject, />Modo fácil<\/button>/);
});
