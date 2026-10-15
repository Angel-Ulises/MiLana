import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { prepararUrlsPages, pagesRedirects, verificarSitemapEstatico, canonicales } from '../scripts/cloudflare-pages.mjs';

const ORIGEN = 'https://www.milanaaqui.mx';

function html(ruta) {
  const href = ruta === '/' ? `${ORIGEN}/` : `${ORIGEN}${ruta}`;
  return `<!doctype html><html><head><link rel="canonical" href="${href}"></head><body>${ruta}</body></html>`;
}

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'milana-pages-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const dist = join(root, 'dist');
  mkdirSync(join(dist, 'finanzas/match'), { recursive: true });
  mkdirSync(join(dist, 'aprende/guia'), { recursive: true });
  mkdirSync(join(dist, 'guias/aguinaldo-2026'), { recursive: true });
  writeFileSync(join(dist, 'index.html'), html('/'));
  writeFileSync(join(dist, '404.html'), '<title>Página no encontrada</title><h1>Esta página no existe.</h1>');
  writeFileSync(join(dist, 'finanzas/index.html'), html('/finanzas'));
  writeFileSync(join(dist, 'finanzas/match/index.html'), html('/finanzas/match'));
  writeFileSync(join(dist, 'aprende/guia/index.html'), html('/aprende/guia'));
  writeFileSync(join(dist, 'guias/index.html'), html('/guias'));
  writeFileSync(join(dist, 'guias/aguinaldo-2026/index.html'), html('/guias/aguinaldo-2026'));
  writeFileSync(join(dist, '_headers'), 'https://:project.pages.dev/*\n  X-Robots-Tag: noindex\nhttps://:version.:project.pages.dev/*\n  X-Robots-Tag: noindex\n');
  writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${ORIGEN}/</loc></url>
  <url><loc>${ORIGEN}/finanzas</loc></url>
  <url><loc>${ORIGEN}/finanzas/match</loc></url>
  <url><loc>${ORIGEN}/aprende/guia</loc></url>
