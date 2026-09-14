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

  if (!titulo || !h1 || !descripcion) throw new Error(`Metadata incompleta en ${slug}`);

  if (!/<link\s+rel=["']icon["']/i.test(html)) {
    html = html.replace('</head>', '<link rel="icon" type="image/svg+xml" href="/favicon.svg"></head>');
  }

  // Las guías son piezas editoriales de MiLana. Article describe el contenido real;
  // BreadcrumbList refleja la navegación visible Inicio > Aprende > guía.
  const datos = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: h1,
        name: titulo,
        description: descripcion,
        url: canonical,
        mainEntityOfPage: canonical,
        inLanguage: 'es-MX',
        dateModified: '2026-09-14',
        author: { '@type': 'Organization', name: 'MiLana', url: `${ORIGEN}/` },
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
  console.log(`guía SEO: ${slug}`);
}

GUIAS.forEach(mejorar);
console.log(`SEO de guías: ${GUIAS.length} páginas con favicon, Article y BreadcrumbList.`);
