import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { browserReady } from './helpers/chrome-probe.mjs';
import vm from 'node:vm';
import { createServer } from 'vite';
import { renderDom } from './helpers/chrome-dom.mjs';

const source = readFileSync('public/orbita-v3-visuals.js', 'utf8');
const EXPECTED_CODES = ['AGS','BC','BCS','CAMP','CHIS','CHIH','COAH','COL','CDMX','DGO','MEX','GTO','GRO','HGO','JAL','MICH','MOR','NAY','NL','OAX','PUE','QRO','QROO','SLP','SIN','SON','TAB','TAMS','TLAX','VER','YUC','ZAC'];

function readStates() {
  const literal = source.match(/const STATES = (\{[\s\S]*?\n  \});/)?.[1];
  assert.ok(literal, 'no se encontró el mapa STATES en orbita-v3-visuals.js');
  return vm.runInNewContext(`(${literal})`);
}

test('mosaico de estados: 32 códigos únicos, dentro del mapa fijo y ligados a los slugs reales', () => {
  const states = readStates();
  const codes = Object.values(states).map(([code]) => code);
  assert.equal(codes.length, 32);
  assert.equal(new Set(codes).size, 32, 'hay códigos repetidos');
  assert.deepEqual([...codes].sort(), [...EXPECTED_CODES].sort());
  const slugs = JSON.parse(readFileSync('src/data/estados.json', 'utf8')).estados.map((e) => e.slug).sort();
  assert.deepEqual(Object.keys(states).sort(), slugs);
  for (const [, label] of Object.values(states)) assert.ok(label && !/\d|\$/.test(label), `etiqueta sucia: ${label}`);
});

test('mosaico de estados: el código ya no se deriva del texto de la tarjeta', () => {
  assert.doesNotMatch(source, /label\.split\(\/\\s\+\/\)\.map\(\(part\) => part\[0\]\)/);
});

const candidates = [process.env.MILANA_CHROME, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'].filter(Boolean);
const chrome = candidates.find((path) => existsSync(path));
const fixtureDir = 'public/__orbita-mosaic';

function page(path, body) {
  return `<!doctype html><html class="ml-orbita-enabled" data-orbita-section="estados"><head><script defer src="/orbita-v3-visuals.js"></script></head><body><div id="root">${body}</div>
  <script>history.replaceState(null,'','${path}');
  const capture=()=>{const tiles=[...document.querySelectorAll('.orb-state-tile')];if(!tiles.length)return;document.body.dataset.codes=tiles.map(t=>t.textContent).join(',');document.body.dataset.active=[...document.querySelectorAll('.orb-state-tile.is-active')].map(t=>t.textContent).join(',');document.body.dataset.readout=document.querySelector('.orb-chart-readout')?.textContent||'';};
  new MutationObserver(capture).observe(document.getElementById('root'),{childList:true,subtree:true});setTimeout(capture,500);</script></body></html>`;
}
const cards = (items) => items.map(([slug, name]) => `<a href="/estados/${slug}"><span>${name}</span><strong>$20,792/mes profesional</strong><p>Ingreso y desocupación</p></a>`).join('');
const hub = page('/estados', `<main><section class="state-hero"><h1>Estados</h1></section>${cards([['aguascalientes','Aguascalientes'],['campeche','Campeche'],['chiapas','Chiapas'],['chihuahua','Chihuahua'],['coahuila','Coahuila'],['colima','Colima']])}</main>`);
const detail = page('/estados/nuevo-leon', `<main><section class="state-detail-hero"><h1>Nuevo León</h1></section>${cards([['coahuila','Coahuila'],['tamaulipas','Tamaulipas'],['san-luis-potosi','San Luis Potosí'],['zacatecas','Zacatecas']])}</main>`);

test('navegador: el mosaico muestra códigos únicos y, en una ficha, resalta el estado propio', async (t) => {
  if (!browserReady(t, chrome)) return;
  mkdirSync(fixtureDir, { recursive: true });
  writeFileSync(`${fixtureDir}/hub.html`, hub);
  writeFileSync(`${fixtureDir}/detail.html`, detail);
  const server = await createServer({ root: process.cwd(), server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' });
  await server.listen();
  try {
    const port = server.httpServer.address().port;
    const until = "document.body.dataset.codes !== undefined";
    const hubHtml = await renderDom(chrome, `http://127.0.0.1:${port}/__orbita-mosaic/hub.html`, { waitMs: 2500, until });
    assert.match(hubHtml, /data-codes="AGS,CAMP,CHIS,CHIH,COAH,COL"/);
    const detailHtml = await renderDom(chrome, `http://127.0.0.1:${port}/__orbita-mosaic/detail.html`, { waitMs: 2500, until });
    assert.match(detailHtml, /data-codes="NL,COAH,TAMS,SLP,ZAC"/);
    assert.match(detailHtml, /data-active="NL"/);
    assert.match(detailHtml, /Nuevo León y 4 más/);
  } finally {
    await server.close();
    rmSync(fixtureDir, { recursive: true, force: true });
  }
});
