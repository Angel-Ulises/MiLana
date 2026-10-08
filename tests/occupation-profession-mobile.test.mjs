import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buscarOcupacionDeCarrera, enlaceOcupacionDeCarrera, seleccionOcupacionInicial } from '../src/lib/occupationFromProfession.js';

const o=JSON.parse(readFileSync('src/data/ocupaciones.json','utf8')).ocupaciones;
const p=JSON.parse(readFileSync('src/data/profesiones.json','utf8')).profesiones;

test('conecta solo profesiones con una ocupación publicada, sin igualar estadísticas',()=>{
 for(const item of o){
   assert.ok(p.some(x=>x.slug===item.carreraRelacionadaSlug),item.slug);
   assert.equal(buscarOcupacionDeCarrera(item.carreraRelacionadaSlug,o)?.slug,item.slug);
   assert.equal(enlaceOcupacionDeCarrera(item.carreraRelacionadaSlug,o),`/carreras/ocupaciones?desde=${item.carreraRelacionadaSlug}`);
   assert.deepEqual(seleccionOcupacionInicial(o,`?desde=${item.carreraRelacionadaSlug}`),{slug:item.slug,desde:item.carreraRelacionadaSlug});
 }
 assert.equal(enlaceOcupacionDeCarrera('finanzas-banca-seguros',o),null);
 assert.equal(enlaceOcupacionDeCarrera('inexistente',o),null);
});

test('URLs ajenas o manipuladas no preseleccionan perfiles ni cifras',()=>{
 for(const q of ['?desde=inexistente','?desde=https%3A%2F%2Fotro.mx','?desde=%3Cscript%3E','?importe=23000','']){
   const x=seleccionOcupacionInicial(o,q);
   assert.equal(x.desde,null,q);
   assert.equal(x.slug,o[0].slug,q);
 }
 assert.equal(seleccionOcupacionInicial([],'?desde=medicina').slug,'');
 assert.equal(enlaceOcupacionDeCarrera('medicina',[]),null);
});

test('componentes enlazan datos, resumen, selector y navegación común sin alterar cálculos',()=>{
 const prof=readFileSync('src/careerProfessionPages.jsx','utf8');
 const page=readFileSync('src/occupationComparePage.jsx','utf8');
 const css=readFileSync('src/occupation-profession-mobile.css','utf8');
 const main=readFileSync('src/main.jsx','utf8');
 assert.match(prof,/SiteHeader/);
 assert.match(page,/SiteHeader/);
 assert.doesNotMatch(prof+page,/<nav className="desktop-nav"/);
 assert.match(prof,/enlaceOcupacionDeCarrera\(p\.slug, ocupaciones\.ocupaciones\)/);
 assert.match(prof,/href="#datos-profesion"/);
 assert.match(prof,/className="profession-summary" id="datos-profesion"/);
 assert.match(page,/seleccionOcupacionInicial\(ocupaciones\.ocupaciones, window\.location\.search\)/);
 assert.match(page,/href="#comparar-trabajos"/);
 assert.match(page,/className="co-tool" id="comparar-trabajos"/);
 assert.match(page,/No calculamos una “brecha salarial”/);
 assert.match(page,/baja precisión salarial/);
 assert.match(css,/\.profession-hero-media\{display:none!important\}/);
 assert.match(css,/\.co-hero/);
 assert.match(css,/focus-visible/);
 assert.match(main,/occupation-profession-mobile\.css/);
});
