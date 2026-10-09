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

// Solo registramos tipos de interacción predefinidos, nunca búsquedas, importes ni respuestas.
let editedInvestmentScenario=false;
document.addEventListener('change',event=>{
 if(editedInvestmentScenario)return;
 if(event.target?.closest?.('.ml-inv-sim')){
  editedInvestmentScenario=true;
  track('investment_scenario_edited',{section:'invertir'});
 }
},true);

document.addEventListener('click',event=>{
 const button=event.target.closest?.('button');
 if(button){
  if(button.matches('[data-orbita-search-open]'))track('intent_search_open');
  if(button.matches('[data-learn-topic]'))track('learning_topic_selected');
  if(button.matches('.ml-decision-choice,.ml-decision-need'))track('guided_choice_selected');
  if(button.closest('.ml-inv-level'))track('reading_depth_changed',{section:'invertir'});
 }
 const next=event.target.closest?.('[data-learn-guide],[data-learn-tool]');
 if(next)track('learning_next_open',{step:next.hasAttribute('data-learn-guide')?'explain':'tool'});
 const result=event.target.closest?.('[data-orbita-search-item]');
 if(result)track('intent_search_result_open');
 const guided=event.target.closest?.('.ml-decision-primary');
 if(guided)track('guided_next_open');
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