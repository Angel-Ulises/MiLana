import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const datos = JSON.parse(readFileSync(new URL('../src/data/carreras.json', import.meta.url), 'utf8'));
const profesiones = JSON.parse(readFileSync(new URL('../src/data/profesiones.json', import.meta.url), 'utf8'));

test('catálogo de carreras tiene rutas únicas y metadata completa', () => {
  const slugs = datos.paginas.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const pagina of datos.paginas) {
    assert.ok(pagina.id);
    assert.ok(pagina.titulo.length > 30);
    assert.ok(pagina.descripcion.length > 80);
  }
});

test('datos laborales tienen valores positivos y estado completo', () => {
  for (const grupo of [datos.mejorPagadas, datos.masOcupadas, datos.menorIngreso]) {
    assert.ok(grupo.length >= 8);
    for (const fila of grupo) {
      assert.ok(fila.carrera);
      assert.ok(fila.ingreso > 0);
      assert.ok(fila.ocupados > 0);
    }
  }
  assert.equal(datos.estados.length, 32);
  assert.equal(new Set(datos.estados.map((e) => e.estado)).size, 32);
  assert.ok(datos.estados.every((e) => e.ingreso > 0 && e.ocupados > 0));
});

test('perfiles profesionales tienen slug, cifras y fuente verificable', () => {
  assert.ok(profesiones.profesiones.length >= 12);
  const slugs = profesiones.profesiones.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const p of profesiones.profesiones) {
    assert.ok(p.nombre.length > 3);
    assert.ok(p.consulta.endsWith('?'));
    assert.ok(p.ingreso > 0);
    assert.ok(p.ocupados > 0);
    assert.ok(p.hombres >= 0 && p.hombres <= 100);
    assert.ok(p.mujeres >= 0 && p.mujeres <= 100);
    assert.ok(Math.abs((p.hombres + p.mujeres) - 100) <= 0.2);
    assert.match(p.fuenteUrl, /observatoriolaboral\.gob\.mx/);
  }
  assert.equal(profesiones.promedioNacional, 19494);
});

test('corte y fuente quedan declarados', () => {
  assert.equal(datos.actualizado, '2026-T2');
  assert.equal(profesiones.actualizado, '2026-T2');
  assert.match(datos.fuente, /Observatorio Laboral/);
  assert.match(datos.fuente, /ENOE/);
  assert.match(profesiones.fuenteGeneral, /ENOE/);
});
