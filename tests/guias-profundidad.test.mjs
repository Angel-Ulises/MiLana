import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { profundizarGuia } from '../scripts/guias-profundidad.mjs';

const { guias } = JSON.parse(readFileSync('src/data/aprende-resumen.json', 'utf8'));
const texto = (h) => h.slice(h.indexOf('<article'), h.indexOf('</article>')).replace(/<[^>]+>/g, '');

test('cada guía publicada tiene su «En 30 segundos» de tres ideas', () => {
  const publicadas = readdirSync('public/aprende', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  assert.deepEqual(Object.keys(guias).sort(), publicadas);
  for (const [slug, puntos] of Object.entries(guias)) {
    assert.equal(puntos.length, 3, slug);
    for (const p of puntos) assert.ok(p.length > 30 && p.length < 170, `${slug}: ${p}`);
  }
});

test('el pliegue conserva todo el texto, deja abierta la primera sección y no pliega fuentes ni CTA', () => {
  for (const slug of Object.keys(guias)) {
    const original = readFileSync(`public/aprende/${slug}/index.html`, 'utf8');
    const salida = profundizarGuia(original, guias[slug]);
    assert.equal(texto(salida).replace('En 30 segundos' + guias[slug].join(''), ''), texto(original), slug);
    const art = salida.slice(salida.indexOf('<article'), salida.indexOf('</article>'));
    assert.match(art, /<\/aside><h2>/, `${slug}: primera sección abierta`);
    assert.doesNotMatch(art, /<details class="guide-more">[^]*?<section class="sources">[^]*?<\/details>/, `${slug}: fuentes fuera de pliegues`);
    assert.equal(profundizarGuia(salida, guias[slug]), salida, `${slug}: idempotente`);
  }
});

test('el paso corre en el build después del SEO de guías', () => {
  const build = JSON.parse(readFileSync('package.json', 'utf8')).scripts.build;
  assert.ok(build.indexOf('guias-profundidad.mjs') > build.indexOf('mejorar-guias-seo.mjs'));
  assert.ok(build.indexOf('guias-profundidad.mjs') < build.indexOf('aplicar-orbita-base.mjs'));
  assert.ok(existsSync('scripts/guias-profundidad.mjs'));
});
