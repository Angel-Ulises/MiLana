// Evidencia visual revisable del build real. Sólo formularios con ejemplos fijos;
// no visita producción, cuentas ni datos del usuario, y no modifica el sitio.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { preview } from 'vite';
import { renderDom } from '../tests/helpers/chrome-dom.mjs';

const chrome = [process.env.MILANA_CHROME, '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(existsSync);
if (!chrome) throw Error('Chrome requerido para generar evidencia visual');
if (!existsSync('dist/index.html')) throw Error('Ejecuta el build completo antes de capturar');
const directory = '.qa/decision-journey';
mkdirSync(directory, { recursive: true });
const manifest = { checkedOutSha: process.env.GITHUB_SHA || null, pullRequestHead: null, screenshots: [] };
if (process.env.GITHUB_EVENT_PATH) {
  manifest.pullRequestHead = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')).pull_request?.head?.sha || null;
}
const saveManifest = () => writeFileSync(join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
// El build completo reemplaza el encabezado React por el marco fijo de Órbita.
const visibleHeaderBottom = () => Math.max(0, ...[...document.querySelectorAll('.site-header,.ml-orbita-shell')]
  .filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden')
  .map(el => el.getBoundingClientRect().bottom));

const server = await preview({ logLevel: 'silent', preview: { host: '127.0.0.1', port: 0 } });
const origin = 'http://127.0.0.1:' + server.httpServer.address().port;
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 1000 }]) {
    await renderDom(chrome, origin + '/finanzas', {
      viewport, waitMs: 10000, timeoutMs: 80000,
      until: "document.querySelectorAll('.ml-decision-need').length === 3",
      beforeNavigate: async (send, session) => {
        await send('Emulation.setDeviceMetricsOverride', { ...viewport, deviceScaleFactor: 1, mobile: viewport.width < 600 }, session);
        await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }, session);
      },
      interact: async (send, session) => {
        const evaluate = async expression => {
          const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, session);
          if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
          return result.result.value;
        };
        const until = async expression => {
          const end = Date.now() + 10000;
          do {
            try { if (await evaluate(expression)) return; } catch (e) { if (!/context|navigat/i.test(e.message)) throw e; }
            await pause(60);
          } while (Date.now() < end);
          throw Error('Captura: no se alcanzó ' + expression);
        };
        const capture = async (name, description, selector) => {
          if (selector) await evaluate(`(() => {
            const target=document.querySelector(${JSON.stringify(selector)});
            target.scrollIntoView({block:'start',behavior:'instant'});
            const covered=(${visibleHeaderBottom.toString()})() + 16 - target.getBoundingClientRect().top;
            if (covered>0) window.scrollBy({top:-covered,behavior:'instant'});
          })()`);
          await evaluate("Promise.race([document.fonts.ready, new Promise(resolve=>setTimeout(resolve,3000))])");
          await pause(500);
          const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, session);
          const file = `${viewport.width}-${name}.png`;
          writeFileSync(join(directory, file), Buffer.from(data, 'base64'));
          manifest.screenshots.push({ file, viewport, description, path: await evaluate('location.pathname + location.hash') });
          saveManifest();
        };
        const click = expression => evaluate(expression + '.click()');
        await capture('01-entrada', 'Primera pantalla de Finanzas, sin selección previa.');
        if (viewport.width === 390) {
          const visible = await evaluate("(() => { const r=document.querySelector('.ml-decision-need').getBoundingClientRect(); return r.top>=0 && r.bottom<=innerHeight; })()");
          if (!visible) throw Error('La primera pregunta de Finanzas queda fuera del primer viewport móvil');
        }
        const extrasAfter = await evaluate("[...document.querySelectorAll('.orb-glossary,.orb-section-visual')].every(el=>!!(document.querySelector('.ecosystem-shortcuts').compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING))");
        if (!extrasAfter) throw Error('Un complemento desplaza la elección principal del hub');

        await capture('02-preguntas', 'Tres preguntas y accesos directos.', '.ml-decision');
        await click("document.querySelector('.ml-decision-need')");
        await until("!!document.querySelector('.ml-decision-primary')");
        await capture('03-eleccion', 'Pregunta elegida: acción principal y profundidad opcional.', '.ml-decision');
        await click("document.querySelector('.ml-decision-explanation summary')");
        await click("document.querySelector('.ml-decision-alternatives summary')");
        await capture('04-profundidad', 'Explicación y alternativas abiertas voluntariamente.', '.ml-decision');
        await click("document.querySelector('.ml-decision-primary')");
        await until("location.pathname === '/finanzas/presupuesto' && !!document.querySelector('.finance-form-card') && !!document.querySelector('.ml-journey')");
        for (const [index, value] of ['15000', '7000', '3000', '1000'].entries()) {
          await evaluate(`(() => { const input=document.querySelectorAll('.finance-form-card input')[${index}];
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(value)});
            input.dispatchEvent(new Event('input',{bubbles:true})); })()`);
        }
        await capture('05-herramienta', 'Presupuesto con importes sintéticos y pregunta conservada.');
        if (viewport.width === 390) {
          const fieldVisible = await evaluate("document.querySelector('.finance-form-card input').getBoundingClientRect().bottom <= innerHeight");
          if (!fieldVisible) throw Error('El primer campo de Presupuesto queda detrás de contenido introductorio');
        }

        await capture('06-resultado', 'Resultado y siguientes pasos existentes, con datos sintéticos.', '.finance-results');
        await capture('06b-traslado', 'Acciones existentes y nota de privacidad legible.', '.ml-finance-continuations');
        const noteContrast = await evaluate(`(() => {
          const note=document.querySelector('.ml-finance-continuations>small');
          const color=getComputedStyle(note).color.match(/[\\d.]+/g).slice(0,3).map(Number);
          const background=getComputedStyle(note.closest('.finance-next-box')).backgroundColor.match(/[\\d.]+/g).slice(0,3).map(Number);
          const light=rgb=>rgb.map(x=>{const v=x/255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4}).reduce((sum,x,i)=>sum+x*[0.2126,0.7152,0.0722][i],0);
          const values=[light(color),light(background)].sort((a,b)=>b-a);
          return (values[0]+0.05)/(values[1]+0.05);
        })()`);
        if (!Number.isFinite(noteContrast) || noteContrast < 4.5) throw Error('Contraste insuficiente en nota de traslado: ' + noteContrast);

        await click("document.querySelector('.ml-journey a')");
        await until("location.pathname === '/finanzas' && !!document.querySelector('.ml-decision-primary')");
        // No forzar scroll: esta imagen demuestra la posición real de regreso.
        await capture('07-retorno', 'Regreso real al hub: pregunta recuperada y ancla visible.');
        const headingVisible = await evaluate(`document.querySelector('.ml-decision h2').getBoundingClientRect().top >= (${visibleHeaderBottom.toString()})()`);
        if (!headingVisible) throw Error('El encabezado fijo tapa el título al regresar al explorador');

        await send('Page.navigate', { url: origin + '/carreras#explorar' }, session);
        await until("location.pathname === '/carreras' && document.querySelectorAll('.ml-decision-need').length === 3");
        await capture('08-carreras', 'Entrada directa de Carreras: tres preguntas propias.');
      },
    });
  }
  console.log(`Capturas de recorridos: ${manifest.screenshots.length} imágenes reales en ${directory}`);
} finally {
  saveManifest();
  await new Promise(resolve => server.httpServer.close(resolve));
}
