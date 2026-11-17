import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { huellas, comparar, LEYES, PAGINAS } from '../scripts/leyes/vigia-leyes.mjs';

const ley = (art87) => `                CÁMARA DE DIPUTADOS DEL H. CONGRESO DE LA UNIÓN                Última Reforma DOF 14-05-2026
   Artículo 86.- A trabajo igual, salario igual.
   Artículo 87.- ${art87}
                                                                 23 de 457
   Artículo 88.- Los plazos para el pago del salario nunca podrán ser mayores de una semana.
DECRETO por el que se reforman diversas disposiciones
   Artículo 87.- Texto del decreto que repite el número y no debe contar.`;

test('vigía: la huella ignora encabezados de página y las repeticiones del artículo en decretos', () => {
  const a = huellas(ley('Los trabajadores tendrán derecho a un aguinaldo anual.'), ['87', '88']);
  assert.equal(a.reforma, '14-05-2026');
  assert.ok(a.huellas['87'] && a.huellas['88']);
  assert.match(a.huellas['87'].inicio, /^Artículo 87\.- Los trabajadores/);
  assert.doesNotMatch(a.huellas['87'].inicio, /decreto/i);
  const conOtraPagina = huellas(ley('Los trabajadores tendrán derecho a un aguinaldo anual.').replace('23 de 457', '24 de 458'), ['87']);
  assert.equal(conOtraPagina.huellas['87'].huella, a.huellas['87'].huella, 'el número de página no cambia la huella');
});

test('vigía: detecta texto cambiado, artículo desaparecido y nueva fecha de reforma', () => {
  const antes = { LFT: huellas(ley('Quince días de salario.'), ['87', '88']) };
  assert.deepEqual(comparar(antes, antes), { cambios: [], reformas: [] });
  const despues = { LFT: huellas(ley('Treinta días de salario.'), ['87', '88']) };
  assert.deepEqual(comparar(antes, despues).cambios.map((c) => c.articulo), ['87']);
  const sin88 = { LFT: huellas(ley('Quince días de salario.').replace(/Artículo 88[^\n]*\n/, ''), ['87', '88']) };
  assert.match(comparar(antes, sin88).cambios.find((c) => c.articulo === '88').motivo, /no se encontró/);
  const otraReforma = structuredClone(antes); otraReforma.LFT.reforma = '01-05-2026';
  assert.equal(comparar(otraReforma, antes).reformas.length, 1);
});

test('vigía: la base guardada cubre todos los artículos vigilados y las páginas apuntan a leyes vigiladas', () => {
  const base = JSON.parse(readFileSync('data/leyes/huellas.json', 'utf8'));
  for (const [clave, l] of Object.entries(LEYES)) {
    for (const n of l.articulos) assert.ok(base[clave]?.huellas?.[n]?.huella, `${clave} ${n} sin huella en la base`);
  }
  for (const k of Object.keys(PAGINAS)) {
    const [clave, n] = k.split(' ');
    assert.ok(LEYES[clave]?.articulos.includes(n), `${k} no está vigilado`);
  }
});

test('vigía: el flujo diario instala pdftotext, corre el vigía y mantiene un solo aviso', () => {
  const wf = readFileSync('.github/workflows/vigia-leyes.yml', 'utf8');
  assert.match(wf, /schedule:/); assert.match(wf, /workflow_dispatch/);
  assert.match(wf, /poppler-utils/);
  assert.match(wf, /node scripts\/leyes\/vigia-leyes\.mjs/);
  assert.match(wf, /issues: write/);
  assert.match(wf, /\[Leyes\] Cambió un artículo que usa MiLana/);
});
