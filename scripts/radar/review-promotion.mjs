import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { reviewPromotionDiff, renderReviewMarkdown } from './review-lib.mjs';

const args = process.argv.slice(2);
function arg(name, fallback = null) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
}

const basePath = arg('--base', 'tmp/economia.base.json');
const headPath = arg('--head', 'src/data/economia.json');
const registryPath = arg('--registry', 'src/data/radar-sources.json');
const filesPath = arg('--files', 'tmp/changed-files.txt');
const outputPath = arg('--output', 'tmp/radar-review.json');
const markdownPath = arg('--markdown', 'tmp/radar-review.md');

async function readJson(path) {
  return JSON.parse(await readFile(resolve(path), 'utf8'));
}

async function writeText(path, value) {
  const destination = resolve(path);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, value, 'utf8');
}

let report;
try {
  const [base, head, registry] = await Promise.all([
    readJson(basePath),
    readJson(headPath),
    readJson(registryPath),
  ]);
  let changedFiles = [];
  try {
    changedFiles = (await readFile(resolve(filesPath), 'utf8')).split(/\r?\n/).filter(Boolean);
  } catch {
    // El workflow normal siempre genera esta lista; la CLI tolera su ausencia para pruebas locales.
  }
  report = reviewPromotionDiff(base, head, registry, changedFiles);
} catch (error) {
  report = {
    ok: false,
    blockers: [error instanceof Error ? error.message : String(error)],
    warnings: [],
    addedArticle: null,
    addedSource: null,
    changedFiles: [],
  };
}

await writeText(outputPath, `${JSON.stringify(report, null, 2)}\n`);
await writeText(markdownPath, `${renderReviewMarkdown(report)}\n`);
console.log(`Radar PR review: ${report.ok ? 'OK' : 'BLOQUEADO'} · ${report.blockers.length} bloqueos · ${report.warnings.length} advertencias`);
