// Verifica el índice del buscador generado: cada ruta existe y las búsquedas frecuentes llevan a su página.
// Usa la misma regla de coincidencia que el buscador (src/lib/searchIntent.js) y su tope de 10 resultados.
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { matchesSearch } from '../src/lib/searchIntent.js';

const DIST = resolve('dist');
const MAX_RESULTADOS = 10; // visible.length < 10 en public/orbita-v3-base.js
const errores = [];
const indice = JSON.parse(readFileSync(join(DIST, 'buscar-indice.json'), 'utf8'));
const { busquedas } = JSON.parse(readFileSync(new URL('./busquedas-frecuentes.json', import.meta.url), 'utf8'));

const vistos = new Set();
for (const { href, label } of indice) {
  if (vistos.has(href)) errores.push(`índice: ruta repetida ${href}`);
  vistos.add(href);
  if (!label || !label.trim()) errores.push(`índice: ${href} no tiene nombre`);
  // Antes de empaquetar las URLs limpias la página es <ruta>/index.html; después, <ruta>.html.
  const existe = href === '/' ? existsSync(join(DIST, 'index.html')) : existsSync(join(DIST, href, 'index.html')) || existsSync(join(DIST, `${href}.html`));
  if (!existe) errores.push(`índice: ${href} no existe como página generada`);
}

let conResultado = 0;
for (const [consulta, esperada] of busquedas) {
  if (!vistos.has(esperada)) { errores.push(`búsqueda «${consulta}»: la página esperada ${esperada} no está en el índice`); continue; }
  const resultados = indice.filter((i) => matchesSearch(i.label, i.aliases, consulta)).slice(0, MAX_RESULTADOS).map((i) => i.href);
  if (resultados.includes(esperada)) conResultado++;
  else errores.push(`búsqueda «${consulta}»: no lleva a ${esperada} (primeras ${MAX_RESULTADOS}: ${resultados.join(', ') || 'ninguna'})`);
}

if (errores.length) {
  console.error(`Buscador: ${errores.length} problema(s)\n - ${errores.join('\n - ')}`);
  process.exit(1);
}
console.log(`Buscador: ${indice.length} páginas en el índice, ${conResultado} de ${busquedas.length} búsquedas frecuentes llevan a su página`);
