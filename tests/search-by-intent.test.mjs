import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SEARCH_INTENTS, SEARCH_FEATURED, matchesSearch, normalizeSearch } from '../src/lib/searchIntent.js';

test('Búsqueda entiende frases comunes sin exigir vocabulario técnico', () => {
  for (const [query, href] of [
    ['me despidieron','/calculadoras/liquidacion'],
    ['¿Me corrieron del trabajo?','/calculadoras/liquidacion'],
    ['¿cuánto me queda de sueldo?','/calculadoras/bruto-a-neto'],
    ['quiero empezar a invertir','/invertir'],
    ['qué carrera estudiar','/carreras/comparar'],
    ['¿dónde vivir?','/estados/comparar'],
    ['no me alcanza','/finanzas/presupuesto'],
    ['préstamo del gobierno CETES','/finanzas/inversion/cetes'],
    ['cómo ahorrar','/finanzas/ahorro'],
  ]) assert.equal(matchesSearch('', SEARCH_INTENTS[href], query), true, href + ': ' + query);
  assert.equal(normalizeSearch('  ¿Cómo es EL ISR? '),'como es el isr');
});

test('Sugerencias son locales y no usan servicios externos', () => {
  assert.equal(SEARCH_FEATURED.length, 6);
  for (const href of SEARCH_FEATURED) {
    assert.ok(href.startsWith('/') && !href.startsWith('//'));
    assert.equal(href.includes('?') || href.includes('#') || href.includes('https:'), false);
  }
  const script = readFileSync('scripts/aplicar-orbita-base.mjs', 'utf8');
  const ui = readFileSync('public/orbita-v3-base.js', 'utf8');
  for (const token of ['data-search-aliases=', 'data-search-featured=', 'Buscar por problema, tema o herramienta']) assert.ok(script.includes(token), token);
  for (const token of ['searchCount.textContent','visible.length < 10','item.dataset.searchAliases','if (searchEmpty) searchEmpty.hidden = visible.length !== 0']) assert.ok(ui.includes(token), token);
  for (const token of ['fetch(', 'XMLHttpRequest', 'sendBeacon']) assert.ok(!ui.includes(token), token);
});