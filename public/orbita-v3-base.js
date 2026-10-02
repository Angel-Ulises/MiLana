(() => {
  'use strict';
  const root = document.documentElement;
  if (!root.classList.contains('ml-orbita-enabled')) {
    document.querySelector('.ml-orbita-shell')?.remove();
    document.querySelector('.ml-orbita-drawer')?.remove();
    document.querySelector('.ml-orbita-search')?.remove();
    return;
  }
  const shell = document.querySelector('.ml-orbita-shell');
  const drawer = document.querySelector('.ml-orbita-drawer');
  const menu = document.querySelector('.ml-orbita-menu-btn');
  const search = document.querySelector('.ml-orbita-search');
  const searchInput = search?.querySelector('input');
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

  const setEasy = (on) => {
    root.classList.toggle('ml-orbita-easy', on);
    easyButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(on));
      button.title = on ? 'Modo fácil activado' : 'Modo fácil desactivado';
    });
    try { localStorage.setItem('ml-orbita-easy', on ? '1' : '0'); } catch {}
  };
  easyButtons.forEach((button) => button.addEventListener('click', () => setEasy(!root.classList.contains('ml-orbita-easy'))));

  document.querySelectorAll('[data-orbita-search-open]').forEach((button) => button.addEventListener('click', () => {
    if (!search) return;
    search.showModal();
    requestAnimationFrame(() => searchInput?.focus());
  }));
  search?.querySelector('[data-orbita-search-close]')?.addEventListener('click', () => search.close());
  search?.addEventListener('click', (event) => { if (event.target === search) search.close(); });
  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.trim().toLocaleLowerCase('es-MX');
    search.querySelectorAll('[data-orbita-search-item]').forEach((item) => {
      item.hidden = !!q && !item.textContent.toLocaleLowerCase('es-MX').includes(q);
    });
  });

  addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });
  const syncScroll = () => shell?.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', syncScroll, { passive: true });
  syncScroll();
})();
