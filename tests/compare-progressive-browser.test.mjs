import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {createServer} from 'vite';
import {browserReady} from './helpers/chrome-probe.mjs';
import {renderDom} from './helpers/chrome-dom.mjs';
const chrome=[process.env.MILANA_CHROME,'/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
const routes=[
 {path:'/carreras/comparar',selector:'.cc-card-more',count:2},
 {path:'/estados/comparar',selector:'.sc-more-dimensions',count:2},
];
test('Chrome Android: comparar carreras y estados revela indicadores sin romper la vista',async t=>{
 if(!browserReady(t,chrome))return;
 const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});await server.listen();
 try{
  const origin='http://127.0.0.1:'+server.httpServer.address().port;
  for(const scenario of routes){
   const evalCode=[
    '(() => {',
    'const selector='+JSON.stringify(scenario.selector)+';',
    'const elements=[...document.querySelectorAll(selector)];',
    'const before=elements.every(x=>!x.open);',
    "elements[0]?.querySelector('summary')?.click();",
    'document.body.dataset.compareProgress=encodeURIComponent(JSON.stringify({count:elements.length,before,after:elements[0]?.open||false,title:document.querySelector("#root h1")?.textContent||"",overflow:document.documentElement.scrollWidth>innerWidth+2}));',
    '})()'
   ].join('\n');
   const html=await renderDom(chrome,origin+scenario.path,{viewport:{width:390,height:844},waitMs:8000,timeoutMs:25000,until:'document.querySelectorAll('+JSON.stringify(scenario.selector)+').length===2',evaluate:evalCode});
   const match=html.match(/data-compare-progress="([^"]+)"/);
   assert.ok(match,scenario.path+' no produjo métricas');
   const result=JSON.parse(decodeURIComponent(match[1]));
   assert.equal(result.count,scenario.count);
   assert.equal(result.before,true);
   assert.equal(result.after,true);
   assert.ok(result.title.length>20);
   assert.equal(result.overflow,false,scenario.path+' overflow horizontal');
  }
 }finally{await server.close()}
});