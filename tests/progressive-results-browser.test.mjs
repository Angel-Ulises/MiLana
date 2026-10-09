import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {createServer} from 'vite';
import {browserReady} from './helpers/chrome-probe.mjs';
import {renderDom} from './helpers/chrome-dom.mjs';

const chrome=[process.env.MILANA_CHROME,'/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
const art=JSON.parse(readFileSync('src/data/economia.json','utf8')).articulos[0].slug;
const scenarios=[
 {route:'/finanzas/fondo-emergencia',selector:'.finance-result-card .ml-result-meaning'},
 {route:'/carreras/mejor-pagadas',selector:'.career-ranking ~ .ml-result-meaning, .career-meaning'},
 {route:'/economia/'+art,selector:'.economy-context-extra'},
];
test('Chrome Android: los resultados abren explicación sin desbordarse ni exigir otro formulario',async t=>{
 if(!browserReady(t,chrome))return;
 const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});
 await server.listen();
 try{
  const origin='http://127.0.0.1:'+server.httpServer.address().port;
  for(const {route,selector} of scenarios){
   const evalCode=[
    '(() => {',
    'const el=document.querySelector('+JSON.stringify(selector)+');',
    "const initial=el?.open||false;",
    "el?.querySelector('summary')?.click();",
    'const output={initial,open:el?.open||false,title:document.querySelector("#root h1")?.textContent||"",overflow:document.documentElement.scrollWidth>innerWidth+2};',
    'document.body.dataset.meaningResult=encodeURIComponent(JSON.stringify(output));',
    '})()'
   ].join('\n');
   const html=await renderDom(chrome,origin+route,{
    viewport:{width:390,height:844},waitMs:7000,timeoutMs:25000,
    until:'document.querySelector('+JSON.stringify(selector)+') !== null',
    evaluate:evalCode
   });
   const m=html.match(/data-meaning-result="([^"]+)"/);
   assert.ok(m,route+' no obtuvo diagnóstico de Chrome');
   const result=JSON.parse(decodeURIComponent(m[1]));
   assert.ok(result.title.length>10,route+' sin encabezado');
   assert.equal(result.initial,false,route+' debe iniciar cerrado');
   assert.equal(result.open,true,route+' no se puede abrir con un toque');
   assert.equal(result.overflow,false,route+' overflow horizontal');
  }
 }finally{await server.close()}
});