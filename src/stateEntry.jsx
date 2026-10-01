import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import datos from './data/estados.json';

function Picker() {
  const [slug, setSlug] = useState('');
  const abrir = () => { if (slug) window.location.href = `/estados/${slug}`; };
  return <section className="state-entry-band" aria-label="Información por estado"><div><p className="eyebrow">Tu estado cambia el contexto</p><h2>Elige dónde vives o trabajas.</h2><p>Consulta el panorama profesional de cualquiera de las 32 entidades con cifras del mismo corte ENOE 2026-T2.</p></div><div className="state-entry-control"><select aria-label="Selecciona tu estado" value={slug} onChange={(e) => setSlug(e.target.value)}><option value="">Selecciona un estado</option>{datos.estados.map((e) => <option value={e.slug} key={e.slug}>{e.estado}</option>)}</select><button type="button" disabled={!slug} onClick={abrir}>Ver mi estado <span>→</span></button><a href="/estados">Ver los 32 estados</a></div></section>;
}

export default function StateEntry() {
  const [target, setTarget] = useState(null);
  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (path !== '/' && path !== '/carreras') return undefined;
    let intentos = 0;
    const buscar = () => {
      const nodo = path === '/' ? document.querySelector('.ml-money-map .shell') : document.querySelector('.career-hub-section .shell');
      if (nodo) setTarget(nodo);
      else if (++intentos < 30) window.setTimeout(buscar, 100);
    };
    buscar();
    return undefined;
  }, []);
  return target ? createPortal(<Picker />, target) : null;
}
