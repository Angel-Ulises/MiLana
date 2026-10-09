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
test('La pestaña notifica cambios válidos, restaura al volver y permite dejar de observar', async () => {
 const {observarNivelLectura}=await import('../src/lib/readingDepth.js');
 const oldStorage=globalThis.sessionStorage, oldWindow=globalThis.window;
 const saved=new Map(), received=[];
 globalThis.window=new EventTarget();
 globalThis.sessionStorage={getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v)};
 try{
  const stop=observarNivelLectura(v=>received.push(v));
  assert.equal(guardarNivelLectura('experto'),true);
  window.dispatchEvent(new CustomEvent('ml:reading-depth',{detail:'ingreso=20000'}));
  saved.set('ml-lectura-v1','medio');
  window.dispatchEvent(new Event('pageshow'));
  stop();
  guardarNivelLectura('inicio');
  assert.deepEqual(received,['experto','medio']);
  assert.equal(saved.size,1);
 }finally{
  if(oldStorage===undefined)delete globalThis.sessionStorage;else globalThis.sessionStorage=oldStorage;
  if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;
 }
});

test('Al bloquear almacenamiento, el cambio funciona en el documento sin otra persistencia', async () => {
 const {observarNivelLectura}=await import('../src/lib/readingDepth.js');
 const oldStorage=globalThis.sessionStorage, oldWindow=globalThis.window;
 globalThis.window=new EventTarget();
 globalThis.sessionStorage={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
 try{
  const received=[];
  const stop=observarNivelLectura(v=>received.push(v));
  assert.equal(guardarNivelLectura('experto'),false);
  assert.equal(leerNivelLectura(),'experto');
  assert.deepEqual(received,['experto']);
  assert.equal(guardarNivelLectura('privado'),false);
  assert.equal(leerNivelLectura(),'experto');
  stop();
  guardarNivelLectura('inicio');
 }finally{
  if(oldStorage===undefined)delete globalThis.sessionStorage;else globalThis.sessionStorage=oldStorage;
  if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;
 }
});

test('Una escritura rechazada no revierte la selección al leer, montar otro bloque o volver atrás', async () => {
 const {observarNivelLectura}=await import('../src/lib/readingDepth.js');
 const oldStorage=globalThis.sessionStorage, oldWindow=globalThis.window;
 globalThis.window=new EventTarget();
 globalThis.sessionStorage={getItem:()=> 'medio',setItem(){throw Error('quota')}};
 try{
  const received=[];
  const stop=observarNivelLectura(v=>received.push(v));
  assert.equal(guardarNivelLectura('experto'),false);
  assert.equal(leerNivelLectura(),'experto');
  window.dispatchEvent(new Event('pageshow'));
  assert.deepEqual(received,['experto','experto']);
  stop();
  globalThis.sessionStorage={getItem:()=> 'inicio',setItem(){}};
  guardarNivelLectura('inicio');
 }finally{
  if(oldStorage===undefined)delete globalThis.sessionStorage;else globalThis.sessionStorage=oldStorage;
  if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;
 }
});
