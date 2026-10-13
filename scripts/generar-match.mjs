// HTML estático de MiLana Match: contenido completo e indexable antes de que cargue React.
// Usa el mismo catálogo normalizado y las mismas reglas de estado que la vista interactiva.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE_MATCH, GRUPOS_LECTURA, datoDe, dominio, estadoEfectivo, fechaLegible, hoyISO, resumenCobertura, rutaCategoria, rutaFicha } from '../src/lib/matchCatalog.js';
import { LECTURAS, MATCH_CATEGORIAS } from '../src/lib/matchCategorias.js';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(RAIZ, 'dist');
const ORIGEN = 'https://www.milanaaqui.mx';
const catalogo = JSON.parse(readFileSync(resolve(RAIZ, 'src/data/match-catalogo.json'), 'utf8'));
const plantilla = readFileSync(resolve(DIST, 'index.html'), 'utf8');
const hoy = hoyISO();
const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fuenteDe = (ev) => catalogo.fuentes[ev.f] || {};

function meta(html, clave, valor, propiedad = false) {
  const attr = propiedad ? 'property' : 'name';
  const re = new RegExp(`<meta\\s+${attr}=["']${clave}["'][^>]*>`, 'i');
  const tag = `<meta ${attr}="${clave}" content="${esc(valor)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function escribir({ ruta, titulo, descripcion, tipo = 'WebPage', migas, cuerpo, extraSchema = [] }) {
  const url = `${ORIGEN}${ruta}`;
  let html = plantilla.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '');
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(titulo)}</title>`);
  html = meta(html, 'description', descripcion);
  html = meta(html, 'og:title', titulo, true); html = meta(html, 'og:description', descripcion, true);
  html = meta(html, 'og:url', url, true); html = meta(html, 'og:type', 'website', true);
  html = meta(html, 'twitter:title', titulo); html = meta(html, 'twitter:description', descripcion);
  html = meta(html, 'og:image', `${ORIGEN}/images/match/og-match.jpg`, true); html = meta(html, 'twitter:image', `${ORIGEN}/images/match/og-match.jpg`);
  const canonical = `<link rel="canonical" href="${url}" />`;
  html = /<link\s+rel=["']canonical["'][^>]*>/i.test(html) ? html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonical) : html.replace('</head>', `    ${canonical}\n  </head>`);
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': tipo, name: titulo.split('|')[0].trim(), url, description: descripcion, inLanguage: 'es-MX', publisher: { '@type': 'Organization', name: 'MiLana', url: ORIGEN } },
    { '@type': 'BreadcrumbList', itemListElement: migas.map(([name, href], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${ORIGEN}${href}` })) },
    ...extraSchema,
  ] };
  html = html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`);
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root"><main data-static-seo="match">${cuerpo}</main></div>`);
  const destino = resolve(DIST, ...ruta.split('/').filter(Boolean), 'index.html');
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, html, 'utf8');
}

const navMigas = (items) => `<nav aria-label="Ruta">${items.map(([t, h], i) => (i === items.length - 1 ? esc(t) : `<a href="${h}">${esc(t)}</a>`)).join(' / ')}</nav>`;
const valorTexto = (d, estado) => (d.valor === undefined || d.valor === null ? (estado.tipo === 'na' ? 'No aplica' : 'N/D') : [].concat(d.valor).join('; '));

function evidenciaTexto(d) {
  return (d.fuentes || []).map((ev) => {
    const f = fuenteDe(ev);
    const fechas = [ev.calculo && `cálculo ${fechaLegible(ev.calculo)}`, ev.emision && `emisión ${fechaLegible(ev.emision)}`, ev.corte && `corte ${fechaLegible(ev.corte)}`, ev.publicacion && `publicación ${fechaLegible(ev.publicacion)}`, ev.hasta && `vigencia publicada hasta ${fechaLegible(ev.hasta)}`, ev.consulta && `consultado ${fechaLegible(ev.consulta)}`].filter(Boolean).join(', ');
    return `<a href="${esc(f.url)}">${esc(f.titulo)}</a>${fechas ? ` (${esc(fechas)})` : ''}`;
  }).join(' · ');
}

const cobertura = resumenCobertura(catalogo, hoy);
const migasMatch = [['Inicio', '/'], ['Finanzas', '/finanzas'], ['MiLana Match', BASE_MATCH]];

// Portada
escribir({
  ruta: BASE_MATCH, tipo: 'CollectionPage',
  titulo: 'MiLana Match: compara productos financieros con fuente y fecha | MiLana',
  descripcion: `Compara hipotecas, tarjetas, créditos, cuentas, ahorro, inversiones, seguros y Afores en México: ${cobertura.total} fichas con fuente, fecha y estado de cada dato. Sin ranking pagado.`,
  migas: migasMatch,
  cuerpo: `${navMigas(migasMatch)}<h1>Compara opciones con sus condiciones a la vista</h1><p>Revisa créditos, cuentas, ahorro, inversiones, seguros y Afores. Encuentra costos, requisitos y límites en un solo lugar, con la fuente y la fecha de cada dato.</p><p>Al corte del ${esc(fechaLegible(cobertura.corte))}: ${cobertura.total} fichas documentadas de ${cobertura.entidades} instituciones en ${cobertura.porCategoria.length} categorías. ${cobertura.patrocinadas} relaciones comerciales.</p><h2>¿Qué quieres comparar?</h2><ul>${catalogo.categorias.map((c) => `<li><a href="${rutaCategoria(c)}">${esc(c.nombre)}</a>: ${esc(MATCH_CATEGORIAS[c.id].resumen)} ${cobertura.porCategoria.find((x) => x.id === c.id).total} fichas.</li>`).join('')}</ul><h2>Cada cifra tiene contexto</h2><p>Una tasa puede depender del monto, del plazo o de una promoción. Por eso mostramos las condiciones junto a la cifra y enlazamos la fuente original. Cuando no podemos comprobar un dato, verás N/D o el motivo que impide compararlo.</p><h2>Primero entiende qué mide cada cifra</h2><ul>${Object.values(LECTURAS).map((l) => `<li><a href="${l.href}">${esc(l.titulo)}</a></li>`).join('')}</ul><p><a href="${BASE_MATCH}/metodologia">Cómo comparamos</a> · <a href="/financiamiento">Cómo nos financiamos</a></p><p>Información educativa. No es una oferta, una evaluación crediticia ni una recomendación personalizada.</p>`,
});

// Metodología
escribir({
  ruta: `${BASE_MATCH}/metodologia`,
  titulo: 'Metodología de MiLana Match: fuentes, estados y orden | MiLana',
  descripcion: 'Cómo compara MiLana Match: fuente y fecha por dato, N/D que nunca es cero, orden sólo entre datos comparables y patrocinios identificados que no cambian posiciones.',
  migas: [...migasMatch, ['Metodología', `${BASE_MATCH}/metodologia`]],
  cuerpo: `${navMigas([...migasMatch, ['Metodología']])}<h1>Cómo comparamos en MiLana Match</h1><p>Reunimos información pública de productos financieros disponibles en México para que puedas revisar costos, rendimientos, requisitos y condiciones sin perder de vista de dónde viene cada dato.</p><h2>De dónde salen los datos</h2><p>Páginas oficiales, tarifarios, contratos, prospectos y fuentes de autoridades. Cada dato muestra su fuente, su fecha de cálculo, emisión o corte cuando se publica, y la fecha de consulta.</p><h2>Cómo ordenamos</h2><p>El orden inicial es por nombre de la institución. Sólo ordenamos por un indicador cuando todas las opciones lo publican con la misma definición, unidad, cohorte y corte, como el IRN de las Afores. Los datos N/D, vencidos o en conflicto no se convierten en ceros.</p><h2>Estados de un dato</h2><p>Verificado en fuente, sin vigencia publicada, N/D, no aplica, en conflicto, retenido, caducado y revisión vencida.</p><h2>Cómo nos financiamos</h2><p>Al corte del ${esc(fechaLegible(cobertura.corte))}, MiLana Match no tiene relaciones comerciales activas. Un patrocinio futuro se identificará junto al producto y antes del clic, sin cambiar el orden.</p><p><a href="${BASE_MATCH}">Volver a MiLana Match</a> · <a href="/financiamiento">Cómo se financia MiLana</a></p>`,
});

// Categorías y fichas
for (const c of catalogo.categorias) {
  const cfg = MATCH_CATEGORIAS[c.id];
  const lista = catalogo.productos.filter((p) => p.categoria === c.id).sort((a, b) => `${a.entidad} ${a.nombre}`.localeCompare(`${b.entidad} ${b.nombre}`, 'es'));
  const migasCat = [...migasMatch, [c.nombre, rutaCategoria(c)]];
  const filas = lista.map((p) => {
    const m = p.metrica ? datoDe(p, p.metrica) : null;
    const e = m ? estadoEfectivo(m, hoy, p.categoria) : null;
    return `<tr><th scope="row"><a href="${rutaFicha(c, p)}">${esc(p.nombre)}</a></th><td>${esc(p.entidad)}</td>${cfg.metrica ? `<td>${m ? `${esc(valorTexto(m, e))} (${esc(e.etiqueta)})` : 'N/D'}</td>` : ''}</tr>`;
  }).join('');
  escribir({
    ruta: rutaCategoria(c), tipo: 'CollectionPage',
    titulo: `${c.nombre}: compara con fuente y fecha | MiLana Match`,
    descripcion: `${cfg.lede} ${lista.length} fichas documentadas al ${fechaLegible(catalogo.fechaCorte)}, con estado y fuente de cada dato.`,
    migas: migasCat,
    extraSchema: [{ '@type': 'ItemList', name: c.nombre, itemListElement: lista.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${ORIGEN}${rutaFicha(c, p)}`, name: p.nombre })) }],
    cuerpo: `${navMigas([...migasMatch, [c.nombre]])}<h1>${esc(cfg.titulo)}</h1><p>${esc(cfg.lede)}</p><p>${esc(cfg.aviso)}</p><table><caption>${lista.length} fichas documentadas, ordenadas por nombre de la institución</caption><thead><tr><th scope="col">Producto</th><th scope="col">Institución</th>${cfg.metrica ? `<th scope="col">${esc(cfg.metrica)}</th>` : ''}</tr></thead><tbody>${filas}</tbody></table><h2>Preguntas antes de contratar</h2><ul>${cfg.preguntas.map((q) => `<li>${esc(q)}</li>`).join('')}</ul><p>${cfg.lecturas.map((k) => `<a href="${LECTURAS[k].href}">${esc(LECTURAS[k].titulo)}</a>`).join(' · ')} · <a href="${BASE_MATCH}/metodologia">Metodología</a> · <a href="${BASE_MATCH}">Todas las categorías</a></p>`,
  });

  for (const p of lista) {
    const migasP = [...migasCat, [p.nombre, rutaFicha(c, p)]];
    const bloques = GRUPOS_LECTURA.map(([id, titulo]) => {
      const datos = p.datos.filter((d) => d.grupo === id);
      if (!datos.length) return '';
      return `<h2>${esc(titulo)}</h2><dl>${datos.map((d) => { const e = estadoEfectivo(d, hoy, p.categoria); return `<dt>${esc(d.etiqueta)}</dt><dd>${esc(valorTexto(d, e))}. Estado: ${esc(e.etiqueta)}.${d.nota ? ` ${esc(d.nota)}` : ''} Fuente: ${evidenciaTexto(d)}</dd>`; }).join('')}</dl>`;
    }).join('');
    const m = p.metrica ? datoDe(p, p.metrica) : null;
    const resumenMetrica = m ? ` ${cfg.metrica}: ${valorTexto(m, estadoEfectivo(m, hoy, p.categoria))}.` : '';
    escribir({
      ruta: rutaFicha(c, p),
      titulo: `${p.nombre} (${p.entidad.split(',')[0]}): condiciones con fuente | MiLana Match`,
      descripcion: `Ficha de ${p.nombre}, ${p.subcategoria || c.nombre}.${resumenMetrica} Cada dato con su fuente, fecha y estado al corte del ${fechaLegible(catalogo.fechaCorte)}.`.slice(0, 300),
      migas: migasP,
      cuerpo: `${navMigas([...migasCat, [p.nombre]])}<h1>${esc(p.nombre)}</h1><p>${esc(p.entidad)}${p.subcategoria ? ` · ${esc(p.subcategoria)}` : ''}</p><p>Sin relación comercial con esta institución.</p>${bloques}${p.alertas.length ? `<h2>Qué revisar con más cuidado</h2><ul>${p.alertas.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}${p.discrepancias.length ? `<h2>Discrepancias entre fuentes</h2><ul>${p.discrepancias.map((d) => `<li>${esc(d.texto)}</li>`).join('')}</ul>` : ''}<h2>Preguntas antes de contratar</h2><ul>${cfg.preguntas.map((q) => `<li>${esc(q)}</li>`).join('')}</ul>${p.enlaceOficial ? `<p>Sitio oficial: <a href="${esc(p.enlaceOficial)}" rel="noopener noreferrer">${esc(dominio(p.enlaceOficial))}</a>. Este enlace no es de afiliado.</p>` : ''}<p><a href="${rutaCategoria(c)}">Volver a ${esc(c.nombre.toLowerCase())}</a> · <a href="${BASE_MATCH}/metodologia">Metodología</a></p><p>La información describe condiciones publicadas y puede cambiar. No es una oferta, una aprobación ni una recomendación personalizada.</p>`,
    });
  }
}

console.log(`MiLana Match: portada, metodología, ${catalogo.categorias.length} categorías y ${catalogo.productos.length} fichas estáticas generadas`);
