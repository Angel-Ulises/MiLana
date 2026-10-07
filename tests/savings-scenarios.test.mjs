import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { crearEscenariosAhorro } from '../src/lib/savingsScenarios.js';

test('requiere cifras capturadas y no confunde vacío con cero', () => {
  for (const value of ['', ' ', null, undefined, '-2', 'NaN', 'Infinity']) {
    assert.equal(crearEscenariosAhorro({ meta:value, actual:0, mensual:500 }), null);
  }
  assert.equal(crearEscenariosAhorro({ meta:10000, actual:'', mensual:500 }), null);
  assert.equal(crearEscenariosAhorro({ meta:10000, actual:0, mensual:0 }), null);
  assert.equal(crearEscenariosAhorro({ meta:0, actual:0, mensual:500 }), null);
  assert.equal(crearEscenariosAhorro({ meta:10000, actual:0, mensual:500, porcentaje:201 }), null);
});

test('compara ritmos sin intereses y calcula meses con redondeo hacia arriba', () => {
  const r = crearEscenariosAhorro({ meta:'10000', actual:'1000', mensual:'1000', porcentaje:150 });
  assert.equal(r.mesesBase, 9);
  assert.equal(r.mesesAlternativo, 6);
  assert.equal(r.horizontes[0].base, 7000);
  assert.equal(r.horizontes[0].alternativo, 10000);
  assert.equal(r.horizontes[1].base, 13000);
  assert.equal(r.horizontes[1].alternativo, 19000);
  assert.equal(r.horizontes[2].base, 25000);
  assert.equal(r.horizontes[2].alternativo, 37000);
  assert.equal(r.escala, 37000);
});

test('meta alcanzada y alternativas más lentas se calculan de manera coherente', () => {
  const logrado = crearEscenariosAhorro({ meta:3000, actual:5000, mensual:250, porcentaje:50 });
  assert.equal(logrado.mesesBase, 0);
  assert.equal(logrado.mesesAlternativo, 0);
  const lento = crearEscenariosAhorro({ meta:10000, actual:0, mensual:1000, porcentaje:50 });
  assert.equal(lento.mesesBase, 10);
  assert.equal(lento.mesesAlternativo, 20);
});

test('la visualización se integra solo en Ahorro y usa controles accesibles', () => {
  const source = readFileSync(new URL('../src/financePages.jsx', import.meta.url), 'utf8');
  const view = readFileSync(new URL('../src/savingsScenarios.jsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../src/savings-scenarios.css', import.meta.url), 'utf8');
  assert.equal((source.match(/<SavingsScenarios meta=\{meta\} actual=\{actual\} mensual=\{mensual\} \/>/g) || []).length, 1);
  assert.match(view, /type="range"/);
  assert.match(view, /aria-live="polite"/);
  assert.match(view, /role="img"/);
  assert.match(view, /!datos \?/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /max-width:640px/);
  assert.doesNotMatch(view, /fetch\(|localStorage|sessionStorage|tracking|analytics/);
});
