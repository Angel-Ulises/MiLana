(()=>{
'use strict';
const PHOTO='https://images.pexels.com/photos/6963026/pexels-photo-6963026.jpeg';
const guides=[
['/aprende/finiquito-vs-liquidacion/','6 min','Trabajo','Finiquito vs. liquidación: qué cambia realmente'],
['/aprende/leer-recibo-nomina/','7 min','Sueldo','Cómo leer tu recibo de nómina sin perderte'],
['/aprende/aguinaldo-bruto-neto/','5 min','Prestaciones','Aguinaldo bruto y neto: por qué no son la misma cifra']
];
function home(){
 if(location.pathname!=='/')return;
 const hero=document.querySelector('.hero');if(!hero)return;
 hero.dataset.astraReady='true';hero.parentElement?.classList.add('home-main');
 const h1=hero.querySelector('h1');if(h1)h1.textContent='Entiende tu dinero. Decide con claridad.';
 const lede=hero.querySelector('.hero-lede');if(lede)lede.textContent='Calcula tu sueldo y prestaciones en México, entiende cada resultado y revisa sus fuentes antes de tomar una decisión.';
 const actions=[...hero.querySelectorAll('.hero-actions a')];
 if(actions[0]){actions[0].href='/#calculadoras';actions[0].textContent='Ver calculadoras'}
 if(actions[1]){actions[1].href='/#situaciones';actions[1].textContent='Elegir mi situación'}
 const img=hero.querySelector('.hero-media img');
 if(img&&img.dataset.finalPhoto!=='true'){
  img.dataset.finalPhoto='true';hero.querySelectorAll('.hero-media source').forEach(x=>x.remove());
  img.src=PHOTO+'?auto=compress&cs=tinysrgb&w=1600';
  img.srcset=[640,960,1280,1600,2200,2600].map(w=>PHOTO+'?auto=compress&cs=tinysrgb&w='+w+' '+w+'w').join(', ');
  img.sizes='(max-width:1023px) 100vw, (max-width:1279px) 58vw, 760px';
  img.alt='Pareja revisando documentos financieros en una computadora';img.removeAttribute('aria-hidden');
 }
 const learn=document.querySelector('#aprende');
 if(learn&&learn.dataset.finalGuides!=='true'){
  const rows=[...learn.querySelectorAll('.article-row')];
  if(rows.length>=3){learn.dataset.finalGuides='true';guides.forEach((g,i)=>{const r=rows[i];r.href=g[0];r.onclick=null;const s=r.querySelector(':scope > span');if(s)s.textContent=g[1];const h=r.querySelector('h3');if(h)h.textContent=g[3];const p=r.querySelector('p');if(p)p.textContent=g[2]});const b=learn.querySelector('.learn-copy button');if(b){const a=document.createElement('a');a.className=b.className;a.href='/aprende/';a.textContent='Ver todas las guías';b.replaceWith(a)}}
 }
 const points=[...document.querySelectorAll('#fuentes .trust-points p')];if(points[2])points[2].textContent='Alcance, límites y fecha de comprobación visibles en cada herramienta.';
}
function footer(){const n=document.querySelector('.astra-footer-links');if(!n||n.dataset.final==='true')return;n.dataset.final='true';const a=document.createElement('a');a.href='/aprende/';a.textContent='Aprende';n.prepend(a)}
function calculatorShare(){
 if(!location.pathname.startsWith('/calculadoras/'))return;
 const host=document.querySelector('.calculator-hero-copy');
 if(!host||host.querySelector('[data-milana-share]'))return;
 const button=document.createElement('button');
 button.type='button';
 button.className='btn btn-secondary';
 button.dataset.milanaShare='true';
 button.textContent='Compartir calculadora';
 button.style.marginTop='14px';
 button.style.cursor='pointer';
 button.setAttribute('aria-label','Compartir esta calculadora de MiLana');
 button.addEventListener('click',async()=>{
  const h1=host.querySelector('h1')?.textContent?.trim()||'MiLana';
  const url=location.origin+location.pathname;
  const title=`Calculadora de ${h1} | MiLana`;
  const text=`Calcula ${h1.toLowerCase()} en MiLana y revisa cómo se obtiene el resultado.`;
  let method='copy_link';
  try{
   if(navigator.share){method='web_share';await navigator.share({title,text,url});}
   else if(navigator.clipboard){await navigator.clipboard.writeText(url);button.textContent='Enlace copiado';setTimeout(()=>{button.textContent='Compartir calculadora'},1800);}
   else{return;}
   if(typeof window.gtag==='function')window.gtag('event','share_calculator',{calculator_id:location.pathname.split('/').filter(Boolean).at(-1)||'calculator',method});
  }catch(error){if(error?.name!=='AbortError')console.warn('No se pudo compartir la calculadora');}
 });
 host.appendChild(button);
}
function run(){home();footer();calculatorShare()}
let queued=false;
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;run()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{run();setTimeout(run,120);setTimeout(run,500);new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true})},{once:true});else{run();setTimeout(run,120);setTimeout(run,500);new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true})}
})();
