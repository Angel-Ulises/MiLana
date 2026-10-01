import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  parseFeed,
  parseBanxicoList,
  buildCandidate,
  candidateKey,
  normalizeDate,
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

test('parser RSS extrae título, fecha, enlace y resumen', () => {
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

test('parser Banxico tolera HTML y detecta filas con fecha', () => {
  const html = `<table><tr><td>05/11/26</td><td>El objetivo para la Tasa de Interés Interbancaria a 1 día se mantiene en 6.50 por ciento</td></tr><tr><td>24/09/26</td><td>El objetivo para la Tasa de Interés Interbancaria a 1 día se mantiene sin cambio en 6.50 por ciento</td></tr></table>`;
  const items = parseBanxicoList(html, source('banxico-politica'));
  assert.equal(items.length, 2);
  assert.equal(items[0].publishedAt, '2026-11-05');
  assert.match(items[0].title, /6.50/);
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

  const old = buildCandidate({
    sourceId: s.id,
    title: 'Inflación anual de septiembre',
    summary: 'INPC',
    publishedAt: '2026-09-24',
  }, s, registry.notBefore);
  assert.equal(old, null);
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

test('workflow no puede publicar contenido en el repositorio', () => {
  const workflow = readFileSync(new URL('../.github/workflows/radar-collector.yml', import.meta.url), 'utf8');
  assert.match(workflow, /contents:\s*read/);
  assert.doesNotMatch(workflow, /contents:\s*write/);
  assert.doesNotMatch(workflow, /git\s+push/i);
  assert.match(workflow, /NO PUBLICADO/);
});
