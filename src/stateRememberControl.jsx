import { useState } from 'react';
import datos from './data/estados.json';
import { borrarEstadoGuardado, guardarEstado, leerEstadoGuardado } from './lib/statePreference.js';

// Botón "Recordar <estado> en este dispositivo". Se dibuja dentro del selector de estado (statePages.jsx), en el
// mismo render que la ficha. Antes se montaba en un árbol React aparte que buscaba `.state-selector` con reintentos
// y lo insertaba por portal ~100-300 ms después: empujaba el contenido de abajo ~97 px (CLS intermitente en móvil).
export default function RecordarEstado({ slug = '' }) {
  const [guardado, setGuardado] = useState(() => leerEstadoGuardado());
  const info = slug ? datos.estados.find((e) => e.slug === slug) : null;
  if (!info) return null;
  const activo = guardado === slug;

  const alternar = () => {
    if (activo) {
      borrarEstadoGuardado();
      setGuardado('');
    } else if (guardarEstado(slug)) {
      setGuardado(slug);
    }
  };

  return (
    <div className="state-remember-control">
      <button type="button" onClick={alternar} aria-pressed={activo}>
        {activo ? `${info.estado} está guardado en este dispositivo` : `Recordar ${info.estado} en este dispositivo`}
      </button>
      <small>No usa geolocalización ni envía tu elección a MiLana.</small>
    </div>
  );
}
