import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { detectarT3, debeRevisar, revisar } from '../.github/scripts/check-shf-update.mjs';

const workflow = readFileSync('.github/workflows/estados-shf-freshness.yml','utf8');
const checker = readFileSync('.github/scripts/check-shf-update.mjs','utf8');
const policy = readFileSync('scripts/vercel-build-policy.mjs','utf8');

test('detector reconoce T3 2026 y no confunde el T2 vigente', () => {
  const t2 = '<a>Índice SHF datos abiertos T2 2026</a><a>Índice SHF T2 2026</a>';
  const t3 = '<a>Índice SHF datos abiertos T3 2026</a><a>Índice SHF T3 2026</a>';
  const tercero = '<p>Índice SHF de Precios de la Vivienda, tercer trimestre de 2026</p>';
  assert.equal(detectarT3(t2), false);
  assert.equal(detectarT3(t3), true);
  assert.equal(detectarT3(tercero), true);
});

test('no consulta antes de la ventana conservadora de revisión', async () => {
  assert.equal(debeRevisar(new Date('2026-10-25T23:59:59-06:00')), false);
  assert.equal(debeRevisar(new Date('2026-10-26T00:00:00-06:00')), true);
  const estado = await revisar({ hoy: new Date('2026-10-25T12:00:00-06:00') });
  assert.equal(estado.nuevaPublicacion, false);
  assert.equal(estado.estado, 'aun-no-corresponde');
  assert.equal(estado.periodoActual, '2026-T2');
  assert.equal(estado.proximoPeriodo, '2026-T3');
});

test('modo de prueba solo alerta ante contenido T3 explícito', async () => {
  const sinNueva = await revisar({ force: true, html: '<h2>Índice SHF T2 2026</h2>' });
  const conNueva = await revisar({ force: true, html: '<h2>Índice SHF T3 2026</h2>' });
  assert.equal(sinNueva.nuevaPublicacion, false);
  assert.equal(sinNueva.estado, 'sin-publicacion-nueva');
  assert.equal(conNueva.nuevaPublicacion, true);
  assert.equal(conNueva.estado, 'nuevo-shf-disponible');
});

test('checker queda limitado a la página oficial de SHF en gob.mx', () => {
  assert.match(checker, /https:\/\/www\.gob\.mx\/shf\/documentos\/indice-shf-de-precios-de-la-vivienda-en-mexico-2025-a-2026/);
  assert.match(checker, /ALLOWED_HOSTS/);
  assert.match(checker, /www\.gob\.mx/);
  assert.match(checker, /gob\.mx/);
  assert.doesNotMatch(checker, /axios|puppeteer|playwright/i);
});

test('workflow SHF es semanal, deduplicado y nunca modifica contenido', () => {
  assert.match(workflow, /cron: '50 16 \* \* 3'/);
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /issues: write/);
  assert.doesNotMatch(workflow, /contents: write/);
  assert.doesNotMatch(workflow, /git push|gh pr merge|npm run build|vercel/i);
  assert.match(workflow, /check-shf-update\.mjs/);
  assert.match(workflow, /gh issue list/);
  assert.match(workflow, /gh issue create/);
  assert.match(workflow, /no cambia, no publica y no infiere cifras automáticamente/i);
});

test('cambios del watcher son operativos y Vercel puede omitirlos', () => {
  assert.match(policy, /'\.github\/'/);
  assert.match(policy, /'tests\/'/);
});
