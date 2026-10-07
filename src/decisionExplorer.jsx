import { useId, useState } from 'react';
import { TEMAS_EXPLORADOR, obtenerTemaExplorador, resolverDecision } from './lib/decisionRoutes.js';
import { recordarRutaAcompanamiento } from './lib/journeyIntent.js';
import './decision-explorer.css';

// La respuesta sustituye la orientación de la guía, en vez de agregar otro bloque vertical.
export default function DecisionExplorer({ initialTopic = '' }) {
  const [temaId, setTemaId] = useState(initialTopic);
  const [opcionId, setOpcionId] = useState('');
  const id = useId();
  const tema = obtenerTemaExplorador(temaId);
  const decision = resolverDecision(temaId, opcionId);

  const cambiarTema = (nuevoTema) => {
    setTemaId(nuevoTema);
    setOpcionId('');
  };

  return (
    <section className="ml-decision ml-decision-connected" aria-labelledby={`${id}-titulo`}>
      <div className="shell ml-decision-shell">
        <div className="ml-decision-head">
          <div>
            <p className="ml-decision-kicker">MiLana te orienta</p>
            <h2 id={`${id}-titulo`}>¿Qué quieres resolver hoy?</h2>
            <p className="ml-decision-lede">Elige tu situación. Te mostramos por dónde empezar y qué revisar después.</p>
          </div>
        </div>

        <div className="ml-decision-flow">
          <div className="ml-decision-stage ml-decision-stage-topics">
            <div className="ml-decision-step"><span>01</span><h3>Elige un tema</h3></div>
            <div className="ml-decision-options ml-decision-topics" role="group" aria-label="Tema de tu decisión">
              {TEMAS_EXPLORADOR.map((item) => (
                <button
                  className={`ml-decision-choice${temaId === item.id ? ' is-selected' : ''}`}
                  key={item.id}
                  type="button"
                  aria-pressed={temaId === item.id}
                  onClick={() => cambiarTema(item.id)}
                >
                  <strong>{item.titulo}</strong>
                  <span>{item.bajada}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="ml-decision-stage ml-decision-stage-secondary">
            <div className="ml-decision-step"><span>02</span><h3>{tema ? '¿Qué necesitas saber?' : 'Elige un tema para empezar'}</h3></div>
            {tema ? (
              <div className="ml-decision-options ml-decision-needs" role="group" aria-label="Qué quieres resolver">
                {tema.opciones.map((opcion) => (
                  <button
                    className={`ml-decision-need${opcionId === opcion.id ? ' is-selected' : ''}`}
                    key={opcion.id}
                    type="button"
                    aria-pressed={opcionId === opcion.id}
                    onClick={() => setOpcionId(opcion.id)}
                  >
                    <span>{opcion.titulo}</span>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                  </button>
                ))}
              </div>
            ) : <p className="ml-decision-hint">Finanzas, trabajo, inversión o mudanza: empieza por lo que necesitas hoy.</p>}
          </div>

          <div className="ml-decision-answer" aria-live="polite" aria-atomic="true">
            {decision ? (
              <div className="ml-decision-result">
                <div className="ml-decision-result-title"><span>Tu siguiente paso</span><button type="button" onClick={() => { setTemaId(''); setOpcionId(''); }}>Empezar de nuevo</button></div>
                <p className="ml-decision-explain">{decision.opcion.explicacion}</p>
                <a className="ml-decision-primary" href={decision.opcion.principal.href} onClick={() => recordarRutaAcompanamiento(temaId, opcionId, decision.opcion.principal.href)}>
                  <span><small>Empieza aquí</small><strong>{decision.opcion.principal.titulo}</strong><em>{decision.opcion.principal.detalle}</em></span>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                </a>
                <div className="ml-decision-related">
                  <span>Otras herramientas útiles</span>
                  {decision.opcion.relacionadas.map((r) => <a href={r.href} key={r.href} onClick={() => recordarRutaAcompanamiento(temaId, opcionId, r.href)}>{r.titulo} <span aria-hidden="true">↗</span></a>)}
                </div>
                <p className="ml-decision-disclaimer">Orientación informativa. Consulta fuentes, fechas y supuestos antes de tomar decisiones.</p>
              </div>
            ) : (
              <div className="ml-decision-answer-placeholder">
                <span>Todo conectado</span>
                <strong>Una pregunta. Una herramienta útil.</strong>
                <p>Te ayudamos a empezar sin tener que conocer las secciones de la página.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
