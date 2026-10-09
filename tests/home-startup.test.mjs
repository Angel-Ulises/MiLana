import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { startHomeWhenReady } from '../src/lib/homeStartup.js';
import { prerenderHomeHero } from '../scripts/prerender-home.mjs';

function fixture() {
  const listeners = new Map();
  const children = [];
  const doc = { querySelector: () => null, createElement: tag => ({
    tag, dataset: {}, listeners: {}, setAttribute() {},
    addEventListener(name, handler) { this.listeners[name] = handler; },
    append(...items) { this.children = items; },
  }) };
  return { children, listeners, ownerDocument: doc,
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: name => listeners.delete(name),
    querySelector: selector => selector === '[data-startup-error]' ? children[0] : null,
    prepend: item => children.unshift(item),
  };
}

test('Inicio conserva su DOM mientras App está pendiente y sólo monta cuando está listo', async () => {
  const root = fixture();
  let resolve, mounted;
  const waiting = startHomeWhenReady({ root, load: () => new Promise(done => { resolve = done; }), mount: page => { mounted = page; } });
  await Promise.resolve();
  assert.equal(mounted, undefined);
  assert.equal(root.children.length, 0, 'No insertar pantalla de carga ni reemplazar contenido');
  const App = () => null;
  resolve({ default: App });
  assert.equal(await waiting, true);
  assert.equal(mounted, App);
  assert.equal(root.listeners.size, 0, 'No duplicar eventos con React');
});

test('App fallido conserva enlaces, informa y recarga una sola vez al pulsar Reintentar', async () => {
  const root = fixture();
  let reloads = 0, loads = 0;
  const run = () => startHomeWhenReady({ root, load: async () => { loads++; throw Error('offline'); }, mount: () => assert.fail('No montar un módulo fallido'), reload: () => { reloads++; } });
  assert.equal(await run(), false);
  assert.equal(loads, 1, 'No reintentos automáticos en bucle');
  assert.equal(root.children.length, 1);
  const [text, button] = root.children[0].children;
  assert.match(text.textContent, /seguir usando los enlaces/);
  assert.equal(button.textContent, 'Reintentar');
  assert.equal(reloads, 0);
  button.listeners.click();
  assert.equal(reloads, 1);
  await run();
  assert.equal(root.children.length, 1, 'No duplicar el aviso');
});

test('El hero estático sale de App y contiene título, las tres rutas y el desplegable nativo', async () => {
  const html = await prerenderHomeHero();
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /Entiende tu/);
  for (const href of ['/calculadoras/liquidacion', '/finanzas/ahorro', '/carreras']) assert.ok(html.includes(`href="${href}"`));
  assert.match(html, /<details class="orb-home-extra">/);
  assert.match(html, /<summary>Ver otras 3 situaciones/);
  assert.doesNotMatch(html, /Cargando contenido|<script/);
});

test('Inicio visible desde HTML y arranque condicionado sin cargar todas las páginas', () => {
  const html = readFileSync('index.html', 'utf8');
  const main = readFileSync('src/main.jsx', 'utf8');
  const pre = readFileSync('scripts/prerender-home.mjs', 'utf8');
  assert.match(html, /html\.js #root>main\[data-startup-home\]\{visibility:visible\}/);
  assert.match(main, /location\.pathname === '\/' && root\.querySelector\('\[data-startup-home\]'\)/);
  assert.match(main, /startHomeWhenReady\(\{ root, load: \(\) => import\('\.\/App\.jsx'\), mount \}\)/);
  assert.match(pre, /manifest\['src\/App\.jsx'\]/);
  assert.doesNotMatch(pre, /Promise\.all.*manifest|localStorage|sessionStorage/);
});

test('Al montar React conserva el desplegable y el foco usados durante la descarga', async () => {
  const root = fixture();
  const initial = { open: true };
  const live = { open: false };
  let current = initial, focused = false;
  root.querySelector = selector => selector === '.orb-home-extra' ? current : selector === '.orb-home-extra summary' ? { focus: () => { focused = true; } } : null;
  root.ownerDocument.activeElement = { closest: selector => selector === '.orb-home-extra' };
  await startHomeWhenReady({ root, load: async () => ({ default: () => null }), mount: (_page, ready) => { current = live; ready(); } });
  assert.equal(live.open, true);
  assert.equal(focused, true);
});
