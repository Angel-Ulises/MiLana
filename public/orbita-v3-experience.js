(() => {
  'use strict';

  const html = document.documentElement;
  if (html.classList.contains('ml-orbita-embed') || new URLSearchParams(location.search).get('embed') === '1') return;
  if (/^\/calculadoras\/pension-imss\/?$/.test(location.pathname)) return;

  const svgIcon = (name) => {
    const common = 'viewBox="0 0 24 24" aria-hidden="true"';
    const paths = {
      exit: '<path d="M14 5H6v14h8M10 12h10m0 0-3-3m3 3-3 3"/>',
      work: '<path d="M8 7V5h8v2m-11 3h14v9H5zM5 13h14"/>',
      gift: '<path d="M4 10h16v10H4zM3 7h18v3H3zm9 0v13M12 7c-1-4-6-4-6-1 0 2 3 1 6 1zm0 0c1-4 6-4 6-1 0 2-3 1-6 1z"/>',
      wallet: '<path d="M4 7h15v11H4zM4 9V6h12m3 5h-5v4h5"/>',
      cap: '<path d="m3 9 9-5 9 5-9 5zm4 3v5c3 2 7 2 10 0v-5m4-3v6"/>',
      map: '<path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2zM9 4v14m6-12v14"/>'
    };
    return `<svg ${common}>${paths[name] || paths.wallet}</svg>`;
  };

  const options = [
    { label: 'Me despidieron', href: '/calculadoras/liquidacion', icon: 'exit', tone: 'blue' },
    { label: 'Renuncié', href: '/calculadoras/finiquito', icon: 'work', tone: 'blue' },
    { label: 'Voy a cobrar aguinaldo', href: '/calculadoras/aguinaldo', icon: 'gift', tone: 'coral' },
    { label: 'Quiero ahorrar', href: '/finanzas', icon: 'wallet', tone: 'green' },
    { label: 'Estoy eligiendo carrera', href: '/carreras', icon: 'cap', tone: 'violet' },
    { label: 'Pienso mudarme de estado', href: '/estados', icon: 'map', tone: 'teal' }
  ];

  const readRoute = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('ml-orbita-route') || 'null');
      // Solo rutas internas guardadas por este mismo script.
      return saved && typeof saved.label === 'string' && /^\/(?!\/)/.test(String(saved.href)) ? saved : null;
    }
    catch { return null; }
  };

  const rememberRoute = (option) => {
    try {
      localStorage.setItem('ml-orbita-route', JSON.stringify({ label: option.label, href: option.href, step: 1, updatedAt: Date.now() }));
    } catch {}
  };

  const makeHomeRoutes = () => {
    const block = document.createElement('section');
    block.className = 'orb-home-routes';
    block.id = 'orb-home-routes';
    block.setAttribute('aria-labelledby', 'orb-home-routes-title');

    const title = document.createElement('h2');
    title.id = 'orb-home-routes-title';
    title.textContent = '¿Qué estás viviendo?';
    block.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'orb-home-route-grid';
    for (const option of options) {
      const a = document.createElement('a');
      a.className = `orb-home-route orb-tone-${option.tone}`;
      a.href = option.href;
      a.innerHTML = `<span class="orb-home-route-icon">${svgIcon(option.icon)}</span><span>${option.label}</span><b aria-hidden="true">›</b>`;
      a.addEventListener('click', () => rememberRoute(option));
      grid.appendChild(a);
    }
    block.appendChild(grid);

    const search = document.createElement('button');
    search.type = 'button';
    search.className = 'orb-home-search';
    search.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg><span>¿Ya sabes qué buscas? <strong>Busca una calculadora</strong></span><b aria-hidden="true">›</b>';
    search.addEventListener('click', () => document.querySelector('[data-orbita-search-open]')?.click());
    block.appendChild(search);
    return block;
  };

  const makeSituationCard = () => {
    const route = readRoute();
    const card = document.createElement('section');
    card.className = 'orb-situation-card';
    card.dataset.orbitaSituationCard = 'true';
    card.setAttribute('aria-label', 'Mi situación');

    const copy = document.createElement('div');
    const addLine = (tag, text) => { const node = document.createElement(tag); node.textContent = text; copy.appendChild(node); };
    addLine('span', 'Mi situación · paso 1 de 4');
    addLine('strong', route ? String(route.label) : 'Empieza por lo que estás viviendo');
    addLine('p', route
      ? 'Tu ruta queda guardada en este dispositivo para que puedas retomarla.'
      : 'Elige una ruta y MiLana te lleva a la herramienta correcta sin hacerte adivinar qué buscar.');

    const action = document.createElement('a');
    action.href = route?.href || '#orb-home-routes';
    action.innerHTML = route ? '<span>Siguiente:</span> continuar mi ruta <b>→</b>' : '<span>Siguiente:</span> elegir mi situación <b>→</b>';
    card.append(copy, action);
    return card;
  };

  const enhanceHome = () => {
    if ((location.pathname.replace(/\/$/, '') || '/') !== '/') return;
    const hero = document.querySelector('.hero');
    const copy = hero?.querySelector('.hero-copy');
    if (!hero || !copy || hero.dataset.orbitaHybridReady === '1') return;

    hero.dataset.orbitaHybridReady = '1';
    // React ya renderiza el hero V4 (src/homeRoutes.jsx): no reescribir texto ni insertar nodos.
    if (copy.querySelector('.orb-home-routes') && copy.querySelector('.orb-home-accent')) return;
    const eyebrow = copy.querySelector('.eyebrow');
    if (eyebrow) {
      eyebrow.classList.add('orb-home-kicker');
      eyebrow.textContent = 'Gratis · sin registro · datos 2026';
    }

    const h1 = copy.querySelector('h1');
    if (h1) {
      h1.textContent = '';
      h1.append('Entiende tu ');
      const accent = document.createElement('span');
      accent.className = 'orb-home-accent';
      accent.textContent = 'lana';
      h1.append(accent, ' en un minuto');
    }

    const lede = copy.querySelector('.hero-lede');
    if (lede) lede.textContent = 'Elige lo que estás viviendo y te decimos qué hacer, paso a paso.';
    copy.querySelector('.hero-actions')?.setAttribute('hidden', '');
    copy.querySelector('.hero-proof')?.setAttribute('hidden', '');
    if (!copy.querySelector('.orb-home-routes')) copy.appendChild(makeHomeRoutes());

    hero.querySelector('.hero-note')?.setAttribute('hidden', '');
    const media = hero.querySelector('.hero-media');
    if (media && !media.querySelector('.orb-home-photo-caption')) {
      const caption = document.createElement('figcaption');
      caption.className = 'orb-home-photo-caption';
      caption.textContent = 'Calculadoras y guías con fuentes oficiales.';
      media.appendChild(caption);
    }

    if (!document.querySelector('[data-orbita-situation-card]')) hero.insertAdjacentElement('afterend', makeSituationCard());
  };

  const run = () => {
    enhanceHome();
  };

  let rootObserver = null;
  let observedRoot = null;
  let queued = false;
  const queueRun = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      observeRoot();
      run();
    });
  };
  function observeRoot() {
    const target = document.getElementById('root');
    if (!target) return;
    if (!rootObserver) rootObserver = new MutationObserver(queueRun);
    if (observedRoot !== target) {
      rootObserver.disconnect();
      observedRoot = target;
    }
    rootObserver.observe(observedRoot, { childList: true, subtree: true });
  }

  observeRoot();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', queueRun, { once: true });
  else queueRun();
  addEventListener('popstate', queueRun);
})();
