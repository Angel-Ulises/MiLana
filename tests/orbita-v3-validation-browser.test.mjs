import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'vite';

const candidates = [
  process.env.MILANA_CHROME,
  '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
].filter(Boolean);
const chrome = candidates.find((path) => existsSync(path));
const fixtureDir = 'public/__orbita-validation';
const fixturePath = `${fixtureDir}/index.html`;

function dumpDom(url) {
  return new Promise((resolve, reject) => {
    const child = spawn(chrome, ['--headless=new','--no-sandbox','--disable-gpu','--virtual-time-budget=1800','--dump-dom',url], { env: process.env });
    let stdout=''; let stderr='';
    const timer=setTimeout(() => { child.kill('SIGKILL'); reject(new Error(`Chromium timeout: ${stderr}`)); }, 15000);
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => { clearTimeout(timer); code === 0 ? resolve(stdout) : reject(new Error(`Chromium ${code}: ${stderr}`)); });
  });
}
function aguinaldoFixture() {
  const field = (id, label, type) => `<label for="${id}">${label}</label><input id="${id}" type="${type}" step="any" aria-invalid="true">`;
  return `<!doctype html><html class="ml-orbita-enabled"><body>
    <main class="calculator-main"><form>
      <p class="calc-intro">Intro suficientemente larga para aguinaldo dentro de una prueba de navegador.</p>
      ${field('salario', 'Salario mensual fijo (MXN)', 'number')}
      ${field('dias', 'Días de aguinaldo que te corresponden', 'number')}
      ${field('ingreso', 'Fecha de ingreso', 'date')}
      ${field('salida', 'Último día trabajado en 2026', 'date')}
      <p role="alert"></p><button class="ml-btn" type="submit">Calcular aguinaldo</button>
    </form></main>
    <script>history.replaceState(null,'','/calculadoras/aguinaldo');</script>
    <script src="/orbita-v3-internal.js"></script>
    <script>
      addEventListener('load', () => setTimeout(() => {
        const form = document.querySelector('form');
        document.getElementById('dias').value = '15';
        document.getElementById('ingreso').value = '2026-01-01';
        document.getElementById('salida').value = '2026-12-31';
        form.addEventListener('submit', (event) => {
          event.preventDefault();
          form.querySelector('[role="alert"]').textContent = 'Captura un importe positivo con un máximo de dos decimales.';
        });
        // Se salta al último paso para comprobar que la validación regresa a la Pregunta 1.
        document.querySelector('[data-orbita-calc-next]').click();
        document.querySelector('[data-orbita-calc-next]').click();
        document.querySelector('[data-orbita-calc-next]').click();
        form.querySelector('button[type="submit"]').click();
        setTimeout(() => {
          document.body.dataset.count = document.querySelector('[data-orbita-calc-count]')?.textContent || '';
          document.body.dataset.targetHidden = document.getElementById('salario').getAttribute('aria-hidden') || '';
          document.body.dataset.targetNativeHidden = String(document.getElementById('salario').hidden);
        }, 120);
      }, 80));
    </script>
  </body></html>`;
}

function fixtureHtml(kind) {
  if (kind === 'aguinaldo') return aguinaldoFixture();
  const isISR = kind === 'isr';
  const form = isISR ? `
    <form><p>Intro suficientemente larga para la calculadora de ISR en una prueba de navegador.</p>
      <label for="ingreso">Ingreso mensual gravable para ISR (MXN)</label><input id="ingreso">
      <label for="periodo">Mes completo de 2026</label><select id="periodo"><option>Septiembre</option></select>
      <label for="isr-minimo">¿En este mes percibiste únicamente el salario mínimo general de tu zona?</label><select id="isr-minimo"><option value="">Selecciona</option></select>
      <label><input id="confirmado" type="checkbox"> Confirmo que es un mes completo ordinario con un solo empleador.</label>
      <p role="alert"></p><button class="ml-btn" type="submit">Calcular ISR</button>
    </form>` : `
    <form><p class="calc-intro">Intro suficientemente larga para finiquito dentro de una prueba de navegador.</p>
      <label for="vac-pend">Vacaciones pendientes ya adquiridas (días)</label><input id="vac-pend">
      <label for="vac-anuales">Vacaciones anuales de tu prestación (opcional)</label><input id="vac-anuales">
      <p role="alert" class="calc-error"></p><button class="ml-btn" type="submit">Calcular finiquito</button>
    </form>`;
  const message = isISR
    ? 'Indica si percibiste únicamente el salario mínimo general de tu zona.'
    : 'Días anuales de vacaciones: revisa el valor capturado.';
  const target = isISR ? 'isr-minimo' : 'vac-anuales';
  return `<!doctype html><html class="ml-orbita-enabled"><body>
    <main class="calculator-main">${form}</main>
    <script>history.replaceState(null,'','/calculadoras/${kind}');</script>
    <script src="/orbita-v3-internal.js"></script>
    <script>
      addEventListener('load', () => setTimeout(() => {
        const form = document.querySelector('form');
        form.addEventListener('submit', (event) => {
          event.preventDefault();
          form.querySelector('[role="alert"]').textContent = ${JSON.stringify(message)};
        });
        form.querySelector('button[type="submit"]').click();
        setTimeout(() => {
          const target = document.getElementById(${JSON.stringify(target)});
          document.body.dataset.targetHidden = target.getAttribute('aria-hidden') || '';
          document.body.dataset.targetNativeHidden = String(target.hidden);
          document.body.dataset.count = document.querySelector('[data-orbita-calc-count]')?.textContent || '';
        }, 120);
      }, 80));
    </script>
  </body></html>`;
}

async function runCase(t, kind) {
  if (!chrome) return t.skip('Chrome/Chromium no instalado en el runner');
  const probe = spawnSync(chrome, ['--headless=new','--no-sandbox','--disable-gpu','--dump-dom','about:blank'], { encoding:'utf8', timeout:8000, env:process.env });
  if (probe.status !== 0) return t.skip('Chrome/Chromium no puede iniciar en este runner');
  mkdirSync(fixtureDir, { recursive:true });
  writeFileSync(fixturePath, fixtureHtml(kind));
  const server = await createServer({ root:process.cwd(), server:{host:'127.0.0.1',port:0}, logLevel:'silent' });
  await server.listen();
  try {
    const port = server.httpServer.address().port;
    const html = await dumpDom(`http://127.0.0.1:${port}/__orbita-validation/index.html`);
    assert.match(html, /data-target-hidden="false"/);
    assert.match(html, /data-target-native-hidden="false"/);
    return html;
  } finally {
    await server.close();
    rmSync(fixtureDir, { recursive:true, force:true });
  }
}

test('navegador: ISR vuelve a la pregunta de salario mínimo cuando el alert no usa calc-error', async (t) => {
  const html = await runCase(t, 'isr');
  if (!html) return;
  assert.match(html, /data-count="Pregunta 3 de 4"/);
});

test('navegador: finiquito prioriza vacaciones anuales sobre vacaciones pendientes', async (t) => {
  const html = await runCase(t, 'finiquito');
  if (!html) return;
  assert.match(html, /data-count="Pregunta 2 de 2"/);
});

test('navegador: aguinaldo sin salario vuelve a la Pregunta 1', async (t) => {
  const html = await runCase(t, 'aguinaldo');
  if (!html) return;
  assert.match(html, /data-count="Pregunta 1 de 4"/);
});
