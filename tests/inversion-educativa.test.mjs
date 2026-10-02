import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { crearMapaPreparacionInversion, crearRadiografiaFinanciera } from '../src/lib/advisorCore.js';

const pagina = readFileSync('src/investmentReadinessPage.jsx','utf8');
const entry = readFileSync('src/investmentEntry.jsx','utf8');
const main = readFileSync('src/main.jsx','utf8');
const generador = readFileSync('scripts/generar-inversion.mjs','utf8');
const sitemap = readFileSync('scripts/generar-sitemap-final.mjs','utf8');
const pkg = JSON.parse(readFileSync('package.json','utf8'));

test('la ruta de inversión se resuelve antes que la ruta genérica de Finanzas', () => {
  assert.match(main, /esRutaInversionEducativa/);
  assert.ok(main.indexOf('inversion ?') < main.indexOf('finanzas ?'));
  assert.match(main, /InvestmentReadinessPage/);
});

test('la UI pública no expone proveedores en evaluación ni secretos de integración', () => {
  assert.doesNotMatch(pagina, /Kuspit|DriveWealth|Alpaca/i);
  assert.doesNotMatch(pagina, /client[_-]?secret|access[_-]?token|api[_-]?key/i);
  assert.doesNotMatch(pagina, /fetch\(|XMLHttpRequest|axios|WebSocket/i);
  assert.match(pagina, /integración transaccional sigue apagada/i);
  assert.match(pagina, /no asigna un score/i);
  assert.match(pagina, /sin recomendar productos/i);
});

test('mapa previo nunca habilita recomendación ni ejecución aunque el contexto esté completo', () => {
  const r = crearRadiografiaFinanciera({ ingresoNeto:45000, gastosEsenciales:15000, gastosVariables:5000, pagosDeuda:0, fondoActual:70000, horizonteMeses:120, objetivo:'inversion' });
  const mapa = crearMapaPreparacionInversion(r);
  assert.equal(mapa.estado, 'contexto-educativo');
  assert.equal(mapa.usaScore, false);
  assert.equal(mapa.puedeRecomendarProducto, false);
  assert.equal(mapa.puedeEjecutarOperacion, false);
});

test('el acceso desde Finanzas y Mi situación es educativo y no transaccional', () => {
  assert.match(entry, /\/finanzas\/inversion/);
  assert.match(entry, /Sin score, sin recomendación automática/i);
  assert.doesNotMatch(entry, /comprar|ordenar|ejecutar|depositar/i);
});

test('inversión educativa tiene HTML estático, canonical, schema y sitemap', () => {
  assert.match(generador, /finanzas.*inversion.*index\.html/s);
  assert.match(generador, /rel="canonical"/);
  assert.match(generador, /WebApplication/);
  assert.match(generador, /No conecta cuentas bursátiles/i);
  assert.match(sitemap, /\/finanzas\/inversion/);
  assert.match(pkg.scripts.build, /generar-inversion\.mjs/);
});

test('el contenido mantiene separadas educación y asesoría de inversión', () => {
  assert.match(pagina, /Contenido educativo/i);
  assert.match(pagina, /No constituye asesoría de inversión/i);
  assert.match(pagina, /no selecciona CETES, fondos, acciones, ETF ni otro instrumento/i);
  assert.match(pagina, /institución financiera sea quien abra la cuenta, haga KYC\/PLD, ejecute y custodie/i);
});
