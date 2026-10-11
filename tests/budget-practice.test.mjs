import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { buildSync } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { calcularEjemploPresupuesto, EJEMPLO_PRESUPUESTO, MAX_GASTO_EXTRA, PASO_GASTO_EXTRA } from '../src/lib/budgetPractice.js';

test('ejemplo hipotético: incluye básicos, variables y deuda en la misma resta del presupuesto', () => {
  const r = calcularEjemploPresupuesto();
  assert.equal(r.ingreso, 10000);
  assert.equal(r.gastos, 8000);
  assert.equal(r.saldo, 2000);
  assert.equal(r.estado, 'disponible');
  assert.equal(r.saldo, r.ingreso - (r.esenciales + r.variables + r.deuda + r.gastoExtra));
  assert.equal(Object.isFrozen(EJEMPLO_PRESUPUESTO), true);
});

test('sumar gasto recorre positivo, cero y faltante sin cambiar ingresos ni omitir deuda', () => {
  for (let extra = 0; extra <= MAX_GASTO_EXTRA; extra += PASO_GASTO_EXTRA) {
    const r = calcularEjemploPresupuesto(extra);
    assert.equal(r.saldo, 2000 - extra);
    assert.equal(r.ingreso, 10000);
    assert.equal(r.deuda, 1000);
  }
  assert.equal(calcularEjemploPresupuesto(2000).estado, 'equilibrado');
  assert.equal(calcularEjemploPresupuesto(2500).estado, 'faltante');
  assert.deepEqual(calcularEjemploPresupuesto(0), calcularEjemploPresupuesto());
});

test('el ejemplo acota las cantidades y no inventa NaN ni valores infinitos', () => {
  for (const extra of [-500, NaN, Infinity, -Infinity, '500', null, undefined]) {
    assert.deepEqual(calcularEjemploPresupuesto(extra), calcularEjemploPresupuesto());
  }
  assert.equal(calcularEjemploPresupuesto(1e100).gastoExtra, MAX_GASTO_EXTRA);
});

test('el componente avisa que es hipotético y la calculadora ofrece una entrada cerrada', async () => {
  const dir = mkdtempSync('tests/.budget-practice-');
  try {
    const output = buildSync({ entryPoints: ['src/budgetPractice.jsx'], bundle: true, write: false, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic', loader: { '.css': 'empty' } });
    const file = `${dir}/component.mjs`; writeFileSync(file, output.outputFiles[0].text);
    const { default: Practice, BudgetPracticeHelp } = await import(pathToFileURL(process.cwd() + '/' + file));
    const html = renderToStaticMarkup(React.createElement(Practice));
    assert.match(html, /Ejemplo hipotético · Paso 1 de 3/);
    assert.match(html, /ingreso neto/);
    assert.doesNotMatch(html, /<input|<form|type="submit"/);
    const help = renderToStaticMarkup(React.createElement(BudgetPracticeHelp));
    assert.match(help, /Primera vez/);
    assert.doesNotMatch(help, /ml-budget-practice/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('la práctica queda aislada de cifras reales, almacenamiento, transferencias y métricas', () => {
  const source = readFileSync('src/budgetPractice.jsx', 'utf8');
  assert.doesNotMatch(source, /localStorage|sessionStorage|URLSearchParams|financeContextHandoff|netIncomeHandoff|gtag|fetch\(|ReadingDetails/);
  assert.match(source, /role="status" aria-live="polite" aria-atomic="true"/);
  assert.match(source, /Faltan/);
  assert.match(source, /No se copian a tus herramientas/);
  const finance = readFileSync('src/financePages.jsx', 'utf8');
  assert.equal((finance.match(/<BudgetPracticeHelp/g) || []).length, 1);
  assert.match(finance, /help="Lo que realmente llega a tu cuenta\." \/><BudgetPracticeHelp \/>/);
});
