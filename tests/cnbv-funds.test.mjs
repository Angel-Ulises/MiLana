import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CNBV_FUND_SAMPLE } from '../src/data/cnbv-fund-sample.js';

const page = readFileSync('src/cnbvFundsPage.jsx','utf8');
const main = readFileSync('src/main.jsx','utf8');
const generator = readFileSync('scripts/generar-inversion.mjs','utf8');
const sitemap = readFileSync('scripts/generar-sitemap-final.mjs','utf8');

test('muestra CNBV conserva corte, campos regulatorios y 12 registros', () => {
  assert.equal(CNBV_FUND_SAMPLE.sourcePeriod, '2026-07-31');
  assert.equal(CNBV_FUND_SAMPLE.records.length, 12);
  assert.deepEqual(CNBV_FUND_SAMPLE.fields, ['Periodo','Operadora','Fondo','Tipo de Fondo','Clasificación','Activo Neto diario']);
  assert.match(CNBV_FUND_SAMPLE.sourceUrl, /^https:\/\/portafolioinfo\.cnbv\.gob\.mx\//);
  assert.match(CNBV_FUND_SAMPLE.reportUrl, /^https:\/\/portafolioinfdoctos\.cnbv\.gob\.mx\//);
});

test('registros solo usan datos observados del R1 y valores plausibles', () => {
  const allowedTypes = new Set(['Deuda','Renta Variable']);
  for (const item of CNBV_FUND_SAMPLE.records) {
    assert.ok(item.operatorCode);
    assert.ok(item.fundCode);
    assert.ok(allowedTypes.has(item.fundType));
    assert.ok(item.classification);
    assert.ok(Number.isFinite(item.netAssets) && item.netAssets > 0);
    assert.equal('price' in item, false);
    assert.equal('return' in item, false);
    assert.equal('fee' in item, false);
    assert.equal('liquidity' in item, false);
  }
});

test('UI separa activo neto de precio, rendimiento y disponibilidad', () => {
  assert.match(page, /Activo neto no es precio, rendimiento ni dinero disponible/i);
  assert.match(page, /No es un directorio exhaustivo|muestra inicial/i);
  assert.match(page, /no significa que sea adecuado ni que esté disponible/i);
  assert.doesNotMatch(page, /mejor fondo|top fondo|te conviene|deberías comprar/i);
  assert.doesNotMatch(page, /fetch\(|axios|XMLHttpRequest|WebSocket/i);
});

test('ruta CNBV se monta antes que Finanzas y carga CSS propio', () => {
  assert.match(main, /CnbvFundsPage/);
  assert.match(main, /esRutaFondosCNBV/);
  assert.ok(main.indexOf('fondosCNBV ?') < main.indexOf('finanzas ?'));
  assert.match(main, /cnbv-funds\.css/);
});

test('fondos CNBV tiene HTML estático, canonical/schema y sitemap', () => {
  assert.match(generator, /fondos-cnbv/);
  assert.match(generator, /destino:\['finanzas','inversion','fondos'\]/);
  assert.match(generator, /rel="canonical"/);
  assert.match(generator, /WebApplication/);
  assert.match(generator, /Activo neto.*No equivale.*precio.*rendimiento/is);
  assert.match(sitemap, /\/finanzas\/inversion\/fondos/);
});
