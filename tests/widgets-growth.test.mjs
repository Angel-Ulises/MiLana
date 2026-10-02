import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const page = readFileSync('public/widgets/index.html', 'utf8');
const embed = readFileSync('public/embed-mode-2026.js', 'utf8');
const index = readFileSync('index.html', 'utf8');

test('la página de widgets ofrece dos herramientas con atribución enlazada', () => {
  assert.match(page, /calculadoras\/aguinaldo\?embed=1/);
  assert.match(page, /calculadoras\/bruto-a-neto\?embed=1/);
  assert.doesNotMatch(page, /src=\"\/widgets\/calculadoras\//);
  assert.match(page, /Calculadora por/);
  assert.match(page, /https:\/\/www\.milanaaqui\.mx\/calculadoras\/aguinaldo/);
  assert.match(page, /https:\/\/www\.milanaaqui\.mx\/calculadoras\/bruto-a-neto/);
});

test('el modo embebible reutiliza la calculadora real y no duplica fórmulas', () => {
  assert.doesNotThrow(() => new Function(embed));
  assert.match(embed, /\.calculator-main/);
  assert.match(embed, /querySelector\('form'\)/);
  assert.match(embed, /Abrir completa/);
  assert.doesNotMatch(embed, /ISR_MENSUAL_2026|calcularAguinaldo|SALARIOS_MINIMOS_2026/);
});

test('el modo embebible acepta URL física de widget y conserva fallback ?embed=1', () => {
  assert.ok(embed.includes('^\\/widgets\\/calculadoras'));
  assert.ok(embed.includes("params.get('embed') === '1'"));
  assert.ok(embed.includes('const fullPath = `/calculadoras/${slug}`;'));
  assert.match(index, /\/embed-mode-2026\.js/);
});


test('el código publicado usa el fallback limpio que App ya reconoce', () => {
  assert.match(page, /src=&quot;https:\/\/www\.milanaaqui\.mx\/calculadoras\/aguinaldo\?embed=1&quot;/);
  assert.match(page, /src=&quot;https:\/\/www\.milanaaqui\.mx\/calculadoras\/bruto-a-neto\?embed=1&quot;/);
});

test('el iframe publicado renderiza el formulario real de la calculadora', async () => {
  globalThis.window = {
    location: { pathname: '/calculadoras/aguinaldo', search: '?embed=1', hash: '' },
    history: { pushState() {} },
    scrollTo() {}, addEventListener() {}, removeEventListener() {},
    requestAnimationFrame: (callback) => { callback(); return 1; },
    cancelAnimationFrame() {},
  };
  globalThis.document = { title: '' };
  const server = await createServer({ root: process.cwd(), server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
  try {
    const { default: App } = await server.ssrLoadModule('/src/App.jsx');
    const html = renderToString(React.createElement(App));
    assert.match(html, /class="[^"]*calculator-main/);
    assert.match(html, /<form/);
    assert.match(html, /Aguinaldo/i);
  } finally {
    await server.close();
    delete globalThis.window;
    delete globalThis.document;
  }
});

test('el runtime del fallback monta la barra Abrir completa junto al formulario', () => {
  const form = { tagName: 'FORM' };
  let brand = null;
  const main = {
    querySelector(selector) {
      if (selector === 'form') return form;
      if (selector === '.ml-embed-brand') return brand;
      return null;
    },
    insertBefore(node, before) { assert.equal(before, form); brand = node; },
  };
  const classNames = new Set();
  const document = {
    readyState: 'complete',
    documentElement: { classList: { add: (name) => classNames.add(name) } },
    head: { appendChild() {} },
    createElement: () => ({ className: '', innerHTML: '', textContent: '' }),
    querySelector: (selector) => selector === '.calculator-main' ? main : null,
    addEventListener() {},
  };
  class MutationObserver { constructor(callback) { this.callback = callback; } observe() { this.callback(); } }
  const location = { pathname: '/calculadoras/aguinaldo', search: '?embed=1', origin: 'https://www.milanaaqui.mx' };
  vm.runInNewContext(embed, { URLSearchParams, location, document, MutationObserver, requestAnimationFrame: (cb) => cb(), window: {} });
  assert.ok(classNames.has('milana-embed'));
  assert.ok(brand, 'la barra debe montarse junto al formulario');
  assert.match(brand.innerHTML, /Abrir completa/);
  assert.match(brand.innerHTML, /https:\/\/www\.milanaaqui\.mx\/calculadoras\/aguinaldo/);
});
