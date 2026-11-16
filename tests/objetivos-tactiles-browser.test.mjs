import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome = [process.env.MILANA_CHROME, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'].filter(Boolean).find((p) => existsSync(p));

// T4: lo que se toca con el dedo mide al menos 44 px de alto, en las 10 calculadoras con un resultado a la vista.
const CASOS = {
  aguinaldo: [['sueldo', '12000']],
  finiquito: [['sueldo', '18000'], ['ingreso', '2024-01-01']],
  liquidacion: [['sueldo', '18000'], ['ingreso', '2022-03-01']],
  isr: [['sueldo', '20000']],
  resico: [['ingreso', '40000']],
  ptu: [['renta', '5000000']],
  'bruto-a-neto': [['sueldo', '20000']],
  vacaciones: [['anios', '3'], ['sueldo', '18000']],
  infonavit: [['monto', '800000']],
  'pension-imss': [['edad', '62'], ['semanas', '800']],
};
const OBJETIVOS = '.rc-detalle summary, .rc-siguiente, .rc-escuchar, .rc-whatsapp, .cc-enlace, .cc-volver, .cc-frecuencia label';

test('Chrome: botones, enlaces y resúmenes tocables miden al menos 44 px en las 10 calculadoras', async (t) => {
  if (!browserReady(t, chrome)) return;
  const server = await createServer({ root: process.cwd(), server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
  await server.listen();
  try {
    const port = server.httpServer.address().port;
    for (const [slug, campos] of Object.entries(CASOS)) {
      const html = await renderDom(chrome, `http://127.0.0.1:${port}/calculadoras/${slug}`, {
        waitMs: 2500, viewport: { width: 390, height: 800 },
        until: "!!document.querySelector('[data-calc-directo] input')",
        interact: async (send, sessionId) => {
          const expresion = `(async () => {
            const poner = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            for (const [n, v] of ${JSON.stringify(campos)}) { const i = document.querySelector('[data-calc-directo] input[name="' + n + '"]'); if (i) { poner.call(i, v); i.dispatchEvent(new Event('input', { bubbles: true })); } }
            await new Promise((r) => setTimeout(r, 700));
            const chicos = [...document.querySelectorAll(${JSON.stringify(OBJETIVOS)})].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
              .map((e) => ({ t: (e.innerText || e.className).trim().slice(0, 30), h: Math.round(e.getBoundingClientRect().height) })).filter((x) => x.h < 44);
            document.body.dataset.total = String(document.querySelectorAll(${JSON.stringify(OBJETIVOS)}).length);
            document.body.dataset.chicos = chicos.map((c) => c.t + ' ' + c.h + 'px').join(' | ');
            document.body.dataset.fin = 'listo';
          })()`;
          await send('Runtime.evaluate', { expression: expresion, awaitPromise: true, returnByValue: true }, sessionId);
        },
      });
      const dato = (n) => (html.match(new RegExp(`data-${n}="([^"]*)"`)) || [])[1];
      assert.equal(dato('fin'), 'listo', `${slug}: la prueba no terminó`);
      assert.ok(Number(dato('total')) >= 3, `${slug}: debe haber varios objetivos tocables (${dato('total')})`);
      assert.equal(dato('chicos'), '', `${slug}: objetivos de menos de 44 px: ${dato('chicos')}`);
    }
  } finally { await server.close(); }
});
