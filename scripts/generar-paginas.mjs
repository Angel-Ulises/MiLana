/**
 * Emite un HTML estatico real por calculadora, despues del build de Vite.
 *
 * Por que existe: hasta ahora todo MiLana vivia en una sola URL y la
 * calculadora activa era un estado interno de App.jsx. Para un buscador eso
 * es una sola pagina, y para AdSense es una pantalla que se ve como
 * formulario + resultado. Con esto cada calculadora tiene su propia URL
 * indexable, con su title, description, canonical, Open Graph y JSON-LD ya
 * escritos en el HTML que sirve el servidor, sin depender de que el
 * rastreador ejecute JavaScript.
 *
 * No duplica la aplicacion: los 10 HTML cargan el mismo bundle y App.jsx
 * decide que mostrar leyendo la ruta.
 *
 * Corre solo como parte de `npm run build`.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = resolve(RAIZ, "dist");

const catalogo = JSON.parse(readFileSync(resolve(RAIZ, "src/data/paginas.json"), "utf8"));
// Contenido editorial por calculadora (Fase 6). De aqui sale el FAQPage
// propio de cada pagina: las mismas preguntas que ve la persona usuaria,
// nunca preguntas que no esten en la pagina.
const contenido = JSON.parse(
  readFileSync(resolve(RAIZ, "src/data/contenido-calculadoras.json"), "utf8")
);
const { origen, nombre } = catalogo.sitio;
const paginas = catalogo.paginas;

const plantilla = readFileSync(resolve(DIST, "index.html"), "utf8");

const escapar = (t) =>
  String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Reemplaza (o inserta) una etiqueta meta por nombre o propiedad. */
function ponerMeta(html, clave, valor, porPropiedad = false) {
  const attr = porPropiedad ? "property" : "name";
  const re = new RegExp(`<meta\\s+${attr}=["']${clave}["'][^>]*>`, "i");
  const etiqueta = `<meta ${attr}="${clave}" content="${escapar(valor)}" />`;
  return re.test(html) ? html.replace(re, etiqueta) : html.replace("</head>", `    ${etiqueta}\n  </head>`);
}

function construir(pagina) {
  const url = `${origen}/calculadoras/${pagina.slug}`;
  let html = plantilla;

  // La portada trae un FAQPage con preguntas generales del sitio. Heredarlo
  // en las 10 calculadoras seria publicar el mismo esquema en 11 URLs, asi
  // que se retira: cada pagina lleva solo el suyo. Cuando haya FAQ propia
  // por calculadora, se emite aqui.
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, "");

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapar(pagina.titulo)}</title>`);
  html = ponerMeta(html, "description", pagina.descripcion);
  html = ponerMeta(html, "og:title", pagina.titulo, true);
  html = ponerMeta(html, "og:description", pagina.descripcion, true);
  html = ponerMeta(html, "og:url", url, true);
  html = ponerMeta(html, "og:type", "website", true);
  html = ponerMeta(html, "twitter:title", pagina.titulo);
  html = ponerMeta(html, "twitter:description", pagina.descripcion);

  // Canonical: si ya existe uno apuntando a la raiz, se sustituye.
  const canonical = `<link rel="canonical" href="${url}" />`;
  html = /<link\s+rel=["']canonical["'][^>]*>/i.test(html)
    ? html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonical)
    : html.replace("</head>", `    ${canonical}\n  </head>`);

  // JSON-LD propio de la pagina. WebApplication describe la herramienta;
  // BreadcrumbList le dice al buscador donde vive dentro del sitio.
  const datos = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: pagina.titulo.split("|")[0].trim(),
        url,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        inLanguage: "es-MX",
        description: pagina.descripcion,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "MXN" },
        publisher: { "@type": "Organization", name: nombre, url: origen },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: origen },
          { "@type": "ListItem", position: 2, name: "Calculadoras", item: `${origen}/#calculadoras` },
          { "@type": "ListItem", position: 3, name: pagina.titulo.split("|")[0].trim(), item: url },
        ],
      },
    ],
  };

  // FAQPage solo si la calculadora ya tiene preguntas publicadas en la
  // pagina. Google exige que el esquema refleje contenido visible.
  const faq = contenido[pagina.id]?.faq;
  if (Array.isArray(faq) && faq.length > 0) {
    datos["@graph"].push({
      "@type": "FAQPage",
      inLanguage: "es-MX",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.pregunta,
        acceptedAnswer: { "@type": "Answer", text: f.respuesta },
      })),
    });
  }

  html = html.replace(
    "</head>",
    `    <script type="application/ld+json">${JSON.stringify(datos)}</script>\n  </head>`
  );

  const destino = resolve(DIST, "calculadoras", pagina.slug, "index.html");
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, html, "utf8");
  return url;
}

function sitemap(urls) {
  const hoy = new Date().toISOString().slice(0, 10);
  const entrada = (loc, prioridad, frecuencia) =>
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${hoy}</lastmod>\n    <changefreq>${frecuencia}</changefreq>\n    <priority>${prioridad}</priority>\n  </url>`;
  const cuerpo = [
    entrada(`${origen}/`, "1.0", "weekly"),
    ...urls.map((u) => entrada(u, "0.9", "monthly")),
    entrada(`${origen}/privacidad`, "0.3", "yearly"),
  ].join("\n");
  writeFileSync(
    resolve(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${cuerpo}\n</urlset>\n`,
    "utf8"
  );
}

const urls = paginas.map(construir);
sitemap(urls);

console.log(`${urls.length} paginas de calculadora generadas:`);
for (const u of urls) console.log(`  ${u}`);
console.log("sitemap.xml actualizado con " + (urls.length + 2) + " URLs");
