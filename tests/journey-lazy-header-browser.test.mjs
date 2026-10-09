import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome=[process.env.MILANA_CHROME,'/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
const dir='__journey-lazy-header-test';

test('Chrome Android: conserva el recorrido cuando el encabezado llega tarde', async (t)=>{
 if(!browserReady(t,chrome))return;
 mkdirSync(dir,{recursive:true});
 writeFileSync(dir+'/index.html','<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/src/__journey-lazy-header-test.jsx"></script></body></html>');
 writeFileSync('src/__journey-lazy-header-test.jsx',`import React from 'react';
 import{createRoot}from 'react-dom/client';
 import JourneyCompanion from './journeyCompanion.jsx';
 import './design-home.css';
 import './connected-journeys.css';
 history.replaceState({},'','/finanzas/presupuesto');
 sessionStorage.setItem('ml-guide-journey-v1',JSON.stringify({temaId:'dinero',opcionId:'flujo',destino:'/finanzas/presupuesto',creado:Date.now()}));
 function Case(){
  const [ready,setReady]=React.useState(false);
  React.useEffect(()=>{const id=setTimeout(()=>setReady(true),420);return()=>clearTimeout(id)},[]);
  return <>{ready&&<header className="site-header">MiLana</header>}<JourneyCompanion /></>;
 }
 createRoot(document.getElementById('root')).render(<React.StrictMode><Case/></React.StrictMode>);
 `);
 const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});await server.listen();
 try{
  const origin='http://127.0.0.1:'+server.httpServer.address().port;
  const html=await renderDom(chrome,origin+'/'+dir+'/index.html',{viewport:{width:390,height:844},waitMs:5500,timeoutMs:18000,until:"document.querySelector('.ml-journey')?.textContent?.includes('No sé cuánto me queda')"});
  assert.match(html,/class="ml-journey"/);
  assert.equal((html.match(/class="ml-journey-mount"/g)||[]).length,1,'No debe duplicar la guía por StrictMode');
  assert.match(html,/No sé cuánto me queda/);
  assert.match(html,/Volver a mi pregunta/);
 }finally{await server.close();rmSync(dir,{recursive:true,force:true});rmSync('src/__journey-lazy-header-test.jsx',{force:true});}
});