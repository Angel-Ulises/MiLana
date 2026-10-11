import { useEffect } from 'react';

function ajustarEnlace(selector, texto) {
  const enlace = document.querySelector(selector);
  if (!enlace) return false;
  enlace.href = '/finanzas/mi-situacion';
  enlace.innerHTML = `${texto} <span aria-hidden="true">→</span>`;
  return true;
}

function agregarContextoProfesion(pathname) {
  const match = pathname.match(/^\/carreras\/profesion\/([^/]+)$/);
  if (!match) return false;
  const acciones = document.querySelector('.profession-actions');
  if (!acciones) return false;
  if (acciones.querySelector('[data-advisor-context]')) return true;

  const enlace = document.createElement('a');
  enlace.className = 'btn btn-secondary advisor-context-link';
  enlace.href = `/finanzas/mi-situacion?contexto=${encodeURIComponent(match[1])}`;
  enlace.dataset.advisorContext = 'profesion';
  enlace.textContent = 'Analizar este contexto en Mi situación';
  acciones.appendChild(enlace);
  return true;
}

export default function AdvisorEntry() {
  useEffect(() => {
    const pathname = window.location.pathname.replace(/\/$/, '') || '/';
    let intentos = 0;
    const aplicar = () => {
      let listo = false;
      if (pathname === '/finanzas') listo = ajustarEnlace('.finance-advisor-preview a', 'Analizar mi situación');
      else if (pathname.startsWith('/carreras/profesion/')) listo = agregarContextoProfesion(pathname);
      else listo = true;
      intentos += 1;
      if (!listo && intentos < 20) window.setTimeout(aplicar, 100);
    };
    aplicar();
  }, []);

  return null;
}
