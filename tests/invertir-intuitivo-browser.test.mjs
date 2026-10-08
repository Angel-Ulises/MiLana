import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome = [process.env.MILANA_CHROME, '/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);

test('Chrome Android: invertir permite explorar por nivel e instrumento, con simulación visible',async(t)=>{
  if(!browserReady(t,chrome))return;
  const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});
  await server.listen();
  try {
    const url='http://127.0.0.1:'+server.httpServer.address().port+'/invertir';
    const metrics = [
      '(() => {',
      "const level=[...document.querySelectorAll('.ml-inv-level button')];",
      "const assets=[...document.querySelectorAll('.ml-inv-instruments button')];",
      "level.find(b=>b.textContent.includes('profundizar'))?.click();",
      "assets.find(b=>b.textContent.includes('ETF'))?.click();",
      'const r={',
      "title:document.querySelector('.ml-inv-hero h1')?.textContent||'',",
      'levelCount:level.length,assetCount:assets.length,',
      "outcomes:document.querySelectorAll('.ml-inv-bar-row').length,",
      "differences:document.querySelectorAll('.ml-inv-bar-row small').length,",
      "selectedLevels:document.querySelectorAll('.ml-inv-level button[aria-pressed=\"true\"]').length,",
      "selectedAssets:document.querySelectorAll('.ml-inv-instruments button[aria-pressed=\"true\"]').length,",
      'overflow:document.documentElement.scrollWidth>innerWidth+2,width:innerWidth,',
      "sourceLink:!!document.querySelector('.ml-inv-more a[href^=\"https://\"]')",
      '};document.body.dataset.mlInvestResult=encodeURIComponent(JSON.stringify(r));',
      '})()'
    ].join('\n');
    const html=await renderDom(chrome,url,{viewport:{width:390,height:844},waitMs:8000,timeoutMs:23000,until:"document.querySelectorAll('.ml-inv-bar-row').length===3 && document.querySelectorAll('.ml-inv-instruments button').length===4",evaluate:metrics});
    const match=html.match(/data-ml-invest-result="([^"]+)"/);
    assert.ok(match,'El navegador no produjo métricas');
    const r=JSON.parse(decodeURIComponent(match[1]));
    assert.ok(r.title.length>25);
    assert.equal(r.levelCount,3);
    assert.equal(r.assetCount,4);
    assert.equal(r.outcomes,3);
    assert.equal(r.differences,3);
    assert.equal(r.selectedLevels,1);
    assert.equal(r.selectedAssets,1);
    assert.equal(r.overflow,false,'Hay desplazamiento horizontal');
    assert.equal(r.width,390);
    assert.equal(r.sourceLink,true,'Las fuentes oficiales deben permanecer disponibles al profundizar');
  }finally{await server.close();}
});