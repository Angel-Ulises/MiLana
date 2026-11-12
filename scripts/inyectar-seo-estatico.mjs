import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { prerenderHomeHero, preloadHomeModule } from './prerender-home.mjs';
import { prerenderCalculadoras } from './prerender-calculadoras.mjs';

const RAIZ = resolve(new URL('..', import.meta.url).pathname);
const DIST = resolve(RAIZ, 'dist');
const catalogo = JSON.parse(readFileSync(resolve(RAIZ, 'src/data/paginas.json'), 'utf8'));
const contenido = JSON.parse(readFileSync(resolve(RAIZ, 'src/data/contenido-calculadoras.json'), 'utf8'));
const casos = JSON.parse(readFileSync(resolve(RAIZ, 'public/casos-calculadoras.json'), 'utf8'));
const { origen, nombre } = catalogo.sitio;
const logoUrl = `${origen}/logo-milana.svg`;
const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

const escapar = (valor) => String(valor ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const tituloCorto = (pagina) => pagina.titulo.split('|')[0].trim();

function enlazar(destino) {
  const pagina = catalogo.paginas.find((p) => p.id === destino);
  return pagina ? `/calculadoras/${pagina.slug}` : '/calculadoras';
}

function casoCalculadora(pagina) {
  const caso = casos[pagina.slug];
  if (!caso) return '';
  const entradas = Array.isArray(caso.entradas) ? caso.entradas : [];
  const resultados = Array.isArray(caso.resultados) ? caso.resultados : [];
  return `<section data-static-case="${escapar(pagina.slug)}">
          <h2>Caso resuelto: ${escapar(caso.titulo)}</h2>
          <p>${escapar(caso.resumen)}</p>
          ${entradas.length ? `<h3>Datos del ejemplo</h3><ul>${entradas.map((item) => `<li>${escapar(item)}</li>`).join('')}</ul>` : ''}
          ${resultados.length ? `<h3>Resultado del ejemplo</h3><ul>${resultados.map((item) => `<li>${escapar(item.etiqueta)}: <strong>${escapar(moneda.format(Number(item.valor)))}</strong></li>`).join('')}</ul>` : ''}
          <p>${escapar(caso.nota)}</p>
        </section>`;
}

// Mejora 2026-11 (fase 3): el HTML inicial lleva la calculadora real prerenderizada desde React
// (encabezado, formulario, explicación y preguntas frecuentes), visible antes de cargar JavaScript.
// El caso resuelto y los enlaces a guías se conservan para lectores y rastreadores.
function cuerpoCalculadora(pagina, panel) {
  if (!contenido[pagina.id]) throw new Error(`Falta contenido editorial para ${pagina.id}`);
  if (!panel) throw new Error(`Falta el prerender de ${pagina.slug}`);
  return `    <div id="root">
      <main data-static-seo="calculadora" data-startup-calc>
        ${panel}
        <div class="shell" style="max-width:720px">
        ${casoCalculadora(pagina).replace('<section data-static-case', '<section class="ml-case ml-case-static" data-case-slug="' + escapar(pagina.slug) + '" data-static-case')}
        <p><a href="/aprende">Consulta también las guías de MiLana</a>.</p>
        </div>
      </main>
    </div>`;
}

function cuerpoInicio(hero) {
  const calculadoras = catalogo.paginas.map((pagina) =>
    `<li><a href="/calculadoras/${pagina.slug}">${escapar(tituloCorto(pagina))}</a> — ${escapar(pagina.descripcion)}</li>`
  ).join('');
  return `    <div id="root">
      <main data-static-seo="inicio" data-startup-home>
        ${hero}
        <div class="shell" data-startup-links>
        <p>MiLana reúne herramientas gratuitas para estimar y entender sueldo, ISR, aguinaldo, finiquito, liquidación, vacaciones, PTU, RESICO, Infonavit y pensión IMSS con alcance y fuentes visibles.</p>
        <section id="calculadoras"><h2>Calculadoras</h2>
        <ul>${calculadoras}</ul></section>
        <section id="situaciones"><h2>Explora MiLana por decisión</h2>
        <ul>
          <li><a href="/carreras">Carreras, empleos y salarios</a></li>
          <li><a href="/estados">Trabajo, salarios y vivienda por estado</a></li>
          <li><a href="/finanzas">Finanzas personales y herramientas de decisión</a></li>
          <li><a href="/economia">Radar económico y contexto para tu dinero</a></li>
        </ul></section>
        <section id="aprende"><h2>Aprende antes de decidir</h2>
        <ul>
          <li><a href="/aprende/finiquito-vs-liquidacion">Finiquito vs. liquidación</a></li>
          <li><a href="/aprende/leer-recibo-nomina">Cómo leer tu recibo de nómina</a></li>
          <li><a href="/aprende/aguinaldo-bruto-neto">Aguinaldo bruto y neto</a></li>
          <li><a href="/aprende/vacaciones-prima-vacacional">Vacaciones y prima vacacional</a></li>
          <li><a href="/aprende/resico-ingresos-cobrados">RESICO e ingresos cobrados</a></li>
          <li><a href="/aprende/pension-imss-ley-97">Pensión IMSS Ley 97</a></li>
        </ul></section>
        <section id="fuentes"><p><a href="/widgets">Calculadoras gratuitas para insertar en otros sitios</a>.</p></section>
        </div>
      </main>
    </div>`;
}

function ponerLogoEnSchema(html) {
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi, (bloque, crudo) => {
    try {
      const datos = JSON.parse(crudo);
      const visitar = (nodo) => {
        if (!nodo || typeof nodo !== 'object') return;
        if (Array.isArray(nodo)) {
          nodo.forEach(visitar);
          return;
        }
        const tipos = Array.isArray(nodo['@type']) ? nodo['@type'] : [nodo['@type']];
        if (tipos.includes('Organization') && (nodo.name === nombre || !nodo.name)) {
          nodo.logo ||= { '@type': 'ImageObject', url: logoUrl, width: 512, height: 512 };
        }
        Object.values(nodo).forEach(visitar);
      };
      visitar(datos);
      return `<script type="application/ld+json">${JSON.stringify(datos)}</script>`;
    } catch {
      return bloque;
    }
  });
}

function inyectar(archivo, cuerpo) {
  if (!existsSync(archivo)) throw new Error(`No existe ${archivo}`);
  let html = readFileSync(archivo, 'utf8');
  if (!html.includes('<div id="root"></div>')) {
    throw new Error(`La plantilla de ${archivo} ya no tiene root vacío; revisar antes de sobreescribir`);
  }
  html = html.replace('<div id="root"></div>', cuerpo.trim());
  html = ponerLogoEnSchema(html);
  if (!/<h1[\s>]/i.test(html)) throw new Error(`Sin H1 en ${archivo}`);
  if (html.includes('<div id="root"></div>')) throw new Error(`Root vacío en ${archivo}`);
  writeFileSync(archivo, html, 'utf8');
}

inyectar(resolve(DIST, 'index.html'), cuerpoInicio(await prerenderHomeHero()));
preloadHomeModule(DIST);
const paneles = await prerenderCalculadoras(catalogo.paginas.map((pagina) => pagina.slug));
for (const pagina of catalogo.paginas) {
  inyectar(resolve(DIST, 'calculadoras', pagina.slug, 'index.html'), cuerpoCalculadora(pagina, paneles[pagina.slug]));
}

console.log(`SEO estático: portada + ${catalogo.paginas.length} calculadoras con H1, contenido, casos verificados y enlaces internos.`);
