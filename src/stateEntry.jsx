import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import datos from './data/estados.json';
import { borrarEstadoGuardado, guardarEstado, leerEstadoGuardado } from './lib/statePreference.js';

function Picker() {
  const guardadoInicial = leerEstadoGuardado();
  const [slug, setSlug] = useState(guardadoInicial);
  const [recordar, setRecordar] = useState(Boolean(guardadoInicial));

  const abrir = () => {
    if (!slug) return;
    if (recordar) guardarEstado(slug);
    else if (guardadoInicial) borrarEstadoGuardado();
    window.location.href = `/estados/${slug}`;
  };

  const estadoGuardado = datos.estados.find((e) => e.slug === guardadoInicial);

  return <section className="state-entry-band" aria-label="Información por estado"><div><p className="eyebrow">Tu estado cambia el contexto</p><h2>Elige dónde vives o trabajas.</h2><p>Consulta el panorama profesional y laboral de cualquiera de las 32 entidades con cifras oficiales comparables. MiLana no detecta tu ubicación automáticamente.</p>{estadoGuardado && <p className="state-entry-saved">Contexto guardado en este dispositivo: <a href={`/estados/${estadoGuardado.slug}`}>{estadoGuardado.estado}</a>.</p>}</div><div className="state-entry-control"><select aria-label="Selecciona tu estado" value={slug} onChange={(e) => setSlug(e.target.value)}><option value="">Selecciona un estado</option>{datos.estados.map((e) => <option value={e.slug} key={e.slug}>{e.estado}</option>)}</select><button type="button" disabled={!slug} onClick={abrir}>Ver mi estado <span>→</span></button><label className="state-entry-remember"><input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} /><span>Recordar este estado solo en este dispositivo</span></label><a href="/estados">Ver los 32 estados</a></div></section>;
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
