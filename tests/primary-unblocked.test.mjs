import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('La pantalla principal no depende de animaciones, gráficos o complementos',()=>{
 const main=readFileSync('src/main.jsx','utf8');
 const block=main.match(/function PrimaryRoute\(\)\s*\{([\s\S]*?)\n\}\n\n\/\/ El contenido esencial/);
 assert.ok(block,'Función principal separada');
 for(const delayed of ['SiteEnhancements','MotionDataViz','FinanceExpansion','CareerMotion','RouteMotion']){
  assert.doesNotMatch(block[1],new RegExp('<'+delayed+' \\/>'),delayed+' no debe bloquear el primer contenido');
  assert.match(main,new RegExp('<'+delayed+' \\/>'),'Debe conservarse el módulo '+delayed);
 }
 assert.match(main,/function PrimaryEffects\(\)/);
 assert.match(main,/function PrimaryCommitted\(\{ onReady \}\)/);
 assert.match(main,/\{primaryReady && <React\.Suspense fallback=\{null\}>/);
 assert.match(main,/<PrimaryCommitted onReady=\{markReady\} \/>/);
 assert.match(main,/<JourneyCompanion \/>/);
});
test('La barra de recorrido soporta encabezado dinámico y desmontaje limpio',()=>{
 const s=readFileSync('src/journeyCompanion.jsx','utf8');
 assert.match(s,/new MutationObserver\(montar\)/);
 assert.match(s,/observer\?\.disconnect\(\)/);
 assert.match(s,/el\?\.remove\(\)/);
 assert.match(s,/milana:route-change/);
 assert.doesNotMatch(s,/if \(!header\) return undefined/);
 assert.doesNotMatch(s,/fetch\(|XMLHttpRequest/);
});