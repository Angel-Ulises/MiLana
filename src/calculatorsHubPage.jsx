import { useEffect, useRef, useState } from 'react';
import SiteHeader from './siteHeader.jsx';
import AdReserve from './AdReserve.jsx';
import { CALCULADORAS_HUB, GRUPOS_HUB, SELECTOR_HUB } from './lib/calculatorsHub.js';

// Selector «¿Cuál uso?»: dos toques llevan a una sola calculadora con el motivo visible.
// No pide cifras ni guarda nada; solo orienta hacia herramientas existentes.
function Selector() {
  const [tema, setTema] = useState(null);
  const [opcion, setOpcion] = useState(null);
  const resultado = useRef(null);
  const actual = SELECTOR_HUB.find((t) => t.id === tema);
  const elegida = actual?.opciones[opcion];
  const calc = elegida && CALCULADORAS_HUB[elegida.calc];

  useEffect(() => { if (calc) resultado.current?.focus({ preventScroll: true }); }, [calc]);

  return (
    <section className="ml-hub-chooser" aria-labelledby="ml-hub-chooser-title">
      <div className="ml-hub-chooser-head">
        <span className="ml-hub-step">{calc ? 'Listo' : actual ? 'Paso 2 de 2' : 'Paso 1 de 2'}</span>
        <h2 id="ml-hub-chooser-title">{calc ? 'Esta es la tuya' : actual ? actual.sigue : '¿Qué está pasando?'}</h2>
      </div>
      {!actual && (
        <div className="ml-hub-options" role="group" aria-label="Elige tu situación">
          {SELECTOR_HUB.map((t) => (
            <button type="button" key={t.id} onClick={() => { setTema(t.id); setOpcion(null); }}>{t.pregunta}<b aria-hidden="true">›</b></button>
          ))}
        </div>
      )}
      {actual && !calc && (
        <div className="ml-hub-options" role="group" aria-label={actual.sigue}>
          {actual.opciones.map((o, i) => (
            <button type="button" key={o.texto} onClick={() => setOpcion(i)}>{o.texto}<b aria-hidden="true">›</b></button>
          ))}
        </div>
      )}
      {calc && (
        <div className="ml-hub-result" ref={resultado} tabIndex={-1} aria-live="polite">
          <span>Te sirve</span>
          <strong>{calc.nombre}</strong>
          <p>{elegida.porque}</p>
          <a className="ml-hub-go" href={calc.href}>Abrir calculadora <span aria-hidden="true">→</span></a>
          {elegida.aprende && <a className="ml-hub-learn" href={elegida.aprende}>Antes, entiende la diferencia</a>}
        </div>
      )}
      {actual && (
        <button type="button" className="ml-hub-back" onClick={() => (calc ? setOpcion(null) : setTema(null))}>
          ← {calc ? 'Cambiar respuesta' : 'Volver a empezar'}
        </button>
      )}
    </section>
  );
}

export default function CalculatorsHubPage() {
  return (
    <div className="ml-hub">
      <SiteHeader />
      <main>
        <section className="ml-hub-hero">
          <div className="shell">
            <nav className="ml-hub-breadcrumb" aria-label="Ruta"><a href="/">Inicio</a><span aria-hidden="true">/</span>Calculadoras</nav>
            <h1>Calculadoras de trabajo y sueldo</h1>
            <p>Gratis, sin registro y con la fuente de cada cifra. Si no sabes cuál necesitas, responde dos preguntas.</p>
          </div>
        </section>
        <div className="shell ml-hub-layout">
          <Selector />
          <div className="ml-hub-groups">
            {GRUPOS_HUB.map((g) => (
              <section key={g.id} className="ml-hub-group" aria-labelledby={`ml-hub-${g.id}`}>
                <h2 id={`ml-hub-${g.id}`}>{g.titulo}</h2>
                <ul>
                  {g.ids.map((id) => {
                    const c = CALCULADORAS_HUB[id];
                    return (
                      <li key={id}>
                        <a href={c.href}><strong>{c.nombre}</strong><span>{c.usala}</span><b aria-hidden="true">→</b></a>
                      </li>
                    );
                  })}
                </ul>
                <a className="ml-hub-group-learn" href={g.aprende.href}>{g.aprende.texto}</a>
              </section>
            ))}
          </div>
          <section className="ml-hub-next" aria-labelledby="ml-hub-next-title">
            <h2 id="ml-hub-next-title">¿Ya tienes tu resultado?</h2>
            <p>Llévalo a tu presupuesto para ver cuánto te queda cada mes y qué puedes ahorrar.</p>
            <a href="/finanzas/presupuesto">Ordenar mi dinero <span aria-hidden="true">→</span></a>
          </section>
        </div>
      </main>
      <AdReserve size="970x90" />
      <footer className="site-footer"><div className="shell footer-inner"><div><span className="brand-name">MiLana</span><p>Dinero claro para decidir mejor.</p><p>Los cálculos son estimaciones informativas. Para montos exactos consulta con un especialista fiscal o laboral.</p></div><p>MiLana © 2026 · Hecho en México</p></div></footer>
    </div>
  );
}
