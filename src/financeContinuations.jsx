import { useState } from 'react';
import { prepararContextoFinanciero, RUTAS_TRANSFERENCIA, ETIQUETAS_ORIGEN } from './lib/financeContextHandoff.js';

const NOMBRES = {
  '/finanzas/presupuesto': 'Presupuesto',
  '/finanzas/fondo-emergencia': 'Fondo de emergencia',
  '/finanzas/deuda-y-credito': 'Deuda y crédito',
  '/finanzas/ahorro': 'Ahorro',
  '/finanzas/mi-situacion': 'Mi situación',
};

export default function FinanceContinueActions({ origen, valores, destinos }) {
  const [error, setError] = useState('');
  const permitidos = RUTAS_TRANSFERENCIA[origen] || {};
  const opciones = (destinos || Object.keys(permitidos))
    .filter(destino => permitidos[destino])
    .filter(destino => permitidos[destino].some(key => {
      const value = valores?.[key];
      return (typeof value === 'string' || typeof value === 'number')
        && String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0;
    }));
  if (!opciones.length) return null;

  function continuar(destino) {
    if (!prepararContextoFinanciero(origen, destino, valores)) {
      setError('No se pudo transferir la información en esta pestaña. Puedes abrir la herramienta y capturar los datos manualmente.');
      return;
    }
    window.location.assign(destino);
  }

  return (
    <nav className="ml-finance-continuations" aria-label="Continuar usando los datos capturados">
      <span className="ml-finance-continuations-kicker">Sigue sin repetir datos</span>
      <div className="ml-finance-continuations-actions">
        {opciones.map(destino => (
          <button type="button" key={destino} onClick={() => continuar(destino)}>
            Continuar en {NOMBRES[destino]} <span aria-hidden="true">→</span>
          </button>
        ))}
      </div>
      <small>Solo los campos que ya capturaste. El traslado es voluntario, se elimina al recibirlo y nunca se incluye en enlaces ni se envía al servidor.</small>
      {error && <p role="alert">{error}</p>}
    </nav>
  );
}

export function FinanceContextNotice({ contexto, onClear }) {
  if (!contexto?.valores) return null;
  const count = Object.keys(contexto.valores).length;
  return (
    <aside className="ml-finance-context-notice" aria-label="Datos recibidos de otra herramienta">
      <div>
        <span>Datos traídos de {contexto.titulo || ETIQUETAS_ORIGEN[contexto.origen]}</span>
        <strong>{count === 1 ? 'Ya colocamos 1 dato que capturaste.' : `Ya colocamos ${count} datos que capturaste.`}</strong>
        <p>Puedes corregir cada cifra. Los campos que no completaste siguen vacíos; no hemos supuesto cantidades ni elegido un producto financiero.</p>
      </div>
      <button type="button" onClick={onClear}>Quitar datos traídos</button>
    </aside>
  );
}
