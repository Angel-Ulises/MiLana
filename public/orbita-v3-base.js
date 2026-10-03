(() => {
  'use strict';
  const root = document.documentElement;
  const legacyEmbed = new URLSearchParams(location.search).get('embed') === '1' || root.classList.contains('ml-orbita-embed');
  if (legacyEmbed) {
    document.querySelectorAll('.ml-orbita-shell,.ml-orbita-drawer,.ml-orbita-search,.ml-orbita-skip-link').forEach((node) => node.remove());
    root.classList.remove('ml-orbita-enabled');
    return;
  }

  const protectedPension = /^\/calculadoras\/pension-imss\/?$/.test(location.pathname);
  const bundledRuntime = Boolean(document.querySelector('[data-orbita-runtime-bundle]'));
  const visualSections = new Set(['carreras', 'estados', 'finanzas', 'economia', 'aprende']);
  const glossaryPattern = /(^|[^A-ZÁÉÍÓÚÑ])(ISR|UMA|CETES|CAT|RESICO|PTU|SBC|IMSS|LFT)([^A-ZÁÉÍÓÚÑ]|$)/i;

  const reserveRuntimeSurfaces = () => {
    if (protectedPension) return;
    if (bundledRuntime) return;
    const section = root.dataset.orbitaSection || '';
    if (!visualSections.has(section)) return;
    const main = document.querySelector('main');
    if (!main) return;

    const hero = main.querySelector(':scope > .career-hero,:scope > .profession-hero,:scope > .state-hero,:scope > .state-detail-hero,:scope > .finance-page-hero,:scope > .advisor-hero,:scope > .investment-hero,:scope > .economy-hero,:scope > .hubhead');
    const h1 = main.querySelector('h1');
    const intro = h1?.nextElementSibling?.matches?.('p') ? h1.nextElementSibling : null;

    if (!main.querySelector('[data-orbita-visual-reserve]')) {
      const visualReserve = document.createElement('div');
      visualReserve.className = 'orb-runtime-reserve orb-visual-reserve';
      visualReserve.dataset.orbitaVisualReserve = 'true';
      visualReserve.setAttribute('aria-hidden', 'true');
      if (hero) hero.insertAdjacentElement('afterend', visualReserve);
      else if (intro) intro.insertAdjacentElement('afterend', visualReserve);
      else if (h1) h1.insertAdjacentElement('afterend', visualReserve);
      else main.prepend(visualReserve);
    }

    const needsGlossary = glossaryPattern.test(main.textContent || '');
    if (needsGlossary && !main.querySelector('[data-orbita-glossary-reserve]')) {
      const glossaryReserve = document.createElement('div');
      glossaryReserve.className = 'orb-runtime-reserve orb-glossary-reserve';
      glossaryReserve.dataset.orbitaGlossaryReserve = 'true';
      glossaryReserve.setAttribute('aria-hidden', 'true');
      if (intro) intro.insertAdjacentElement('afterend', glossaryReserve);
      else if (h1) h1.insertAdjacentElement('afterend', glossaryReserve);
      else main.prepend(glossaryReserve);
    }
  };

  const ensureInternalLayer = () => {
    if (protectedPension) return;
    if (bundledRuntime) return;
    const styles = [
      ['orbitaInternalStyle', '/orbita-v3-internal.css'],
      ['orbitaHybridStyle', '/orbita-v3-hybrid.css'],
      ['orbitaExperienceStyle', '/orbita-v3-experience.css'],
      ['orbitaGlossaryStyle', '/orbita-v3-glossary.css'],
      ['orbitaVisualsStyle', '/orbita-v3-visuals.css'],
      ['orbitaAuditStyle', '/orbita-v3-audit.css'],
    ];
    for (const [key, href] of styles) {
      if (document.querySelector(`link[data-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}]`)) continue;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.dataset[key] = 'true';
      document.head.appendChild(link);
    }
    const scripts = [
      ['orbitaInternalRuntime', '/orbita-v3-internal.js'],
      ['orbitaExperienceRuntime', '/orbita-v3-experience.js'],
      ['orbitaGlossaryRuntime', '/orbita-v3-glossary.js'],
      ['orbitaVisualsRuntime', '/orbita-v3-visuals.js'],
    ];
    for (const [key, src] of scripts) {
      if (document.querySelector(`script[data-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}]`)) continue;
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.dataset[key] = 'true';
      document.body.appendChild(script);
    }
  };
  reserveRuntimeSurfaces();
  ensureInternalLayer();

  const shell = document.querySelector('.ml-orbita-shell');
  const drawer = document.querySelector('.ml-orbita-drawer');
  const menu = document.querySelector('.ml-orbita-menu-btn');
  const search = document.querySelector('.ml-orbita-search');
  const searchInput = search?.querySelector('input');
  const searchEmpty = search?.querySelector('[data-orbita-search-empty]');
  const easyButtons = [...document.querySelectorAll('[data-orbita-easy]')];
  const section = root.dataset.orbitaSection || 'inicio';

  document.querySelectorAll(`[data-orbita-nav="${section}"]`).forEach((a) => a.setAttribute('aria-current', 'page'));
  const setMenu = (open) => {
    if (!drawer || !menu) return;
    drawer.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden', String(!open));
  };
  menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  drawer?.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });

  const setEasy = (on, persist = true) => {
    root.classList.toggle('ml-orbita-easy', on);
    easyButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(on));
      button.title = on ? 'Letra grande activada' : 'Letra grande desactivada';
      const label = button.querySelector('span');
      if (label) label.textContent = 'Letra grande';
      else if (button.classList.contains('ml-orbita-mobile-easy')) button.textContent = 'Letra grande';
    });
    if (persist) try { localStorage.setItem('ml-orbita-easy', on ? '1' : '0'); } catch {}
  };
  setEasy(root.classList.contains('ml-orbita-easy'), false);
  easyButtons.forEach((button) => button.addEventListener('click', () => setEasy(!root.classList.contains('ml-orbita-easy'))));

  const filterSearch = () => {
    if (!search || !searchInput) return [];
    const q = searchInput.value.trim().toLocaleLowerCase('es-MX');
    const visible=[];
    search.querySelectorAll('[data-orbita-search-item]').forEach((item) => {
      const match = !q || item.textContent.toLocaleLowerCase('es-MX').includes(q);
      item.hidden = !match;
      if (match) visible.push(item);
    });
    if (searchEmpty) searchEmpty.hidden = visible.length !== 0;
    return visible;
  };
  document.querySelectorAll('[data-orbita-search-open]').forEach((button) => button.addEventListener('click', () => {
    if (!search) return;
    search.showModal();
    requestAnimationFrame(() => { searchInput?.focus(); filterSearch(); });
  }));
  search?.querySelector('[data-orbita-search-close]')?.addEventListener('click', () => search.close());
  search?.addEventListener('click', (event) => { if (event.target === search) search.close(); });
  searchInput?.addEventListener('input', filterSearch);
  searchInput?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const [first] = filterSearch();
    if (!first) return;
    event.preventDefault();
    first.click();
  });

  let anchorObserver;
  const settleHashAnchor = () => {
    if (location.pathname !== '/' || location.hash !== '#calculadoras') return;
    const scroll = () => {
      const target = document.getElementById('calculadoras');
      if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' });
    };
    anchorObserver?.disconnect();
    const host = document.getElementById('root') || document.body;
    anchorObserver = new MutationObserver(() => requestAnimationFrame(scroll));
    anchorObserver.observe(host, { childList: true, subtree: true });
    requestAnimationFrame(() => requestAnimationFrame(scroll));
    [80, 200, 450, 900].forEach((delay) => setTimeout(scroll, delay));
    setTimeout(() => anchorObserver?.disconnect(), 1200);
  };
  if (document.readyState === 'complete') settleHashAnchor();
  else addEventListener('load', settleHashAnchor, { once: true });
  addEventListener('hashchange', settleHashAnchor);

  addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });
  const syncScroll = () => shell?.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', syncScroll, { passive: true });
  syncScroll();
})();
