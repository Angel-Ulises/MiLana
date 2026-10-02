import { readFileSync, writeFileSync } from 'node:fs';

const paginas = JSON.parse(readFileSync('src/data/paginas.json','utf8'));
const situaciones = JSON.parse(readFileSync('src/data/situaciones.json','utf8')).situaciones;
const carreras = JSON.parse(readFileSync('src/data/carreras.json','utf8')).paginas;
const profesiones = JSON.parse(readFileSync('src/data/profesiones.json','utf8')).profesiones;
const estados = JSON.parse(readFileSync('src/data/estados.json','utf8')).estados;
const finanzas = JSON.parse(readFileSync('src/data/finanzas.json','utf8')).paginas;
const economia = JSON.parse(readFileSync('src/data/economia.json','utf8'));
const origen = paginas.sitio.origen;
const rutasCarreras = carreras.map(p => p.slug ? `/carreras/${p.slug}` : '/carreras');
const rutasProfesiones = profesiones.map(p => `/carreras/profesion/${p.slug}`);
const rutasEstados = ['/estados', '/estados/comparar', ...estados.map(e => `/estados/${e.slug}`)];
const rutasFinanzas = finanzas.map(p => p.slug ? `/finanzas/${p.slug}` : '/finanzas');
const rutasEconomia = ['/economia', ...economia.articulos.map(a => `/economia/${a.slug}`)];
const rutas = [
  '/',
  ...paginas.paginas.map(p => `/calculadoras/${p.slug}`),
  ...situaciones.map(s => `/situaciones/${s.slug}`),
  ...rutasCarreras,
  ...rutasProfesiones,
  '/carreras/ocupaciones',
  '/carreras/comparar',
  ...rutasEstados,
  ...rutasFinanzas,
  '/finanzas/mi-situacion',
  ...rutasEconomia,
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
const prioridad = ruta => ruta === '/' ? '1.0'
  : ruta === '/carreras' || ruta === '/finanzas' || ruta === '/economia' || ruta === '/estados' ? '0.9'
  : ruta.startsWith('/calculadoras/') || ruta.startsWith('/situaciones/') || ruta.startsWith('/carreras/') || ruta.startsWith('/estados/') || ruta.startsWith('/finanzas/') || ruta.startsWith('/economia/') ? '0.9'
  : ruta.startsWith('/aprende') ? '0.8'
  : ruta === '/widgets' ? '0.6' : '0.5';
const frecuencia = ruta => ruta === '/' || ruta.startsWith('/economia') ? 'weekly' : 'monthly';
const xml = rutas.map(r => `  <url>\n    <loc>${origen}${r === '/' ? '/' : r}</loc>\n    <changefreq>${frecuencia(r)}</changefreq>\n    <priority>${prioridad(r)}</priority>\n  </url>`).join('\n');
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xml}\n</urlset>\n`);
console.log(`sitemap final: ${rutas.length} URLs, sin lastmod artificial`);
