import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome = [process.env.MILANA_CHROME, '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(existsSync);
const routes = ['/','/carreras','/estados/nuevo-leon','/finanzas','/economia','/invertir'];

test('Chrome Android: las seis áreas montan su módulo dinámico y retiran la pantalla de carga', async t => {
  if (!browserReady(t, chrome)) return;
  const server = await createServer({ server:{ host:'127.0.0.1', port:0 }, logLevel:'silent' });
  await server.listen();
  try {
    const origin = 'http://127.0.0.1:' + server.httpServer.address().port;
    for (const path of routes) {
      const metric = `(() => {
        const title = document.querySelector('#root h1')?.textContent?.trim() || '';
        document.body.dataset.routeSplitResult = encodeURIComponent(JSON.stringify({
          title,
          loading: Boolean(document.querySelector('.ml-route-loading')),
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 2,
          width: innerWidth,
          measuredAtMs: Math.round(performance.now()),
          fcpMs: Math.round(performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint')?.startTime || 0)
        }));
      })()`;
      const html = await renderDom(chrome, origin + path, {
        viewport: { width:390, height:844 },
        waitMs:7200, timeoutMs:25000,
        until: `document.querySelector('#root h1')?.textContent?.trim().length > 10 && !document.querySelector('.ml-route-loading')`,
        evaluate:metric,
      });
      const match = html.match(/data-route-split-result="([^"]+)"/);
      assert.ok(match, path + ': navegador no pudo medir la página');
      const result = JSON.parse(decodeURIComponent(match[1]));
      assert.ok(result.title.length > 10, path + ': no se montó el H1');
      assert.equal(result.loading, false, path + ': pantalla de carga persistente');
      assert.equal(result.horizontalOverflow, false, path + ': overflow horizontal en Android');
      assert.equal(result.width, 390);
      t.diagnostic(`${path}: Chrome Android emulado 390px, contenido visible al medir ${result.measuredAtMs}ms, FCP ${result.fcpMs || 'no disponible'}ms`);
    }
  } finally { await server.close(); }
});