import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CETES_REFERENCE } from '../src/data/cetes-reference.js';
import { CNBV_FUND_SAMPLE } from '../src/data/cnbv-fund-sample.js';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(RAIZ, 'dist');
const plantilla = readFileSync(resolve(DIST, 'index.html'), 'utf8');
const esc = (v) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function meta(html, clave, valor, propiedad=false){
  const attr=propiedad?'property':'name';
  const re=new RegExp(`<meta\\s+${attr}=["']${clave}["'][^>]*>`,'i');
  const tag=`<meta ${attr}="${clave}" content="${esc(valor)}" />`;
  return re.test(html)?html.replace(re,tag):html.replace('</head>',`    ${tag}\n  </head>`);
}

function generarPagina({ url, titulo, descripcion, schemaName, breadcrumbs, cuerpo, destino }) {
  let html = plantilla.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi,'');
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(titulo)}</title>`);
  html = meta(html,'description',descripcion);
  html = meta(html,'og:title',titulo,true);
  html = meta(html,'og:description',descripcion,true);
  html = meta(html,'og:url',url,true);
  html = meta(html,'og:type','website',true);
  html = meta(html,'twitter:title',titulo);
  html = meta(html,'twitter:description',descripcion);
  const canonical = `<link rel="canonical" href="${url}" />`;
  html = /<link\s+rel=["']canonical["'][^>]*>/i.test(html)
    ? html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonical)
    : html.replace('</head>',`    ${canonical}\n  </head>`);
  const schema = {'@context':'https://schema.org','@graph':[
    {'@type':'WebApplication',name:schemaName,url,description:descripcion,applicationCategory:'FinanceApplication',operatingSystem:'Web',inLanguage:'es-MX',offers:{'@type':'Offer',price:'0',priceCurrency:'MXN'},publisher:{'@type':'Organization',name:'MiLana',url:'https://www.milanaaqui.mx'}},
    {'@type':'BreadcrumbList',itemListElement:breadcrumbs.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,item:item.item}))}
  ]};
  html = html.replace('</head>',`    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`);
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, cuerpo);
  const archivo = resolve(DIST, ...destino, 'index.html');
  mkdirSync(dirname(archivo), {recursive:true});
  writeFileSync(archivo, html, 'utf8');
}

const url = 'https://www.milanaaqui.mx/finanzas/inversion';
const titulo = 'Antes de invertir: flujo, deuda, respaldo y horizonte | MiLana';
const descripcion = 'Ordena flujo mensual, fondo de emergencia, deuda y horizonte antes de comparar inversiones. Herramienta educativa sin score, recomendaciones de producto ni operaciones.';
const cuerpo = `<div id="root"><main data-static-seo="inversion-educativa"><nav><a href="/">Inicio</a> / <a href="/finanzas">Finanzas</a> / Inversión</nav><h1>Antes de invertir, entiende qué dinero estás poniendo en riesgo</h1><p>MiLana organiza cuatro factores previos: flujo mensual, respaldo y liquidez, costo de deuda y horizonte. No asigna un score de preparación, no declara que una persona esté lista para invertir y no recomienda ni ejecuta productos.</p><h2>Qué revisar antes de comparar instrumentos</h2><ul><li>Cuándo necesitarías el dinero y qué tan líquido debe permanecer.</li><li>Qué pérdidas temporales podrías tolerar sin abandonar tu plan.</li><li>Qué comisiones, impuestos, spreads o costos aplican.</li><li>Quién custodia el dinero y los valores y qué institución ejecuta.</li><li>Si la institución y el producto pueden verificarse en fuentes oficiales.</li></ul><h2>Qué no hace esta versión</h2><p>No conecta cuentas bursátiles, no pide contraseñas de brokers, no selecciona CETES, fondos, acciones o ETF y no constituye asesoría de inversión.</p><h2>Fuente educativa</h2><p>CONDUSEF recomienda fijar una meta, realizar un presupuesto, comparar instrumentos, considerar tolerancia al riesgo, horizonte y comisiones, y no poner en riesgo recursos necesarios para gastos básicos.</p><p><a href="/finanzas/inversion/comparar">Comparar tipos de instrumentos</a> · <a href="/finanzas/inversion/cetes">Ver referencias CETES</a> · <a href="/finanzas/inversion/fondos">Ver fondos reportados a CNBV</a> · <a href="/finanzas/mi-situacion">Analizar mi situación</a> · <a href="/finanzas/fondo-emergencia">Fondo de emergencia</a> · <a href="/finanzas/deuda-y-credito">Deuda y crédito</a></p></main></div>`;

generarPagina({ url, titulo, descripcion, schemaName:'Mapa previo a inversión MiLana', breadcrumbs:[{name:'Inicio',item:'https://www.milanaaqui.mx/'},{name:'Finanzas',item:'https://www.milanaaqui.mx/finanzas'},{name:'Antes de invertir',item:url}], cuerpo, destino:['finanzas','inversion'] });

const compareUrl = 'https://www.milanaaqui.mx/finanzas/inversion/comparar';
const compareTitle = 'Comparar CETES, fondos, acciones y ETF | MiLana';
const compareDescription = 'Compara tipos de instrumentos por estructura, plazo, liquidez, variación, diversificación, costos e intermediación. Sin ranking, tasas prometidas ni recomendación de producto.';
const compareBody = `<div id="root"><main data-static-seo="comparar-instrumentos"><nav><a href="/">Inicio</a> / <a href="/finanzas">Finanzas</a> / <a href="/finanzas/inversion">Inversión</a> / Comparar</nav><h1>Compara estructuras, no promesas</h1><p>MiLana compara CETES, fondos de inversión, acciones y ETF usando las mismas dimensiones. No usa una tasa vigente para declarar ganador y no evalúa idoneidad personal.</p><h2>Dimensiones comparables</h2><ul><li>Qué compras y quién emite o administra.</li><li>Plazo y condiciones para disponer del dinero.</li><li>Qué puede variar en el valor o rendimiento.</li><li>Qué diversificación existe realmente.</li><li>Comisiones, spreads, impuestos y otros costos que deben verificarse.</li><li>Quién intermedia, ejecuta y custodia.</li></ul><h2>Fuentes oficiales</h2><p>CETES: cetesdirecto / Gobierno de México. Fondos de inversión: Comisión Nacional Bancaria y de Valores. Acciones y ETF: Bolsa Mexicana de Valores.</p><h2>Límite</h2><p>Esta herramienta no recomienda comprar, vender o mantener instrumentos, no asigna riesgo universal y no sustituye prospectos, contratos, perfilamiento ni asesoría regulada.</p><p><a href="/finanzas/inversion/cetes">Ver snapshot oficial de CETES</a> · <a href="/finanzas/inversion/fondos">Ver muestra regulatoria de fondos CNBV</a> · <a href="/finanzas/inversion">Volver al mapa previo</a> · <a href="/finanzas/mi-situacion">Revisar mi situación</a></p></main></div>`;

generarPagina({ url:compareUrl, titulo:compareTitle, descripcion:compareDescription, schemaName:'Comparador educativo de instrumentos MiLana', breadcrumbs:[{name:'Inicio',item:'https://www.milanaaqui.mx/'},{name:'Finanzas',item:'https://www.milanaaqui.mx/finanzas'},{name:'Antes de invertir',item:url},{name:'Comparar instrumentos',item:compareUrl}], cuerpo:compareBody, destino:['finanzas','inversion','comparar'] });

const cetesUrl = 'https://www.milanaaqui.mx/finanzas/inversion/cetes';
const cetesTitle = 'CETES: tasas y precios de referencia oficiales | MiLana';
const cetesDescription = `Snapshot fechado de CETES con tasas brutas anuales y precios indicativos publicados por cetesdirecto el ${CETES_REFERENCE.sourceDate}. Sin ranking ni recomendación.`;
const cetesRows = CETES_REFERENCE.products.map((item) => `<tr><th>${esc(item.label)}</th><td>${esc(item.displayTerm)}</td><td>${item.grossAnnualRatePct.toFixed(2)}%</td><td>$${item.indicativePrice.toFixed(2)}</td><td>${item.days} días</td></tr>`).join('');
const cetesBody = `<div id="root"><main data-static-seo="cetes-reference"><nav><a href="/">Inicio</a> / <a href="/finanzas">Finanzas</a> / <a href="/finanzas/inversion">Inversión</a> / CETES</nav><h1>CETES por plazo, con fecha y fuente visibles</h1><p>Snapshot oficial con fecha ${esc(CETES_REFERENCE.sourceDate)}. Los datos son referencias publicadas por cetesdirecto; no son una cotización ejecutable, promesa de rendimiento ni recomendación.</p><table><thead><tr><th>Instrumento</th><th>Plazo visible</th><th>Tasa bruta anual publicada</th><th>Precio indicativo</th><th>Días</th></tr></thead><tbody>${cetesRows}</tbody></table><h2>Cómo leer estos datos</h2><p>La tasa puede cambiar entre subastas y fechas. Un plazo con tasa publicada mayor no es automáticamente una mejor opción: importan horizonte, liquidez, impuestos, reinversión y condiciones del canal.</p><h2>Fuente</h2><p>${esc(CETES_REFERENCE.sourceLabel)}. Última revisión de MiLana: ${esc(CETES_REFERENCE.checkedAt)}.</p><p><a href="${esc(CETES_REFERENCE.sourceUrl)}">Abrir fuente oficial</a> · <a href="/finanzas/inversion/comparar">Comparar familias</a> · <a href="/finanzas/inversion">Volver al mapa previo</a></p></main></div>`;

generarPagina({ url:cetesUrl, titulo:cetesTitle, descripcion:cetesDescription, schemaName:'Referencia educativa CETES MiLana', breadcrumbs:[{name:'Inicio',item:'https://www.milanaaqui.mx/'},{name:'Finanzas',item:'https://www.milanaaqui.mx/finanzas'},{name:'Antes de invertir',item:url},{name:'CETES',item:cetesUrl}], cuerpo:cetesBody, destino:['finanzas','inversion','cetes'] });

const fundsUrl = 'https://www.milanaaqui.mx/finanzas/inversion/fondos';
const fundsTitle = 'Fondos de inversión reportados a CNBV | MiLana';
const fundsDescription = `Muestra regulatoria de fondos reportados a CNBV con corte ${CNBV_FUND_SAMPLE.sourcePeriod}: operadora, tipo, clasificación y activo neto diario. Sin ranking ni recomendación.`;
const fundsRows = CNBV_FUND_SAMPLE.records.map((item) => `<tr><th>${esc(item.fundCode)}</th><td>${esc(item.operatorCode)}</td><td>${esc(item.fundType)}</td><td>${esc(item.classification)}</td><td>${new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(item.netAssets)}</td></tr>`).join('');
const fundsBody = `<div id="root"><main data-static-seo="fondos-cnbv"><nav><a href="/">Inicio</a> / <a href="/finanzas">Finanzas</a> / <a href="/finanzas/inversion">Inversión</a> / Fondos CNBV</nav><h1>Fondos reportados a CNBV, con el corte a la vista</h1><p>Muestra regulatoria inicial del Reporte R1 con corte ${esc(CNBV_FUND_SAMPLE.sourcePeriod)}. No es un directorio exhaustivo, ranking, oferta comercial ni recomendación.</p><table><thead><tr><th>Fondo</th><th>Operadora · clave CNBV</th><th>Tipo</th><th>Clasificación</th><th>Activo neto diario</th></tr></thead><tbody>${fundsRows}</tbody></table><h2>Qué significa y qué no</h2><p>CNBV define activo neto como la diferencia entre activos y pasivos del fondo. No equivale al precio de una serie, rendimiento, comisión, liquidez ni monto disponible para invertir.</p><h2>Antes de evaluar un fondo concreto</h2><p>Hace falta revisar serie, prospecto, régimen de inversión, comisiones, recompra, precio, rendimiento histórico fechado, distribuidora y custodia.</p><h2>Fuente</h2><p>${esc(CNBV_FUND_SAMPLE.sourceLabel)}. Última revisión de MiLana: ${esc(CNBV_FUND_SAMPLE.checkedAt)}.</p><p><a href="${esc(CNBV_FUND_SAMPLE.sourceUrl)}">Abrir Portafolio de Información CNBV</a> · <a href="/finanzas/inversion/comparar">Comparar familias</a> · <a href="/finanzas/inversion/cetes">Ver CETES</a></p></main></div>`;

generarPagina({ url:fundsUrl, titulo:fundsTitle, descripcion:fundsDescription, schemaName:'Muestra regulatoria de fondos CNBV MiLana', breadcrumbs:[{name:'Inicio',item:'https://www.milanaaqui.mx/'},{name:'Finanzas',item:'https://www.milanaaqui.mx/finanzas'},{name:'Antes de invertir',item:url},{name:'Fondos CNBV',item:fundsUrl}], cuerpo:fundsBody, destino:['finanzas','inversion','fondos'] });

console.log('inversión educativa: mapa, comparador, CETES y fondos CNBV generados');
