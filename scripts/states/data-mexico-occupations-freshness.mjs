import { readFileSync } from 'node:fs';

const snapshot = JSON.parse(readFileSync(new URL('../../src/data/stateOccupations.json', import.meta.url), 'utf8'));
const catalog = JSON.parse(readFileSync(new URL('../../src/data/estados.json', import.meta.url), 'utf8')).estados;

export function nextQuarter(value) {
  const raw = String(value ?? '');
  if (!/^\d{5}$/.test(raw)) throw new Error(`Quarter inválido: ${value}`);
  const year = Number(raw.slice(0, 4));
  const quarter = Number(raw.slice(4));
  if (quarter < 1 || quarter > 4) throw new Error(`Quarter inválido: ${value}`);
  return quarter === 4 ? `${year + 1}1` : `${year}${quarter + 1}`;
}

export function quarterLabel(value) {
  const raw = String(value);
  return `${raw.slice(0,4)}-T${raw.slice(4)}`;
}

export function analyzeQuarterPayload(payload, expectedStates = 32) {
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  const ids = new Set(rows.map((row) => Number(row['State ID'])).filter((id) => Number.isInteger(id) && id > 0));
  return {
    rows: rows.length,
    stateCount: ids.size,
    complete: ids.size === expectedStates,
  };
}

export function buildAvailabilityUrl(targetQuarter) {
  const params = new URLSearchParams({
    'Population Classification': '1',
    Quarter: targetQuarter,
    cube: 'inegi_enoe',
    drilldowns: 'State',
    measures: 'Workforce,Number of Records',
    parents: 'true',
    sparse: 'false',
    locale: 'es',
  });
  return `https://www.economia.gob.mx/datamexico/api/data?${params.toString()}`;
}

async function main() {
  const targetQuarter = nextQuarter(snapshot.quarter);
  const url = buildAvailabilityUrl(targetQuarter);
  const response = await fetch(url, {
    headers: { 'user-agent': 'MiLana-state-occupations-freshness/1.0' },
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw new Error(`Data México respondió HTTP ${response.status}`);
  const payload = await response.json();
  const analysis = analyzeQuarterPayload(payload, catalog.length);
  process.stdout.write(`${JSON.stringify({
    currentQuarter: snapshot.quarter,
    currentLabel: snapshot.period,
    targetQuarter,
    targetLabel: quarterLabel(targetQuarter),
    sourceUrl: url,
    expectedStates: catalog.length,
    ...analysis,
    available: analysis.complete,
  })}\n`);
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
