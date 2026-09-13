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
// Rutas de situacion (Fase 7). Son paginas-hub: explican como pensar una
// situacion y enlazan a las calculadoras que le corresponden.
const situaciones = JSON.parse(
  readFileSync(resolve(RAIZ, "src/data/situaciones.json"), "utf8")
).situaciones;
const { origen, nombre } = catalogo.sitio;
const paginas = catalogo.paginas;
const SLUG_POR_ID = Object.fromEntries(paginas.map((p) => [p.id, p.slug]));
// Nombre corto de cada calculadora para los enlaces del respaldo estatico.
const TITULO_CORTO = Object.fromEntries(
  paginas.map((p) => [p.id, p.titulo.split("|")[0].replace(/\s*20\d\d\s*$/, "").trim()])
);

/**
 * Revisa el contenido editorial antes de generar nada.
 *
 * Este archivo lo escribe ChatGPT y se integra por lotes, asi que un error
 * tipico no es de sintaxis sino semantico: una clave con otro nombre, una
 * seccion olvidada o un enlace a un destino que no existe. Sin esta
 * revision, nada de eso falla en el build; falla en produccion como una
 * seccion vacia o un enlace a la portada. Por eso se rompe el build aqui.
 */
function revisarContenido() {
  const ids = new Set(paginas.map((p) => p.id));
  const requeridas = [
    "proposito", "interpretacion", "significado",
    "metodologia", "supuestos", "fundamento",
  ];
  const problemas = [];

  for (const [id, dato] of Object.entries(contenido)) {
    if (id.startsWith("_")) continue; // notas del archivo
    if (!ids.has(id)) {
      problemas.push(`"${id}" no corresponde a ninguna calculadora de paginas.json`);
      continue;
    }
    for (const clave of requeridas) {
      if (typeof dato[clave] !== "string" || dato[clave].trim().length < 40) {
        problemas.push(`${id}: falta la seccion "${clave}" o esta demasiado corta`);
      }
    }
    for (const [i, f] of (dato.faq ?? []).entries()) {
      if (!f?.pregunta || !f?.respuesta) problemas.push(`${id}: faq[${i}] sin pregunta o sin respuesta`);
    }
    for (const [i, s] of (dato.siguientes ?? []).entries()) {
      if (!s?.texto) problemas.push(`${id}: siguientes[${i}] sin texto`);
      if (!ids.has(s?.destino)) problemas.push(`${id}: siguientes[${i}] apunta a "${s?.destino}", que no existe`);
      if (s?.destino === id) problemas.push(`${id}: siguientes[${i}] se enlaza a si misma`);
    }
  }

  if (problemas.length) {
    console.error("\nContenido editorial invalido:");
    for (const p of problemas) console.error(`  - ${p}`);
    console.error("");
    process.exit(1);
  }

  const conContenido = Object.keys(contenido).filter((k) => !k.startsWith("_"));
  console.log(`contenido editorial: ${conContenido.length} de ${paginas.length} calculadoras`);
}

revisarContenido();

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

function sitemap(urls, urlsSituacion = []) {
  const hoy = new Date().toISOString().slice(0, 10);
  const entrada = (loc, prioridad, frecuencia) =>
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${hoy}</lastmod>\n    <changefreq>${frecuencia}</changefreq>\n    <priority>${prioridad}</priority>\n  </url>`;
  const cuerpo = [
    entrada(`${origen}/`, "1.0", "weekly"),
    ...urlsSituacion.map((u) => entrada(u, "0.9", "monthly")),
    ...urls.map((u) => entrada(u, "0.9", "monthly")),
    entrada(`${origen}/privacidad`, "0.3", "yearly"),
  ].join("\n");
  writeFileSync(
    resolve(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${cuerpo}\n</urlset>\n`,
    "utf8"
  );
}

/**
 * HTML real por situacion. Sin FAQPage a proposito: un hub no es una pagina
 * de preguntas, y declarar el mismo esquema en todo el sitio lo devalua.
 * Lleva BreadcrumbList y CollectionPage, que es lo que realmente es.
 */

/**
 * Contenido estatico del hub, dentro de #root.
 *
 * Hasta aqui el HTML que sirve el servidor traia el <head> completo pero el
 * cuerpo vacio: todo lo dibujaba React. Para un rastreador que no ejecuta
 * JavaScript, y para cualquier persona a la que le falle el bundle, la
 * pagina no existia. ChatGPT lo pidio explicito para la Fase 7: los hubs no
 * pueden ser solo navegacion.
 *
 * React reemplaza estos nodos en el primer render, asi que no compite con la
 * version interactiva; es respaldo, no duplicado.
 */
