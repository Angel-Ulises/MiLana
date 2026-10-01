import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const datos = JSON.parse(readFileSync(new URL('../src/data/finanzas.json', import.meta.url), 'utf8'));

test('finanzas tiene rutas únicas y metadata suficiente', () => {
  const slugs = datos.paginas.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  const ids = new Set(datos.paginas.map((p) => p.id));
  for (const id of ['finanzas','presupuesto','fondo-emergencia','deuda-credito','ahorro','vivienda']) assert.ok(ids.has(id));
  for (const p of datos.paginas) {
    assert.ok(p.titulo.length > 25);
    assert.ok(p.descripcion.length > 75);
  }
});

test('fuentes de educación financiera quedan declaradas', () => {
  for (const clave of ['presupuesto','fondo','credito','ahorro']) {
    const fuente = datos.fuentes[clave];
    assert.ok(fuente.nombre);
    assert.match(fuente.nombre, /CONDUSEF/);
    assert.match(fuente.url, /^https:\/\/www\.gob\.mx\/condusef\//);
  }
});

test('nota de alcance evita presentar las herramientas como asesoría personalizada', () => {
  assert.match(datos.nota, /estimaciones informativas/i);
  assert.match(datos.nota, /No sustituye/i);
});
