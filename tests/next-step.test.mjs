import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SIGUIENTE_PASO, siguientePaso } from '../src/lib/nextSteps.js';

const paginas = JSON.parse(readFileSync('src/data/paginas.json', 'utf8')).paginas.map((p) => `/calculadoras/${p.slug}`);
const match = JSON.parse(readFileSync('src/data/match-catalogo.json', 'utf8')).categorias.map((c) => `/finanzas/match/${c.slug}`);
const finanzas = JSON.parse(readFileSync('src/data/finanzas.json', 'utf8')).paginas.map((p) => (p.slug ? `/finanzas/${p.slug}` : '/finanzas'));
const publicadas = new Set([...paginas, ...match, ...finanzas, '/finanzas/mi-situacion', '/invertir', '/finanzas/inversion', '/finanzas/inversion/comparar', '/finanzas/inversion/cetes', '/finanzas/inversion/fondos', '/carreras/comparar', '/carreras/ocupaciones', '/estados/comparar', '/finanzas/match', '/aprende/pension-imss-ley-97']);

test('cada siguiente paso tiene una acción principal y como mucho dos alternativas, todas a rutas publicadas', () => {
  for (const [ruta, paso] of Object.entries(SIGUIENTE_PASO)) {
    assert.ok(publicadas.has(ruta), `ruta de origen no publicada: ${ruta}`);
    assert.ok(paso.titulo && paso.texto && paso.principal?.texto, ruta);
    const otras = paso.otras || [];
    assert.ok(otras.length <= 2, ruta);
    for (const destino of [paso.principal, ...otras]) {
      assert.ok(publicadas.has(destino.href), `${ruta} → destino no publicado ${destino.href}`);
      assert.notEqual(destino.href, ruta, `${ruta} no enlaza a sí misma`);
    }
    assert.equal(new Set([paso.principal.href, ...otras.map((o) => o.href)]).size, 1 + otras.length, `${ruta} sin destinos repetidos`);
  }
});

test('todas las herramientas y las calculadoras sin «Siguiente paso» propio tienen acción principal', () => {
  for (const ruta of ['/finanzas/presupuesto', '/finanzas/fondo-emergencia', '/finanzas/deuda-y-credito', '/finanzas/ahorro', '/finanzas/vivienda', '/finanzas/mi-situacion', '/invertir', '/finanzas/inversion', '/finanzas/inversion/comparar', '/finanzas/inversion/cetes', '/finanzas/inversion/fondos', '/carreras/comparar', '/carreras/ocupaciones', '/estados/comparar', '/calculadoras/isr', '/calculadoras/resico', '/calculadoras/ptu', '/calculadoras/vacaciones', ...match]) {
    assert.ok(siguientePaso(ruta), ruta);
    assert.ok(siguientePaso(ruta + '/'), `${ruta}/ con barra final`);
  }
  assert.equal(siguientePaso('/finanzas'), null, 'los hubs no llevan cierre de herramienta');
});

test('las calculadoras que ya llevan su cifra a Finanzas no duplican una segunda acción principal', () => {
  for (const ruta of ['/calculadoras/finiquito', '/calculadoras/liquidacion', '/calculadoras/aguinaldo', '/calculadoras/bruto-a-neto', '/calculadoras/infonavit', '/calculadoras/pension-imss']) assert.equal(siguientePaso(ruta), null, ruta);
});

test('el cierre se monta dentro del resultado y antes del pie en cada página de herramienta', () => {
  assert.match(readFileSync('src/calculatorResultJourney.jsx', 'utf8'), /<NextStep compacto \/>/);
  for (const f of ['financePages', 'advisorPage', 'investmentReadinessPage', 'investmentInstrumentComparePage', 'cetesReferencePage', 'cnbvFundsPage', 'careerComparePage', 'stateComparePage', 'occupationComparePage']) {
    assert.match(readFileSync(`src/${f}.jsx`, 'utf8'), /<NextStep \/><AdReserve size="970x90" \/><footer/, f);
  }
  assert.match(readFileSync('src/invertirHomePage.jsx', 'utf8'), /<NextStep \/>\s*<footer/);
  assert.match(readFileSync('src/matchPages.jsx', 'utf8'), /ruta\.vista === 'categoria' && <NextStep \/>/);
  assert.match(readFileSync('src/main.jsx', 'utf8'), /import '\.\/next-step\.css'/);
});
