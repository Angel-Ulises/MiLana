import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome=[process.env.MILANA_CHROME,'/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
const dir='__comparison-profile-test';

for(const item of [
  {page:'estado',path:'/estados/comparar?desde=nuevo-leon',slug:'nuevo-leon',summary:'.sc-summary',picker:'.sc-selectors'},
  {page:'carrera',path:'/carreras/comparar?desde=medicina',slug:'medicina',summary:'.cc-card',picker:'.cc-selectors'},
  {page:'estado',path:'/estados/comparar?desde=invalido',slug:null,summary:'.sc-summary',picker:'.sc-selectors'},
]) test(`Chrome: comparación ${item.page} desde ${item.slug||'origen inválido'}`,async t=>{
  if(!browserReady(t,chrome)) return;
  mkdirSync(dir,{recursive:true});
  writeFileSync(`${dir}/index.html`,'<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/src/__comparison-profile-test.jsx"></script></body></html>');
  writeFileSync('src/__comparison-profile-test.jsx',`import React from 'react';
import { createRoot } from 'react-dom/client';
import StateComparePage from './stateComparePage.jsx';
import CareerComparePage from './careerComparePage.jsx';
const config=${JSON.stringify(item)};
history.replaceState({},'',config.path);
createRoot(document.getElementById('root')).render(config.page==='estado'?<StateComparePage/>:<CareerComparePage/>);
const pause=()=>new Promise(r=>setTimeout(r,180));
async function run(){
 await pause();
 const selectors=[...document.querySelectorAll(config.picker+' select')];
 if(selectors.length!==2)throw new Error('Deben existir dos controles');
 if(config.slug){
   if(selectors[0].value!==config.slug)throw new Error('No preservó la ficha inicial');
   if(selectors[0].value===selectors[1].value)throw new Error('Seleccionó la misma ficha dos veces');
   if(!document.querySelector('.ml-compare-origin'))throw new Error('No explicó contexto del comparador');
 }else if(document.querySelector('.ml-compare-origin'))throw new Error('Se confió en un parámetro desconocido');
 const original=selectors[1].value;
 const other=[...selectors[1].options].find(x=>x.value!==selectors[0].value&&x.value!==original);
 if(!other)throw new Error('Faltan alternativas');
 const set=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set;
 set.call(selectors[1],other.value);
 selectors[1].dispatchEvent(new Event('change',{bubbles:true}));
 await pause();
 if(selectors[1].value!==other.value)throw new Error('No se puede cambiar la segunda selección');
 if(!document.querySelector(config.summary))throw new Error('No renderizó las métricas');
 if(location.search.includes('importe')||location.search.includes('ingreso'))throw new Error('Se transfirió una cantidad privada');
 document.body.dataset.done='true';document.body.dataset.result='ok';
}
run().catch(e=>{document.body.dataset.done='true';document.body.dataset.error=e.message;});`);
  const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});
  await server.listen();
  try {
    const url=`http://127.0.0.1:${server.httpServer.address().port}/${dir}/index.html`;
    const html=await renderDom(chrome,url,{viewport:{width:390,height:850},waitMs:7000,until:"document.body.dataset.done==='true'"});
    assert.doesNotMatch(html,/data-error=/);
    assert.match(html,/data-result="ok"/);
  }finally{
    await server.close();
    rmSync(dir,{recursive:true,force:true});
    rmSync('src/__comparison-profile-test.jsx',{force:true});
  }
});
