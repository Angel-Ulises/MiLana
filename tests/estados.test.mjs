import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const datos = JSON.parse(readFileSync('src/data/estados.json','utf8'));
const laboral = JSON.parse(readFileSync('src/data/mercadoLaboralEstados.json','utf8'));
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

test('mercado laboral cubre las mismas 32 entidades con ENOE 2026-T2', () => {
  assert.equal(laboral.actualizado, '2026-T2');
  assert.equal(laboral.publicado, '2026-08-25');
  assert.equal(laboral.estados.length, 32);
  assert.deepEqual(new Set(laboral.estados.map((e) => e.slug)), new Set(datos.estados.map((e) => e.slug)));
  assert.equal(laboral.nacional.desocupacion, 2.7);
  assert.equal(laboral.nacional.informalidad, 55.1);
  assert.match(laboral.fuente, /INEGI.*ENOE/i);
});

test('muestras estatales coinciden con el cuadro 5 de ENOE 2026-T2', () => {
  const nl = laboral.estados.find((e) => e.slug === 'nuevo-leon');
  const oax = laboral.estados.find((e) => e.slug === 'oaxaca');
  const cdmx = laboral.estados.find((e) => e.slug === 'ciudad-de-mexico');
  assert.deepEqual({ participacion:nl.participacion, desocupacion:nl.desocupacion, informalidad:nl.informalidad, subocupacion:nl.subocupacion }, { participacion:60.7, desocupacion:2.5, informalidad:34.8, subocupacion:3.5 });
  assert.equal(oax.informalidad, 80.1);
  assert.equal(oax.desocupacion, 0.8);
  assert.equal(cdmx.desocupacion, 4.2);
});

test('todas las tasas laborales tienen rangos plausibles', () => {
  for (const e of laboral.estados) {
    assert.ok(e.ocupados > 0 && e.desocupados >= 0);
    for (const campo of ['participacion','desocupacion','trabajoAsalariado','subocupacion','condicionesCriticas','informalidad','sectorInformal']) {
      assert.ok(Number.isFinite(e[campo]));
      assert.ok(e[campo] >= 0 && e[campo] <= 100, `${e.slug}.${campo}`);
    }
  }
});

test('la UI separa población profesional, mercado laboral, vacantes y costo de vida', () => {
  assert.match(pagina, /mercado laboral general/i);
  assert.match(pagina, /nunca como si fueran la misma población/i);
  assert.match(pagina, /no vacantes abiertas/i);
  assert.match(pagina, /No lo publicamos hasta tener una fuente oficial con ese cruce/i);
  assert.match(pagina, /costo de vida/i);
});

test('cada estado recibe HTML estático, canonical, mercado laboral y sitemap', () => {
  assert.match(generador, /mercadoLaboralEstados\.json/);
  assert.match(generador, /datos\.estados\.forEach\(construirEstado\)/);
  assert.match(generador, /Mercado laboral en/);
  assert.match(generador, /rel="canonical"/);
  assert.match(generador, /BreadcrumbList/);
  assert.match(sitemap, /\/estados/);
  assert.match(sitemap, /estados\.map\(e => `\/estados\/\$\{e\.slug\}`\)/);
});

test('en una ficha, "Ver panorama" baja al panorama del mismo estado en vez de recargar la misma URL', () => {
  // Regresión: el selector arrancaba con el estado de la página y el botón navegaba a /estados/<mismo>, sin efecto.
  assert.match(pagina, /const mismaFicha = Boolean\(value\) && seleccion === value;/);
  assert.match(pagina, /getElementById\('panorama-estado'\)/);
  assert.match(pagina, /id="panorama-estado" tabIndex=\{-1\}/);
  assert.match(pagina, /window\.location\.href = `\/estados\/\$\{seleccion\}`;/);
  assert.match(pagina, /Ir a \$\{destino\.estado\}/);
});
