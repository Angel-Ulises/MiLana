import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

// Mejora 2026-11: las 10 calculadoras muestran el formulario completo (sin asistente paso a paso)
// y el resultado aparece al escribir, con una sola sugerencia, WhatsApp y el evento GA4.
const chrome=[process.env.MILANA_CHROME,'/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
const dir='__calculadoras-directas-test';
const CASOS={
  '/calculadoras/aguinaldo':[['sueldo','12000']],
  '/calculadoras/finiquito':[['sueldo','18000'],['ingreso','2024-01-01']],
  '/calculadoras/liquidacion':[['sueldo','18000'],['ingreso','2022-03-01']],
  '/calculadoras/isr':[['sueldo','20000']],
  '/calculadoras/resico':[['ingreso','40000']],
  '/calculadoras/ptu':[['renta','5000000']],
  '/calculadoras/bruto-a-neto':[['sueldo','20000']],
  '/calculadoras/vacaciones':[['anios','3'],['sueldo','18000']],
  '/calculadoras/infonavit':[['monto','800000']],
  '/calculadoras/pension-imss':[['edad','62'],['semanas','800']],
};

test('Chrome: las 10 calculadoras dan resultado al escribir, sin asistente paso a paso',async(t)=>{
  if(!browserReady(t,chrome))return;
  mkdirSync(dir,{recursive:true});
  writeFileSync(`${dir}/index.html`,'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/src/__calculadoras-directas-test.jsx"></script></body></html>');
  writeFileSync('src/__calculadoras-directas-test.jsx',`import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import App from './App.jsx';
const CASOS=${JSON.stringify(CASOS)};
const pause=(ms=160)=>new Promise(r=>setTimeout(r,ms));
const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
async function run(){
  const out=[];
  for(const [ruta,campos] of Object.entries(CASOS)){
    history.replaceState({},'',ruta);
    const host=document.createElement('div');document.body.appendChild(host);
    const root=createRoot(host);flushSync(()=>root.render(<App />));
    await pause();
    if(host.querySelector('.ml-calc-assistant')) throw new Error(ruta+': volvió el asistente');
    for(const [name,valor] of campos){
      const el=host.querySelector('[data-calc-directo] input[name="'+name+'"]');
      if(!el) throw new Error(ruta+': falta campo '+name);
      setter.call(el,valor);el.dispatchEvent(new Event('input',{bubbles:true}));
    }
    await pause();
    const r=host.querySelector('[data-resultado-claro]');
    if(!r) throw new Error(ruta+': sin resultado. '+(host.querySelector('.cc-error')?.textContent||''));
    if(r.querySelectorAll('.rc-siguiente').length!==1) throw new Error(ruta+': debe haber una sola sugerencia');
    if(!r.querySelector('a.rc-whatsapp[href^="https://wa.me/?text="]')) throw new Error(ruta+': falta WhatsApp');
    if(!/Datos actualizados al/.test(r.textContent)) throw new Error(ruta+': falta fecha de actualización');
    out.push(ruta);
    root.unmount();host.remove();
  }
  const eventos=(window.milanaEventos||[]).filter(e=>e.evento.startsWith('calcular_')).length;
  if(eventos<10) throw new Error('Eventos GA4 registrados: '+eventos);
  document.body.dataset.rutas=out.length;document.body.dataset.done='true';
}
run().catch(e=>{document.body.dataset.done='true';document.body.dataset.error=e.message;});`);
  const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});
  await server.listen();
  try{
    const html=await renderDom(chrome,`http://127.0.0.1:${server.httpServer.address().port}/${dir}/index.html`,{waitMs:20000,until:"document.body.dataset.done === 'true'"});
    assert.doesNotMatch(html,/data-error=/, (html.match(/data-error="([^"]*)"/)||[])[1]);
    assert.match(html,/data-rutas="10"/);
  }finally{await server.close();rmSync(dir,{recursive:true,force:true});rmSync('src/__calculadoras-directas-test.jsx',{force:true});}
});
