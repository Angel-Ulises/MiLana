import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome = [process.env.MILANA_CHROME, '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(existsSync);
const dir = '__savings-scenarios-test';

test('navegador: no inventa datos y responde a cambios del control', async (t) => {
  if (!browserReady(t, chrome)) return;
  mkdirSync(dir, { recursive:true });
  writeFileSync(`${dir}/index.html`, '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div><script type="module" src="/src/__savings-scenarios-test.jsx"></script></body></html>');
  writeFileSync('src/__savings-scenarios-test.jsx', `import React from 'react';
import { createRoot } from 'react-dom/client';
import SavingsScenarios from './savingsScenarios.jsx';
const root = createRoot(document.querySelector('#root'));
const pause = () => new Promise(r => setTimeout(r, 150));
async function run() {
 root.render(<SavingsScenarios meta="" actual="1000" mensual="1000" />);
 await pause();
 if (!document.querySelector('.ml-scenarios-empty')) throw new Error('Falta estado vacío');
 root.render(<SavingsScenarios meta="10000" actual="1000" mensual="1000" />);
 await pause();
 const summary = () => document.querySelector('.ml-scenarios-summary').textContent;
 if (!summary().includes('9 meses')) throw new Error('Tiempo base incorrecto');
 if (document.querySelectorAll('.ml-scenarios-chart-row').length !== 3) throw new Error('Faltan barras');
 const input = document.querySelector('input[type=range]');
 const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
 set.call(input, '150');
 input.dispatchEvent(new Event('input', { bubbles:true }));
 input.dispatchEvent(new Event('change', { bubbles:true }));
 await pause();
 if (!summary().includes('6 meses')) throw new Error('La alternativa no se actualizó');
 document.body.dataset.result = 'ok';
 document.body.dataset.done = 'true';
}
run().catch(e => {document.body.dataset.error = e.message; document.body.dataset.done = 'true';});`);
  const server = await createServer({ server:{host:'127.0.0.1', port:0}, logLevel:'silent' });
  await server.listen();
  try {
    const url = `http://127.0.0.1:${server.httpServer.address().port}/${dir}/index.html`;
    const html = await renderDom(chrome, url, { waitMs:7000, until:"document.body.dataset.done === 'true'" });
    assert.doesNotMatch(html, /data-error=/);
    assert.match(html, /data-result="ok"/);
  } finally {
    await server.close();
    rmSync(dir, {recursive:true,force:true});
    rmSync('src/__savings-scenarios-test.jsx', {force:true});
  }
});
