(() => {
  'use strict';

  const PROD = new Set(['milanaaqui.mx', 'www.milanaaqui.mx']);
  const isProd = PROD.has(location.hostname);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const qs = (s, r = document) => r?.querySelector?.(s) || null;
  const qsa = (s, r = document) => r?.querySelectorAll ? [...r.querySelectorAll(s)] : [];
  const safePath = () => location.pathname.replace(/\/+$/, '') || '/';
  let historyReady = false;
  let reducedMotionReady = false;

  const track = (event, params = {}) => {
    if (!isProd || typeof window.gtag !== 'function') return;
    window.gtag('event', event, { page_path: safePath(), ...params });
  };

  function patchReducedMotionScroll() {
    if (reducedMotionReady || !reduceMotion || !Element.prototype.scrollIntoView) return;
    reducedMotionReady = true;
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function patched(arg) {
      if (arg && typeof arg === 'object') return original.call(this, { ...arg, behavior: 'auto' });
      return original.call(this, arg);
    };
  }

  function setupHistoryTracking() {
    if (historyReady || !isProd) return;
    historyReady = true;
    const notify = () => setTimeout(() => window.gtag?.('event', 'page_view', {
      page_path: safePath(),
      page_title: document.title,
      send_to: 'G-M4819QE19R'
    }), 0);
    const push = history.pushState.bind(history);
    history.pushState = (...args) => { push(...args); notify(); };
    addEventListener('popstate', notify);
  }

  /* El menú móvil se crea sin reordenar ni renombrar la navegación de
     escritorio. Antes el script cambiaba enlaces después del primer paint y
     provocaba un pequeño salto visible en el header. */
  function setupHeader() {
    const header = qs('.site-header');
    const inner = qs('.header-inner', header);
    const nav = qs('.desktop-nav', header);
    if (!header || !inner || !nav || qs('.astra-menu-button', header)) return;

    const button = document.createElement('button');
    button.className = 'astra-menu-button';
    button.type = 'button';
    button.textContent = 'Menú';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'astra-mobile-menu');
    button.setAttribute('aria-label', 'Abrir menú');

    const menu = document.createElement('nav');
    menu.id = 'astra-mobile-menu';
    menu.className = 'astra-mobile-menu';
    menu.hidden = true;
    menu.setAttribute('aria-label', 'Navegación móvil');

    qsa('a', nav).forEach(source => {
      const a = document.createElement('a');
      a.href = source.getAttribute('href') || '/';
      a.textContent = source.textContent || '';
      menu.appendChild(a);
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

  /* La portada se considera declarativa: React + CSS deciden texto, foto y
     orden. Este script sólo añade telemetría y nunca vuelve a mover el DOM. */
  function setupHome() {
    const hero = qs('.hero');
    if (!hero || hero.dataset.astraReady === 'true') return;
    hero.dataset.astraReady = 'true';
    const calculators = qs('#calculadoras', hero.parentElement);
    qsa('.calculator-card a[href^="/calculadoras/"]', calculators).forEach(a => a.addEventListener('click', () => {
      track('home_calculator_click', {
        calculator: a.getAttribute('href').split('/').filter(Boolean).at(-1) || 'unknown'
      });
    }));
  }

  function setupCalculator() {
    const hero = qs('.calculator-hero'), main = qs('.calculator-main');
    if (!hero || !main || hero.dataset.astraReady === 'true') return;
    hero.dataset.astraReady = 'true';
    main.id = 'calculo';

    qsa('input[type="number"]', main).forEach(input => input.setAttribute('inputmode', 'decimal'));
    qsa('input[type="date"]', main).forEach(input => {
      input.lang = 'es-MX';
      if (!input.getAttribute('aria-describedby')) {
        const hint = document.createElement('p');
        hint.className = 'astra-field-hint';
        hint.textContent = 'Fecha en formato local del selector de tu dispositivo.';
        hint.id = `astra-date-${Math.random().toString(36).slice(2)}`;
        input.setAttribute('aria-describedby', hint.id);
        input.after(hint);
      }
    });

    const firstInput = qs('input, select', main);
    firstInput?.addEventListener('focus', () => track('calculator_start', {
      calculator: safePath().split('/').at(-1) || 'unknown'
    }), { once: true });
    qsa('.ml-result, [aria-live]', main).forEach(result => result.setAttribute('aria-live', 'polite'));
  }

  function setupFooter() {
    const footer = qs('.site-footer .footer-inner');
    if (!footer || qs('.astra-footer-links', footer)) return;
    const links = document.createElement('nav');
    links.className = 'astra-footer-links';
    links.setAttribute('aria-label', 'Información de MiLana');
    [
      ['/aprende/','Aprende'],
      ['/sobre/','Sobre MiLana'],
      ['/metodo/','Método editorial'],
      ['/contacto/','Contacto'],
      ['/privacidad/','Privacidad'],
      ['/financiamiento/','Cómo nos financiamos']
    ].forEach(([href,label]) => {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      links.appendChild(a);
    });
    footer.appendChild(links);
  }

  function init() {
    patchReducedMotionScroll();
    setupHistoryTracking();
    setupHeader();
    setupHome();
    setupCalculator();
    setupFooter();
  }

  let scheduled = false;
  const scheduleInit = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; init(); });
  };
  const observer = new MutationObserver(scheduleInit);
  const start = () => {
    observer.observe(document.documentElement, { childList: true, subtree: true });
    scheduleInit();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
