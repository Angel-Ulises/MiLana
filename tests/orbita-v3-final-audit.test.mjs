import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const inject=readFileSync('scripts/aplicar-orbita-base.mjs','utf8');
const prepaint=readFileSync('public/orbita-v3-prepaint.css','utf8');
const audit=readFileSync('public/orbita-v3-audit.css','utf8');
const internal=readFileSync('public/orbita-v3-internal.js','utf8');
const glossary=readFileSync('public/orbita-v3-glossary.js','utf8');
const visuals=readFileSync('public/orbita-v3-visuals.js','utf8');

test('reservas críticas existen en HTML antes del runtime y conservan altura final',()=>{
  assert.match(inject,/orbita-v3-prepaint\.css/);
  assert.match(inject,/data-orbita-static-reserve data-orbita-glossary-reserve/);
  assert.match(inject,/data-orbita-static-reserve data-orbita-visual-reserve/);
  assert.match(prepaint,/data-orbita-section="estados"[^\n]*min-height:930px/);
  assert.match(prepaint,/data-orbita-section="finanzas"[^\n]*min-height:670px/);
  assert.match(prepaint,/data-orbita-section="economia"[^\n]*min-height:540px/);
  assert.match(prepaint,/\.orb-glossary-reserve,\.orb-glossary\{min-height:220px\}/);
});

test('espacios de publicidad son contenedores vacíos y no inicializan AdSense',()=>{
  for(const size of ['970x90','336x280','300x600','320x50']) assert.ok(inject.includes(`data-ad-size="${size}"`));
  assert.match(inject,/data-orbita-ad-reserve/);
  const adMarkup=inject.match(/const markup='([^']*data-orbita-ad-reserve[^']*)';/)?.[1] || '';
  assert.ok(adMarkup, 'no se encontró el markup publicitario inyectado');
  assert.doesNotMatch(adMarkup,/adsbygoogle|data-ad-client|\.push\(/i);
});

test('calculadoras ocultan intro repetido y vuelven al paso que falló',()=>{
  assert.match(internal,/introDuplicatesHero/);
  assert.match(internal,/introRepeatsHero = introDuplicatesHero\(intro\)/);
  assert.match(internal,/recoverValidationStep/);
  assert.match(internal,/addEventListener\('invalid',[\s\S]*step = index/);
  assert.match(internal,/errorText\.includes\('salario minimo'\)/);
  assert.match(internal,/errorText\.includes\('vacaciones'\) && errorText\.includes\('anuales'\)/);
  assert.match(prepaint,/\.calculator-hero-media\{display:none!important\}/);
  assert.match(prepaint,/\.calculator-purpose\{[^}]*-webkit-line-clamp:1/);
  assert.match(prepaint,/\.calculator-main::before\{[^}]*height:131px/);
});

test('Palabras claras queda después de búsqueda en Inicio y después del formulario en calculadoras',()=>{
  assert.match(glossary,/const search = main\.querySelector\('\.orb-home-search'\)/);
  assert.match(glossary,/const anchor = search \|\| routes/);
  assert.match(glossary,/root\.dataset\.orbitaSection === 'calculadoras'/);
  assert.match(glossary,/form\.insertAdjacentElement\('afterend', strip\)/);
});

test('Economía deduplica por valor y fuente con etiquetas legibles',()=>{
  assert.match(visuals,/const key = `\$\{value\}\|\$\{source\}`/);
  assert.match(visuals,/Tasa objetivo Banxico/);
  assert.match(visuals,/Inflación anual INEGI/);
  assert.match(visuals,/Consumo privado INEGI/);
  assert.doesNotMatch(visuals,/slice\(-40\)/);
});

test('Ahorro grafica solo datos capturados y el tiempo que ya calculó la página',()=>{
  assert.match(visuals,/\/finanzas\/ahorro/);
  assert.match(visuals,/fieldValue\('Meta total'\)/);
  assert.match(visuals,/fieldValue\('Ahorro actual'\)/);
  assert.match(visuals,/fieldValue\('Aportación mensual'\)/);
  assert.match(visuals,/savingsMonths\(\)/);
  assert.match(visuals,/no agrega intereses ni rendimientos/);
  assert.doesNotMatch(visuals,/tasa\s*=|interes\s*=|rendimiento\s*=/i);
});
