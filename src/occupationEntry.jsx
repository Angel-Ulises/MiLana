import { Fragment, useEffect, useState } from 'react';
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
    <Fragment>
      <a className="career-route career-route-occupation" href="/carreras/ocupaciones">
        <span>05</span>
        <div>
          <h3>¿Lo que estudias es lo mismo que el trabajo que haces?</h3>
          <p>Compara carrera estudiada y ocupación real sin mezclar sus salarios, poblaciones ni periodos.</p>
        </div>
        <b>↗</b>
      </a>
      <a className="career-route career-route-compare" href="/carreras/comparar">
        <span>06</span>
        <div>
          <h3>Quiero comparar dos carreras</h3>
          <p>Pon dos perfiles lado a lado con el mismo corte y distingue ingreso promedio de tamaño del mercado.</p>
        </div>
        <b>↗</b>
      </a>
    </Fragment>,
    target,
  );
}
