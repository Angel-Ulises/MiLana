import test from 'node:test';
import assert from 'node:assert/strict';
import { navigateAndWait } from './helpers/chrome-page.mjs';

test('el navegador espera load antes de evaluar la condición del runtime', async () => {
  const calls = [];
  let releaseLoad;
  const loaded = new Promise((resolve) => { releaseLoad = resolve; });
  const send = async (method) => {
    calls.push(method);
    return method === 'Runtime.evaluate' ? { result: { value: true } } : {};
  };
  const waiting = navigateAndWait(send, 'page', 'http://localhost/fixture', {
    waitMs: 100, until: 'ready', waitForLoad: () => { calls.push('subscribe-load'); return loaded; },
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(calls, ['Page.enable', 'subscribe-load', 'Page.navigate']);
  releaseLoad();
  await waiting;
  assert.equal(calls.at(-1), 'Runtime.evaluate');
});

test('load ausente falla por timeout explícito', async () => {
  await assert.rejects(navigateAndWait(async () => ({}), 'page', 'http://localhost/fixture', {
    waitMs: 100, until: 'ready', loadTimeoutMs: 5, waitForLoad: () => new Promise(() => {}),
  }), /page load timeout/);
});

test('una condición incumplida falla en lugar de devolver DOM parcial', async () => {
  let time = 0;
  const send = async (method) => method === 'Runtime.evaluate' ? { result: { value: false } } : {};
  await assert.rejects(navigateAndWait(send, 'page', 'http://localhost/fixture', {
    waitMs: 100, until: 'ready', waitForLoad: async () => {},
    now: () => time, pause: async (ms) => { time += ms; },
  }), /condition not met within 100ms after page load/);
  assert.equal(time, 100);
});

test('la carga lenta no consume el presupuesto de la condición', async () => {
  let time = 0;
  const send = async (method) => method === 'Runtime.evaluate' ? { result: { value: time >= 5050 } } : {};
  await navigateAndWait(send, 'page', 'http://localhost/fixture', {
    waitMs: 100, until: 'ready', waitForLoad: async () => { time = 5000; },
    now: () => time, pause: async (ms) => { time += ms; },
  });
  assert.equal(time, 5050);
});
