import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome = [process.env.MILANA_CHROME, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'].filter(Boolean).find((p) => existsSync(p));

test('Chrome (medio «print»): la calculadora imprime el resultado sin botones, menú ni pie', async (t) => {
  if (!browserReady(t, chrome)) return;
  const server = await createServer({ root: process.cwd(), server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
  await server.listen();
  try {
    const port = server.httpServer.address().port;
    const html = await renderDom(chrome, `http://127.0.0.1:${port}/calculadoras/aguinaldo`, {
      waitMs: 2500, viewport: { width: 800, height: 1000 },
      beforeNavigate: async (send, sessionId) => { await send('Emulation.setEmulatedMedia', { media: 'print' }, sessionId); },
      until: "!!document.querySelector('[data-calc-directo] input')",
      interact: async (send, sessionId) => {
        const expresion = `(async () => {
          const poner = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
          const i = document.querySelector('[data-calc-directo] input[name="sueldo"]'); poner.call(i, '12000'); i.dispatchEvent(new Event('input', { bubbles: true }));
          await new Promise((r) => setTimeout(r, 700));
          const visible = (s) => { const e = document.querySelector(s); if (!e) return 'no-existe'; const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return String(c.display !== 'none' && r.width > 0 && r.height > 0); };
          document.body.dataset.monto = visible('.rc-monto');
          document.body.dataset.whatsapp = visible('.rc-whatsapp');
          document.body.dataset.escuchar = visible('.rc-escuchar');
          document.body.dataset.siguiente = visible('.rc-siguiente');
          document.body.dataset.volver = visible('.cc-volver');
          document.body.dataset.encabezado = visible('.site-header');
          document.body.dataset.pie = visible('.site-footer');
          document.body.dataset.firma = getComputedStyle(document.querySelector('.calculator-main'), '::after').content.includes('milanaaqui.mx') ? 'true' : 'false';
          document.body.dataset.fin = 'listo';
        })()`;
        await send('Runtime.evaluate', { expression: expresion, awaitPromise: true, returnByValue: true }, sessionId);
      },
    });
    const dato = (n) => (html.match(new RegExp(`data-${n}="([^"]*)"`)) || [])[1];
    assert.equal(dato('fin'), 'listo');
    assert.equal(dato('monto'), 'true', 'el resultado se imprime');
    for (const oculto of ['whatsapp', 'escuchar', 'siguiente', 'volver', 'encabezado', 'pie']) assert.notEqual(dato(oculto), 'true', `${oculto} no debe imprimirse`);
    assert.equal(dato('firma'), 'true', 'el papel lleva «Calculado con MiLana · www.milanaaqui.mx»');
  } finally { await server.close(); }
});
