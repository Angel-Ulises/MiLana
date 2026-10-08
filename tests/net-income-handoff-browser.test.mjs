import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome=[process.env.MILANA_CHROME,'/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
const dir='__net-to-finance-test';

for(const advisor of [false,true]) test(`Chrome: ${advisor?'Mi situación':'Presupuesto'} recibe el neto voluntario y permite retirarlo`,async(t)=>{
  if(!browserReady(t,chrome))return;
  const destination=advisor?'/finanzas/mi-situacion':'/finanzas/presupuesto';
  mkdirSync(dir,{recursive:true});
  writeFileSync(`${dir}/index.html`,'<!doctype html><html lang="es"><head><meta charset="utf-8"></head><body><div id="root"></div><script type="module" src="/src/__net-to-finance-test.jsx"></script></body></html>');
  writeFileSync('src/__net-to-finance-test.jsx',`import React from 'react';
import { createRoot } from 'react-dom/client';
import Page from './${advisor?'advisorPage':'financePages'}.jsx';
import { guardarIngresoTemporal } from './lib/netIncomeHandoff.js';
history.replaceState({},'', '${destination}');
if(!guardarIngresoTemporal(23875.32,'${destination}')) throw new Error('No se pudo guardar');
createRoot(document.getElementById('root')).render(<React.StrictMode><Page /></React.StrictMode>);
const pause=()=>new Promise(r=>setTimeout(r,180));
async function run(){
 await pause();
 const aviso=document.querySelector('.ml-income-arrived');
 if(!aviso) throw new Error('El aviso de origen no apareció');
 const field=document.querySelector('${advisor?'.advisor-field':'.finance-field'} input[type="number"]');
 if(!field || field.value!=='23875.32') throw new Error('Importe no recuperado');
 if(sessionStorage.getItem('ml-net-income-handoff-v1')) throw new Error('No eliminó el traslado de uso único');
 const clear=aviso.querySelector('button');
 if(!clear) throw new Error('No existe Quitar dato');
 clear.click(); await pause();
 if(document.querySelector('.ml-income-arrived')) throw new Error('El aviso siguió visible');
 if(field.value!=='') throw new Error('No dejó el campo editable y vacío');
 document.body.dataset.done='true';document.body.dataset.result='ok';
}
run().catch(e=>{document.body.dataset.done='true';document.body.dataset.error=e.message;});`);
  const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});
  await server.listen();
  try{
    const url=`http://127.0.0.1:${server.httpServer.address().port}/${dir}/index.html`;
    const html=await renderDom(chrome,url,{waitMs:7000,until:"document.body.dataset.done === 'true'"});
    assert.doesNotMatch(html,/data-error=/);
    assert.match(html,/data-result="ok"/);
  }finally{
    await server.close();
    rmSync(dir,{recursive:true,force:true});
    rmSync('src/__net-to-finance-test.jsx',{force:true});
  }
});
