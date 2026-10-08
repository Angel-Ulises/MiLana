import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolverParComparacion, enlaceComparacion } from '../src/lib/compareFromProfile.js';

const profesiones=JSON.parse(readFileSync('src/data/profesiones.json','utf8')).profesiones;
const estados=JSON.parse(readFileSync('src/data/estados.json','utf8')).estados;

test('las URLs de comparación admiten solo slugs públicos de los catálogos', () => {
  assert.equal(enlaceComparacion('estado','nuevo-leon',estados),'/estados/comparar?desde=nuevo-leon');
  assert.equal(enlaceComparacion('carrera','medicina',profesiones),'/carreras/comparar?desde=medicina');
  assert.equal(enlaceComparacion('carrera','otro-dato-privado',profesiones),'/carreras/comparar');
  assert.equal(enlaceComparacion('estado','https://otro.mx',estados),'/estados/comparar');
  assert.equal(enlaceComparacion('otro','nuevo-leon',estados),null);
});

test('la ficha de origen se selecciona, y la segunda opción siempre es distinta', () => {
  const estado=resolverParComparacion(estados,'?desde=nuevo-leon');
  const carrera=resolverParComparacion(profesiones,'?desde=medicina');
  assert.equal(estado.a,'nuevo-leon');
  assert.notEqual(estado.a,estado.b);
  assert.equal(estado.origen,'nuevo-leon');
  assert.equal(carrera.a,'medicina');
  assert.notEqual(carrera.a,carrera.b);
  assert.equal(carrera.origen,'medicina');
});

test('parámetros inválidos no alteran los valores iniciales ni crean destinos', () => {
  const initial=resolverParComparacion(estados,'');
  for(const q of ['?desde=https%3A%2F%2Fotro.mx','?desde=%3Cscript%3E','?desde=invalid','?importe=12345']) {
    const r=resolverParComparacion(estados,q);
    assert.equal(r.origen,null);
    assert.equal(r.a,initial.a);
    assert.equal(r.b,initial.b);
  }
  assert.deepEqual(resolverParComparacion([], '?desde=nuevo-leon'),{a:'',b:'',origen:null});
  assert.deepEqual(resolverParComparacion([{slug:'unico'}],'?desde=unico'),{a:'unico',b:'unico',origen:'unico'});
});

test('enlaces y selectores son compatibles y no guardan importes o perfiles personales', () => {
  const state=readFileSync('src/statePages.jsx','utf8');
  const p=readFileSync('src/careerProfessionPages.jsx','utf8');
  const sc=readFileSync('src/stateComparePage.jsx','utf8');
  const cc=readFileSync('src/careerComparePage.jsx','utf8');
  const entry=readFileSync('src/stateCompareEntry.jsx','utf8');
  const style=readFileSync('src/compare-profile-context.css','utf8');
  for(const file of [sc,cc]) {
    assert.match(file,/resolverParComparacion\(/);
    assert.match(file,/useState\(seleccionInicial\.a\)/);
    assert.match(file,/useState\(seleccionInicial\.b\)/);
    assert.match(file,/ml-compare-origin/);
    assert.match(file,/<select value=\{a\}/);
    assert.match(file,/<select value=\{b\}/);
  }
  assert.match(state,/enlaceComparacion\('estado', estado\.slug, datos\.estados\)/);
  assert.match(p,/enlaceComparacion\('carrera', p\.slug, datos\.profesiones\)/);
  assert.match(entry,/enlaceComparacion\('estado', slug, estados\.estados\)/);
  assert.match(style,/focus-visible/);
  const core=readFileSync('src/lib/compareFromProfile.js','utf8');
  assert.doesNotMatch(core,/localStorage|sessionStorage|fetch\(|importe|salario/);
});
