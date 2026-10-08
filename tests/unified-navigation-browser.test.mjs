import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome=[process.env.MILANA_CHROME,'/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
const dir='__unified-navigation-test';
for(const page of ['/estados/nuevo-leon','/calculadoras/isr']){
 test(`Chrome: header común tiene siete enlaces y sección activa para ${page}`,async t=>{
   if(!browserReady(t,chrome))return;
   mkdirSync(dir,{recursive:true});
   writeFileSync(`${dir}/index.html`,'<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/src/__unified-navigation-test.jsx"></script></body></html>');
   writeFileSync('src/__unified-navigation-test.jsx',`import React from 'react';
import { createRoot } from 'react-dom/client';
import SiteHeader from './siteHeader.jsx';
history.replaceState({},'',${JSON.stringify(page)});
createRoot(document.getElementById('root')).render(<SiteHeader ctaLabel="Mi situación" ctaHref="/finanzas/mi-situacion"/>);
async function run(){
 await new Promise(r=>setTimeout(r,160));
 const nav=document.querySelector('.desktop-nav');
 const links=[...nav.querySelectorAll('a')];
 const expected=['/#calculadoras','/carreras','/estados','/finanzas','/invertir','/economia','/aprende'];
 if(JSON.stringify(links.map(a=>a.getAttribute('href')))!==JSON.stringify(expected))throw Error('Menú no coincide');
 if(nav.querySelectorAll('[aria-current="page"]').length!==1)throw Error('No hay una sola sección activa');
 if(nav.querySelector('[aria-current="page"]').getAttribute('href')!=='${page.startsWith('/estados')?'/estados':'/#calculadoras'}')throw Error('Sección activa incorrecta');
 if(document.querySelectorAll('.site-header').length!==1)throw Error('Header duplicado');
 if(!document.querySelector('a.header-cta[href="/finanzas/mi-situacion"]'))throw Error('CTA perdió destino');
 document.body.dataset.done='true';document.body.dataset.result='ok';
}
run().catch(e=>{document.body.dataset.done='true';document.body.dataset.error=e.message;});`);
   const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});
   await server.listen();
   try{
     const html=await renderDom(chrome,`http://127.0.0.1:${server.httpServer.address().port}/${dir}/index.html`,{waitMs:6000,until:"document.body.dataset.done === 'true'"});
     assert.doesNotMatch(html,/data-error=/);
     assert.match(html,/data-result="ok"/);
   }finally{await server.close();rmSync(dir,{recursive:true,force:true});rmSync('src/__unified-navigation-test.jsx',{force:true});}
 });
}