import test from 'node:test';
import assert from 'node:assert/strict';
import { crearRadiografiaFinanciera, crearEscenariosIngreso, crearMapaPreparacionInversion, crearRutaAsesor } from '../src/lib/advisorCore.js';

test('radiografía calcula flujo, deuda, fondo y meta sin rendimientos', () => {
  const r = crearRadiografiaFinanciera({
    ingresoNeto: 30000,
    gastosEsenciales: 15000,
    gastosVariables: 5000,
    pagosDeuda: 3000,
    fondoActual: 10000,
    objetivo: 'vivienda',
    metaObjetivo: 180000,
    ahorroMetaActual: 30000,
    horizonteMeses: 30,
  });

  assert.equal(r.version, 3);
  assert.equal(r.flujo.gastoTotal, 23000);
  assert.equal(r.flujo.disponible, 7000);
  assert.equal(r.deuda.proporcionIngresoPct, 10);
  assert.equal(r.emergencia.referenciaTresMeses, 45000);
  assert.equal(r.emergencia.referenciaSeisMeses, 90000);
  assert.equal(r.emergencia.brechaTresMeses, 35000);
  assert.equal(r.meta.faltante, 150000);
  assert.equal(r.meta.aporteMensualNecesarioSinRendimiento, 5000);
  assert.equal(r.meta.mesesConDisponibleActualSinRendimiento, 22);
  assert.equal(r.capturado.ingresoNeto, true);
  assert.equal(r.capturado.horizonteMeses, true);
});

test('valores inválidos o negativos se normalizan sin crear saldos ficticios', () => {
  const r = crearRadiografiaFinanciera({
    ingresoNeto: -100,
    gastosEsenciales: 'abc',
    gastosVariables: -5,
    pagosDeuda: null,
  });

  assert.equal(r.entrada.ingresoNeto, 0);
  assert.equal(r.flujo.gastoTotal, 0);
  assert.equal(r.flujo.disponible, 0);
  assert.equal(r.deuda.proporcionIngresoPct, 0);
  assert.equal(r.capturado.pagosDeuda, false);
});

test('escenarios de ingreso son matemáticos y no recalculan impuestos', () => {
  const r = crearRadiografiaFinanciera({ ingresoNeto: 20000, gastosEsenciales: 10000, gastosVariables: 3000, pagosDeuda: 2000 });
  const escenarios = crearEscenariosIngreso(r, [10, 20, 30]);

  assert.deepEqual(escenarios.map((x) => x.ingresoNetoEscenario), [22000, 24000, 26000]);
  assert.deepEqual(escenarios.map((x) => x.disponibleEscenario), [7000, 9000, 11000]);
  assert.ok(escenarios.every((x) => x.nota.includes('no recalcula impuestos')));
});

test('mapa de inversión distingue datos faltantes sin score ni productos', () => {
  const r = crearRadiografiaFinanciera({ ingresoNeto: 25000, gastosEsenciales: 12000 });
  const mapa = crearMapaPreparacionInversion(r);

  assert.equal(mapa.estado, 'faltan-datos');
  assert.equal(mapa.usaScore, false);
  assert.equal(mapa.puedeRecomendarProducto, false);
  assert.equal(mapa.puedeEjecutarOperacion, false);
  assert.ok(mapa.factores.some((f) => f.id === 'deuda' && f.estado === 'faltan-datos'));
  assert.ok(mapa.factores.some((f) => f.id === 'horizonte' && f.estado === 'faltan-datos'));
});

test('tener deuda no produce una recomendación automática de pagar o invertir', () => {
  const r = crearRadiografiaFinanciera({
    ingresoNeto: 40000,
    gastosEsenciales: 15000,
    gastosVariables: 5000,
    pagosDeuda: 4000,
    fondoActual: 60000,
    horizonteMeses: 72,
    objetivo: 'inversion',
  });
  const mapa = crearMapaPreparacionInversion(r);
  const deuda = mapa.factores.find((f) => f.id === 'deuda');

  assert.equal(mapa.estado, 'revisar-deuda');
  assert.equal(deuda.estado, 'revisar');
  assert.match(deuda.detalle, /no puede decidir entre amortizar e invertir/i);
  assert.doesNotMatch(deuda.detalle, /deber[ií]as|te conviene|paga primero/i);
});

test('un escenario ordenado solo habilita contexto educativo, nunca operación', () => {
  const r = crearRadiografiaFinanciera({
    ingresoNeto: 35000,
    gastosEsenciales: 12000,
    gastosVariables: 5000,
    pagosDeuda: 0,
    fondoActual: 50000,
    horizonteMeses: 84,
    objetivo: 'inversion',
  });
  const mapa = crearMapaPreparacionInversion(r);

  assert.equal(mapa.estado, 'contexto-educativo');
  assert.equal(mapa.factores.length, 4);
  assert.equal(mapa.puedeRecomendarProducto, false);
  assert.equal(mapa.puedeEjecutarOperacion, false);
  assert.match(mapa.nota, /no certifica.*lista para invertir/i);
});

test('ruta del asesor prioriza flujo, fondo, deuda y meta sin recomendar productos', () => {
  const r = crearRadiografiaFinanciera({
    ingresoNeto: 25000,
    gastosEsenciales: 14000,
    gastosVariables: 4000,
    pagosDeuda: 3000,
    fondoActual: 5000,
    objetivo: 'vivienda',
    metaObjetivo: 120000,
    ahorroMetaActual: 20000,
    horizonteMeses: 24,
  });
  const ruta = crearRutaAsesor(r);

  assert.deepEqual(ruta.acciones.map((a) => a.id), ['fondo-emergencia', 'deuda', 'ahorro', 'vivienda']);
  assert.equal(ruta.inversion.estado, 'ordenar-base');
  assert.equal(ruta.inversion.puedeRecomendarProducto, false);
  assert.equal(ruta.inversion.puedeEjecutarOperacion, false);
});

test('flujo negativo incorpora presupuesto como primera acción', () => {
  const r = crearRadiografiaFinanciera({ ingresoNeto: 15000, gastosEsenciales: 12000, gastosVariables: 5000, pagosDeuda: 1000 });
  const ruta = crearRutaAsesor(r);
  assert.equal(ruta.acciones[0].id, 'presupuesto');
  assert.equal(r.flujo.disponible, -3000);
});
