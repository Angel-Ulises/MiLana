(() => {
  'use strict';

  const PROD = new Set(['milanaaqui.mx', 'www.milanaaqui.mx']);
  const isProd = PROD.has(location.hostname);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const safePath = () => location.pathname.replace(/\/+$/, '') || '/';
  const track = (event, params = {}) => {
    if (!isProd || typeof window.gtag !== 'function') return;
    window.gtag('event', event, { page_path: safePath(), ...params });
  };

  function patchReducedMotionScroll() {
    if (!reduceMotion || !Element.prototype.scrollIntoView) return;
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function patched(arg) {
      if (arg && typeof arg === 'object') return original.call(this, { ...arg, behavior: 'auto' });
      return original.call(this, arg);
    };
  }

  function setupHistoryTracking() {
    if (!isProd) return;
    const notify = () => setTimeout(() => window.gtag?.('event', 'page_view', {
      page_path: safePath(),
      page_title: document.title,
      send_to: 'G-M4819QE19R'
    }), 0);
    const push = history.pushState.bind(history);
    history.pushState = (...args) => { push(...args); notify(); };
    addEventListener('popstate', notify);
  }

  function setupHeader() {
    const header = qs('.site-header');
    const inner = qs('.header-inner', header);
    const nav = qs('.desktop-nav', header);
    if (!header || !inner || !nav || qs('.astra-menu-button', header)) return;

    const links = qsa('a', nav);
    const byHref = Object.fromEntries(links.map(a => [a.getAttribute('href'), a]));
    const order = ['/#calculadoras', '/#situaciones', '/#aprende', '/#fuentes'];
    const labels = {
      '/#calculadoras': 'Calculadoras',
      '/#situaciones': 'Tu situación',
      '/#aprende': 'Aprende',
      '/#fuentes': 'Cómo revisamos'
    };
    nav.replaceChildren(...order.map(href => {
      const a = byHref[href] || document.createElement('a');
      a.href = href; a.textContent = labels[href]; return a;
    }));
    const cta = qs('.header-cta', header);
    if (cta) { cta.href = '/#calculadoras'; cta.textContent = 'Ver calculadoras'; }

    const button = document.createElement('button');
    button.className = 'astra-menu-button';
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'astra-mobile-menu');
    button.setAttribute('aria-label', 'Abrir menú');
    button.textContent = 'Menú';

    const menu = document.createElement('nav');
    menu.id = 'astra-mobile-menu';
    menu.className = 'astra-mobile-menu';
    menu.setAttribute('aria-label', 'Navegación móvil');
    menu.hidden = true;
    order.forEach(href => {
      const a = document.createElement('a'); a.href = href; a.textContent = labels[href]; menu.appendChild(a);
    });
    header.appendChild(menu);
    inner.appendChild(button);

    let previousFocus = null;
    const close = () => {
      menu.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Abrir menú');
      previousFocus?.focus();
    };
    const open = () => {
      previousFocus = document.activeElement;
      menu.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', 'Cerrar menú');
      qs('a', menu)?.focus();
    };
    button.addEventListener('click', () => menu.hidden ? open() : close());
    menu.addEventListener('click', e => { if (e.target.closest('a')) close(); });
    header.addEventListener('keydown', e => {
      if (menu.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const focusable = [button, ...qsa('a', menu)];
      const first = focusable[0], last = focusable.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function statusForCard(article) {
    const text = (qs('h3', article)?.textContent || '').toLowerCase();
    return ['bruto a neto', 'finiquito', 'liquidación'].some(x => text.includes(x));
  }

  function setupHome() {
    const hero = qs('.hero');
    if (!hero) return;
    const lede = qs('.hero-lede', hero);
    if (lede) lede.textContent = 'Calcula tu sueldo y prestaciones en México. Entiende el resultado, revisa sus fuentes y elige tu siguiente paso.';
    const actions = qsa('.hero-actions a', hero);
    if (actions[0]) { actions[0].href = '/#calculadoras'; actions[0].textContent = 'Ver calculadoras'; }
    if (actions[1]) { actions[1].href = '/#situaciones'; actions[1].textContent = 'Elegir mi situación'; }

    const main = hero.parentElement;
    const calculators = qs('#calculadoras', main);
    const situations = qs('#situaciones', main);
    const path = qs('.path-section', main);
    const learn = qs('#aprende', main);
    const trust = qs('#fuentes', main);
    if (path) path.classList.add('astra-deferred-path');
    if (main && calculators && situations) {
      hero.after(calculators);
      calculators.after(situations);
      if (learn) situations.after(learn);
      if (trust && learn) learn.after(trust);
    }

    const showAll = qsa('button', calculators).find(b => /ver las 10|ver todas/i.test(b.textContent));
    if (showAll) showAll.click();
    setTimeout(() => {
      const grid = qs('.calculator-grid', calculators);
      if (!grid) return;
      const cards = qsa('.calculator-card', grid).filter(c => qs('h3', c));
      const desired = ['Bruto a Neto', 'Aguinaldo', 'Finiquito', 'Liquidación', 'Vacaciones', 'ISR'];
      const ordered = [];
      desired.forEach(name => {
        const card = cards.find(c => qs('h3', c)?.textContent.trim() === name);
        if (card) ordered.push(card);
      });
      cards.filter(c => !ordered.includes(c)).forEach(c => ordered.push(c));
      ordered.forEach((card, i) => {
        card.style.order = String(i);
        if (i >= 6) card.classList.add('astra-extra-calc');
        if (statusForCard(card) && !qs('.astra-review-label', card)) {
          const badge = document.createElement('span');
          badge.className = 'astra-review-label';
          badge.textContent = 'Importe en revisión';
          qs('p', card)?.after(badge);
        }
      });
      calculators.dataset.astraExpanded = 'false';
      if (showAll) {
        showAll.textContent = 'Ver las 10 calculadoras →';
        showAll.onclick = null;
        showAll.addEventListener('click', e => {
          e.preventDefault();
          const expanded = calculators.dataset.astraExpanded === 'true';
          calculators.dataset.astraExpanded = String(!expanded);
          showAll.textContent = expanded ? 'Ver las 10 calculadoras →' : 'Mostrar solo principales ↑';
        });
      }
    }, 0);

    if (trust) {
      const eyebrow = qs('.eyebrow', trust); if (eyebrow) eyebrow.textContent = 'Cómo revisamos';
      const h2 = qs('h2', trust); if (h2) h2.textContent = 'Fuentes, alcance y fecha antes de decir “verificado”.';
    }

    qsa('.calculator-card a[href^="/calculadoras/"]', calculators).forEach(a => a.addEventListener('click', () => {
      track('home_calculator_click', { calculator: a.getAttribute('href').split('/').filter(Boolean).at(-1) || 'unknown' });
    }));
  }

  function setupCalculator() {
    const hero = qs('.calculator-hero');
    const main = qs('.calculator-main');
    if (!hero || !main) return;
    const title = qs('h1', hero)?.textContent.trim() || '';
    const purposes = {
      'Aguinaldo': 'Estima tu aguinaldo completo o proporcional. Revisa el desglose y los supuestos antes de compararlo con tu recibo.',
      'ISR': 'Estima la retención de un mes completo ordinario de 2026 dentro del alcance indicado. Revisa los supuestos antes de compararla con tu recibo.',
      'Bruto a Neto': 'Consulta el alcance de esta herramienta. El importe permanece en revisión hasta cerrar correctamente el componente IMSS.',
      'Finiquito': 'Revisa qué conceptos forman un finiquito y el estado de la revisión. El importe permanece suspendido mientras se corrigen fechas, antigüedad y saldos.',
      'Liquidación': 'Revisa los conceptos y supuestos jurídicos de una liquidación. El importe permanece suspendido hasta modelar correctamente los escenarios aplicables.'
    };
    const purpose = qs('.calculator-hero-copy p:last-of-type', hero);
    if (purpose && purposes[title]) purpose.textContent = purposes[title];

    if (!qs('.astra-jump-to-calc', hero)) {
      const jump = document.createElement('a');
      jump.href = '#calculo'; jump.className = 'astra-jump-to-calc'; jump.textContent = 'Ir al cálculo';
      qs('.calculator-hero-copy', hero)?.appendChild(jump);
      main.id = 'calculo';
    }

    const media = qs('.calculator-hero-media', hero);
    const comp = main.firstElementChild;
    if (media && comp && !qs('.astra-mobile-photo', main)) {
      const mobile = document.createElement('div'); mobile.className = 'astra-mobile-photo';
      const picture = qs('picture, img', media);
      if (picture) mobile.appendChild(picture.cloneNode(true));
      comp.after(mobile);
    }

    qsa('input[type="number"]', main).forEach(input => input.setAttribute('inputmode', 'decimal'));
    qsa('input[type="date"]', main).forEach(input => {
      input.lang = 'es-MX';
      if (!input.getAttribute('aria-describedby')) {
        const hint = document.createElement('p');
        hint.className = 'astra-field-hint'; hint.textContent = 'Fecha en formato local del selector de tu dispositivo.';
        hint.id = `astra-date-${Math.random().toString(36).slice(2)}`;
        input.setAttribute('aria-describedby', hint.id); input.after(hint);
      }
    });

    qsa('form', main).forEach(form => form.addEventListener('submit', () => {
      track('calculation_submit', { calculator: safePath().split('/').at(-1) || 'unknown' });
      setTimeout(() => {
        const invalid = qs('[aria-invalid="true"]', form);
        if (invalid) invalid.focus();
      }, 0);
    }));
    qsa('input, select', main).forEach((el, i) => {
      if (i === 0) el.addEventListener('focus', () => track('calculator_start', { calculator: safePath().split('/').at(-1) || 'unknown' }), { once: true });
    });
    qsa('.ml-result, [aria-live]', main).forEach(result => result.setAttribute('aria-live', 'polite'));
    qsa('details', main).forEach(d => d.addEventListener('toggle', () => {
      if (d.open) track('trust_open', { calculator: safePath().split('/').at(-1) || 'unknown' });
    }));
  }

  function setupFooter() {
    const footer = qs('.site-footer .footer-inner');
    if (!footer || qs('.astra-footer-links', footer)) return;
    const links = document.createElement('nav');
    links.className = 'astra-footer-links'; links.setAttribute('aria-label', 'Información de MiLana');
    [
      ['/sobre/', 'Sobre MiLana'], ['/metodo/', 'Método editorial'], ['/contacto/', 'Contacto'],
      ['/privacidad/', 'Privacidad'], ['/financiamiento/', 'Cómo nos financiamos']
    ].forEach(([href, label]) => { const a = document.createElement('a'); a.href = href; a.textContent = label; links.appendChild(a); });
    footer.appendChild(links);
  }

  function setupReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const nodes = qsa('main > section').filter(n => !n.classList.contains('hero'));
    nodes.forEach(n => n.classList.add('astra-reveal-pending'));
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('astra-reveal-pending');
      entry.target.classList.add('astra-reveal-in');
      io.unobserve(entry.target);
    }), { rootMargin: '0px 0px -8% 0px', threshold: .05 });
    nodes.forEach(n => io.observe(n));
  }

  function init() {
    patchReducedMotionScroll();
    setupHistoryTracking();
    setupHeader();
    setupHome();
    setupCalculator();
    setupFooter();
    setupReveal();
  }

  const observer = new MutationObserver(() => {
    if (qs('.site-header')) { init(); observer.disconnect(); }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.documentElement, { childList: true, subtree: true });
    init();
  }); else { observer.observe(document.documentElement, { childList: true, subtree: true }); init(); }
})();
