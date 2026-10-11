import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { borrarRutaAcompanamiento, leerRutaAcompanamiento, recordarRutaAcompanamiento, resolverRutaAcompanamiento } from '../src/lib/journeyIntent.js';

test('la orientación conserva la pregunta y enlaza únicamente rutas verificadas', () => {
  const caso = resolverRutaAcompanamiento('dinero','flujo','/finanzas/presupuesto');
  assert.equal(caso.pregunta, 'No sé cuánto me queda');
  assert.equal(caso.actual, 'Armar mi presupuesto');
  assert.equal(caso.siguiente.href, '/finanzas/mi-situacion');
  assert.equal(caso.volver, '/finanzas');
  assert.equal(resolverRutaAcompanamiento('dinero','flujo','https://ejemplo.mx'), null);
  assert.equal(resolverRutaAcompanamiento('inexistente','flujo','/finanzas/presupuesto'), null);
  assert.equal(resolverRutaAcompanamiento('dinero','no-existe','/finanzas/presupuesto'), null);
});

test('solo se guarda intención, nunca importes ni información financiera', () => {
  const original = globalThis.sessionStorage;
  const storage = new Map();
  globalThis.sessionStorage = { getItem:key => storage.get(key) ?? null, setItem:(key,val)=>storage.set(key,val), removeItem:key=>storage.delete(key) };
  try {
    assert.equal(recordarRutaAcompanamiento('dinero','flujo','/finanzas/presupuesto'),true);
    assert.equal(leerRutaAcompanamiento('/finanzas/presupuesto')?.pregunta, 'No sé cuánto me queda');
    assert.equal(leerRutaAcompanamiento('/carreras'),null);
    const serialized = [...storage.values()].join('');
    assert.doesNotMatch(serialized, /salario|ingreso|metaObjetivo|gastos|valor=|\$[0-9]/i);
    assert.equal(recordarRutaAcompanamiento('dinero','flujo','https://ejemplo.mx'),false);
    for (const [key,value] of storage) {
      const old = JSON.parse(value);
      storage.set(key,JSON.stringify({ ...old, creado: Date.now()-6*60*60*1000 }));
    }
    assert.equal(leerRutaAcompanamiento('/finanzas/presupuesto'),null);
    borrarRutaAcompanamiento();
    assert.equal(storage.size,0);
  } finally {
    if(original===undefined)delete globalThis.sessionStorage;
    else globalThis.sessionStorage=original;
  }
});

test('interfaz compartida no utiliza LLM ni modifica fórmulas o campos financieros', () => {
  const ui=readFileSync('src/decisionExplorer.jsx','utf8');
  const comp=readFileSync('src/journeyCompanion.jsx','utf8');
  const css=readFileSync('src/connected-journeys.css','utf8');
  const main=readFileSync('src/main.jsx','utf8');
  const home=readFileSync('src/App.jsx','utf8');
  assert.match(ui,/recordarRutaAcompanamiento/);
  assert.match(ui,/ml-decision-answer/);
  assert.match(comp,/aria-label="Tu recorrido en MiLana"/);
  assert.match(comp,/milana:route-change/);
  assert.match(main,/<JourneyCompanion \/>/);
  assert.doesNotMatch(css,/grid-template-areas/);
  assert.doesNotMatch(comp,/Después:/);
  assert.match(comp,/Volver a mi pregunta/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/focus-visible/);
  assert.match(home,/<SiteHeader \/>/);
  const sharedNav=readFileSync('src/lib/siteNavigation.js','utf8');
  assert.match(sharedNav,/\['finanzas', '\/finanzas', 'Finanzas'\]/);
  assert.match(sharedNav,/\['carreras', '\/carreras', 'Carreras'\]/);
  const legacyNav=readFileSync('src/financeExpansion.jsx','utf8');
  assert.doesNotMatch(legacyNav,/asegurarNavegacion|data-ml-finance-nav/);
  assert.doesNotMatch(ui+comp,/fetch\(|XMLHttpRequest|formData|FormData\(/);
});
