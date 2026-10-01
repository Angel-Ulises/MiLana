import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main = fs.readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
const page = fs.readFileSync(new URL('../src/advisorPage.jsx', import.meta.url), 'utf8');
const entry = fs.readFileSync(new URL('../src/advisorEntry.jsx', import.meta.url), 'utf8');
const generator = fs.readFileSync(new URL('../scripts/generar-asesor.mjs', import.meta.url), 'utf8');
const sitemap = fs.readFileSync(new URL('../scripts/generar-sitemap-final.mjs', import.meta.url), 'utf8');
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('mi-situacion se enruta antes de la ruta genérica de finanzas', () => {
  assert.match(main, /const asesor = esRutaAsesor\(\)/);
  assert.ok(main.indexOf('asesor ?') < main.indexOf('finanzas ?'));
  assert.match(page, /\/finanzas\\\/mi-situacion/);
});

test('pantalla usa el núcleo determinista y no recomienda productos', () => {
  assert.match(page, /crearRadiografiaFinanciera/);
  assert.match(page, /crearEscenariosIngreso/);
  assert.match(page, /crearRutaAsesor/);
  assert.match(page, /no recomienda ni ejecuta productos de inversión/i);
  assert.doesNotMatch(page, /comprar ahora|orden de compra|ejecutar inversión/i);
});

test('inicio y hub de finanzas enlazan al asesor sin capturar datos en analytics', () => {
  assert.match(entry, /\.ml-advisor-strip a/);
  assert.match(entry, /\.finance-advisor-preview a/);
  assert.match(entry, /\/finanzas\/mi-situacion/);
  assert.doesNotMatch(entry, /localStorage|sessionStorage|fetch\(|navigator\.sendBeacon/);
});

test('build genera HTML estático y sitemap para mi-situacion', () => {
  assert.match(pkg.scripts.build, /node scripts\/generar-asesor\.mjs/);
  assert.ok(pkg.scripts.build.indexOf('generar-asesor.mjs') < pkg.scripts.build.indexOf('inyectar-social-preview.mjs'));
  assert.match(generator, /https:\/\/www\.milanaaqui\.mx\/finanzas\/mi-situacion/);
  assert.match(generator, /WebApplication/);
  assert.match(generator, /Qué no hace/);
  assert.match(sitemap, /'\/finanzas\/mi-situacion'/);
});
