import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const finance=readFileSync('src/financePages.jsx','utf8');
const advisor=readFileSync('src/advisorPage.jsx','utf8');
const css=readFileSync('src/finance-tool-first.css','utf8');
const main=readFileSync('src/main.jsx','utf8');

test('cuatro herramientas de Finanzas empiezan en formularios identificables, hub mantiene foto',()=>{
  assert.equal((finance.match(/<Hero tool eyebrow="Herramienta ·/g)||[]).length,4);
  assert.equal((finance.match(/className="finance-tool-section" id="mis-numeros"/g)||[]).length,4);
  assert.match(finance,/href="#mis-numeros"/);
  assert.match(finance,/tool \? 'lazy' : 'eager'/);
  assert.match(finance,/className={`finance-page-hero\$\{tool \? ' finance-page-hero-tool'/);
  assert.match(finance,/<Hero compact eyebrow="Finanzas personales/);
  assert.doesNotMatch(finance,/<Hero compact tool eyebrow=/);
});

test('asesor ofrece entrada al análisis y un menú coherente',()=>{
  assert.match(advisor,/href="#mi-situacion-datos"/);
  assert.match(advisor,/<form className="advisor-form" id="mi-situacion-datos"/);
  assert.match(advisor,/<SiteHeader ctaHref="\/finanzas\/presupuesto"/);
  assert.match(readFileSync('src/lib/siteNavigation.js','utf8'),/\['aprende', '\/aprende', 'Aprende'\]/);
});

test('estilos reducen pantalla introductoria solo en herramientas y móvil',()=>{
  assert.match(main,/finance-tool-first\.css/);
  assert.match(css,/\.finance-page-hero-tool \.finance-page-photo\{display:none!important\}/);
  assert.match(css,/@media\(max-width:900px\)/);
  assert.match(css,/@media\(max-width:640px\)/);
  assert.match(css,/\.finance-page-hero-tool/);
  assert.match(css,/\.advisor-hero/);
  assert.match(css,/focus-visible/);
  assert.match(css,/scroll-margin-top:20px/);
  assert.doesNotMatch(css,/:has\(\.ml-result\)|\.calculator-hero|display:none!important;.*\.finance-page-photo\{display:none/);
});
