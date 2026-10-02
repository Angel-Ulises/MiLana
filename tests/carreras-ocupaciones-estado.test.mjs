import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync(new URL('../src/careerPages.jsx', import.meta.url), 'utf8');
const generator = fs.readFileSync(new URL('../scripts/generar-carreras.mjs', import.meta.url), 'utf8');
const carreras = JSON.parse(fs.readFileSync(new URL('../src/data/carreras.json', import.meta.url), 'utf8'));
const ocupaciones = JSON.parse(fs.readFileSync(new URL('../src/data/stateOccupations.json', import.meta.url), 'utf8'));

test('las 32 entidades de carreras tienen contexto ocupacional verificable', () => {
  assert.equal(carreras.estados.length, 32);
  assert.equal(ocupaciones.states.length, 32);
  const porNombre = new Map(ocupaciones.states.map((e) => [e.state, e]));
  for (const estado of carreras.estados) {
    const contexto = porNombre.get(estado.estado);
    assert.ok(contexto, `falta contexto ocupacional para ${estado.estado}`);
    assert.equal(contexto.occupations.length, 8);
    assert.ok(contexto.occupations.every((o) => o.workforce > 0 && o.records > 0));
  }
});

test('la UI separa ocupación, carrera y vacantes y enlaza la ficha estatal', () => {
  assert.match(page, /stateOccupations\.json/);
  assert.match(page, /Ocupación observada no significa carrera estudiada ni vacantes abiertas/);
  assert.match(page, /Trabajo observado · ENOE 2026-T1/);
  assert.match(page, /href=\{`\/estados\/\$\{mercadoEstado\.slug\}`\}/);
  assert.doesNotMatch(page, /carreras más demandadas en \{estado\}/i);
});

test('el HTML estático expone una señal ocupacional por las 32 entidades', () => {
  assert.match(generator, /resumenOcupacionalEstados/);
  assert.match(generator, /Data México, con ENOE 2026-T1/);
  assert.match(generator, /Ocupación no equivale a carrera estudiada, vacante abierta ni demanda futura/);
  assert.match(generator, /href=\"\/estados\/\$\{estado\.slug\}\"/);
});
