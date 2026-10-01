import { useEffect } from 'react';

function ajustarEnlace(selector, texto) {
  const enlace = document.querySelector(selector);
  if (!enlace) return false;
  enlace.href = '/finanzas/mi-situacion';
  enlace.innerHTML = `${texto} <span aria-hidden="true">→</span>`;
  return true;
}

export default function AdvisorEntry() {
  useEffect(() => {
    const pathname = window.location.pathname.replace(/\/$/, '') || '/';
    let intentos = 0;
    const aplicar = () => {
      let listo = false;
      if (pathname === '/') listo = ajustarEnlace('.ml-advisor-strip a', 'Cuéntame mi situación');
      if (pathname === '/finanzas') listo = ajustarEnlace('.finance-advisor-preview a', 'Analizar mi situación');
      intentos += 1;
      if (!listo && intentos < 20) window.setTimeout(aplicar, 100);
    };
    aplicar();
  }, []);

  return null;
}
