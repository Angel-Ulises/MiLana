import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const archivos = [
  '../src/careerPages.jsx',
  '../src/careerProfessionPages.jsx',
  '../src/economyPages.jsx',
  '../src/financePages.jsx',
  '../public/astra-2026.js',
];
const canonicales = ['aprende', 'sobre', 'metodo', 'contacto', 'privacidad', 'financiamiento'];

test('los enlaces runtime a rutas canónicas respetan trailingSlash:false', () => {
  for (const archivo of archivos) {
    const fuente = fs.readFileSync(new URL(archivo, import.meta.url), 'utf8');
    for (const ruta of canonicales) {
      assert.doesNotMatch(fuente, new RegExp(`(?:href=["']|\\[\\s*["'])/${ruta}/["']`), `${archivo} conserva /${ruta}/`);
    }
  }
});

test('los redirects legacy de /guias no se confunden con canonicals runtime', () => {
  const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const fuentes = new Set((vercel.redirects ?? []).map((r) => r.source));
  for (const ruta of ['/guias', '/guias/aguinaldo-2026', '/guias/bruto-neto-recibo']) {
    assert.ok(fuentes.has(ruta), `falta redirect legacy ${ruta}`);
  }
});
