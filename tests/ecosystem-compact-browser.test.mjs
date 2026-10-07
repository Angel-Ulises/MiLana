import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome = [process.env.MILANA_CHROME, '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(existsSync);

test('navegador: Finanzas y Carreras integran el explorador sin navegación repetida', async (t) => {
  if (!browserReady(t, chrome)) return;
  const server = await createServer({ server: { host:'127.0.0.1', port:0 }, logLevel:'silent' });
  await server.listen();
  const base = `http://127.0.0.1:${server.httpServer.address().port}`;
  try {
    for (const ruta of ['/finanzas', '/carreras']) {
      const html = await renderDom(chrome, base + ruta, {
        waitMs: 5000,
        until: `!!document.querySelector('.ecosystem-hub .ml-decision-needs') && !!document.querySelector('.ecosystem-shortcuts')`,
      });
      assert.match(html, /id="explorar"/, ruta);
      assert.match(html, /class="ecosystem-shortcuts"/, ruta);
      assert.match(html, /class="ml-decision-needs"/, ruta);
      assert.doesNotMatch(html, /class="ml-decision-result"/, ruta);
      assert.match(html, /href="#explorar"/, ruta);
      if (ruta === '/finanzas') {
        assert.doesNotMatch(html, /class="finance-advisor-preview"/);
        assert.doesNotMatch(html, /class="finance-route-list"/);
        assert.match(html, /href="\/finanzas\/mi-situacion"/);
        assert.match(html, /href="\/finanzas\/ahorro"/);
      } else {
        assert.match(html, /<details class="ecosystem-more-questions"/);
        assert.doesNotMatch(html, /<section class="career-question-section"/);
        assert.doesNotMatch(html, /<section class="career-money-bridge"/);
        assert.match(html, /class="career-money-inline"/);
        assert.match(html, /href="\/calculadoras\/bruto-a-neto"/);
      }
    }
  } finally { await server.close(); }
});
