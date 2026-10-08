import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,mkdirSync,rmSync,writeFileSync} from 'node:fs';
import {createServer} from 'vite';
import {browserReady} from './helpers/chrome-probe.mjs';
import {renderDom} from './helpers/chrome-dom.mjs';

const chrome=[process.env.MILANA_CHROME,'/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
const dir='__search-by-intent-test';

test('Chrome Android: búsqueda abre con sugerencias y entiende frases cotidianas',async(t)=>{
 if(!browserReady(t,chrome))return;
 mkdirSync(dir,{recursive:true});
 const html=[
 '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
 '<meta data-orbita-runtime-bundle><link rel="stylesheet" href="/orbita-v3-base.css"></head><body>',
 '<header class="ml-orbita-shell"></header><button type="button" data-orbita-search-open>Buscar</button>',
 '<dialog class="ml-orbita-search"><div class="ml-orbita-search-inner"><input type="search" aria-label="Buscar">',
 '<p data-orbita-search-count></p><div class="ml-orbita-search-list">',
 '<a data-orbita-search-item href="/invertir" data-search-aliases="quiero invertir empezar a invertir" data-search-featured="true">Invertir</a>',
 '<a data-orbita-search-item href="/calculadoras/liquidacion" data-search-aliases="me despidieron despido injustificado" data-search-featured="false">Liquidación</a>',
 '<a data-orbita-search-item href="/finanzas/presupuesto" data-search-aliases="no me alcanza cuanto gasto" data-search-featured="true">Presupuesto</a>',
 '</div><p data-orbita-search-empty hidden>Sin resultados</p><button data-orbita-search-close>Cerrar</button></div></dialog>',
 '<main><h1>Prueba de búsqueda</h1></main><script src="/orbita-v3-base.js" defer></script><script src="/__search-by-intent-test/test.js" defer></script>',
 '</body></html>'
 ].join('');
 writeFileSync(dir+'/index.html',html);
 writeFileSync(dir+'/test.js',[
  'const pause=()=>new Promise(r=>setTimeout(r,120));',
  'async function run(){',
  'await pause(); document.querySelector("[data-orbita-search-open]").click(); await pause();',
  'const input=document.querySelector(".ml-orbita-search input");',
  'if(!document.querySelector(".ml-orbita-search").open)throw Error("No abre");',
  'const shown=()=>[...document.querySelectorAll("[data-orbita-search-item]")].filter(x=>!x.hidden);',
  'if(shown().length!==2)throw Error("No muestra sugerencias iniciales");',
  'input.value="me despidieron";input.dispatchEvent(new Event("input",{bubbles:true}));await pause();',
  'if(shown().length!==1||shown()[0].textContent!=="Liquidación")throw Error("No encontró despido");',
  'input.value="quiero invertir";input.dispatchEvent(new Event("input",{bubbles:true}));await pause();',
  'if(shown().length!==1||shown()[0].textContent!=="Invertir")throw Error("No encontró inversión");',
  'input.value="frase desconocida";input.dispatchEvent(new Event("input",{bubbles:true}));await pause();',
  'if(document.querySelector("[data-orbita-search-empty]").hidden)throw Error("No enseña alternativas");',
  'document.body.dataset.result="ok";document.body.dataset.done="true";',
  '}run().catch(e=>{document.body.dataset.error=e.message;document.body.dataset.done="true";});'
 ].join('\n'));
 const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});await server.listen();
 try{
  const url='http://127.0.0.1:'+server.httpServer.address().port+'/'+dir+'/index.html';
  const result=await renderDom(chrome,url,{waitMs:7000,until:"document.body.dataset.done==='true'"});
  assert.doesNotMatch(result,/data-error=/);
  assert.match(result,/data-result="ok"/);
 }finally{await server.close();rmSync(dir,{recursive:true,force:true});}
});