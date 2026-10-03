import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const economy=readFileSync('src/economyNavigation.jsx','utf8');
const vercel=JSON.parse(readFileSync('vercel.json','utf8'));
const css=readFileSync('public/orbita-v3-base.css','utf8');
const js=readFileSync('public/orbita-v3-base.js','utf8');
const inject=readFileSync('scripts/aplicar-orbita-base.mjs','utf8');
const links=readFileSync('scripts/verificar-enlaces-internos.mjs','utf8');
const seo=readFileSync('scripts/verificar-seo-estatico.mjs','utf8');
const pkg=JSON.parse(readFileSync('package.json','utf8'));

test('economyNavigation no reescribe la nota si ya coincide',()=>{
  assert.match(economy,/if \(nota && nota\.textContent !== TEXT\) nota\.textContent = TEXT;/);
});
test('assets de Vercel quedan immutable por un año',()=>{
  const rule=vercel.headers.find(x=>x.source==='/assets/(.*)');
  assert.deepEqual(rule?.headers,[{key:'Cache-Control',value:'public, max-age=31536000, immutable'}]);
});
test('embed se sirve por ?embed=1 y no publica rutas físicas rotas',()=>{
  assert.equal(vercel.rewrites, undefined);
  assert.equal(vercel.headers.some(x=>x.source==='/widgets/calculadoras/(.*)'), false);
  assert.doesNotMatch(inject,/writeWidgetVariant\(/);
  assert.doesNotMatch(inject,/widgets', 'calculadoras', slug/);
  assert.match(inject,/q\.get\('embed'\)===\'1\'/);
  assert.match(inject,/ml-orbita-embed/);
  assert.match(js,/legacyEmbed/);
  assert.match(js,/node\.remove\(\)/);
});
test('Órbita no oscurece el body heredado y conserva tokens aprobados',()=>{
  for(const token of ['#060A13','#0E1524','#162036','#F4F7FC','#B7C3D6','#2D6CAA','#9B8CFF','#2EC4B6','#5DD39E','#F4B942','#FF8A65']) assert.match(css,new RegExp(token,'i'));
  assert.doesNotMatch(css,/html\.ml-orbita-enabled body\{[^}]*background(?:-color)?:var\(--orb-bg\)/);
  assert.match(css,/font-size:var\(--orb-fs\)/);
});

test('los textos secundarios auditados conservan contraste AA sobre marfil',()=>{
  assert.match(css,/\.ml-editorial-method\{color:#63707B\}/);
  assert.match(css,/\.ml-editorial-note,html\.ml-orbita-enabled p\[data-milana-share-note="true"\]\{color:#5E6B78!important\}/);
});

test('las 12 páginas estáticas ocultan header.top al recibir el marco',()=>{
  const block=inject.match(/const STATIC_TOP_ROUTES = new Set\(\[([\s\S]*?)\]\);/)?.[1]||'';
  const routes=[...block.matchAll(/'([^']+)'/g)].map(m=>m[1]);
  assert.equal(routes.length,12);
  assert.match(css,/body\[data-orbita-static-top="true"\]>header\.top\{display:none\}/);
  assert.match(inject,/data-orbita-static-top="true"/);
});
test('búsqueda oculta resultados, muestra vacío y Enter abre el primero',()=>{
  assert.match(css,/\.ml-orbita-search-list a\[hidden\]\{display:none!important\}/);
  assert.match(inject,/Sin resultados/);
  assert.match(js,/searchEmpty\.hidden = visible\.length !== 0/);
  assert.match(js,/event\.key !== 'Enter'/);
  assert.match(js,/first\.click\(\)/);
  assert.match(inject,/careerData\.paginas/);
  assert.match(inject,/stateData\.estados/);
  assert.match(inject,/financeData\.paginas/);
  assert.match(inject,/professionData\.profesiones/);
  assert.match(inject,/`\/carreras\/profesion\/\$\{x\.slug\}`/);
});
test('Calculadoras apunta a ancla real y el verificador exige que exista su id',()=>{
  assert.match(inject,/\['calculadoras', '\/#calculadoras', 'Calculadoras'\]/);
  assert.match(links,/contieneId\(destino, target\.fragment\)/);
  assert.match(links,/ancla sin id/);
  assert.match(links,/statSync\(directo\)\.isFile\(\)/);
  assert.doesNotMatch(inject,/\['calculadoras', '\/calculadoras', 'Calculadoras'\]/);
});
test('Modo fácil afecta contenido y sincroniza aria-pressed desde estado inicial',()=>{
  assert.match(css,/html\.ml-orbita-easy\{--orb-fs:20px\}/);
  assert.match(css,/#root :is\(p,li,label,input,select,textarea,button\)/);
  assert.match(js,/setEasy\(root\.classList\.contains\('ml-orbita-easy'\), false\)/);
  assert.match(js,/button\.setAttribute\('aria-pressed', String\(on\)\)/);
  assert.match(css,/html\.ml-orbita-easy #root \.calculator-main label\{font-size:var\(--orb-fs\)!important\}/);
});
test('ancla #calculadoras se asienta después de load con offset del shell',()=>{
  assert.match(css,/html\.ml-orbita-enabled #calculadoras\{scroll-margin-top:66px\}/);
  assert.match(js,/addEventListener\('load', settleHashAnchor/);
  assert.match(js,/location\.hash !== '#calculadoras'/);
  assert.match(js,/target\.scrollIntoView\(\{ block: 'start', behavior: 'instant' \}\)/);
});
test('targets desktop y logo son de al menos 48px',()=>{
  assert.match(css,/\.ml-orbita-logo\{min-height:48px/);
  assert.match(css,/\.ml-orbita-logo-m\{width:48px;height:48px/);
  assert.match(css,/\.ml-orbita-nav a\{min-height:48px/);
  assert.match(css,/@media\(min-width:1100px\)/);
});
test('acento de sección es visible en el marco',()=>{
  assert.match(css,/\.ml-orbita-shell::after/);
  assert.match(css,/var\(--orb-accent\)/);
  assert.match(css,/data-orbita-section="carreras"/);
  assert.match(css,/data-orbita-section="finanzas"/);
});
test('build aplica Órbita antes de normalizar y verificar',()=>{
  const b=pkg.scripts.build;
  assert.ok(b.indexOf('aplicar-orbita-base.mjs')>b.indexOf('inyectar-analytics-estaticos.mjs'));
  assert.ok(b.indexOf('aplicar-orbita-base.mjs')<b.indexOf('verificar-orbita-generada.mjs'));
  assert.ok(b.indexOf('verificar-orbita-generada.mjs')<b.indexOf('verificar-enlaces-internos.mjs'));
});
test('etapa 1 no reutiliza productShell',()=>{
  assert.doesNotMatch(css,/product-shell/i);
  assert.doesNotMatch(inject,/product-shell/i);
});
