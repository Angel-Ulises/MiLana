(()=>{
'use strict';

/* La portada ya no se reescribe después del primer render.
   Eso eliminaba saltos visibles de titular, foto, orden y enlaces. */
function calculatorShare(){
 if(!location.pathname.startsWith('/calculadoras/'))return;
 const host=document.querySelector('.calculator-hero-copy');
 if(!host||host.querySelector('[data-milana-share]'))return;
 const original='Compartir enlace de esta calculadora';
 const button=document.createElement('button');
 button.type='button';
 button.className='btn btn-secondary';
 button.dataset.milanaShare='true';
 button.textContent=original;
 button.style.marginTop='14px';
 button.style.cursor='pointer';
 button.setAttribute('aria-label','Compartir el enlace a esta calculadora de MiLana');

 const note=document.createElement('p');
 note.dataset.milanaShareNote='true';
 note.textContent='Comparte solo el enlace a esta herramienta. Tus datos y resultados no se incluyen.';
 note.style.margin='10px 0 0';
 note.style.fontSize='13px';
 note.style.lineHeight='1.5';
 note.style.color='var(--ml-soft, #5e6b78)';

 function feedback(text){
  button.textContent=text;
  window.setTimeout(()=>{button.textContent=original},1800);
 }
 function track(method){
  if(typeof window.gtag==='function')window.gtag('event','share_calculator',{
   calculator_id:location.pathname.split('/').filter(Boolean).at(-1)||'calculator',method
  });
 }
 function legacyCopy(url){
  try{
   const field=document.createElement('textarea');
   field.value=url;
   field.setAttribute('readonly','');
   field.style.position='fixed';
   field.style.opacity='0';
   document.body.appendChild(field);
   field.focus(); field.select();
   const ok=document.execCommand('copy');
   field.remove();
   return !!ok;
  }catch{return false;}
 }
 async function copyLink(url){
  try{
   if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url);return true;}
  }catch{}
  return legacyCopy(url);
 }
 button.addEventListener('click',async()=>{
  if(button.disabled)return;
  button.disabled=true;
  const h1=host.querySelector('h1')?.textContent?.trim()||'MiLana';
  /* Deliberadamente sin query string: jamás comparte entradas ni resultados. */
  const url=location.origin+location.pathname;
  const title=`Calculadora de ${h1} | MiLana`;
  const text=`Calcula ${h1.toLowerCase()} en MiLana y revisa cómo se obtiene el resultado.`;
  try{
   if(navigator.share){
    try{
     await navigator.share({title,text,url});
     feedback('Compartido'); track('web_share'); return;
    }catch(error){
     if(error?.name==='AbortError')return;
    }
   }
   if(await copyLink(url)){
    feedback('Enlace copiado'); track('copy_link'); return;
   }
   window.prompt('Copia este enlace:',url);
   feedback('Enlace listo para copiar'); track('manual_copy');
  }finally{button.disabled=false;}
 });
 host.appendChild(button);
 host.appendChild(note);
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
