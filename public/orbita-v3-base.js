(() => {
  'use strict';
  const root = document.documentElement;
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
      button.title = on ? 'Modo fácil activado' : 'Modo fácil desactivado';
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

  addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });
  const syncScroll = () => shell?.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', syncScroll, { passive: true });
  syncScroll();
})();
