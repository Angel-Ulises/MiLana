import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const js=readFileSync('public/orbita-v3-glossary.js','utf8');
const css=readFileSync('public/orbita-v3-glossary.css','utf8');
test('Cada término aparece con lenguaje sencillo y explicación más profunda bajo demanda',()=>{
 for(const term of ['ISR','UMA','CETES','ETF','LIQUIDEZ','DIVERSIFICACIÓN','VOLATILIDAD','SPREAD','RENDIMIENTO','INFLACIÓN','COMISIÓN','CAT','RESICO','PTU','SBC','IMSS','LFT']){
  assert.ok(js.includes(term+':'),term);
 }
 assert.match(js,/const BASICS =/);
 assert.match(js,/BASICS\[term\] \|\| TERMS\[term\]/);
 assert.match(js,/class="orb-glossary-deeper"/);
 assert.match(js,/>Profundizar<\/summary>/);
 assert.match(css,/\.orb-glossary-deeper>summary:focus-visible/);
 assert.match(js,/detected\.slice\(0, 3\)/);
});
test('Solo lee el nivel elegido en esta pestaña y no altera explicaciones oficiales',()=>{
 assert.match(js,/sessionStorage\.getItem\('ml-lectura-v1'\) === 'experto'/);
 assert.doesNotMatch(js,/sessionStorage\.setItem|localStorage\.setItem|fetch\(|XMLHttpRequest|sendBeacon/);
 assert.match(js,/pension-imss/);
 assert.match(js,/if \(!main \|\| main\.hasAttribute\('data-static-seo'\)\) return/);
});