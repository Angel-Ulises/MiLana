import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome=[process.env.MILANA_CHROME,'/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
const dir='__finance-tool-first';

const cases=[
  {page:'/finanzas/presupuesto',width:320},
  {page:'/finanzas/presupuesto',width:390},
  {page:'/finanzas/fondo-emergencia',width:390},
  {page:'/finanzas/deuda-y-credito',width:390},
  {page:'/finanzas/ahorro',width:390},
  {page:'/finanzas/mi-situacion',width:320},
  {page:'/finanzas/mi-situacion',width:390},
  {page:'/finanzas/presupuesto',width:1280,desktop:true},
];

for(const item of cases) test(`Chrome: entrada directa ${item.page} a ${item.width}px`,async t=>{
  if(!browserReady(t,chrome))return;
  mkdirSync(dir,{recursive:true});
  writeFileSync(`${dir}/index.html`, '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/src/__finance-tool-first.jsx"></script></body></html>');
  writeFileSync('src/__finance-tool-first.jsx', `import React from 'react';
import { createRoot } from 'react-dom/client';
import './design-home.css';
import './finance-pages.css';
import './advisor-page.css';
import './finance-tool-first.css';
import FinancePages from './financePages.jsx';
import AdvisorPage from './advisorPage.jsx';
history.replaceState({},'',${JSON.stringify(item.page)});
createRoot(document.getElementById('root')).render(${item.page.endsWith('mi-situacion')?'<AdvisorPage />':'<FinancePages />'});`);
  const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});
  await server.listen();
  try{
    const isAdvisor=item.page.endsWith('mi-situacion');
    const selector=isAdvisor?'.advisor-form[id="mi-situacion-datos"]':'.finance-tool-section[id="mis-numeros"]';
    const anchor=isAdvisor?'#mi-situacion-datos':'#mis-numeros';
    const measure=`(() => {
      const hero=document.querySelector('${isAdvisor?'.advisor-hero':'.finance-page-hero-tool'}');
      const target=document.querySelector('${selector}');
      const link=document.querySelector('.finance-start-link');
      const photo=document.querySelector('.finance-page-photo');
      const data={
        width:innerWidth,
        hasHero:!!hero,
        anchor:link?.getAttribute('href'),
        target:!!target,
        firstFieldTop:Math.round(document.querySelector('${isAdvisor?'.advisor-field input':'.finance-field input'}')?.getBoundingClientRect().top||0),
        photoDisplay:photo?getComputedStyle(photo).display:null,
        overflow:document.documentElement.scrollWidth > innerWidth+2,
        heading:hero?.querySelector('h1')?.textContent?.trim()||''
      };
      document.body.dataset.uiMetrics=encodeURIComponent(JSON.stringify(data));
      return true;
    })()`;
    const html=await renderDom(chrome,`http://127.0.0.1:${server.httpServer.address().port}/${dir}/index.html`,{
      viewport:{width:item.width,height:850},
      waitMs:6500,
      until:`!!document.querySelector('${selector}') && !!document.querySelector('.finance-start-link')`,
      evaluate:measure,
    });
    const match=html.match(/data-ui-metrics="([^"]+)"/);
    assert.ok(match,'Chrome no generó la medición');
    const r=JSON.parse(decodeURIComponent(match[1]));
    assert.equal(r.width,item.width);
    assert.equal(r.hasHero,true);
    assert.equal(r.anchor,anchor);
    assert.equal(r.target,true);
    assert.ok(r.heading.length>15);
    assert.equal(r.overflow,false,'El diseño desborda horizontalmente');
    if(!item.desktop){
      if(!isAdvisor)assert.equal(r.photoDisplay,'none','La foto repetida tapa el formulario');
      assert.ok(r.firstFieldTop>0 && r.firstFieldTop<780,`El primer campo queda demasiado abajo: ${r.firstFieldTop}px`);
    }else{
      assert.notEqual(r.photoDisplay,'none','La foto editorial debe conservarse en escritorio');
    }
  }finally{
    await server.close();
    rmSync(dir,{recursive:true,force:true});
    rmSync('src/__finance-tool-first.jsx',{force:true});
  }
});
