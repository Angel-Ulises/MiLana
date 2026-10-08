import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { navigateAndWait } from './chrome-page.mjs';

// Carga `url` en Chrome real (con requestAnimationFrame funcionando, a diferencia de
// --virtual-time-budget), espera hasta `waitMs` (o hasta que `until` sea verdadero) y devuelve el DOM serializado.
export async function renderDom(chrome, url, { waitMs = 1500, until = null, timeoutMs = 20000, viewport = null, evaluate = null } = {}) {
  const profile = mkdtempSync(join(tmpdir(), 'milana-chrome-'));
  const ownGroup = process.platform === 'linux';
  const child = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'], detached: ownGroup });
  const exited = new Promise((resolve) => child.once('close', resolve));
  let socket;
  let timer;
  const done = new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`Chromium timeout (${url}): ${stderr.slice(-2000)}`)), timeoutMs);
    child.on('error', reject);
    let stderr = '';
    child.stderr.on('data', async (chunk) => {
      stderr += chunk;
      const match = stderr.match(/DevTools listening on (ws:\/\/\S+)/);
      if (!match || socket) return;
      try {
        socket = new WebSocket(match[1]);
        let id = 0;
        let pageSession;
        let resolvePageLoad;
        const pending = new Map();
        const send = (method, params = {}, sessionId) => new Promise((ok, fail) => {
          const msgId = ++id;
          pending.set(msgId, { ok, fail });
          socket.send(JSON.stringify({ id: msgId, method, params, sessionId }));
        });
        socket.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.method === 'Page.loadEventFired' && message.sessionId === pageSession) {
            resolvePageLoad?.();
          }
          const entry = pending.get(message.id);
          if (!entry) return;
          pending.delete(message.id);
          message.error ? entry.fail(new Error(message.error.message)) : entry.ok(message.result);
        };
        await new Promise((ok, fail) => { socket.onopen = ok; socket.onerror = fail; });
        const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
        const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
        pageSession = sessionId;
        if (viewport) await send('Emulation.setDeviceMetricsOverride', { width: viewport.width, height: viewport.height, deviceScaleFactor:1, mobile:true }, sessionId);
        await navigateAndWait(send, sessionId, url, {
          waitMs, until,
          waitForLoad: () => new Promise((resolve) => { resolvePageLoad = resolve; }),
        });
        if (evaluate) {
          const measurement = await send('Runtime.evaluate', { expression:evaluate, returnByValue:true }, sessionId);
          if (measurement.exceptionDetails) throw new Error(`Chrome metric evaluation failed: ${measurement.exceptionDetails.text}`);
        }
        const { result } = await send('Runtime.evaluate', { expression: 'document.documentElement.outerHTML', returnByValue: true }, sessionId);
        clearTimeout(timer);
        resolve(result.value);
      } catch (error) { clearTimeout(timer); reject(error); }
    });
  });
  try { return await done; }
  finally {
    clearTimeout(timer);
    try { socket?.close(); } catch {}
    try {
      if (ownGroup && child.pid) process.kill(-child.pid, 'SIGKILL');
      else child.kill('SIGKILL');
    } catch (error) { if (error.code !== 'ESRCH') throw error; }
    await exited;
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); } catch {}
  }
}
