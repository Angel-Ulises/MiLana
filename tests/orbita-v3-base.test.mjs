import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const economy=readFileSync('src/economyNavigation.jsx','utf8');
const vercel=JSON.parse(readFileSync('vercel.json','utf8'));
const css=readFileSync('public/orbita-v3-base.css','utf8');
const js=readFileSync('public/orbita-v3-base.js','utf8');
const inject=readFileSync('scripts/aplicar-orbita-base.mjs','utf8');
const pkg=JSON.parse(readFileSync('package.json','utf8'));

test('economyNavigation no reescribe la nota si ya coincide',()=>{
  assert.match(economy,/const TEXT = 'Radar activo/);
  assert.match(economy,/if \(nota && nota\.textContent !== TEXT\) nota\.textContent = TEXT;/);
});
test('assets de Vercel quedan immutable por un año',()=>{
  const rule=vercel.headers.find(x=>x.source==='/assets/(.*)');
  assert.ok(rule);
  assert.deepEqual(rule.headers,[{key:'Cache-Control',value:'public, max-age=31536000, immutable'}]);
});
test('base Órbita usa tokens aprobados y targets de 48px',()=>{
  for(const token of ['#060A13','#0E1524','#162036','#F4F7FC','#B7C3D6','#2D6CAA','#9B8CFF','#2EC4B6','#5DD39E','#F4B942','#FF8A65']) assert.match(css,new RegExp(token,'i'));
  assert.match(css,/height:66px/);
  assert.match(css,/min-height:48px/);
  assert.match(css,/@media\(min-width:1100px\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});
test('marco excluye widgets y embed antes del render',()=>{
  assert.match(inject,/p==='\/widgets'/);
  assert.match(inject,/get\('embed'\)==='1'/);
  assert.match(inject,/ml-orbita-skip/);
  assert.match(css,/html\.ml-orbita-skip \.ml-orbita-shell\{display:none\}/);
});
test('menú responsive, Modo fácil y búsqueda son accesibles',()=>{
  assert.match(js,/aria-expanded/);
  assert.match(js,/ml-orbita-easy/);
  assert.match(js,/localStorage\.setItem\('ml-orbita-easy'/);
  assert.match(js,/showModal\(\)/);
  assert.match(inject,/aria-label="Menú"/);
  assert.match(inject,/aria-label="Buscar"/);
});
test('build aplica Órbita antes de normalizar y verificar',()=>{
  const b=pkg.scripts.build;
  assert.ok(b.indexOf('aplicar-orbita-base.mjs')>b.indexOf('inyectar-analytics-estaticos.mjs'));
  assert.ok(b.indexOf('aplicar-orbita-base.mjs')<b.indexOf('normalizar-urls-estaticas.mjs'));
});
test('etapa 1 no reutiliza productShell',()=>{
  assert.doesNotMatch(css,/product-shell/i);
  assert.doesNotMatch(inject,/product-shell/i);
});
