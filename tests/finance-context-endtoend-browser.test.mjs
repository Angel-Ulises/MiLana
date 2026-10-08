import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome = [process.env.MILANA_CHROME,'/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
const dir='__finance-context-endtoend';
const cases=[
  {origen:'/finanzas/mi-situacion',destino:'/finanzas/presupuesto',valores:{ingresoNeto:'24000',gastosEsenciales:'8000',gastosVariables:'2000',pagosDeuda:'1500'},expected:['24000','8000','2000','1500']},
  {origen:'/finanzas/presupuesto',destino:'/finanzas/fondo-emergencia',valores:{gastosEsenciales:'8100'},expected:['8100','','']},
  {origen:'/finanzas/presupuesto',destino:'/finanzas/deuda-y-credito',valores:{ingresoNeto:'28000',pagosDeuda:'2400'},expected:['28000','2400']},
  {origen:'/finanzas/mi-situacion',destino:'/finanzas/ahorro',valores:{metaObjetivo:'55000',ahorroMetaActual:'12000'},expected:['55000','12000','']},
  {origen:'/finanzas/presupuesto',destino:'/finanzas/mi-situacion',valores:{ingresoNeto:'21000',gastosEsenciales:'7000',gastosVariables:'1500',pagosDeuda:'0'},expected:['21000','7000','1500','0','','','','']},
];

for(const item of cases) test(`Chrome: ${item.origen} → ${item.destino} sin URL ni campos inventados`,async t=>{
  if(!browserReady(t,chrome))return;
  mkdirSync(dir,{recursive:true});
  writeFileSync(`${dir}/index.html`,'<!doctype html><html lang="es"><head><meta charset="utf-8"></head><body><div id="root"></div><script type="module" src="/src/__finance-context-endtoend.jsx"></script></body></html>');
  writeFileSync('src/__finance-context-endtoend.jsx',`import React from 'react';
import { createRoot } from 'react-dom/client';
import FinancePages from './financePages.jsx';
import AdvisorPage from './advisorPage.jsx';
import { prepararContextoFinanciero, FINANCE_CONTEXT_KEY } from './lib/financeContextHandoff.js';
const testCase=${JSON.stringify(item)};
history.replaceState({},'',testCase.destino);
if(!prepararContextoFinanciero(testCase.origen,testCase.destino,testCase.valores)) throw new Error('No se pudo preparar la transferencia');
createRoot(document.getElementById('root')).render(<React.StrictMode>{testCase.destino === '/finanzas/mi-situacion' ? <AdvisorPage /> : <FinancePages />}</React.StrictMode>);
const pause=()=>new Promise(resolve=>setTimeout(resolve,160));
async function run(){
 await pause();
 const notice=document.querySelector('.ml-finance-context-notice');
 if(!notice) throw new Error('No se muestra el origen del contexto');
 const selector=testCase.destino === '/finanzas/mi-situacion'?'.advisor-form input[type="number"]':'.finance-form-card input[type="number"]';
 const inputs=[...document.querySelectorAll(selector)];
 if(inputs.length<testCase.expected.length)throw new Error('Campos insuficientes');
 testCase.expected.forEach((value,i)=>{if(inputs[i].value!==value)throw new Error('Campo '+i+': '+inputs[i].value+' vs '+value)});
 if(sessionStorage.getItem(FINANCE_CONTEXT_KEY))throw new Error('Datos de transferencia no fueron consumidos');
 if(location.search.includes('ingreso')||location.search.includes('salario'))throw new Error('URL reveló información');
 const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
 set.call(inputs[0],'9999');inputs[0].dispatchEvent(new Event('input',{bubbles:true}));
 await pause();
 notice.querySelector('button').click();
 await pause();
 if(document.querySelector('.ml-finance-context-notice'))throw new Error('No retiró el aviso');
 if(inputs[0].value !== '9999')throw new Error('Borró corrección manual');
 for(let i=1;i<testCase.expected.length;i++){
   if(testCase.expected[i]!==''&&inputs[i].value!=='')throw new Error('No retiró el importe original '+i);
 }
 document.body.dataset.done='true';document.body.dataset.result='ok';
}
run().catch(e=>{document.body.dataset.done='true';document.body.dataset.error=e.message;});`);
  const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});
  await server.listen();
  try{
    const url=`http://127.0.0.1:${server.httpServer.address().port}/${dir}/index.html`;
    const html=await renderDom(chrome,url,{waitMs:6500,until:"document.body.dataset.done==='true'"});
    assert.doesNotMatch(html,/data-error=/);
    assert.match(html,/data-result="ok"/);
  }finally{
    await server.close();
    rmSync(dir,{recursive:true,force:true});
    rmSync('src/__finance-context-endtoend.jsx',{force:true});
  }
});
