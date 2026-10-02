import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const DIST=resolve(RAIZ,'dist');
const estados=JSON.parse(readFileSync(resolve(RAIZ,'src/data/estados.json'),'utf8'));
const laboral=JSON.parse(readFileSync(resolve(RAIZ,'src/data/mercadoLaboralEstados.json'),'utf8'));
const vivienda=JSON.parse(readFileSync(resolve(RAIZ,'src/data/viviendaEstados.json'),'utf8'));
const plantilla=readFileSync(resolve(DIST,'index.html'),'utf8');
const url='https://www.milanaaqui.mx/estados/comparar';
const titulo='Comparar estados de México 2026 | MiLana';
const descripcion='Compara dos estados con ingreso profesional, mercado laboral y vivienda hipotecaria usando fuentes oficiales 2026, sin puntajes ni un ganador automático.';
const esc=(v)=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const dinero=(n)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n);
function meta(html,clave,valor,propiedad=false){const attr=propiedad?'property':'name';const re=new RegExp(`<meta\\s+${attr}=["']${clave}["'][^>]*>`,'i');const tag=`<meta ${attr}="${clave}" content="${esc(valor)}" />`;return re.test(html)?html.replace(re,tag):html.replace('</head>',`    ${tag}\n  </head>`)}
let html=plantilla.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi,'');
html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${esc(titulo)}</title>`);
html=meta(html,'description',descripcion);html=meta(html,'og:title',titulo,true);html=meta(html,'og:description',descripcion,true);html=meta(html,'og:url',url,true);html=meta(html,'og:type','website',true);html=meta(html,'twitter:title',titulo);html=meta(html,'twitter:description',descripcion);
const canonical=`<link rel="canonical" href="${url}" />`;html=/<link\s+rel=["']canonical["'][^>]*>/i.test(html)?html.replace(/<link\s+rel=["']canonical["'][^>]*>/i,canonical):html.replace('</head>',`    ${canonical}\n  </head>`);
const schema={'@context':'https://schema.org','@graph':[{'@type':'WebApplication',name:'Comparador de estados MiLana',url,description:descripcion,applicationCategory:'FinanceApplication',operatingSystem:'Web',inLanguage:'es-MX',offers:{'@type':'Offer',price:'0',priceCurrency:'MXN'},publisher:{'@type':'Organization',name:'MiLana',url:'https://www.milanaaqui.mx'}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Inicio',item:'https://www.milanaaqui.mx/'},{'@type':'ListItem',position:2,name:'Estados',item:'https://www.milanaaqui.mx/estados'},{'@type':'ListItem',position:3,name:'Comparar',item:url}]}]};
html=html.replace('</head>',`    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`);
const mercado=new Map(laboral.estados.map(e=>[e.slug,e]));
const casas=new Map(vivienda.estados.map(e=>[e.slug,e]));
const lista=estados.estados.map(e=>{const m=mercado.get(e.slug);const v=casas.get(e.slug);return `<li><a href="/estados/${e.slug}">${esc(e.estado)}</a> — ingreso profesional ${dinero(e.ingreso)} · desocupación ${m.desocupacion.toFixed(1)}% · informalidad ${m.informalidad.toFixed(1)}% · mediana de avalúo hipotecario ${dinero(v.mediana)} · apreciación SHF ${v.apreciacion.toFixed(1)}%</li>`}).join('');
const cuerpo=`<div id="root"><main data-static-seo="comparador-estados"><nav aria-label="Ruta"><a href="/">Inicio</a> / <a href="/estados">Estados</a> / Comparar</nav><h1>Compara dos estados de México con fuentes oficiales 2026</h1><p>El comparador reúne tres fotografías que se mantienen separadas: población profesional de OLA/STPS, mercado laboral general de ENOE/INEGI y vivienda adquirida con crédito hipotecario del Índice SHF.</p><h2>Qué puedes comparar</h2><ul><li>Ingreso profesional promedio y población profesional ocupada.</li><li>Participación, desocupación, informalidad, subocupación, trabajo asalariado y condiciones críticas.</li><li>Mediana y promedio de avalúos hipotecarios, además de apreciación interanual de vivienda.</li></ul><h2>Qué no hacemos</h2><p>MiLana no declara un estado ganador, no convierte estas cifras en una recomendación de mudanza y no divide precio de vivienda entre ingreso profesional: las poblaciones de esas fuentes son diferentes. Tampoco usamos estas métricas como sustituto de renta o costo de vida.</p><h2>Estados disponibles</h2><ul>${lista}</ul><p><strong>Fuentes:</strong> ${esc(estados.fuente.nombre)}; ${esc(laboral.fuente)}; ${esc(vivienda.fuente)}. Cortes 2026-T2.</p><p><a href="/finanzas/mi-situacion">Analizar mis números</a> · <a href="/finanzas/vivienda">Entender una decisión de vivienda</a></p></main></div>`;
html=html.replace(/<div id="root">[\s\S]*?<\/div>/i,cuerpo);
const destino=resolve(DIST,'estados','comparar','index.html');mkdirSync(dirname(destino),{recursive:true});writeFileSync(destino,html,'utf8');
console.log(`comparador de estados: ${estados.estados.length} entidades disponibles`);
