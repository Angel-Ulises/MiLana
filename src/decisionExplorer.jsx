import { useId, useState } from 'react';
import { TEMAS_EXPLORADOR, obtenerTemaExplorador, resolverDecision } from './lib/decisionRoutes.js';
import './decision-explorer.css';

// Interfaz local y progresiva: no transmite ni conserva las decisiones del visitante.
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
    <section className="ml-decision" aria-labelledby={`${id}-titulo`}>
      <div className="shell ml-decision-shell">
        <div className="ml-decision-head">
          <div>
            <p className="ml-decision-kicker">Explora tu siguiente decisión</p>
            <h2 id={`${id}-titulo`}>Tu pregunta cambia el camino.</h2>
            <p className="ml-decision-lede">Dos elecciones bastan para encontrar herramientas de MiLana relacionadas con lo que quieres resolver. Sin registro, IA de pago ni datos personales.</p>
          </div>
          <span className="ml-decision-label">Guía interactiva · México</span>
        </div>

        <div className="ml-decision-flow">
          <div className="ml-decision-stage">
            <div className="ml-decision-step"><span>01</span><h3>¿Qué estás decidiendo?</h3></div>
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

          <div className="ml-decision-stage ml-decision-stage-secondary" aria-live="polite">
            <div className="ml-decision-step"><span>02</span><h3>{tema ? tema.pregunta : 'Afinemos tu pregunta'}</h3></div>
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
            ) : <p className="ml-decision-hint">Selecciona una de las situaciones del paso 1. Las preguntas aparecerán aquí.</p>}
          </div>

          <div className="ml-decision-result" aria-live="polite" aria-atomic="true">
            {decision ? (
              <>
                <div className="ml-decision-result-title"><span>Tu ruta para explorar</span><button type="button" onClick={() => { setTemaId(''); setOpcionId(''); }}>Empezar de nuevo</button></div>
                <p className="ml-decision-explain">{decision.opcion.explicacion}</p>
                <a className="ml-decision-primary" href={decision.opcion.principal.href}>
                  <span><small>Empieza aquí</small><strong>{decision.opcion.principal.titulo}</strong><em>{decision.opcion.principal.detalle}</em></span>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                </a>
                <div className="ml-decision-related">
                  <span>Después podrías explorar</span>
                  {decision.opcion.relacionadas.map((r) => <a href={r.href} key={r.href}>{r.titulo} <span aria-hidden="true">↗</span></a>)}
                </div>
              </>
            ) : (
              <div className="ml-decision-empty" aria-hidden="true">
                <span>Tu siguiente paso</span>
                <strong>{tema ? 'Elige una pregunta para descubrir tu ruta.' : 'Una mejor pregunta lleva a una mejor herramienta.'}</strong>
                <p>Conectamos información, comparadores y calculadoras que ya existen en MiLana.</p>
              </div>
            )}
            <p className="ml-decision-disclaimer">Recorrido educativo basado en reglas fijas. No evalúa tu perfil ni sustituye asesoría profesional. Revisa fechas, fuentes y supuestos de cada herramienta.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
