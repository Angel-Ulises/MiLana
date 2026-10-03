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
const fixtureDir = 'public/__orbita-race';
const fixturePath = `${fixtureDir}/index.html`;

function dumpDom(url) {
  return new Promise((resolve, reject) => {
    const child = spawn(chrome, ['--headless=new','--no-sandbox','--disable-gpu','--virtual-time-budget=2600','--dump-dom',url], { env: process.env });
    let stdout=''; let stderr='';
    const timer=setTimeout(() => { child.kill('SIGKILL'); reject(new Error(`Chromium timeout: ${stderr}`)); }, 15000);
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => { clearTimeout(timer); code === 0 ? resolve(stdout) : reject(new Error(`Chromium ${code}: ${stderr}`)); });
  });
}

function calculatorForm(kind) {
  const labels = {
    finiquito: ['Salario mensual', 'Vacaciones anuales de tu prestación'],
    isr: ['Ingreso mensual gravable', 'Salario mínimo general de tu zona'],
    aguinaldo: ['Salario mensual', 'Días de aguinaldo'],
    'bruto-a-neto': ['Salario bruto mensual', 'Periodo de pago'],
  }[kind];
  return `<main class="calculator-main"><form>
    <p class="calc-intro">Texto introductorio suficientemente largo para probar el asistente paso a paso después del reemplazo de React.</p>
    <label for="q1">${labels[0]}</label><input id="q1" value="10000">
    <label for="q2">${labels[1]}</label><input id="q2" value="15">
    <button class="ml-btn" type="submit">Calcular</button>
  </form></main>`;
}

function calculatorFixture(kind) {
  const live = JSON.stringify(calculatorForm(kind));
  return `<!doctype html><html class="ml-orbita-enabled" data-orbita-section="calculadoras"><head>
    <script defer src="/orbita-v3-internal.js"></script>
  </head><body><div id="root"><main data-static-seo="true"><h1>Calculadora prerenderizada</h1><p>Contenido SEO inicial sustituido por React.</p></main></div>
    <script>
      history.replaceState(null,'','/calculadoras/${kind}');
      setTimeout(() => { document.getElementById('root').innerHTML = ${live}; }, 300);
      const capture = () => {
        const count = document.querySelector('[data-orbita-calc-count]');
        const visible = !!count && count.isConnected && !count.hidden && getComputedStyle(count).display !== 'none' && getComputedStyle(count).visibility !== 'hidden';
        if (!visible || !count.textContent) return false;
        document.body.dataset.raceCount = count.textContent;
        document.body.dataset.raceVisible = 'true';
        return true;
      };
      const probe = new MutationObserver(() => { if (capture()) probe.disconnect(); });
      probe.observe(document.getElementById('root'), { childList:true, subtree:true });
      let attempts = 0;
      const poll = () => {
        if (capture() || ++attempts >= 30) return;
        setTimeout(poll, 50);
      };
      setTimeout(poll, 320);
    </script>
  </body></html>`;
}

const statesMain = `<main><section class="state-hero"><h1>Estados</h1></section><a href="/estados/nuevo-leon">Nuevo León</a><a href="/estados/jalisco">Jalisco</a><div data-orbita-visual-reserve></div></main>`;
const economyMain = `<main><section class="economy-hero"><h1>Economía</h1></section><article class="economy-card"><h2>Inflación</h2><div class="economy-card-bottom"><span>Inflación anual INEGI</span><strong>4.2%</strong></div></article><article class="economy-card"><h2>Tasa objetivo Banxico</h2><div class="economy-card-bottom"><span>Tasa objetivo</span><strong>7.5%</strong></div></article><div data-orbita-visual-reserve></div></main>`;
const savingsMain = `<main><section class="finance-page-hero"><h1>Ahorro</h1></section><label class="finance-field"><span>Meta total</span><input id="meta" value="0"></label><label class="finance-field"><span>Ahorro actual</span><input id="actual" value="0"></label><label class="finance-field"><span>Aportación mensual</span><input id="aportacion" value="0"></label><section class="finance-results"><article class="finance-result-card"><span>Tiempo estimado</span><strong>10 meses</strong></article><div class="finance-next-box"></div></section><div data-orbita-visual-reserve></div></main>`;

