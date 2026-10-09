import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync('public/aprende/index.html','utf8');
const js=readFileSync('public/learn-guide.js','utf8');
const css=readFileSync('public/static-2026.css','utf8');

test('Aprende ofrece siete situaciones y solo revela la explicación al elegir',()=>{
 assert.match(html, /id="encontrar"/);
 assert.match(html, /aria-live="polite"/);
 assert.match(html, /data-learn-result[^>]*hidden/);
 assert.equal((html.match(/data-learn-topic="/g)||[]).length,7);
 assert.match(html, /<details class="learn-catalog" id="catalogo">/);
 assert.equal((html.match(/<article class="card">/g)||[]).length,6);
 assert.ok(html.indexOf('id="encontrar"') < html.indexOf('class="learn-catalog"'));
 assert.match(html, /src="\/learn-guide\.js"/);
 assert.match(html,/rel="canonical"/);
});
test('Las opciones solo tienen destinos internos publicados, sin almacenamiento ni transferir datos',()=>{
 for(const href of ['/aprende/finiquito-vs-liquidacion','/aprende/leer-recibo-nomina','/aprende/aguinaldo-bruto-neto','/aprende/vacaciones-prima-vacacional','/aprende/resico-ingresos-cobrados','/aprende/pension-imss-ley-97','/invertir','/finanzas/inversion/comparar']){
  assert.ok(js.includes("'"+href+"'"),href);
 }
 for(const forbidden of ['fetch(', 'XMLHttpRequest','localStorage','sessionStorage','navigator.sendBeacon','formData']) assert.ok(!js.includes(forbidden),'No debe usar '+forbidden);
 assert.match(js,/b\.setAttribute\('aria-pressed'/);
 assert.match(js,/answer\.hidden=false/);
 assert.match(js,/title\.textContent=choice\.title/);
});
test('El selector es accesible en móvil y el catálogo se puede abrir sin JavaScript',()=>{
 assert.match(css,/\.learn-finder-choices button\{/);
 assert.match(css,/min-height:48px/);
 assert.match(css,/\.learn-finder button:focus-visible/);
 assert.match(css,/@media\(max-width:480px\)/);
 assert.doesNotMatch(html, /<details class="learn-catalog" id="catalogo" open/);
});