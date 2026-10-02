import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIST = resolve('dist');
const ORIGEN = 'https://www.milanaaqui.mx';

function htmls(dir, salida = []) {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    const stat = statSync(ruta);
    if (stat.isDirectory()) htmls(ruta, salida);
    else if (ruta.endsWith('.html')) salida.push(ruta);
  }
  return salida;
}

let archivos = 0;
for (const archivo of htmls(DIST)) {
  const original = readFileSync(archivo, 'utf8');
  let html = original;
  // Vercel usa trailingSlash:false: las URLs propias no-root deben usar la forma sin slash final.
  html = html.replace(new RegExp(`${ORIGEN.replaceAll('.', '\\.') }(/[^"'<>\\s]*?)/(?=["'<>\\s])`, 'g'), `${ORIGEN}$1`);
  html = html.replace(/href="(\/[^"?#]+?)\/"/g, 'href="$1"');
  if (html !== original) {
    writeFileSync(archivo, html, 'utf8');
    archivos += 1;
  }
}
console.log(`URLs estáticas: ${archivos} HTML normalizados a trailingSlash:false`);
