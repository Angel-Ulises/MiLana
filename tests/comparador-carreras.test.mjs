import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const page=fs.readFileSync(new URL('../src/careerComparePage.jsx',import.meta.url),'utf8');
const entry=fs.readFileSync(new URL('../src/occupationEntry.jsx',import.meta.url),'utf8');
const generator=fs.readFileSync(new URL('../scripts/generar-comparador-carreras.mjs',import.meta.url),'utf8');
const sitemap=fs.readFileSync(new URL('../scripts/generar-sitemap-final.mjs',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));

test('comparador se enruta antes de la ruta genérica de carreras',()=>{
  assert.match(main,/const compararCarreras = esRutaCompararCarreras\(\)/);
  assert.ok(main.indexOf('compararCarreras ?') < main.indexOf('carrera ?'));
  assert.match(page,/\/carreras\\\/comparar/);
});

test('compara métricas homogéneas sin declarar ganador',()=>{
  assert.match(page,/mismo corte del Observatorio Laboral con ENOE 2026-T2/i);
  assert.match(page,/Diferencia entre promedios de ingreso/);
  assert.match(page,/Diferencia en población profesional ocupada/);
  assert.match(page,/no deciden por ti/i);
  assert.doesNotMatch(page,/ganador|mejor opción|te conviene|deberías elegir/i);
});

test('entrada en Carreras expone comparar como ruta 06',()=>{
  assert.match(entry,/href="\/carreras\/comparar"/);
  assert.match(entry,/>06</);
});

test('build y SEO estático incluyen comparador',()=>{
  assert.match(pkg.scripts.build,/node scripts\/generar-comparador-carreras\.mjs/);
  assert.match(generator,/https:\/\/www\.milanaaqui\.mx\/carreras\/comparar/);
  assert.match(generator,/WebApplication/);
  assert.match(generator,/MiLana no declara una carrera ganadora/);
  assert.match(sitemap,/'\/carreras\/comparar'/);
});
