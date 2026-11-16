import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome = [process.env.MILANA_CHROME, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'].filter(Boolean).find((p) => existsSync(p));

// H-6: quien lleva menos de un año debe ver una explicación, no un error ni un vacío.
const CASOS = [['0', 'menos'], ['0.5', 'menos'], ['1', 'doce']];

test('Chrome: vacaciones explica qué pasa con menos de un año y enlaza a Finiquito', async (t) => {
  if (!browserReady(t, chrome)) return;
  const server = await createServer({ root: process.cwd(), server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
  await server.listen();
  try {
    const port = server.httpServer.address().port;
    for (const [valor, esperado] of CASOS) {
      const html = await renderDom(chrome, `http://127.0.0.1:${port}/calculadoras/vacaciones`, {
        waitMs: 2500, viewport: { width: 390, height: 800 },
        until: "!!document.querySelector('[data-calc-directo] input[name=\"anios\"]')",
        interact: async (send, sessionId) => {
          const expresion = `(async () => {
            const poner = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            const input = document.querySelector('[data-calc-directo] input[name="anios"]');
            poner.call(input, '${valor}'); input.dispatchEvent(new Event('input', { bubbles: true }));
            await new Promise((r) => setTimeout(r, 600));
            const caja = document.querySelector('[data-menos-de-un-anio]');
            const visible = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
            document.body.dataset.caja = String(visible(caja));
            document.body.dataset.enlace = caja?.querySelector('a')?.getAttribute('href') || '';
            document.body.dataset.error = String([...document.querySelectorAll('[data-calc-directo] [role="alert"], [data-calc-directo] .cc-error')].some((e) => e.innerText.trim() !== ''));
            document.body.dataset.monto = document.querySelector('.rc-monto')?.innerText || '';
            document.body.dataset.fin = 'listo';
          })()`;
          await send('Runtime.evaluate', { expression: expresion, awaitPromise: true, returnByValue: true }, sessionId);
        },
      });
      const dato = (n) => (html.match(new RegExp(`data-${n}="([^"]*)"`)) || [])[1];
      assert.equal(dato('fin'), 'listo', `${valor}: la prueba no terminó`);
      assert.equal(dato('error'), 'false', `${valor}: no debe haber error`);
      if (esperado === 'menos') {
        assert.equal(dato('caja'), 'true', `${valor}: debe verse la explicación del primer año`);
        assert.equal(dato('enlace'), '/calculadoras/finiquito', `${valor}: debe enlazar a Finiquito`);
        assert.equal(dato('monto'), '', `${valor}: no debe mostrar un monto de días`);
      } else {
        assert.equal(dato('caja'), 'false');
        assert.match(dato('monto') || '', /12 días/, `${valor}: al cumplir el año, 12 días`);
      }
    }
  } finally { await server.close(); }
});
