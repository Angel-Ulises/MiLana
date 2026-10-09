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
    output = mkdtempSync(join(tmpdir(), 'milana-decision-'));
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
async function runSite(t, run, beforeNavigate) {
  if (!browserReady(t, chrome)) return;
  const { origin } = await site();
  await renderDom(chrome, origin + '/finanzas', {
    viewport: { width: 390, height: 844 }, timeoutMs: 80000, waitMs: 9000,
    until: "document.querySelectorAll('.ml-decision-need').length === 3", beforeNavigate,
    interact: (send, session) => run(browser(send, session), origin),
  });
}

test('Chrome 390: pregunta → presupuesto → traslado voluntario → retorno conserva la pregunta, no añade cifras', async t => {
  await runSite(t, async ({ evaluate, until, clickText, keyboard, setInput }) => {
    assert.equal(await evaluate("document.querySelectorAll('.ml-decision-choice').length"), 0);
    assert.equal(await evaluate("[...document.querySelectorAll('.ecosystem-shortcuts a')].every(el=>el.getBoundingClientRect().height>=40 && !el.closest('details'))"), true, 'Accesos directos siguen disponibles');
    assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth + 2'), false);
    await keyboard('.ml-decision-need', 'Enter', 'Enter', 13);
    await until("!!document.querySelector('.ml-decision-primary')");
    assert.equal(await evaluate('document.activeElement.tagName'), 'H3');
    assert.equal(await evaluate("document.querySelectorAll('.ml-decision-need').length"), 0);
    assert.equal(await evaluate("document.querySelector('.ml-decision-explanation').open"), false);
    await keyboard('.ml-decision-explanation summary', ' ', 'Space', 32);
    assert.equal(await evaluate("document.querySelector('.ml-decision-explanation').open"), true);
    await keyboard('.ml-decision-explanation summary', 'Enter', 'Enter', 13);
    assert.equal(await evaluate("document.querySelector('.ml-decision-explanation').open"), false);
    assert.equal(await evaluate("document.querySelector('.ml-decision-disclaimer').closest('details')"), null);
    await keyboard('.ml-decision-primary', 'Enter', 'Enter', 13);
    await until("location.pathname === '/finanzas/presupuesto' && !!document.querySelector('.finance-form-card') && !!document.querySelector('.ml-journey')");
    assert.equal(await evaluate("document.querySelector('.ml-journey').querySelectorAll('a').length"), 1, 'No compite con pasos del resultado');
    for (const [index, value] of ['15000', '7000', '3000', '1000'].entries()) await setInput(index, value);
    await clickText('.ml-finance-continuations button', 'Mi situación');
    await until("location.pathname === '/finanzas/mi-situacion' && !!document.querySelector('.ml-finance-context-notice') && !!document.querySelector('.ml-journey')");
    assert.equal(await evaluate("document.querySelector('.ml-journey').textContent.includes('No sé cuánto me queda')"), true);
    assert.equal(await evaluate("document.querySelector('.advisor-field input').value"), '15000', 'Traslado existente intacto');
    assert.equal(await evaluate("sessionStorage.getItem('ml-guide-journey-v1').includes('15000')"), false);
    await clickText('.ml-journey a', 'Volver');
    await until("location.pathname === '/finanzas' && !!document.querySelector('.ml-decision-primary')");
    assert.equal(await evaluate("document.querySelector('.ml-decision-answer h3').textContent"), 'No sé cuánto me queda');
    assert.equal(await evaluate("(() => { const r=document.querySelector('.ml-decision-answer h3').getBoundingClientRect(); return r.top>=0 && r.bottom<=innerHeight; })()"), true, 'Regreso muestra la pregunta, no sólo la URL con ancla');
    assert.equal(await evaluate("document.querySelector('.ml-journey')"), null);
    await clickText('.ml-decision-back', 'pregunta');
    await clickText('.ml-decision-need', 'deudas');
    await keyboard('.ml-decision-primary', 'Enter', 'Enter', 13);
    await until("location.pathname === '/finanzas/deuda-y-credito' && !!document.querySelector('.ml-journey')");
    assert.equal(await evaluate("document.querySelector('.ml-journey').textContent.includes('Mis deudas me preocupan')"), true);
    await evaluate('history.back()');
    await until("location.pathname === '/finanzas' && !!document.querySelector('.ml-decision-primary')");
    assert.equal(await evaluate("document.querySelector('.ml-decision-answer h3').textContent"), 'Mis deudas me preocupan');
    await clickText('.ml-decision-back', 'pregunta');
    await evaluate('history.forward()');
    await until("location.pathname === '/finanzas/deuda-y-credito' && !!document.querySelector('.finance-form-card')");
    await pause();
    assert.equal(await evaluate("document.querySelector('.ml-journey')"), null, 'Adelante no resucita intención descartada');
  });
});

test('Chrome 390: otro tema vuelve al hub de origen; una ruta ajena o acceso directo no inventa un recorrido', async t => {
  await runSite(t, async ({ evaluate, until, clickText, navigate }, origin) => {
    await clickText('.ml-decision-back', 'tema');
    assert.equal(await evaluate("document.querySelectorAll('.ml-decision-choice').length"), 4);
    await clickText('.ml-decision-choice', 'carrera');
    await clickText('.ml-decision-need', 'dos carreras');
    await clickText('.ml-decision-primary', 'Comparar');
    await until("location.pathname === '/carreras/comparar' && !!document.querySelector('.ml-journey')");
    assert.equal(await evaluate("document.querySelector('.ml-journey a').getAttribute('href')"), '/finanzas#explorar');
    await clickText('.ml-journey a', 'Volver');
    await until("location.pathname === '/finanzas' && !!document.querySelector('.ml-decision-primary')");
    assert.equal(await evaluate("document.querySelector('.ml-decision-answer h3').textContent"), 'Estoy entre dos carreras');
    await navigate(origin + '/carreras', '.ml-decision-needs');
    assert.equal(await evaluate("document.querySelectorAll('.ml-decision-need').length"), 3, 'Entrar a otro hub no cambia su punto de partida');
    await navigate(origin + '/finanzas/ahorro', '.finance-form-card');
    assert.equal(await evaluate("document.querySelector('.ml-journey')"), null, 'Ruta fuera de esta pregunta');
    await evaluate("sessionStorage.removeItem('ml-guide-journey-v1')");
    await navigate(origin + '/carreras/comparar', '.cc-selectors');
    assert.equal(await evaluate("document.querySelector('.ml-journey')"), null, 'Un enlace compartido no lleva una pregunta ajena');
    await navigate(origin + '/finanzas#explorar', '.ml-decision-needs');
    await until("(() => { const r=document.querySelector('.ml-decision h3').getBoundingClientRect(); return r.top>=0 && r.bottom<=innerHeight; })()");
  });
});

test('Chrome 390: con almacenamiento bloqueado se puede elegir, abrir ayuda y navegar', async t => {
  await runSite(t, async ({ evaluate, until, clickText }) => {
    await clickText('.ml-decision-need', 'preparado');
    await clickText('.ml-decision-explanation summary', 'empezar');
    assert.equal(await evaluate("document.querySelector('.ml-decision-explanation').open"), true);
    await clickText('.ml-decision-primary', 'emergencia');
    await until("location.pathname === '/finanzas/fondo-emergencia' && !!document.querySelector('.finance-form-card')");
    assert.equal(await evaluate("document.querySelector('.ml-journey')"), null);
    assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth + 2'), false);
  }, (send, session) => send('Page.addScriptToEvaluateOnNewDocument', { source: `Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('blocked','SecurityError')}});` }, session));
});
