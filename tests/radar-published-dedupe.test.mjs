import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { candidateAlreadyPublished } from '../scripts/radar/published-dedupe.mjs';

const registry = JSON.parse(readFileSync(new URL('../src/data/radar-sources.json', import.meta.url), 'utf8'));

function source(id) {
  return registry.sources.find((item) => item.id === id);
}

function candidate(overrides = {}) {
  return {
    key: 'abcdef1234567890abcd',
    sourceId: 'inegi-inpc-quincenal',
    publishedAt: '2026-10-08',
    title: 'Índice de precios al consumidor (INPC). Inflación quincenal, interanual',
    summary: 'Periodo 2026/09/02: 3.5%.',
    detectedFact: '3.5%',
    ...overrides,
  };
}

test('radarKey publicado elimina el candidato aunque fuente técnica y pública tengan IDs distintos', () => {
  const economia = {
    articulos: [{
      slug: 'inflacion-quincenal-2026-09-02',
      fecha: '2026-10-08',
      fuenteId: 'inegi-inpc',
      datoPrincipal: '3.5%',
      radarKey: 'abcdef1234567890abcd',
    }],
  };
  assert.equal(candidateAlreadyPublished(candidate(), economia, source('inegi-inpc-quincenal')), true);
});

test('contenido heredado sin radarKey se reconoce por fuente pública + fecha + cifra exacta', () => {
  const economia = {
    articulos: [{
      slug: 'inflacion-quincenal-octubre',
      fecha: '2026-10-08',
      fuenteId: 'inegi-inpc',
      datoPrincipal: '3,5%',
    }],
  };
  assert.equal(candidateAlreadyPublished(candidate(), economia, source('inegi-inpc-quincenal')), true);
});

test('una cifra diferente el mismo día sigue siendo candidata si no comparte radarKey', () => {
  const economia = {
    articulos: [{
      slug: 'otra-lectura-inpc',
      fecha: '2026-10-08',
      fuenteId: 'inegi-inpc',
      datoPrincipal: '3.8%',
      radarKey: 'otra-clave-distinta',
    }],
  };
  assert.equal(candidateAlreadyPublished(candidate(), economia, source('inegi-inpc-quincenal')), false);
});

test('una actualización posterior no queda bloqueada por una publicación vieja', () => {
  const economia = {
    articulos: [{
      slug: 'inflacion-quincenal-2026-09-02',
      fecha: '2026-10-08',
      fuenteId: 'inegi-inpc',
      datoPrincipal: '3.5%',
      radarKey: 'clave-vieja',
    }],
  };
  const next = candidate({
    key: 'fedcba0987654321fedc',
    publishedAt: '2026-10-23',
    detectedFact: '3.6%',
  });
  assert.equal(candidateAlreadyPublished(next, economia, source('inegi-inpc-quincenal')), false);
});
