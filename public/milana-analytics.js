(()=>{
'use strict';
const ID='G-M4819QE19R';
const prod=location.hostname==='milanaaqui.mx'||location.hostname==='www.milanaaqui.mx';
if(!prod)return;

function ensureGtag(){
 window.dataLayer=window.dataLayer||[];
 window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
 const existing=[...document.scripts].some(s=>String(s.src||'').includes(`googletagmanager.com/gtag/js?id=${ID}`));
 if(!existing){
  window.gtag('js',new Date());
  window.gtag('config',ID);
  const script=document.createElement('script');
  script.async=true;
  script.src=`https://www.googletagmanager.com/gtag/js?id=${ID}`;
  document.head.appendChild(script);
 }
}

function track(name,params={}){
 if(typeof window.gtag==='function')window.gtag('event',name,params);
}
window.milanaTrack=track;
ensureGtag();

const path=location.pathname.replace(/\/$/,'')||'/';
const parts=path.split('/').filter(Boolean);
const calculatorId=parts[0]==='calculadoras'?(parts[1]||'calculator'):null;

if(calculatorId&&!document.documentElement.dataset.milanaCalculatorView){
 document.documentElement.dataset.milanaCalculatorView='true';
 track('calculator_view',{calculator_id:calculatorId});
}

document.addEventListener('submit',event=>{
 if(!calculatorId)return;
 const form=event.target;
 if(!(form instanceof HTMLFormElement))return;
 track('calculator_submit',{calculator_id:calculatorId});
},true);

document.addEventListener('click',event=>{
 const button=event.target.closest?.('button');
 if(calculatorId&&button&&!button.form&&/^calcular\b/i.test((button.textContent||'').trim())){
  track('calculator_submit',{calculator_id:calculatorId,interaction:'button'});
 }
 const link=event.target.closest?.('a[href]');
 if(link){
  let url;
  try{url=new URL(link.href,location.href)}catch{return}
  if(url.origin===location.origin&&url.pathname.startsWith('/calculadoras/')){
   const targetId=url.pathname.split('/').filter(Boolean)[1]||'calculator';
   if(!calculatorId)track('internal_to_calculator',{calculator_id:targetId,source_path:path});
  }
 }
},true);
})();
