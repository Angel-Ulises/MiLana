import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(RAIZ, 'dist');
const datos = JSON.parse(readFileSync(resolve(RAIZ, 'src/data/carreras.json'), 'utf8'));
const profesiones = JSON.parse(readFileSync(resolve(RAIZ, 'src/data/profesiones.json'), 'utf8'));
const ocupacionesEstados = JSON.parse(readFileSync(resolve(RAIZ, 'src/data/stateOccupations.json'), 'utf8'));
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

function cabecera(html, { titulo, descripcion, url, tipo='WebPage', breadcrumbs=[] }) {
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '');
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
  const schema = {
    '@context':'https://schema.org',
    '@graph':[
      { '@type':tipo, name:titulo.split('|')[0].trim(), url, description:descripcion, inLanguage:'es-MX', publisher:{ '@type':'Organization', name:'MiLana', url:origen } },
      { '@type':'BreadcrumbList', itemListElement:breadcrumbs.map((b,i)=>({ '@type':'ListItem', position:i+1, name:b.nombre, item:b.url })) }
    ]
  };
  return html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`);
}

function tabla(rows, metrica='ingreso') {
  return `<ol>${rows.map((r) => `<li><strong>${escapar(r.carrera)}</strong> — ${metrica === 'ocupados' ? `${numero(r.ocupados)} profesionistas ocupados` : `${dinero(r.ingreso)} mensuales`} · ${metrica === 'ocupados' ? `${dinero(r.ingreso)} de ingreso promedio` : `${numero(r.ocupados)} profesionistas ocupados`}</li>`).join('')}</ol>`;
}

function resumenOcupacionalEstados() {
  return ocupacionesEstados.states.map((estado) => {
    const principal = estado.occupations[0];
    return `<li><a href="/estados/${estado.slug}">${escapar(estado.state)}</a> — ${escapar(principal.occupation)}: ${numero(principal.workforce)} personas ocupadas observadas</li>`;
  }).join('');
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
  const perfiles = profesiones.profesiones.map((x)=>`<li><a href="/carreras/profesion/${x.slug}">${escapar(x.consulta)}</a> — ${dinero(x.ingreso)} de ingreso promedio mensual</li>`).join('');

  if (p.id === 'carreras') return `<div id="root"><main data-static-seo="carreras">${nav}<h1>Carreras, empleos y salarios en México 2026</h1><p>Explora ingresos promedio, tamaño de la población profesional y diferencias regionales con datos públicos de México. MiLana separa salario, ocupación y demanda para no convertir una sola cifra en una recomendación de carrera.</p><h2>Preguntas para empezar</h2><ul><li><a href="/carreras/mejor-pagadas">¿Qué carreras pagan más en México?</a></li><li><a href="/carreras/mas-demandadas">¿Cuáles concentran más profesionistas ocupados?</a></li><li><a href="/carreras/por-estado">¿Cuánto ganan los profesionistas en mi estado?</a></li><li><a href="/carreras/por-estado">¿Qué trabajos concentran más personas en mi estado?</a></li><li><a href="/carreras/comparar">¿Cómo comparo dos carreras sin elegir solo por sueldo?</a></li><li><a href="/carreras/ocupaciones">¿Carrera estudiada y ocupación son lo mismo?</a></li><li><a href="/carreras/profesion/ciencias-computacion">¿Cuánto gana alguien de Ciencias de la computación?</a></li><li><a href="/carreras/profesion/derecho">¿Cuánto gana alguien de Derecho?</a></li><li><a href="/calculadoras/bruto-a-neto">¿Cuánto quedaría neto de un sueldo?</a></li></ul><h2>¿Cuánto gana una profesión?</h2><ul>${perfiles}</ul><h2>Una referencia nacional</h2><p>Al segundo trimestre de 2026, el Observatorio Laboral reporta un ingreso promedio mensual de $19,494 para profesionistas ocupados en México.</p>${fuente}<p><a href="/calculadoras/bruto-a-neto">Convierte un salario bruto en ingreso neto estimado</a>.</p></main></div>`;
  if (p.id === 'mejor-pagadas') return `<div id="root"><main data-static-seo="carreras">${nav}<h1>Carreras mejor pagadas en México 2026</h1><p>El ingreso promedio mensual permite comparar grupos profesionales, pero no equivale a sueldo inicial ni garantiza lo que ganará una persona.</p>${tabla(datos.mejorPagadas)}<h2>Cómo leer el ranking</h2><p>Compara también el número de profesionistas ocupados, la ubicación, la experiencia y el tipo de empleo. Un promedio alto en una población pequeña describe un mercado distinto al de una carrera masiva.</p>${fuente}${enlaces}</main></div>`;
  if (p.id === 'mas-demandadas') return `<div id="root"><main data-static-seo="carreras">${nav}<h1>Carreras más demandadas en México 2026: qué sí mide el dato</h1><p>La cantidad de profesionistas ocupados describe el tamaño observado de un mercado laboral, pero no es lo mismo que vacantes disponibles ni crecimiento futuro. MiLana muestra esta métrica sin llamarla demanda empresarial.</p>${tabla(datos.masOcupadas,'ocupados')}<h2>Por qué ocupación no significa demanda</h2><p>Para evaluar demanda conviene separar población ocupada, nuevas vacantes o contrataciones, crecimiento y salario. La tabla de esta página solo usa población profesional ocupada e ingreso promedio.</p>${fuente}${enlaces}</main></div>`;
  if (p.id === 'por-estado') return `<div id="root"><main data-static-seo="carreras">${nav}<h1>Sueldos de profesionistas por estado en México 2026</h1><p>El ingreso promedio profesional cambia por entidad. Esta comparación usa el mismo corte de la ENOE para los 32 estados.</p><table><thead><tr><th>Estado</th><th>Profesionistas ocupados</th><th>Ingreso mensual promedio</th></tr></thead><tbody>${[...datos.estados].sort((a,b)=>b.ingreso-a.ingreso).map((e)=>`<tr><td>${escapar(e.estado)}</td><td>${numero(e.ocupados)}</td><td>${dinero(e.ingreso)}</td></tr>`).join('')}</tbody></table><h2>¿Qué trabajos concentran más personas en cada estado?</h2><p>Data México, con ENOE 2026-T1, permite observar población ocupada por ocupación. <strong>Ocupación no equivale a carrera estudiada, vacante abierta ni demanda futura.</strong></p><ul>${resumenOcupacionalEstados()}</ul><p><strong>Fuente ocupacional:</strong> ${escapar(ocupacionesEstados.source.name)}. ${escapar(ocupacionesEstados.source.note)}</p>${fuente}${enlaces}</main></div>`;
  return `<div id="root"><main data-static-seo="carreras">${nav}<h1>Carreras peor pagadas en México 2026: cómo comparar ingresos</h1><p>“Peor pagada” es una búsqueda común, pero el indicador que realmente podemos observar es ingreso promedio mensual. Un promedio bajo no convierte una profesión en una mala elección.</p>${tabla(datos.menorIngreso)}<h2>Qué falta antes de decidir</h2><p>Además del ingreso, revisa estabilidad, afinidad entre estudios y ocupación, región, crecimiento, costo de estudiar y trayectoria individual. Esta lista ordena las categorías disponibles que MiLana ha revisado, no todos los programas universitarios existentes.</p>${fuente}${enlaces}</main></div>`;
}

function construir(p) {
  const ruta = p.slug ? `/carreras/${p.slug}` : '/carreras';
  const url = `${origen}${ruta}`;
  let html = cabecera(plantilla, {
    titulo:p.titulo, descripcion:p.descripcion, url, tipo:p.id === 'carreras' ? 'CollectionPage' : 'WebPage',
    breadcrumbs:[{nombre:'Inicio',url:`${origen}/`},{nombre:'Carreras',url:`${origen}/carreras`},...(p.id==='carreras'?[]:[{nombre:p.titulo.split('|')[0].trim(),url}])]
  });
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, cuerpo(p));
  const destino = resolve(DIST, 'carreras', p.slug || '', 'index.html');
  mkdirSync(dirname(destino), { recursive:true });
  writeFileSync(destino, html, 'utf8');
}

function construirProfesion(p) {
  const ruta = `/carreras/profesion/${p.slug}`;
  const url = `${origen}${ruta}`;
  const titulo = `${p.consulta.replace(/\?$/, '')} 2026 | MiLana`;
  const descripcion = `${p.nombre}: ${dinero(p.ingreso)} de ingreso mensual promedio y ${numero(p.ocupados)} profesionistas ocupados en México, con cifras ENOE 2026-T2.`;
  const diferencia = p.ingreso - profesiones.promedioNacional;
  const pct = (diferencia / profesiones.promedioNacional) * 100;
  const relacionados = profesiones.profesiones.filter((x)=>x.slug!==p.slug).sort((a,b)=>Math.abs(a.ingreso-p.ingreso)-Math.abs(b.ingreso-p.ingreso)).slice(0,4);
  const cuerpoProf = `<div id="root"><main data-static-seo="profesion"><nav aria-label="Ruta"><a href="/">Inicio</a> / <a href="/carreras">Carreras</a> / ${escapar(p.nombre)}</nav><h1>${escapar(p.consulta)}</h1><p>El Observatorio Laboral reporta un ingreso mensual promedio de <strong>${dinero(p.ingreso)}</strong> para profesionistas ocupados en ${escapar(p.nombre)}. La cifra no equivale a sueldo inicial ni garantiza un ingreso individual.</p><h2>Datos del mercado profesional</h2><ul><li><strong>Ingreso promedio mensual:</strong> ${dinero(p.ingreso)}</li><li><strong>Profesionistas ocupados:</strong> ${numero(p.ocupados)}</li><li><strong>Área:</strong> ${escapar(p.area)}</li><li><strong>Comparación con promedio profesional nacional:</strong> ${diferencia>=0?'+':''}${pct.toFixed(1)}%</li><li><strong>Distribución observada:</strong> ${p.hombres}% hombres y ${p.mujeres}% mujeres entre profesionistas ocupados</li></ul><h2>Cómo leer este dato</h2><p>El promedio agrupa personas con distintas edades, regiones, experiencias y condiciones laborales. Sirve como referencia para comparar grupos, pero no predice el sueldo de una persona recién egresada ni una oferta de trabajo específica.</p><h2>Del promedio a tus finanzas</h2><p><a href="/calculadoras/bruto-a-neto">Prueba ${dinero(p.ingreso)} en la calculadora Bruto a Neto</a> y después <a href="/finanzas/presupuesto">llévalo a un presupuesto mensual</a>.</p><h2>Profesiones con ingresos cercanos</h2><ul>${relacionados.map((r)=>`<li><a href="/carreras/profesion/${r.slug}">${escapar(r.nombre)}</a> — ${dinero(r.ingreso)}/mes</li>`).join('')}</ul><p><strong>Fuente:</strong> ${escapar(profesiones.fuenteGeneral)}. ${escapar(profesiones.nota)}</p></main></div>`;
  let html = cabecera(plantilla, { titulo, descripcion, url, breadcrumbs:[{nombre:'Inicio',url:`${origen}/`},{nombre:'Carreras',url:`${origen}/carreras`},{nombre:p.nombre,url}] });
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, cuerpoProf);
  const destino = resolve(DIST, 'carreras', 'profesion', p.slug, 'index.html');
  mkdirSync(dirname(destino), { recursive:true });
  writeFileSync(destino, html, 'utf8');
}

datos.paginas.forEach(construir);
profesiones.profesiones.forEach(construirProfesion);
console.log(`carreras: ${datos.paginas.length} hubs + ${profesiones.profesiones.length} perfiles profesionales generados`);
