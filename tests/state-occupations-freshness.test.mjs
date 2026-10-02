import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nextQuarter, quarterLabel, analyzeQuarterPayload, buildAvailabilityUrl } from '../scripts/states/data-mexico-occupations-freshness.mjs';

const workflow = readFileSync('.github/workflows/state-occupations-freshness.yml','utf8');

test('avance trimestral maneja secuencia y cambio de año', () => {
  assert.equal(nextQuarter('20261'), '20262');
  assert.equal(nextQuarter('20262'), '20263');
  assert.equal(nextQuarter('20264'), '20271');
  assert.equal(quarterLabel('20262'), '2026-T2');
  assert.throws(() => nextQuarter('20265'), /inválido/i);
});

test('solo considera completo el trimestre cuando aparecen 32 entidades únicas', () => {
  const full = { data: Array.from({length:32}, (_,i) => ({'State ID': i+1, Workforce: 1000+i})) };
  assert.deepEqual(analyzeQuarterPayload(full, 32), { rows:32, stateCount:32, complete:true });
  const partial = { data: Array.from({length:31}, (_,i) => ({'State ID': i+1})) };
  assert.equal(analyzeQuarterPayload(partial, 32).complete, false);
  const duplicate = { data: Array.from({length:32}, () => ({'State ID': 19})) };
  assert.equal(analyzeQuarterPayload(duplicate, 32).complete, false);
});

test('URL de frescura usa únicamente API oficial y consulta State agregado', () => {
  const url = new URL(buildAvailabilityUrl('20262'));
  assert.equal(url.origin, 'https://www.economia.gob.mx');
  assert.equal(url.pathname, '/datamexico/api/data');
  assert.equal(url.searchParams.get('Quarter'), '20262');
  assert.equal(url.searchParams.get('cube'), 'inegi_enoe');
  assert.equal(url.searchParams.get('drilldowns'), 'State');
  assert.match(url.searchParams.get('measures'), /Workforce/);
  assert.match(url.searchParams.get('measures'), /Number of Records/);
});

test('workflow es semanal, deduplica alertas y no publica el nuevo snapshot', () => {
  assert.match(workflow, /cron:\s*'17 14 \* \* 1'/);
  assert.match(workflow, /contents:\s*read/);
  assert.match(workflow, /issues:\s*write/);
  assert.match(workflow, /gh issue list/);
  assert.match(workflow, /gh issue create/);
  assert.match(workflow, /32 entidades/);
  assert.doesNotMatch(workflow, /contents:\s*write/);
  assert.doesNotMatch(workflow, /git\s+push|git\s+commit|update_file|stateOccupations\.json[^\n]*>/i);
  assert.match(workflow, /No actualiza ni publica automáticamente/i);
});
