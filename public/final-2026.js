(()=>{
'use strict';

/* La portada ya no se reescribe después del primer render.
   Eso eliminaba saltos visibles de titular, foto, orden y enlaces. */
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
   else if(navigator.clipboard){
    await navigator.clipboard.writeText(url);
    button.textContent='Enlace copiado';
    setTimeout(()=>{button.textContent='Compartir calculadora'},1800);
   }else{return;}
   if(typeof window.gtag==='function')window.gtag('event','share_calculator',{
    calculator_id:location.pathname.split('/').filter(Boolean).at(-1)||'calculator',method
   });
  }catch(error){if(error?.name!=='AbortError')console.warn('No se pudo compartir la calculadora');}
 });
 host.appendChild(button);
}

function run(){calculatorShare()}
let queued=false;
function schedule(){
 if(queued)return;
 queued=true;
 requestAnimationFrame(()=>{queued=false;run()});
}
if(document.readyState==='loading'){
 document.addEventListener('DOMContentLoaded',()=>{
  run();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
 },{once:true});
}else{
 run();
 new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
}
})();
