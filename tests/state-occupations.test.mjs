import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const statesCatalog = JSON.parse(readFileSync('src/data/estados.json','utf8')).estados;
const data = JSON.parse(readFileSync('src/data/stateOccupations.json','utf8'));
const page = readFileSync('src/stateOccupations.jsx','utf8');
const main = readFileSync('src/main.jsx','utf8');
const generator = readFileSync('scripts/generar-estados.mjs','utf8');

test('Data México cubre exactamente las 32 entidades con 8 ocupaciones por estado', () => {
  assert.equal(data.period, '2026-T1');
  assert.equal(data.quarter, '20261');
  assert.equal(data.states.length, 32);
  assert.equal(data.selection.limitPerState, 8);
  assert.equal(data.selection.rankingIsRecommendation, false);
  assert.deepEqual(new Set(data.states.map((s) => s.slug)), new Set(statesCatalog.map((s) => s.slug)));
  assert.ok(data.states.every((s) => s.occupations.length === 8));
  assert.equal(data.states.reduce((sum, s) => sum + s.occupations.length, 0), 256);
});

test('cada ocupación conserva IDs, población, salario estimado y número de registros', () => {
  for (const state of data.states) {
    const ids = new Set();
    for (const item of state.occupations) {
      assert.ok(Number.isInteger(item.occupationId) && item.occupationId > 0);
      assert.ok(item.occupation);
      assert.ok(Number.isInteger(item.categoryId) && item.categoryId > 0);
      assert.ok(item.category);
      assert.ok(Number.isInteger(item.groupId) && item.groupId > 0);
      assert.ok(item.group);
      assert.ok(Number.isInteger(item.workforce) && item.workforce > 0);
      assert.ok(Number.isFinite(item.monthlyWage) && item.monthlyWage >= 0);
      assert.ok(Number.isInteger(item.records) && item.records > 0);
      assert.equal(ids.has(item.occupationId), false, `${state.slug}: occupationId duplicado ${item.occupationId}`);
      ids.add(item.occupationId);
    }
    const ordered = state.occupations.map((o) => o.workforce);
    assert.deepEqual(ordered, [...ordered].sort((a,b) => b-a), `${state.slug}: no está ordenado por población ocupada`);
  }
});

test('muestra de Nuevo León coincide con la consulta oficial validada', () => {
  const nl = data.states.find((s) => s.slug === 'nuevo-leon');
  assert.ok(nl);
  assert.equal(nl.stateId, 19);
  assert.deepEqual(nl.occupations[0], {
    occupationId: 4111,
    occupation: 'Comerciantes en Establecimientos',
    categoryId: 4,
    category: 'Comerciantes, Empleados en Ventas y Agentes de Ventas',
    groupId: 41,
    group: 'Comerciantes en Establecimientos',
    workforce: 137424,
    monthlyWage: 8624.7,
    records: 275,
  });
});

test('fuente y nota separan ocupación de carrera, vacantes y salario garantizado', () => {
  assert.match(data.source.name, /Data México.*Secretaría de Economía/i);
  assert.match(data.source.dataset, /ENOE.*inegi_enoe/i);
  assert.match(data.source.url, /^https:\/\/www\.economia\.gob\.mx\/datamexico\/api\/data\?/);
  assert.match(data.source.note, /Ocupación no equivale a carrera estudiada, vacante abierta ni salario garantizado/i);
});

test('UI describe población ocupada sin convertirla en demanda o recomendación', () => {
  assert.match(page, /no representa vacantes abiertas, demanda de contratación ni una recomendación profesional/i);
  assert.match(page, /Ingreso mensual estimado de la ocupación/i);
  assert.match(page, /Registros ENOE usados/i);
  assert.match(page, /no sustituye el ingreso profesional de OLA ni un salario inicial/i);
  assert.doesNotMatch(page, /más vacantes|alta demanda|mejor ocupación|te conviene|deberías elegir/i);
  assert.doesNotMatch(page, /fetch\(|axios|XMLHttpRequest|WebSocket/i);
});

test('ocupaciones estatales se montan como capa modular y cargan CSS propio', () => {
  assert.match(main, /StateOccupations/);
  assert.match(main, /state-occupations\.css/);
  assert.match(page, /state-occupations-mount/);
  assert.match(page, /\/estados\/\[\^\/\]\+/);
});

test('HTML estático conserva ocupaciones y límites editoriales dentro de la ficha estatal', () => {
  assert.match(generator, /stateOccupations\.json/);
  assert.match(generator, /Ocupaciones con más personas ocupadas/);
  assert.match(generator, /no equivale a vacantes, demanda de contratación ni recomendación profesional/i);
  assert.match(generator, /registros ENOE usados/i);
  assert.match(generator, /trabajo desempeñado, no carrera estudiada ni vacantes abiertas/i);
});
