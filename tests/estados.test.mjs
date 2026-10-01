import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const datos = JSON.parse(readFileSync('src/data/estados.json','utf8'));
const pagina = readFileSync('src/statePages.jsx','utf8');
const generador = readFileSync('scripts/generar-estados.mjs','utf8');
const sitemap = readFileSync('scripts/generar-sitemap-final.mjs','utf8');

test('hay exactamente 32 entidades con slugs únicos y métricas positivas', () => {
  assert.equal(datos.estados.length, 32);
  assert.equal(new Set(datos.estados.map((e) => e.slug)).size, 32);
  for (const e of datos.estados) {
    assert.ok(e.estado.length > 2);
    assert.ok(e.ingreso > 0);
    assert.ok(e.ocupados > 0);
  }
});

test('el corte estatal y el promedio nacional están declarados', () => {
  assert.equal(datos.actualizado, '2026-T2');
  assert.equal(datos.promedioNacional, 19494);
  assert.match(datos.fuente.nombre, /Observatorio Laboral/);
  assert.match(datos.fuente.instituciones, /STPS/);
  assert.match(datos.fuente.instituciones, /INEGI/);
  assert.match(datos.nota, /costo de vida/i);
});

test('la UI estatal distingue promedios, vacantes y costo de vida', () => {
  assert.match(pagina, /no mide renta, transporte, informalidad o costo de vida/i);
  assert.match(pagina, /no vacantes abiertas/i);
  assert.match(pagina, /No lo publicamos hasta tener una fuente oficial con ese cruce/i);
});

test('cada estado recibe HTML estático, canonical y sitemap', () => {
  assert.match(generador, /datos\.estados\.forEach\(construirEstado\)/);
  assert.match(generador, /rel="canonical"/);
  assert.match(generador, /BreadcrumbList/);
  assert.match(sitemap, /\/estados/);
  assert.match(sitemap, /estados\.map\(e => `\/estados\/\$\{e\.slug\}`\)/);
});
