import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CALCULADORAS_HUB, GRUPOS_HUB } from '../src/lib/calculatorsHub.js';

// HTML estático de /calculadoras: el mismo catálogo por situación que monta React.
const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(RAIZ, 'dist');
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

const url = `${origen}/calculadoras`;
const titulo = 'Calculadoras laborales y de sueldo 2026 en México | MiLana';
const descripcion = 'Finiquito, liquidación, aguinaldo, ISR, RESICO, PTU, bruto a neto, vacaciones, Infonavit y pensión IMSS: elige la calculadora según tu situación, gratis y con fuentes oficiales.';
const schema = {'@context':'https://schema.org','@graph':[
  {'@type':'CollectionPage',name:'Calculadoras de MiLana',url,description:descripcion,inLanguage:'es-MX',publisher:{'@type':'Organization',name:'MiLana',url:origen},
    hasPart:Object.values(CALCULADORAS_HUB).map((c)=>({'@type':'WebApplication',name:c.nombre,url:`${origen}${c.href}`,applicationCategory:'FinanceApplication',operatingSystem:'Web',offers:{'@type':'Offer',price:'0',priceCurrency:'MXN'}}))},
  {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Inicio',item:`${origen}/`},{'@type':'ListItem',position:2,name:'Calculadoras',item:url}]}
]};

let html = plantilla.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '');
html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapar(titulo)}</title>`);
html = meta(html, 'description', descripcion);
html = meta(html, 'og:title', titulo, true);
html = meta(html, 'og:description', descripcion, true);
html = meta(html, 'og:url', url, true);
html = meta(html, 'og:type', 'website', true);
html = meta(html, 'twitter:title', titulo);
html = meta(html, 'twitter:description', descripcion);
const canonical = `<link rel="canonical" href="${url}" />`;
html = /<link\s+rel=["']canonical["'][^>]*>/i.test(html)
  ? html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonical)
  : html.replace('</head>', `    ${canonical}\n  </head>`);
html = html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`);

const grupos = GRUPOS_HUB.map((g) => `<h2>${escapar(g.titulo)}</h2><ul>${g.ids.map((id) => {
  const c = CALCULADORAS_HUB[id];
  return `<li><a href="${c.href}"><strong>${escapar(c.nombre)}</strong></a> — ${escapar(c.usala)}</li>`;
}).join('')}</ul><p><a href="${g.aprende.href}">${escapar(g.aprende.texto)}</a></p>`).join('');
const cuerpo = `<div id="root"><main data-static-seo="calculadoras"><nav aria-label="Ruta"><a href="/">Inicio</a> / Calculadoras</nav><h1>Calculadoras de trabajo y sueldo</h1><p>Gratis, sin registro y con la fuente de cada cifra. Elige según lo que te está pasando.</p>${grupos}<h2>¿Ya tienes tu resultado?</h2><p>Llévalo a tu presupuesto para ver cuánto te queda cada mes: <a href="/finanzas/presupuesto">Ordenar mi dinero</a>.</p></main></div>`;
if (!/<div id="root">[\s\S]*?<\/div>/i.test(html)) throw new Error('calculadoras: no se encontró #root en la plantilla');
html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, cuerpo);

const destino = resolve(DIST, 'calculadoras', 'index.html');
mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, html, 'utf8');
console.log('calculadoras: hub estático generado');
