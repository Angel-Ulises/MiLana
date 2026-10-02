import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(RAIZ, 'dist');
const datos = JSON.parse(readFileSync(resolve(RAIZ, 'src/data/finanzas.json'), 'utf8'));
const site = JSON.parse(readFileSync(resolve(RAIZ, 'src/data/paginas.json'), 'utf8'));
const origen = site.sitio.origen;
const plantilla = readFileSync(resolve(DIST, 'index.html'), 'utf8');
const escapar = (v)=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function meta(html, clave, valor, propiedad=false){
  const attr=propiedad?'property':'name';
  const re=new RegExp(`<meta\\s+${attr}=["']${clave}["'][^>]*>`,'i');
  const tag=`<meta ${attr}="${clave}" content="${escapar(valor)}" />`;
  return re.test(html)?html.replace(re,tag):html.replace('</head>',`    ${tag}\n  </head>`);
}

function cuerpo(p){
  const nav='<nav aria-label="Ruta"><a href="/">Inicio</a> / <a href="/finanzas">Finanzas</a></nav>';
  const nota=`<p><strong>Alcance:</strong> ${escapar(datos.nota)}</p>`;
  if(p.id==='finanzas') return `<div id="root"><main data-static-seo="finanzas">${nav}<h1>Finanzas personales en México</h1><p>MiLana conecta ingreso, gastos, deuda, ahorro, vivienda y retiro con herramientas que explican sus supuestos.</p><h2>Empieza por una pregunta</h2><ul><li><a href="/finanzas/presupuesto">¿Cuánto me queda cada mes?</a></li><li><a href="/finanzas/fondo-emergencia">¿Cuánto necesito para un fondo de emergencia?</a></li><li><a href="/finanzas/deuda-y-credito">¿Cuánto de mi ingreso ya está comprometido en deuda?</a></li><li><a href="/finanzas/ahorro">¿Cuánto tardaría en alcanzar una meta de ahorro?</a></li><li><a href="/finanzas/vivienda">¿Qué revisar antes de rentar o comprar vivienda?</a></li><li><a href="/finanzas/inversion">¿Qué revisar antes de comparar inversiones?</a></li></ul>${nota}</main></div>`;
  if(p.id==='presupuesto') return `<div id="root"><main data-static-seo="finanzas">${nav}<h1>Calculadora de presupuesto mensual</h1><p>Compara ingreso neto mensual con gastos esenciales, gastos variables y pagos de deuda. La diferencia muestra cuánto dinero queda disponible después de los rubros capturados.</p><h2>Cómo se calcula</h2><p><strong>Disponible = ingreso neto − gastos esenciales − gastos variables − pagos de deuda.</strong> La herramienta también muestra qué porcentaje del ingreso representan los pagos de deuda.</p><h2>Cómo usar el resultado</h2><p>Un saldo positivo puede dirigirse a metas como fondo de emergencia o ahorro. Un saldo negativo indica que los gastos capturados superan el ingreso capturado, pero no asume que todos los gastos puedan eliminarse.</p><p><strong>Fuente conceptual:</strong> ${escapar(datos.fuentes.presupuesto.nombre)}, ${escapar(datos.fuentes.presupuesto.fecha)}.</p>${nota}</main></div>`;
  if(p.id==='fondo-emergencia') return `<div id="root"><main data-static-seo="finanzas">${nav}<h1>Calculadora de fondo de emergencia</h1><p>CONDUSEF utiliza como referencia un fondo equivalente a entre 3 y 6 meses de gastos esenciales. MiLana calcula ambos extremos y estima el tiempo necesario según el ahorro que ya tienes y la aportación mensual que tú elijas.</p><h2>Cómo se calcula</h2><p><strong>Meta mínima = gastos esenciales mensuales × 3.</strong> <strong>Meta amplia = gastos esenciales mensuales × 6.</strong> El tiempo estimado divide lo que falta por la aportación mensual elegida, sin suponer rendimientos.</p><h2>Qué no hace la herramienta</h2><p>No selecciona productos financieros ni presupone tasas de rendimiento. Para un fondo de emergencia, la referencia oficial prioriza disponibilidad, seguridad y separación del dinero de uso diario.</p><p><strong>Fuente:</strong> ${escapar(datos.fuentes.fondo.nombre)}, ${escapar(datos.fuentes.fondo.fecha)}.</p>${nota}</main></div>`;
  if(p.id==='deuda-credito') return `<div id="root"><main data-static-seo="finanzas">${nav}<h1>Deuda y crédito: cuánto ingreso ya está comprometido</h1><p>La herramienta divide los pagos mensuales de todas tus deudas entre tu ingreso neto mensual. El porcentaje es descriptivo: no determina aprobación, capacidad crediticia oficial ni si una deuda es adecuada.</p><h2>Qué comparar antes de contratar un crédito</h2><ul><li>Costo Anual Total (CAT).</li><li>Tasa de interés.</li><li>Comisiones y seguros.</li><li>Monto total a pagar.</li><li>Pago periódico y plazo.</li></ul><p>CONDUSEF señala que el CAT integra elementos de costo que permiten comparar productos; no es lo mismo que mirar solo la tasa o la mensualidad.</p><p><strong>Fuente conceptual:</strong> ${escapar(datos.fuentes.credito.nombre)}.</p>${nota}</main></div>`;
  if(p.id==='ahorro') return `<div id="root"><main data-static-seo="finanzas">${nav}<h1>Calculadora de meta de ahorro</h1><p>Define una meta, registra cuánto ya tienes y cuánto planeas aportar al mes. MiLana estima cuántos meses tomaría alcanzar la meta sin suponer intereses ni rendimientos.</p><h2>Cómo se calcula</h2><p><strong>Faltante = meta − ahorro actual.</strong> <strong>Meses estimados = faltante ÷ aportación mensual.</strong> El resultado se redondea hacia arriba porque una meta no se alcanza con una fracción incompleta de aportación mensual.</p><h2>Por qué no se incluye rendimiento por defecto</h2><p>La tasa futura depende del instrumento, plazo y condiciones. Para no convertir una hipótesis en certeza, la versión base muestra el escenario de aportación constante.</p><p><strong>Fuente conceptual:</strong> ${escapar(datos.fuentes.ahorro.nombre)}, ${escapar(datos.fuentes.ahorro.fecha)}.</p>${nota}</main></div>`;
  return `<div id="root"><main data-static-seo="finanzas">${nav}<h1>Vivienda: antes de rentar o comprar</h1><p>MiLana propone ordenar cinco números antes de comparar vivienda: ingreso neto, presupuesto, fondo de emergencia, pagos de deuda y condiciones del financiamiento.</p><ol><li><a href="/calculadoras/bruto-a-neto">Estima tu ingreso neto.</a></li><li><a href="/finanzas/presupuesto">Revisa cuánto queda después de gastos.</a></li><li><a href="/finanzas/fondo-emergencia">Separa el respaldo de una meta de vivienda.</a></li><li><a href="/finanzas/deuda-y-credito">Haz visible cuánto ingreso ya está comprometido.</a></li><li><a href="/calculadoras/infonavit">Después compara un escenario de Infonavit.</a></li></ol><p>La ruta no decide si conviene rentar o comprar; organiza información para comparar escenarios.</p>${nota}</main></div>`;
}

