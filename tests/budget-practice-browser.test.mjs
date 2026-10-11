import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build, preview } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome = [process.env.MILANA_CHROME, '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(existsSync);
const pause = () => new Promise(resolve => setTimeout(resolve, 60));
let sitePromise, output;
async function site() {
  if (!sitePromise) sitePromise = (async () => {
    output = mkdtempSync(join(tmpdir(), 'milana-budget-practice-'));
    await build({ logLevel: 'silent', build: { outDir: output, emptyOutDir: true } });
    const server = await preview({ logLevel: 'silent', build: { outDir: output }, preview: { host: '127.0.0.1', port: 0 } });
    return { server, origin: 'http://127.0.0.1:' + server.httpServer.address().port };
  })();
  return sitePromise;
}
after(async () => {
  const current = await sitePromise?.catch(() => null);
  if (current) await new Promise(resolve => current.server.httpServer.close(resolve));
  if (output) rmSync(output, { recursive: true, force: true });
});
function browser(send, session) {
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, session);
    if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const until = async expression => {
    const end = Date.now() + 9000;
    do {
      try { if (await evaluate(expression)) return; } catch (e) { if (!/context|navigat/i.test(e.message)) throw e; }
      await pause();
    } while (Date.now() < end);
    assert.fail('Chrome did not reach: ' + expression);
  };
  const clickText = async (selector, text) => {
    await evaluate(`[...document.querySelectorAll(${JSON.stringify(selector)})].find(el=>el.textContent.includes(${JSON.stringify(text)})).click()`);
    await pause();
  };
  const keyboard = async (selector, key, code, keyCode) => {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
    const text = key === 'Enter' ? '\r' : key;
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode, text, unmodifiedText: text }, session);
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode }, session);
    await pause();
  };
  const navigate = async (url, selector) => {
    await send('Page.navigate', { url }, session);
    await until(`location.href === ${JSON.stringify(url)} && !!document.querySelector(${JSON.stringify(selector)})`);
  };
  const setInput = async (index, value) => {
    await evaluate(`(() => { const input = document.querySelectorAll('.finance-form-card input')[${index}];
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(value)});
      input.dispatchEvent(new Event('input',{bubbles:true})); })()`);
    await pause();
  };
  return { evaluate, until, clickText, keyboard, navigate, setInput };
}
async function runPractice(t, width, run, beforeNavigate) {
  if (!browserReady(t, chrome)) return;
  const { origin } = await site();
  await renderDom(chrome, origin + '/finanzas', {
    viewport: { width, height: 900 }, timeoutMs: 90000, waitMs: 9000,
    until: "document.querySelectorAll('.ml-decision-need').length === 3", beforeNavigate,
    interact: (send, session) => run(browser(send, session), origin),
  });
}
const atStep = step => `document.querySelector('.ml-practice-label')?.textContent.includes('Paso ${step} de 3')`;
const focusVisible = `(() => { const el=document.activeElement; const r=el.getBoundingClientRect(); const header=Math.max(0,...[...document.querySelectorAll('.site-header,.ml-orbita-shell')].filter(node=>node.getClientRects().length&&getComputedStyle(node).visibility!=='hidden').map(node=>node.getBoundingClientRect().bottom)); return r.top>header && r.bottom<innerHeight; })()`;
const fields = "[...document.querySelectorAll('.finance-form-card input')].map(el=>el.value)";

