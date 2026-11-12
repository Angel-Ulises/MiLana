import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome=[process.env.MILANA_CHROME,'/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
const fixture='__mobile-home-proof';

test('portada progresiva: React y respaldo comparten todas las situaciones y la búsqueda',()=>{
  const react=readFileSync('src/homeRoutes.jsx','utf8');
  const fallback=readFileSync('public/orbita-v3-experience.js','utf8');
  const reserve=readFileSync('public/orbita-v3-prepaint.css','utf8');
  for(const source of [react,fallback]){
    for(const label of ['Voy a cobrar aguinaldo','Me despidieron','Renuncié o terminó mi trabajo','¿Cuánto me llega de sueldo?','¿Ya me puedo pensionar?','Quiero ahorrar']) {
      assert.ok(source.includes(label),label);
    }
    assert.match(source,/orb-home-route-grid-todas/);
    assert.match(source,/orb-home-search/);
    assert.doesNotMatch(source,/Ver otras 3 situaciones/);
  }
  assert.match(react,/ordenarPorTemporada\(RUTAS\)/);
  // Mejora 2026-11: sin foto, la portada no reserva altura fija; el HTML prerenderizado ya trae las situaciones.
  assert.match(reserve,/\[data-orbita-section="inicio"\] \.hero\{min-height:0!important;height:auto!important\}/);
});

for(const width of [320,360,390,620]) test(`Chrome: home móvil ${width}px muestra todas las situaciones sin desbordar`,async t=>{
  if(!browserReady(t,chrome))return;
  mkdirSync(fixture,{recursive:true});
  writeFileSync(`${fixture}/index.html`, '<!doctype html><html lang="es-MX" class="ml-orbita-enabled" data-orbita-section="inicio"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/orbita-v3-base.css"><link rel="stylesheet" href="/orbita-v3-prepaint.css"><link rel="stylesheet" href="/orbita-v3-experience.css"></head><body><div id="root"></div><script type="module" src="/src/__mobile-home-proof.jsx"></script></body></html>');
  writeFileSync('src/__mobile-home-proof.jsx', "import React from 'react'; import { createRoot } from 'react-dom/client'; import App from './App.jsx'; createRoot(document.querySelector('#root')).render(<App />);");
  const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});
  await server.listen();
  try{
    const metricScript=`(() => {
      const routes=[...document.querySelectorAll('.orb-home-route-grid-todas > a')];
      const metrics={
        width:innerWidth,
        total:routes.length,
        hidden:routes.filter((a)=>a.getBoundingClientRect().height===0).length,
        first:routes[0]?.getAttribute('href'),
        extra:Boolean(document.querySelector('.orb-home-extra')),
        img:document.querySelectorAll('.hero img').length,
        overflow:document.documentElement.scrollWidth > innerWidth+2
      };
      document.body.setAttribute('data-test-metrics',encodeURIComponent(JSON.stringify(metrics)));
      return true;
    })()`;
    const html=await renderDom(chrome,`http://127.0.0.1:${server.httpServer.address().port}/${fixture}/index.html`,{
      viewport:{width,height:850},waitMs:8000,
      until:"!!document.querySelector('.orb-home-route-grid-todas > a')",
      evaluate:metricScript,
    });
    const match=html.match(/data-test-metrics="([^"]+)"/);
    assert.ok(match,'La medición móvil no se insertó');
    const metrics=JSON.parse(decodeURIComponent(match[1]));
    assert.equal(metrics.width,width);
    assert.equal(metrics.total,11);
    assert.equal(metrics.hidden,0,'todas las situaciones visibles');
    assert.equal(metrics.extra,false,'sin desplegable de situaciones');
    assert.equal(metrics.img,0,'sin foto de stock en Inicio');
    assert.equal(metrics.overflow,false,'Hay desbordamiento horizontal');
  }finally{await server.close();rmSync(fixture,{recursive:true,force:true});rmSync('src/__mobile-home-proof.jsx',{force:true});}
});
