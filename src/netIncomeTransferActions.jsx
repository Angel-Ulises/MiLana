import { useState } from 'react';
import { guardarIngresoTemporal, ingresoValido } from './lib/netIncomeHandoff.js';

const OPCIONES = [
  { href: '/finanzas/presupuesto', titulo: 'Usarlo en Presupuesto' },
  { href: '/finanzas/mi-situacion', titulo: 'Analizar mi situación' },
];

export default function NetIncomeTransferActions({ neto }) {
  const [error, setError] = useState('');
  const importe = ingresoValido(neto);
  if (importe === null) return null;

  const continuar = (href) => {
    if (!guardarIngresoTemporal(importe, href)) {
      setError('Tu navegador no permitió transferir el dato en esta pestaña. Puedes abrir la herramienta e introducirlo manualmente.');
      return;
    }
    window.location.assign(href);
  };

  return (
    <section className="ml-net-transfer" aria-label="Continuar con mi ingreso neto">
      <span className="ml-net-transfer-kicker">Continúa con este cálculo</span>
      <strong>¿Qué puedes hacer con tu ingreso neto estimado?</strong>
      <p>Úsalo para planear tu dinero sin volver a escribirlo. Solo se transfiere si eliges una opción; podrás corregirlo al llegar.</p>
      <div className="ml-net-transfer-actions">
        {OPCIONES.map((opcion) => (
          <button key={opcion.href} type="button" onClick={() => continuar(opcion.href)}>
            {opcion.titulo}<span aria-hidden="true">→</span>
          </button>
        ))}
      </div>
      <small>Es el neto calculado después de ISR y seguridad social. Puede diferir del depósito real por otros descuentos. Se conserva temporalmente solo en esta pestaña y se borra al utilizarlo.</small>
      {error && <p role="alert" className="ml-net-transfer-error">{error}</p>}
    </section>
  );
}
