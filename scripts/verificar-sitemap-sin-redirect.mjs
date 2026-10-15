// Falla el build si alguna URL del sitemap no responde 200 en la forma canónica
// o si el canonical del HTML no es exactamente esa URL.
// Emula Cloudflare Pages con Wrangler. No publica ni usa credenciales.
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { canonicales, ORIGEN } from './cloudflare-pages.mjs';

const WRANGLER = '4.149.0';
const REDIRECT = new Set([301, 307, 308]);

function puertoLibre() {
  return new Promise((ok, fail) => {
    const server = createServer();
    server.once('error', fail);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => ok(port));
    });
  });
}

function destinoDe(response, origin) {
  const location = response.headers.get('location');
  if (!location) return null;
  return new URL(location, origin);
}

async function pedir(origin, path) {
  return fetch(new URL(path, origin), { redirect: 'manual', signal: AbortSignal.timeout(20000) });
}

export async function auditarSitemap(origin, dist = resolve('dist')) {
  const xml = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].trim());
  const errores = [];
  const vistos = new Set();
  for (const loc of locs) {
    if (vistos.has(loc)) errores.push(`sitemap duplicado: ${loc}`);
    vistos.add(loc);
    const url = new URL(loc);
    if (url.origin !== ORIGEN) errores.push(`sitemap fuera de ${ORIGEN}: ${loc}`);
    const ruta = url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, '');
    const respuesta = await pedir(origin, ruta);
    if (respuesta.status !== 200) {
      errores.push(`${ruta} respondió ${respuesta.status}${respuesta.headers.get('location') ? ` hacia ${respuesta.headers.get('location')}` : ''}; la canónica debe ser 200`);
      continue;
    }
    const canon = canonicales(await respuesta.text());
    if (canon.length !== 1) errores.push(`${ruta}: se esperaba 1 canonical y hay ${canon.length}`);
    else if (canon[0] !== loc) errores.push(`${ruta}: canonical ${canon[0]} no coincide con ${loc}`);
    if (ruta !== '/') {
      const slash = await pedir(origin, `${ruta}/?cf-check=1`);
      const slashDestino = destinoDe(slash, origin);
      if (!REDIRECT.has(slash.status) || slashDestino?.origin !== origin.origin || slashDestino.pathname !== ruta || slashDestino.searchParams.get('cf-check') !== '1') {
        errores.push(`${ruta}/ debe redirigir en un salto a ${ruta} y conservar la consulta (recibió ${slash.status} ${slash.headers.get('location') || ''})`);
      }
      const extension = await pedir(origin, `${ruta}.html?cf-check=1`);
      const extensionDestino = destinoDe(extension, origin);
      if (!REDIRECT.has(extension.status) || extensionDestino?.origin !== origin.origin || extensionDestino.pathname !== ruta || extensionDestino.searchParams.get('cf-check') !== '1') {
        errores.push(`${ruta}.html debe redirigir en un salto a ${ruta} (recibió ${extension.status} ${extension.headers.get('location') || ''})`);
      }
    }
  }
  const indice = await pedir(origin, '/index.html?cf-check=1');
  const indiceDestino = destinoDe(indice, origin);
  if (!REDIRECT.has(indice.status) || indiceDestino?.pathname !== '/' || indiceDestino.searchParams.get('cf-check') !== '1') {
    errores.push(`/index.html debe redirigir a / (recibió ${indice.status} ${indice.headers.get('location') || ''})`);
  }
  const vercel = JSON.parse(readFileSync(resolve('vercel.json'), 'utf8'));
  for (const rule of vercel.redirects ?? []) {
    for (const suffix of ['', '/', '.html', '/index.html']) {
      const respuesta = await pedir(origin, `${rule.source}${suffix}?cf-check=1`);
      const destino = destinoDe(respuesta, origin);
      if (!REDIRECT.has(respuesta.status) || destino?.origin !== origin.origin || destino.pathname !== rule.destination || destino.searchParams.get('cf-check') !== '1') {
        errores.push(`${rule.source}${suffix} debe redirigir a ${rule.destination} (recibió ${respuesta.status} ${respuesta.headers.get('location') || ''})`);
      }
    }
  }
  const faltante = await pedir(origin, '/__milana_ruta_inexistente');
  const cuerpo404 = await faltante.text();
  if (faltante.status !== 404 || !cuerpo404.includes('Esta página no existe')) {
    errores.push(`una ruta inexistente debe ser 404 real (recibió ${faltante.status})`);
  }
  if (errores.length) {
    throw new Error(`Sitemap con redirect o canonical distinto (${errores.length}):\n${errores.map(error => `  ${error}`).join('\n')}`);
  }
  return locs.length;
}

function arrancarWrangler(port, dist) {
  const child = spawn('npx', ['--yes', `wrangler@${WRANGLER}`, 'pages', 'dev', dist, '--ip', '127.0.0.1', '--port', String(port), '--compatibility-date=2026-10-06', '--show-interactive-dev-session=false', '--log-level=error'], {
    cwd: resolve('.'),
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, WRANGLER_SEND_METRICS: 'false', CI: '1' },
  });
  let log = '';
  const guardar = chunk => { log = (log + chunk.toString()).slice(-12000); };
  child.stdout.on('data', guardar);
  child.stderr.on('data', guardar);
  return { child, leerLog: () => log };
}

function detener(child) {
  if (!child || child.exitCode !== null) return;
  try { process.kill(-child.pid, 'SIGTERM'); } catch { try { child.kill('SIGTERM'); } catch { /* ya terminó */ } }
}

async function main() {
  const dist = resolve('dist');
  const port = await puertoLibre();
  const origin = new URL(`http://127.0.0.1:${port}/`);
  const { child, leerLog } = arrancarWrangler(port, dist);
  try {
    const limite = Date.now() + 90000;
    let listo = false;
    while (Date.now() < limite) {
      if (child.exitCode !== null) throw new Error('Wrangler terminó antes de servir');
      try {
        const respuesta = await fetch(origin, { redirect: 'manual', signal: AbortSignal.timeout(2000) });
        if (respuesta.status) { listo = true; break; }
      } catch { /* todavía arranca */ }
      await new Promise(ok => setTimeout(ok, 400));
    }
    if (!listo) throw new Error('Wrangler no respondió a tiempo');
    const total = await auditarSitemap(origin, dist);
    console.log(`Sitemap sin redirect: ${total} URLs canónicas respondieron 200 y su canonical coincide.`);
  } catch (error) {
    console.error(error.message);
    const log = leerLog().trim();
    if (log) console.error(log);
    process.exitCode = 1;
  } finally {
    detener(child);
    child.stdout.destroy();
    child.stderr.destroy();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
  process.exit(process.exitCode || 0);
}
