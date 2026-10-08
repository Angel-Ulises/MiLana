import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome=[process.env.MILANA_CHROME,'/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
const fixture='__career-state-tool-first';

const scenarios=[
 {name:'Ranking de carreras',path:'/carreras/mejor-pagadas',target:'#datos-carreras',type:'career'},
 {name:'Carreras por estado',path:'/carreras/por-estado',target:'#datos-carreras',type:'career'},
 {name:'Comparador de carreras',path:'/carreras/comparar',target:'#comparar',type:'compareCareer'},
 {name:'Comparador de estados',path:'/estados/comparar',target:'#comparar',type:'compareState'},
 {name:'Estados',path:'/estados',target:'.state-selector',type:'states'},
 {name:'Nuevo León',path:'/estados/nuevo-leon',target:'.state-selector',type:'states'},
];

for(const scenario of scenarios) test(`Chrome: ${scenario.name} permite usar datos antes de una pantalla de scroll`,async t=>{
  if(!browserReady(t,chrome))return;
  mkdirSync(fixture,{recursive:true});
  const path=scenario.path;
  const comp=scenario.type==='career'?"CareerPages":scenario.type==='compareCareer'?"CareerComparePage":scenario.type==='compareState'?"StateComparePage":"StatePages";
  const importPath={CareerPages:'careerPages',CareerComparePage:'careerComparePage',StateComparePage:'stateComparePage',StatePages:'statePages'}[comp];
  writeFileSync(`${fixture}/index.html`,'<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/src/__career-state-tool-first.jsx"></script></body></html>');
  writeFileSync('src/__career-state-tool-first.jsx',`import React from 'react';
import { createRoot } from 'react-dom/client';
import './design-home.css';
import './career-pages.css';
import './state-pages.css';
import './career-compare.css';
import './state-compare.css';
import './ecosystem-compact.css';
import './career-state-tool-first.css';
import Page from './${importPath}.jsx';
history.replaceState({},'',${JSON.stringify(path)});
createRoot(document.getElementById('root')).render(<Page/>);`);
  const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});
  await server.listen();
  try{
    const metric=`(() => {
      const target=document.querySelector(${JSON.stringify(scenario.target)});
      const hero=document.querySelector('.career-hero, .cc-hero, .sc-hero, .state-hero, .state-detail-hero');
      const link=hero?.querySelector('.ml-data-jump, .ml-mobile-data-jump');
      const img=hero?.querySelector('figure');
      const stateExtra=document.querySelector('.ml-state-directory-more');
      const r={
        top:Math.round(target?.getBoundingClientRect().top ?? -1),
        overflow:document.documentElement.scrollWidth>innerWidth+2,
        width:innerWidth,
        anchor:link?.getAttribute('href')||null,
        imageDisplay:img?getComputedStyle(img).display:null,
        title:hero?.querySelector('h1')?.textContent?.trim()||'',
        extraState:stateExtra?stateExtra.open:null,
        statesCount:stateExtra?.querySelectorAll('.state-grid>a').length||null
      };
      if(stateExtra){
        stateExtra.querySelector('summary').click();
        r.expandsState=stateExtra.open;
      }
      document.body.dataset.resultMetrics=encodeURIComponent(JSON.stringify(r));
      return true;
    })()`;
    const html=await renderDom(chrome,`http://127.0.0.1:${server.httpServer.address().port}/${fixture}/index.html`,{
      viewport:{width:390,height:850},waitMs:7200,
      until:`!!document.querySelector(${JSON.stringify(scenario.target)}) && !!document.querySelector('.site-header')`,
      evaluate:metric,
    });
    const match=html.match(/data-result-metrics="([^"]+)"/);
    assert.ok(match,'Chrome no pudo medir');
    const m=JSON.parse(decodeURIComponent(match[1]));
    assert.equal(m.width,390);
    assert.equal(m.overflow,false,'Desbordamiento horizontal');
    assert.ok(m.title.length>17,'No aparece título');
    assert.ok(m.top>0 && m.top<850,`La primera herramienta está muy abajo: ${m.top}px`);
    if(scenario.type==='career'){
      assert.equal(m.anchor,'#datos-carreras');
      assert.equal(m.imageDisplay,'none','Foto debe ceder el espacio a datos solo en móvil');
    }
    if(scenario.type==='compareCareer'||scenario.type==='compareState'){
      assert.equal(m.anchor,'#comparar');
    }
    if(scenario.name==='Estados'){
      assert.equal(m.extraState,false);
      assert.equal(m.statesCount,32);
      assert.equal(m.expandsState,true);
    }
  }finally{
    await server.close();
    rmSync(fixture,{recursive:true,force:true});
    rmSync('src/__career-state-tool-first.jsx',{force:true});
  }
});
