// Busca palabras de programación en el texto que ve la persona: undefined, NaN, null, [object …], {{ }}.
// Uso: node scripts/verificar-texto-visible.mjs [carpeta]   (por defecto, dist)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const RAIZ = resolve(process.argv[2] || 'dist');
const PATRONES = [
  ['undefined', /(?<![\w/_=.-])undefined(?![\w/_-])/],
  ['NaN', /(?<![\w/_=.-])NaN(?![\w/_-])/],
  ['null', /(?<![\w/_=.-])null(?![\w/_-])/],
  ['Infinity', /(?<![\w/_=.-])-?Infinity(?![\w/_-])/],
  ['[object …]', /\[object [A-Za-z]+\]/],
  ['llaves de plantilla', /\{\{|\}\}/],
];

function* paginas(dir) {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) yield* paginas(ruta);
    else if (nombre.endsWith('.html')) yield ruta;
  }
}

export function textoVisible(html) {
  return html
    .replace(/<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ');
}

const errores = [];
let total = 0;
for (const archivo of paginas(RAIZ)) {
  total++;
  const texto = textoVisible(readFileSync(archivo, 'utf8'));
  for (const [nombre, patron] of PATRONES) {
    const m = texto.match(patron);
    if (m) errores.push(`${relative(RAIZ, archivo)}: «${nombre}» visible en «…${texto.slice(Math.max(0, m.index - 40), m.index + 40)}…»`);
  }
}
if (errores.length) {
  console.error(`Texto visible: ${errores.length} problema(s)\n - ${errores.join('\n - ')}`);
  process.exit(1);
}
console.log(`Texto visible: ${total} páginas sin undefined, NaN, null, Infinity ni llaves de plantilla`);
