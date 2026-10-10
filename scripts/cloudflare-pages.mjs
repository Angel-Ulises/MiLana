import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

export const PAGES_LIMITS = Object.freeze({ files: 20_000, dashboardFiles: 1_000, bytesPerFile: 25 * 1024 * 1024 });

export function filesIn(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    if (entry.isSymbolicLink()) throw new Error(`No se admiten enlaces simbólicos en la salida: ${entry.name}`);
    const path = join(root, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  }).sort();
}

export function pagesHeaders(mode = 'preview') {
  if (!['preview', 'production'].includes(mode)) throw new Error('Modo inválido');
  const common = '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n';
  const robots = mode === 'preview'
    ? '  X-Robots-Tag: noindex, nofollow, noarchive\n'
    : '\nhttps://:project.pages.dev/*\n  X-Robots-Tag: noindex\n\nhttps://:version.:project.pages.dev/*\n  X-Robots-Tag: noindex\n';
  return common + robots + '\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n';
}

export function pagesRedirects(routes, legacy) {
  const result = new Map();
  const add = (source, destination, status = 308) => {
    if (source === destination) return;
    const prior = result.get(source);
    if (prior && prior !== `${destination} ${status}`) throw new Error(`Redirect en conflicto: ${source}`);
    result.set(source, `${destination} ${status}`);
  };
  for (const rule of legacy) {
    const localPath = /^\/(?:[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*)?$/;
    if (!localPath.test(rule.source) || !localPath.test(rule.destination)) throw new Error('Redirect Vercel no soportado');
    for (const suffix of ['', '/', '.html', '/index.html']) add(rule.source + suffix, rule.destination, rule.permanent ? 308 : 307);
  }
  add('/index.html', '/');
  for (const route of routes) {
    if (route === '/') continue;
    if (!legacy.some(rule => rule.source === route)) {
      add(route + '/', route);
      add(route + '/index.html', route);
    }
  }
  for (const source of result.keys()) {
    const seen = new Set([source]);
    let target = result.get(source).split(' ')[0];
    while (result.has(target)) {
      if (seen.has(target)) throw new Error(`Ciclo de redirects: ${source}`);
      seen.add(target);
      target = result.get(target).split(' ')[0];
    }
  }
  if (result.size > 2000) throw new Error('Demasiados redirects estáticos para Pages');
  return '# Generado desde rutas reales y vercel.json; sin fallback SPA ni cambios de dominio.\n' +
    [...result].map(([source, target]) => `${source} ${target}`).join('\n') + '\n';
}

function sha256(file) { return createHash('sha256').update(readFileSync(file)).digest('hex'); }

export function preparePages({ root, mode = 'preview', limits = PAGES_LIMITS }) {
  if (!['preview', 'production'].includes(mode)) throw new Error('Modo inválido');
  root = resolve(root);
  const source = join(root, 'dist');
  const destination = join(root, `dist-cloudflare-${mode}`);
  const staging = join(root, `.dist-cloudflare-${mode}.tmp`);
  for (const name of ['index.html', '404.html', 'robots.txt', 'ads.txt', 'sitemap.xml']) {
    if (!existsSync(join(source, name))) throw new Error(`Falta dist/${name}; ejecuta y valida el build primero`);
  }
  const originals = filesIn(source);
  if (originals.some(file => /(?:^|\/)(?:_worker\.js|_routes\.json|_headers|_redirects)$/.test(relative(source, file)))) {
    throw new Error('La salida ya contiene configuración Pages/Functions; revisar antes de empaquetar');
  }
  const routes = ['/'];
  const moves = [];
  for (const file of originals) {
    const name = relative(source, file).replaceAll('\\', '/');
    if (name !== 'index.html' && name.endsWith('/index.html')) {
      const route = '/' + name.slice(0, -'/index.html'.length);
      const target = route.slice(1) + '.html';
      if (existsSync(join(source, target))) throw new Error(`Colisión de clean URL: ${target}`);
      routes.push(route);
      moves.push({ from: name, to: target });
    }
  }
  const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
  const redirects = pagesRedirects(routes, vercel.redirects ?? []);
  rmSync(staging, { recursive: true, force: true });
  cpSync(source, staging, { recursive: true });
  try {
    for (const move of moves) {
      mkdirSync(dirname(join(staging, move.to)), { recursive: true });
      renameSync(join(staging, move.from), join(staging, move.to));
    }
    writeFileSync(join(staging, '_headers'), pagesHeaders(mode));
    writeFileSync(join(staging, '_redirects'), redirects);
    const files = filesIn(staging).map(file => ({
      path: relative(staging, file).replaceAll('\\', '/'), bytes: statSync(file).size, sha256: sha256(file),
    }));
    if (files.length > limits.files) throw new Error('La salida excede el límite de archivos de Pages Free');
    if (files.some(file => file.bytes > limits.bytesPerFile)) throw new Error('Un archivo excede 25 MiB');
    const report = {
      mode, fileCount: files.length, htmlCount: files.filter(file => file.path.endsWith('.html')).length,
      totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
      largestFile: files.reduce((max, file) => file.bytes > max.bytes ? file : max, { bytes: 0 }),
      dashboardUploadFits: files.length <= limits.dashboardFiles,
      routes: routes.filter(route => !(vercel.redirects ?? []).some(rule => rule.source === route)).sort(),
      legacyRoutes: (vercel.redirects ?? []).map(rule => rule.source),
      redirects: redirects.split('\n').filter(line => line && !line.startsWith('#')).length,
      movedHtml: moves, files,
    };
    // Sólo sustituye la carpeta de salida dedicada; dist y los archivos fuente no cambian.
    rmSync(destination, { recursive: true, force: true });
    renameSync(staging, destination);
    return report;
  } catch (error) {
    rmSync(staging, { recursive: true, force: true });
    throw error;
  }
}
