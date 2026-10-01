import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseFeed,
  parseInegiSeries,
  parseBanxicoList,
  buildCandidate,
} from './collector-lib.mjs';
import { candidateAlreadyPublished } from './published-dedupe.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const registry = JSON.parse(await readFile(resolve(ROOT, 'src/data/radar-sources.json'), 'utf8'));
const economia = JSON.parse(await readFile(resolve(ROOT, 'src/data/economia.json'), 'utf8'));

const args = process.argv.slice(2);
const outIndex = args.indexOf('--output');
const output = outIndex >= 0 ? args[outIndex + 1] : resolve(ROOT, 'tmp/radar-candidates.json');
const timeoutMs = Number(process.env.RADAR_FETCH_TIMEOUT_MS || 15000);

function todayInMexico(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'MiLana-Radar/1.0 (+https://www.milanaaqui.mx/economia)',
        accept: 'application/rss+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.5',
      },
      redirect: 'follow',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function parseByKind(body, source) {
  if (source.kind === 'rss') return parseFeed(body, source);
  if (source.kind === 'inegi-series') return parseInegiSeries(body, source);
  if (source.kind === 'banxico-list') return parseBanxicoList(body, source);
  throw new Error(`Tipo de fuente no soportado: ${source.kind}`);
}

const health = [];
const candidates = [];
const notAfter = todayInMexico();

for (const source of registry.sources) {
  try {
    const body = await fetchText(source.url);
    const items = parseByKind(body, source);
    if (!items.length) throw new Error('La fuente respondió, pero el parser no encontró entradas');

    const fresh = items
      .map((item) => buildCandidate(item, source, registry.notBefore, notAfter))
      .filter(Boolean)
      .filter((candidate) => !candidateAlreadyPublished(candidate, economia, source));

    candidates.push(...fresh);
    health.push({ sourceId: source.id, ok: true, parsedItems: items.length, freshCandidates: fresh.length });
  } catch (error) {
    health.push({
      sourceId: source.id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const deduped = [...new Map(candidates.map((candidate) => [candidate.key, candidate])).values()]
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  .slice(0, registry.maxCandidatesPerRun);

const payload = {
  generatedAt: new Date().toISOString(),
  mode: 'candidate-only',
  notBefore: registry.notBefore,
  notAfter,
  maxCandidatesPerRun: registry.maxCandidatesPerRun,
  candidateCount: deduped.length,
  candidates: deduped,
  health,
};

await mkdir(dirname(resolve(output)), { recursive: true });
await writeFile(resolve(output), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

console.log(`Radar: ${deduped.length} candidatos; ${health.filter((x) => x.ok).length}/${health.length} fuentes sanas; corte ${notAfter}.`);
for (const source of health) {
  console.log(`${source.ok ? 'OK' : 'FAIL'} ${source.sourceId}${source.ok ? ` · ${source.parsedItems} entradas · ${source.freshCandidates} nuevas` : ` · ${source.error}`}`);
}
