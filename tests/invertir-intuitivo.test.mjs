import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { proyectarInversion } from '../src/lib/investmentProjection.js';
import { esRutaInvertir } from '../src/lib/routeMatcher.js';
import { NAVEGACION_MILANA } from '../src/lib/siteNavigation.js';

const base = { inicial:'10000', mensual:'500', anos:'10', inflacion:'3', costoAnual:'0.5', tasas:['-5','5','10'] };

test('Tres escenarios hipotéticos ordenados; hay posibilidad de pérdida',()=>{
  const r=proyectarInversion(base);
  assert.equal(r.error,undefined);
  assert.equal(r.aportado,70000);
  assert.equal(r.escenarios.length,3);
  assert.ok(r.escenarios[0].final < r.aportado, 'El caso adverso debe permitir perder dinero');
  assert.ok(r.escenarios[0].final < r.escenarios[1].final);
  assert.ok(r.escenarios[1].final < r.escenarios[2].final);
  for(const row of r.escenarios) {
    assert.ok(Number.isFinite(row.final) && row.final >= 0);
    assert.ok(row.real < row.final, 'La inflación positiva reduce el poder de compra');
  }
});
test('Tasa y costo nulos dejan solo capital aportado, mes a mes',()=>{
  const r=proyectarInversion({inicial:1000,mensual:100,anos:1,inflacion:0,costoAnual:0,tasas:[0,0,0]});
  assert.equal(r.aportado,2200);
  assert.ok(r.escenarios.every(x=>Math.abs(x.final-2200)<1e-6 && Math.abs(x.real-2200)<1e-6));
});
test('No se aceptan cantidades, plazos o tasas sin sentido o peligrosamente grandes',()=>{
  for(const props of [
    {inicial:''},{mensual:'-500'},{inicial:'Infinity'},{anos:0},
    {anos:41},{anos:1.5},{inflacion:'-5'},{costoAnual:40},{tasas:[-100,5,10]},
    {tasas:[-5,5,'NaN']},{tasas:[5,5]},
  ]) {
    const r=proyectarInversion({...base,...props});
    assert.equal(typeof r.error,'string',JSON.stringify(props));
    assert.ok(!r.escenarios);
  }
});
test('Invertir es sección pública, sin compra ni depósitos ni código externo',()=>{
  assert.equal(esRutaInvertir('/invertir'),true);
  assert.equal(esRutaInvertir('/invertir/'),true);
  assert.equal(esRutaInvertir('/invertir-otro'),false);
  assert.ok(NAVEGACION_MILANA.some(([id,url])=>id==='invertir'&&url==='/invertir'));
  const s=readFileSync('src/invertirHomePage.jsx','utf8');
  assert.match(s,/aria-pressed=\{value === item.id\}/);
  assert.match(s,/className="ml-inv-sim"/);
  assert.match(s,/role="alert"/);
  assert.match(s,/no recomienda productos personalizados/i);
  assert.doesNotMatch(s,/comprar ahora|deposita ahora|abre una cuenta ya|api[_-]?key|client[_-]?secret|fetch\(|XMLHttpRequest/i);
  assert.match(readFileSync('scripts/generar-inversion.mjs','utf8'),/destino:\['invertir'\]/);
  assert.match(readFileSync('scripts/generar-sitemap-final.mjs','utf8'),/'\/invertir'/);
});