import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { debeRevisar, urlCandidata, validarConfiguracion } from '../scripts/estados/check-enoe-update.mjs';

const config = JSON.parse(readFileSync('src/data/actualizacionEstados.json','utf8'));
const laboral = JSON.parse(readFileSync('src/data/mercadoLaboralEstados.json','utf8'));
const workflow = readFileSync('.github/workflows/estados-enoe-freshness.yml','utf8');

test('calendario estatal apunta al siguiente trimestre oficial sin API token', () => {
  assert.equal(config.periodoActual, '2026-T2');
  assert.equal(config.proximoPeriodo, '2026-T3');
  assert.equal(config.proximaPublicacion, '2026-11-25');
  assert.equal(laboral.actualizado, config.periodoActual);
  assert.equal(laboral.publicado, config.publicacionActual);
  assert.equal(urlCandidata(), 'https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2026/enoe/enoe2026_11.pdf');
  assert.equal(validarConfiguracion(), true);
});

test('no consulta una publicación futura antes de su fecha programada', () => {
  assert.equal(debeRevisar(new Date('2026-11-24T23:59:59-06:00')), false);
  assert.equal(debeRevisar(new Date('2026-11-25T00:00:00-06:00')), true);
});

test('workflow de frescura es semanal, oficial y no puede publicar datos', () => {
  assert.match(workflow, /cron: '20 16 \* \* 3'/);
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /issues: write/);
  assert.doesNotMatch(workflow, /contents: write/);
  assert.match(workflow, /check-enoe-update\.mjs/);
  assert.match(workflow, /gh issue create/);
  assert.match(workflow, /no modifica ni publica cifras automáticamente/i);
});

test('detector solo construye URLs HTTPS del dominio oficial configurado', () => {
  const url = new URL(urlCandidata());
  assert.equal(url.protocol, 'https:');
  assert.equal(url.hostname, 'www.inegi.org.mx');
  assert.equal(config.dominioPermitido, 'www.inegi.org.mx');
});
