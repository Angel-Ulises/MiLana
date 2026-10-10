import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { STATE_PREFERENCE_KEY, STATE_SLUGS, borrarEstadoGuardado, estadoPermitido, guardarEstado, leerEstadoGuardado } from '../src/lib/statePreference.js';

const catalogo = JSON.parse(readFileSync('src/data/estados.json','utf8'));

function storageFalso() {
  const mapa = new Map();
  return {
    getItem: (k) => mapa.has(k) ? mapa.get(k) : null,
    setItem: (k,v) => mapa.set(k,String(v)),
    removeItem: (k) => mapa.delete(k),
    mapa,
  };
}

test('allowlist coincide exactamente con las 32 entidades del catálogo', () => {
  assert.equal(STATE_SLUGS.length, 32);
  assert.deepEqual(new Set(STATE_SLUGS), new Set(catalogo.estados.map((e) => e.slug)));
  assert.equal(estadoPermitido('jalisco'), true);
  assert.equal(estadoPermitido('nuevo-leon'), true);
  assert.equal(estadoPermitido('mi-casa'), false);
  assert.equal(estadoPermitido('../nuevo-leon'), false);
});

test('preferencia es opt-in, local y se puede borrar', () => {
  const storage = storageFalso();
  assert.equal(leerEstadoGuardado(storage), '');
  assert.equal(guardarEstado('puebla', storage), true);
  assert.equal(storage.mapa.get(STATE_PREFERENCE_KEY), 'puebla');
  assert.equal(leerEstadoGuardado(storage), 'puebla');
  assert.equal(borrarEstadoGuardado(storage), true);
  assert.equal(leerEstadoGuardado(storage), '');
});

test('un valor manipulado fuera de allowlist se ignora', () => {
  const storage = storageFalso();
  storage.setItem(STATE_PREFERENCE_KEY, 'estado-inventado');
  assert.equal(leerEstadoGuardado(storage), '');
});

test('la UI declara dispositivo local y no usa geolocalización ni serializa estado en analytics', () => {
  const entry = readFileSync('src/stateEntry.jsx','utf8');
  const control = readFileSync('src/stateRememberControl.jsx','utf8');
  const preference = readFileSync('src/lib/statePreference.js','utf8');
  const codigo = `${entry}\n${control}\n${preference}`;
  assert.match(codigo, /solo en este dispositivo/i);
  assert.match(codigo, /No usa geolocalización/i);
  assert.doesNotMatch(codigo, /navigator\.geolocation/);
  assert.doesNotMatch(codigo, /gtag\(|dataLayer|analytics/i);
  assert.match(preference, /localStorage/);
});

test('denegar acceso a localStorage no rompe la página antes de entrar al try', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new DOMException('blocked', 'SecurityError'); } });
  try {
    assert.equal(leerEstadoGuardado(), '');
    assert.equal(guardarEstado('puebla'), false);
    assert.equal(borrarEstadoGuardado(), false);
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete globalThis.localStorage;
  }
});
