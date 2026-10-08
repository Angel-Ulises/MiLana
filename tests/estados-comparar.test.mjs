import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const estados = JSON.parse(readFileSync('src/data/estados.json','utf8'));
const laboral = JSON.parse(readFileSync('src/data/mercadoLaboralEstados.json','utf8'));
const vivienda = JSON.parse(readFileSync('src/data/viviendaEstados.json','utf8'));
const pagina = readFileSync('src/stateComparePage.jsx','utf8');
const entrada = readFileSync('src/stateCompareEntry.jsx','utf8');
const main = readFileSync('src/main.jsx','utf8');
const generador = readFileSync('scripts/generar-comparador-estados.mjs','utf8');
const sitemap = readFileSync('scripts/generar-sitemap-final.mjs','utf8');
const pkg = JSON.parse(readFileSync('package.json','utf8'));

test('las tres fuentes del comparador cubren los mismos 32 estados', () => {
  const base = new Set(estados.estados.map(e => e.slug));
  assert.equal(base.size, 32);
  assert.deepEqual(new Set(laboral.estados.map(e => e.slug)), base);
  assert.deepEqual(new Set(vivienda.estados.map(e => e.slug)), base);
});

test('ruta comparar estados tiene prioridad sobre la ruta estatal genérica', () => {
  assert.match(pagina, /\/estados\\\/comparar/);
  const compareIndex = main.indexOf(': compararEstados ?');
  const stateIndex = main.indexOf(': estados ?');
  assert.ok(compareIndex > -1, 'falta rama compararEstados');
  assert.ok(stateIndex > -1, 'falta rama estados');
  assert.ok(compareIndex < stateIndex, 'compararEstados debe evaluarse antes de estados');
});

test('comparador muestra métricas homogéneas y no fabrica un ganador', () => {
  assert.match(pagina, /Ingreso profesional promedio mensual/);
  assert.match(pagina, /Desocupación/);
  assert.match(pagina, /Informalidad laboral/);
  assert.match(pagina, /Mediana de avalúo/);
  assert.match(pagina, /Apreciación interanual 2026-II/);
  assert.match(pagina, /sin declarar ganador/i);
  assert.match(pagina, /no las combina en un puntaje/i);
  assert.doesNotMatch(pagina, /ganador:\s*|mejor estado|peor estado|score|puntaje total/i);
});

test('no mezcla vivienda SHF con ingreso OLA para fingir asequibilidad', () => {
  assert.match(pagina, /Precio de vivienda ÷ sueldo profesional/);
  assert.match(pagina, /poblaciones diferentes/i);
  assert.match(pagina, /precisión engañosa/i);
  assert.doesNotMatch(pagina, /mediana\s*\/\s*ea\.ingreso|mediana\s*\/\s*eb\.ingreso|ingreso\s*\/\s*mediana/i);
  assert.match(generador, /no divide precio de vivienda entre ingreso profesional/i);
});

test('comparador es descubrible, estático y usa una sola URL canónica', () => {
  // El acceso puede llevar el slug público actual, pero conserva el destino canónico.
  assert.match(entrada, /href=\{href\}/);
  assert.match(entrada, /enlaceComparacion\('estado', slug, estados\.estados\)/);
  assert.match(generador, /https:\/\/www\.milanaaqui\.mx\/estados\/comparar/);
  assert.match(generador, /rel="canonical"/);
  assert.match(generador, /BreadcrumbList/);
  assert.match(generador, /WebApplication/);
  assert.match(sitemap, /'\/estados\/comparar'/);
  assert.match(pkg.scripts.build, /generar-comparador-estados\.mjs/);
});

test('la página explica límites de decisión y costo de vida', () => {
  assert.match(pagina, /no las combina en un puntaje/i);
  assert.match(pagina, /Concluir dónde “conviene más vivir”/i);
  assert.match(pagina, /Faltan renta, transporte, impuestos locales/i);
  assert.match(pagina, /costo de vida/i);
});
