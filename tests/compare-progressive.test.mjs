import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('Comparar carreras mantiene ingreso y población a la vista y composición al tocar',()=>{
 const code=readFileSync('src/careerComparePage.jsx','utf8');
 assert.match(code,/className="cc-primary"/);
 assert.match(code,/<dt>Profesionistas ocupados<\/dt>/);
 assert.match(code,/<ReadingDetails className="cc-card-more">/);
 assert.match(code,/<summary>Ver composición de este grupo<\/summary>/);
 for(const token of ['Hombres','Mujeres','Diferencia entre promedios de ingreso','No implica que una persona concreta vaya a ganar esa diferencia'])assert.ok(code.includes(token),token);
 assert.match(readFileSync('src/career-compare.css','utf8'),/\.cc-card-more>summary:focus-visible/);
});
test('Comparar estados prioriza cifras principales y conserva empleo y vivienda bajo demanda',()=>{
 const code=readFileSync('src/stateComparePage.jsx','utf8');
 assert.match(code,/className="sc-summaries"/);
 assert.equal((code.match(/className="sc-more-dimensions"/g)||[]).length,2);
 assert.match(code,/Explorar empleo e informalidad/);
 assert.match(code,/Explorar vivienda/);
 for(const token of ['Ingreso profesional promedio mensual','Profesionistas ocupados','Participación económica','Desocupación','Informalidad laboral','Subocupación','Trabajo asalariado','Condiciones críticas','Mediana de avalúo','Promedio de avalúo','Apreciación interanual 2026-II','sin declarar ganador','precisión engañosa'])assert.ok(code.includes(token),token);
 assert.match(code,/className="sc-differences"/);
 assert.match(code,/className="sc-rules"/);
 assert.match(readFileSync('src/state-compare.css','utf8'),/\.sc-more-dimensions>summary:focus-visible/);
});
test('Los controles conservan HTML nativo sin nuevas peticiones ni almacenes',()=>{
 for(const file of ['src/stateComparePage.jsx','src/careerComparePage.jsx']){
  const s=readFileSync(file,'utf8');
  assert.doesNotMatch(s,/new XMLHttpRequest|fetch\(|localStorage\.|sessionStorage\./);
 }
});