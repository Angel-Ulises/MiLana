import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DIST = resolve('dist');
const ORIGEN = 'https://www.milanaaqui.mx';
const rutas = [
  ['aprende', 'Aprende'],
  ['sobre', 'Sobre MiLana'],
  ['metodo', 'Método editorial'],
  ['contacto', 'Contacto'],
  ['privacidad', 'Privacidad'],
  ['financiamiento', 'Cómo se financia MiLana'],
  ['widgets', 'Widgets'],
];

const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const valor = (html, re) => html.match(re)?.[1]?.trim() || '';

function meta(html, attr, key, content) {
  const re = new RegExp(`<meta\\s+${attr}=["']${key}["'][^>]*>`, 'i');
  const tag = `<meta ${attr}="${key}" content="${esc(content)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

let tocados = 0;
for (const [slug, etiqueta] of rutas) {
  const archivo = resolve(DIST, slug, 'index.html');
  if (!existsSync(archivo)) throw new Error(`Falta página estática /${slug}`);
  let html = readFileSync(archivo, 'utf8');
  const title = valor(html, /<title>([\s\S]*?)<\/title>/i);
  const description = valor(html, /<meta\s+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const canonical = valor(html, /<link\s+rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
    || `${ORIGEN}/${slug}`;
  if (!title || !description) throw new Error(`/${slug}: title o description faltante`);

  html = meta(html, 'property', 'og:title', title);
  html = meta(html, 'property', 'og:description', description);
  html = meta(html, 'property', 'og:url', canonical);
  html = meta(html, 'property', 'og:type', 'website');
  html = meta(html, 'name', 'twitter:card', 'summary');
  html = meta(html, 'name', 'twitter:title', title);
  html = meta(html, 'name', 'twitter:description', description);

  if (!/<script\s+type=["']application\/ld\+json["']>/i.test(html)) {
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', name: title.replace(/\s*\|\s*MiLana\s*$/i, ''), url: canonical, description, inLanguage: 'es-MX', publisher: { '@type': 'Organization', name: 'MiLana', url: `${ORIGEN}/` } },
        { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${ORIGEN}/` },
          { '@type': 'ListItem', position: 2, name: etiqueta, item: canonical },
        ] },
      ],
    };
    html = html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`);
  }
  writeFileSync(archivo, html, 'utf8');
  tocados += 1;
}

console.log(`metadata estática: ${tocados} páginas canónicas de confianza/social completadas`);
