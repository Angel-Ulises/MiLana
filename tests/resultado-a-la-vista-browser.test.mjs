import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome = [process.env.MILANA_CHROME, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'].filter(Boolean).find((p) => existsSync(p));

// H-4: con el teclado abierto (ventana de 420 px de alto) el monto queda abajo; la barra lo muestra y lleva a él.
const CASOS = {
  aguinaldo: [['sueldo', '12000']],
  finiquito: [['ingreso', '2024-01-01'], ['sueldo', '18000']],
  liquidacion: [['ingreso', '2022-03-01'], ['sueldo', '18000']],
  isr: [['sueldo', '20000']],
  resico: [['ingreso', '40000']],
  ptu: [['renta', '5000000']],
  'bruto-a-neto': [['sueldo', '20000']],
  vacaciones: [['sueldo', '18000'], ['anios', '3']],
  infonavit: [['monto', '800000']],
  'pension-imss': [['semanas', '800'], ['edad', '62']],
};

async function revisar(chrome, port, slug, campos, alto) {
  const html = await renderDom(chrome, `http://127.0.0.1:${port}/calculadoras/${slug}`, {
    waitMs: 2500, viewport: { width: 390, height: alto },
    until: "!!document.querySelector('[data-calc-directo] input')",
    interact: async (send, sessionId) => {
      const expresion = `(async () => {
        const espera = (ms) => new Promise((r) => setTimeout(r, ms));
        const poner = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        let ultimo;
        for (const [n, v] of ${JSON.stringify(campos)}) { ultimo = document.querySelector('[data-calc-directo] input[name="' + n + '"]'); poner.call(ultimo, v); ultimo.dispatchEvent(new Event('input', { bubbles: true })); }
        ultimo.focus({ preventScroll: true });
        await espera(700);
        const dentro = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.width > 0 && r.height > 0; };
        const barra = document.querySelector('.rc-flotante');
        const monto = document.querySelector('.rc-monto');
        document.body.dataset.montoAntes = String(dentro(monto));
        document.body.dataset.barra = String(dentro(barra));
        document.body.dataset.barraMonto = barra ? String(barra.innerText.includes(monto.innerText)) : 'sin-barra';
        if (barra) { barra.click(); await espera(900); }
        document.body.dataset.montoDespues = String(dentro(document.querySelector('.rc-monto')));
        document.body.dataset.barraDespues = String(!!document.querySelector('.rc-flotante'));
        document.body.dataset.fin = 'listo';
      })()`;
      await send('Runtime.evaluate', { expression: expresion, awaitPromise: true, returnByValue: true }, sessionId);
    },
  });
  return (n) => (html.match(new RegExp(`data-${n}="([^"]*)"`)) || [])[1];
}

test('Chrome: con el teclado abierto, la barra muestra el monto y al tocarla lleva al resultado (10 calculadoras)', async (t) => {
  if (!browserReady(t, chrome)) return;
  const server = await createServer({ root: process.cwd(), server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
  await server.listen();
  try {
    const port = server.httpServer.address().port;
    for (const [slug, campos] of Object.entries(CASOS)) {
      const dato = await revisar(chrome, port, slug, campos, 420);
      assert.equal(dato('fin'), 'listo', `${slug}: la prueba no terminó`);
      assert.equal(dato('monto-antes'), 'false', `${slug}: el caso debe empezar con el monto fuera de la vista`);
      assert.equal(dato('barra'), 'true', `${slug}: la barra debe verse completa`);
      assert.equal(dato('barra-monto'), 'true', `${slug}: la barra debe mostrar el mismo monto`);
      assert.equal(dato('monto-despues'), 'true', `${slug}: al tocarla, el monto queda a la vista`);
      assert.equal(dato('barra-despues'), 'false', `${slug}: con el monto a la vista, la barra desaparece`);
    }
  } finally { await server.close(); }
});

test('Chrome: si el monto ya se ve, no aparece la barra', async (t) => {
  if (!browserReady(t, chrome)) return;
  const server = await createServer({ root: process.cwd(), server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
  await server.listen();
  try {
    const dato = await revisar(chrome, server.httpServer.address().port, 'infonavit', CASOS.infonavit, 1600);
    assert.equal(dato('monto-antes'), 'true');
    assert.equal(dato('barra'), 'false');
    assert.equal(dato('barra-monto'), 'sin-barra');
  } finally { await server.close(); }
});
