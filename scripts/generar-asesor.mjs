import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(RAIZ, 'dist');
const plantilla = readFileSync(resolve(DIST, 'index.html'), 'utf8');
const url = 'https://www.milanaaqui.mx/finanzas/mi-situacion';
const titulo = 'Analiza tu situación financiera | MiLana';
const descripcion = 'Ordena ingreso neto, gastos, deuda, fondo de emergencia y una meta con reglas visibles y escenarios sin rendimientos inventados.';
const escapar = (v) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function meta(html, clave, valor, propiedad = false) {
  const attr = propiedad ? 'property' : 'name';
  const re = new RegExp(`<meta\\s+${attr}=["']${clave}["'][^>]*>`, 'i');
  const tag = `<meta ${attr}="${clave}" content="${escapar(valor)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

let html = plantilla.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '');
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
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Mi situación financiera — MiLana',
      url,
      description: descripcion,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'es-MX',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'MXN' },
      publisher: { '@type': 'Organization', name: 'MiLana', url: 'https://www.milanaaqui.mx' }
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.milanaaqui.mx/' },
        { '@type': 'ListItem', position: 2, name: 'Finanzas', item: 'https://www.milanaaqui.mx/finanzas' },
        { '@type': 'ListItem', position: 3, name: 'Mi situación', item: url }
      ]
    }
  ]
};
html = html.replace('</head>', `    <script type="application/ld+json">${JSON.stringify(schema)}</script>\n  </head>`);

const cuerpo = `<div id="root"><main data-static-seo="asesor-financiero"><nav aria-label="Ruta"><a href="/">Inicio</a> / <a href="/finanzas">Finanzas</a> / Mi situación</nav><h1>Analiza tu situación financiera con reglas visibles</h1><p>MiLana organiza ingreso neto, gastos esenciales, gastos variables, pagos de deuda, fondo de emergencia y una meta para construir una fotografía mensual.</p><h2>Qué calcula</h2><ul><li>Dinero disponible después de los gastos capturados.</li><li>Proporción descriptiva del ingreso destinada a pagos de deuda.</li><li>Referencia educativa de fondo equivalente a 3 y 6 meses de gastos esenciales.</li><li>Faltante de una meta y aportación mensual necesaria sin asumir rendimientos.</li><li>Escenarios matemáticos si el ingreso neto cambiara 10%, 20% o 30%.</li></ul><h2>Qué no hace</h2><p>No elige productos de inversión, no garantiza aumentos salariales, no recalcula impuestos en los escenarios porcentuales y no sustituye asesoría financiera personalizada.</p><p><a href="/finanzas/presupuesto">Revisar presupuesto</a> · <a href="/finanzas/fondo-emergencia">Fondo de emergencia</a> · <a href="/finanzas/deuda-y-credito">Deuda y crédito</a> · <a href="/finanzas/ahorro">Meta de ahorro</a></p></main></div>`;
html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, cuerpo);

const destino = resolve(DIST, 'finanzas', 'mi-situacion', 'index.html');
mkdirSync(dirname(destino), { recursive: true });
writeFileSync(destino, html, 'utf8');
console.log('asesor: /finanzas/mi-situacion generado');
