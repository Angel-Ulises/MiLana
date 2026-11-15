import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Página limpia (2026-11-14): al calcular solo se ve el formulario y el resultado.
test('lo explicativo de cada calculadora queda en un solo desplegable cerrado', () => {
  const app = readFileSync('src/App.jsx', 'utf8');
  assert.match(app, /<details className="calc-mas-info" data-mas-info>\s*<summary>Ejemplo, cómo se calcula y fuentes<\/summary>/);
  assert.doesNotMatch(app, /<details className="calc-mas-info" data-mas-info open/);
  const dentro = app.slice(app.indexOf('data-mas-info-cuerpo'), app.indexOf('← Todas las calculadoras'));
  for (const bloque of ['<FichaConfianza', '<Articulo', '<ContenidoCalculadora']) assert.ok(dentro.includes(bloque), bloque);
  assert.match(readFileSync('public/casos-calculadoras-2026.js', 'utf8'), /if \(masInfo\) masInfo\.prepend\(section\)/);
  assert.match(readFileSync('public/orbita-v3-glossary.js', 'utf8'), /if \(masInfo\) masInfo\.append\(strip\)/);
  assert.match(readFileSync('scripts/inyectar-seo-estatico.mjs', 'utf8'), /<details class="calc-mas-info"><summary>Ver un ejemplo resuelto<\/summary>/);
});

test('el resultado muestra cifra, una línea y compartir; desglose y fecha van plegados', () => {
  const s = readFileSync('src/resultadoClaro.jsx', 'utf8');
  const detalle = s.slice(s.indexOf('<details className="rc-detalle">'), s.indexOf('</details>'));
  assert.ok(detalle.includes('rc-secundarios') && detalle.includes('Datos actualizados al'));
  const antes = s.slice(s.indexOf('<section className="rc"'), s.indexOf('<details className="rc-detalle">'));
  assert.doesNotMatch(antes, /rc-secundarios|rc-actualizado|Siguiente paso/);
  assert.doesNotMatch(s, /rc-siguiente-kicker/);
  assert.doesNotMatch(readFileSync('src/calcAguinaldo.jsx', 'utf8'), /Escribe tu sueldo y verás/);
});

test('las secciones secundarias se pliegan bajo su título sin borrar contenido ni insertar nodos', () => {
  const js = readFileSync('public/pagina-limpia.js', 'utf8');
  for (const sel of ['.state-labor', '.state-occupations', '.state-housing', '.investment-questions', '.ml-inv-fees', '.economy-sources-section']) assert.ok(js.includes(`'${sel}'`), sel);
  assert.doesNotMatch(js, /createElement|innerHTML|\.remove\(\)|appendChild|insertAdjacent/, 'solo marca atributos: no toca el árbol de React');
  assert.match(js, /setAttribute\('aria-expanded'/);
  assert.match(js, /e\.key !== 'Enter' && e\.key !== ' '/);
  assert.match(js, /estados\\\/\(\?!comparar/, 'el comparador de estados no se pliega');
  assert.match(readFileSync('index.html', 'utf8'), /<script defer src="\/pagina-limpia\.js"><\/script>/);
  const css = readFileSync('public/orbita-v3-prepaint.css', 'utf8');
  assert.match(css, /\[data-pl-nivel\]>:not\(\[data-pl-cabeza\]\)\{display:none!important\}/);
  assert.match(css, /\.finance-tool-section\[data-sin-datos\] \.finance-results\{display:none!important\}/);
});
