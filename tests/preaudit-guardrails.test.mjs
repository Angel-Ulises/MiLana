import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { crearRadiografiaFinanciera, crearMapaPreparacionInversion, crearPlanDecisionInversion } from '../src/lib/advisorCore.js';

const seo = fs.readFileSync(new URL('../scripts/inyectar-seo-estatico.mjs', import.meta.url), 'utf8');
const metaEstaticos = fs.readFileSync(new URL('../scripts/completar-meta-estaticos.mjs', import.meta.url), 'utf8');
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const grafo = fs.readFileSync(new URL('../scripts/verificar-grafo-interno.mjs', import.meta.url), 'utf8');
const profesiones = fs.readFileSync(new URL('../src/data/profesiones.json', import.meta.url), 'utf8');

test('la portada estática enlaza las capas principales y la página de widgets', () => {
  for (const ruta of ['/carreras', '/estados', '/finanzas', '/economia', '/widgets']) {
    assert.ok(seo.includes(`href=\"${ruta}\"`), `falta enlace estático a ${ruta}`);
  }
});

test('una meta de monto cero no se trata como plan completo de inversión', () => {
  const r = crearRadiografiaFinanciera({
    ingresoNeto: 30000, gastosEsenciales: 12000, gastosVariables: 3000,
    pagosDeuda: 0, fondoActual: 40000, objetivo: 'inversion',
    metaObjetivo: 0, ahorroMetaActual: 0, horizonteMeses: 24,
  });
  const plan = crearPlanDecisionInversion(r);
  assert.equal(plan.estado, 'completar-meta');
  assert.ok(plan.faltantes.some((x) => x.id === 'meta-monto'));
  assert.equal(plan.escenarios.length, 0);
  assert.equal(plan.puedeRecomendarProducto, false);
  assert.equal(plan.puedeEjecutarOperacion, false);
});

test('ahorro cero confirmado sí es válido cuando la meta y horizonte existen', () => {
  const r = crearRadiografiaFinanciera({
    ingresoNeto: 30000, gastosEsenciales: 12000, gastosVariables: 3000,
    pagosDeuda: 0, fondoActual: 40000, objetivo: 'inversion',
    metaObjetivo: 120000, ahorroMetaActual: 0, horizonteMeses: 24,
  });
  const plan = crearPlanDecisionInversion(r);
  assert.equal(plan.estado, 'comparar-escenarios');
  assert.equal(plan.escenarios.find((x) => x.id === 'base').valor, 5000);
});

test('gastos esenciales en cero no simulan un fondo de emergencia suficiente', () => {
  const r = crearRadiografiaFinanciera({
    ingresoNeto: 30000, gastosEsenciales: 0, gastosVariables: 3000,
    pagosDeuda: 0, fondoActual: 0, horizonteMeses: 24,
  });
  const mapa = crearMapaPreparacionInversion(r);
  const liquidez = mapa.factores.find((x) => x.id === 'liquidez');
  assert.equal(liquidez.estado, 'faltan-datos');
  assert.match(liquidez.detalle, /monto positivo de gastos esenciales/i);
  assert.equal(mapa.puedeRecomendarProducto, false);
});

test('casos extremos nunca habilitan recomendación ni ejecución', () => {
  const casos = [
    {},
    { ingresoNeto: -1, gastosEsenciales: -1 },
    { ingresoNeto: 1, gastosEsenciales: 999999999, pagosDeuda: 999999 },
    { ingresoNeto: 'abc', gastosEsenciales: '', fondoActual: null },
    { ingresoNeto: 50000, gastosEsenciales: 10000, pagosDeuda: 0, fondoActual: 100000, horizonteMeses: 120 },
  ];
  for (const entrada of casos) {
    const mapa = crearMapaPreparacionInversion(crearRadiografiaFinanciera(entrada));
    assert.equal(mapa.puedeRecomendarProducto, false);
    assert.equal(mapa.puedeEjecutarOperacion, false);
    assert.equal(mapa.usaScore, false);
  }
});

test('metadatos sociales y schema cubren las páginas canónicas estáticas de confianza', () => {
  for (const ruta of ['aprende', 'sobre', 'metodo', 'contacto', 'privacidad', 'financiamiento', 'widgets']) {
    assert.ok(metaEstaticos.includes(`'${ruta}'`), `falta ${ruta} en completar-meta-estaticos`);
  }
  assert.match(metaEstaticos, /og:title/);
  assert.match(metaEstaticos, /twitter:card/);
  assert.match(metaEstaticos, /BreadcrumbList/);
  assert.match(pkg.scripts.build, /completar-meta-estaticos/);
});

test('el build impide islas u orfandad dentro del sitemap', () => {
  assert.match(pkg.scripts.build, /verificar-grafo-interno/);
  assert.match(grafo, /URLs no alcanzables desde Inicio/);
  assert.match(grafo, /URLs sin enlaces internos entrantes/);
  assert.match(grafo, /sitemap\.xml/);
});

test('las fuentes de Observatorio Laboral usan el host TLS válido sin www', () => {
  assert.doesNotMatch(profesiones, /https:\/\/www\.observatoriolaboral\.gob\.mx/);
  assert.match(profesiones, /https:\/\/observatoriolaboral\.gob\.mx/);
});
