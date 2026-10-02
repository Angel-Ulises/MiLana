import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { investmentComparisonDimensions, investmentInstrumentClasses } from '../src/data/investment-instrument-classes.js';
import { compararInstrumentosEducativos } from '../src/lib/investmentInstrumentCompare.js';

const pagina = readFileSync('src/investmentInstrumentComparePage.jsx','utf8');
const entry = readFileSync('src/investmentCompareEntry.jsx','utf8');
const main = readFileSync('src/main.jsx','utf8');
const generador = readFileSync('scripts/generar-inversion.mjs','utf8');
const sitemap = readFileSync('scripts/generar-sitemap-final.mjs','utf8');

const dominiosOficiales = new Set(['www.cetesdirecto.com','www.gob.mx','www.bmv.com.mx']);

test('catálogo inicial tiene cuatro familias y las mismas dimensiones', () => {
  assert.deepEqual(investmentInstrumentClasses.map((x) => x.id), ['cetes','fondos-inversion','acciones','etf']);
  assert.equal(investmentComparisonDimensions.length, 7);
  for (const instrumento of investmentInstrumentClasses) {
    assert.deepEqual(Object.keys(instrumento.dimensiones), investmentComparisonDimensions.map((d) => d.id));
  }
});

test('todas las fichas usan fuentes oficiales cerradas', () => {
  for (const instrumento of investmentInstrumentClasses) {
    const url = new URL(instrumento.fuente.url);
    assert.equal(url.protocol, 'https:');
    assert.equal(dominiosOficiales.has(url.hostname), true, `${instrumento.id} usa ${url.hostname}`);
  }
});

test('comparador nunca produce ganador, recomendación, score ni rendimiento actual', () => {
  const comparacion = compararInstrumentosEducativos(['cetes','etf']);
  assert.equal(comparacion.instrumentos.length, 2);
  assert.equal(comparacion.tieneGanador, false);
  assert.equal(comparacion.recomiendaProducto, false);
  assert.equal(comparacion.usaRendimientoActual, false);
  assert.equal(comparacion.usaScore, false);
  assert.doesNotMatch(JSON.stringify(comparacion), /mejor opción|te conviene|debes comprar|recomendado para ti/i);
});

test('duplicados o IDs inválidos no fabrican una comparación', () => {
  assert.equal(compararInstrumentosEducativos(['cetes','cetes']).instrumentos.length, 1);
  assert.equal(compararInstrumentosEducativos(['inexistente']).instrumentos.length, 0);
});

test('UI separa comparación educativa de rendimiento y operación', () => {
  assert.match(pagina, /Compara estructuras, no promesas/i);
  assert.match(pagina, /Sin ranking/i);
  assert.match(pagina, /Sin rendimiento prometido/i);
  assert.match(pagina, /Fuentes oficiales/i);
  assert.doesNotMatch(pagina, /comprar ahora|invertir ahora|mejor para ti/i);
  assert.doesNotMatch(pagina, /fetch\(|axios|XMLHttpRequest|WebSocket/i);
});

test('ruta comparar se monta antes de Finanzas y queda enlazada desde inversión', () => {
  assert.match(main, /esRutaCompararInstrumentos/);
  assert.ok(main.indexOf('compararInstrumentos ?') < main.indexOf('finanzas ?'));
  assert.match(main, /InvestmentInstrumentComparePage/);
  assert.match(entry, /\/finanzas\/inversion\/comparar/);
});

test('build estático genera canonical, schema y sitemap del comparador', () => {
  assert.match(generador, /finanzas.*inversion.*comparar/s);
  assert.match(generador, /Comparador educativo de instrumentos MiLana/);
  assert.match(generador, /rel=\"canonical\"/);
  assert.match(generador, /no recomienda comprar, vender o mantener instrumentos/i);
  assert.match(sitemap, /\/finanzas\/inversion\/comparar/);
});
