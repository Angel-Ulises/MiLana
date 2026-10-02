import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CETES_REFERENCE } from '../src/data/cetes-reference.js';
import { compareCetesSnapshots, parseCetesOfficialTable } from '../scripts/inversion/cetes-reference-lib.mjs';

const page = readFileSync('src/cetesReferencePage.jsx','utf8');
const comparePage = readFileSync('src/investmentInstrumentComparePage.jsx','utf8');
const main = readFileSync('src/main.jsx','utf8');
const generator = readFileSync('scripts/generar-inversion.mjs','utf8');
const sitemap = readFileSync('scripts/generar-sitemap-final.mjs','utf8');
const workflow = readFileSync('.github/workflows/cetes-reference-watch.yml','utf8');

test('snapshot CETES conserva fecha, fuente y cinco plazos oficiales verificados', () => {
  assert.equal(CETES_REFERENCE.sourceDate, '2026-09-28');
  assert.equal(CETES_REFERENCE.products.length, 5);
  assert.deepEqual(CETES_REFERENCE.products.map((p) => [p.days, p.indicativePrice, p.grossAnnualRatePct]), [
    [28, 9.95, 6.15],
    [91, 9.83, 6.59],
    [182, 9.67, 6.91],
    [364, 9.31, 7.24],
    [728, 8.68, 8.01],
  ]);
  assert.match(CETES_REFERENCE.sourceUrl, /^https:\/\/www\.cetesdirecto\.com\//);
  assert.match(CETES_REFERENCE.scope, /no son una cotización|No son una cotización/i);
});

test('parser entiende fecha, precio y tasa de una tabla oficial equivalente', () => {
  const html = `<html><body><h1>CETES&nbsp;&nbsp;28 Septiembre 2026</h1><table>
  <tr><td>1 mes</td><td>9.95</td><td>6.15</td></tr>
  <tr><td>3 meses</td><td>9.83</td><td>6.59</td></tr>
  <tr><td>6 meses</td><td>9.67</td><td>6.91</td></tr>
  <tr><td>1 año</td><td>9.31</td><td>7.24</td></tr>
  <tr><td>2 años</td><td>8.68</td><td>8.01</td></tr>
  </table></body></html>`;
  const parsed = parseCetesOfficialTable(html);
  assert.equal(parsed.sourceDate, '2026-09-28');
  assert.equal(parsed.products[0].grossAnnualRatePct, 6.15);
  assert.equal(parsed.products[4].indicativePrice, 8.68);
});

test('comparador de snapshots detecta solo cambios reales', () => {
  const same = compareCetesSnapshots(CETES_REFERENCE, { sourceDate:CETES_REFERENCE.sourceDate, products:CETES_REFERENCE.products });
  assert.equal(same.changed, false);
  const changed = compareCetesSnapshots(CETES_REFERENCE, { sourceDate:'2026-10-05', products:CETES_REFERENCE.products.map((p) => p.id === 'cetes-28' ? {...p, grossAnnualRatePct:6.10} : p) });
  assert.equal(changed.changed, true);
  assert.ok(changed.changes.some((line) => /cetes-28.*tasa/i.test(line)));
});

test('página pública muestra datos fechados sin ranking ni recomendación', () => {
  assert.match(page, /snapshot/i);
  assert.match(page, /Tasa bruta anual publicada/i);
  assert.match(page, /Precio indicativo publicado/i);
  assert.match(page, /no es una cotización en tiempo real/i);
  assert.match(page, /no ordena las opciones/i);
  assert.doesNotMatch(page, /mejor CETE|te conviene|recomendamos comprar|compra ahora/i);
});

test('ruta CETES tiene prioridad, enlace, HTML estático y sitemap', () => {
  assert.match(main, /esRutaCetesReferencia/);
  assert.ok(main.indexOf('cetesReferencia ?') < main.indexOf('finanzas ?'));
  assert.match(comparePage, /\/finanzas\/inversion\/cetes/);
  assert.match(generator, /destino:\['finanzas','inversion','cetes'\]/);
  assert.match(generator, /cetes-reference/);
  assert.match(sitemap, /\/finanzas\/inversion\/cetes/);
});

test('watcher de frescura no puede escribir contenido ni publicar tasas', () => {
  assert.match(workflow, /contents:\s*read/);
  assert.match(workflow, /issues:\s*write/);
  assert.doesNotMatch(workflow, /contents:\s*write/);
  assert.doesNotMatch(workflow, /git\s+push|createPullRequest|pull-requests:\s*write/i);
  assert.match(workflow, /No actualizar automáticamente/i);
});
