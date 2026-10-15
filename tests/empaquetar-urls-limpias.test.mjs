import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { empaquetarUrlsLimpias } from '../scripts/empaquetar-urls-limpias.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'milana-urls-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'finanzas/match/tarjetas/bbva-azul'), { recursive: true });
  mkdirSync(join(root, 'aprende/cat-y-gat-que-comparan'), { recursive: true });
  const paginas = {
    'index.html': '<link rel="canonical" href="https://www.milanaaqui.mx/">raiz',
    '404.html': '<h1>Esta página no existe.</h1>',
    'finanzas/index.html': 'hub-finanzas',
    'finanzas/presupuesto/index.html': 'presupuesto',
    'finanzas/match/index.html': 'match',
    'finanzas/match/tarjetas/index.html': 'tarjetas',
    'finanzas/match/tarjetas/bbva-azul/index.html': 'ficha',
    'aprende/index.html': 'aprende',
    'aprende/cat-y-gat-que-comparan/index.html': 'guia',
  };
  mkdirSync(join(root, 'finanzas/presupuesto'), { recursive: true });
  mkdirSync(join(root, 'finanzas/match'), { recursive: true });
  for (const [nombre, cuerpo] of Object.entries(paginas)) writeFileSync(join(root, nombre), cuerpo);
  const headers = '/*\n  X-Content-Type-Options: nosniff\n';
  const redirects = '/guias /aprende 308\n';
  writeFileSync(join(root, '_headers'), headers);
  writeFileSync(join(root, '_redirects'), redirects);
  return root;
}

test('convierte todo index.html anidado a .html y conserva la raíz', (t) => {
  const root = fixture(t);
  const raiz = readFileSync(join(root, 'index.html'));
  const reporte = empaquetarUrlsLimpias(root);
  assert.deepEqual(reporte.rutas, [
    '/aprende',
    '/aprende/cat-y-gat-que-comparan',
    '/finanzas',
    '/finanzas/match',
    '/finanzas/match/tarjetas',
    '/finanzas/match/tarjetas/bbva-azul',
    '/finanzas/presupuesto',
  ]);
  assert.deepEqual(readFileSync(join(root, 'index.html')), raiz);
  assert.equal(readFileSync(join(root, 'finanzas/match/tarjetas/bbva-azul.html'), 'utf8'), 'ficha');
  assert.equal(readFileSync(join(root, 'finanzas.html'), 'utf8'), 'hub-finanzas');
  assert.equal(existsSync(join(root, 'finanzas/presupuesto')), false);
  assert.equal(existsSync(join(root, 'finanzas/match/tarjetas/bbva-azul')), false);
  assert.equal(existsSync(join(root, 'finanzas/match')), true);
  assert.equal(empaquetarUrlsLimpias(root).movidos, 0);
});

test('rechaza colisiones antes de mover archivos', (t) => {
  const root = fixture(t);
  writeFileSync(join(root, 'finanzas.html'), 'ya-existe');
  assert.throws(() => empaquetarUrlsLimpias(root), /Colisión de URL limpia: finanzas\.html/);
  assert.equal(readFileSync(join(root, 'finanzas/index.html'), 'utf8'), 'hub-finanzas');
  assert.equal(readFileSync(join(root, 'finanzas.html'), 'utf8'), 'ya-existe');
  assert.equal(existsSync(join(root, 'finanzas/presupuesto/index.html')), true);
});

test('mantiene _headers, _redirects y 404 byte a byte, sin noindex global', (t) => {
  const root = fixture(t);
  const headers = readFileSync(join(root, '_headers'));
  const redirects = readFileSync(join(root, '_redirects'));
  const notFound = readFileSync(join(root, '404.html'));
  empaquetarUrlsLimpias(root);
  assert.deepEqual(readFileSync(join(root, '_headers')), headers);
  assert.deepEqual(readFileSync(join(root, '_redirects')), redirects);
  assert.deepEqual(readFileSync(join(root, '404.html')), notFound);
  assert.equal(headers.includes('X-Robots-Tag'), false);
});

test('exige 404.html y rechaza enlaces simbólicos', (t) => {
  const root = fixture(t);
  rmSync(join(root, '404.html'));
  assert.throws(() => empaquetarUrlsLimpias(root), /Falta dist\/404\.html/);
  writeFileSync(join(root, '404.html'), '404');
  symlinkSync(join(root, 'index.html'), join(root, 'finanzas/atajo'));
  assert.throws(() => empaquetarUrlsLimpias(root), /enlaces simbólicos/);
  assert.equal(existsSync(join(root, 'finanzas/index.html')), true);
});
