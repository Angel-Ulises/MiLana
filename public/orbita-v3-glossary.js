(() => {
  'use strict';
  const root = document.documentElement;
  if (root.classList.contains('ml-orbita-embed') || new URLSearchParams(location.search).get('embed') === '1') return;
  if (/^\/calculadoras\/pension-imss\/?$/.test(location.pathname)) return;

  const TERMS = {
    ISR: 'Impuesto Sobre la Renta. Es un impuesto federal que puede retenerse o pagarse sobre ciertos ingresos, según las reglas fiscales aplicables.',
    UMA: 'Unidad de Medida y Actualización. Es una referencia en pesos que se usa para calcular distintos conceptos legales y administrativos.',
    CETES: 'Certificados de la Tesorería de la Federación. Son instrumentos de deuda emitidos por el Gobierno Federal con plazos y rendimientos que cambian con el mercado.',
    CAT: 'Costo Anual Total. Es una medida expresada como porcentaje que ayuda a comparar el costo de distintos créditos al integrar varios componentes del financiamiento.',
    RESICO: 'Régimen Simplificado de Confianza. Es un régimen fiscal con requisitos, tasas y obligaciones específicas para quienes pueden tributar en él.',
    PTU: 'Participación de los Trabajadores en las Utilidades. Es el reparto de una parte de las utilidades de la empresa entre trabajadores con derecho.',
    SBC: 'Salario Base de Cotización. Es la base que utiliza el IMSS para calcular cuotas y determinadas prestaciones conforme a sus reglas.',
    IMSS: 'Instituto Mexicano del Seguro Social. Administra seguridad social y diversas prestaciones para personas aseguradas en México.',
    LFT: 'Ley Federal del Trabajo. Es la ley que regula las relaciones laborales contempladas en su ámbito de aplicación en México.'
  };

  const makeStrip = (detected) => {
    const section = document.createElement('section');
    section.className = 'orb-glossary';
    section.dataset.orbitaGlossary = 'true';
    section.setAttribute('aria-label', 'Explicaciones rápidas');
    const heading = document.createElement('div');
    heading.className = 'orb-glossary-head';
    heading.innerHTML = '<span>Palabras claras</span><strong>Toca “¿Qué es?” cuando aparezca un término difícil.</strong>';
    section.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'orb-glossary-list';
    detected.forEach((term) => {
      const details = document.createElement('details');
      details.className = 'orb-glossary-item';
      details.innerHTML = `<summary><strong>${term}</strong><span>¿Qué es?</span></summary><p>${TERMS[term]}</p>`;
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
    const strip = makeStrip(detected.slice(0, 5));
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
      requestAnimationFrame(() => { queued = false; run(); });
    });
    watcher.observe(rootNode, { childList: true, subtree: true });
  }
  addEventListener('popstate', () => setTimeout(run, 0));
})();
