import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';
const chrome=[process.env.MILANA_CHROME,'/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
for(const width of [390,1280])test('Chrome Aprende: una pregunta lleva a su guía, ancho '+width,async t=>{
 if(!browserReady(t,chrome))return;
 const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});
 await server.listen();
 try{
  // Vite sirve el HTML estático de public/ explícitamente por /index.html; /aprende sin sufijo usa el fallback SPA en dev.
  const url='http://127.0.0.1:'+server.httpServer.address().port+'/aprende/index.html';
  const expr=`(() => {
    const initial={
      hidden:document.querySelector('[data-learn-result]')?.hidden,
      collapsed:!document.querySelector('.learn-catalog')?.open,
      count:document.querySelectorAll('[data-learn-topic]').length
    };
    document.querySelector('[data-learn-topic="nomina"]')?.click();
    const after={
      href:document.querySelector('[data-learn-guide]')?.getAttribute('href'),
      tool:document.querySelector('[data-learn-tool]')?.getAttribute('href'),
      visible:!document.querySelector('[data-learn-result]')?.hidden,
      selected:document.querySelectorAll('[data-learn-topic][aria-pressed="true"]').length,
    };
    const expand=document.querySelector('.learn-catalog summary');expand?.click();
    document.body.dataset.aprendeTest=encodeURIComponent(JSON.stringify({initial,after,open:document.querySelector('.learn-catalog')?.open,overflow:document.documentElement.scrollWidth>innerWidth+2}));
  })()`;
  const html=await renderDom(chrome,url,{viewport:{width,height:850},waitMs:4500,until:"document.querySelector('.learn-finder')?.dataset.learnReady==='true'",evaluate:expr});
  const match=html.match(/data-aprende-test="([^"]+)"/);
  assert.ok(match,'No hay métricas en Chrome');
  const result=JSON.parse(decodeURIComponent(match[1]));
  assert.deepEqual(result.initial,{hidden:true,collapsed:true,count:7});
  assert.equal(result.after.href,'/aprende/leer-recibo-nomina');
  assert.equal(result.after.tool,'/calculadoras/bruto-a-neto');
  assert.equal(result.after.visible,true);
  assert.equal(result.after.selected,1);
  assert.equal(result.open,true);
  assert.equal(result.overflow,false);
 }finally{await server.close()}
});