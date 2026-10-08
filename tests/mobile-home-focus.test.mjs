import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome=[process.env.MILANA_CHROME,'/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
const fixture='__mobile-home-proof';

test('portada progresiva: React y fallback conservan las seis rutas y búsqueda',()=>{
  const react=readFileSync('src/homeRoutes.jsx','utf8');
  const fallback=readFileSync('public/orbita-v3-experience.js','utf8');
  const style=readFileSync('public/orbita-v3-experience.css','utf8');
  const reserve=readFileSync('public/orbita-v3-prepaint.css','utf8');
  for(const source of [react,fallback]){
    for(const label of ['Me despidieron','Renuncié','Voy a cobrar aguinaldo','Quiero ahorrar','Estoy eligiendo carrera','Pienso mudarme de estado']) {
      assert.ok(source.includes(label),label);
    }
    assert.match(source,/orb-home-extra/);
    assert.match(source,/Ver otras 3 situaciones/);
    assert.match(source,/orb-home-search/);
  }
  assert.match(react,/<details className="orb-home-extra">/);
  assert.match(fallback,/document\.createElement\('details'\)/);
  assert.match(style,/\.orb-home-extra>summary:focus-visible/);
  assert.match(style,/\.orb-home-extra-grid\{display:grid/);
  assert.match(reserve,/max-width:620px\)\{html\.ml-orbita-enabled\[data-orbita-section="inicio"\] \.hero\{min-height:870px!important\}/);
  assert.doesNotMatch(reserve,/min-height:1172px!important/);
});

for(const width of [320,360,390,620]) test(`Chrome: home móvil ${width}px cabe en la reserva, muestra 3 rutas y abre las demás`,async t=>{
  if(!browserReady(t,chrome))return;
  mkdirSync(fixture,{recursive:true});
  writeFileSync(`${fixture}/index.html`, '<!doctype html><html lang="es-MX" class="ml-orbita-enabled" data-orbita-section="inicio"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/orbita-v3-base.css"><link rel="stylesheet" href="/orbita-v3-prepaint.css"><link rel="stylesheet" href="/orbita-v3-experience.css"></head><body><div id="root"></div><script type="module" src="/src/__mobile-home-proof.jsx"></script></body></html>');
  writeFileSync('src/__mobile-home-proof.jsx', "import React from 'react'; import { createRoot } from 'react-dom/client'; import App from './App.jsx'; createRoot(document.querySelector('#root')).render(<App />);");
  const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});
  await server.listen();
  try{
    const metricScript=`(() => {
      const hero=document.querySelector('.hero');
      const primary=[...document.querySelectorAll('.orb-home-route-grid > a')];
      const extra=document.querySelector('.orb-home-extra');
      const hiddenLinks=[...extra.querySelectorAll('.orb-home-extra-grid > a')];
      const metrics={
        width:innerWidth,
        heroHeight:Math.round(hero.getBoundingClientRect().height),
        reserve:parseFloat(getComputedStyle(hero).minHeight),
        allVisible:primary.length,
        moreCount:hiddenLinks.length,
        initiallyClosed:!extra.open,
        initiallyCollapsed:extra.getAttribute('open')===null,
        overflow:document.documentElement.scrollWidth > innerWidth+2
      };
      extra.querySelector('summary').click();
      metrics.expands=extra.open && getComputedStyle(extra.querySelector('.orb-home-extra-grid')).display!=='none';
      document.body.setAttribute('data-test-metrics',encodeURIComponent(JSON.stringify(metrics)));
      return true;
    })()`;
    const html=await renderDom(chrome,`http://127.0.0.1:${server.httpServer.address().port}/${fixture}/index.html`,{
      viewport:{width,height:850},waitMs:8000,
      until:"!!document.querySelector('.orb-home-extra') && !!document.querySelector('.orb-home-routes')",
      evaluate:metricScript,
    });
    const match=html.match(/data-test-metrics="([^"]+)"/);
    assert.ok(match,'La medición móvil no se insertó');
    const metrics=JSON.parse(decodeURIComponent(match[1]));
    assert.equal(metrics.width,width);
    assert.equal(metrics.allVisible,3);
    assert.equal(metrics.moreCount,3);
    assert.equal(metrics.initiallyClosed,true);
    assert.equal(metrics.initiallyCollapsed,true);
    assert.equal(metrics.expands,true);
    assert.equal(metrics.overflow,false,'Hay desbordamiento horizontal');
    assert.equal(metrics.reserve,870,'Reserva inicial distinta del diseño');
    assert.ok(metrics.heroHeight<=875,`El contenido mide ${metrics.heroHeight}px, rebasa la reserva 870px`);
  }finally{await server.close();rmSync(fixture,{recursive:true,force:true});rmSync('src/__mobile-home-proof.jsx',{force:true});}
});
