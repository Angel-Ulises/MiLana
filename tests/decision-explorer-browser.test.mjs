import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome = [process.env.MILANA_CHROME, '/usr/bin/chromium', '/usr/bin/google-chrome'].filter(Boolean).find(existsSync);
const dir = '__decision-explorer-test';

test('navegador: cambia decisiones, rutas y reinicia sin guardar información', async (t) => {
  if (!browserReady(t, chrome)) return;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/index.html`, '<!doctype html><html lang="es"><head><meta charset="utf-8"></head><body><div id="root"></div><script type="module" src="/src/__decision-explorer-test.jsx"></script></body></html>');
  writeFileSync('src/__decision-explorer-test.jsx', `import React from 'react';
import { createRoot } from 'react-dom/client';
import DecisionExplorer from './decisionExplorer.jsx';
createRoot(document.getElementById('root')).render(<DecisionExplorer initialTopic="dinero" />);
const pause = () => new Promise(r => setTimeout(r, 120));
const require = (truth, message) => { if (!truth) throw new Error(message); };
const button = (selector, text) => [...document.querySelectorAll(selector)].find(b => b.textContent.includes(text));
async function run() {
 await pause();
 require(document.querySelectorAll('.ml-decision-choice').length === 0, 'Repite temas al entrar al hub');
 require(document.querySelectorAll('.ml-decision-need').length === 3, 'Faltan opciones de dinero');
 button('.ml-decision-need', 'preparado').click(); await pause();
 require(document.querySelector('.ml-decision-primary').getAttribute('href') === '/finanzas/fondo-emergencia', 'La ruta de respaldo no es correcta');
 require(document.querySelectorAll('.ml-decision-need').length === 0, 'Apila preguntas y respuesta');
 require(document.activeElement.tagName === 'H3', 'No anuncia el nuevo paso con foco');
 require(document.querySelector('.ml-decision-explanation summary').textContent.includes('empezar'), 'Falta ayuda bajo demanda');
 button('.ml-decision-back', 'pregunta').click(); await pause();
 require(document.querySelectorAll('.ml-decision-need').length === 3, 'No volvió a las preguntas');
 button('.ml-decision-back', 'tema').click(); await pause();
 require(document.querySelectorAll('.ml-decision-choice').length === 4, 'No permite cambiar tema');
 button('.ml-decision-choice', 'carrera').click(); await pause();
 require(document.querySelector('.ml-decision-primary') === null, 'Conservó una ruta del tema anterior');
 button('.ml-decision-need', 'sueldo').click(); await pause();
 require(document.querySelector('.ml-decision-primary').getAttribute('href') === '/calculadoras/bruto-a-neto', 'La ruta salarial no es correcta');
 button('.ml-decision-back', 'pregunta').click(); await pause();
 require(document.querySelectorAll('.ml-decision-need').length === 3, 'Cambiar pregunta pierde el tema');
 require(document.querySelectorAll('.ml-decision-primary').length === 0, 'Cambiar pregunta mantuvo un resultado');
 document.body.dataset.result = 'ok';
 document.body.dataset.done = 'true';
}
run().catch(e => { document.body.dataset.error = e.message; document.body.dataset.done = 'true'; });`);
  const server = await createServer({ server: { host:'127.0.0.1', port:0 }, logLevel:'silent' });
  await server.listen();
  try {
    const url = `http://127.0.0.1:${server.httpServer.address().port}/${dir}/index.html`;
    const html = await renderDom(chrome, url, { waitMs: 7000, until: "document.body.dataset.done === 'true'" });
    assert.doesNotMatch(html, /data-error=/);
    assert.match(html, /data-result="ok"/);
  } finally {
    await server.close();
    rmSync(dir, { recursive:true, force:true });
    rmSync('src/__decision-explorer-test.jsx', { force:true });
  }
});
