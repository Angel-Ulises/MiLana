import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const datos = JSON.parse(fs.readFileSync(new URL('../src/data/ocupaciones.json', import.meta.url), 'utf8'));

test('ocupaciones separa explícitamente ocupación de carrera estudiada', () => {
  assert.match(datos.fuente.nota, /trabajo desempeñado/i);
  assert.ok(datos.reglasEditoriales.some((r) => /salario ocupacional/i.test(r)));
  assert.ok(datos.reglasEditoriales.some((r) => /población ocupada/i.test(r)));
});

test('cada ocupación conserva código, periodo, fuente y advertencia de precisión', () => {
  const slugs = new Set();
  for (const o of datos.ocupaciones) {
    assert.ok(o.slug);
    assert.ok(!slugs.has(o.slug));
    slugs.add(o.slug);
    assert.match(o.codigo, /^\d{4}$/);
    assert.equal(o.periodo, '2026-T1');
    assert.ok(o.ocupados > 0);
    assert.ok(o.ingresoMensual > 0);
    assert.ok(o.informalidadPct >= 0 && o.informalidadPct <= 100);
    assert.equal(o.precisionSalarial, 'baja');
    assert.match(o.urlFuente, /^https:\/\/(www\.)?economia\.gob\.mx\/datamexico\//);
  }
});

test('primera capa incluye software, medicina y derecho', () => {
  const slugs = datos.ocupaciones.map((o) => o.slug);
  assert.ok(slugs.includes('desarrolladores-analistas-software-multimedia'));
  assert.ok(slugs.includes('medicos-generales-familiares'));
  assert.ok(slugs.includes('abogados'));
});
