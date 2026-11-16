import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sinNulos } from '../scripts/match/normalizar-catalogo.mjs';
import { readFileSync } from 'node:fs';

const pagina = (cuerpo) => `<!doctype html><html><head><title>t</title><script>var x = null; window.u = undefined;</script></head><body>${cuerpo}</body></html>`;
function verificar(paginas) {
  const dir = mkdtempSync(join(tmpdir(), 'texto-visible-'));
  try {
    for (const [ruta, html] of Object.entries(paginas)) { mkdirSync(join(dir, ruta), { recursive: true }); writeFileSync(join(dir, ruta, 'index.html'), html); }
    return spawnSync(process.execPath, ['scripts/verificar-texto-visible.mjs', dir], { encoding: 'utf8' });
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test('R-46: el verificador acepta páginas limpias (null dentro de scripts o direcciones no cuenta)', () => {
  const r = verificar({ a: pagina('<p>Todo bien, $5,633.71</p><a href="/null/x">enlace</a>'), b: pagina('<p>nullable y anulado</p>') });
  assert.equal(r.status, 0, r.stderr);
});

test('R-46: el verificador falla con null, undefined, NaN, [object Object] y llaves visibles', () => {
  for (const malo of ['Fechas normalizadas null; CAT', 'Total: undefined', 'Te llegan $NaN', 'Valor [object Object]', 'Hola {{nombre}}', 'Total Infinity']) {
    const r = verificar({ ok: pagina('<p>bien</p>'), malo: pagina(`<p>${malo}</p>`) });
    assert.equal(r.status, 1, `debe fallar con: ${malo}`);
    assert.match(r.stderr, /malo/);
  }
});

test('R-46: el catálogo de Match ya no trae «null» en las notas de las fichas', () => {
  assert.equal(sinNulos('Fechas normalizadas null; CAT no etiquetado vigente.'), 'Sin fechas normalizadas; CAT no etiquetado vigente.');
  assert.equal(sinNulos('valor undefined y NaN'), 'valor sin dato y sin dato');
  assert.equal(sinNulos('anulado y nullable'), 'anulado y nullable');
  assert.equal(sinNulos(null), null);
  const cat = JSON.parse(readFileSync('src/data/match-catalogo.json', 'utf8'));
  const malos = [];
  const recorrer = (x, ruta) => {
    if (typeof x === 'string') { if (/(?<![\w/_=.-])(null|undefined|NaN)(?![\w/_-])/.test(x)) malos.push(`${ruta}: ${x.slice(0, 80)}`); }
    else if (Array.isArray(x)) x.forEach((v, i) => recorrer(v, `${ruta}/${i}`));
    else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) recorrer(v, `${ruta}/${k}`);
  };
  recorrer(cat.productos, 'productos');
  assert.deepEqual(malos, [], 'ninguna ficha debe mostrar null, undefined o NaN');
});
