// Cache-busting de recursos estáticos sin hash (public/ y el runtime de Órbita).
// Vite ya versiona /assets/*; estos archivos conservaban el mismo nombre en cada despliegue
// (p. ej. /orbita-v3-prepaint.css), así que un navegador o una caché intermedia podía seguir
// usando la versión anterior aunque el HTML fuera nuevo. Se añade ?v=<hash del contenido>.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REF = /\b(href|src)="(\/(?!\/)(?!assets\/)[^"?#]+\.(?:css|js))"/g;

export function hashRecurso(dist, ruta, cache = new Map()) {
  if (!cache.has(ruta)) {
    const archivo = join(dist, ruta);
    if (!existsSync(archivo)) throw new Error(`Recurso referenciado y ausente en dist: ${ruta}`);
    cache.set(ruta, createHash('sha256').update(readFileSync(archivo)).digest('hex').slice(0, 10));
  }
  return cache.get(ruta);
}

export function versionarHtml(html, dist, cache = new Map()) {
  return html.replace(REF, (_, atributo, ruta) => `${atributo}="${ruta}?v=${hashRecurso(dist, ruta, cache)}"`);
}

function htmls(dir, salida = []) {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) { if (nombre !== 'assets') htmls(ruta, salida); }
    else if (nombre.endsWith('.html')) salida.push(ruta);
  }
  return salida;
}

export function versionarDist(dist) {
  const cache = new Map();
  let archivos = 0;
  for (const archivo of htmls(dist)) {
    const antes = readFileSync(archivo, 'utf8');
    const despues = versionarHtml(antes, dist, cache);
    if (despues !== antes) { writeFileSync(archivo, despues); archivos++; }
  }
  return { archivos, recursos: cache.size };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { archivos, recursos } = versionarDist(resolve('dist'));
  console.log(`Recursos versionados: ${recursos} archivos CSS/JS sin hash, referencias actualizadas en ${archivos} HTML.`);
}
