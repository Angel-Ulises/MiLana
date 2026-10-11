import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CALCULADORAS_HUB, GRUPOS_HUB, SELECTOR_HUB } from '../src/lib/calculatorsHub.js';
import { esRutaCalculadorasHub } from '../src/lib/routeMatcher.js';

const paginas = JSON.parse(readFileSync('src/data/paginas.json', 'utf8')).paginas;
const slugs = new Set(paginas.map((p) => p.slug));

test('/calculadoras enlaza exactamente las diez calculadoras existentes', () => {
  const ids = Object.keys(CALCULADORAS_HUB);
  assert.equal(ids.length, paginas.length);
  for (const [id, c] of Object.entries(CALCULADORAS_HUB)) {
    assert.match(c.href, /^\/calculadoras\/[a-z0-9-]+$/, id);
    assert.ok(slugs.has(c.href.split('/').pop()), `${id} apunta a una calculadora real`);
    assert.ok(c.usala.length > 20 && c.usala.length < 120, `${id}: «úsala si» breve`);
  }
  const agrupadas = GRUPOS_HUB.flatMap((g) => g.ids);
  assert.deepEqual([...agrupadas].sort(), [...ids].sort(), 'cada calculadora aparece en un solo grupo');
});

test('el selector termina siempre en una calculadora existente con su motivo', () => {
  for (const tema of SELECTOR_HUB) {
    assert.ok(tema.opciones.length >= 2 && tema.opciones.length <= 3, tema.id);
    for (const o of tema.opciones) {
      assert.ok(CALCULADORAS_HUB[o.calc], `${tema.id}/${o.texto}`);
      assert.ok(o.porque.length > 20, `${o.texto}: explica por qué`);
    }
  }
});

test('las guías enlazadas existen y la página no calcula ni guarda datos', () => {
  const sitemap = readFileSync('scripts/generar-sitemap-final.mjs', 'utf8');
  for (const g of GRUPOS_HUB) assert.ok(sitemap.includes(`'${g.aprende.href}'`), g.aprende.href);
  assert.ok(sitemap.includes("'/calculadoras'"));
  const page = readFileSync('src/calculatorsHubPage.jsx', 'utf8');
  assert.doesNotMatch(page, /localStorage|sessionStorage|fetch\(|<input/);
  assert.match(page, /aria-live="polite"/);
  assert.ok(esRutaCalculadorasHub('/calculadoras'));
  assert.ok(esRutaCalculadorasHub('/calculadoras/'));
  assert.ok(!esRutaCalculadorasHub('/calculadoras/isr'));
});
