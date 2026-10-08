import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('Invertir mantiene texto claro sobre fondos oscuros frente a estilos globales',()=>{
 const css=readFileSync('src/invertir-home.css','utf8');
 assert.match(css,/html\.ml-orbita-enabled #root \.ml-invertir \.ml-inv-hero-actions a:first-child[^\n]*\{color:#fff!important\}/);
 assert.match(css,/\.ml-invertir \.ml-inv-boundary p\{color:#dfebf3!important\}/);
 assert.match(css,/\.ml-invertir \.ml-inv-boundary \.ml-inv-more p\{color:#e2f1fa!important\}/);
});