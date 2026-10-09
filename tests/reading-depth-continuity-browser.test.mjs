import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome = [process.env.MILANA_CHROME, '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(existsSync);
const article = JSON.parse(readFileSync('src/data/economia.json', 'utf8')).articulos[0].slug;
const routes = [
  ['/finanzas/fondo-emergencia', '.ml-result-meaning'],
  ['/carreras/mejor-pagadas', '.career-meaning'],
  ['/economia/' + article, '.economy-context-extra'],
  ['/carreras/comparar', '.cc-card-more'],
  ['/estados/comparar', '.sc-more-dimensions'],
];
const pause = () => new Promise(resolve => setTimeout(resolve, 50));
function browser(send, session) {
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, session);
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const until = async expression => {
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline) {
      try { if (await evaluate(expression)) return; } catch (error) {
        if (!/context|navigat/i.test(error.message)) throw error;
      }
      await pause();
    }
    assert.fail('Chrome did not reach: ' + expression);
  };
  const navigate = async (url, selector) => {
    if (await evaluate(`location.href === ${JSON.stringify(url)} && !!document.querySelector(${JSON.stringify(selector)})`)) return;
    await send('Page.navigate', { url }, session);
    await until(`location.href === ${JSON.stringify(url)} && document.querySelector(${JSON.stringify(selector)}) !== null`);
  };
  const keyboard = async (selector, key, code, virtualKey) => {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
    assert.equal(await evaluate(`document.querySelector(${JSON.stringify(selector)}) === document.activeElement`), true, 'El control recibe el foco');
    const text = key === 'Enter' ? '\r' : key;
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: virtualKey, text, unmodifiedText: text }, session);
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: virtualKey }, session);
    await pause();
  };
  return { evaluate, until, navigate, keyboard };
}

