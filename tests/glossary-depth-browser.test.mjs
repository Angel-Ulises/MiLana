import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,mkdirSync,rmSync,writeFileSync} from 'node:fs';
import {createServer} from 'vite';
import {browserReady} from './helpers/chrome-probe.mjs';
import {renderDom} from './helpers/chrome-dom.mjs';
const chrome=[process.env.MILANA_CHROME,'/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
test('Chrome móvil: explicación corta y profundidad voluntaria',async t=>{
 if(!browserReady(t,chrome))return;
 const dir='__glossary-depth-test';mkdirSync(dir,{recursive:true});
 writeFileSync(dir+'/index.html','<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/orbita-v3-glossary.css"><script>if(new URLSearchParams(location.search).get("expert")==="1")sessionStorage.setItem("ml-lectura-v1","experto");else sessionStorage.removeItem("ml-lectura-v1");</script></head><body><main><h1>Aprender conceptos</h1><p>El ISR, los CETES y los ETF tienen condiciones que debes verificar.</p></main><script src="/orbita-v3-glossary.js" defer></script></body></html>');
 const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});await server.listen();
 try{
  const url='http://127.0.0.1:'+server.httpServer.address().port+'/'+dir+'/index.html';
  const expr=[
    '(() => {',
    "const nodes=[...document.querySelectorAll('.orb-glossary-item')];",
    "const deep=nodes[0]?.querySelector('.orb-glossary-deeper');",
    'const initiallyOpen=Boolean(deep?.open);',
    "const text=nodes[0]?.querySelector(':scope > p')?.textContent||'';",
    "deep?.querySelector('summary')?.click();",
    'document.body.dataset.glossaryResult=encodeURIComponent(JSON.stringify({count:nodes.length,initiallyOpen,afterClick:deep?.open,text,overflow:document.documentElement.scrollWidth>innerWidth+2}));',
    '})()'
  ].join('\n');
  for(const [query,opened] of [['',false],['?expert=1',true]]){
   const html=await renderDom(chrome,url+query,{viewport:{width:390,height:844},waitMs:4200,until:"document.querySelectorAll('.orb-glossary-item').length===3",evaluate:expr});
   const match=html.match(/data-glossary-result="([^"]+)"/);
   assert.ok(match,'No hay medición en Chrome');
   const m=JSON.parse(decodeURIComponent(match[1]));
   assert.equal(m.count,3);
   assert.equal(m.initiallyOpen,opened);
   assert.equal(m.afterClick,!opened);
   assert.ok(m.text.length>15);
   assert.equal(m.overflow,false);
  }
  await renderDom(chrome,url,{viewport:{width:390,height:844},waitMs:4200,until:"document.querySelectorAll('.orb-glossary-item').length===3",interact:async(send,session)=>{
    const result=await send('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`(async()=>{
      const {guardarNivelLectura}=await import('/src/lib/readingDepth.js');
      const wait=()=>new Promise(r=>setTimeout(r,100));
      const deep=[...document.querySelectorAll('.orb-glossary-deeper')];
      guardarNivelLectura('experto');await wait();
      const opened=deep.every(el=>el.open);
      deep[0].querySelector('summary').click();await wait();
      guardarNivelLectura('medio');await wait();
      guardarNivelLectura('experto');await wait();
      const manual=deep[0].open===false && deep.slice(1).every(el=>el.open);
      Object.defineProperty(window,'sessionStorage',{configurable:true,value:{getItem:()=> 'experto',setItem(){throw new DOMException('Quota','QuotaExceededError')}}});
      guardarNivelLectura('medio');await wait();
      dispatchEvent(new Event('pageshow'));await wait();
      return {opened,manual,volatile:deep.every(el=>!el.open)};
    })()`},session);
    assert.equal(result.exceptionDetails,undefined);
    assert.deepEqual(result.result.value,{opened:true,manual:true,volatile:true});
  }});
 }finally{await server.close();rmSync(dir,{recursive:true,force:true});}
});