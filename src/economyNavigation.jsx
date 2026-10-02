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

  const filas = [...document.querySelectorAll('.ml-editorial-row-link')];
  const destinos = [
    '/economia/banxico-mantiene-tasa-650-septiembre-2026',
    '/economia/economias-regionales-segundo-trimestre-2026',
  ];
  filas.slice(0, destinos.length).forEach((fila, i) => fila.setAttribute('href', destinos[i]));

  const nota = document.querySelector('.ml-editorial-note');
  const textoNota = 'Radar activo con fecha, fuente y contexto visibles. Las señales económicas se conectan con herramientas de MiLana y no se presentan como recomendaciones financieras personalizadas.';
  if (nota && nota.textContent !== textoNota) nota.textContent = textoNota;
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
