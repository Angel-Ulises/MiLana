import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  decodeCandidatePayload,
  formatPeriodEs,
  promotionReport,
} from '../scripts/radar/promotion-lib.mjs';

const registry = JSON.parse(readFileSync(new URL('../src/data/radar-sources.json', import.meta.url), 'utf8'));
const economia = JSON.parse(readFileSync(new URL('../src/data/economia.json', import.meta.url), 'utf8'));

function candidate(overrides = {}) {
  return {
    key: 'aaaaaaaaaaaaaaaaaaaa',
    status: 'needs-review',
    sourceId: 'inegi-consumo',
    institution: 'INEGI',
    sourceName: 'Consumo privado en el mercado interior',
    sourceUrl: 'https://www.inegi.org.mx/servicios/xml/IMCPMI_M_O.xml',
    publishedAt: '2026-10-05',
    title: 'Indicador mensual del consumo privado en el mercado interior, Variación anual, Total',
    summary: 'Indicador mensual del consumo privado. Periodo 2026/07: 1.2% · estatus: Preliminar.',
    category: 'Economía cotidiana',
    detectedFact: '1.2%',
    period: '2026/07',
    value: 1.249,
    valueStatus: 'Preliminar',
    signalType: 'dato-estadistico-preliminar',
    editorial: {
      draft: {
        detectedFact: '1.2%',
        whatHappened: 'INEGI actualizó el indicador mensual del consumo privado.',
      },
    },
    ...overrides,
  };
}

test('payload estructurado del Issue sobrevive ida y vuelta en base64', () => {
  const original = candidate();
  const encoded = Buffer.from(JSON.stringify(original), 'utf8').toString('base64');
  const decoded = decodeCandidatePayload(`<!-- radar-key:${original.key} -->\n<!-- radar-payload:${encoded} -->`);
  assert.deepEqual(decoded, original);
});

test('periodos INEGI se convierten a lenguaje editorial legible', () => {
  assert.equal(formatPeriodEs('2026/07'), 'julio de 2026');
  assert.equal(formatPeriodEs('2026/09/01'), 'primera quincena de septiembre de 2026');
  assert.equal(formatPeriodEs('2026/09/02'), 'segunda quincena de septiembre de 2026');
});

test('candidato preliminar genera propuesta completa sin perder periodo ni estatus', () => {
  const report = promotionReport(candidate(), registry, economia, { today: '2026-10-05' });
  assert.equal(report.ok, true, report.blockers.join('\n'));
  assert.equal(report.article.radarKey, 'aaaaaaaaaaaaaaaaaaaa');
  assert.equal(report.article.datoPrincipal, '1.2%');
  assert.equal(report.article.datoEtiqueta, 'variación anual');
  assert.equal(report.article.fuenteId, 'inegi-consumo-mensual');
  assert.match(report.article.slug, /^consumo-privado-2026-07$/);
  assert.match(report.article.titulo, /1\.2%/);
  assert.match(report.article.titulo, /julio de 2026/);
  assert.match(report.article.quePaso, /julio de 2026/);
  assert.match(report.article.quePaso, /Preliminar/);
  assert.ok(report.article.herramienta.href.startsWith('/'));
  assert.ok(report.article.herramientaSecundaria.href.startsWith('/'));
  assert.equal(report.publicSource.id, 'inegi-consumo-mensual');
  assert.ok(report.nextEconomia.articulos.some((item) => item.radarKey === 'aaaaaaaaaaaaaaaaaaaa'));
  assert.ok(report.nextEconomia.fuentes.some((item) => item.id === 'inegi-consumo-mensual'));
});

test('promoción bloquea fechas futuras', () => {
  const report = promotionReport(candidate({ publishedAt: '2026-10-06' }), registry, economia, { today: '2026-10-05' });
  assert.equal(report.ok, false);
  assert.ok(report.blockers.some((item) => /futuro/.test(item)));
  assert.equal(report.nextEconomia, null);
});

test('promoción bloquea un radarKey ya publicado', () => {
  const duplicated = structuredClone(economia);
  duplicated.articulos = [{ ...economia.articulos[0], radarKey: 'aaaaaaaaaaaaaaaaaaaa' }, ...economia.articulos.slice(1)];
  const report = promotionReport(candidate(), registry, duplicated, { today: '2026-10-05' });
  assert.equal(report.ok, false);
  assert.ok(report.blockers.some((item) => /promovido anteriormente/.test(item)));
});

test('todas las fuentes del Radar tienen metadatos de promoción cerrados', () => {
  for (const source of registry.sources) {
    assert.ok(source.promotion, `${source.id} sin promotion`);
    assert.match(source.promotion.publicSourceId, /^[a-z0-9-]+$/);
    assert.match(source.promotion.slugPrefix, /^[a-z0-9-]+$/);
    assert.match(source.promotion.photoId, /^\d+$/);
    assert.ok(source.promotion.photoAlt.length >= 20);
    assert.ok(source.tools.length >= 2);
  }
});

test('workflow de promoción exige propietario + Issue del bot + comando exacto y solo abre draft PR', () => {
  const workflow = readFileSync(new URL('../.github/workflows/radar-promote.yml', import.meta.url), 'utf8');
  assert.match(workflow, /issue_comment:/);
  assert.match(workflow, /github\.event\.issue\.user\.login == 'github-actions\[bot\]'/);
  assert.match(workflow, /github\.actor == github\.repository_owner/);
  assert.match(workflow, /github\.event\.comment\.body == '\/preparar'/);
  assert.match(workflow, /draft:\s*true/);
  assert.match(workflow, /radar\/promotion-/);
  assert.match(workflow, /Closes #/);
  assert.doesNotMatch(workflow, /git\s+push[^\n]*\bmain\b/i);
  assert.doesNotMatch(workflow, /merge_pull_request|enablePullRequestAutoMerge|auto-merge/i);
});

test('recolector incrusta payload pero conserva contents read', () => {
  const workflow = readFileSync(new URL('../.github/workflows/radar-collector.yml', import.meta.url), 'utf8');
  assert.match(workflow, /radar-payload:/);
  assert.match(workflow, /\/preparar/);
  assert.match(workflow, /^\s+contents:\s*read\s*$/m);
  assert.doesNotMatch(workflow, /^\s+contents:\s*write\s*$/m);
});
