import test from 'node:test';
import assert from 'node:assert/strict';
import { capturarCampos, restaurarCampos } from '../src/lib/calcStartup.js';

// Campos simulados: lo que hay en el HTML prerenderizado y lo que React crea después.
const campo = (name, type, value, defaultValue = value, extra = {}) => ({
  name, type, value, defaultValue, checked: false, defaultChecked: false,
  eventos: [], dispatchEvent(e) { this.eventos.push(e.type); return true; }, click() { this.checked = true; }, ...extra,
});
const raiz = (campos) => ({ querySelectorAll: () => campos });

test('R-2: la fecha que viene del HTML (día de la compilación) no pisa la del día de la visita', () => {
  // HTML: salida = día del build; la persona no tocó la fecha.
  const antes = [campo('sueldo', 'text', '', ''), campo('salida', 'date', '2026-11-16', '2026-11-16')];
  const guardados = capturarCampos(raiz(antes));
  // React monta con la fecha de hoy (31-dic) y campos vacíos.
  const despues = [campo('sueldo', 'text', '', ''), campo('salida', 'date', '2026-12-31', '2026-12-31')];
  restaurarCampos(raiz(despues), guardados);
  assert.equal(despues[1].value, '2026-12-31', 'la fecha debe seguir siendo la de hoy');
});

test('R-2: lo que la persona escribió antes de que cargue React sí se conserva', () => {
  const antes = [campo('sueldo', 'text', '12000', ''), campo('salida', 'date', '2026-11-16', '2026-11-16')];
  const guardados = capturarCampos(raiz(antes));
  const despues = [campo('sueldo', 'text', '', ''), campo('salida', 'date', '2026-12-31', '2026-12-31')];
  restaurarCampos(raiz(despues), guardados);
  assert.equal(despues[0].value, '12000');
  assert.deepEqual(despues[0].eventos, ['input']);
  assert.equal(despues[1].value, '2026-12-31');
});

test('R-2: una fecha que la persona sí cambió antes de que cargue React se conserva', () => {
  const antes = [campo('salida', 'date', '2026-09-30', '2026-11-16')];
  const guardados = capturarCampos(raiz(antes));
  const despues = [campo('salida', 'date', '2026-12-31', '2026-12-31')];
  restaurarCampos(raiz(despues), guardados);
  assert.equal(despues[0].value, '2026-09-30');
});

test('R-2: las opciones elegidas (radios) se siguen restaurando', () => {
  const antes = [campo('frecuencia', 'radio', 'mes', 'mes', { checked: false }), campo('frecuencia', 'radio', 'quincena', 'quincena', { checked: true })];
  const guardados = capturarCampos(raiz(antes));
  const despues = [campo('frecuencia', 'radio', 'mes', 'mes', { checked: true }), campo('frecuencia', 'radio', 'quincena', 'quincena')];
  restaurarCampos(raiz(despues), guardados);
  assert.equal(despues[1].checked, true);
});