for (const width of [320, 390, 1440]) test(`Chrome ${width}: práctica voluntaria, teclado, saldos y datos reales aislados`, async t => {
  await runPractice(t, width, async ({ evaluate, until, keyboard, clickText, setInput }) => {
    assert.equal(await evaluate("!!document.querySelector('.ml-budget-practice')"), false);
    assert.equal(await evaluate("document.querySelectorAll('.ml-decision-need').length"), 3);
    await keyboard('.ml-practice-entry', 'Enter', 'Enter', 13);
    await until(atStep(1));
    assert.equal(await evaluate("document.activeElement === document.querySelector('.ml-budget-practice h3')"), true);
    assert.equal(await evaluate("document.querySelector('.ml-budget-practice').textContent.includes('Ejemplo hipotético')"), true);
    assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth + 2'), false);
    await keyboard('.ml-practice-primary', ' ', 'Space', 32);
    await until(atStep(2));
    assert.equal(await evaluate("document.querySelector('.ml-practice-ledger').textContent.includes('Pagos de deuda')"), true);
    await keyboard('.ml-practice-primary', 'Enter', 'Enter', 13);
    await until(atStep(3));
    assert.equal(await evaluate("document.querySelector('.ml-practice-balance strong').textContent"), '$2,000');
    assert.equal(await evaluate("document.querySelector('.ml-practice-meaning').open"), false);
    await keyboard('.ml-practice-meaning summary', ' ', 'Space', 32);
    assert.equal(await evaluate("document.querySelector('.ml-practice-meaning').open"), true);
    await keyboard('.ml-practice-meaning summary', 'Enter', 'Enter', 13);
    for (let count = 1; count <= 6; count++) {
      await clickText('.ml-practice-experiment-actions button', 'Sumar');
      assert.equal(await evaluate("document.querySelector('.ml-practice-balance strong').textContent"), new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(Math.abs(2000-count*500)));
      if (count === 4) assert.match(await evaluate("document.querySelector('.ml-practice-balance').textContent"), /Quedan justos/);
      if (count === 5) assert.match(await evaluate("document.querySelector('.ml-practice-balance').textContent"), /Faltan/);
    }
    assert.equal(await evaluate("document.querySelector('.ml-practice-experiment-actions button').disabled"), true);
    assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth + 2'), false);
    await clickText('.ml-practice-experiment-actions button', 'Quitar');
    assert.equal(await evaluate("document.querySelector('.ml-practice-balance strong').textContent"), '$2,000');
    assert.equal(await evaluate("document.querySelectorAll('.ml-practice-experiment-actions button')[1].disabled"), true);
    for (let count=0;count<6;count++) await clickText('.ml-practice-experiment-actions button', 'Sumar');
    await clickText('.ml-practice-previous', 'anterior');
    await until(atStep(2));
    assert.match(await evaluate("document.querySelector('.ml-practice-ledger').textContent"), /Gasto extra/);
    assert.equal(await evaluate("document.querySelector('.ml-practice-total dd').textContent"), '$11,000');
    await clickText('.ml-practice-topline button', 'Reiniciar');
    await until(atStep(1));
    await clickText('.ml-practice-topline button', 'Volver');
    await until("!!document.querySelector('.ml-practice-entry')");
    assert.equal(await evaluate("document.activeElement === document.querySelector('.ml-practice-entry')"), true);
    assert.equal(await evaluate(focusVisible), true, 'El disparador enfocado queda visible');
    await keyboard('.ml-practice-entry', 'Enter', 'Enter', 13);
    await clickText('.ml-practice-primary', 'se va');
    await clickText('.ml-practice-primary', 'queda');
    assert.equal(await evaluate("document.querySelector('.ml-practice-balance strong').textContent"), '$2,000');
    assert.equal(await evaluate("sessionStorage.getItem('ml-finance-context-once-v1')"), null);
    assert.equal(await evaluate("sessionStorage.getItem('ml-net-income-handoff-v1')"), null);
    await clickText('.ml-practice-primary', 'propios');
    await until("location.pathname === '/finanzas/presupuesto' && !!document.querySelector('.finance-form-card') && !!document.querySelector('.ml-journey')");
    assert.deepEqual(await evaluate(fields), ['', '', '', '']);
    assert.match(await evaluate("document.querySelector('.ml-journey').textContent"), /No sé cuánto me queda/);
    for (const [index, value] of ['23000', '13000', '2500', '1000'].entries()) await setInput(index, value);
    await clickText('.ml-practice-entry', 'ejemplo');
    await until(atStep(1));
    await clickText('.ml-practice-primary', 'se va');
    await clickText('.ml-practice-primary', 'queda');
    await clickText('.ml-practice-experiment-actions button', 'Sumar');
    assert.deepEqual(await evaluate(fields), ['23000', '13000', '2500', '1000']);
    await clickText('.ml-practice-primary', 'propios');
    await until("!document.querySelector('.ml-budget-practice')");
    assert.deepEqual(await evaluate(fields), ['23000', '13000', '2500', '1000']);
    assert.equal(await evaluate("document.activeElement === document.querySelector('.finance-form-card input')"), true);
    assert.equal(await evaluate(focusVisible), true, 'El campo enfocado queda visible');
    await evaluate('history.back()');
    await until("location.pathname === '/finanzas' && !!document.querySelector('.ml-decision-primary')");
    assert.equal(await evaluate("!!document.querySelector('.ml-budget-practice')"), false);
    await clickText('.ml-decision-back', 'pregunta');
    await clickText('.ml-decision-need', 'deudas');
    assert.equal(await evaluate("!!document.querySelector('.ml-practice-entry')"), false);
  });
});

