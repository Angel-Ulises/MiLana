import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(RAIZ, 'dist');
const ocupaciones = JSON.parse(readFileSync(resolve(RAIZ, 'src/data/ocupaciones.json'), 'utf8'));
const profesiones = JSON.parse(readFileSync(resolve(RAIZ, 'src/data/profesiones.json'), 'utf8'));
const plantilla = readFileSync(resolve(DIST, 'index.html'), 'utf8');
const url = 'https://www.milanaaqui.mx/carreras/ocupaciones';
const titulo = 'Carrera vs ocupación: qué estudias y en qué trabajas | MiLana';
const descripcion = 'Compara datos de formación profesional del Observatorio Laboral con ocupaciones de Data México sin mezclar poblaciones, periodos ni promedios salariales.';
const esc = (v) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const dinero = (n) => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n);
const numero = (n) => new Intl.NumberFormat('es-MX').format(n);

function meta(html, clave, valor, propiedad=false) {
  const attr=propiedad?'property':'name';
  const re=new RegExp(`<meta\\s+${attr}=["']${clave}["'][^>]*>`,'i');
  const tag=`<meta ${attr}="${clave}" content="${esc(valor)}" />`;
  return re.test(html)?html.replace(re,tag):html.replace('</head>',`    ${tag}\n  </head>`);
}

const pares = ocupaciones.ocupaciones.map((o) => {
  const p = profesiones.profesiones.find((item) => item.slug === o.carreraRelacionadaSlug);
  return p ? { o, p } : null;
}).filter(Boolean);

const lista = pares.map(({o,p}) => `<article><h2>${esc(p.nombre)} vs. ${esc(o.nombre)}</h2><p><strong>Carrera / formación, OLA 2026-T2:</strong> ${dinero(p.ingreso)} de ingreso profesional promedio mensual y ${numero(p.ocupados)} profesionistas ocupados.</p><p><strong>Ocupación / trabajo desempeñado, Data México ${esc(o.periodo)}:</strong> ${dinero(o.ingresoMensual)} de salario promedio reportado, ${numero(o.ocupados)} personas ocupadas e informalidad de ${o.informalidadPct}%.</p><p>Estas cifras no se restan ni se interpretan como una brecha salarial: corresponden a clasificaciones, poblaciones y cortes diferentes. Data México además advierte baja precisión estadística en estos salarios ocupacionales.</p><p><a href="/carreras/profesion/${p.slug}">Abrir perfil de ${esc(p.nombre)}</a></p></article>`).join('');

let html = plantilla.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi,'');
html = html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${esc(titulo)}</title>`);
html = meta(html,'description',descripcion); html=meta(html,'og:title',titulo,true); html=meta(html,'og:description',descripcion,true); html=meta(html,'og:url',url,true); html=meta(html,'og:type','website',true); html=meta(html,'twitter:title',titulo); html=meta(html,'twitter:description',descripcion);
const canonical=`<link rel="canonical" href="${url}" />`;
html=/<link\s+rel=["']canonical["'][^>]*>/i.test(html)?html.replace(/<link\s+rel=["']canonical["'][^>]*>/i,canonical):html.replace('</head>',`    ${canonical}\n  </head>`);
const schema={'@context':'https://schema.org','@graph':[
  {'@type':'CollectionPage',name:'Carrera vs ocupación',url,description:descripcion,inLanguage:'es-MX',publisher:{'@type':'Organization',name:'MiLana',url:'https://www.milanaaqui.mx'}},
  {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Inicio',item:'https://www.milanaaqui.mx/'},{'@type':'ListItem',position:2,name:'Carreras',item:'https://www.milanaaqui.mx/carreras'},{'@type':'ListItem',position:3,name:'Ocupaciones',item:url}]}
]};
html=html.replace('</head>',`    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`);
const cuerpo=`<div id="root"><main data-static-seo="carrera-ocupacion"><nav aria-label="Ruta"><a href="/">Inicio</a> / <a href="/carreras">Carreras</a> / Ocupaciones</nav><h1>Lo que estudias y el trabajo que desempeñas no son la misma estadística</h1><p>El Observatorio Laboral agrupa profesionistas por formación; Data México agrupa personas por ocupación desempeñada. MiLana muestra ambas capas sin tratarlas como equivalentes.</p><h2>Por qué importa la diferencia</h2><ul><li>Una carrera puede llevar a varias ocupaciones.</li><li>Una ocupación puede incluir personas con formaciones distintas.</li><li>Población ocupada no equivale a vacantes abiertas.</li><li>Los promedios salariales de ambas fuentes no deben restarse como si fueran la misma muestra.</li></ul>${lista}<h2>Fuentes y alcance</h2><p><strong>Carrera:</strong> ${esc(profesiones.fuenteGeneral)}. ${esc(profesiones.nota)}</p><p><strong>Ocupación:</strong> ${esc(ocupaciones.fuente.nombre)}. ${esc(ocupaciones.fuente.nota)}</p><p><a href="/calculadoras/bruto-a-neto">Aterrizar un salario a neto</a> · <a href="/finanzas/mi-situacion">Analizar mi situación</a></p></main></div>`;
html=html.replace(/<div id="root">[\s\S]*?<\/div>/i,cuerpo);
const destino=resolve(DIST,'carreras','ocupaciones','index.html'); mkdirSync(dirname(destino),{recursive:true}); writeFileSync(destino,html,'utf8');

const hubPath=resolve(DIST,'carreras','index.html');
if(existsSync(hubPath)){
  let hub=readFileSync(hubPath,'utf8');
  if(!hub.includes('href="/carreras/ocupaciones"')){
    hub=hub.replace('</ul><h2>¿Cuánto gana una profesión?</h2>', '<li><a href="/carreras/ocupaciones">¿Cuál es la diferencia entre carrera estudiada y ocupación real?</a></li></ul><h2>¿Cuánto gana una profesión?</h2>');
    writeFileSync(hubPath,hub,'utf8');
  }
}
console.log(`ocupaciones: ${pares.length} pares carrera↔ocupación generados`);
