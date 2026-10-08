import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  FINANCE_CONTEXT_KEY, RUTAS_TRANSFERENCIA, CAMPOS_DESTINO,
  prepararContextoFinanciero, consumirContextoFinanciero, quitarValoresImportados
} from '../src/lib/financeContextHandoff.js';

function memoria(fn) {
  const original=globalThis.sessionStorage;
  const datos=new Map();
  globalThis.sessionStorage={
    getItem:k=>datos.get(k)??null,
    setItem:(k,v)=>datos.set(k,v),
    removeItem:k=>datos.delete(k)
  };
  try { fn(datos); } finally {
    if(original===undefined)delete globalThis.sessionStorage;
    else globalThis.sessionStorage=original;
  }
}

test('todas las rutas financieras autorizadas permiten solo campos compatibles', () => memoria(store => {
  for(const [origen, destinos] of Object.entries(RUTAS_TRANSFERENCIA)) {
    for(const [destino, keys] of Object.entries(destinos)) {
      assert.ok(CAMPOS_DESTINO[destino],destino);
      assert.ok(keys.every(k=>CAMPOS_DESTINO[destino].includes(k)),`${origen}→${destino}`);
      const values={
        ingresoNeto:'20000',gastosEsenciales:'7500',gastosVariables:'1500',
        pagosDeuda:'850',fondoActual:'3200',metaObjetivo:'40000',ahorroMetaActual:'1800',
        clave:'SECRETO',rfc:'ABC123456DEF'
      };
      assert.equal(prepararContextoFinanciero(origen,destino,values,1000),true,`${origen}→${destino}`);
      const raw=store.get(FINANCE_CONTEXT_KEY);
      assert.doesNotMatch(raw,/SECRETO|ABC123456DEF|clave|rfc/);
      const result=consumirContextoFinanciero(destino,1001);
      assert.deepEqual(Object.keys(result.valores), keys);
      assert.equal(store.size,0,'elimina siempre al leer');
      assert.equal(consumirContextoFinanciero(destino,1002),null,'no repite los valores');
    }
  }
}));

test('vacíos no se transforman en cero; el cero explícito sí es válido', () => memoria(store => {
  const src='/finanzas/presupuesto', dest='/finanzas/fondo-emergencia';
  assert.equal(prepararContextoFinanciero(src,dest,{gastosEsenciales:''},500),false);
  assert.equal(store.size,0);
  assert.equal(prepararContextoFinanciero(src,dest,{gastosEsenciales:'0'},500),true);
  assert.deepEqual(consumirContextoFinanciero(dest,501)?.valores,{gastosEsenciales:'0'});
  for(const str of ['-1','NaN','Infinity','1e9','1,200','100.123','100000000.01']) {
    assert.equal(prepararContextoFinanciero(src,dest,{gastosEsenciales:str},500),false,str);
  }
  assert.equal(prepararContextoFinanciero(src,dest,{gastosEsenciales:'100.25'},500),true);
  assert.deepEqual(consumirContextoFinanciero(dest,501)?.valores,{gastosEsenciales:'100.25'});
}));

test('rechaza envíos por URL y solo utiliza el destino consentido', () => memoria(store => {
  assert.equal(prepararContextoFinanciero('/finanzas/presupuesto','https://otro.mx',{ingresoNeto:'15000'}),false);
  assert.equal(prepararContextoFinanciero('/finanzas/presupuesto','/finanzas/deuda-y-credito?ingreso=15000',{ingresoNeto:'15000'}),false);
  assert.equal(prepararContextoFinanciero('/finanzas/ahorro','/finanzas/presupuesto',{metaObjetivo:'12000'}),false);
  assert.equal(prepararContextoFinanciero('/finanzas/presupuesto','/finanzas/deuda-y-credito',{ingresoNeto:'15000',pagosDeuda:'600'},300),true);
  assert.equal(consumirContextoFinanciero('/finanzas/fondo-emergencia',301),null,'no consume traslado destinado a otra página');
  assert.ok(store.has(FINANCE_CONTEXT_KEY));
  assert.deepEqual(consumirContextoFinanciero('/finanzas/deuda-y-credito',302)?.valores,{ingresoNeto:'15000',pagosDeuda:'600'});
  assert.equal(store.size,0);
}));

test('expira a los 15 minutos y rechaza payload alterado', () => memoria(store => {
  const src='/finanzas/presupuesto',dest='/finanzas/mi-situacion';
  assert.equal(prepararContextoFinanciero(src,dest,{ingresoNeto:'20000'},1000),true);
  assert.equal(consumirContextoFinanciero(dest,1000+15*60*1000+1),null);
  assert.equal(store.size,0);
  assert.equal(prepararContextoFinanciero(src,dest,{ingresoNeto:'20000'},1000),true);
  assert.equal(consumirContextoFinanciero(dest,999),null,'no acepta fecha futura');
  store.set(FINANCE_CONTEXT_KEY,JSON.stringify({origen:src,destino:dest,creado:1000,valores:{ingresoNeto:'20000',otroDato:'123'}}));
  assert.deepEqual(consumirContextoFinanciero(dest,1001)?.valores,{ingresoNeto:'20000'});
  store.set(FINANCE_CONTEXT_KEY,JSON.stringify({origen:'desconocido',destino:dest,creado:1000,valores:{ingresoNeto:'20000'}}));
  assert.equal(consumirContextoFinanciero(dest,1001),null);
}));

test('quitar importación conserva correcciones manuales y otros campos', () => {
  assert.deepEqual(
    quitarValoresImportados(
      {ingresoNeto:'25000',gastosEsenciales:'6800',gastosVariables:'1400',nota:'No tocar'},
      {ingresoNeto:'23000',gastosEsenciales:'6800',gastosVariables:'1400'}
    ),
    {ingresoNeto:'25000',gastosEsenciales:'',gastosVariables:'',nota:'No tocar'}
  );
});

test('flujo enlazado en Presupuesto, Fondo, Deuda, Ahorro y Mi situación', () => {
  const finance=readFileSync('src/financePages.jsx','utf8');
  const advisor=readFileSync('src/advisorPage.jsx','utf8');
  const ui=readFileSync('src/financeContinuations.jsx','utf8');
  const css=readFileSync('src/finance-continuations.css','utf8');
  const main=readFileSync('src/main.jsx','utf8');
  for(const ruta of ['/finanzas/presupuesto','/finanzas/fondo-emergencia','/finanzas/deuda-y-credito','/finanzas/ahorro']) {
    assert.ok(finance.includes(`consumirContextoFinanciero('${ruta}')`));
    assert.ok(finance.includes(`origen="${ruta}"`));
  }
  assert.match(advisor,/consumirContextoFinanciero\('\/finanzas\/mi-situacion'\)/);
  assert.match(advisor,/origen="\/finanzas\/mi-situacion"/);
  assert.match(finance, /<FinanceContextNotice contexto=\{contextoImportado\}/);
  assert.match(advisor, /<FinanceContextNotice contexto=\{contextoImportado\}/);
  assert.match(ui,/prepararContextoFinanciero\(origen, destino, valores\)/);
  assert.match(ui,/window\.location\.assign\(destino\)/);
  assert.match(main,/finance-continuations\.css/);
  assert.match(css,/focus-visible/);
  assert.match(css,/max-width:560px/);
  assert.doesNotMatch(ui+finance.slice(0,170),/URLSearchParams|navigator\.sendBeacon/);
});
