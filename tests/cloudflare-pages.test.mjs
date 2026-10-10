import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { preparePages, pagesHeaders, pagesRedirects, PAGES_LIMITS } from '../scripts/cloudflare-pages.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'milana-pages-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'dist/aprende/ejemplo'), { recursive: true });
  for (const name of ['index.html', '404.html', 'robots.txt', 'ads.txt', 'sitemap.xml', 'aprende/index.html', 'aprende/ejemplo/index.html']) {
    writeFileSync(join(root, 'dist', name), `<canonical href="https://www.milanaaqui.mx/${name}">original-${name}`);
  }
  writeFileSync(join(root, 'vercel.json'), JSON.stringify({ redirects: [{ source: '/guias', destination: '/aprende', permanent: true }] }));
  return root;
}
test('Pages conserva bytes, canonicals y dist original al aplanar clean URLs', t => {
  const root = fixture(t), report = preparePages({ root });
  assert.equal(report.mode, 'preview');
  assert.equal(report.fileCount, 9);
  assert.deepEqual(report.routes, ['/', '/aprende', '/aprende/ejemplo']);
  for (const [from, to] of [['aprende/index.html', 'aprende.html'], ['aprende/ejemplo/index.html', 'aprende/ejemplo.html']]) {
    assert.equal(readFileSync(join(root, 'dist', from), 'utf8'), readFileSync(join(root, 'dist-cloudflare-preview', to), 'utf8'));
    assert.equal(existsSync(join(root, 'dist-cloudflare-preview', from)), false);
  }
  for (const name of ['index.html', '404.html', 'robots.txt', 'ads.txt', 'sitemap.xml']) {
    assert.deepEqual(readFileSync(join(root, 'dist', name)), readFileSync(join(root, 'dist-cloudflare-preview', name)));
  }
});
test('Pages genera redirects heredados y variantes sin SPA ni bucles', () => {
  const redirects = pagesRedirects(['/', '/aprende', '/guias'], [{ source: '/guias', destination: '/aprende', permanent: true }]);
  assert.match(redirects, /^\/guias \/aprende 308$/m);
  assert.match(redirects, /^\/guias\/index.html \/aprende 308$/m);
  assert.match(redirects, /^\/aprende\/ \/aprende 308$/m);
  assert.match(redirects, /^\/index.html \/ 308$/m);
  assert.doesNotMatch(redirects, /\*| 200\n/);
});
test('Pages preview lleva noindex global, seguridad y caché sólo de assets', () => {
  const headers = pagesHeaders();
  assert.match(headers, /\/\*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Robots-Tag: noindex, nofollow, noarchive/);
  assert.match(headers, /\/assets\/\*\n  Cache-Control: public, max-age=31536000, immutable/);
  assert.equal((headers.match(/Cache-Control/g) ?? []).length, 1);
});
test('Pages paquete production excluye noindex global y protege ambos pages.dev', () => {
  const headers = pagesHeaders('production');
  assert.doesNotMatch(headers.split('\n\n')[0], /X-Robots-Tag/);
  assert.match(headers, /https:\/\/:project\.pages\.dev\/\*\n  X-Robots-Tag: noindex/);
  assert.match(headers, /https:\/\/:version\.:project\.pages\.dev\/\*\n  X-Robots-Tag: noindex/);
});
test('Pages rechaza colisiones antes de sustituir la salida', t => {
  const root = fixture(t);
  preparePages({ root });
  writeFileSync(join(root, 'dist/aprende.html'), 'conflicto');
  assert.throws(() => preparePages({ root }), /Colisión/);
  assert.match(readFileSync(join(root, 'dist-cloudflare-preview/aprende.html'), 'utf8'), /original/);
});
test('Pages exige 404 para no convertir URLs inexistentes en home', t => {
  const root = fixture(t);
  rmSync(join(root, 'dist/404.html'));
  assert.throws(() => preparePages({ root }), /Falta dist\/404.html/);
});
test('Pages rechaza código de Functions en salida estática gratuita', t => {
  const root = fixture(t);
  writeFileSync(join(root, 'dist/_worker.js'), 'export default {}');
  assert.throws(() => preparePages({ root }), /Pages\/Functions/);
});
test('Pages limita bytes y conteo y conserva la salida previa si falla', t => {
  const root = fixture(t);
  preparePages({ root });
  assert.throws(() => preparePages({ root, limits: { ...PAGES_LIMITS, files: 1 } }), /límite de archivos/);
  assert.throws(() => preparePages({ root, limits: { ...PAGES_LIMITS, bytesPerFile: 1 } }), /25 MiB/);
  assert.ok(existsSync(join(root, 'dist-cloudflare-preview/index.html')));
});
test('Pages es repetible y su manifiesto contiene hashes de todos los archivos', t => {
  const root = fixture(t), first = preparePages({ root }), second = preparePages({ root });
  assert.deepEqual(first, second);
  assert.ok(first.files.every(file => /^[a-f0-9]{64}$/.test(file.sha256)));
});
test('Pages no admite modos ni redirects ambiguos', () => {
  assert.throws(() => pagesHeaders('invalid'), /Modo/);
  assert.throws(() => pagesRedirects([], [{ source: '/a', destination: '/b' }, { source: '/a', destination: '/c' }]), /conflicto/);
  assert.throws(() => pagesRedirects([], [{ source: '/a', destination: '//externo.example' }]), /no soportado/);
  assert.throws(() => pagesRedirects([], [{ source: '/a', destination: '/b' }, { source: '/b', destination: '/a' }]), /Ciclo/);
});
