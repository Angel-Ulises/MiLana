// Impresión: al imprimir o guardar como PDF, «Ver cómo se calculó» y las secciones plegadas de las guías salen abiertas
// para que el papel lleve todo el contenido.
// Al terminar, vuelve a quedar como estaba. Los estilos de la hoja limpia están en resultado-claro.css y static-2026.css.
(() => {
  'use strict';
  let abiertos = [];
  // «Ver cómo se calculó» (calculadoras) y las secciones plegadas de las guías.
  const EXPLICACION = 'details.rc-detalle:not(.rc-reclamo):not(.rc-pagaron):not([open]), details.guide-more:not([open])';
  window.addEventListener('beforeprint', () => {
    abiertos = [...document.querySelectorAll(EXPLICACION)];
    abiertos.forEach((d) => { d.open = true; });
  });
  window.addEventListener('afterprint', () => {
    abiertos.forEach((d) => { d.open = false; });
    abiertos = [];
  });
})();
