import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { decodeCandidatePayload, promotionReport } from './promotion-lib.mjs';

const args = process.argv.slice(2);
function arg(name, fallback = null) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
}

const eventPath = arg('--event', process.env.GITHUB_EVENT_PATH);
const economiaPath = arg('--economia', 'src/data/economia.json');
const registryPath = arg('--registry', 'src/data/radar-sources.json');
const outputPath = arg('--output', 'tmp/radar-promotion.json');
const nextPath = arg('--next', 'tmp/economia.next.json');

async function writeJson(path, value) {
  const destination = resolve(path);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

let report;
try {
  if (!eventPath) throw new Error('No se recibió GITHUB_EVENT_PATH ni --event');
  const event = JSON.parse(await readFile(resolve(eventPath), 'utf8'));
  const issueBody = event?.issue?.body || '';
  const candidate = decodeCandidatePayload(issueBody);
  const registry = JSON.parse(await readFile(resolve(registryPath), 'utf8'));
  const economia = JSON.parse(await readFile(resolve(economiaPath), 'utf8'));
  report = promotionReport(candidate, registry, economia);
} catch (error) {
  report = {
    ok: false,
    candidateKey: null,
    sourceId: null,
    article: null,
    publicSource: null,
    blockers: [error instanceof Error ? error.message : String(error)],
    warnings: [],
    validatedAt: new Date().toISOString().slice(0, 10),
    nextEconomia: null,
  };
}

await writeJson(outputPath, { ...report, nextEconomia: undefined });
if (report.ok && report.nextEconomia) await writeJson(nextPath, report.nextEconomia);

console.log(`Radar promoción: ${report.ok ? 'OK' : 'BLOQUEADA'}${report.candidateKey ? ` · ${report.candidateKey}` : ''}`);
for (const blocker of report.blockers || []) console.log(`BLOCKER · ${blocker}`);
for (const warning of report.warnings || []) console.log(`WARN · ${warning}`);
