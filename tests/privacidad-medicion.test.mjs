import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
test('WhatsApp del resultado común prepara solo enlace canónico, sin cifras', () => {
  const s = read('src/resultadoClaro.jsx');
  assert.match(s, /const textoCompartir = `Calculadora gratuita de MiLana: \$\{SITIO\}\$\{ruta\}`/);
  assert.doesNotMatch(s, /\$\{compartir\}|location\.(href|search|hash)/);
  assert.match(s, /sin tus cifras ni resultados/);
});
test('WhatsApp de la mejora estática excluye cifras, consulta y fragmento en ambas rutas', () => {
  const s = read('public/orbita-v3-internal.js');
  const lines = s.split('\n').filter(l => /shareText =|share.href =/.test(l));
  assert.equal(lines.length, 3);
  for(const l of lines) assert.doesNotMatch(l, /rawAmount|location\.(href|search|hash)/);
  assert.equal(lines.filter(l => /https:\/\/www.milanaaqui.mx\$\{location.pathname\}/.test(l)).length, 2);
});
test('aviso explica almacenamiento real, terceros y cierre legal pendiente sin inventar identidad', () => {
  const s = read('public/privacidad/index.html');
  for(const text of ['sessionStorage', 'localStorage', '15 minutos', 'se comprueba al leer', 'otros sitios', 'myadcenter.google.com', 'tools.google.com/dlpage/gaoptout', 'pendientes de completar']) assert.ok(s.includes(text), text);
  assert.doesNotMatch(s, /El responsable del tratamiento es MiLana/);
  assert.match(s, /sin cifras ni resultados/);
});
