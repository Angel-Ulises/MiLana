import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main = fs.readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
const page = fs.readFileSync(new URL('../src/occupationComparePage.jsx', import.meta.url), 'utf8');
const entry = fs.readFileSync(new URL('../src/occupationEntry.jsx', import.meta.url), 'utf8');
const generator = fs.readFileSync(new URL('../scripts/generar-ocupaciones.mjs', import.meta.url), 'utf8');
const sitemap = fs.readFileSync(new URL('../scripts/generar-sitemap-final.mjs', import.meta.url), 'utf8');
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const ocupaciones = JSON.parse(fs.readFileSync(new URL('../src/data/ocupaciones.json', import.meta.url), 'utf8'));
const profesiones = JSON.parse(fs.readFileSync(new URL('../src/data/profesiones.json', import.meta.url), 'utf8'));

test('cada ocupación se enlaza a una carrera existente sin tratarlas como equivalentes', () => {
  const slugsCarrera = new Set(profesiones.profesiones.map((p) => p.slug));
  assert.ok(ocupaciones.ocupaciones.length >= 7);
  for (const o of ocupaciones.ocupaciones) {
    assert.ok(slugsCarrera.has(o.carreraRelacionadaSlug), `${o.slug} debe enlazar a una carrera existente`);
    assert.equal(o.precisionSalarial, 'baja');
  }
  assert.ok(ocupaciones.reglasEditoriales.some((r) => /No calcular una brecha salarial/i.test(r)));
});

test('ruta de ocupaciones tiene prioridad sobre la ruta genérica de carreras', () => {
  assert.match(main, /const ocupaciones = esRutaOcupaciones\(\)/);
  assert.ok(main.indexOf('ocupaciones ?') < main.indexOf('carrera ?'));
  assert.match(page, /\/carreras\\\/ocupaciones/);
});

test('UI mantiene visibles fuente, periodos e incertidumbre', () => {
  assert.match(page, /OLA · 2026-T2/);
  assert.match(page, /Data México/);
  assert.match(page, /baja precisión estadística/i);
  assert.match(page, /No calculamos una “brecha salarial”/);
  assert.doesNotMatch(page, /mejor carrera|peor carrera|conviene más/i);
});

test('hub, build, HTML estático y sitemap descubren ocupaciones', () => {
  assert.match(entry, /href="\/carreras\/ocupaciones"/);
  assert.match(pkg.scripts.build, /node scripts\/generar-ocupaciones\.mjs/);
  assert.ok(pkg.scripts.build.indexOf('generar-carreras.mjs') < pkg.scripts.build.indexOf('generar-ocupaciones.mjs'));
  assert.match(generator, /href=\"\/carreras\/ocupaciones\"/);
  assert.match(generator, /carreras','ocupaciones','index\.html/);
  assert.match(sitemap, /'\/carreras\/ocupaciones'/);
});
