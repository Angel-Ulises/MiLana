import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { CETES_REFERENCE } from '../src/data/cetes-reference.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const workflow = readFileSync(new URL('../.github/workflows/cetes-reference-watch.yml', import.meta.url), 'utf8');

test('cron y ejecuciones manuales comparan la rama publicada, no main', () => {
  assert.match(workflow, /schedule:\s*\n\s*- cron:/);
  assert.match(workflow, /workflow_dispatch:/);
  const steps = workflow.split(/^      - /m).slice(1);
  const checkout = steps.find((step) => /uses: actions\/checkout@/.test(step));
  assert.ok(checkout, 'requiere checkout explícito');
  assert.match(checkout, /^        with:\s*\n          ref: claude\/cloudflare-pages\s*$/m);
  assert.doesNotMatch(checkout, /^        (?:if|continue-on-error):/m);
  assert.match(workflow, /run: node scripts\/inversion\/check-cetes-reference\.mjs/);
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /issues: write/);
  assert.doesNotMatch(workflow, /contents: write|pull-requests: write|git push|continue-on-error:/);
  assert.match(workflow, /No actualizar automáticamente/);
});

function checkWithResponse(response) {
  const dir = mkdtempSync(join(tmpdir(), 'milana-cetes-'));
  try {
    const mock = join(dir, 'fetch.mjs');
    const output = join(dir, 'output');
    writeFileSync(output, '');
    writeFileSync(mock, `globalThis.fetch = async () => (${response});`);
    const result = spawnSync(process.execPath, ['--import', mock, 'scripts/inversion/check-cetes-reference.mjs'], {
      cwd: root, encoding: 'utf8', env: { ...process.env, GITHUB_OUTPUT: output },
    });
    return { ...result, outputs: readFileSync(output, 'utf8') };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function officialTable(products = CETES_REFERENCE.products) {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const [year, month, day] = CETES_REFERENCE.sourceDate.split('-');
  return `<h1>CETES ${Number(day)} ${months[Number(month) - 1]} ${year}</h1><table>${products.map((p) => `<tr><td>${p.displayTerm}</td><td>${p.indicativePrice}</td><td>${p.grossAnnualRatePct}</td></tr>`).join('')}</table>`;
}

for (const changed of [false, true]) {
  test(`checker usa snapshot del checkout y emite changed=${changed}`, () => {
    const products = CETES_REFERENCE.products.map((p, i) => i === 0 && changed ? { ...p, grossAnnualRatePct: p.grossAnnualRatePct + 0.01 } : p);
    const result = checkWithResponse(`{ ok: true, text: async () => ${JSON.stringify(officialTable(products))} }`);
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.currentSourceDate, CETES_REFERENCE.sourceDate);
    assert.equal(payload.changed, changed);
    assert.match(result.outputs, new RegExp(`^changed=${changed}$`, 'm'));
    const encoded = result.outputs.match(/^payload_b64=(.+)$/m)[1];
    assert.deepEqual(JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')), payload);
  });
}

for (const response of [
  '{ ok: false, status: 503 }',
  '{ ok: true, text: async () => "<html>sin tabla</html>" }',
]) {
  test(`fallo de fuente no se convierte en señal para cerrar alerta: ${response}`, () => {
    const result = checkWithResponse(response);
    assert.notEqual(result.status, 0);
    assert.equal(result.outputs, '');
  });
}