function cuerpoEstatico(s) {
  const e = escapar;
  const parrafos = s.explicacion.map((p) => `<p>${e(p)}</p>`).join("\n      ");
  const decisiones = s.decisiones
    .map((d) => `<li><a href="${d.ancla ? `#${d.ancla}` : `/calculadoras/${SLUG_POR_ID[d.destino]}`}">${e(d.texto)}</a></li>`)
    .join("\n        ");
  const ruta = s.ruta
    .map((r) => `<li><strong>${e(r.paso)}</strong> — ${e(r.detalle)}</li>`)
    .join("\n        ");
  const ids = s.grupos ? s.grupos.flatMap((g) => g.ids) : s.herramientas;
  const herramientas = ids
    .map((id) => `<li><a href="/calculadoras/${SLUG_POR_ID[id]}">${e(TITULO_CORTO[id] || id)}</a></li>`)
    .join("\n        ");
  const antes = s.antes
    .map((a) => `<li><strong>${e(a.titulo)}</strong> — ${e(a.detalle)}</li>`)
    .join("\n        ");
  const comparacion = s.comparacion
    ? `\n      <h2>${e(s.comparacion.titulo)}</h2>\n      ` +
      s.comparacion.columnas.map((c) => `<p><strong>${e(c.titulo)}.</strong> ${e(c.texto)}</p>`).join("\n      ") +
      `\n      <p>${e(s.comparacion.nota)}</p>`
    : "";

  return `    <div id="root">
      <p>${e(s.eyebrow)}</p>
      <h1>${e(s.h1)}</h1>
      <p>${e(s.lede)}</p>

      <h2>¿Qué necesitas resolver?</h2>
      <ul>
        ${decisiones}
      </ul>

      ${parrafos}${comparacion}

      <h2>Tu ruta de decisión</h2>
      <ol>
        ${ruta}
      </ol>

      <h2>Herramientas para esta situación</h2>
      <ul>
        ${herramientas}
      </ul>

      <h2>Antes de decidir</h2>
      <ul>
        ${antes}
      </ul>

      <p><a href="/situaciones/${s.siguiente.destino}">${e(s.siguiente.texto)}</a></p>
    </div>`;
}

function construirSituacion(s) {
  const url = `${origen}/situaciones/${s.slug}`;
  let html = plantilla;

  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, "");
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapar(s.titulo)}</title>`);
  html = ponerMeta(html, "description", s.descripcion);
  html = ponerMeta(html, "og:title", s.titulo, true);
  html = ponerMeta(html, "og:description", s.descripcion, true);
  html = ponerMeta(html, "og:url", url, true);
  html = ponerMeta(html, "og:type", "website", true);
  html = ponerMeta(html, "twitter:title", s.titulo);
  html = ponerMeta(html, "twitter:description", s.descripcion);

  const canonical = `<link rel="canonical" href="${url}" />`;
  html = /<link\s+rel=["']canonical["'][^>]*>/i.test(html)
    ? html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonical)
    : html.replace("</head>", `    ${canonical}\n  </head>`);

  const datos = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: s.h1,
        headline: s.h1,
        url,
        inLanguage: "es-MX",
        description: s.descripcion,
        isPartOf: { "@type": "WebSite", name: nombre, url: origen },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: origen },
          { "@type": "ListItem", position: 2, name: "Situaciones", item: `${origen}/#situaciones` },
          { "@type": "ListItem", position: 3, name: s.h1, item: url },
        ],
      },
    ],
  };
  html = html.replace(
    "</head>",
    `    <script type="application/ld+json">${JSON.stringify(datos)}</script>\n  </head>`
  );

  html = html.replace('<div id="root"></div>', cuerpoEstatico(s));

  const destino = resolve(DIST, "situaciones", s.slug, "index.html");
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, html, "utf8");
  return url;
}

const urls = paginas.map(construir);
const urlsSituacion = situaciones.map(construirSituacion);
sitemap(urls, urlsSituacion);

console.log(`${urls.length} paginas de calculadora generadas:`);
for (const u of urls) console.log(`  ${u}`);
console.log(`${urlsSituacion.length} rutas de situacion generadas:`);
for (const u of urlsSituacion) console.log(`  ${u}`);
console.log("sitemap.xml actualizado con " + (urls.length + urlsSituacion.length + 2) + " URLs");
