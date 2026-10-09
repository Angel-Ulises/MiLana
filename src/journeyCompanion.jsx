import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { borrarRutaAcompanamiento, leerRutaAcompanamiento } from './lib/journeyIntent.js';

// Esta indicación aparece solo después de que la persona haya elegido una pregunta.
// Va junto a la navegación principal, sin tapar contenido ni volverse un chat flotante.
export default function JourneyCompanion() {
  const [host, setHost] = useState(null);
  const [ruta, setRuta] = useState(null);
  useEffect(() => {
    let el = null;
    let observer = null;
    // El encabezado llega desde un módulo React diferido. Esperarlo sin bloquear
    // el render principal y desconectar el observador al montar.
    const montar = () => {
      if (el) return true;
      const header = document.querySelector('.site-header');
      if (!header) return false;
      el = document.createElement('div');
      el.className = 'ml-journey-mount';
      header.insertAdjacentElement('afterend', el);
      observer?.disconnect();
      setHost(el);
      return true;
    };
    if (!montar()) {
      observer = new MutationObserver(montar);
      observer.observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
    }
    const actualizar = () => setRuta(leerRutaAcompanamiento(window.location.pathname));
    actualizar();
    window.addEventListener('popstate', actualizar);
    window.addEventListener('pageshow', actualizar);
    window.addEventListener('milana:route-change', actualizar);
    return () => {
      window.removeEventListener('popstate', actualizar);
      window.removeEventListener('pageshow', actualizar);
      window.removeEventListener('milana:route-change', actualizar);
      observer?.disconnect();
      el?.remove();
    };
  }, []);

  if (!host || !ruta) return null;
  return createPortal(
    <div className="ml-journey" role="region" aria-label="Tu recorrido en MiLana">
      <div className="ml-journey-inner">
        <div className="ml-journey-context">
          <span className="ml-journey-overline">Tu recorrido</span>
          <strong>{ruta.pregunta}</strong>
        </div>
        <div className="ml-journey-actions">
          <a className="ml-journey-back" href={`${ruta.volver}#explorar`}>Volver a mi pregunta</a>
          <button type="button" onClick={() => { borrarRutaAcompanamiento(); setRuta(null); }} aria-label="Cerrar este recorrido">×</button>
        </div>
      </div>
    </div>, host,
  );
}