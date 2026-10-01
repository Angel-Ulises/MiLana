import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(RAIZ, 'dist');
const datos = JSON.parse(readFileSync(resolve(RAIZ, 'src/data/economia.json'), 'utf8'));
const site = JSON.parse(readFileSync(resolve(RAIZ, 'src/data/paginas.json'), 'utf8'));
const origen = site.sitio.origen;
const plantilla = readFileSync(resolve(DIST, 'index.html'), 'utf8');
const escapar = (v) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function meta(html, clave, valor, propiedad=false){
  const attr = propiedad ? 'property' : 'name';
  const re = new RegExp(`<meta\\s+${attr}=["']${clave}["'][^>]*>`, 'i');
  const tag = `<meta ${attr}="${clave}" content="${escapar(valor)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function cabecera(html, { titulo, descripcion, url, schema }){
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '');
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapar(titulo)}</title>`);
  html = meta(html, 'description', descripcion);
  html = meta(html, 'og:title', titulo, true);
  html = meta(html, 'og:description', descripcion, true);
  html = meta(html, 'og:url', url, true);
  html = meta(html, 'og:type', 'article', true);
  html = meta(html, 'twitter:title', titulo);
  html = meta(html, 'twitter:description', descripcion);
  const canonical = `<link rel="canonical" href="${url}" />`;
  html = /<link\s+rel=["']canonical["'][^>]*>/i.test(html)
    ? html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonical)
    : html.replace('</head>', `    ${canonical}\n  </head>`);
  return html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`);
}

function fuenteDe(a){ return datos.fuentes.find((f) => f.id === a.fuenteId); }

function cuerpoHub(){
  const articulos = [...datos.articulos].sort((a,b)=>b.fecha.localeCompare(a.fecha)).map((a)=>`<li><a href="/economia/${a.slug}"><strong>${escapar(a.titulo)}</strong></a> — ${escapar(a.datoPrincipal)} ${escapar(a.datoEtiqueta)} · ${escapar(a.fuenteFecha)}</li>`).join('');
  const fuentes = datos.fuentes.map((f)=>`<li><strong>${escapar(f.nombre)}</strong> — ${escapar(f.cadencia)} · próxima revisión ${escapar(f.proximaRevision)}</li>`).join('');
  return `<div id="root"><main data-static-seo="economia"><nav aria-label="Ruta"><a href="/">Inicio</a> / Economía</nav><h1>Radar económico de MiLana</h1><p>Inflación, tasas, empleo, consumo y regiones explicados desde publicaciones oficiales y conectados con herramientas de finanzas personales. MiLana no convierte una noticia en recomendación financiera personalizada.</p><h2>Señales recientes</h2><ul>${articulos}</ul><h2>Cómo se lee el Radar</h2><ol><li>Qué pasó.</li><li>Por qué importa.</li><li>A quién puede afectar.</li><li>Qué herramienta sirve para aterrizarlo a números propios.</li></ol><h2>Fuentes vigiladas</h2><ul>${fuentes}</ul></main></div>`;
}

function cuerpoArticulo(a){
  const f = fuenteDe(a);
  return `<div id="root"><main data-static-seo="economia"><nav aria-label="Ruta"><a href="/">Inicio</a> / <a href="/economia">Economía</a> / ${escapar(a.categoria)}</nav><p>${escapar(a.categoria)} · ${escapar(a.fuenteFecha)}</p><h1>${escapar(a.titulo)}</h1><p>${escapar(a.descripcion)}</p><p><strong>${escapar(a.datoPrincipal)}</strong> — ${escapar(a.datoEtiqueta)}</p><h2>Qué pasó</h2><p>${escapar(a.quePaso)}</p><h2>Por qué importa</h2><p>${escapar(a.porQueImporta)}</p><h2>A quién afecta</h2><p>${escapar(a.aQuienAfecta)}</p><h2>Qué hacer con la información</h2><p>${escapar(a.queHacer)}</p><p><a href="${escapar(a.herramienta.href)}">${escapar(a.herramienta.texto)}</a> · <a href="${escapar(a.herramientaSecundaria.href)}">${escapar(a.herramientaSecundaria.texto)}</a></p><p><strong>Fuente oficial:</strong> ${escapar(f?.nombre || a.fuenteId)}. Publicación o actualización: ${escapar(a.fuenteFecha)}.</p><p>${escapar(datos.nota)}</p></main></div>`;
}

function generarHub(){
  const url = `${origen}/economia`;
  const titulo = 'Economía y finanzas en México: Radar económico | MiLana';
  const descripcion = 'Inflación, tasas, empleo, consumo y regiones explicados con fuentes oficiales y conectados con herramientas de finanzas personales de MiLana.';
  const schema = {'@context':'https://schema.org','@graph':[
    {'@type':'CollectionPage',name:'Radar económico de MiLana',url,description:descripcion,inLanguage:'es-MX',publisher:{'@type':'Organization',name:'MiLana',url:origen}},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Inicio',item:`${origen}/`},{'@type':'ListItem',position:2,name:'Economía',item:url}]}
  ]};
  let html = cabecera(plantilla,{titulo,descripcion,url,schema});
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/i,cuerpoHub());
  const destino = resolve(DIST,'economia','index.html'); mkdirSync(dirname(destino),{recursive:true}); writeFileSync(destino,html,'utf8');
}

function generarArticulo(a){
  const url = `${origen}/economia/${a.slug}`;
  const titulo = `${a.titulo} | MiLana`;
  const f = fuenteDe(a);
  const schema = {'@context':'https://schema.org','@graph':[
    {'@type':'Article',headline:a.titulo,description:a.descripcion,datePublished:a.fecha,dateModified:datos.actualizado,inLanguage:'es-MX',mainEntityOfPage:url,author:{'@type':'Organization',name:'MiLana'},publisher:{'@type':'Organization',name:'MiLana',url:origen},citation:f?.nombre || a.fuenteId},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Inicio',item:`${origen}/`},{'@type':'ListItem',position:2,name:'Economía',item:`${origen}/economia`},{'@type':'ListItem',position:3,name:a.titulo,item:url}]}
  ]};
  let html = cabecera(plantilla,{titulo,descripcion:a.descripcion,url,schema});
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/i,cuerpoArticulo(a));
  const destino = resolve(DIST,'economia',a.slug,'index.html'); mkdirSync(dirname(destino),{recursive:true}); writeFileSync(destino,html,'utf8');
}

generarHub();
datos.articulos.forEach(generarArticulo);
console.log(`economia: 1 hub + ${datos.articulos.length} artículos estáticos generados`);
