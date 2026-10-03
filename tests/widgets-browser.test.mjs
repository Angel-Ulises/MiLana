import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createServer } from 'vite';

const candidates = [
  process.env.MILANA_CHROME,
  '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
].filter(Boolean);

const chrome = candidates.find((path) => existsSync(path));

test('navegador: el iframe soportado muestra formulario y Abrir completa', async (t) => {
  if (!chrome) return t.skip('Chrome/Chromium no instalado en el runner');
  const probe = spawnSync(chrome, ['--headless=new','--no-sandbox','--disable-gpu','--dump-dom','about:blank'], { encoding:'utf8', timeout:8000 });
  if (probe.status !== 0) return t.skip('Chrome/Chromium no puede iniciar en este runner');
  const server = await createServer({ root:process.cwd(), server:{host:'127.0.0.1',port:0}, logLevel:'silent' });
  await server.listen();
  try {
    const port = server.httpServer.address().port;
    const url = `http://127.0.0.1:${port}/calculadoras/aguinaldo?embed=1`;
    const run = spawnSync(chrome, ['--headless=new','--no-sandbox','--disable-gpu','--virtual-time-budget=2500','--dump-dom',url], { encoding:'utf8', timeout:15000 });
    assert.equal(run.status, 0, run.stderr || 'Chromium terminó con error');
    assert.match(run.stdout, /class="[^"]*calculator-main/);
    assert.match(run.stdout, /<form/);
    assert.match(run.stdout, /Abrir completa/);
    assert.doesNotMatch(run.stdout, /data-orbita-shell/);
  } finally { await server.close(); }
});
