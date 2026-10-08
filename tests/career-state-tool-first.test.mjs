import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const careers=readFileSync('src/careerPages.jsx','utf8');
const states=readFileSync('src/statePages.jsx','utf8');
const cCompare=readFileSync('src/careerComparePage.jsx','utf8');
const sCompare=readFileSync('src/stateComparePage.jsx','utf8');
const css=readFileSync('src/career-state-tool-first.css','utf8');
const main=readFileSync('src/main.jsx','utf8');

test('las cuatro páginas de rankings llevan directo a los datos, conservando contenido y fuentes',()=>{
  assert.equal((careers.match(/<Hero tool eyebrow=/g)||[]).length,4);
  assert.equal((careers.match(/id="datos-carreras"/g)||[]).length,4);
  assert.match(careers,/href="#datos-carreras"/);
  assert.match(careers,/<Hero compact eyebrow="Carreras · Trabajo · Dinero"/);
  assert.match(careers,/<Fuente \/>/);
  assert.match(css,/\.career-hero-tool \.career-hero-media\{display:none!important\}/);
  assert.match(css,/\.career-hero-compact \.career-hero-media\{min-height:140px/);
});

test('comparadores de carreras y estados presentan los selectores sin inventar medidas',()=>{
  for(const source of [cCompare,sCompare]){
    assert.match(source,/href="#comparar"/);
    assert.match(source,/className="(cc|sc)-tool" id="comparar"/);
    assert.match(source,/<select value=\{a\}/);
    assert.match(source,/<select value=\{b\}/);
    assert.match(source,/href="\/finanzas">Finanzas/);
    assert.match(source,/href="\/carreras">Carreras/);
    assert.doesNotMatch(source,/setTimeout|sessionStorage|localStorage/);
  }
  assert.match(css,/\.cc-hero/);
  assert.match(css,/\.sc-hero/);
});

test('Estados conserva 32 fichas indexables con entrada compacta y comparador directo',()=>{
  assert.match(states,/className="ml-state-directory-more"/);
  assert.match(states,/Ver las 32 fichas estatales/);
  assert.match(states,/className="state-grid">\{orden\.map/);
  assert.match(states,/href="\/estados\/comparar"/);
  assert.match(states,/className="state-selector"/);
  assert.match(css,/\.ml-state-directory-more summary:focus-visible/);
  assert.match(css,/\.state-hero/);
  assert.match(main,/career-state-tool-first\.css/);
  assert.match(css,/@media\(max-width:640px\)/);
  assert.match(css,/prefers-reduced-motion/);
});
