import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import data from './data/stateOccupations.json';

const numero = (n) => new Intl.NumberFormat('es-MX').format(Number(n) || 0);
const dinero = (n) => new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN', maximumFractionDigits:0 }).format(Number(n) || 0);

function DetailOccupations({ state }) {
  return <section className="state-occupations"><div className="shell">
    <div className="state-occupations-head"><div><p className="eyebrow">Ocupaciones · Data México {data.period}</p><h2>¿En qué trabaja más gente en {state.state}?</h2></div><p>Ordenamos las ocupaciones por población ocupada observada en ENOE. Esto describe el tamaño de cada ocupación en el estado; <strong>no representa vacantes abiertas, demanda de contratación ni una recomendación profesional</strong>.</p></div>

    <div className="state-occupations-grid">{state.occupations.map((item, index) => <article key={item.occupationId}>
      <div className="state-occupation-rank"><span>{String(index + 1).padStart(2,'0')}</span><small>por personas ocupadas</small></div>
      <h3>{item.occupation}</h3>
      <p className="state-occupation-category">{item.category}</p>
      <dl>
        <div><dt>Población ocupada estimada</dt><dd>{numero(item.workforce)}</dd></div>
        <div><dt>Ingreso mensual estimado de la ocupación</dt><dd>{dinero(item.monthlyWage)}</dd></div>
        <div><dt>Registros ENOE usados</dt><dd>{numero(item.records)}</dd></div>
      </dl>
    </article>)}</div>

    <div className="state-occupations-guardrails"><article><span>Lo que sí muestra</span><strong>Ocupaciones con mayor población observada</strong><p>El orden usa únicamente la estimación de personas ocupadas de Data México/ENOE para {data.period}.</p></article><article><span>Lo que no muestra</span><strong>Vacantes o probabilidad de contratación</strong><p>Una ocupación grande puede no ser la que más está contratando hoy. MiLana no convierte ocupados en “demanda”.</p></article><article><span>No confundimos</span><strong>Ocupación con carrera estudiada</strong><p>El ingreso de esta sección corresponde a una ocupación observada; no sustituye el ingreso profesional de OLA ni un salario inicial.</p></article></div>

    <aside className="state-occupations-source"><span>Fuente ocupacional</span><div><strong>{data.source.name}</strong><p>{data.source.dataset} · {data.period}. {data.source.note}</p><p>El número de registros se muestra para conservar contexto sobre la base observada detrás de cada estimación; MiLana no lo convierte en una etiqueta automática de “buena” o “mala” precisión.</p><a href={data.source.url} target="_blank" rel="noreferrer">Abrir consulta oficial ↗</a></div></aside>
  </div></section>;
}

export default function StateOccupations() {
  const [target, setTarget] = useState(null);
  const [slug, setSlug] = useState('');

  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (!/^\/estados\/[^/]+$/.test(path) || path === '/estados/comparar') return undefined;
    const actual = path.split('/').filter(Boolean)[1] || '';
    setSlug(actual);
    let intentos = 0;
    let timer = null;
    let mount = null;

    const buscar = () => {
      const referencia = document.querySelector('.state-labor');
      if (referencia) {
        mount = document.createElement('div');
        mount.className = 'state-occupations-mount';
        referencia.insertAdjacentElement('afterend', mount);
        setTarget(mount);
      } else if (++intentos < 40) {
        timer = window.setTimeout(buscar, 100);
      }
    };

    buscar();
    return () => {
      if (timer) window.clearTimeout(timer);
      if (mount?.parentNode) mount.parentNode.removeChild(mount);
    };
  }, []);

  if (!target || !slug) return null;
  const state = data.states.find((item) => item.slug === slug);
  return state ? createPortal(<DetailOccupations state={state} />, target) : null;
}
