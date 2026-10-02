import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync(new URL('../src/careerPages.jsx', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../src/career-pages.css', import.meta.url), 'utf8');
const generator = fs.readFileSync(new URL('../scripts/generar-carreras.mjs', import.meta.url), 'utf8');

const destinos = [
  '/carreras/mejor-pagadas', '/carreras/mas-demandadas', '/carreras/por-estado',
  '/carreras/comparar', '/carreras/ocupaciones', '/carreras/profesion/ciencias-computacion',
  '/carreras/profesion/derecho', '/calculadoras/bruto-a-neto',
];

test('el hub ofrece una red de preguntas concretas con destinos existentes', () => {
  assert.match(page, /Preguntas que abren otras preguntas/);
  assert.match(page, /Explora como buscarías en Google/);
  for (const destino of destinos) assert.ok(page.includes(destino), `falta ${destino}`);
});

test('las preguntas no convierten población ocupada en demanda ni carrera en ocupación', () => {
  assert.match(page, /¿Cuáles concentran más profesionistas ocupados\?/);
  assert.match(page, /¿Carrera estudiada y ocupación son lo mismo\?/);
  assert.doesNotMatch(page, /¿Qué carrera tiene más vacantes en mi estado\?/i);
});

test('preguntas también quedan disponibles para rastreadores y son responsivas', () => {
  assert.match(generator, /¿Cómo comparo dos carreras sin elegir solo por sueldo\?/);
  assert.match(generator, /¿Qué trabajos concentran más personas en mi estado\?/);
  assert.match(css, /career-question-grid/);
  assert.match(css, /@media\(max-width:640px\)[\s\S]*career-question-grid\{grid-template-columns:1fr\}/);
});
