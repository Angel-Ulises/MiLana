import { readFileSync, writeFileSync } from 'node:fs';

const paginas = JSON.parse(readFileSync('src/data/paginas.json','utf8'));
const situaciones = JSON.parse(readFileSync('src/data/situaciones.json','utf8')).situaciones;
const origen = paginas.sitio.origen;
const rutas = [
  '/',
  ...paginas.paginas.map(p => `/calculadoras/${p.slug}`),
  ...situaciones.map(s => `/situaciones/${s.slug}`),
  '/aprende',
  '/aprende/finiquito-vs-liquidacion',
  '/aprende/leer-recibo-nomina',
  '/aprende/aguinaldo-bruto-neto',
  '/aprende/vacaciones-prima-vacacional',
  '/aprende/resico-ingresos-cobrados',
  '/aprende/pension-imss-ley-97',
  '/widgets',
  '/sobre', '/metodo', '/contacto', '/privacidad', '/financiamiento'
];
const prioridad = ruta => ruta === '/' ? '1.0' : ruta.startsWith('/calculadoras/') || ruta.startsWith('/situaciones/') ? '0.9' : ruta.startsWith('/aprende') ? '0.8' : ruta === '/widgets' ? '0.6' : '0.5';
const frecuencia = ruta => ruta === '/' ? 'weekly' : 'monthly';
const xml = rutas.map(r => `  <url>\n    <loc>${origen}${r === '/' ? '/' : r}</loc>\n    <changefreq>${frecuencia(r)}</changefreq>\n    <priority>${prioridad(r)}</priority>\n  </url>`).join('\n');
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xml}\n</urlset>\n`);
console.log(`sitemap final: ${rutas.length} URLs, sin lastmod artificial`);
