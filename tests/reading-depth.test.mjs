import test from 'node:test';
import assert from 'node:assert/strict';
import {leerNivelLectura,guardarNivelLectura} from '../src/lib/readingDepth.js';

test('Nivel de lectura solo guarda una preferencia válida en esta pestaña',()=>{
 const old=globalThis.sessionStorage;
 const saved=new Map();
 globalThis.sessionStorage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v)};
 try{
  assert.equal(leerNivelLectura(),'inicio');
  assert.equal(guardarNivelLectura('experto'),true);
  assert.equal(leerNivelLectura(),'experto');
  assert.equal(guardarNivelLectura('medio'),true);
  assert.equal(leerNivelLectura(),'medio');
  assert.equal(guardarNivelLectura('salario=20000'),false);
  assert.equal(saved.size,1);
  assert.doesNotMatch([...saved.values()].join(''),/salario|ingreso|gastos|importe|monto|\\d{4,}/i);
 }finally{if(old===undefined) delete globalThis.sessionStorage;else globalThis.sessionStorage=old;}
});
test('Puede navegar sin almacenamiento y sin sesión de cuenta',()=>{
 const old=globalThis.sessionStorage;
 Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}}});
 try{
  assert.equal(leerNivelLectura(),'inicio');
  assert.equal(guardarNivelLectura('experto'),false);
 }finally{if(old===undefined)delete globalThis.sessionStorage;else Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:old});}
});