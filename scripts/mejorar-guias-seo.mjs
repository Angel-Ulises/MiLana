import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ORIGEN = 'https://www.milanaaqui.mx';
const DIST = resolve('dist');
const GUIAS = [
  'finiquito-vs-liquidacion',
  'leer-recibo-nomina',
  'aguinaldo-bruto-neto',
  'vacaciones-prima-vacacional',
  'resico-ingresos-cobrados',
  'pension-imss-ley-97',
];

const TITULOS = {
  'pension-imss-ley-97': 'Pensión IMSS Ley 97: requisitos y qué revisar | MiLana',
};

const IMAGENES = {
  'finiquito-vs-liquidacion': '/images/gen/finiquito-1024.jpg',
  'leer-recibo-nomina': '/images/gen/bruto-neto-1024.jpg',
  'aguinaldo-bruto-neto': '/images/gen/aguinaldo-1024.jpg',
  'vacaciones-prima-vacacional': '/images/gen/vacaciones-1024.jpg',
  'resico-ingresos-cobrados': '/images/gen/resico-1024.jpg',
  'pension-imss-ley-97': '/images/gen/pension-1024.jpg',
};

function texto(html, re) {
  return (html.match(re)?.[1] || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function atributo(html, re) {
  return (html.match(re)?.[1] || '').trim();
}

function escaparAtributo(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function ponerMeta(html, atributoClave, clave, valor) {
  const re = new RegExp(`<meta\\s+${atributoClave}=["']${clave}["'][^>]*>`, 'i');
  const etiqueta = `<meta ${atributoClave}="${clave}" content="${escaparAtributo(valor)}">`;
  return re.test(html) ? html.replace(re, etiqueta) : html.replace('</head>', `${etiqueta}</head>`);
}

function mejorar(slug) {
  const archivo = resolve(DIST, 'aprende', slug, 'index.html');
  if (!existsSync(archivo)) throw new Error(`No existe guía construida: ${archivo}`);

  let html = readFileSync(archivo, 'utf8');
  if (TITULOS[slug]) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${TITULOS[slug]}</title>`);
  }

  const titulo = texto(html, /<title>([\s\S]*?)<\/title>/i);
  const h1 = texto(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const descripcion = atributo(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const canonical = atributo(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) || `${ORIGEN}/aprende/${slug}`;
  const imagen = `${ORIGEN}${IMAGENES[slug]}`;
  const altImagen = `Guía de MiLana: ${h1}`;

  if (!titulo || !h1 || !descripcion || !IMAGENES[slug]) throw new Error(`Metadata incompleta en ${slug}`);

  if (!/<link\s+rel=["']icon["']/i.test(html)) {
    html = html.replace('</head>', '<link rel="icon" type="image/svg+xml" href="/favicon.svg"></head>');
  }

  // Previsualización de enlaces para distribución orgánica en redes y mensajería.
  html = ponerMeta(html, 'property', 'og:title', titulo);
  html = ponerMeta(html, 'property', 'og:description', descripcion);
  html = ponerMeta(html, 'property', 'og:type', 'website');
  html = ponerMeta(html, 'property', 'og:locale', 'es_MX');
  html = ponerMeta(html, 'property', 'og:url', canonical);
  html = ponerMeta(html, 'property', 'og:image', imagen);
  html = ponerMeta(html, 'property', 'og:image:alt', altImagen);
  html = ponerMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = ponerMeta(html, 'name', 'twitter:title', titulo);
  html = ponerMeta(html, 'name', 'twitter:description', descripcion);
  html = ponerMeta(html, 'name', 'twitter:image', imagen);
  html = ponerMeta(html, 'name', 'twitter:image:alt', altImagen);

  // Estas páginas son guías estáticas revisadas periódicamente. WebPage expresa
  // ese hecho sin inventar una fecha de publicación original ni exigir campos de
  // noticia/artículo que no forman parte del contenido visible. BreadcrumbList
  // refleja la navegación real Inicio > Aprende > guía.
  const datos = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: titulo,
        headline: h1,
        description: descripcion,
        url: canonical,
        inLanguage: 'es-MX',
        dateModified: '2026-09-14',
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: imagen,
          caption: altImagen,
        },
        isPartOf: {
          '@type': 'WebSite',
          name: 'MiLana',
          url: `${ORIGEN}/`,
        },
        publisher: {
          '@type': 'Organization',
          name: 'MiLana',
          url: `${ORIGEN}/`,
          logo: { '@type': 'ImageObject', url: `${ORIGEN}/logo-milana.svg`, width: 512, height: 512 },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${ORIGEN}/` },
          { '@type': 'ListItem', position: 2, name: 'Aprende', item: `${ORIGEN}/aprende` },
          { '@type': 'ListItem', position: 3, name: h1, item: canonical },
        ],
      },
    ],
  };

  // El script es idempotente: si el build se ejecuta otra vez, sustituye solo su bloque.
  html = html.replace(/<script\s+type=["']application\/ld\+json["']\s+data-milana-guia=["']1["']>[\s\S]*?<\/script>/i, '');
  html = html.replace(
    '</head>',
    `<script type="application/ld+json" data-milana-guia="1">${JSON.stringify(datos)}</script></head>`
  );

  writeFileSync(archivo, html, 'utf8');
  console.log(`guía SEO/social: ${slug}`);
}

GUIAS.forEach(mejorar);
console.log(`SEO de guías: ${GUIAS.length} páginas con WebPage, BreadcrumbList y tarjetas sociales.`);
