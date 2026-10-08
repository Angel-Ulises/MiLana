import { useEffect } from 'react';

function sincronizarEconomia() {
  // La navegación principal se genera desde siteNavigation.js; no insertar enlaces con MutationObserver.
  const head = document.querySelector('.ml-editorial-list-head');
  if (head && !head.querySelector('[data-ml-economy-entry]')) {
    const link = document.createElement('a');
    link.href = '/economia';
    link.textContent = 'Abrir Radar →';
    link.dataset.mlEconomyEntry = 'true';
    head.appendChild(link);
  }

  const filas = [...document.querySelectorAll('.ml-editorial-row-link')];
  const destinos = [
    '/economia/banxico-mantiene-tasa-650-septiembre-2026',
    '/economia/economias-regionales-segundo-trimestre-2026',
  ];
  filas.slice(0, destinos.length).forEach((fila, i) => fila.setAttribute('href', destinos[i]));

  const TEXT = 'Radar activo con fecha, fuente y contexto visibles. Las señales económicas se conectan con herramientas de MiLana y no se presentan como recomendaciones financieras personalizadas.';
  const nota = document.querySelector('.ml-editorial-note');
  if (nota && nota.textContent !== TEXT) nota.textContent = TEXT;
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
