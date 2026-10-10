// Comprobación HTTP contra Wrangler local o un preview Pages autorizado.
// No crea cuentas, proyectos, credenciales, despliegues ni cambia DNS.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const origin = new URL(process.argv[2] || 'http://127.0.0.1:8788');
if (!['127.0.0.1', 'localhost'].includes(origin.hostname) && !origin.hostname.endsWith('.pages.dev')) {
  throw new Error('Usa sólo el servidor local o el preview aislado .pages.dev');
}
if (origin.username || origin.password || origin.search || origin.hash || origin.pathname !== '/') throw new Error('Origen inválido');
const root = new URL('../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('.qa/cloudflare/manifest-preview.json', root), 'utf8'));
const checks = [];
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const expectedHash = path => {
  const file = manifest.files.find(file => file.path === path);
  assert.ok(file, `Archivo no inventariado: ${path}`);
  return file.sha256;
};
const fetchPath = async path => fetch(new URL(path, origin), { redirect: 'manual', signal: AbortSignal.timeout(15000) });
function checkSecurity(response) {
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.match(response.headers.get('x-robots-tag') || '', /noindex/);
}
for (const route of manifest.routes) {
  const response = await fetchPath(route);
  assert.equal(response.status, 200, `${route} debe responder sin redirección`);
  checkSecurity(response);
  const html = await response.text();
  assert.equal(sha256(Buffer.from(html)), expectedHash(route === '/' ? 'index.html' : route.slice(1) + '.html'), `bytes HTML: ${route}`);
  assert.match(html, new RegExp(`rel=["']canonical["'][^>]*href=["']https://www\\.milanaaqui\\.mx${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`), `canonical: ${route}`);
  checks.push({ path: route, status: response.status, kind: 'canonical-html' });
  if (route !== '/') {
    const extension = await fetchPath(route + '.html?cf-check=1');
    assert.ok([301, 308].includes(extension.status), `clean URL .html: ${route}`);
    const location = new URL(extension.headers.get('location'), origin);
    assert.equal(location.origin, origin.origin, `clean URL sale del preview: ${route}`);
    assert.equal(location.pathname, route);
    assert.equal(location.searchParams.get('cf-check'), '1');
    checks.push({ path: route + '.html', status: extension.status, target: route, kind: 'clean-html' });
  }
}
const redirects = readFileSync(new URL('dist-cloudflare-preview/_redirects', root), 'utf8').split('\n').filter(line => line && !line.startsWith('#'));
for (const line of redirects) {
  const [from, target, status] = line.split(/\s+/);
  const response = await fetchPath(from + '?cf-check=1');
  assert.equal(response.status, Number(status), from);
  const location = new URL(response.headers.get('location'), origin);
  assert.equal(location.origin, origin.origin, `redirect sale del preview: ${from}`);
  assert.equal(location.pathname, target, from);
  assert.equal(location.searchParams.get('cf-check'), '1', `query perdida: ${from}`);
  checks.push({ path: from, status: response.status, target, kind: 'redirect' });
}
for (const path of ['/ads.txt', '/robots.txt', '/sitemap.xml', '/casos-calculadoras.json']) {
  const response = await fetchPath(path);
  assert.equal(response.status, 200, path);
  checkSecurity(response);
  const actual = sha256(Buffer.from(await response.arrayBuffer()));
  assert.equal(actual, expectedHash(path.slice(1)), `bytes: ${path}`);
  checks.push({ path, status: response.status, kind: 'preserved-file' });
}
for (const file of manifest.files.filter(file => file.path.startsWith('assets/'))) {
  const response = await fetchPath('/' + file.path);
  assert.equal(response.status, 200, file.path);
  assert.equal(response.headers.get('cache-control'), 'public, max-age=31536000, immutable');
  checkSecurity(response);
  assert.equal(sha256(Buffer.from(await response.arrayBuffer())), file.sha256, `bytes asset: ${file.path}`);
  checks.push({ path: '/' + file.path, status: response.status, kind: 'hashed-asset' });
}
const missing = await fetchPath('/__milana_cloudflare_no_existe_20261010');
assert.equal(missing.status, 404, 'No convertir rutas inexistentes a home');
checkSecurity(missing);
const notFoundHtml = await missing.text();
assert.match(notFoundHtml, /Esta página no existe/);
assert.equal(sha256(Buffer.from(notFoundHtml)), expectedHash('404.html'), 'bytes del 404');
checks.push({ path: '/__milana_cloudflare_no_existe_20261010', status: 404, kind: 'not-found' });
writeFileSync(new URL('.qa/cloudflare/http-checks.json', root), JSON.stringify({ origin: origin.origin, checks }, null, 2) + '\n');
console.log(`Cloudflare HTTP: ${checks.length} verificaciones aprobadas en ${origin.origin}.`);
