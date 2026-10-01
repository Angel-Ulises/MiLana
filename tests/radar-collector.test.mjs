import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  parseFeed,
  parseInegiSeries,
  parseBanxicoList,
  buildCandidate,
  buildEditorialDraft,
  signalType,
  candidateKey,
  normalizeDate,
  extractFact,
} from '../scripts/radar/collector-lib.mjs';

const registry = JSON.parse(readFileSync(new URL('../src/data/radar-sources.json', import.meta.url), 'utf8'));

function source(id) {
  return registry.sources.find((item) => item.id === id);
}

test('normaliza fechas de feeds y páginas oficiales', () => {
  assert.equal(normalizeDate('24/09/26'), '2026-09-24');
  assert.equal(normalizeDate('8 de octubre de 2026'), '2026-10-08');
  assert.equal(normalizeDate('2026-10-02T12:00:00Z'), '2026-10-02');
});

test('parser RSS genérico extrae título, fecha, enlace y resumen', () => {
  const xml = `<?xml version="1.0"?><rss><channel><item>
    <title>Inflación anual se ubica en 3.50%</title>
    <link>https://www.inegi.org.mx/ejemplo</link>
    <guid>inpc-2026-10</guid>
    <pubDate>Thu, 08 Oct 2026 12:00:00 GMT</pubDate>
    <description><![CDATA[El INPC reportó una inflación anual de 3.50 %.]]></description>
  </item></channel></rss>`;
  const items = parseFeed(xml, source('inegi-inpc-mensual'));
  assert.equal(items.length, 1);
  assert.equal(items[0].publishedAt, '2026-10-08');
  assert.match(items[0].title, /3.50%/);
  assert.equal(items[0].sourceUrl, 'https://www.inegi.org.mx/ejemplo');
});

