// Utilidades compartidas por las verificaciones de dist/ que necesitan Chrome real: servidor estático
// con cleanUrls y una sesión CDP sin dependencias (requiere WebSocket global: Node 22 o --experimental-websocket).
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';

export const DIST = new URL('../../dist/', import.meta.url).pathname;
export const PROTEGIDAS = new Set(['/calculadoras/pension-imss']);
export const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));

export function encontrarChrome() {
  return [process.env.MILANA_CHROME, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable']
    .filter(Boolean).find((path) => existsSync(path));
}

export function rutasDelSitemap() {
  return [...readFileSync(join(DIST, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => new URL(m[1]).pathname).filter((route) => !PROTEGIDAS.has(route));
}

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' };

export async function servirDist() {
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    const file = [path, `${path}.html`, join(path, 'index.html')].map((p) => join(DIST, p)).find((p) => existsSync(p) && statSync(p).isFile());
    if (!file) { res.writeHead(404, { 'content-type': 'text/html' }); res.end(readFileSync(join(DIST, '404.html'))); return; }
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  return { base: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}

export async function abrirChrome(chrome) {
  const profile = mkdtempSync(join(tmpdir(), 'milana-chrome-'));
  const child = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  const endpoint = await new Promise((resolve, reject) => {
    let stderr = '';
    const timer = setTimeout(() => reject(new Error('Chrome no inició')), 20000);
    child.stderr.on('data', (chunk) => { stderr += chunk; const m = stderr.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(timer); resolve(m[1]); } });
    child.on('error', reject);
  });
  const socket = new WebSocket(endpoint);
  await new Promise((ok, fail) => { socket.onopen = ok; socket.onerror = fail; });
  let msgId = 0;
  const pending = new Map();
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const entry = pending.get(message.id);
    if (!entry) return;
    pending.delete(message.id);
    message.error ? entry.fail(new Error(message.error.message)) : entry.ok(message.result);
  };
  const send = (method, params = {}, sessionId) => new Promise((ok, fail) => {
    const id = ++msgId;
    pending.set(id, { ok, fail });
    socket.send(JSON.stringify({ id, method, params, sessionId }));
  });
  async function nuevaPestana() {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    return {
      send: (method, params) => send(method, params, sessionId),
      async evaluar(expression) {
        const { result, exceptionDetails } = await send('Runtime.evaluate', { expression, returnByValue: true }, sessionId);
        if (exceptionDetails) throw new Error(`${exceptionDetails.text} ${exceptionDetails.exception?.description || ''}`);
        return result.value;
      }
    };
  }
  async function cerrar() {
    try { socket.close(); } catch {}
    const exited = new Promise((ok) => child.once('close', ok));
    child.kill('SIGKILL');
    await exited;
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); } catch {}
  }
  return { nuevaPestana, cerrar };
}

// Navega, espera a que React monte (main sin data-static-seo) y a que Órbita inserte sus bloques.
export async function cargarPagina(pestana, base, route, width) {
  await pestana.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 });
  await pestana.send('Page.navigate', { url: base + route });
  for (let i = 0; i < 60; i++) {
    await sleep(100);
    if (await pestana.evaluar(`document.readyState === 'complete' && !!document.querySelector('main') && !document.querySelector('main[data-static-seo]')`)) break;
  }
  await sleep(900);
}
