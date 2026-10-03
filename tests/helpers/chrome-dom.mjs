import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Carga `url` en Chrome real (con requestAnimationFrame funcionando, a diferencia de
// --virtual-time-budget), espera hasta `waitMs` (o hasta que `until` sea verdadero) y devuelve el DOM serializado.
export async function renderDom(chrome, url, { waitMs = 1500, until = null, timeoutMs = 20000 } = {}) {
  const profile = mkdtempSync(join(tmpdir(), 'milana-chrome-'));
  const child = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  let socket;
  const done = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Chromium timeout')), timeoutMs);
    child.on('error', reject);
    let stderr = '';
    child.stderr.on('data', async (chunk) => {
      stderr += chunk;
      const match = stderr.match(/DevTools listening on (ws:\/\/\S+)/);
      if (!match || socket) return;
      try {
        socket = new WebSocket(match[1]);
        let id = 0;
        const pending = new Map();
        const send = (method, params = {}, sessionId) => new Promise((ok, fail) => {
          const msgId = ++id;
          pending.set(msgId, { ok, fail });
          socket.send(JSON.stringify({ id: msgId, method, params, sessionId }));
        });
        socket.onmessage = (event) => {
          const message = JSON.parse(event.data);
          const entry = pending.get(message.id);
          if (!entry) return;
          pending.delete(message.id);
          message.error ? entry.fail(new Error(message.error.message)) : entry.ok(message.result);
        };
        await new Promise((ok, fail) => { socket.onopen = ok; socket.onerror = fail; });
        const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
        const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
        await send('Page.navigate', { url }, sessionId);
        const deadline = Date.now() + waitMs;
        while (Date.now() < deadline) {
          await new Promise((ok) => setTimeout(ok, 50));
          if (!until) continue;
          const probe = await send('Runtime.evaluate', { expression: until, returnByValue: true }, sessionId);
          if (probe.result.value) break;
        }
        const { result } = await send('Runtime.evaluate', { expression: 'document.documentElement.outerHTML', returnByValue: true }, sessionId);
        clearTimeout(timer);
        resolve(result.value);
      } catch (error) { clearTimeout(timer); reject(error); }
    });
  });
  try { return await done; }
  finally {
    try { socket?.close(); } catch {}
    const exited = new Promise((ok) => child.once('close', ok));
    child.kill('SIGKILL');
    await exited;
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); } catch {}
  }
}
