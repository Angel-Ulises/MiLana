import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { browserReady } from './helpers/chrome-probe.mjs';
import { renderDom } from './helpers/chrome-dom.mjs';

const chrome=[process.env.MILANA_CHROME,'/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
const dir='__occupation-profession-test';
const scenarios=[
 {page:'profesion',path:'/carreras/profesion/medicina',width:390,linked:true},
 {page:'profesion',path:'/carreras/profesion/finanzas-banca-seguros',width:390,linked:false},
 {page:'profesion',path:'/carreras/profesion/medicina',width:1280,linked:true,desktop:true},
 {page:'ocupacion',path:'/carreras/ocupaciones?desde=medicina',width:390,linked:true},
 {page:'ocupacion',path:'/carreras/ocupaciones?desde=invalido',width:390,linked:false},
];

for(const config of scenarios)test(`Chrome: ${config.page} ${config.path} a ${config.width}px`,async t=>{
 if(!browserReady(t,chrome))return;
 mkdirSync(dir,{recursive:true});
 writeFileSync(`${dir}/index.html`,'<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/src/__occupation-profession-test.jsx"></script></body></html>');
 writeFileSync('src/__occupation-profession-test.jsx',`import React from 'react';
import { createRoot } from 'react-dom/client';
import './design-home.css';
import './occupation-compare.css';
import './career-profession-pages.css';
import './occupation-profession-mobile.css';
import './compare-profile-context.css';
import OccupationComparePage from './occupationComparePage.jsx';
import CareerProfessionPages from './careerProfessionPages.jsx';
const config=${JSON.stringify(config)};
history.replaceState({},'',config.path);
createRoot(document.getElementById('root')).render(config.page==='profesion'?<CareerProfessionPages/>:<OccupationComparePage/>);
const pause=()=>new Promise(r=>setTimeout(r,150));
async function verify(){
 await pause();
 const hero=document.querySelector(config.page==='profesion'?'.profession-hero':'.co-hero');
 const target=document.querySelector(config.page==='profesion'?'#datos-profesion':'#comparar-trabajos');
 const link=hero?.querySelector(config.page==='profesion'?'.ml-profession-data-link':'.ml-mobile-data-jump');
 if(!hero||!target||!link)throw new Error('No hay acceso al contenido');
 if(link.getAttribute('href')!== (config.page==='profesion'?'#datos-profesion':'#comparar-trabajos'))throw new Error('Enlace de salto incorrecto');
 const r={top:Math.round(target.getBoundingClientRect().top),overflow:document.documentElement.scrollWidth>innerWidth+2,
   width:innerWidth,photo:document.querySelector('.profession-hero-media')?getComputedStyle(document.querySelector('.profession-hero-media')).display:null};
 if(config.page==='profesion'){
   const related=document.querySelector('a.ml-occupation-context-link');
   if(config.linked ? !related : !!related)throw new Error('Ruta a ocupación incompatible');
   if(related && related.getAttribute('href')!=='/carreras/ocupaciones?desde=medicina')throw new Error('No preservó el perfil público');
 }else{
   const sel=document.querySelector('.co-picker select');
   if(!sel)throw new Error('No hay selector');
   if(config.linked){
     if(sel.value!=='medicos-generales-familiares')throw new Error('No seleccionó la ocupación relacionada');
     if(!document.querySelector('.co-origin'))throw new Error('No hay aviso que separe estadísticas');
   }else if(document.querySelector('.co-origin')) throw new Error('Aceptó identificador desconocido');
   const other=[...sel.options].find(x=>x.value!==sel.value);
   if(!other)throw new Error('No hay alternativa');
   const set=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set;
   set.call(sel,other.value);sel.dispatchEvent(new Event('change',{bubbles:true}));
   await pause();
   if(sel.value!==other.value)throw new Error('No permite cambiar ocupación');
   if(!document.querySelector('.co-compare-grid'))throw new Error('Perdió estadísticas');
 }
 if(!config.desktop && (r.top<=0||r.top>=825))throw new Error('Datos demasiado abajo: '+r.top);
 if(config.desktop && r.photo==='none')throw new Error('Ocultó fotografía en escritorio');
 if(config.page==='profesion'&&!config.desktop&&r.photo!=='none')throw new Error('Fotografía repetida antes de cifras');
 if(r.overflow)throw new Error('Desbordamiento horizontal');
 document.body.dataset.metrics=encodeURIComponent(JSON.stringify(r));
 document.body.dataset.done='true';
 document.body.dataset.result='ok';
}
verify().catch(e=>{document.body.dataset.done='true';document.body.dataset.error=e.message;});`);
 const server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'silent'});
 await server.listen();
 try{
  const url=`http://127.0.0.1:${server.httpServer.address().port}/${dir}/index.html`;
  const html=await renderDom(chrome,url,{viewport:{width:config.width,height:850},waitMs:6800,until:"document.body.dataset.done === 'true'"});
  assert.doesNotMatch(html,/data-error=/);
  assert.match(html,/data-result="ok"/);
 }finally{
  await server.close();
  rmSync(dir,{recursive:true,force:true});
  rmSync('src/__occupation-profession-test.jsx',{force:true});
 }
});
