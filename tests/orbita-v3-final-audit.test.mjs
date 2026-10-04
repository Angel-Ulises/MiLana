import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const inject=readFileSync('scripts/aplicar-orbita-base.mjs','utf8');
const prepaint=readFileSync('public/orbita-v3-prepaint.css','utf8');
const audit=readFileSync('public/orbita-v3-audit.css','utf8');
const internal=readFileSync('public/orbita-v3-internal.js','utf8');
const glossary=readFileSync('public/orbita-v3-glossary.js','utf8');
const visuals=readFileSync('public/orbita-v3-visuals.js','utf8');
const reserveVerifier=readFileSync('scripts/verificar-reservas.mjs','utf8');

test('reservas críticas existen en HTML antes del runtime y conservan altura final',()=>{
  assert.match(inject,/orbita-v3-prepaint\.css/);
  assert.match(inject,/data-orbita-static-reserve data-orbita-glossary-reserve/);
  assert.match(inject,/data-orbita-static-reserve data-orbita-visual-reserve/);
  assert.match(prepaint,/data-orbita-section="estados"[^\n]*min-height:var\(--orb-reserve-m,330px\)/);
  assert.match(prepaint,/data-orbita-section="finanzas"[^\n]*min-height:var\(--orb-reserve-m,670px\)/);
  assert.match(prepaint,/data-orbita-section="economia"[^\n]*min-height:var\(--orb-reserve-m,455px\)/);
  assert.match(prepaint,/\.orb-glossary-reserve\{min-height:var\(--orb-glossary-reserve-m,178px\)!important\}/);
  assert.match(prepaint,/\.orb-visual-reserve\{min-height:var\(--orb-reserve-m,420px\)!important\}/);
  assert.match(prepaint,/data-orbita-section="estados"[^\n]*\.orb-visual-reserve\{min-height:var\(--orb-reserve-m,330px\)!important/);
  assert.match(prepaint,/data-orbita-section="finanzas"[^\n]*\.orb-visual-reserve\{min-height:var\(--orb-reserve-m,670px\)!important/);
  assert.doesNotMatch(prepaint,/\.orb-section-visual\{[^}]*!important/);
  assert.match(reserveVerifier,/visual\.style\.minHeight = '0px'/);
  assert.doesNotMatch(prepaint,/\.orb-glossary-reserve,\.orb-glossary\{min-height/);
});

test('Órbita ya no inyecta contenedores publicitarios vacíos',()=>{
  assert.doesNotMatch(inject,/data-ad-size=|orb-ad-leaderboard|orb-ad-rectangle|orb-ad-rail|orb-ad-mobile-banner/);
  assert.doesNotMatch(inject,/const markup='[^']*data-orbita-ad-reserve/);
});

test('calculadoras ocultan intro repetido y vuelven al paso que falló',()=>{
  assert.match(internal,/introDuplicatesHero/);
  assert.match(internal,/introRepeatsHero = introDuplicatesHero\(intro\)/);
  assert.match(internal,/recoverValidationStep/);
  assert.match(internal,/addEventListener\('invalid',[\s\S]*step = index/);
  assert.match(internal,/errorText\.includes\('salario minimo'\)/);
  assert.match(internal,/errorText\.includes\('vacaciones'\) && errorText\.includes\('anuales'\)/);
  assert.match(prepaint,/\.calculator-hero-media\{display:none!important\}/);
  assert.match(prepaint,/\.calculator-purpose\{[^}]*-webkit-line-clamp:2/);
  assert.match(prepaint,/\.orb-purpose-ready[^\n]*\.calculator-purpose\{[^}]*-webkit-line-clamp:unset!important/);
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
