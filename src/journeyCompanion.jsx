import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { borrarRutaAcompanamiento, leerRutaAcompanamiento, recordarRutaAcompanamiento } from './lib/journeyIntent.js';

// Esta indicación aparece solo después de que la persona haya elegido una pregunta.
// Va junto a la navegación principal, sin tapar contenido ni volverse un chat flotante.
export default function JourneyCompanion() {
  const [host, setHost] = useState(null);
  const [ruta, setRuta] = useState(null);
  useEffect(() => {
    const header = document.querySelector('.site-header');
    if (!header) return undefined;
    const el = document.createElement('div');
    el.className = 'ml-journey-mount';
    header.insertAdjacentElement('afterend', el);
    setHost(el);
    const actualizar = () => setRuta(leerRutaAcompanamiento(window.location.pathname));
    actualizar();
    window.addEventListener('popstate', actualizar);
    window.addEventListener('milana:route-change', actualizar);
    return () => {
      window.removeEventListener('popstate', actualizar);
      window.removeEventListener('milana:route-change', actualizar);
      el.remove();
    };
  }, []);

  if (!host || !ruta) return null;
  return createPortal(
    <div className="ml-journey" role="region" aria-label="Tu recorrido en MiLana">
      <div className="ml-journey-inner">
        <div className="ml-journey-context">
          <span className="ml-journey-overline">Tu recorrido</span>
          <strong>{ruta.pregunta}</strong>
          <span className="ml-journey-separator" aria-hidden="true">·</span>
          <span>Ahora: {ruta.actual}</span>
        </div>
        <div className="ml-journey-actions">
          {ruta.siguiente && <a href={ruta.siguiente.href} onClick={() => recordarRutaAcompanamiento(ruta.temaId, ruta.opcionId, ruta.siguiente.href)}>Después: {ruta.siguiente.titulo} <span aria-hidden="true">→</span></a>}
          <a className="ml-journey-back" href={ruta.volver}>Cambiar tema</a>
          <button type="button" onClick={() => { borrarRutaAcompanamiento(); setRuta(null); }} aria-label="Cerrar este recorrido">×</button>
        </div>
      </div>
    </div>, host,
  );
}
