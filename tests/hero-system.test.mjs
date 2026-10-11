import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('public/orbita-v3-audit.css', 'utf8');

test('todas las secciones comparten tipografía, peso y color de título', () => {
  for (const hero of ['.ml-hub-hero', '.finance-page-hero', '.ml-inv-hero', '.career-hero', '.state-hero', '.economy-hero', '.hubhead', '.profession-hero', '.advisor-hero']) assert.ok(css.includes(hero), hero);
  assert.match(css, /h1\{font-family:"Newsreader",Georgia,serif!important;font-weight:600!important;color:#13263B!important/);
  assert.match(css, /h1\{font-size:36px!important\}/);
  assert.match(css, /h1\{font-size:31px!important\}/);
  assert.match(css, /clamp\(40px,4\.2vw,56px\)/);
});

test('Economía muestra la ruta como el resto de secciones', () => {
  assert.match(readFileSync('src/economyPages.jsx', 'utf8'), /className="economy-breadcrumb" aria-label="Ruta"><a href="\/">Inicio<\/a>/);
});
