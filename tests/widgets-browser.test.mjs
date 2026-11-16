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

const CASOS_WIDGET = [
  ['aguinaldo', 'sueldo', '12000'],
  ['isr', 'sueldo', '20000'],
  ['finiquito', 'sueldo', '18000'],
  ['resico', 'ingreso', '40000'],
];

test('navegador: el widget muestra el campo y el resultado al escribir (no solo la barra de marca)', async (t) => {
  if (!browserReady(t, chrome)) return;
  const server = await createServer({ root:process.cwd(), server:{host:'127.0.0.1',port:0}, logLevel:'silent' });
  await server.listen();
  try {
    const port = server.httpServer.address().port;
    for (const [slug, campo, valor] of CASOS_WIDGET) {
      const html = await renderDom(chrome, `http://127.0.0.1:${port}/calculadoras/${slug}?embed=1`, {
        waitMs: 2500,
        viewport: { width: 420, height: 640 },
        until: "!!document.querySelector('[data-calc-directo] input')",
        interact: async (send, sessionId) => {
          const expresion = `(async () => {
            const visible = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return r.width > 0 && r.height > 0 && c.display !== 'none' && c.visibility !== 'hidden'; };
            const input = document.querySelector('[data-calc-directo] input[name="${campo}"]');
            document.body.dataset.campoVisible = String(visible(input));
            const poner = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            poner.call(input, '${valor}');
            input.dispatchEvent(new Event('input', { bubbles: true }));
            ${slug === 'finiquito' ? "const ing = document.querySelector('[data-calc-directo] input[name=\"ingreso\"]'); poner.call(ing, '2024-01-01'); ing.dispatchEvent(new Event('input', { bubbles: true }));" : ''}
            await new Promise((r) => setTimeout(r, 700));
            const monto = document.querySelector('.rc-monto');
            document.body.dataset.montoVisible = String(visible(monto));
            document.body.dataset.monto = monto ? monto.innerText : '';
            document.body.dataset.marca = String(visible(document.querySelector('.ml-embed-brand')));
            document.body.dataset.explicacionOculta = String(!visible(document.querySelector('.calc-mas-info')));
            document.body.dataset.enlacesSueltos = String([...document.querySelectorAll('.calculator-main a[href]')].filter((a) => visible(a) && a.target !== '_blank').length);
            document.body.dataset.prueba = 'listo';
          })()`;
          await send('Runtime.evaluate', { expression: expresion, awaitPromise: true, returnByValue: true }, sessionId);
        },
      });
      const dato = (nombre) => (html.match(new RegExp(`data-${nombre}="([^"]*)"`)) || [])[1];
      assert.equal(dato('prueba'), 'listo', `${slug}: la prueba no terminó`);
      assert.equal(dato('campo-visible'), 'true', `${slug}: el campo debe verse en el widget`);
      assert.equal(dato('monto-visible'), 'true', `${slug}: el resultado debe verse en el widget`);
      assert.match(dato('monto') || '', /\$|días/, `${slug}: el resultado debe traer un monto`);
      assert.equal(dato('marca'), 'true', `${slug}: debe verse «Abrir completa»`);
      assert.equal(dato('enlaces-sueltos'), '0', `${slug}: ningún enlace visible debe abrirse dentro del iframe`);
      assert.equal(dato('explicacion-oculta'), 'true', `${slug}: la explicación larga no va dentro del widget`);
    }
  } finally { await server.close(); }
});