test('Chrome: experto no abre práctica; respeta ambos traslados reales pendientes', async t => {
  await runPractice(t, 390, async ({ evaluate, until, clickText, navigate }, origin) => {
    await evaluate(`sessionStorage.setItem('ml-lectura-v1','experto');
      sessionStorage.setItem('ml-finance-context-once-v1',JSON.stringify({origen:'/finanzas/fondo-emergencia',destino:'/finanzas/presupuesto',valores:{gastosEsenciales:'7250'},creado:Date.now()}));
      sessionStorage.setItem('ml-net-income-handoff-v1',JSON.stringify({importe:18200,destino:'/finanzas/presupuesto',fuente:'bruto-neto',creado:Date.now()}));`);
    await clickText('.ml-decision-need', 'No sé');
    await clickText('.ml-practice-entry', 'ejemplo');
    await clickText('.ml-practice-topline button', 'Volver');
    assert.equal(await evaluate("document.querySelector('.ml-decision-answer h3').textContent"), 'No sé cuánto me queda');
    await clickText('.ml-practice-entry', 'ejemplo');
    await clickText('.ml-practice-primary', 'se va');
    await clickText('.ml-practice-primary', 'queda');
    await clickText('.ml-practice-primary', 'propios');
    await until("location.pathname === '/finanzas/presupuesto' && !!document.querySelector('.finance-form-card')");
    await until("document.querySelector('.finance-form-card input').value === '18200'");
    assert.deepEqual(await evaluate(fields), ['18200','7250','','']);
    assert.equal(await evaluate("!!document.querySelector('.ml-budget-practice')"), false);
    await clickText('.ml-practice-entry', 'ejemplo');
    await until(atStep(1));
    await clickText('.ml-practice-primary', 'se va');
    await clickText('.ml-practice-topline button', 'Reiniciar');
    await clickText('.ml-practice-topline button', 'Cerrar');
    assert.deepEqual(await evaluate(fields), ['18200','7250','','']);
    assert.equal(await evaluate("document.activeElement === document.querySelector('.ml-practice-entry')"), true);
    assert.equal(await evaluate(focusVisible), true, 'El disparador enfocado queda visible');
    assert.equal(await evaluate('location.search'), '');
  });
});

test('Chrome: almacenamiento bloqueado no impide aprender ni abrir presupuesto', async t => {
  await runPractice(t, 390, async ({ evaluate, until, clickText }) => {
    await clickText('.ml-practice-entry', 'ejemplo');
    await clickText('.ml-practice-primary', 'se va');
    await clickText('.ml-practice-primary', 'queda');
    await clickText('.ml-practice-experiment-actions button', 'Sumar');
    assert.equal(await evaluate("document.querySelector('.ml-practice-balance strong').textContent"), '$1,500');
    await clickText('.ml-practice-primary', 'propios');
    await until("location.pathname === '/finanzas/presupuesto' && !!document.querySelector('.finance-form-card')");
    assert.deepEqual(await evaluate(fields), ['','','','']);
    assert.equal(await evaluate("!!document.querySelector('.ml-journey')"), false);
  }, (send, session) => send('Page.addScriptToEvaluateOnNewDocument', { source: `for (const key of ['sessionStorage','localStorage']) Object.defineProperty(window,key,{get(){throw new DOMException('blocked','SecurityError')}});` }, session));
});