function visualFixture(mode) {
  const config = mode === 'estados'
    ? { section:'estados', path:'/estados', main:statesMain }
    : mode === 'economia'
      ? { section:'economia', path:'/economia', main:economyMain }
      : { section:'finanzas', path:'/finanzas/ahorro', main:savingsMain };
  const live = JSON.stringify(config.main);
  const after = mode === 'ahorro' ? `
    const meta=document.getElementById('meta'); const actual=document.getElementById('actual'); const aportacion=document.getElementById('aportacion');
    meta.value='100000'; actual.value='10000'; aportacion.value='9000'; aportacion.dispatchEvent(new Event('input',{bubbles:true}));` : '';
  return `<!doctype html><html class="ml-orbita-enabled" data-orbita-section="${config.section}"><head>
    <script defer src="/orbita-v3-visuals.js"></script>
  </head><body><div id="root">${config.main}</div><script>
    history.replaceState(null,'','${config.path}');
    setTimeout(() => { document.getElementById('root').innerHTML = ${live}; }, 35);
    setTimeout(() => { ${after} }, 120);
    const capture = () => {
      const visual=document.querySelector('[data-orbita-section-visual]');
      const chart=document.querySelector('[data-orbita-savings-result-chart]');
      document.body.dataset.visualConnected=String(!!visual && visual.isConnected);
      document.body.dataset.visualSection=visual?.getAttribute('data-orbita-section-visual') || '';
      document.body.dataset.savingsChart=String(!!chart && chart.isConnected);
      return !!visual && (location.pathname !== '/finanzas/ahorro' || !!chart);
    };
    const probe = new MutationObserver(() => { if (capture()) probe.disconnect(); });
    probe.observe(document.getElementById('root'), { childList:true, subtree:true });
    setTimeout(capture, 300);
  </script></body></html>`;
}

async function browserReady(t) {
  if (!chrome) { t.skip('Chrome/Chromium no instalado en el runner'); return false; }
  const probe = spawnSync(chrome, ['--headless=new','--no-sandbox','--disable-gpu','--dump-dom','about:blank'], { encoding:'utf8', timeout:8000, env:process.env });
  if (probe.status !== 0) { t.skip('Chrome/Chromium no puede iniciar en este runner'); return false; }
  return true;
}

async function withServer(t, fixtures, fn) {
  if (!await browserReady(t)) return;
  mkdirSync(fixtureDir, { recursive:true });
  for (const [name, html] of Object.entries(fixtures)) writeFileSync(`${fixtureDir}/${name}.html`, html);
  const server = await createServer({ root:process.cwd(), server:{host:'127.0.0.1',port:0}, logLevel:'silent' });
  await server.listen();
  try { return await fn(server.httpServer.address().port); }
  finally { await server.close(); rmSync(fixtureDir, { recursive:true, force:true }); }
}

test('navegador: las cuatro calculadoras conservan el asistente 10 de 10 tras reemplazar #root', async (t) => {
  const kinds = ['finiquito','isr','aguinaldo','bruto-a-neto'];
  const fixtures = Object.fromEntries(kinds.map((kind) => [`calc-${kind}`, calculatorFixture(kind)]));
  await withServer(t, fixtures, async (port) => {
    for (const kind of kinds) {
      for (let i=0; i<10; i++) {
        const html=await dumpDom(`http://127.0.0.1:${port}/__orbita-race/calc-${kind}.html?run=${i}`);
        assert.match(html, /data-race-visible="true"/, `${kind} carga ${i+1}: contador no visible`);
        assert.match(html, /data-race-count="Pregunta 1 de 2"/, `${kind} carga ${i+1}: asistente ausente`);
      }
    }
  });
});

test('navegador: Estados y Economía reinsertan su visual en el main vivo', async (t) => {
  const fixtures = { estados: visualFixture('estados'), economia: visualFixture('economia') };
  await withServer(t, fixtures, async (port) => {
    for (const mode of ['estados','economia']) {
      const html=await dumpDom(`http://127.0.0.1:${port}/__orbita-race/${mode}.html`);
      assert.match(html, /data-visual-connected="true"/);
      assert.match(html, new RegExp(`data-visual-section="${mode}"`));
    }
  });
});

test('navegador: ahorro vuelve a enlazar input/change al main vivo y dibuja la proyección real', async (t) => {
  await withServer(t, { ahorro: visualFixture('ahorro') }, async (port) => {
    const html=await dumpDom(`http://127.0.0.1:${port}/__orbita-race/ahorro.html`);
    assert.match(html, /data-visual-connected="true"/);
    assert.match(html, /data-savings-chart="true"/);
  });
});
