import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

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
  return pagina ? `/calculadoras/${pagina.slug}` : '/#calculadoras';
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

function cuerpoCalculadora(pagina) {
  const dato = contenido[pagina.id];
  if (!dato) throw new Error(`Falta contenido editorial para ${pagina.id}`);
  const faq = Array.isArray(dato.faq) ? dato.faq : [];
  const siguientes = Array.isArray(dato.siguientes) ? dato.siguientes : [];

  return `    <div id="root">
      <main data-static-seo="calculadora">
        <nav aria-label="Ruta"><a href="/">Inicio</a> / <a href="/#calculadoras">Calculadoras</a></nav>
        <h1>${escapar(tituloCorto(pagina))}</h1>
        <p>${escapar(dato.proposito)}</p>

        ${casoCalculadora(pagina)}
        <section>
          <h2>Cómo leer tu resultado</h2>
          <p>${escapar(dato.interpretacion)}</p>
        </section>
        <section>
          <h2>Qué significa para ti</h2>
          <p>${escapar(dato.significado)}</p>
        </section>
        <section>
          <h2>Cómo se calcula</h2>
          <p>${escapar(dato.metodologia)}</p>
        </section>
        <section>
          <h2>Supuestos y límites</h2>
          <p>${escapar(dato.supuestos)}</p>
        </section>
        <section>
          <h2>Fundamento y fuentes</h2>
          <p>${escapar(dato.fundamento)}</p>
        </section>
        ${faq.length ? `<section><h2>Preguntas frecuentes</h2>${faq.map((item) => `<h3>${escapar(item.pregunta)}</h3><p>${escapar(item.respuesta)}</p>`).join('')}</section>` : ''}
        ${siguientes.length ? `<section><h2>Qué revisar después</h2><ul>${siguientes.map((item) => `<li><a href="${enlazar(item.destino)}">${escapar(item.texto)}</a></li>`).join('')}</ul></section>` : ''}
        <p><a href="/aprende">Consulta también las guías de MiLana</a>.</p>
      </main>
    </div>`;
}

function cuerpoInicio() {
  const calculadoras = catalogo.paginas.map((pagina) =>
    `<li><a href="/calculadoras/${pagina.slug}">${escapar(tituloCorto(pagina))}</a> — ${escapar(pagina.descripcion)}</li>`
  ).join('');
  return `    <div id="root">
      <main data-static-seo="inicio">
        <h1>Calculadoras de sueldo, prestaciones e impuestos para México</h1>
        <p>MiLana reúne herramientas gratuitas para estimar y entender sueldo, ISR, aguinaldo, finiquito, liquidación, vacaciones, PTU, RESICO, Infonavit y pensión IMSS con alcance y fuentes visibles.</p>
        <h2>Calculadoras</h2>
        <ul>${calculadoras}</ul>
        <h2>Aprende antes de decidir</h2>
        <ul>
          <li><a href="/aprende/finiquito-vs-liquidacion">Finiquito vs. liquidación</a></li>
          <li><a href="/aprende/leer-recibo-nomina">Cómo leer tu recibo de nómina</a></li>
          <li><a href="/aprende/aguinaldo-bruto-neto">Aguinaldo bruto y neto</a></li>
          <li><a href="/aprende/vacaciones-prima-vacacional">Vacaciones y prima vacacional</a></li>
          <li><a href="/aprende/resico-ingresos-cobrados">RESICO e ingresos cobrados</a></li>
          <li><a href="/aprende/pension-imss-ley-97">Pensión IMSS Ley 97</a></li>
        </ul>
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

inyectar(resolve(DIST, 'index.html'), cuerpoInicio());
for (const pagina of catalogo.paginas) {
  inyectar(resolve(DIST, 'calculadoras', pagina.slug, 'index.html'), cuerpoCalculadora(pagina));
}

console.log(`SEO estático: portada + ${catalogo.paginas.length} calculadoras con H1, contenido, casos verificados y enlaces internos.`);
