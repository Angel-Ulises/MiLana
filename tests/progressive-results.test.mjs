import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Finanzas muestra primero la cifra y conserva advertencias críticas sin tocar', () => {
  const code=readFileSync('src/financePages.jsx','utf8');
  assert.match(code,/import MeaningOnDemand/);
  assert.match(code,/resumen="Entender esta cifra"/);
  assert.match(code,/value === '—'/);
  assert.match(code,/no es un límite\|sin asumir\|sin rendimiento/);
  assert.match(code,/<p className="ml-result-critical">\{note\}<\/p>/);
  assert.match(code,/\{value\}/);
  assert.match(code,/estadoPresupuesto\(/);
});
test('Carreras explica qué es un promedio y qué no son vacantes sin modificar rankings', () => {
  const code=readFileSync('src/careerPages.jsx','utf8');
  assert.match(code,/className="career-meaning"/);
  assert.match(code,/className="career-ranking-stack"/, 'Ranking y ayuda comparten un único espacio del grid');
  assert.match(code,/¿Qué significa este ranking\?/);
  assert.match(code,/no equivale a vacantes/);
  assert.match(code,/ingreso promedio mensual publicado/);
  assert.match(code,/rows\.map\(\(row, index\)/);
});
test('Economía deja la señal y las herramientas a la vista y el contexto adicional al tocar', () => {
  const code=readFileSync('src/economyPages.jsx','utf8');
  assert.match(code,/<details className="economy-context-extra">/);
  assert.match(code,/<summary>¿Por qué importa y a quién afecta\?/);
  assert.match(code,/\{articulo\.quePaso\}/);
  assert.match(code,/\{articulo\.porQueImporta\}/);
  assert.match(code,/\{articulo\.aQuienAfecta\}/);
  assert.match(code,/\{articulo\.queHacer\}/);
  assert.match(code,/\{articulo\.herramienta\.href\}/);
  assert.match(code,/\{articulo\.herramientaSecundaria\.href\}/);
  const data=readFileSync('src/data/economia.json','utf8');
  assert.ok(JSON.parse(data).articulos.length >= 4);
});
test('La divulgación funciona con teclado y HTML nativo, sin nuevas APIs',()=>{
 const c=readFileSync('src/MeaningOnDemand.jsx','utf8');
 const styles=readFileSync('src/result-meaning.css','utf8');
 assert.match(c,/<details className=/);
 assert.match(c,/<summary>/);
 assert.doesNotMatch(c,/fetch\(|sessionStorage|localStorage|navigator|XMLHttpRequest|onClick/);
 assert.match(styles,/summary:focus-visible/);
 assert.match(styles,/@media\(max-width:720px\)/);
 assert.match(readFileSync('src/main.jsx','utf8'),/import '\.\/result-meaning\.css'/);
});