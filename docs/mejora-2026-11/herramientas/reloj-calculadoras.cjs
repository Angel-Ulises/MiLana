const { chromium } = require('playwright');
const B='http://localhost:8793';
const CASOS={
  '/calculadoras/aguinaldo':[['sueldo','12000']],
  '/calculadoras/finiquito':[['sueldo','18000'],['ingreso','2024-01-01']],
  '/calculadoras/liquidacion':[['sueldo','18000'],['ingreso','2022-03-01']],
  '/calculadoras/isr':[['sueldo','20000']],
  '/calculadoras/resico':[['ingreso','40000']],
  '/calculadoras/ptu':[['renta','5000000']],
  '/calculadoras/bruto-a-neto':[['sueldo','20000']],
  '/calculadoras/vacaciones':[['anios','3'],['sueldo','18000']],
  '/calculadoras/infonavit':[['monto','800000']],
  '/calculadoras/pension-imss':[['edad','62'],['semanas','880']],
};
(async()=>{const b=await chromium.launch();
for(const fecha of ['2026-11-16T12:00:00','2026-12-31T12:00:00','2027-01-02T12:00:00','2027-02-02T12:00:00']){
 console.log('\n######## RELOJ',fecha.slice(0,10));
 for(const [ruta,campos] of Object.entries(CASOS)){
  const ctx=await b.newContext({viewport:{width:390,height:800},timezoneId:'America/Mexico_City',locale:'es-MX'});const p=await ctx.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,120)));
  await p.clock.install({time:new Date(fecha)});
  await p.goto(B+ruta,{waitUntil:'load'});await p.clock.runFor(1500);await p.waitForTimeout(400);
  for(const [n,v] of campos){const el=p.locator('[data-calc-directo] [name="'+n+'"]').first();if(await el.count())await el.fill(v).catch(()=>{});}
  await p.clock.runFor(800);await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{document.querySelectorAll('.rc-detalle').forEach(d=>d.open=true);const q=s=>document.querySelector(s);
   const fechas=[...document.querySelectorAll('[data-calc-directo] input[type=date]')].map(i=>i.name+'='+i.value);
   const det=(q('.rc-detalle')?.innerText||'').replace(/\s+/g,' ');
   const anios=[...new Set((document.querySelector('[aria-live]')?.innerText||'').match(/20(2[5-9])/g)||[])];
   const al=(det.match(/actualizados? al[^.]*\./i)||[''])[0];
   return {et:q('.rc-etiqueta')?.innerText||null,m:q('.rc-monto')?.innerText||null,l:(q('.rc-linea')?.innerText||'').slice(0,110),err:[...document.querySelectorAll('[role="alert"],.cc-error,[class*="error"]')].filter(x=>x.getBoundingClientRect().height>0).map(x=>x.innerText.trim().slice(0,110))[0]||null,fechas,anios,al,h1:q('h1')?.innerText}});
  console.log(' ',ruta.replace('/calculadoras/','').padEnd(13),'|',r.m,'|',r.l,'| fechas',r.fechas.join(','),'| años citados',r.anios.join(','),'|',r.al,r.err?('| ERROR: '+r.err):'',errs.length?('| JS: '+errs[0]):'');
  await ctx.close();}
}
await b.close()})();
