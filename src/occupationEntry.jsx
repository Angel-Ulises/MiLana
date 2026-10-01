import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function OccupationEntry() {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    if ((window.location.pathname.replace(/\/$/, '') || '/') !== '/carreras') return undefined;
    let intentos = 0;
    const buscar = () => {
      const lista = document.querySelector('.career-route-list');
      if (lista) setTarget(lista);
      else if (++intentos < 20) window.setTimeout(buscar, 100);
    };
    buscar();
    return undefined;
  }, []);

  if (!target) return null;
  return createPortal(
    <a className="career-route career-route-occupation" href="/carreras/ocupaciones">
      <span>05</span>
      <div>
        <h3>¿Lo que estudias es lo mismo que el trabajo que haces?</h3>
        <p>Compara carrera estudiada y ocupación real sin mezclar sus salarios, poblaciones ni periodos.</p>
      </div>
      <b>↗</b>
    </a>,
    target,
  );
}
