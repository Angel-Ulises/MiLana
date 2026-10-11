// Capturas del build completo y verificaciones de la práctica, sin visitar producción.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { preview } from 'vite';
import { renderDom } from '../tests/helpers/chrome-dom.mjs';

const chrome = [process.env.MILANA_CHROME, '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(existsSync);
if (!chrome || !existsSync('dist/index.html')) throw Error('Se requieren Chrome y el build completo para capturar');
const directory = '.qa/budget-practice'; mkdirSync(directory, { recursive: true });
const manifest = { checkedOutSha: process.env.GITHUB_SHA || execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(), pullRequestHead: null, screenshots: [], checks: [] };
if (process.env.GITHUB_EVENT_PATH) manifest.pullRequestHead = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH,'utf8')).pull_request?.head?.sha || null;
const save = () => writeFileSync(join(directory,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const pause = ms => new Promise(resolve=>setTimeout(resolve,ms));
const server = await preview({logLevel:'silent',preview:{host:'127.0.0.1',port:0}});
const origin = 'http://127.0.0.1:' + server.httpServer.address().port;
try {
  for (const viewport of [{width:320,height:900},{width:390,height:844},{width:1440,height:1000}]) {
    await renderDom(chrome,origin+'/finanzas#explorar',{
      viewport,waitMs:10000,timeoutMs:120000,until:"!!document.querySelector('.ml-practice-entry')",
      beforeNavigate: async (send,session) => {
        await send('Emulation.setDeviceMetricsOverride',{...viewport,deviceScaleFactor:1,mobile:viewport.width<600},session);
        await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]},session);
      },
      interact: async (send,session) => {
        const evaluate=async expression=>{
          const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},session);
          if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
          return r.result.value;
        };
        const until=async expression=>{
          const end=Date.now()+10000;
          do{try{if(await evaluate(expression))return;}catch(e){if(!/context|navigat/i.test(e.message))throw e;}await pause(60);}while(Date.now()<end);
          throw Error('Captura no alcanzó: '+expression);
        };
        const click=async(selector,text)=>{
          await evaluate(`[...document.querySelectorAll(${JSON.stringify(selector)})].find(el=>el.textContent.includes(${JSON.stringify(text)})).click()`);
          await pause(80);
        };
        const check=async(name,expression)=>{
          const passed=await evaluate(expression);manifest.checks.push({width:viewport.width,name,passed});save();
          if(!passed)throw Error(name+' falló a '+viewport.width+'px');
        };
        const capture=async(name,description,selector)=>{
          if(selector)await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'start',behavior:'instant'})`);
          await evaluate("Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,2500))])");
          await pause(250);
          const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},session);
          const file=`${viewport.width}-${name}.png`;writeFileSync(join(directory,file),Buffer.from(data,'base64'));
          manifest.screenshots.push({file,viewport,description,path:await evaluate('location.pathname+location.hash')});save();
          await check(name+' sin desbordamiento','document.documentElement.scrollWidth <= innerWidth + 2');
        };
        await capture('01-entrada','Tres preguntas existentes y acceso voluntario a la práctica.');
        await click('.ml-practice-entry','ejemplo');
        await capture('02-ingreso','Paso 1: ingreso neto hipotético, sin pedir datos.');
        await click('.ml-practice-primary','se va');
        await capture('03-gastos','Paso 2: básicos, otros gastos y pagos de deuda.');
        await click('.ml-practice-primary','queda');
        await capture('04-disponible','Paso 3: cuenta explícita y experimento de gasto extra.');
        for(let i=0;i<4;i++)await click('.ml-practice-experiment-actions button','Sumar');
        await check('Saldo exactamente cero',"document.querySelector('.ml-practice-balance').textContent.includes('Quedan justos')");
        await capture('05-cero','El ejemplo queda justo después de sumar $2,000 de gasto.');
        await click('.ml-practice-experiment-actions button','Sumar');
        await check('Faltante explicado con palabras',"document.querySelector('.ml-practice-balance').textContent.includes('Faltan')");
        await capture('06-faltante','Faltan $500; no se presentan negativos como dinero disponible.');
        await click('.ml-practice-experiment-actions button','Quitar');
        await check('Quitar extra restaura $2,000',"document.querySelector('.ml-practice-balance strong').textContent === '$2,000'");
        await click('.ml-practice-primary','propios');
        await until("location.pathname === '/finanzas/presupuesto' && !!document.querySelector('.finance-form-card')");
        await check('Cifras ficticias no transferidas',"[...document.querySelectorAll('.finance-form-card input')].every(el=>el.value === '')");
        await capture('07-presupuesto','Presupuesto real sin cifras del ejemplo; ayuda después del primer campo.');
        for(const[index,value]of ['23000','13000','2500','1000'].entries()){
          await evaluate(`(()=>{const input=document.querySelectorAll('.finance-form-card input')[${index}];Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(value)});input.dispatchEvent(new Event('input',{bubbles:true}));})()`);await pause(60);
        }
        await click('.ml-practice-entry','ejemplo');
        await click('.ml-practice-primary','se va');await click('.ml-practice-primary','queda');
        await click('.ml-practice-experiment-actions button','Sumar');await click('.ml-practice-primary','propios');
        await check('Campos propios conservados',"JSON.stringify([...document.querySelectorAll('.finance-form-card input')].map(el=>el.value)) === JSON.stringify(['23000','13000','2500','1000'])");
        await check('Foco vuelve al primer campo visible',"(()=>{const input=document.querySelector('.finance-form-card input');const r=input.getBoundingClientRect();const header=Math.max(0,...[...document.querySelectorAll('.site-header,.ml-orbita-shell')].filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden').map(el=>el.getBoundingClientRect().bottom));return document.activeElement===input && r.top>header && r.bottom<innerHeight;})()");
        await capture('08-regreso-datos','Regreso real al primer campo después de cerrar la práctica; cantidades sintéticas usadas sólo para QA.');
      },
    });
  }
  console.log(`Práctica principiantes: ${manifest.screenshots.length} capturas y ${manifest.checks.length} comprobaciones en ${directory}`);
} finally { save();await new Promise(resolve=>server.httpServer.close(resolve)); }
