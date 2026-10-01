import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const estados = JSON.parse(readFileSync('src/data/estados.json','utf8'));
const vivienda = JSON.parse(readFileSync('src/data/viviendaEstados.json','utf8'));
const pagina = readFileSync('src/stateHousing.jsx','utf8');
const main = readFileSync('src/main.jsx','utf8');
const generador = readFileSync('scripts/enlazar-vivienda-estados.mjs','utf8');
const pkg = JSON.parse(readFileSync('package.json','utf8'));

test('vivienda SHF cubre exactamente las mismas 32 entidades', () => {
  assert.equal(vivienda.actualizado, '2026-T2');
  assert.equal(vivienda.publicado, '2026-08-10');
  assert.equal(vivienda.estados.length, 32);
  assert.deepEqual(new Set(vivienda.estados.map((e) => e.slug)), new Set(estados.estados.map((e) => e.slug)));
  assert.match(vivienda.fuente, /Sociedad Hipotecaria Federal|SHF/i);
  assert.match(vivienda.url, /^https:\/\/www\.gob\.mx\/shf/);
  assert.match(vivienda.anexo, /^https:\/\/www\.gob\.mx\/cms\/uploads\/attachment/);
  assert.match(vivienda.datosAbiertos, /\.xlsx$/i);
});

test('fila nacional coincide con el anexo SHF 2026-T2', () => {
  assert.deepEqual(vivienda.nacional, {
    apreciacion: 7.3,
    promedio: 1960032,
    p25: 843000,
    mediana: 1299580,
    p75: 2226101,
  });
});

test('muestras estatales coinciden con la tabla oficial SHF', () => {
  const nl = vivienda.estados.find((e) => e.slug === 'nuevo-leon');
  const jal = vivienda.estados.find((e) => e.slug === 'jalisco');
  const cdmx = vivienda.estados.find((e) => e.slug === 'ciudad-de-mexico');
  const tamps = vivienda.estados.find((e) => e.slug === 'tamaulipas');
  assert.deepEqual({ apreciacion:nl.apreciacion, promedio:nl.promedio, mediana:nl.mediana, p25:nl.p25, p75:nl.p75 }, { apreciacion:7.6, promedio:2042664, mediana:1214074, p25:803858, p75:2233216 });
  assert.deepEqual({ apreciacion:jal.apreciacion, promedio:jal.promedio, mediana:jal.mediana }, { apreciacion:10.1, promedio:2107232, mediana:1200979 });
  assert.equal(cdmx.mediana, 3301516);
  assert.equal(cdmx.apreciacion, 3.4);
  assert.equal(tamps.apreciacion, 12.5);
});

test('distribuciones estatales son coherentes y no mezclan unidades', () => {
  for (const e of vivienda.estados) {
    assert.ok(e.promedio > 0, `${e.slug}.promedio`);
    assert.ok(e.p25 > 0 && e.p25 <= e.mediana, `${e.slug}.p25`);
    assert.ok(e.mediana <= e.p75, `${e.slug}.mediana`);
    assert.ok(e.apreciacion >= -100 && e.apreciacion <= 100, `${e.slug}.apreciacion`);
  }
  assert.match(vivienda.nota, /crédito hipotecario/i);
  assert.match(vivienda.nota, /no representan toda la oferta/i);
  assert.match(vivienda.nota, /rentas/i);
});

test('la UI separa precio, apreciación, renta, valuación y capacidad de pago', () => {
  assert.match(pagina, /no confundir “cuánto cuesta” con “cuánto subió”/i);
  assert.match(pagina, /No es una valuación individual/i);
  assert.match(pagina, /precio de anuncio ni referencia de renta/i);
  assert.match(pagina, /Tu presupuesto depende de ingreso, ahorro, deuda, tasa, plazo/i);
  assert.doesNotMatch(pagina, /mediana\s*\/\s*ingreso|ingreso\s*\/\s*mediana/i);
});

test('vivienda estatal se monta en React y también queda en HTML estático', () => {
  assert.match(main, /StateHousing/);
  assert.match(main, /state-housing\.css/);
  assert.match(generador, /data-static-vivienda="shf-2026-t2"/);
  assert.match(generador, /estados\/\$\{e\.slug\}/);
  assert.match(generador, /finanzas\/vivienda/);
  assert.match(pkg.scripts.build, /enlazar-vivienda-estados\.mjs/);
  assert.ok(pkg.scripts.build.indexOf('generar-estados.mjs') < pkg.scripts.build.indexOf('enlazar-vivienda-estados.mjs'));
});
