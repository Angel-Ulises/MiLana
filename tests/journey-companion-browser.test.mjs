import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome = [process.env.MILANA_CHROME, '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(existsSync);
const dir = '__journey-companion-test';

test('navegador: elegir una pregunta conecta la página de destino y permite cerrar la guía', async (t) => {
  if (!browserReady(t, chrome)) return;
  mkdirSync(dir, { recursive:true });
  writeFileSync(`${dir}/index.html`, '<!doctype html><html lang="es"><head><meta charset="utf-8"></head><body><div id="root"></div><script type="module" src="/src/__journey-companion-test.jsx"></script></body></html>');
  writeFileSync('src/__journey-companion-test.jsx', `import React from 'react';
import { createRoot } from 'react-dom/client';
import DecisionExplorer from './decisionExplorer.jsx';
import JourneyCompanion from './journeyCompanion.jsx';
const root = createRoot(document.getElementById('root'));
root.render(<><header className="site-header">MiLana</header><DecisionExplorer initialTopic="dinero" /><JourneyCompanion /></>);
const pause = () => new Promise(r => setTimeout(r, 130));
async function run() {
 await pause();
 const choices=[...document.querySelectorAll('.ml-decision-need')];
 if(choices.length !== 3) throw new Error('No aparecen tres preguntas');
 choices.find(x=>x.textContent.includes('preparado')).click();
 await pause();
 const action=document.querySelector('.ml-decision-primary');
 if(action?.getAttribute('href') !== '/finanzas/fondo-emergencia') throw new Error('Destino incorrecto');
 document.addEventListener('click',e=>{if(e.target.closest('a.ml-decision-primary'))e.preventDefault()}, {capture:true});
 action.click();
 if(!sessionStorage.getItem('ml-guide-journey-v1')) throw new Error('No conservó el tema elegido');
 history.pushState({},'', '/finanzas/fondo-emergencia');
 window.dispatchEvent(new Event('milana:route-change'));
 await pause();
 const banner=document.querySelector('.ml-journey');
 if(!banner?.textContent.includes('Quiero estar preparado')) throw new Error('No acompañó la pregunta');
 if(!banner?.textContent.includes('fondo de emergencia')) throw new Error('No identificó herramienta actual');
 banner.querySelector('button[aria-label="Cerrar este recorrido"]').click();
 await pause();
 if(document.querySelector('.ml-journey')) throw new Error('No se pudo cerrar');
 document.body.dataset.done='true';document.body.dataset.result='ok';
}
run().catch(e=>{document.body.dataset.done='true';document.body.dataset.error=e.message});`);
  const server=await createServer({ server:{ host:'127.0.0.1', port:0 }, logLevel:'silent' });
  await server.listen();
  try {
    const url=`http://127.0.0.1:${server.httpServer.address().port}/${dir}/index.html`;
    const html=await renderDom(chrome,url,{ waitMs:6500, until:"document.body.dataset.done==='true'" });
    assert.doesNotMatch(html,/data-error=/);
    assert.match(html,/data-result="ok"/);
  } finally {
    await server.close();
    rmSync(dir,{recursive:true,force:true});
    rmSync('src/__journey-companion-test.jsx',{force:true});
  }
});
