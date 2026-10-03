import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'vite';

const candidates = [
  process.env.MILANA_CHROME,
  '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
].filter(Boolean);
const chrome = candidates.find((path) => existsSync(path));

function dumpDom(url) {
  return new Promise((resolve, reject) => {
    const child = spawn(chrome, ['--headless=new','--no-sandbox','--disable-gpu','--virtual-time-budget=2500','--dump-dom',url], { env: process.env });
    let stdout=''; let stderr='';
    const timer=setTimeout(() => { child.kill('SIGKILL'); reject(new Error(`Chromium timeout: ${stderr}`)); }, 15000);
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => { clearTimeout(timer); code === 0 ? resolve(stdout) : reject(new Error(`Chromium ${code}: ${stderr}`)); });
  });
}

test('navegador: el iframe soportado muestra formulario y Abrir completa', async (t) => {
  if (!chrome) return t.skip('Chrome/Chromium no instalado en el runner');
  const probe = spawnSync(chrome, ['--headless=new','--no-sandbox','--disable-gpu','--dump-dom','about:blank'], { encoding:'utf8', timeout:8000, env:process.env });
  if (probe.status !== 0) return t.skip('Chrome/Chromium no puede iniciar en este runner');
  const server = await createServer({ root:process.cwd(), server:{host:'127.0.0.1',port:0}, logLevel:'silent' });
  await server.listen();
  try {
    const port = server.httpServer.address().port;
    const html = await dumpDom(`http://127.0.0.1:${port}/calculadoras/aguinaldo?embed=1`);
    assert.match(html, /class="[^"]*calculator-main/);
    assert.match(html, /<form/);
    assert.match(html, /Abrir completa/);
    assert.doesNotMatch(html, /data-orbita-shell/);
  } finally { await server.close(); }
});
