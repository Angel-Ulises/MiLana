import { useState } from 'react';
import { prepararContextoFinanciero } from './lib/financeContextHandoff.js';

// «Llévalo a…»: después de calcular, la persona elige a qué herramienta llevar la cifra.
// Usa el canal autorizado de Finanzas (un solo uso, 15 min, sin URL). Nada viaja sin tocar un botón.
export default function ResultTransfer({ origen, importe, titulo, texto, destinos }) {
  const [error, setError] = useState('');
  const valor = typeof importe === 'number' && Number.isFinite(importe) && importe > 0 ? importe.toFixed(2) : null;
  if (!valor) return null;
  const ir = (href) => {
    const destino = destinos.find((d) => d.href === href);
    if (!destino || !prepararContextoFinanciero(origen, href, { [destino.campo]: valor })) {
      setError('Tu navegador no permitió llevar el dato. Abre la herramienta y escríbelo tú.');
      return;
    }
    window.location.assign(href);
  };
  return (
    <section className="ml-result-transfer" aria-label={titulo}>
      <span className="ml-result-transfer-kicker">Siguiente paso</span>
      <strong>{titulo}</strong>
      <p>{texto}</p>
      <div className="ml-result-transfer-actions">
        {destinos.map((d) => (
          <button key={d.href} type="button" onClick={() => ir(d.href)}>{d.titulo}<span aria-hidden="true">→</span></button>
        ))}
      </div>
      <small>Solo se lleva esta cifra, si eliges una opción. Podrás corregirla al llegar.</small>
      {error && <p role="alert" className="ml-result-transfer-error">{error}</p>}
    </section>
  );
}