function construir(p){
  const ruta=p.slug?`/finanzas/${p.slug}`:'/finanzas';
  const url=`${origen}${ruta}`;
  let html=plantilla.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi,'');
  html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${escapar(p.titulo)}</title>`);
  html=meta(html,'description',p.descripcion); html=meta(html,'og:title',p.titulo,true); html=meta(html,'og:description',p.descripcion,true); html=meta(html,'og:url',url,true); html=meta(html,'og:type','website',true); html=meta(html,'twitter:title',p.titulo); html=meta(html,'twitter:description',p.descripcion);
  const canonical=`<link rel="canonical" href="${url}" />`;
  html=/<link\s+rel=["']canonical["'][^>]*>/i.test(html)?html.replace(/<link\s+rel=["']canonical["'][^>]*>/i,canonical):html.replace('</head>',`    ${canonical}\n  </head>`);
  const schema={'@context':'https://schema.org','@graph':[
    {'@type':p.id==='finanzas'?'CollectionPage':'WebPage',name:p.titulo.split('|')[0].trim(),url,description:p.descripcion,inLanguage:'es-MX',publisher:{'@type':'Organization',name:'MiLana',url:origen}},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Inicio',item:`${origen}/`},{'@type':'ListItem',position:2,name:'Finanzas',item:`${origen}/finanzas`},...(p.id==='finanzas'?[]:[{'@type':'ListItem',position:3,name:p.titulo.split('|')[0].trim(),item:url}])]}
  ]};
  html=html.replace('</head>',`    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`);
  html=html.replace(/<div id="root">[\s\S]*?<\/div>/i,cuerpo(p));
  const destino=resolve(DIST,'finanzas',p.slug||'','index.html'); mkdirSync(dirname(destino),{recursive:true}); writeFileSync(destino,html,'utf8');
}

datos.paginas.forEach(construir);
console.log(`finanzas: ${datos.paginas.length} páginas estáticas generadas`);
