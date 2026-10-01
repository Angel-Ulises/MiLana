import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const DIST=resolve(RAIZ,'dist');
const datos=JSON.parse(readFileSync(resolve(RAIZ,'src/data/profesiones.json'),'utf8'));
const plantilla=readFileSync(resolve(DIST,'index.html'),'utf8');
const url='https://www.milanaaqui.mx/carreras/comparar';
const titulo='Comparar carreras en México 2026 | MiLana';
const descripcion='Compara dos carreras con el mismo corte de ingreso promedio y profesionistas ocupados, sin convertir las cifras en una recomendación automática.';
const esc=(v)=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const dinero=(n)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n);
const numero=(n)=>new Intl.NumberFormat('es-MX').format(n);
function meta(html,clave,valor,propiedad=false){const attr=propiedad?'property':'name';const re=new RegExp(`<meta\\s+${attr}=["']${clave}["'][^>]*>`,'i');const tag=`<meta ${attr}="${clave}" content="${esc(valor)}" />`;return re.test(html)?html.replace(re,tag):html.replace('</head>',`    ${tag}\n  </head>`)}
let html=plantilla.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi,'');
html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${esc(titulo)}</title>`);
html=meta(html,'description',descripcion);html=meta(html,'og:title',titulo,true);html=meta(html,'og:description',descripcion,true);html=meta(html,'og:url',url,true);html=meta(html,'og:type','website',true);html=meta(html,'twitter:title',titulo);html=meta(html,'twitter:description',descripcion);
const canonical=`<link rel="canonical" href="${url}" />`;html=/<link\s+rel=["']canonical["'][^>]*>/i.test(html)?html.replace(/<link\s+rel=["']canonical["'][^>]*>/i,canonical):html.replace('</head>',`    ${canonical}\n  </head>`);
const schema={'@context':'https://schema.org','@graph':[{'@type':'WebApplication',name:'Comparador de carreras MiLana',url,description:descripcion,applicationCategory:'EducationalApplication',operatingSystem:'Web',inLanguage:'es-MX',offers:{'@type':'Offer',price:'0',priceCurrency:'MXN'},publisher:{'@type':'Organization',name:'MiLana',url:'https://www.milanaaqui.mx'}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Inicio',item:'https://www.milanaaqui.mx/'},{'@type':'ListItem',position:2,name:'Carreras',item:'https://www.milanaaqui.mx/carreras'},{'@type':'ListItem',position:3,name:'Comparar',item:url}]}]};
html=html.replace('</head>',`    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`);
const perfiles=datos.profesiones.map(p=>`<li><a href="/carreras/profesion/${p.slug}">${esc(p.nombre)}</a> — ${dinero(p.ingreso)}/mes de ingreso promedio · ${numero(p.ocupados)} profesionistas ocupados</li>`).join('');
const cuerpo=`<div id="root"><main data-static-seo="comparador-carreras"><nav aria-label="Ruta"><a href="/">Inicio</a> / <a href="/carreras">Carreras</a> / Comparar</nav><h1>Compara dos carreras con el mismo corte 2026</h1><p>El comparador usa perfiles del Observatorio Laboral con cifras ENOE 2026-T2 para mostrar ingreso mensual promedio y población profesional ocupada bajo una misma referencia.</p><h2>Qué puedes comparar</h2><ul><li>Ingreso mensual promedio del grupo profesional.</li><li>Número de profesionistas ocupados.</li><li>Área profesional y distribución observada por sexo.</li></ul><h2>Qué no decide por ti</h2><p>MiLana no declara una carrera ganadora. Un promedio no mide tus preferencias, costo de estudiar, experiencia futura, región, formalidad ni vacantes disponibles.</p><h2>Perfiles disponibles</h2><ul>${perfiles}</ul><p><strong>Fuente:</strong> ${esc(datos.fuenteGeneral)}. ${esc(datos.nota)}</p><p><a href="/carreras/ocupaciones">Diferencia entre carrera y ocupación</a> · <a href="/finanzas/mi-situacion">Analizar mi situación financiera</a></p></main></div>`;
html=html.replace(/<div id="root">[\s\S]*?<\/div>/i,cuerpo);
const destino=resolve(DIST,'carreras','comparar','index.html');mkdirSync(dirname(destino),{recursive:true});writeFileSync(destino,html,'utf8');
console.log(`comparador de carreras: ${datos.profesiones.length} perfiles disponibles`);
