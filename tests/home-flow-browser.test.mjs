import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome = [process.env.MILANA_CHROME, '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(existsSync);
const dir = '__home-flow-test';

test('navegador: no muestra ruta vacía, rechaza enlaces manipulados y deja descartar el regreso', async (t) => {
  if (!browserReady(t, chrome)) return;
  mkdirSync(dir, { recursive:true });
  writeFileSync(`${dir}/index.html`, '<!doctype html><html lang="es"><head><meta charset="utf-8"></head><body><div id="root"></div><script type="module" src="/src/__home-flow-test.jsx"></script></body></html>');
  writeFileSync('src/__home-flow-test.jsx', `import React from 'react';
import { createRoot } from 'react-dom/client';
import { SituationCard } from './homeRoutes.jsx';
const root = createRoot(document.getElementById('root'));
const wait = () => new Promise(resolve => setTimeout(resolve,120));
let n=0;
const draw=async () => { root.render(<SituationCard key={++n} />); await wait(); };
async function run(){
 localStorage.removeItem('ml-orbita-route');
 await draw();
 if(document.querySelector('.orb-situation-card')) throw new Error('Tarjeta vacía visible');
 localStorage.setItem('ml-orbita-route',JSON.stringify({label:'Quiero ahorrar',href:'https://ejemplo.mx',updatedAt:Date.now()}));
 await draw();
 if(document.querySelector('.orb-situation-card')) throw new Error('Aceptó ruta externa');
 localStorage.setItem('ml-orbita-route',JSON.stringify({label:'Quiero ahorrar',href:'/finanzas/ahorro',updatedAt:Date.now()-17*24*60*60*1000}));
 await draw();
 if(document.querySelector('.orb-situation-card')) throw new Error('Mostró una ruta caducada');
 localStorage.setItem('ml-orbita-route',JSON.stringify({label:'Quiero ahorrar',href:'/finanzas/ahorro',updatedAt:Date.now()}));
 await draw();
 const card=document.querySelector('.orb-situation-card');
 if(!card || card.querySelector('a')?.getAttribute('href') !== '/finanzas/ahorro') throw new Error('No recuperó ruta real');
 if(card.textContent.includes('paso 1 de 4')) throw new Error('Explica un paso inexistente');
 card.querySelector('button').click();
 await wait();
 if(document.querySelector('.orb-situation-card') || localStorage.getItem('ml-orbita-route')) throw new Error('No descartó ruta');
 document.body.dataset.result='ok';document.body.dataset.done='true';
}
run().catch(error=>{document.body.dataset.error=error.message;document.body.dataset.done='true';});`);
  const server=await createServer({ server:{ host:'127.0.0.1',port:0 },logLevel:'silent' });
  await server.listen();
  try {
    const url=`http://127.0.0.1:${server.httpServer.address().port}/${dir}/index.html`;
    const html=await renderDom(chrome,url,{waitMs:7000,until:"document.body.dataset.done==='true'"});
    assert.doesNotMatch(html,/data-error=/);
    assert.match(html,/data-result="ok"/);
  } finally {
    await server.close();
    rmSync(dir,{recursive:true,force:true});
    rmSync('src/__home-flow-test.jsx',{force:true});
  }
});

test('navegador: Inicio muestra seis puertas por tema y la explicación queda desplegable', async (t) => {
  if (!browserReady(t, chrome)) return;
  const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});
  await server.listen();
  try {
    const url=`http://127.0.0.1:${server.httpServer.address().port}/`;
    const html=await renderDom(chrome,url,{
      waitMs:7500,
      until:"!!document.querySelector('.ml-topics') && !!document.querySelector('.ml-how-it-works') && !!document.querySelector('.orb-home-routes')",
    });
    assert.match(html, /<details class="ml-how-it-works"/);
    assert.doesNotMatch(html, /<details class="ml-how-it-works" open/);
    assert.equal((html.match(/class="ml-topic ml-topic-[a-z]+"/g) || []).length,6);
    assert.doesNotMatch(html, /<article class="mlq-card|<section[^>]*class="(?:ml-editorial-section|ml-money-map|ml-discovery-section)/);
    assert.doesNotMatch(html,/data-orbita-situation-card="true"/);
  } finally {await server.close();}
});
