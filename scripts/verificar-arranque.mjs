// QA del build real con Chrome/CDP: caché fría, respuesta tardía/fallida,
// fuentes bloqueadas, enlaces antes de React, reintento y Back/Forward Cache.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { renderDom } from '../tests/helpers/chrome-dom.mjs';

const chrome = [process.env.MILANA_CHROME, '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(existsSync);
if (!chrome) throw Error('Chrome requerido para verificar arranque');
const dist = resolve('dist');
const directory = '.qa/startup';
mkdirSync(directory, { recursive: true });
const manifest = JSON.parse(readFileSync(join(dist, '.vite/manifest.json'), 'utf8'));
const appFile = '/' + manifest['src/App.jsx'].file;
const entryFile = '/' + manifest['index.html'].file;
const report = { checkedOutSha: process.env.GITHUB_SHA || null, pullRequestHead: process.env.GITHUB_EVENT_PATH ? JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')).pull_request?.head?.sha : null, cases: [] };
const save = () => writeFileSync(join(directory, 'report.json'), JSON.stringify(report, null, 2) + '\n');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let mode = 'normal', release, requests = [];
let gate = Promise.resolve();
function setMode(next) { mode = next; requests = []; gate = new Promise(done => { release = done; }); }
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  requests.push({ pathname, at: Date.now() });
  if (pathname === '/startup-away') {
    res.setHeader('content-type', 'text/html'); res.end('<!doctype html><title>Otra página</title><h1>Otra página</h1><a href="/">Inicio</a>'); return;
  }
  if ((mode === 'entry-held' && pathname === entryFile) || (['app-held', 'legacy'].includes(mode) && pathname === appFile)) await gate;
  if (mode === 'failed' && pathname === appFile) { res.writeHead(503); res.end('Simulated module failure'); return; }
  let file = join(dist, pathname);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!file.startsWith(dist + '/') || !existsSync(file)) { res.writeHead(404); res.end(); return; }
  let content = readFileSync(file);
  if (mode === 'legacy' && pathname === '/') {
    // Reproducir el arranque anterior con la rama lazy conservada, sin afirmar
    // que esta demora controlada sea una medición de producción.
    content = content.toString().replace(/<div id="root">[\s\S]*?<\/div>\s*<script/, '<div id="root"><main data-static-seo="inicio"><h1>Calculadoras de sueldo</h1></main></div><script')
      .replace(/<link rel="modulepreload"[^>]*data-home-preload>/, '');
  }
  res.setHeader('content-type', mime[extname(file)] || 'application/octet-stream');
  res.setHeader('cache-control', extname(file) === '.html' ? 'no-cache' : 'public, max-age=3600');
  res.end(content);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;

const monitor = `(() => {
  window.__startup = { loadingSeen:false, blankAfterTitle:false, firstTitleMs:null, shifts:0, pageShows:[] };
  addEventListener('pageshow', e => window.__startup.pageShows.push(e.persisted));
  new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__startup.shifts += e.value; }).observe({type:'layout-shift', buffered:true});
  function frame() {
    const state=window.__startup, title=document.querySelector('#root h1');
    const visible=!!title && title.getClientRects().length && getComputedStyle(title).visibility !== 'hidden';
    if (visible && state.firstTitleMs === null) state.firstTitleMs=Math.round(performance.now());
    if (!visible && state.firstTitleMs !== null) state.blankAfterTitle=true;
    if (document.querySelector('.ml-route-loading')) state.loadingSeen=true;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})()`;
const readVisible = `(() => { const title=document.querySelector('#root h1'), link=document.querySelector('.orb-home-route'); return {
 title:title?.textContent, titleVisible:!!title && getComputedStyle(title).visibility!=='hidden' && !!title.getClientRects().length,
 titleTop:title?.getBoundingClientRect().top, linkTop:link?.getBoundingClientRect().top,
 static:!!document.querySelector('[data-startup-home]'), loading:!!document.querySelector('.ml-route-loading'),
 overflow:document.documentElement.scrollWidth>innerWidth+2, width:innerWidth,
 routeCount:document.querySelectorAll('.orb-home-route').length, monitor:window.__startup
}; })()`;
try {
  for (const testCase of [
    { name:'legacy-loader', mode:'legacy', width:390, delayed:true, legacy:true },
    { name:'before-entry', mode:'entry-held', width:390, delayed:true },
    { name:'slow-app', mode:'app-held', width:390, delayed:true, throttle:true },
    { name:'wide-mobile', mode:'app-held', width:414, delayed:true },
    { name:'desktop', mode:'app-held', width:1440, delayed:true },
    { name:'failure-retry', mode:'failed', width:390, failed:true },
    { name:'cache-back-forward', mode:'normal', width:390, history:true },
  ]) {
    setMode(testCase.mode);
    const result = { name:testCase.name, viewport:{width:testCase.width,height:testCase.width>600?1000:844}, screenshots:[] };
    report.cases.push(result); save();
    let early, earlyError;
    let evaluate, until, capture;
    await renderDom(chrome, origin + '/', {
      viewport: result.viewport, timeoutMs:120000, waitMs:20000,
      until:testCase.failed ? "!!document.querySelector('[data-startup-error]')" : "!!document.querySelector('#root .hero h1') && !document.querySelector('[data-startup-home],.ml-route-loading')",
      beforeNavigate: async (send, session) => {
        evaluate = async expression => {
          const value = await send('Runtime.evaluate', {expression, returnByValue:true, awaitPromise:true}, session);
          if (value.exceptionDetails) throw Error(value.exceptionDetails.exception?.description || value.exceptionDetails.text);
          return value.result.value;
        };
        until = async expression => {
          const end = Date.now()+25000;
          do { try { if (await evaluate(expression)) return; } catch (e) { if (!/context|navigat/i.test(e.message)) throw e; } await pause(75); } while (Date.now()<end);
          throw Error('No se alcanzó: '+expression);
        };
        capture = async name => {
          const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},session);
          const file=`${testCase.name}-${name}.png`; writeFileSync(join(directory,file),Buffer.from(data,'base64'));
          result.screenshots.push(file); save();
        };
        await send('Network.enable',{},session);
        await send('Network.setCacheDisabled',{cacheDisabled:!testCase.history},session);
        await send('Network.setBlockedURLs',{urls:['*://fonts.googleapis.com/*','*://fonts.gstatic.com/*','*://images.pexels.com/*','*://www.googletagmanager.com/*','*://pagead2.googlesyndication.com/*']},session);
        await send('Emulation.setDeviceMetricsOverride',{...result.viewport,deviceScaleFactor:1,mobile:testCase.width<600},session);
        if(testCase.throttle) {
          await send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:750000,uploadThroughput:250000,connectionType:'cellular4g'},session);
          await send('Emulation.setCPUThrottlingRate',{rate:4},session);
        }
        await send('Page.addScriptToEvaluateOnNewDocument',{source:monitor},session);
        if (testCase.delayed) early = (async () => {
          await until(testCase.legacy ? "!!document.querySelector('.ml-route-loading')" : "!!document.querySelector('[data-startup-home] h1') && getComputedStyle(document.querySelector('[data-startup-home] h1')).visibility !== 'hidden'");
          // Mantener el módulo detenido más que la espera observada en la captura.
          await pause(3200);
          result.before = await evaluate(readVisible);
          await capture('pending');
          if (testCase.legacy) assert.equal(result.before.loading,true,'Fixture anterior debe reproducir la pantalla de carga');
          else {
            assert.equal(result.before.titleVisible,true);
            assert.equal(result.before.static,true);
            assert.equal(result.before.loading,false);
            assert.equal(result.before.routeCount,6);
            assert.equal(result.before.overflow,false);
            await evaluate("document.querySelector('.orb-home-extra summary').click()");
            assert.equal(await evaluate("document.querySelector('.orb-home-extra').open"),true,'Desplegable nativo usable sin App');
            // Mantener abierta hasta que monte React: debe conservarse.
          }
        })().catch(e=>{ earlyError=e; }).finally(()=>release());
      },
      interact: async (send, session) => {
        await early; if(earlyError) throw earlyError;
        if(testCase.failed) {
          result.failed=await evaluate(readVisible);
          assert.equal(result.failed.titleVisible,true);
          assert.equal(result.failed.static,true);
          assert.equal(result.failed.loading,false);
          await capture('error');
          mode='normal';
          await evaluate("document.querySelector('[data-startup-error] button').click()");
          await until("!!document.querySelector('#root .hero h1') && !document.querySelector('[data-startup-home],.ml-route-loading,[data-startup-error]')");
          await capture('recovered');
        }
        await pause(750);
        result.after=await evaluate(readVisible);
        assert.equal(result.after.titleVisible,true);
        assert.equal(result.after.static,false);
        assert.equal(result.after.loading,false);
        assert.equal(result.after.overflow,false);
        if(!testCase.legacy) {
          assert.equal(result.after.monitor.loadingSeen,false,'No debe aparecer el loader ni por un frame');
          assert.equal(result.after.monitor.blankAfterTitle,false,'El título no puede desaparecer tras el primer pintado');
        }
        if(result.before && !testCase.legacy) {
          assert.equal(await evaluate("document.querySelector('.orb-home-extra').open"),true,'Conservar la apertura hecha antes de React');
          assert.ok(Math.abs(result.before.titleTop-result.after.titleTop)<=2,'El H1 no debe saltar al montar React');
          assert.ok(Math.abs(result.before.linkTop-result.after.linkTop)<=2,'Las opciones no deben saltar al montar React');
        }
        await capture('ready');
        if(testCase.history) {
          // Un enlace real usa la ruta del usuario; verificar también el regreso
          // a un documento restaurado, sin reiniciar el arranque.
          await send('Page.navigate',{url:origin+'/startup-away'},session);
          await until("location.pathname === '/startup-away' && !!document.querySelector('h1')");
          await evaluate('history.back()');
          await until("location.pathname === '/' && !!document.querySelector('.hero h1')");
          await pause(500);
          result.restored=await evaluate(readVisible);
          result.persisted=await evaluate('window.__startup.pageShows.at(-1)');
          assert.equal(result.restored.loading,false);
          assert.equal(result.restored.monitor.blankAfterTitle,false);
          assert.equal(result.persisted,true,'La prueba debe demostrar una restauración BFCache real');
          await capture('bfcache');
          await evaluate('history.forward()');
          await until("location.pathname === '/startup-away'");
          await evaluate('history.back()');
          await until("location.pathname === '/' && !!document.querySelector('.hero h1')");
          assert.equal(await evaluate("document.querySelectorAll('.hero h1').length"),1);
          assert.equal(await evaluate("!!document.querySelector('.ml-route-loading')"),false);
        }
        result.requests=requests; result.passed=true; save();
      },
    });
    console.log('arranque: '+testCase.name+' OK');
  }
} finally { release?.(); save(); await new Promise(resolve=>server.close(resolve)); }
console.log(`Arranque: ${report.cases.length} escenarios y capturas reales en ${directory}`);
