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
  // Capas sólidas bajo el texto; si hay degradado, imagen o un pseudo-elemento decorativo, el fondo se
  // mide después por muestreo de píxeles de una captura con el texto oculto (ver sampleInPage).
  const backdrop = (el, stack) => {
    const start = stack.findIndex((node) => node === el || el.contains(node));
    if (start < 0) return null; // tapado por otro elemento
    const layers = [];
    let source = null;
    for (const node of stack.slice(start)) {
      const cs = getComputedStyle(node);
      if (decorativePseudo(node) || cs.backgroundImage !== 'none') return { sample: true, source: node };
      const bg = parse(cs.backgroundColor);
      if (bg && bg.a > 0) { layers.push(bg); source = node; if (bg.a === 1) break; }
    }
    return { layers, source };
  };
  const flatten = (layers) => layers.reduceRight((acc, layer) => over(layer, acc), { r: 255, g: 255, b: 255, a: 1 });

  const out = [];
  const pending = [];
  const id = (e) => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
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
    if (!back) continue;
    if (el.closest(':disabled,[aria-disabled="true"]')) continue;
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    let opacity = 1;
    for (let p = el; p; p = p.parentElement) opacity *= parseFloat(getComputedStyle(p).opacity);
    if (back.sample) {
      el.setAttribute('data-cs', String(pending.length));
      el.setAttribute('data-cs-ni', String([...el.childNodes].indexOf(node)));
      pending.push({ ni: [...el.childNodes].indexOf(node), text: text.slice(0, 50), x: rect.left + scrollX, y: rect.top + scrollY, w: rect.width, h: rect.height, fg: { ...fg, a: fg.a * opacity }, need, el: id(el), parent: el.parentElement ? id(el.parentElement) : '', src: back.source ? id(back.source) : '', color: cs.color });
      continue;
    }
    const bg = flatten(back.layers);
    const worst = ratio(over({ ...fg, a: fg.a * opacity }, bg), bg);
    if (worst < need) {
      out.push({ text: text.slice(0, 50), ratio: Math.round(worst * 100) / 100, need, el: id(el), parent: el.parentElement ? id(el.parentElement) : '', src: back.source ? id(back.source) : '', color: cs.color, bg: `rgb(${[bg.r, bg.g, bg.b].map(Math.round)})` });
    }
  }
  return { out, pending };
}

