import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { versionarDist, versionarHtml } from '../scripts/versionar-recursos.mjs';

function distDePrueba() {
  const dist = mkdtempSync(join(tmpdir(), 'milana-dist-'));
  mkdirSync(join(dist, 'assets'));
  mkdirSync(join(dist, 'finanzas'));
  writeFileSync(join(dist, 'orbita-v3-prepaint.css'), '.hero{min-height:860px}');
  writeFileSync(join(dist, 'orbita-v3-base.js'), 'console.log(1)');
  writeFileSync(join(dist, 'assets/index-abc123.css'), 'x');
  const html = '<link rel="stylesheet" href="/orbita-v3-prepaint.css" data-orbita-prepaint><script src="/orbita-v3-base.js" defer></script>'
    + '<link rel="stylesheet" href="/assets/index-abc123.css"><link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet"><a href="/finanzas">x</a>';
  writeFileSync(join(dist, 'index.html'), html);
  writeFileSync(join(dist, 'finanzas.html'), html);
  return dist;
}
const corto = (s) => createHash('sha256').update(s).digest('hex').slice(0, 10);

test('los CSS/JS sin hash reciben ?v= con el hash de su contenido; /assets, externos y enlaces no cambian', () => {
  const dist = distDePrueba();
  const r = versionarDist(dist);
  assert.deepEqual(r, { archivos: 2, recursos: 2 });
  const html = readFileSync(join(dist, 'index.html'), 'utf8');
  assert.match(html, new RegExp(`href="/orbita-v3-prepaint\\.css\\?v=${corto('.hero{min-height:860px}')}" data-orbita-prepaint`));
  assert.match(html, new RegExp(`src="/orbita-v3-base\\.js\\?v=${corto('console.log(1)')}"`));
  assert.match(html, /href="\/assets\/index-abc123\.css"/);
  assert.match(html, /href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter"/);
  assert.match(html, /<a href="\/finanzas">/);
});

test('un cambio de contenido cambia la URL y una segunda pasada no duplica la versión', () => {
  const dist = distDePrueba();
  versionarDist(dist);
  assert.deepEqual(versionarDist(dist), { archivos: 0, recursos: 0 });
  const antes = versionarHtml('<link href="/orbita-v3-prepaint.css">', dist);
  writeFileSync(join(dist, 'orbita-v3-prepaint.css'), '.hero{min-height:1104px}');
  const despues = versionarHtml('<link href="/orbita-v3-prepaint.css">', dist);
  assert.notEqual(antes, despues);
});

test('una referencia a un recurso ausente detiene el build', () => {
  const dist = distDePrueba();
  assert.throws(() => versionarHtml('<script src="/no-existe.js"></script>', dist), /ausente/);
});

test('el build versiona al final, después del empaquetado de URLs limpias', () => {
  const build = JSON.parse(readFileSync('package.json', 'utf8')).scripts.build;
  assert.ok(build.trim().endsWith('node scripts/versionar-recursos.mjs'));
  assert.ok(build.indexOf('versionar-recursos.mjs') > build.indexOf('empaquetar-urls-limpias.mjs'));
});
