import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CNBV_FUND_SAMPLE } from '../src/data/cnbv-fund-sample.js';
import { evaluarRevisionCNBV } from '../scripts/inversion/cnbv-funds-staleness.mjs';

const workflow = readFileSync('.github/workflows/cnbv-funds-freshness.yml','utf8');

test('cadencia CNBV es explícita y no marca vencimiento antes de 30 días', () => {
  assert.equal(CNBV_FUND_SAMPLE.reviewCadenceDays, 30);
  const d29 = evaluarRevisionCNBV({ checkedAt:'2026-10-01', cadenceDays:30, today:'2026-10-30' });
  assert.equal(d29.needsReview, false);
  assert.equal(d29.elapsedDays, 29);
  assert.equal(d29.nextReviewDate, '2026-10-31');
});

test('al cumplir la cadencia se solicita una revisión editorial, no se inventa un corte nuevo', () => {
  const d30 = evaluarRevisionCNBV({ checkedAt:'2026-10-01', cadenceDays:30, today:'2026-10-31' });
  assert.equal(d30.needsReview, true);
  assert.equal(d30.elapsedDays, 30);
});

test('detector rechaza fechas futuras y cadencias inválidas', () => {
  assert.throws(() => evaluarRevisionCNBV({ checkedAt:'2026-10-02', cadenceDays:30, today:'2026-10-01' }), /futuro/i);
  assert.throws(() => evaluarRevisionCNBV({ checkedAt:'2026-10-01', cadenceDays:0, today:'2026-10-01' }), /cadencia/i);
});

test('workflow es semanal, deduplicado y solo administra Issues', () => {
  assert.match(workflow, /cron:\s*'23 15 \* \* 1'/);
  assert.match(workflow, /contents:\s*read/);
  assert.match(workflow, /issues:\s*write/);
  assert.match(workflow, /gh issue list/);
  assert.match(workflow, /gh issue create/);
  assert.match(workflow, /gh issue close/);
});

test('workflow de frescura CNBV nunca descarga XLSM ni desactiva TLS ni publica contenido', () => {
  assert.doesNotMatch(workflow, /portafolioinfdoctos|\.xlsm/i);
  assert.doesNotMatch(workflow, /curl\s+-k|curl[^\n]*--insecure|rejectUnauthorized\s*:\s*false/i);
  assert.doesNotMatch(workflow, /contents:\s*write/);
  assert.doesNotMatch(workflow, /git\s+push|git\s+commit|npm\s+run\s+build/i);
  assert.match(workflow, /no descarga XLSM, no modifica contenido y no publica cifras/i);
});