// Vuelve a ubicar cada texto pendiente (con el viewport normal) por su marca data-cs.
function locateInPage(count) {
  const found = {};
  for (let k = 0; k < count; k++) {
    const el = document.querySelector(`[data-cs="${k}"]`);
    if (!el) continue;
    const node = el.childNodes[Number(el.dataset.csNi)];
    if (!node) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const r = range.getBoundingClientRect();
    found[k] = { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
  }
  return found;
}

// Muestrea la captura (texto oculto) bajo cada texto pendiente y mide el peor contraste.
async function sampleInPage(dataUrl, pending) {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0);
  const lum = (r, g, b) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const fails = [];
  for (const item of pending) {
    if (item.y + item.h > canvas.height || item.x + item.w > canvas.width + 1) continue; // fuera de la captura (página > 16384px)
    const cols = 10;
    const rows = 3;
    let worst = Infinity;
    let worstBg = '';
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const px = Math.min(canvas.width - 1, Math.max(0, Math.round(item.x + (item.w * (i + 0.5)) / cols)));
        const py = Math.min(canvas.height - 1, Math.max(0, Math.round(item.y + (item.h * (j + 0.5)) / rows)));
        const [r, g, b] = ctx.getImageData(px, py, 1, 1).data;
        const mix = (t, base) => t * item.fg.a + base * (1 - item.fg.a);
        const L1 = lum(mix(item.fg.r, r), mix(item.fg.g, g), mix(item.fg.b, b));
        const L2 = lum(r, g, b);
        const c = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        if (c < worst) { worst = c; worstBg = `rgb(${r},${g},${b})`; }
      }
    }
    if (worst < item.need) fails.push({ text: item.text, ratio: Math.round(worst * 100) / 100, need: item.need, el: item.el, parent: item.parent, src: item.src, color: item.color, bg: worstBg + ' (muestreo)' });
  }
  return fails;
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
  const VIEW_H = 900;
  const evaluar = async (expression, extra = {}) => {
    const { result, exceptionDetails } = await send('Runtime.evaluate', { expression, returnByValue: true, ...extra }, sessionId);
    if (exceptionDetails) throw new Error(`${route}@${width}: ${exceptionDetails.text} ${exceptionDetails.exception?.description || ''}`);
    return result.value;
  };
  await send('Page.bringToFront', {}, sessionId);
  await send('Emulation.setScrollbarsHidden', { hidden: true }, sessionId);
  await send('Emulation.setDeviceMetricsOverride', { width, height: VIEW_H, deviceScaleFactor: 1, mobile: false }, sessionId);
  await send('Page.navigate', { url: base + route }, sessionId);
  // Espera a que React monte (main sin data-static-seo) y a que Órbita termine de insertar sus bloques.
  for (let i = 0; i < 60; i++) {
    await sleep(100);
    if (await evaluar(`document.readyState === 'complete' && !!document.querySelector('main') && !document.querySelector('main[data-static-seo]')`)) break;
  }
  await sleep(900);
  // Sin animaciones, con todo lo diferido visible y recorriendo la página para que monte lo perezoso.
  await evaluar(`(() => { const s = document.createElement('style'); s.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;content-visibility:visible!important}'; document.head.append(s); document.documentElement.classList.add('ml-premium-motion-ready'); document.querySelectorAll('.ml-premium-reveal,[data-reveal]').forEach((n) => n.classList.add('ml-premium-in')); })()`);
  const alturaInicial = await evaluar('document.documentElement.scrollHeight');
  for (let y = 0; y < Math.min(alturaInicial, 20000); y += 600) { await evaluar(`window.scrollTo({ top: ${y}, behavior: 'instant' })`); await sleep(40); }
  await evaluar("window.scrollTo({ top: 0, behavior: 'instant' })");
  await sleep(300);
  // Medición con el viewport tan alto como la página (así todo es "visible" para elementsFromPoint).
  const alto = Math.min(Math.max(await evaluar('document.documentElement.scrollHeight'), VIEW_H), 16384);
  await send('Emulation.setDeviceMetricsOverride', { width, height: alto, deviceScaleFactor: 1, mobile: false }, sessionId);
  await sleep(300);
  const { out, pending } = await evaluar(`(${auditInPage.toString()})()`);
  await send('Emulation.setDeviceMetricsOverride', { width, height: VIEW_H, deviceScaleFactor: 1, mobile: false }, sessionId);
  await sleep(300);
  if (!pending.length) return out;
  const ubicaciones = await evaluar(`(${locateInPage.toString()})(${pending.length})`);
  pending.forEach((item, k) => { if (ubicaciones[k]) Object.assign(item, ubicaciones[k]); else item.perdido = true; });
  // Capturas con el texto oculto, ventana por ventana (como un usuario que hace scroll), para leer el fondo real
  // (degradados, imágenes, pseudo-elementos) y muestrear píxeles bajo cada texto.
  await evaluar(`(() => { const s = document.createElement('style'); s.id = '__contraste-oculta'; s.textContent = '*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}'; document.head.append(s); })()`);
  const pageH = await evaluar('document.documentElement.scrollHeight');
  const HEADER = 110;
  const STEP = VIEW_H - HEADER - 100;
  const fails = [];
  const done = new Set();
  for (let y0 = 0; y0 < pageH; y0 += STEP) {
    const ventana = [];
    pending.forEach((item, index) => {
      if (done.has(index) || item.perdido) return;
      const top = item.y - y0;
      if (top >= (y0 === 0 ? 0 : HEADER) && top + item.h <= VIEW_H) { ventana.push({ ...item, x: item.x, y: top }); done.add(index); }
    });
    if (!ventana.length) continue;
    await evaluar(`window.scrollTo({ top: ${y0}, behavior: 'instant' })`);
    await sleep(250);
    const real = await evaluar('window.scrollY');
    const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
    const ajustados = ventana.map((item) => ({ ...item, y: item.y + y0 - real }));
    const sampled = await send('Runtime.evaluate', { expression: `(${sampleInPage.toString()})(${JSON.stringify('data:image/png;base64,' + shot.data)}, ${JSON.stringify(ajustados)})`, awaitPromise: true, returnByValue: true }, sessionId);
    if (sampled.exceptionDetails) throw new Error(`${route}@${width}: muestreo ${sampled.exceptionDetails.text} ${sampled.exceptionDetails.exception?.description || ''}`);
    fails.push(...sampled.result.value);
  }
  await evaluar(`document.getElementById('__contraste-oculta')?.remove()`);
  return [...out, ...fails];
}

const jobs = routes.flatMap((route) => VIEWPORTS.map((width) => ({ route, width })));
const failures = [];
async function worker() {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank', newWindow: true });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  // Sin fuentes remotas: el layout no cambia entre la medición y la captura y no depende de la red.
  await send('Network.enable', {}, sessionId);
  await send('Network.setBlockedURLs', { urls: ['*fonts.googleapis.com*', '*fonts.gstatic.com*'] }, sessionId);
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