</urlset>
`);
  writeFileSync(join(root, 'vercel.json'), JSON.stringify({ redirects: [
    { source: '/guias', destination: '/aprende', permanent: true },
    { source: '/guias/aguinaldo-2026', destination: '/aprende/aguinaldo-bruto-neto', permanent: true },
  ] }));
  return { root, dist };
}

test('Pages mueve index anidados a .html y alinea el sitemap sin slash', t => {
  const { root, dist } = fixture(t);
  const primero = prepararUrlsPages({ root, dist });
  assert.deepEqual(primero.canonicas, ['/', '/finanzas', '/finanzas/match', '/aprende/guia']);
  assert.equal(existsSync(join(dist, 'finanzas/index.html')), false);
  assert.equal(existsSync(join(dist, 'finanzas/match/index.html')), false);
  assert.equal(readFileSync(join(dist, 'finanzas.html'), 'utf8'), html('/finanzas'));
  assert.equal(readFileSync(join(dist, 'finanzas/match.html'), 'utf8'), html('/finanzas/match'));
  assert.equal(readFileSync(join(dist, 'aprende/guia.html'), 'utf8'), html('/aprende/guia'));
  const redirects = readFileSync(join(dist, '_redirects'), 'utf8');
  assert.match(redirects, /^\/finanzas\/ \/finanzas 308$/m);
  assert.match(redirects, /^\/finanzas\/match\/ \/finanzas\/match 308$/m);
  assert.match(redirects, /^\/aprende\/guia\/ \/aprende\/guia 308$/m);
  assert.match(redirects, /^\/guias \/aprende 308$/m);
  assert.match(redirects, /^\/guias\.html \/aprende 308$/m);
  assert.match(redirects, /^\/guias\/aguinaldo-2026\/index.html \/aprende\/aguinaldo-bruto-neto 308$/m);
  assert.match(redirects, /^\/index.html \/ 308$/m);
  assert.doesNotMatch(redirects, /^\/finanzas \/ /m);
  const headers = readFileSync(join(dist, '_headers'), 'utf8');
  assert.match(headers, /:project\.pages\.dev/);
  assert.match(headers, /X-Content-Type-Options: nosniff/);
  assert.equal((headers.match(/X-Content-Type-Options/g) ?? []).length, 1);
  const global = headers.split('\n\n').find(block => /(^|\n)\/\*\n/.test(block));
  assert.ok(global);
  assert.match(global, /nosniff/);
  assert.doesNotMatch(global, /X-Robots-Tag/);
  const segundo = prepararUrlsPages({ root, dist });
  assert.deepEqual(segundo.moved, []);
  assert.equal(readFileSync(join(dist, '_redirects'), 'utf8'), redirects);
  assert.equal((readFileSync(join(dist, '_headers'), 'utf8').match(/Sin noindex global/g) ?? []).length, 1);
});

test('un index anidado del sitemap falla porque Pages lo redirige al slash', t => {
  const { dist } = fixture(t);
  writeFileSync(join(dist, '_redirects'), '/finanzas/ /finanzas 308\n/finanzas/index.html /finanzas 308\n/finanzas/match/ /finanzas/match 308\n/finanzas/match/index.html /finanzas/match 308\n/aprende/guia/ /aprende/guia 308\n/aprende/guia/index.html /aprende/guia 308\n');
  assert.throws(() => verificarSitemapEstatico(dist), /provocaría 308/);
});

test('Pages rechaza colisión y canonical distinto antes de dar por buena la salida', t => {
  const colision = fixture(t);
  writeFileSync(join(colision.dist, 'finanzas.html'), 'conflicto');
  assert.throws(() => prepararUrlsPages(colision), /Colisión/);
  assert.equal(readFileSync(join(colision.dist, 'finanzas/index.html'), 'utf8'), html('/finanzas'));
  const malo = fixture(t);
  writeFileSync(join(malo.dist, 'finanzas/index.html'), html('/otra'));
  assert.throws(() => prepararUrlsPages(malo), /no coincide/);
});

test('Pages no admite redirects externos, conflictos ni ciclos', () => {
  assert.throws(() => pagesRedirects([], [{ source: '/a', destination: '/b' }, { source: '/a', destination: '/c', permanent: true }]), /conflicto/);
  assert.throws(() => pagesRedirects([], [{ source: '/a', destination: '//externo.example', permanent: true }]), /no soportado/);
  assert.throws(() => pagesRedirects([], [{ source: '/a', destination: '/b', permanent: true }, { source: '/b', destination: '/a', permanent: true }]), /Ciclo/);
  const redirects = pagesRedirects(['/', '/aprende'], [{ source: '/guias', destination: '/aprende', permanent: true }]);
  assert.match(redirects, /^\/guias \/aprende 308$/m);
  assert.match(redirects, /^\/aprende\/ \/aprende 308$/m);
  assert.doesNotMatch(redirects, /\*/);
});

test('el build prepara las clean URLs antes de auditar y cierra con el chequeo HTTP del sitemap', () => {
  const build = JSON.parse(readFileSync('package.json', 'utf8')).scripts.build;
  assert.ok(build.indexOf('normalizar-urls-estaticas.mjs') < build.indexOf('preparar-urls-pages.mjs'));
  assert.ok(build.indexOf('preparar-urls-pages.mjs') < build.indexOf('verificar-orbita-generada.mjs'));
  assert.ok(build.indexOf('verificar-seo-estatico.mjs') < build.indexOf('verificar-sitemap-sin-redirect.mjs'));
  const canon = canonicales('<link href="https://www.milanaaqui.mx/aprende" rel="canonical"><link rel="canonical" href="https://www.milanaaqui.mx/aprende">');
  assert.deepEqual(canon, ['https://www.milanaaqui.mx/aprende']);
});
