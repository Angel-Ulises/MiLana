import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { STATE_PREFERENCE_KEY, borrarEstadoGuardado, estadoPermitido, guardarEstado, leerEstadoGuardado, obtenerEstado } from '../src/lib/statePreference.js';

function storageFalso() {
  const mapa = new Map();
  return {
    getItem: (k) => mapa.has(k) ? mapa.get(k) : null,
    setItem: (k,v) => mapa.set(k,String(v)),
    removeItem: (k) => mapa.delete(k),
    mapa,
  };
}

test('solo permite slugs de las 32 entidades', () => {
  assert.equal(estadoPermitido('jalisco'), true);
  assert.equal(estadoPermitido('nuevo-leon'), true);
  assert.equal(estadoPermitido('mi-casa'), false);
  assert.equal(estadoPermitido('../nuevo-leon'), false);
  assert.equal(obtenerEstado('oaxaca')?.estado, 'Oaxaca');
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
