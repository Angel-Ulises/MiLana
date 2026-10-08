import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { rutasDespuesDelResultado } from '../src/lib/calculatorResultRoutes.js';
const editorial = JSON.parse(readFileSync('src/data/contenido-calculadoras.json','utf8'));
const catalogo = JSON.parse(readFileSync('src/data/paginas.json','utf8'));

test('cada calculadora operativa enlaza rutas relacionadas de su propio editorial', () => {
  const ids = ['finiquito','liquidacion','aguinaldo','isr','resico','ptu','bruto-neto','vacaciones','infonavit'];
  for (const id of ids) {
    const enlaces = rutasDespuesDelResultado(id, editorial, catalogo);
    assert.equal(enlaces.length, 2, id);
    assert.equal(new Set(enlaces.map(e => e.href)).size, enlaces.length, id);
    assert.ok(editorial[id]?.interpretacion, id);
    for (const enlace of enlaces) {
      assert.ok(enlace.titulo.length > 22, id);
      assert.match(enlace.href, /^\/calculadoras\/[a-z-]+$/, id);
      assert.notEqual(enlace.href, '/calculadoras/pension-imss', id);
    }
  }
  assert.deepEqual(rutasDespuesDelResultado('pension', editorial, catalogo), []);
  assert.deepEqual(rutasDespuesDelResultado('__invalid__', editorial, catalogo), []);
});

test('orientación al resultado sin cambiar funciones de cálculo ni guardar importes', () => {
  const app=readFileSync('src/App.jsx','utf8');
  const journey=readFileSync('src/calculatorResultJourney.jsx','utf8');
  const style=readFileSync('src/calculator-result-journey.css','utf8');
  const detail=readFileSync('src/Detalle.jsx','utf8');
  assert.match(app, /<ResultNextSteps \/>/);
  assert.match(app, /<CalculatorResultContext.Provider value=\{calc.id\}>/);
  assert.match(app, /<Comp \/>/);
  assert.match(app, /id=\{k === "interpretacion" \? "ml-calc-interpretation" : undefined\}/);
  assert.match(detail, /<details id=\{id\}/);
  assert.match(journey, /href="#ml-calc-interpretation"/);
  assert.match(journey, /aria-label="Qué hacer después de calcular"/);
  assert.match(style, /#ml-calc-interpretation/);
  assert.match(style, /focus-visible/);
  assert.match(style, /@media\(max-width:500px\)/);
  assert.doesNotMatch(journey, /fetch\(|localStorage|sessionStorage|FormData|navigator\.sendBeacon/);
});

test('preguntas, fundamentación y enlaces editoriales permanecen íntegros, ahora bajo demanda', () => {
  const app=readFileSync('src/App.jsx','utf8');
  const inicio=app.indexOf('function ContenidoCalculadora(');
  const fin=app.indexOf('function SituationHub(',inicio);
  const seccion=app.slice(inicio,fin);
  assert.match(seccion, /className="orb-more-plain orb-calc-faq"/);
  assert.match(seccion, /className="orb-more-plain orb-calc-related"/);
  assert.match(seccion, /data\.faq\.map\(/);
  assert.match(seccion, /data\.siguientes\.map\(/);
  assert.match(seccion, /ORDEN_SECCIONES\.filter/);
  assert.match(app, /fundamento: 'Fundamento y fuentes'/);
});
