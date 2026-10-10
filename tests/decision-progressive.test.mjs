import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { buildSync } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { recordarRutaAcompanamiento, leerRutaAcompanamiento, resolverRutaAcompanamiento } from '../src/lib/journeyIntent.js';

function storage() {
  const map = new Map();
  return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) };
}

test('la pregunta acompaña enlaces normales entre destinos de su recorrido, sin invadir otros', () => {
  const previous = globalThis.sessionStorage;
  globalThis.sessionStorage = storage();
  try {
    recordarRutaAcompanamiento('dinero', 'flujo', '/finanzas/presupuesto');
    assert.equal(leerRutaAcompanamiento('/finanzas/mi-situacion')?.opcionId, 'flujo');
    assert.equal(leerRutaAcompanamiento('/finanzas/ahorro')?.opcionId, 'flujo');
    assert.equal(leerRutaAcompanamiento('/estados/comparar'), null);
    assert.equal(resolverRutaAcompanamiento('dinero', 'flujo', '/finanzas/mi-situacion')?.siguiente?.href, '/finanzas/ahorro');
    assert.equal(resolverRutaAcompanamiento('dinero', 'flujo', '/finanzas/ahorro')?.siguiente, null);
  } finally { if (previous === undefined) delete globalThis.sessionStorage; else globalThis.sessionStorage = previous; }
});

test('el hub parte de tres preguntas, y al volver sustituye la elección por una acción principal', async () => {
  const dir = mkdtempSync('tests/.decision-progressive-');
  const previous = globalThis.sessionStorage;
  globalThis.sessionStorage = storage();
  try {
    const output = buildSync({ entryPoints: ['src/decisionExplorer.jsx'], bundle: true, write: false,
      platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic', loader: { '.css': 'empty' } });
    const file = `${dir}/component.mjs`;
    writeFileSync(file, output.outputFiles[0].text);
    const { default: Explorer } = await import(pathToFileURL(process.cwd() + '/' + file));
    const render = topic => renderToStaticMarkup(React.createElement(Explorer, { initialTopic: topic }));
    for (const topic of ['dinero', 'carrera']) {
      const first = render(topic);
      assert.equal((first.match(/class="ml-decision-need/g) || []).length, 3);
      assert.equal((first.match(/class="ml-decision-choice/g) || []).length, 0, 'No volver a preguntar el tema del hub');
      assert.doesNotMatch(first, /ml-decision-answer-placeholder/);
    }
    recordarRutaAcompanamiento('dinero', 'flujo', '/finanzas/presupuesto');
    const returned = render('dinero');
    assert.equal((returned.match(/class="ml-decision-primary"/g) || []).length, 1);
    assert.equal((returned.match(/class="ml-decision-need/g) || []).length, 0);
    assert.match(returned, /No sé cuánto me queda/);
    assert.match(returned, /href="\/finanzas\/presupuesto"/);
    assert.match(returned, /<details[^>]*class="ml-decision-alternatives"/);
    assert.doesNotMatch(returned, /<details[^>]*class="ml-decision-alternatives"[^>]*open/);
    assert.equal((render('carrera').match(/class="ml-decision-need/g) || []).length, 3, 'Otro hub conserva su entrada directa');
  } finally {
    if (previous === undefined) delete globalThis.sessionStorage; else globalThis.sessionStorage = previous;
    rmSync(dir, { recursive: true, force: true });
  }
});

test('el retorno respeta el hub de entrada y descarta registros caducados o manipulados', async () => {
  const { leerEleccionExplorador, borrarRutaAcompanamiento } = await import('../src/lib/journeyIntent.js');
  const previous = globalThis.sessionStorage;
  globalThis.sessionStorage = storage();
  try {
    recordarRutaAcompanamiento('carrera', 'eleccion', '/carreras/comparar', '/finanzas');
    assert.equal(leerEleccionExplorador('/finanzas')?.temaId, 'carrera');
    assert.equal(leerEleccionExplorador('/carreras'), null);
    assert.equal(leerRutaAcompanamiento('/carreras/comparar?foo=bar#comparar')?.volver, '/finanzas');
    recordarRutaAcompanamiento('carrera', 'estado', '/carreras', '/finanzas');
    assert.equal(leerRutaAcompanamiento('/carreras')?.pregunta, 'Me interesa mi estado');
    assert.equal(leerRutaAcompanamiento('/finanzas'), null);
    recordarRutaAcompanamiento('carrera', 'eleccion', '/carreras/comparar', '/finanzas');
    const key = 'ml-guide-journey-v1';
    const original = JSON.parse(sessionStorage.getItem(key));
    assert.deepEqual(Object.keys(original).sort(), ['creado', 'destino', 'inicio', 'opcionId', 'temaId']);
    for (const change of [
      { creado: Date.now() - 5 * 60 * 60 * 1000 }, { creado: Date.now() + 120000 },
      { creado: 'hoy' }, { destino: '//evil.example' }, { inicio: 'https://evil.example' }, { opcionId: 'unknown' },
    ]) {
      sessionStorage.setItem(key, JSON.stringify({ ...original, ...change }));
      assert.equal(leerEleccionExplorador('/finanzas'), null);
      assert.equal(leerRutaAcompanamiento('/carreras/comparar'), null);
    }
    sessionStorage.setItem(key, JSON.stringify(original));
    borrarRutaAcompanamiento();
    assert.equal(leerEleccionExplorador('/finanzas'), null);
    globalThis.sessionStorage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); }, removeItem() { throw Error('blocked'); } };
    assert.equal(recordarRutaAcompanamiento('dinero', 'flujo', '/finanzas/presupuesto'), false);
    assert.equal(leerEleccionExplorador('/finanzas'), null);
    assert.doesNotThrow(borrarRutaAcompanamiento);
  } finally { if (previous === undefined) delete globalThis.sessionStorage; else globalThis.sessionStorage = previous; }
});
