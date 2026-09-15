import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DIST = resolve('dist');
const catalogo = JSON.parse(readFileSync('src/data/paginas.json', 'utf8'));
const origen = catalogo.sitio.origen;

const imagenPorId = {
  finiquito: 'finiquito',
  liquidacion: 'liquidacion',
  aguinaldo: 'aguinaldo',
  isr: 'isr',
  resico: 'resico',
  ptu: 'ptu',
  'bruto-neto': 'bruto-neto',
  vacaciones: 'vacaciones',
  infonavit: 'infonavit',
  pension: 'pension',
};

function escapar(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ponerMeta(html, clave, valor, porPropiedad = false) {
  const attr = porPropiedad ? 'property' : 'name';
  const re = new RegExp(`<meta\\s+${attr}=["']${clave}["'][^>]*>`, 'i');
  const tag = `<meta ${attr}="${clave}" content="${escapar(valor)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function aplicar(archivo, { imagen, alt }) {
  if (!existsSync(archivo)) throw new Error(`No existe ${archivo}`);
  let html = readFileSync(archivo, 'utf8');
  html = ponerMeta(html, 'og:image', imagen, true);
  html = ponerMeta(html, 'og:image:alt', alt, true);
  html = ponerMeta(html, 'og:image:width', '1440', true);
  html = ponerMeta(html, 'og:image:height', '960', true);
  html = ponerMeta(html, 'twitter:card', 'summary_large_image');
  html = ponerMeta(html, 'twitter:image', imagen);
  html = ponerMeta(html, 'twitter:image:alt', alt);
  writeFileSync(archivo, html, 'utf8');
}

aplicar(resolve(DIST, 'index.html'), {
  imagen: `${origen}/images/gen/inicio-1440.jpg`,
  alt: 'MiLana: calculadoras de sueldo, prestaciones e impuestos para México',
});

for (const pagina of catalogo.paginas) {
  const base = imagenPorId[pagina.id];
  if (!base) throw new Error(`Falta imagen social para ${pagina.id}`);
  aplicar(resolve(DIST, 'calculadoras', pagina.slug, 'index.html'), {
    imagen: `${origen}/images/gen/${base}-1440.jpg`,
    alt: `${pagina.titulo.split('|')[0].trim()} en MiLana`,
  });
}

console.log(`social preview: portada + ${catalogo.paginas.length} calculadoras con imagen propia 3:2`);
