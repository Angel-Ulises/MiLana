(() => {
  'use strict';
  const root = document.documentElement;
  if (root.classList.contains('ml-orbita-embed') || new URLSearchParams(location.search).get('embed') === '1') return;
  if (/^\/calculadoras\/pension-imss\/?$/.test(location.pathname)) return;

  // La misma preferencia de lectura que React, sin guardar aperturas individuales.
  let nivel = 'inicio';
  let soloEnPagina = false;
  const bloques = new Map();
  const leerNivel = () => {
    if (soloEnPagina) return nivel;
    try { const valor = sessionStorage.getItem('ml-lectura-v1'); return ['inicio', 'medio', 'experto'].includes(valor) ? valor : 'inicio'; }
    catch { return nivel; }
  };
  const aplicarNivel = (valor) => {
    if (!['inicio', 'medio', 'experto'].includes(valor)) return;
    nivel = valor;
    bloques.forEach((estado, bloque) => {
      if (estado.manual !== null) return;
      estado.esperado = nivel === 'experto';
      bloque.open = estado.esperado;
    });
  };
  nivel = leerNivel();
  window.addEventListener('ml:reading-depth', (event) => {
    if (!['inicio', 'medio', 'experto'].includes(event.detail?.nivel)) return;
    soloEnPagina = event.detail.guardado === false;
    aplicarNivel(event.detail.nivel);
  });
  window.addEventListener('pageshow', () => aplicarNivel(leerNivel()));

  const TERMS = {
    ISR: 'Impuesto Sobre la Renta. Es un impuesto federal que puede retenerse o pagarse sobre ciertos ingresos, según las reglas fiscales aplicables.',
    UMA: 'Unidad de Medida y Actualización. Es una referencia en pesos que se usa para calcular distintos conceptos legales y administrativos.',
    CETES: 'Certificados de la Tesorería de la Federación. Son instrumentos de deuda emitidos por el Gobierno Federal con plazos y rendimientos que cambian con el mercado.',
    ETF: 'Fondo que se compra y vende en bolsa, como una acción. Puede reunir muchas inversiones, pero también puede perder valor.',
    LIQUIDEZ: 'Qué tan fácil y rápido puedes convertir una inversión en dinero disponible, y bajo qué condiciones.',
    DIVERSIFICACIÓN: 'Repartir el dinero entre distintos activos o fuentes de riesgo. Reduce algunas concentraciones, pero no elimina las pérdidas.',
    VOLATILIDAD: 'Qué tanto cambia el precio de una inversión. Grandes cambios pueden implicar ganancias o pérdidas en poco tiempo.',
    SPREAD: 'Diferencia entre el precio al que alguien compra y el precio al que alguien vende. También puede representar un costo al operar.',
    RENDIMIENTO: 'Ganancia o pérdida de una inversión durante un periodo. No siempre es fijo ni está garantizado.',
    INFLACIÓN: 'Aumento general de precios. Si tu dinero crece menos que los precios, puede comprar menos cosas.',
    COMISIÓN: 'Cobro por un servicio u operación. Compara también impuestos y otros costos, no solo la comisión visible.',
    CAT: 'Costo Anual Total. Es una medida expresada como porcentaje que ayuda a comparar el costo de distintos créditos al integrar varios componentes del financiamiento.',
    RESICO: 'Régimen Simplificado de Confianza. Es un régimen fiscal con requisitos, tasas y obligaciones específicas para quienes pueden tributar en él.',
    PTU: 'Participación de los Trabajadores en las Utilidades. Es el reparto de una parte de las utilidades de la empresa entre trabajadores con derecho.',
    SBC: 'Salario Base de Cotización. Es la base que utiliza el IMSS para calcular cuotas y determinadas prestaciones conforme a sus reglas.',
    IMSS: 'Instituto Mexicano del Seguro Social. Administra seguridad social y diversas prestaciones para personas aseguradas en México.',
    LFT: 'Ley Federal del Trabajo. Es la ley que regula las relaciones laborales contempladas en su ámbito de aplicación en México.'
  };

  // Primer nivel: frases que se entienden sin haber estudiado finanzas.
  // El segundo nivel reutiliza intacta la explicación técnica vigente.
  const BASICS = {
    ISR:'Impuesto que se paga sobre determinados ingresos.',
    UMA:'Una cifra de referencia que se usa en varios cálculos oficiales.',
    CETES:'Le prestas dinero al Gobierno por un plazo.',
    ETF:'Una canasta de inversiones que se compra o vende en bolsa.',
    LIQUIDEZ:'Qué tan rápido puedes recuperar tu dinero.',
    DIVERSIFICACIÓN:'No poner todo tu dinero en el mismo lugar.',
    VOLATILIDAD:'Qué tanto puede subir o bajar el precio.',
    SPREAD:'La diferencia entre el precio para comprar y para vender.',
    RENDIMIENTO:'Lo que ganas o pierdes con tu inversión.',
    INFLACIÓN:'Cuando suben los precios y el dinero alcanza para menos.',
    COMISIÓN:'Lo que te cobran por usar un servicio.',
    CAT:'Un porcentaje que resume varios costos de un crédito.',
    RESICO:'Un régimen fiscal con reglas para ciertos contribuyentes.',
    PTU:'Parte de las utilidades que se reparte a trabajadores con derecho.',
    SBC:'Monto que toma como base el IMSS para ciertos cálculos.',
    IMSS:'Institución mexicana que administra seguridad social.',
    LFT:'Ley principal que regula muchas relaciones de trabajo.'
  };

  const makeStrip = (detected) => {
    const section = document.createElement('section');
    section.className = 'orb-glossary';
    section.dataset.orbitaGlossary = 'true';
    section.setAttribute('aria-label', 'Explicaciones rápidas');
    const heading = document.createElement('div');
    heading.className = 'orb-glossary-head';
    heading.innerHTML = '<span>En pocas palabras</span><strong>Toca lo que no conozcas.</strong>';
    section.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'orb-glossary-list';
    detected.forEach((term) => {
      const details = document.createElement('details');
      details.className = 'orb-glossary-item';
      const experto = nivel === 'experto';
      details.innerHTML = `<summary><strong>${term}</strong><span>¿Qué es?</span></summary><p>${BASICS[term] || TERMS[term]}</p><details class="orb-glossary-deeper"${experto ? ' open' : ''}><summary>Profundizar</summary><p>${TERMS[term]}</p></details>`;
      const profundo = details.querySelector('.orb-glossary-deeper');
      const estado = { manual: null, esperado: experto };
      bloques.set(profundo, estado);
      profundo.addEventListener('toggle', () => {
        if (profundo.open !== estado.esperado) {
          estado.manual = profundo.open;
          estado.esperado = profundo.open;
        }
      });
      list.appendChild(details);
    });
    section.appendChild(list);
    return section;
  };

  const placeStrip = (main, strip) => {
    if ((location.pathname.replace(/\/$/, '') || '/') === '/') {
      const search = main.querySelector('.orb-home-search');
      const routes = main.querySelector('.orb-home-route-grid');
      const anchor = search || routes;
      if (!anchor) return false;
      strip.classList.add('orb-glossary-home');
      anchor.insertAdjacentElement('afterend', strip);
      return true;
    }

    if (root.dataset.orbitaSection === 'calculadoras') {
      const calculator = main.querySelector('.calculator-main') || main;
      const form = calculator.querySelector('form');
      if (form) {
        strip.classList.add('orb-glossary-after-calculator');
        form.insertAdjacentElement('afterend', strip);
        return true;
      }
    }

    const reserve = main.querySelector('[data-orbita-glossary-reserve]');
    if (reserve) {
      reserve.replaceWith(strip);
      return true;
    }

    const h1 = main.querySelector('h1');
    // Si el h1 vive dentro de un hero (p. ej. con el selector de estado), la tira va después del hero:
    // insertarla dentro empujaría los controles del primer viewport.
    const hero = h1?.closest('main > section');
    if (hero && hero.parentElement === main && hero !== main.lastElementChild) {
      hero.insertAdjacentElement('afterend', strip);
      return true;
    }
    const intro = h1?.nextElementSibling?.matches?.('p') ? h1.nextElementSibling : null;
    if (intro) intro.insertAdjacentElement('afterend', strip);
    else if (h1) h1.insertAdjacentElement('afterend', strip);
    else main.prepend(strip);
    return true;
  };

  const run = () => {
    if (document.querySelector('[data-orbita-glossary]')) return;
    const main = document.querySelector('main');
    // El HTML prerenderizado lo reemplaza React: insertar ahí solo mueve el layout y se pierde.
    if (!main || main.hasAttribute('data-static-seo')) return;
    const text = ` ${main.textContent.toUpperCase()} `;
    const detected = Object.keys(TERMS).filter((term) => new RegExp(`(^|[^A-ZÁÉÍÓÚÑ])${term}([^A-ZÁÉÍÓÚÑ]|$)`).test(text));
    if (!detected.length) {
      main.querySelector('[data-orbita-glossary-reserve]')?.remove();
      return;
    }
    const strip = makeStrip(detected.slice(0, 3));
    placeStrip(main, strip);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [80, 240, 650].forEach((delay) => setTimeout(run, delay));
  const rootNode = document.getElementById('root');
  if (rootNode) {
    let queued = false;
    const watcher = new MutationObserver(() => {
      if (document.querySelector('[data-orbita-glossary]')) { watcher.disconnect(); return; }
      if (queued) return;
      queued = true;
      // Microtarea: corre antes del siguiente pintado, así la tira entra junto con el render de React sin mover el layout.
      queueMicrotask(() => { queued = false; run(); });
    });
    watcher.observe(rootNode, { childList: true, subtree: true });
  }
  addEventListener('popstate', () => setTimeout(run, 0));
})();