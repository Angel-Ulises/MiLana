import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base=readFileSync('public/orbita-v3-base.js','utf8');
const audit=readFileSync('public/orbita-v3-audit.css','utf8');
const glossary=readFileSync('public/orbita-v3-glossary.js','utf8');
const visuals=readFileSync('public/orbita-v3-visuals.js','utf8');

test('la corrección de foto de Inicio neutraliza el absolute heredado y abre la columna de copy',()=>{
  assert.match(audit,/\.hero-media img\{position:relative!important;inset:auto!important;height:auto!important/);
  assert.match(audit,/overflow-x:clip/);
  assert.match(audit,/\.hero-media::before,[\s\S]*\.hero-media::after\{display:none!important\}/);
  assert.match(audit,/\.hero-copy\{width:100%!important;min-width:0!important\}/);
});

test('contraste oscuro no hereda el gris global',()=>{
  for(const token of ['.ml-money-head','.ml-money-card','.trust-points','.career-money-bridge-inner','.finance-advisor-preview','.footer-inner','.state-occupations-guardrails','.state-meaning-grid','.state-checks']) assert.ok(audit.includes(token));
  assert.match(audit,/color:#DCE6EF!important/);
  assert.match(audit,/\.ml-money-card h3\{color:#F4F7FC!important\}/);
  assert.match(audit,/\.finance-next-box>span\{color:#245C93!important\}/);
  assert.match(audit,/\.career-question-grid span\{color:#4D6478!important\}/);
  assert.match(audit,/\.feature-card \.card-tag\{color:#455A6D!important\}/);
  assert.match(audit,/\.state-compare-entry>span\{color:#53616D!important\}/);
  assert.match(audit,/data-orbita-section="estados"\] \.footer-inner :is\(p,li,small,figcaption\)\{color:#DCE6EF!important\}/);
});

test('reservas de runtime conservan fallback antes de cargar glosario y visuales',()=>{
  assert.match(base,/reserveRuntimeSurfaces\(\);\n  ensureInternalLayer\(\);/);
  assert.match(base,/data-orbita-visual-reserve/);
  assert.match(base,/data-orbita-glossary-reserve/);
  assert.ok(base.indexOf('/orbita-v3-experience.js') < base.indexOf('/orbita-v3-glossary.js'));
  assert.match(audit,/\.orb-glossary-reserve\{min-height:180px\}/);
  assert.match(audit,/\.orb-visual-reserve\{min-height:360px\}/);
  assert.match(audit,/data-orbita-section="estados"\] \.orb-visual-reserve\{min-height:930px\}/);
  assert.match(audit,/data-orbita-section="finanzas"\] \.orb-visual-reserve\{min-height:670px\}/);
});

test('Palabras claras en Inicio tiene una regla de colocación explícita',()=>{
  assert.match(glossary,/orb-glossary-home/);
});

test('Finanzas usa etapas con degradado y Economía no conecta porcentajes sin relación',()=>{
  assert.match(visuals,/orb-projection-stage/);
  assert.match(audit,/\.orb-projection-stage[\s\S]*linear-gradient/);
  assert.match(visuals,/orb-economy-bars/);
  assert.match(visuals,/Cada barra es un dato independiente/);
  assert.doesNotMatch(visuals,/createElementNS\(|<polyline|setAttribute\('points'/);
  assert.match(audit,/\.orb-economy-bar-fill[\s\S]*linear-gradient/);
});

test('Economía adopta hero claro y Estados separa breadcrumb de eyebrow',()=>{
  assert.match(audit,/data-orbita-section="economia"[^\n]*\.economy-hero\{background:linear-gradient\(145deg,#FFFDF8/);
  assert.match(audit,/data-orbita-section="estados"[\s\S]*nav~\.eyebrow\{margin-top:18px!important\}/);
});

test('calculadoras móviles compactan hero sin tocar Pensión',()=>{
  assert.match(audit,/data-orbita-section="calculadoras"\]:not\(\[data-orbita-protected="pension"\]\) \.calculator-hero-media\{max-height:150px!important\}/);
  assert.match(audit,/\.calculator-main\{padding-top:6px!important\}/);
});

test('se definen contenedores publicitarios vacíos sin inicializar AdSense',()=>{
  for(const token of ['.orb-ad-leaderboard','.orb-ad-rectangle','.orb-ad-rail','.orb-ad-mobile-banner']) assert.ok(audit.includes(token));
  assert.match(audit,/\.orb-ad-leaderboard\{width:min\(970px,100%\);min-height:90px\}/);
  assert.match(audit,/\.orb-ad-rectangle\{width:min\(336px,100%\);min-height:280px\}/);
  assert.match(audit,/\.orb-ad-rail\{width:min\(300px,100%\);min-height:600px\}/);
  assert.match(audit,/\.orb-ad-mobile-banner\{display:none;width:min\(320px,100%\);min-height:50px\}/);
  assert.doesNotMatch(audit,/push\(|adsbygoogle\s*=|data-ad-client/);
});
