import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function InvestmentEntry() {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (!path.startsWith('/finanzas') || path.startsWith('/finanzas/inversion')) return undefined;
    let intentos = 0;
    let timer = null;
    const buscar = () => {
      const nodo = document.querySelector('.advisor-investment-gate') || document.querySelector('.finance-advisor-preview-inner');
      if (nodo) setTarget(nodo);
      else if (++intentos < 30) timer = window.setTimeout(buscar, 100);
    };
    buscar();
    return () => { if (timer) window.clearTimeout(timer); };
  }, []);

  if (!target) return null;
  return createPortal(
    <aside className="investment-entry">
      <span>Antes de invertir</span>
      <strong>Compara flujo, respaldo, deuda y horizonte antes que productos.</strong>
      <p>Sin score, sin recomendación automática y sin conexión con una casa de bolsa.</p>
      <a href="/finanzas/inversion">Abrir mapa previo a inversión →</a>
    </aside>,
    target,
  );
}
