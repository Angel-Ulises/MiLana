import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = p => readFileSync(p,'utf8');
test('home shortcuts provide direct tools and editorial destinations',()=>{
 const app=read('src/App.jsx');
 assert.match(app,/className="ml-home-shortcuts" aria-label="Accesos principales"/);
 assert.match(app,/href="#calculadoras">Usar una calculadora/);
 assert.match(app,/href="\/economia">Leer el Radar económico/);
});
test('tools precede the existing financial editorial expansion',()=>{
 assert.match(read('src/financeExpansion.jsx'),/querySelector\('main \.calculators'\)/);
});
test('premium refinement is bundled and scoped away from calculator pages',()=>{
 assert.match(read('scripts/aplicar-orbita-base.mjs'),/'orbita-v3-movil.css','premium-home.css'/);
 const css=read('public/premium-home.css');
 assert.match(css,/data-orbita-section="inicio"/);
 assert.doesNotMatch(css,/pension|adsbygoogle|calculator-main/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/prefers-reduced-motion/);
});
test('hub shortcuts use distinct finance and editorial journeys with valid anchors',()=>{
 const finance=read('src/financePages.jsx'), economy=read('src/economyPages.jsx');
 assert.match(finance,/href="#rutas-financieras"/);
 assert.match(finance,/id="rutas-financieras"/);
 assert.match(finance,/Ordenar mi presupuesto/);
 for(const id of ['radar','fuentes-radar']) {
  assert.ok(economy.includes(`href="#${id}"`));
  assert.ok(economy.includes(`id="${id}"`));
 }
});

test('review keeps PR94 hero reservations and a contained mobile photograph',()=>{
 const css=read('public/premium-home.css');
 assert.doesNotMatch(css,/min-height:0!important/);
 assert.doesNotMatch(css,/display:none/);
 assert.match(css,/hero-media-wrap \{display:block!important/);
 assert.match(css,/object-fit:contain!important/);
 const prepaint=read('public/orbita-v3-prepaint.css');
 assert.match(prepaint,/min-height:1104px!important/);
 assert.match(prepaint,/min-height:1280px!important/);
});