test('parser de serie INEGI entiende METADATA y Obs reales', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <DATASET><METADATA>
    <Nemonic>INPCVI_Q_O</Nemonic>
    <Name xml:lang="es">Índice de precios al consumidor (INPC). Inflación quincenal, interanual</Name>
    <Unit xml:lang="es">Variación Porcentual</Unit>
    <Freq xml:lang="es">Quincenal</Freq>
    <NoOfDecimals>3</NoOfDecimals>
    <LastUpdate>24/09/2026</LastUpdate>
  </METADATA><SERIE><Obs TimePeriod="2026/09/01" CurrentValue="3.41999999999999990000" /></SERIE></DATASET>`;
  const items = parseInegiSeries(xml, source('inegi-inpc-quincenal'));
  assert.equal(items.length, 1);
  assert.equal(items[0].publishedAt, '2026-09-24');
  assert.equal(items[0].period, '2026/09/01');
  assert.equal(items[0].value, 3.42);
  assert.equal(items[0].valueText, '3.42%');
  assert.match(items[0].summary, /3\.42%/);
  assert.match(items[0].title, /Inflación quincenal/);
});

test('parser INEGI conserva estatus preliminar', () => {
  const xml = `<DATASET><METADATA><Nemonic>IMCPMI_M_O</Nemonic><Name xml:lang="es">Indicador mensual del consumo privado en el mercado interior, Variación anual</Name><Unit xml:lang="es">Variación Porcentual</Unit><NoOfDecimals>1</NoOfDecimals><LastUpdate>05/10/2026</LastUpdate></METADATA><SERIE><Obs TimePeriod="2026/07" CurrentValue="1.249" ValueStatus="Preliminar" /></SERIE></DATASET>`;
  const items = parseInegiSeries(xml, source('inegi-consumo'));
  assert.equal(items[0].publishedAt, '2026-10-05');
  assert.equal(items[0].valueStatus, 'Preliminar');
  assert.equal(items[0].valueText, '1.2%');
  assert.match(items[0].summary, /1\.2%/);
  assert.match(items[0].summary, /Preliminar/);
});

test('parser Banxico tolera HTML y detecta filas con fecha', () => {
  const html = `<table><tr><td>05/11/26</td><td>El objetivo para la Tasa de Interés Interbancaria a 1 día se mantiene en 6.50 por ciento</td></tr><tr><td>24/09/26</td><td>El objetivo para la Tasa de Interés Interbancaria a 1 día se mantiene sin cambio en 6.50 por ciento</td></tr></table>`;
  const items = parseBanxicoList(html, source('banxico-politica'));
  assert.equal(items.length, 2);
  assert.equal(items[0].publishedAt, '2026-11-05');
  assert.match(items[0].title, /6.50/);
});

test('extrae porcentajes escritos como “por ciento” en Banxico', () => {
  assert.equal(extractFact('La tasa se mantiene en 6.50 por ciento'), '6.50%');
  assert.equal(extractFact('Inflación anual de 3,42 %'), '3.42%');
});

test('candidato aplica fecha mínima, relevancia y herramientas', () => {
  const s = source('inegi-inpc-mensual');
  const recent = buildCandidate({
    sourceId: s.id,
    institution: s.institution,
    sourceName: s.name,
    sourceUrl: 'https://www.inegi.org.mx/ejemplo',
    externalId: 'x1',
    title: 'Inflación anual se ubica en 3.50%',
    summary: 'El INPC mostró inflación anual de 3.50%.',
    publishedAt: '2026-10-08',
  }, s, registry.notBefore);
  assert.ok(recent);
  assert.equal(recent.status, 'needs-review');
  assert.equal(recent.detectedFact, '3.50%');
  assert.ok(recent.editorial.tools.includes('/finanzas/presupuesto'));
  assert.ok(recent.editorial.draft);

  const old = buildCandidate({
    sourceId: s.id,
    title: 'Inflación anual de septiembre',
    summary: 'INPC',
    publishedAt: '2026-09-24',
  }, s, registry.notBefore);
  assert.equal(old, null);
});

test('candidato respeta un corte superior y no convierte calendario futuro en publicación', () => {
  const s = source('banxico-politica');
  const item = {
    sourceId: s.id,
    institution: s.institution,
    sourceName: s.name,
    sourceUrl: s.url,
    externalId: '05/11/26:tasa',
    title: 'El objetivo para la Tasa de Interés Interbancaria a 1 día se mantiene en 6.50 por ciento',
    summary: 'El objetivo se mantiene en 6.50 por ciento',
    publishedAt: '2026-11-05',
  };
  assert.equal(buildCandidate(item, s, registry.notBefore, '2026-10-01'), null);
  const allowed = buildCandidate({ ...item, publishedAt: '2026-10-01', externalId: '01/10/26:tasa' }, s, registry.notBefore, '2026-10-01');
  assert.ok(allowed);
  assert.equal(allowed.detectedFact, '6.50%');
});

test('candidato INEGI preliminar conserva periodo, valor y estatus en el preborrador', () => {
  const s = source('inegi-consumo');
  const xml = `<DATASET><METADATA><Nemonic>IMCPMI_M_O</Nemonic><Name xml:lang="es">Indicador mensual del consumo privado en el mercado interior, Variación anual</Name><Unit xml:lang="es">Variación Porcentual</Unit><NoOfDecimals>1</NoOfDecimals><LastUpdate>05/10/2026</LastUpdate></METADATA><SERIE><Obs TimePeriod="2026/07" CurrentValue="1.249" ValueStatus="Preliminar" /></SERIE></DATASET>`;
  const item = parseInegiSeries(xml, s)[0];
  const candidate = buildCandidate(item, s, registry.notBefore);

  assert.ok(candidate);
  assert.equal(candidate.status, 'needs-review');
  assert.equal(candidate.signalType, 'dato-estadistico-preliminar');
  assert.equal(candidate.period, '2026/07');
  assert.equal(candidate.value, 1.249);
  assert.equal(candidate.valueStatus, 'Preliminar');
  assert.equal(candidate.detectedFact, '1.2%');
  assert.equal(candidate.editorial.draft.dataStatus, 'Preliminar');
  assert.match(candidate.editorial.draft.whatHappened, /2026\/07/);
  assert.match(candidate.editorial.draft.whatHappened, /1\.2%/);
  assert.match(candidate.editorial.draft.whatHappened, /Preliminar/);
  assert.match(candidate.editorial.draft.actionFrame, /\/finanzas\/presupuesto/);
  assert.ok(candidate.editorial.draft.whyItMatters.length > 40);
  assert.ok(candidate.editorial.draft.audience.length > 40);
});

test('Banxico se clasifica como decisión institucional y genera preborrador distinto', () => {
  const s = source('banxico-politica');
  const item = {
    sourceId: s.id,
    institution: s.institution,
    sourceName: s.name,
    sourceUrl: s.url,
    externalId: '05/11/26:tasa',
    title: 'El objetivo para la Tasa de Interés Interbancaria a 1 día se mantiene en 6.50 por ciento',
    summary: 'El objetivo para la Tasa de Interés Interbancaria a 1 día se mantiene en 6.50 por ciento',
    publishedAt: '2026-11-05',
  };
  assert.equal(signalType(item, s), 'decision-politica-monetaria');
  const draft = buildEditorialDraft(item, s, '6.50%');
  assert.equal(draft.signalType, 'decision-politica-monetaria');
  assert.match(draft.whatHappened, /Banco de México/);
  assert.match(draft.whatHappened, /2026-11-05/);
  assert.match(draft.whatHappened, /6\.50%/);
  assert.ok(draft.tools.includes('/finanzas/deuda-y-credito'));

  const candidate = buildCandidate(item, s, registry.notBefore);
  assert.equal(candidate.status, 'needs-review');
  assert.equal(candidate.signalType, 'decision-politica-monetaria');
});

test('clave de candidato es determinista', () => {
  const item = { sourceId: 'x', publishedAt: '2026-10-02', externalId: 'abc', title: 'Dato nuevo' };
  assert.equal(candidateKey(item), candidateKey({ ...item }));
  assert.notEqual(candidateKey(item), candidateKey({ ...item, title: 'Otro dato' }));
});

test('registro solo usa dominios oficiales y límites conservadores', () => {
  assert.ok(registry.maxCandidatesPerRun <= 5);
  assert.equal(registry.notBefore, '2026-10-01');
  for (const s of registry.sources) {
    const host = new URL(s.url).hostname;
    assert.ok(host.endsWith('inegi.org.mx') || host.endsWith('banxico.org.mx'));
    assert.ok(s.tools.every((href) => href.startsWith('/')));
  }
});

test('workflow recolector no puede publicar contenido en el repositorio', () => {
  const workflow = readFileSync(new URL('../.github/workflows/radar-collector.yml', import.meta.url), 'utf8');
  assert.match(workflow, /^\s+contents:\s*read\s*$/m);
  assert.doesNotMatch(workflow, /^\s+contents:\s*write\s*$/m);
  assert.doesNotMatch(workflow, /^\s*-?\s*run:\s*.*git\s+push/im);
  assert.match(workflow, /NO PUBLICADO/);
  assert.match(workflow, /Preborrador estructural/);
  assert.match(workflow, /radar-payload:/);
  assert.match(workflow, /\/preparar/);
});
