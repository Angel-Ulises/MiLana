import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
test('finance hub keeps one photograph while five tool/routing intros avoid repetition',()=>{
 const source=read('src/financePages.jsx');
 assert.equal((source.match(/<Hero photo=\{false\}/g)||[]).length,5);
 assert.match(source,/finance-page-hero--compact/);
 assert.match(source,/\{photo && <figure/);
 assert.match(read('src/finance-pages.css'),/finance-page-hero--compact \.finance-page-hero-grid\{grid-template-columns:1fr;min-height:0/);
});
test('INEGI data stories remove repeated decorative image without altering data',()=>{
 const source=read('src/economyPages.jsx');
 assert.match(source,/NOTAS_TIPOGRAFICAS = new Set\(\['inflacion-primera-quincena-septiembre-2026', 'consumo-privado-agosto-2026'\]\)/);
 assert.equal((source.match(/\{conFoto && <figure/g)||[]).length,2);
 assert.match(source,/articulo\.datoPrincipal/);
 assert.match(source,/articulo\.datoEtiqueta/);
 assert.match(source,/articulo\.fuenteFecha/);
 assert.match(source,/economy-card--text/);
 assert.match(read('src/economy-pages.css'),/economy-article-hero--text \.economy-article-hero-grid\{grid-template-columns:1fr;min-height:0/);
});
test('profession imagery is individually sourced, unique and responsive',()=>{
 const catalog=JSON.parse(read('src/data/fotos-profesiones.json'));
 const photos=Object.values(catalog.selected);
 assert.equal(photos.length,7);
 assert.equal(new Set(photos.map(p=>p.id)).size,photos.length);
 for(const p of photos){assert.ok(p.author&&p.alt&&p.focal);assert.match(p.pageUrl,new RegExp(`^https://www\\.pexels\\.com/photo/.+-${p.id}/$`));}
 assert.equal(catalog.licenseUrl,'https://www.pexels.com/license/');
 const source=read('src/careerProfessionPages.jsx');
 assert.match(source,/fotoElegida && <div/);
 assert.match(source,/Foto de contexto/);
 assert.match(source,/480w.*720w.*1400w/);
 assert.doesNotMatch(source,/3184465|crop=bottom/);
});
test('career hub photo is not repeated in its home discovery entry',()=>{
 assert.doesNotMatch(read('src/financeExpansion.jsx'),/6147267|ml-discovery-photo/);
 assert.match(read('src/careerPages.jsx'),/6147267/);
 assert.match(read('src/financeExpansion.jsx'),/ml-discovery-journey/);
});