async function withSite(t, run, beforeNavigate) {
  if (!browserReady(t, chrome)) return;
  const server = await createServer({ server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
  await server.listen();
  const origin = 'http://127.0.0.1:' + server.httpServer.address().port;
  try {
    await renderDom(chrome, origin + '/invertir', {
      viewport: { width: 390, height: 844 }, waitMs: 8000, timeoutMs: 65000,
      until: "document.querySelectorAll('.ml-inv-level button').length === 3", beforeNavigate,
      interact: (send, session) => run(browser(send, session), origin),
    });
  } finally { await server.close(); }
}

test('Chrome 390px: profundidad continúa de Invertir a Finanzas, Carreras, Economía y comparadores', async t => {
  await withSite(t, async ({ evaluate, until, navigate, keyboard }, origin) => {
    await evaluate("document.querySelectorAll('.ml-inv-level button')[2].click()");
    await until("document.querySelectorAll('.ml-inv-level button')[2].getAttribute('aria-pressed') === 'true'");
    assert.equal(await evaluate("sessionStorage.getItem('ml-lectura-v1')"), 'experto');
    // Navigate through the real finance hub in the same tab.
    await navigate(origin + '/finanzas', '.ecosystem-shortcuts');
    await evaluate("document.querySelector('a[href=\"/finanzas/fondo-emergencia\"]').click()");
    await until("location.pathname === '/finanzas/fondo-emergencia' && !!document.querySelector('.ml-result-meaning')");
    for (const [route, selector] of routes) {
      await navigate(origin + route, selector);
      assert.equal(await evaluate(`[...document.querySelectorAll(${JSON.stringify(selector)})].every(el => el.open)`), true, route + ' olvidó el nivel experto');
      assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth + 2'), false, route + ' overflow');
    }
    await evaluate('history.back()');
    await until("location.pathname === '/carreras/comparar' && !!document.querySelector('.cc-card-more')");
    assert.equal(await evaluate("document.querySelector('.cc-card-more').open"), true);

    await navigate(origin + routes[0][0], routes[0][1]);
    await keyboard('.ml-result-meaning summary', 'Enter', 'Enter', 13);
    assert.equal(await evaluate("document.querySelector('.ml-result-meaning').open"), false, 'Enter debe cerrar');
    await evaluate(`{ const input=document.querySelector('.finance-form-card input');
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'8000');
      input.dispatchEvent(new Event('input',{bubbles:true})); }`);
    await pause();
    assert.equal(await evaluate("document.querySelector('.ml-result-meaning').open"), false, 'Recalcular no debe reabrir');
    for (const expected of [true, false, true]) {
      await keyboard('.ml-result-meaning summary', ' ', 'Space', 32);
      assert.equal(await evaluate("document.querySelector('.ml-result-meaning').open"), expected, 'Space debe alternar');
    }
    assert.equal(await evaluate("sessionStorage.getItem('ml-lectura-v1')"), 'experto', 'Cerrar un bloque no cambia la preferencia global');
    assert.equal(await evaluate("document.querySelector('.finance-next-box').closest('details') === null"), true, 'Advertencia siempre visible');

    await navigate(origin + '/invertir', '.ml-inv-level button');
    assert.equal(await evaluate("document.querySelectorAll('.ml-inv-level button')[2].getAttribute('aria-pressed')"), 'true');
    await evaluate("document.querySelectorAll('.ml-inv-level button')[1].click()");
    await until("sessionStorage.getItem('ml-lectura-v1') === 'medio'");
    for (const [route, selector] of routes) {
      await navigate(origin + route, selector);
      assert.equal(await evaluate(`[...document.querySelectorAll(${JSON.stringify(selector)})].every(el => !el.open)`), true, route + ' debe respetar lectura compacta');
    }
  });
});

test('Chrome: cambios en la misma página respetan aperturas manuales al cambiar el instrumento', async t => {
  await withSite(t, async ({ evaluate, until, keyboard }) => {
    const block = '.ml-inv-explainer > .ml-inv-more';
    await evaluate("document.querySelectorAll('.ml-inv-level button')[2].click()");
    await until(`document.querySelector(${JSON.stringify(block)}).open`);
    await keyboard(block + ' > summary', 'Enter', 'Enter', 13);
    assert.equal(await evaluate(`document.querySelector(${JSON.stringify(block)}).open`), false);
    await evaluate("document.querySelectorAll('.ml-inv-level button')[0].click()");
    await pause();
    await evaluate("document.querySelectorAll('.ml-inv-level button')[2].click()");
    await pause();
    assert.equal(await evaluate(`document.querySelector(${JSON.stringify(block)}).open`), false, 'La elección manual tiene prioridad');
    await evaluate("document.querySelectorAll('.ml-inv-instruments button')[1].click()");
    await pause();
    assert.equal(await evaluate(`document.querySelector(${JSON.stringify(block)}).open`), false, 'Cambiar instrumento no reabre');
    assert.equal(await evaluate("document.querySelector('.ml-inv-warning').closest('details') === null"), true);
    assert.equal(await evaluate("document.querySelector('.ml-inv-assumptions').open"), false, 'La preferencia no debe desplegar campos del formulario');
    assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth + 2'), false);
  });
});

test('Chrome: almacenamiento bloqueado conserva control por teclado y avisa el límite', async t => {
  await withSite(t, async ({ evaluate, until, keyboard, navigate }, origin) => {
    await evaluate("document.querySelectorAll('.ml-inv-level button')[2].click()");
    await until("document.querySelector('.ml-inv-explainer > .ml-inv-more').open");
    assert.match(await evaluate("document.querySelector('.ml-inv-level p').textContent"), /no permite recordarlo/);
    await keyboard('.ml-inv-explainer > .ml-inv-more > summary', ' ', 'Space', 32);
    assert.equal(await evaluate("document.querySelector('.ml-inv-explainer > .ml-inv-more').open"), false);
    await navigate(origin + '/finanzas/fondo-emergencia', '.ml-result-meaning');
    assert.equal(await evaluate("document.querySelector('.ml-result-meaning').open"), false, 'Sin almacenamiento, el documento nuevo empieza compacto');
    await keyboard('.ml-result-meaning summary', 'Enter', 'Enter', 13);
    assert.equal(await evaluate("document.querySelector('.ml-result-meaning').open"), true);
  }, (send, session) => send('Page.addScriptToEvaluateOnNewDocument', { source:
    "Object.defineProperty(window, 'sessionStorage', { configurable: true, get() { throw new DOMException('Blocked by test', 'SecurityError'); } });"
  }, session));
});

test('Chrome: Atrás y Adelante actualizan el nivel elegido en otra página de la misma pestaña', async t => {
  await withSite(t, async ({ evaluate, until, navigate }, origin) => {
    assert.equal(await evaluate("document.querySelectorAll('.ml-inv-level button')[0].getAttribute('aria-pressed')"), 'true');
    await navigate(origin + '/finanzas/inversion/comparar', '.instrument-depth button');
    await evaluate("document.querySelectorAll('.instrument-depth button')[1].click()");
    await until("sessionStorage.getItem('ml-lectura-v1') === 'experto'");
    await evaluate('history.back()');
    await until("location.pathname === '/invertir' && document.querySelectorAll('.ml-inv-level button')[2]?.getAttribute('aria-pressed') === 'true' && document.querySelector('.ml-inv-explainer > .ml-inv-more')?.open === true");
    assert.equal(await evaluate("document.querySelector('.ml-inv-explainer > .ml-inv-more').open"), true);
    await evaluate("document.querySelectorAll('.ml-inv-level button')[0].click()");
    await until("sessionStorage.getItem('ml-lectura-v1') === 'inicio'");
    await evaluate('history.forward()');
    await until("location.pathname === '/finanzas/inversion/comparar' && document.querySelectorAll('.instrument-depth button')[0]?.getAttribute('aria-pressed') === 'true'");
    assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth + 2'), false);
  });
});

test('Chrome: la elección manual sobrevive a desmontajes reales por datos vacíos y comparación inválida', async t => {
  await withSite(t, async ({ evaluate, until, navigate }, origin) => {
    const setInput = async (selector, value) => {
      await evaluate(`{ const input=document.querySelector(${JSON.stringify(selector)});
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(value)});
        input.dispatchEvent(new Event('input',{bubbles:true})); }`);
      await pause();
    };
    const chooseManual = async (selector, expected) => {
      await evaluate(`window.oldReadingBlock=document.querySelector(${JSON.stringify(selector)}); oldReadingBlock.querySelector('summary').click()`);
      await pause();
      assert.equal(await evaluate('oldReadingBlock.open'), expected);
    };
    // Both directions: close the expert default, or open the compact default.
    for (const [levelIndex, expected] of [[2, false], [0, true]]) {
      await navigate(origin + '/invertir', '.ml-inv-level button');
      await evaluate(`document.querySelectorAll('.ml-inv-level button')[${levelIndex}].click()`);
      await until(`document.querySelectorAll('.ml-inv-level button')[${levelIndex}].getAttribute('aria-pressed') === 'true'`);
      const projection = '.ml-inv-outcome .ml-inv-more';
      await chooseManual(projection, expected);
      await setInput('.ml-inv-form input', '');
      await until("!!document.querySelector('.ml-inv-outcome [role=alert]')");
      assert.equal(await evaluate('oldReadingBlock.isConnected'), false, 'El test debe desmontar realmente el resultado');
      await setInput('.ml-inv-form input', '10000');
      await until(`!!document.querySelector(${JSON.stringify(projection)})`);
      assert.equal(await evaluate(`document.querySelector(${JSON.stringify(projection)}).open`), expected, 'Simulador restaura la decisión');

      await navigate(origin + '/finanzas/deuda-y-credito', '.finance-form-card input');
      await setInput('.finance-form-card input', '24000');
      await until("!!document.querySelector('.ml-result-meaning')");
      await chooseManual('.ml-result-meaning', expected);
      await setInput('.finance-form-card input', '');
      await until("!!document.querySelector('.ml-result-critical') && !document.querySelector('.ml-result-meaning')");
      assert.equal(await evaluate('oldReadingBlock.isConnected'), false);
      await setInput('.finance-form-card input', '24000');
      await until("!!document.querySelector('.ml-result-meaning')");
      assert.equal(await evaluate("document.querySelector('.ml-result-meaning').open"), expected, 'Finanzas restaura la decisión');

      for (const [route, block, select, warning] of [
        ['/carreras/comparar', '.cc-card-more', '.cc-selectors select', '.cc-same'],
        ['/estados/comparar', '.sc-more-dimensions', '.sc-selectors select', '.sc-same'],
      ]) {
        await navigate(origin + route, block);
        await chooseManual(block, expected);
        await evaluate(`{ const selects=[...document.querySelectorAll(${JSON.stringify(select)})];
          window.previousComparison=selects[1].value;
          selects[1].value=selects[0].value;selects[1].dispatchEvent(new Event('change',{bubbles:true})); }`);
        await until(`!!document.querySelector(${JSON.stringify(warning)})`);
        assert.equal(await evaluate('oldReadingBlock.isConnected'), false, route + ' debe desmontar la comparación');
        await evaluate(`{ const select=document.querySelectorAll(${JSON.stringify(select)})[1];
          select.value=previousComparison;select.dispatchEvent(new Event('change',{bubbles:true})); }`);
        await until(`!!document.querySelector(${JSON.stringify(block)})`);
        assert.equal(await evaluate(`document.querySelector(${JSON.stringify(block)}).open`), expected, route + ' restaura la elección manual');
        assert.equal(await evaluate(`document.querySelectorAll(${JSON.stringify(block)})[1].open`), !expected, route + ' no cambia el otro bloque');
        assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth + 2'), false);
      }
    }
  });
});
