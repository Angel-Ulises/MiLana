import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(RAIZ, 'dist');
const plantilla = readFileSync(resolve(DIST, 'index.html'), 'utf8');
const url = 'https://www.milanaaqui.mx/finanzas/inversion';
const titulo = 'Antes de invertir: flujo, deuda, respaldo y horizonte | MiLana';
const descripcion = 'Ordena flujo mensual, fondo de emergencia, deuda y horizonte antes de comparar inversiones. Herramienta educativa sin score, recomendaciones de producto ni operaciones.';
const esc = (v) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function meta(html, clave, valor, propiedad=false){const attr=propiedad?'property':'name';const re=new RegExp(`<meta\\s+${attr}=["']${clave}["'][^>]*>`,'i');const tag=`<meta ${attr}="${clave}" content="${esc(valor)}" />`;return re.test(html)?html.replace(re,tag):html.replace('</head>',`    ${tag}\n  </head>`)}
let html = plantilla.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi,'');
html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(titulo)}</title>`);
html = meta(html,'description',descripcion); html = meta(html,'og:title',titulo,true); html = meta(html,'og:description',descripcion,true); html = meta(html,'og:url',url,true); html = meta(html,'og:type','website',true); html = meta(html,'twitter:title',titulo); html = meta(html,'twitter:description',descripcion);
const canonical = `<link rel="canonical" href="${url}" />`; html = /<link\s+rel=["']canonical["'][^>]*>/i.test(html) ? html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonical) : html.replace('</head>',`    ${canonical}\n  </head>`);
const schema = {'@context':'https://schema.org','@graph':[{'@type':'WebApplication',name:'Mapa previo a inversión MiLana',url,description:descripcion,applicationCategory:'FinanceApplication',operatingSystem:'Web',inLanguage:'es-MX',offers:{'@type':'Offer',price:'0',priceCurrency:'MXN'},publisher:{'@type':'Organization',name:'MiLana',url:'https://www.milanaaqui.mx'}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Inicio',item:'https://www.milanaaqui.mx/'},{'@type':'ListItem',position:2,name:'Finanzas',item:'https://www.milanaaqui.mx/finanzas'},{'@type':'ListItem',position:3,name:'Antes de invertir',item:url}]}]};
html = html.replace('</head>',`    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`);
const cuerpo = `<div id="root"><main data-static-seo="inversion-educativa"><nav><a href="/">Inicio</a> / <a href="/finanzas">Finanzas</a> / Inversión</nav><h1>Antes de invertir, entiende qué dinero estás poniendo en riesgo</h1><p>MiLana organiza cuatro factores previos: flujo mensual, respaldo y liquidez, costo de deuda y horizonte. No asigna un score de preparación, no declara que una persona esté lista para invertir y no recomienda ni ejecuta productos.</p><h2>Qué revisar antes de comparar instrumentos</h2><ul><li>Cuándo necesitarías el dinero y qué tan líquido debe permanecer.</li><li>Qué pérdidas temporales podrías tolerar sin abandonar tu plan.</li><li>Qué comisiones, impuestos, spreads o costos aplican.</li><li>Quién custodia el dinero y los valores y qué institución ejecuta.</li><li>Si la institución y el producto pueden verificarse en fuentes oficiales.</li></ul><h2>Qué no hace esta versión</h2><p>No conecta cuentas bursátiles, no pide contraseñas de brokers, no selecciona CETES, fondos, acciones o ETF y no constituye asesoría de inversión.</p><h2>Fuente educativa</h2><p>CONDUSEF recomienda fijar una meta, realizar un presupuesto, comparar instrumentos, considerar tolerancia al riesgo, horizonte y comisiones, y no poner en riesgo recursos necesarios para gastos básicos.</p><p><a href="/finanzas/mi-situacion">Analizar mi situación</a> · <a href="/finanzas/fondo-emergencia">Fondo de emergencia</a> · <a href="/finanzas/deuda-y-credito">Deuda y crédito</a></p></main></div>`;
html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, cuerpo);
const destino = resolve(DIST, 'finanzas', 'inversion', 'index.html'); mkdirSync(dirname(destino), {recursive:true}); writeFileSync(destino, html, 'utf8');
console.log('inversión educativa: página estática generada');
