import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';
import { createServer } from 'vite';

const candidates = [
  process.env.MILANA_CHROME,
  '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
].filter(Boolean);
const chrome = candidates.find((path) => existsSync(path));

test('navegador: el iframe soportado muestra formulario y Abrir completa', async (t) => {
  if (!browserReady(t, chrome)) return;
  const server = await createServer({ root:process.cwd(), server:{host:'127.0.0.1',port:0}, logLevel:'silent' });
  await server.listen();
  try {
    const port = server.httpServer.address().port;
    const html = await renderDom(chrome, `http://127.0.0.1:${port}/calculadoras/aguinaldo?embed=1`, { waitMs: 2500, until: "!!document.querySelector('form') && document.body.innerText.includes('Abrir completa')" });
    assert.match(html, /class="[^"]*calculator-main/);
    assert.match(html, /<form/);
    assert.match(html, /Abrir completa/);
    assert.doesNotMatch(html, /data-orbita-shell/);
  } finally { await server.close(); }
});
