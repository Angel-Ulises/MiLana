// Cloudflare Pages decide la barra final por el archivo: route/index.html responde
// en /route/ y redirige /route con 308. Las canonical y el sitemap de MiLana no
// llevan barra, así que cada index.html anidado pasa a route.html. La raíz
// (index.html) se queda. No escribe _headers ni _redirects y no agrega noindex.
import { existsSync, lstatSync, readdirSync, readFileSync, renameSync, rmdirSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

function recorrer(dir, root, salida) {
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name);
    const rel = relative(root, ruta).split(sep).join('/');
    if (entrada.isSymbolicLink()) throw new Error(`No se admiten enlaces simbólicos: ${rel}`);
    if (entrada.isDirectory()) recorrer(ruta, root, salida);
    else if (entrada.isFile()) salida.push(rel);
    else throw new Error(`Tipo de archivo no admitido: ${rel}`);
  }
  return salida;
}

export function planificarUrlsLimpias(dist) {
  const root = resolve(dist);
  const archivos = recorrer(root, root, []);
  const movimientos = [];
  const destinos = new Map();
  for (const rel of archivos) {
    if (rel === 'index.html' || !rel.endsWith('/index.html')) continue;
    const route = `/${rel.slice(0, -'/index.html'.length)}`;
    const to = `${route.slice(1)}.html`;
    if (destinos.has(to)) throw new Error(`Colisión de URL limpia: ${to}`);
    const destino = join(root, to);
    if (existsSync(destino)) throw new Error(`Colisión de URL limpia: ${to}`);
    destinos.set(to, rel);
    movimientos.push({ from: rel, to, route });
  }
  return movimientos.sort((a, b) => a.route.localeCompare(b.route, 'es'));
}

function eliminarVacios(dir, root) {
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    if (entrada.isSymbolicLink()) throw new Error(`No se admiten enlaces simbólicos: ${entrada.name}`);
    if (entrada.isDirectory()) eliminarVacios(join(dir, entrada.name), root);
  }
  if (dir !== root && readdirSync(dir).length === 0) rmdirSync(dir);
}

export function empaquetarUrlsLimpias(dist) {
  const root = resolve(dist);
  for (const nombre of ['index.html', '404.html']) {
    if (!existsSync(join(root, nombre)) || !lstatSync(join(root, nombre)).isFile()) {
      throw new Error(`Falta dist/${nombre}; ejecuta y valida el build primero`);
    }
  }
  const sellos = ['_headers', '_redirects']
    .filter((nombre) => existsSync(join(root, nombre)))
    .map((nombre) => ({ nombre, bytes: readFileSync(join(root, nombre)) }));
  const movimientos = planificarUrlsLimpias(root);
  for (const movimiento of movimientos) renameSync(join(root, movimiento.from), join(root, movimiento.to));
  eliminarVacios(root, root);
  const restos = recorrer(root, root, []).filter((rel) => rel !== 'index.html' && rel.endsWith('/index.html'));
  if (restos.length) throw new Error(`Quedaron index.html anidados: ${restos.join(', ')}`);
  for (const sello of sellos) {
    const actual = readFileSync(join(root, sello.nombre));
    if (!actual.equals(sello.bytes)) throw new Error(`Se alteró ${sello.nombre}; debe permanecer idéntico a public/`);
  }
  return { rutas: movimientos.map((movimiento) => movimiento.route), movidos: movimientos.length };
}

const esCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (esCli) {
  const dist = process.argv[2] || 'dist';
  const reporte = empaquetarUrlsLimpias(dist);
  console.log(`URLs limpias: ${reporte.movidos} index.html anidados pasaron a .html; index.html de la raíz se conserva.`);
}
