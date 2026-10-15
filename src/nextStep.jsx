import { siguientePaso } from './lib/nextSteps.js';

// Cierre común de cada herramienta: una acción principal clara y, como mucho, dos alternativas.
export default function NextStep({ ruta, compacto = false }) {
  const actual = ruta || (typeof window === 'undefined' ? '/' : window.location.pathname);
  const paso = siguientePaso(actual);
  if (!paso) return null;
  const titulo = `ml-next-step-${actual.replace(/[^a-z0-9]+/gi, '-')}`;
  const cuerpo = <>
    <span className="ml-next-step-kicker">Tu siguiente paso</span>
    <h2 id={titulo}>{paso.titulo}</h2>
    <p>{paso.texto}</p>
    <div className="ml-next-step-actions">
      <a className="ml-next-step-primary" href={paso.principal.href}>{paso.principal.texto}<span aria-hidden="true">→</span></a>
      {paso.otras?.map((o) => <a key={o.href} className="ml-next-step-secondary" href={o.href}>{o.texto}</a>)}
    </div>
  </>;
  if (compacto) return <div className="ml-next-step ml-next-step-compact" role="group" aria-labelledby={titulo}>{cuerpo}</div>;
  return <aside className="ml-next-step-band" aria-labelledby={titulo}><div className="shell"><div className="ml-next-step">{cuerpo}</div></div></aside>;
}
