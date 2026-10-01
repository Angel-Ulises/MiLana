import { useEffect } from 'react';

function sincronizarEconomia() {
  const nav = document.querySelector('.desktop-nav');
  if (nav && !nav.querySelector('[data-ml-economy-nav]')) {
    const link = document.createElement('a');
    link.href = '/economia';
    link.textContent = 'Economía';
    link.dataset.mlEconomyNav = 'true';
    const finanzas = [...nav.querySelectorAll('a')].find((a) => a.getAttribute('href') === '/finanzas');
    if (finanzas?.nextSibling) nav.insertBefore(link, finanzas.nextSibling);
    else nav.appendChild(link);
  }

  const head = document.querySelector('.ml-editorial-list-head');
  if (head && !head.querySelector('[data-ml-economy-entry]')) {
    const link = document.createElement('a');
    link.href = '/economia';
    link.textContent = 'Abrir Radar →';
    link.dataset.mlEconomyEntry = 'true';
    head.appendChild(link);
  }
}

export default function EconomyNavigation() {
  useEffect(() => {
    sincronizarEconomia();
    const root = document.getElementById('root');
    if (!root) return undefined;
    const observer = new MutationObserver(sincronizarEconomia);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
