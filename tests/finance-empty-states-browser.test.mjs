import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';
const chrome = [process.env.MILANA_CHROME, '/usr/bin/chromium', '/usr/bin/google-chrome'].filter(Boolean).find(existsSync);
// Keep the HTML outside public so Vite injects the React refresh preamble.
const dir = '__finance-empty-test';

for (const advisor of [false, true]) test(`navegador: ${advisor ? 'asesor' : 'presupuesto'} vacío, captura, ceros y borrado`, async (t) => {
  if (!browserReady(t, chrome)) return;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/index.html`, `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div><script type="module" src="/src/__finance-empty-test.jsx"></script></body></html>`);
  writeFileSync('src/__finance-empty-test.jsx', `import React from 'react';
import { createRoot } from 'react-dom/client';
import Page from './${advisor ? 'advisorPage' : 'financePages'}.jsx';
history.replaceState(null, '', '/finanzas/${advisor ? 'mi-situacion' : 'presupuesto'}');
createRoot(document.getElementById('root')).render(<Page />);
const pause = () => new Promise(r => setTimeout(r, 80));
async function run() {
 await pause();
 const inputs = [...document.querySelectorAll('input')];
 if (!inputs.length) throw new Error('The component did not mount');
 const output = () => document.querySelector('${advisor ? '.advisor-results' : '.finance-results'}').textContent;
 const states = [output()];
 const set = (index, value) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(inputs[index], value); inputs[index].dispatchEvent(new Event('input', { bubbles: true })); };
 for (const values of [${advisor ? "['2000','1000','0','0','0'], ['2000','1000','0','0','3000'], ['0','0','0','0','0']" : "['10000','6000','1000','0'], ['0','1000','0','0'], ['0','0','0','0']"}]) {
   values.forEach((v, i) => set(i, v)); await pause(); states.push(output());
 }
 set(0, ''); set(1, ''); await pause(); states.push(output());
 const result = document.createElement('pre'); result.id = 'test-result'; result.textContent = JSON.stringify(states); document.body.append(result); document.body.dataset.done = 'true';
}
run().catch(error => { document.body.dataset.error = error.message; document.body.dataset.done = 'true'; });`);
  const server = await createServer({ server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
  await server.listen();
  try {
    const html = await renderDom(chrome, `http://127.0.0.1:${server.httpServer.address().port}/__finance-empty-test/index.html`, { waitMs: 5000, until: "document.body.dataset.done === 'true'" });
    assert.doesNotMatch(html, /data-error=/);
    assert.match(html, /<pre id="test-result">/);
    const states = JSON.parse(html.match(/<pre id="test-result">(.*?)<\/pre>/s)[1].replaceAll('&amp;', '&').replaceAll('&gt;', '>').replaceAll('&lt;', '<'));
    if (advisor) {
      assert.match(states[0], /Captura tus gastos esenciales/);
      assert.doesNotMatch(states[0], /ya alcanza/);
      assert.match(states[1], /3 meses\. Es un escenario/);
      assert.match(states[2], /ya alcanza/);
      assert.match(states[3], /no hay una referencia útil/);
      assert.match(states[4], /Captura tus gastos esenciales/);
    } else {
      assert.match(states[0], /Completa tus datos/);
      assert.doesNotMatch(states[0], /superan/);
      assert.match(states[1], /\$3,000/);
      assert.match(states[1], /30.0%/);
      assert.match(states[2], /superan/);
      assert.match(states[3], /equilibrados/);
      assert.match(states[4], /Completa tus datos/);
      assert.match(html, /class="finance-results" aria-live="polite"/);
    }
  } finally {
    await server.close();
    rmSync(dir, { recursive: true, force: true });
    rmSync('src/__finance-empty-test.jsx', { force: true });
  }
});
