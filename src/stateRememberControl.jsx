import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { borrarEstadoGuardado, guardarEstado, leerEstadoGuardado, obtenerEstado } from './lib/statePreference.js';

export default function StateRememberControl() {
  const [target, setTarget] = useState(null);
  const [seleccion, setSeleccion] = useState('');
  const [guardado, setGuardado] = useState(() => leerEstadoGuardado());

  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (!path.startsWith('/estados')) return undefined;
    const slugRuta = path.split('/').filter(Boolean)[1] || '';
    let intentos = 0;
    let select;
    const buscar = () => {
      const nodo = document.querySelector('.state-selector');
      select = nodo?.querySelector('select');
      if (nodo && select) {
        setTarget(nodo);
        setSeleccion(slugRuta || select.value || '');
        const cambio = () => setSeleccion(select.value || '');
        select.addEventListener('change', cambio);
        nodo.__milanaStateChange = cambio;
      } else if (++intentos < 30) window.setTimeout(buscar, 100);
    };
    buscar();
    return () => {
      if (select && target?.__milanaStateChange) select.removeEventListener('change', target.__milanaStateChange);
    };
  }, []);

  if (!target || !seleccion) return null;
  const info = obtenerEstado(seleccion);
  if (!info) return null;
  const activo = guardado === seleccion;

  const alternar = () => {
    if (activo) {
      borrarEstadoGuardado();
      setGuardado('');
    } else if (guardarEstado(seleccion)) {
      setGuardado(seleccion);
    }
  };

  return createPortal(
    <div className="state-remember-control">
      <button type="button" onClick={alternar} aria-pressed={activo}>
        {activo ? `${info.estado} está guardado en este dispositivo` : `Recordar ${info.estado} en este dispositivo`}
      </button>
      <small>No usa geolocalización ni envía tu elección a MiLana.</small>
    </div>,
    target,
  );
}
