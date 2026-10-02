import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function InvestmentCompareEntry() {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (path !== '/finanzas/inversion') return undefined;
    let intentos = 0;
    let timer = null;
    const buscar = () => {
      const nodo = document.querySelector('.investment-next .shell > div:last-child');
      if (nodo) setTarget(nodo);
      else if (++intentos < 30) timer = window.setTimeout(buscar, 100);
    };
    buscar();
    return () => { if (timer) window.clearTimeout(timer); };
  }, []);

  if (!target) return null;
  return createPortal(
    <a href="/finanzas/inversion/comparar">Comparar tipos de instrumentos <span>→</span></a>,
    target,
  );
}
