import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(RAIZ, 'dist');
const datos = JSON.parse(readFileSync(resolve(RAIZ, 'src/data/carreras.json'), 'utf8'));
const paginasSite = JSON.parse(readFileSync(resolve(RAIZ, 'src/data/paginas.json'), 'utf8'));
const origen = paginasSite.sitio.origen;
const plantilla = readFileSync(resolve(DIST, 'index.html'), 'utf8');

const escapar = (valor) => String(valor ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const dinero = (n) => new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN', maximumFractionDigits:0 }).format(n);
const numero = (n) => new Intl.NumberFormat('es-MX').format(n);

function meta(html, clave, valor, propiedad=false) {
  const attr = propiedad ? 'property' : 'name';
  const re = new RegExp(`<meta\\s+${attr}=["']${clave}["'][^>]*>`, 'i');
  const tag = `<meta ${attr}="${clave}" content="${escapar(valor)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function tabla(rows, metrica='ingreso') {
  return `<ol>${rows.map((r) => `<li><strong>${escapar(r.carrera)}</strong> — ${metrica === 'ocupados' ? `${numero(r.ocupados)} profesionistas ocupados` : `${dinero(r.ingreso)} mensuales`} · ${metrica === 'ocupados' ? `${dinero(r.ingreso)} de ingreso promedio` : `${numero(r.ocupados)} profesionistas ocupados`}</li>`).join('')}</ol>`;
}

function cuerpo(p) {
  const fuente = `<p><strong>Fuente:</strong> ${escapar(datos.fuente)}. ${escapar(datos.nota)}</p>`;
  const nav = `<nav aria-label="Ruta"><a href="/">Inicio</a> / <a href="/carreras">Carreras</a></nav>`;
  const enlaces = `<h2>Sigue comparando</h2><ul>
    <li><a href="/carreras/mejor-pagadas">Carreras mejor pagadas</a></li>
    <li><a href="/carreras/mas-demandadas">Carreras con más profesionistas ocupados</a></li>
    <li><a href="/carreras/por-estado">Sueldos profesionales por estado</a></li>
    <li><a href="/carreras/peor-pagadas">Carreras con menor ingreso promedio</a></li>
    <li><a href="/calculadoras/bruto-a-neto">Calculadora de sueldo bruto a neto</a></li>
  </ul>`;

  if (p.id === 'carreras') return `<div id="root"><main data-static-seo="carreras">${nav}<h1>Carreras, empleos y salarios en México 2026</h1><p>Explora ingresos promedio, tamaño de la población profesional y diferencias regionales con datos públicos de México. MiLana separa salario, ocupación y demanda para no convertir una sola cifra en una recomendación de carrera.</p><h2>Preguntas para empezar</h2><ul><li><a href="/carreras/mejor-pagadas">¿Qué carreras pagan mejor?</a></li><li><a href="/carreras/mas-demandadas">¿Qué carreras tienen más profesionistas ocupados?</a></li><li><a href="/carreras/por-estado">¿Dónde ganan más los profesionistas?</a></li><li><a href="/carreras/peor-pagadas">¿Qué carreras reportan menor ingreso promedio?</a></li></ul><h2>Una referencia nacional</h2><p>Al segundo trimestre de 2026, el Observatorio Laboral reporta un ingreso promedio mensual de $19,494 para profesionistas ocupados en México.</p>${fuente}<p><a href="/calculadoras/bruto-a-neto">Convierte un salario bruto en ingreso neto estimado</a>.</p></main></div>`;

  if (p.id === 'mejor-pagadas') return `<div id="root"><main data-static-seo="carreras">${nav}<h1>Carreras mejor pagadas en México 2026</h1><p>El ingreso promedio mensual permite comparar grupos profesionales, pero no equivale a sueldo inicial ni garantiza lo que ganará una persona.</p>${tabla(datos.mejorPagadas)}<h2>Cómo leer el ranking</h2><p>Compara también el número de profesionistas ocupados, la ubicación, la experiencia y el tipo de empleo. Un promedio alto en una población pequeña describe un mercado distinto al de una carrera masiva.</p>${fuente}${enlaces}</main></div>`;

  if (p.id === 'mas-demandadas') return `<div id="root"><main data-static-seo="carreras">${nav}<h1>Carreras más demandadas en México 2026: qué sí mide el dato</h1><p>La cantidad de profesionistas ocupados describe el tamaño observado de un mercado laboral, pero no es lo mismo que vacantes disponibles ni crecimiento futuro. MiLana muestra esta métrica sin llamarla demanda empresarial.</p>${tabla(datos.masOcupadas,'ocupados')}<h2>Por qué ocupación no significa demanda</h2><p>Para evaluar demanda conviene separar población ocupada, nuevas vacantes o contrataciones, crecimiento y salario. La tabla de esta página solo usa población profesional ocupada e ingreso promedio.</p>${fuente}${enlaces}</main></div>`;

  if (p.id === 'por-estado') return `<div id="root"><main data-static-seo="carreras">${nav}<h1>Sueldos de profesionistas por estado en México 2026</h1><p>El ingreso promedio profesional cambia por entidad. Esta comparación usa el mismo corte de la ENOE para los 32 estados.</p><table><thead><tr><th>Estado</th><th>Profesionistas ocupados</th><th>Ingreso mensual promedio</th></tr></thead><tbody>${[...datos.estados].sort((a,b)=>b.ingreso-a.ingreso).map((e)=>`<tr><td>${escapar(e.estado)}</td><td>${numero(e.ocupados)}</td><td>${dinero(e.ingreso)}</td></tr>`).join('')}</tbody></table>${fuente}${enlaces}</main></div>`;

  return `<div id="root"><main data-static-seo="carreras">${nav}<h1>Carreras peor pagadas en México 2026: cómo comparar ingresos</h1><p>“Peor pagada” es una búsqueda común, pero el indicador que realmente podemos observar es ingreso promedio mensual. Un promedio bajo no convierte una profesión en una mala elección.</p>${tabla(datos.menorIngreso)}<h2>Qué falta antes de decidir</h2><p>Además del ingreso, revisa estabilidad, afinidad entre estudios y ocupación, región, crecimiento, costo de estudiar y trayectoria individual. Esta lista ordena las categorías disponibles que MiLana ha revisado, no todos los programas universitarios existentes.</p>${fuente}${enlaces}</main></div>`;
}

function construir(p) {
  const ruta = p.slug ? `/carreras/${p.slug}` : '/carreras';
  const url = `${origen}${ruta}`;
  let html = plantilla;
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '');
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapar(p.titulo)}</title>`);
  html = meta(html, 'description', p.descripcion);
  html = meta(html, 'og:title', p.titulo, true);
  html = meta(html, 'og:description', p.descripcion, true);
  html = meta(html, 'og:url', url, true);
  html = meta(html, 'og:type', 'website', true);
  html = meta(html, 'twitter:title', p.titulo);
  html = meta(html, 'twitter:description', p.descripcion);
  const canonical = `<link rel="canonical" href="${url}" />`;
  html = /<link\s+rel=["']canonical["'][^>]*>/i.test(html)
    ? html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonical)
    : html.replace('</head>', `    ${canonical}\n  </head>`);

  const schema = {
    '@context':'https://schema.org',
    '@graph':[
      {
        '@type': p.id === 'carreras' ? 'CollectionPage' : 'WebPage',
        name: p.titulo.split('|')[0].trim(), url, description:p.descripcion, inLanguage:'es-MX',
        publisher:{ '@type':'Organization', name:'MiLana', url:origen }
      },
      {
        '@type':'BreadcrumbList',
        itemListElement:[
          { '@type':'ListItem', position:1, name:'Inicio', item:`${origen}/` },
          { '@type':'ListItem', position:2, name:'Carreras', item:`${origen}/carreras` },
          ...(p.id === 'carreras' ? [] : [{ '@type':'ListItem', position:3, name:p.titulo.split('|')[0].trim(), item:url }])
        ]
      }
    ]
  };
  html = html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`);
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, cuerpo(p));
  const destino = resolve(DIST, 'carreras', p.slug || '', 'index.html');
  mkdirSync(dirname(destino), { recursive:true });
  writeFileSync(destino, html, 'utf8');
}

datos.paginas.forEach(construir);
console.log(`carreras: ${datos.paginas.length} páginas estáticas generadas`);
