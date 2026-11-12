import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome=[process.env.MILANA_CHROME,'/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
const dir='__calc-result-journey-test';

test('Chrome: RESICO muestra el resultado al escribir, una sola sugerencia, WhatsApp y el evento GA4',async(t)=>{
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
  if(document.querySelector('[data-resultado-claro]')) throw new Error('Muestra resultado antes de escribir');
  const field=document.querySelector('[data-calc-directo] input[name="ingreso"]');
  if(!field) throw new Error('No montó el formulario');
  const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
  setter.call(field,'20000');
  field.dispatchEvent(new Event('input',{bubbles:true}));
  await pause();
  const result=document.querySelector('[data-resultado-claro]');
  if(!result) throw new Error('No se calculó el resultado al escribir');
  if(!result.querySelector('.rc-monto').textContent.includes('200.00')) throw new Error('Monto incorrecto: '+result.querySelector('.rc-monto').textContent);
  if(result.querySelectorAll('.rc-siguiente').length!==1) throw new Error('Debe haber una sola sugerencia');
  if(result.querySelector('.rc-siguiente').textContent.includes('20,000')) throw new Error('La sugerencia reflejó el importe personal');
  const wa=result.querySelector('a.rc-whatsapp');
  if(!wa || !wa.href.startsWith('https://wa.me/?text=')) throw new Error('Falta compartir por WhatsApp');
  const ev=(window.milanaEventos||[]).find(e=>e.evento==='calcular_resico');
  if(!ev || ev.modo!=='mensual') throw new Error('No registró calcular_resico');
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
