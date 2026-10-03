// Auditoría de contraste sobre el sitio ya generado (dist/): recorre TODAS las rutas del sitemap a
// 390 y 1280 px con Órbita activa y falla si algún texto visible no llega a 4.5:1 (3:1 si es grande)
// contra su fondo efectivo. Sirve dist/ con un servidor propio y usa Chrome por CDP (sin dependencias).
//   node scripts/verificar-contraste.mjs [--verbose] [ruta ...]
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { extname, join, normalize } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const VIEWPORTS = [390, 1280];
const CONCURRENCY = 4;
const verbose = process.argv.includes('--verbose');
const onlyRoutes = process.argv.slice(2).filter((arg) => arg.startsWith('/'));

const chrome = [process.env.MILANA_CHROME, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable']
  .filter(Boolean).find((path) => existsSync(path));
if (!chrome) {
  console.warn('contraste: Chrome/Chromium no encontrado; auditoría omitida (define MILANA_CHROME).');
  process.exit(0);
}
if (!existsSync(join(DIST, 'sitemap.xml'))) throw new Error('contraste: falta dist/sitemap.xml (ejecuta vite build y los generadores antes).');

// ── Auditoría dentro de la página ────────────────────────────────────────────
function auditInPage() {
  const parse = (value) => {
    const m = value.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (top, bottom) => {
    const a = top.a + bottom.a * (1 - top.a);
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
    const mix = (t, b) => (t * top.a + b * bottom.a * (1 - top.a)) / a;
    return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

  // Fondo efectivo: capas que realmente se pintan bajo el centro del texto (elementsFromPoint, de arriba
  // hacia abajo, incluye ancestros y hermanos posicionados). Imagen o pseudo-elemento decorativo → desconocido.
  const decorativePseudo = (node) => ['::before', '::after'].some((pseudo) => {
    const ps = getComputedStyle(node, pseudo);
    if (ps.content === 'none' || ps.content === 'normal') return false;
    if (!/absolute|fixed/.test(ps.position)) return false;
    const bg = parse(ps.backgroundColor);
    return ps.backgroundImage !== 'none' || (bg && bg.a > 0);
  });
  const backdrop = (el, stack) => {
    const start = stack.findIndex((node) => node === el || el.contains(node));
    if (start < 0) return null; // tapado por otro elemento
    const layers = [];
    let source = null;
    for (const node of stack.slice(start)) {
      const cs = getComputedStyle(node);
      if (decorativePseudo(node)) return null;
      if (cs.backgroundImage !== 'none') {
        if (!/(linear|radial|conic)-gradient\(/.test(cs.backgroundImage)) return null;
        const colors = [...cs.backgroundImage.matchAll(/rgba?\([^)]+\)|#[0-9a-f]{3,8}\b/gi)].map((m) => m[0]);
        const probe = document.createElement('i');
        const parsed = colors.map((c) => { probe.style.color = c; document.body.append(probe); const v = parse(getComputedStyle(probe).color); probe.remove(); return v; }).filter(Boolean);
        if (!parsed.length) return null;
        return { gradient: parsed, layers };
      }
      const bg = parse(cs.backgroundColor);
      if (bg && bg.a > 0) { layers.push(bg); source = node; if (bg.a === 1) break; }
    }
    return { layers, source };
  };
  const flatten = (layers) => layers.reduceRight((acc, layer) => over(layer, acc), { r: 255, g: 255, b: 255, a: 1 });

  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.nodeValue.replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const el = node.parentElement;
    if (!el || seen.has(el) || el.closest('script,style,noscript,template,svg,[hidden],[aria-hidden="true"]')) continue;
    seen.add(el);
    if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const rect = range.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    // Texto recortado fuera de un contenedor con overflow oculto.
    let clipped = false;
    for (let p = el; p && p !== document.body; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (/hidden|clip/.test(cs.overflow + cs.overflowX + cs.overflowY)) {
        const r = p.getBoundingClientRect();
        if (rect.right < r.left || rect.left > r.right || rect.bottom < r.top || rect.top > r.bottom) { clipped = true; break; }
      }
    }
    if (clipped) continue;
    const cs = getComputedStyle(el);
    const fill = parse(cs.webkitTextFillColor || cs.color);
    const fg = fill && fill.a > 0 ? fill : null;
    if (!fg) continue;
    const point = [rect.left + rect.width / 2, rect.top + rect.height / 2];
    const back = backdrop(el, document.elementsFromPoint(point[0], point[1]));
    if (!back) continue; // imagen de fondo: no se puede evaluar
    if (el.closest(':disabled,[aria-disabled="true"]')) continue;
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    let opacity = 1;
    for (let p = el; p; p = p.parentElement) opacity *= parseFloat(getComputedStyle(p).opacity);
    const backs = back.gradient ? back.gradient.map((g) => flatten([g, ...back.layers])) : [flatten(back.layers)];
    const worst = Math.min(...backs.map((bg) => {
      const solid = over({ ...fg, a: fg.a * opacity }, bg);
      return ratio(solid, bg);
    }));
    if (worst < need) {
      const id = (e) => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
      out.push({ text: text.slice(0, 50), ratio: Math.round(worst * 100) / 100, need, el: id(el), parent: el.parentElement ? id(el.parentElement) : '', src: back.source ? id(back.source) : '', color: cs.color, bg: backs.map((b) => `rgb(${[b.r, b.g, b.b].map(Math.round)})`).join('|') });
    }
  }
  return out;
}

// ── Servidor estático de dist/ (cleanUrls) ───────────────────────────────────
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  const candidates = [path, `${path}.html`, join(path, 'index.html')].map((p) => join(DIST, p));
  const file = candidates.find((p) => existsSync(p) && statSync(p).isFile());
  if (!file) { res.writeHead(404, { 'content-type': 'text/html' }); res.end(readFileSync(join(DIST, '404.html'))); return; }
  res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${server.address().port}`;

// Pensión IMSS está protegida (sin capa Órbita): no se audita ni se modifica.
const PROTEGIDAS = new Set(['/calculadoras/pension-imss']);
const routes = onlyRoutes.length ? onlyRoutes : [...readFileSync(join(DIST, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname).filter((route) => !PROTEGIDAS.has(route));

// ── Chrome por CDP ───────────────────────────────────────────────────────────
const profile = mkdtempSync(join(tmpdir(), 'milana-contraste-'));
const child = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const endpoint = await new Promise((resolve, reject) => {
  let stderr = '';
  const timer = setTimeout(() => reject(new Error('contraste: Chrome no inició')), 20000);
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
const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));

async function audit(sessionId, route, width) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 500 }, sessionId);
  await send('Page.navigate', { url: base + route }, sessionId);
  // Espera a que React monte (main sin data-static-seo) y a que Órbita termine de insertar sus bloques.
  for (let i = 0; i < 60; i++) {
    await sleep(100);
    const { result } = await send('Runtime.evaluate', { expression: `document.readyState === 'complete' && !!document.querySelector('main') && !document.querySelector('main[data-static-seo]')`, returnByValue: true }, sessionId);
    if (result.value) break;
  }
  await sleep(900);
  // Fuerza a render todo lo diferido por scroll/IntersectionObserver.
  await send('Runtime.evaluate', { expression: `document.documentElement.classList.add('ml-premium-motion-ready'); document.querySelectorAll('.ml-premium-reveal,[data-reveal]').forEach((n) => n.classList.add('ml-premium-in')); window.scrollTo(0, document.body.scrollHeight); window.scrollTo(0, 0);` }, sessionId);
  await send('Runtime.evaluate', { expression: `(() => { const s = document.createElement('style'); s.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}'; document.head.append(s); })()` }, sessionId);
  const { result: heightResult } = await send('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', returnByValue: true }, sessionId);
  await send('Emulation.setDeviceMetricsOverride', { width, height: Math.min(Math.max(heightResult.value, 900), 16000), deviceScaleFactor: 1, mobile: width < 500 }, sessionId);
  await sleep(300);
  const { result, exceptionDetails } = await send('Runtime.evaluate', { expression: `(${auditInPage.toString()})()`, returnByValue: true }, sessionId);
  if (exceptionDetails) throw new Error(`${route}@${width}: ${exceptionDetails.text} ${exceptionDetails.exception?.description || ''}`);
  return result.value;
}

const jobs = routes.flatMap((route) => VIEWPORTS.map((width) => ({ route, width })));
const failures = [];
async function worker() {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  for (let job = jobs.shift(); job; job = jobs.shift()) {
    try {
      const found = await audit(sessionId, job.route, job.width);
      for (const item of found) failures.push({ ...job, ...item });
    } catch (error) { failures.push({ ...job, text: String(error.message), ratio: 0, need: 0, el: 'error' }); }
  }
}
const total = jobs.length;
try { await Promise.all(Array.from({ length: CONCURRENCY }, worker)); }
finally {
  try { socket.close(); } catch {}
  child.kill('SIGKILL');
  server.close();
  await sleep(200);
  try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); } catch {}
}

const baseline = existsSync(new URL('./contraste-baseline.json', import.meta.url))
  ? new Set(JSON.parse(readFileSync(new URL('./contraste-baseline.json', import.meta.url), 'utf8')))
  : new Set();
const key = (f) => `${f.route}|${f.el}|${f.text}`;
const fresh = failures.filter((f) => !baseline.has(key(f)));
if (verbose || fresh.length) {
  for (const f of failures.sort((a, b) => a.route.localeCompare(b.route) || a.width - b.width)) {
    console.log(`${baseline.has(key(f)) ? '(base) ' : ''}${f.route} @${f.width} ${f.ratio}<${f.need} ${f.el} «${f.text}» fg ${f.color} bg ${f.bg} src ${f.src} par ${f.parent}`);
  }
}
console.log(`contraste: ${total} páginas/anchos auditados, ${failures.length} incumplimientos (${fresh.length} nuevos).`);
if (fresh.length) process.exit(1);
