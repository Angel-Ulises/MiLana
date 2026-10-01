import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const datos = JSON.parse(readFileSync(new URL('../src/data/economia.json', import.meta.url), 'utf8'));

test('radar economico tiene slugs unicos, fechas y rutas utiles', () => {
  assert.ok(datos.articulos.length >= 4);
  const slugs = datos.articulos.map((a) => a.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const a of datos.articulos) {
    assert.ok(a.titulo.length > 40);
    assert.ok(a.descripcion.length > 90);
    assert.match(a.fecha, /^2026-\d{2}-\d{2}$/);
    assert.ok(a.quePaso.length > 120);
    assert.ok(a.porQueImporta.length > 120);
    assert.ok(a.aQuienAfecta.length > 100);
    assert.ok(a.queHacer.length > 100);
    assert.match(a.herramienta.href, /^\//);
    assert.match(a.herramientaSecundaria.href, /^\//);
  }
});

test('todas las notas apuntan a una fuente oficial registrada', () => {
  const fuentes = new Map(datos.fuentes.map((f) => [f.id, f]));
  for (const a of datos.articulos) {
    assert.ok(fuentes.has(a.fuenteId));
  }
  for (const f of datos.fuentes) {
    assert.ok(f.nombre.length > 10);
    assert.match(f.url, /^https:\/\//);
    assert.ok(/banxico\.org\.mx|inegi\.org\.mx/.test(f.url));
    assert.ok(f.cadencia);
    assert.ok(f.proximaRevision);
  }
});

test('la nota editorial declara que no es recomendacion personalizada', () => {
  assert.match(datos.nota, /No convierte una noticia en recomendación financiera personalizada/i);
});
