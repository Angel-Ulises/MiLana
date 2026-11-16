// Etiquetas del <head> para guardar MiLana en la pantalla de inicio del teléfono: manifiesto, ícono y color.
// Las páginas estáticas (Aprende, privacidad…) no traían ni el ícono. Solo se agrega lo que falta.
// También carga /impresion.js (abre las secciones plegadas al imprimir) en las páginas que no lo traen.
// Uso: node scripts/inyectar-icono-app.mjs [carpeta]   (por defecto, dist)
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIST = resolve(process.argv[2] || 'dist');
const ETIQUETAS = [
  [/rel=["']icon["']/i, '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />'],
  [/rel=["']apple-touch-icon["']/i, '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />'],
  [/rel=["']manifest["']/i, '<link rel="manifest" href="/manifest.webmanifest" />'],
  [/name=["']theme-color["']/i, '<meta name="theme-color" content="#FBF8F2" />'],
  [/src=["']\/impresion\.js["']/i, '<script defer src="/impresion.js"></script>'],
];

function* paginas(dir) {
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) yield* paginas(ruta);
    else if (nombre.endsWith('.html')) yield ruta;
  }
}

let cambiadas = 0;
let total = 0;
for (const archivo of paginas(DIST)) {
  total++;
  const html = readFileSync(archivo, 'utf8');
  if (!html.includes('</head>')) continue;
  const faltan = ETIQUETAS.filter(([re]) => !re.test(html)).map(([, tag]) => tag);
  if (!faltan.length) continue;
  writeFileSync(archivo, html.replace('</head>', `    ${faltan.join('\n    ')}\n  </head>`));
  cambiadas++;
}
console.log(`Ícono de aplicación: ${cambiadas} de ${total} páginas completadas`);
