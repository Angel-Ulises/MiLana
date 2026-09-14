import test from 'node:test';
import assert from 'node:assert/strict';
import {calcularISR,calcularAguinaldo} from '../src/lib/calculos-revisados.mjs';
const peso=n=>n.toFixed(2);
test('ISR: referencias independientes de tarifa y borde del subsidio',()=>{
  for(const [ingreso,esperado] of [['25000','3451.65'],['11000','302.17'],['11492.66','355.77'],['11492.67','891.42']])
    assert.equal(peso(calcularISR({ingreso,soloMinimo:false}).retenido),esperado);
});
test('Excepción declarada de mínimo y subsidio limitado al causado',()=>{
  assert.equal(calcularISR({ingreso:'9451.20',soloMinimo:true}).retenido,0);
  const r=calcularISR({ingreso:'100',soloMinimo:false});
  assert.equal(r.subsidio,r.causado); assert.equal(r.retenido,0);
});
test('ISR rechaza supuestos e importes fuera de alcance',()=>{
  for(const input of [{periodo:'2026-01'},{empleadorUnico:false},{ingreso:'7168.515'},{ingreso:'-1'},{ingreso:'Infinity'},{soloMinimo:undefined}])
    assert.throws(()=>calcularISR({ingreso:'11000',soloMinimo:false,...input}));
});
test('Aguinaldo: año completo y fechas civiles inclusivas',()=>{
  for(const [ingreso,dias,importe] of [['2026-01-01',365,'9000.00'],['2026-07-01',184,'4536.99'],['2026-12-31',1,'24.66'],['2025-01-01',365,'9000.00']]) {
    const r=calcularAguinaldo({salario:'18000',ingreso});
    assert.equal(r.diasPeriodo,dias);assert.equal(peso(r.bruto),importe);
  }
  assert.equal(peso(calcularAguinaldo({salario:'18000',dias:'15.5',anioCompleto:true}).bruto),'9300.00');
});
test('Aguinaldo rechaza negativos, fechas inexistentes/futuras y periodo sin confirmar',()=>{
  for(const input of [{ingreso:'2027-01-01'},{ingreso:'2026-02-30'},{dias:'0'},{dias:'-15'},{salario:'-10'},{ingreso:'',anioCompleto:false}])
    assert.throws(()=>calcularAguinaldo({salario:'18000',ingreso:'2026-01-01',...input}));
});
