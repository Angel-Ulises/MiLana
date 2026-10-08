import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome=[process.env.MILANA_CHROME,'/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
const dir='__calc-result-journey-test';

test('Chrome: RESICO enseña siguientes pasos solo al obtener resultado, sin exponer montos',async(t)=>{
  if(!browserReady(t,chrome))return;
  mkdirSync(dir,{recursive:true});
  writeFileSync(`${dir}/index.html`,'<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div><script type="module" src="/src/__calc-result-journey-test.jsx"></script></body></html>');
  writeFileSync('src/__calc-result-journey-test.jsx',`import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
history.replaceState({},'', '/calculadoras/resico');
createRoot(document.getElementById('root')).render(<App />);
const pause = () => new Promise(r=>setTimeout(r,180));
async function run() {
  await pause();
  if(document.querySelector('.ml-result-journey')) throw new Error('Muestra acciones antes de calcular');
  const field=[...document.querySelectorAll('.calculator-main input[type="number"]')][0];
  if(!field) throw new Error('No montó el formulario');
  const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
  setter.call(field,'20000');
  field.dispatchEvent(new Event('input',{bubbles:true}));
  await pause();
  document.querySelector('.calculator-main .ml-btn').click();
  await pause();
  const result=document.querySelector('.ml-result');
  if(!result) throw new Error('No se calculó el resultado');
  const guide=result.querySelector('.ml-result-journey');
  if(!guide) throw new Error('No hay orientación junto a resultado');
  if(guide.querySelector('a[href="#ml-calc-interpretation"]')===null) throw new Error('Falta explicación');
  if(document.querySelector('#ml-calc-interpretation')===null) throw new Error('Ancla sin destino');
  guide.querySelector('a[href="#ml-calc-interpretation"]').click();
  if(!document.querySelector('#ml-calc-interpretation')?.open) throw new Error('La explicación no se abre');
  if(guide.querySelectorAll('.ml-result-next-links a').length!==2) throw new Error('Rutas relacionadas incorrectas');
  if(guide.textContent.includes('20,000')) throw new Error('La orientación reflejó el importe personal');
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
    rmSync('src/__calc-result-journey-test.jsx',{force:true});
  }
});
