// Cold-load CLS guard for the home proposal. Real fonts/images, 390/1280px.
// Slow case adds 3s latency to every request (including fonts and images); it
// does not claim to isolate individual resource types or emulate a real phone.
import { mkdirSync, writeFileSync } from 'node:fs';
import { abrirChrome, encontrarChrome, servirDist, sleep } from './lib/navegador.mjs';
const chrome = encontrarChrome();
if (!chrome) throw new Error('home CLS: Chrome required; no silent skip');
const server = await servirDist();
let browser;
const results = [];
const init = `(() => {
  window.__homeLayoutShifts = [];
  new PerformanceObserver(list => {
    for (const entry of list.getEntries()) if (!entry.hadRecentInput) {
      window.__homeLayoutShifts.push({value:entry.value,time:entry.startTime,
        sources:entry.sources.map(s=>s.node?.className || s.node?.nodeName || '')});
    }
  }).observe({type:'layout-shift',buffered:true});
})();`;
try {
  browser = await abrirChrome(chrome);
  for (const width of [390,1280]) for (const latency of [0,3000]) {
    const tab = await browser.nuevaPestana();
    // The shared reservation helper blocks fonts/photos by default. This test
    // explicitly allows them and verifies they loaded, rather than testing fallback only.
    await tab.send('Network.setBlockedURLs',{urls:[]});
    await tab.send('Network.setCacheDisabled',{cacheDisabled:true});
    await tab.send('Network.emulateNetworkConditions',{offline:false,latency,downloadThroughput:10000000,uploadThroughput:10000000});
    await tab.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
    await tab.send('Page.addScriptToEvaluateOnNewDocument',{source:init});
    await tab.send('Page.navigate',{url:server.base+'/'});
    let ready = false;
    for(let i=0;i<600;i++) {
      await sleep(100);
      ready=await tab.evaluar(`document.readyState==='complete' && !!document.querySelector('.ml-home-shortcuts') && document.fonts.status==='loaded' && Array.from(document.fonts).some(f=>f.family.replaceAll('"','')==='Newsreader' && f.status==='loaded') && !!document.querySelector('.hero-media img')?.naturalWidth`);
      if(ready) break;
    }
    await sleep(3500);
    const result=await tab.evaluar(`(() => {
      const shifts=window.__homeLayoutShifts||[];
      let max=0,sum=0,start=0,last=0;
      for(const s of shifts){if(s.time-last>1000 || s.time-start>5000){sum=0;start=s.time}sum+=s.value;max=Math.max(max,sum);last=s.time}
      return {cls:max,shifts,fontsStatus:document.fonts.status,newsreaderLoaded:Array.from(document.fonts).some(f=>f.family.replaceAll('"','')==='Newsreader'&&f.status==='loaded'),photoLoaded:!!document.querySelector('.hero-media img')?.naturalWidth,overflow:document.documentElement.scrollWidth>innerWidth,titleFont:getComputedStyle(document.querySelector('h1')).fontFamily};
    })()`);
    const row={width,latency,ready,...result};results.push(row);
    console.log('home CLS',JSON.stringify(row));
  }
} finally {
  mkdirSync('qa-results',{recursive:true});
  writeFileSync('qa-results/home-cls.json',JSON.stringify(results,null,2));
  if(browser) await browser.cerrar();
  server.close();
}
const failures=results.filter(r=>!r.ready||!r.newsreaderLoaded||!r.photoLoaded||r.overflow||r.cls>=0.1);
if(results.length!==4||failures.length) throw new Error(`home CLS: ${failures.length} failures; see qa-results/home-cls.json (threshold <0.1)`);
console.log('home CLS: all 4 cold-load cases pass; delayed network includes fonts/images');
