// Página limpia (2026-11-15): en las páginas largas, las secciones secundarias quedan plegadas bajo su
// propio título y se abren al tocarlo. No se borra contenido ni se insertan nodos: solo se marcan atributos
// (data-pl*) sobre el HTML existente, así que no interfiere con React. Los estilos están en
// orbita-v3-prepaint.css. Sin JavaScript, todo el contenido se ve completo.
(() => {
  'use strict';
  if (new URLSearchParams(location.search).get('embed') === '1') return;

  const REGLAS = [
    [/^\/estados\/(?!comparar\/?$)[^/]+\/?$/, ['.state-labor', '.state-occupations', '.state-housing', '.state-meaning', '.state-actions', '.state-near']],
    [/^\/finanzas\/inversion\/?$/, ['.investment-questions', '.investment-security', '.investment-next']],
    [/^\/invertir\/?$/, ['.ml-inv-fees', '.ml-inv-boundary']],
    [/^\/economia\/?$/, ['.economy-sources-section']],
  ];
  const HERRAMIENTA_FINANZAS = /^\/finanzas\/(presupuesto|fondo-emergencia|deuda-y-credito|ahorro)\/?$/;

  const selectores = () => (REGLAS.find(([re]) => re.test(location.pathname)) || [null, []])[1];

  function alternar(seccion, abrir) {
    const abierto = abrir ?? seccion.dataset.pl === '1';
    seccion.dataset.pl = abierto ? '0' : '1';
    seccion.querySelector('[data-pl-titulo]')?.setAttribute('aria-expanded', String(abierto));
  }

  function preparar(seccion) {
    if (seccion.dataset.pl) return;
    const titulo = seccion.querySelector('h2');
    if (!titulo) return;
    // Nivel: el contenedor cuyos hijos directos son «la cabecera» y «el resto».
    const nivel = seccion.querySelector(':scope > .shell') || seccion;
    let cabeza = titulo;
    while (cabeza.parentElement && cabeza.parentElement !== nivel) cabeza = cabeza.parentElement;
    if (cabeza.parentElement !== nivel) return;
    nivel.dataset.plNivel = '';
    cabeza.dataset.plCabeza = '';
    titulo.dataset.plTitulo = '';
    titulo.setAttribute('role', 'button');
    titulo.setAttribute('tabindex', '0');
    titulo.setAttribute('aria-expanded', 'false');
    titulo.addEventListener('click', () => alternar(seccion));
    titulo.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      alternar(seccion);
    });
    seccion.dataset.pl = '1';
  }

  // Un enlace interno (#ancla) hacia algo plegado lo abre antes de desplazarse.
  function abrirAncla() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const destino = document.getElementById(id);
    const seccion = destino?.closest('[data-pl="1"]');
    if (seccion) { alternar(seccion, true); destino.scrollIntoView({ block: 'start' }); }
  }

  // Herramientas de finanzas: las tarjetas de resultado vacías no se muestran hasta que hay datos.
  function sinDatos() {
    if (!HERRAMIENTA_FINANZAS.test(location.pathname)) return;
    const seccion = document.querySelector('.finance-tool-section');
    const formulario = seccion?.querySelector('.finance-form-card');
    if (!seccion || !formulario) return;
    const campos = [...formulario.querySelectorAll('input:not([type="checkbox"]):not([type="radio"])')];
    const vacio = campos.length > 0 && campos.every((c) => !(Number(String(c.value).replace(/[$,\s]/g, '')) > 0));
    if (vacio) seccion.dataset.sinDatos = ''; else delete seccion.dataset.sinDatos;
  }

  let pendiente = false;
  function revisar() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => {
      pendiente = false;
      const lista = selectores();
      if (lista.length) document.querySelectorAll(lista.join(',')).forEach(preparar);
      sinDatos();
    });
  }

  new MutationObserver(revisar).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  document.addEventListener('input', revisar, true);
  window.addEventListener('hashchange', abrirAncla);
  window.addEventListener('load', () => { revisar(); setTimeout(abrirAncla, 300); });
  revisar();
})();
