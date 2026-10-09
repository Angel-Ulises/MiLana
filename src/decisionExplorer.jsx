import { useEffect, useId, useRef, useState } from 'react';
import { TEMAS_EXPLORADOR, obtenerTemaExplorador, resolverDecision } from './lib/decisionRoutes.js';
import { borrarRutaAcompanamiento, leerEleccionExplorador, recordarRutaAcompanamiento } from './lib/journeyIntent.js';
import ReadingDetails from './ReadingDetails.jsx';
import './decision-explorer.css';

// Una pregunta por pantalla. Los accesos directos del hub siguen fuera de este flujo.
export default function DecisionExplorer({ initialTopic = '' }) {
  const inicio = initialTopic === 'carrera' ? '/carreras' : '/finanzas';
  const restaurar = () => {
    const ruta = initialTopic ? leerEleccionExplorador(inicio) : null;
    return { temaId: ruta?.temaId || initialTopic, opcionId: ruta?.opcionId || '' };
  };
  const [eleccion, setEleccion] = useState(restaurar);
  const { temaId, opcionId } = eleccion;
  const id = useId();
  const titulo = useRef(null);
  const superficie = useRef(null);
  const enfocar = useRef(false);
  const tema = obtenerTemaExplorador(temaId);
  const decision = resolverDecision(temaId, opcionId);

  useEffect(() => {
    if (enfocar.current) { titulo.current?.focus({ preventScroll: true }); enfocar.current = false; }
  }, [temaId, opcionId]);
  useEffect(() => {
    const volver = () => setEleccion(restaurar());
    window.addEventListener('pageshow', volver);
    return () => window.removeEventListener('pageshow', volver);
  }, [initialTopic]);

  useEffect(() => {
    // El ancla puede llegar antes del módulo lazy. Resuélvela al montar, sin
    // sustituir la posición que el navegador restaura con Atrás/Adelante.
    if (window.location.hash !== '#explorar' || performance.getEntriesByType('navigation')[0]?.type === 'back_forward') return;
    const frame = requestAnimationFrame(() => {
      superficie.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
      titulo.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const cambiar = (nuevoTema, nuevaOpcion = '') => {
    borrarRutaAcompanamiento();
    enfocar.current = true;
    setEleccion({ temaId: nuevoTema, opcionId: nuevaOpcion });
  };
  const cambiarTema = nuevoTema => cambiar(nuevoTema);
  const recordar = destino => recordarRutaAcompanamiento(temaId, opcionId, destino, inicio);

  return (
    <section ref={superficie} className="ml-decision ml-decision-progressive" aria-labelledby={`${id}-titulo`}>
      <div className="shell ml-decision-shell">
        <div className="ml-decision-head">
          <p className="ml-decision-kicker">Empieza por tu pregunta</p>
          <h2 id={`${id}-titulo`}>¿Qué quieres resolver hoy?</h2>
        </div>
        <div className="ml-decision-panel">
          {decision ? (
            <div className="ml-decision-answer">
              <button className="ml-decision-back" type="button" onClick={() => cambiar(temaId)}>← Cambiar pregunta</button>
              <h3 ref={titulo} tabIndex={-1}>{decision.opcion.titulo}</h3>
              <a className="ml-decision-primary" href={decision.opcion.principal.href} onClick={() => recordar(decision.opcion.principal.href)}>
                <span>{decision.opcion.principal.titulo}</span><b aria-hidden="true">→</b>
              </a>
              <p className="ml-decision-detail">{decision.opcion.principal.detalle}</p>
              <ReadingDetails key={`${temaId}-${opcionId}`} className="ml-decision-explanation">
                <summary>¿Por qué empezar aquí?</summary>
                <p>{decision.opcion.explicacion}</p>
              </ReadingDetails>
              <details className="ml-decision-alternatives">
                <summary>Otras herramientas para esta pregunta</summary>
                <nav aria-label="Otras herramientas para esta pregunta">
                  {decision.opcion.relacionadas.map(r => <a href={r.href} key={r.href} onClick={() => recordar(r.href)}>{r.titulo} <span aria-hidden="true">→</span></a>)}
                </nav>
              </details>
              <p className="ml-decision-disclaimer">Orientación informativa. Revisa fuentes, fechas y supuestos antes de decidir.</p>
            </div>
          ) : tema ? (
            <div>
              <div className="ml-decision-topic-line"><span>{tema.titulo}</span><button className="ml-decision-back" type="button" onClick={() => cambiarTema('')}>Cambiar tema</button></div>
              <h3 ref={titulo} tabIndex={-1}>{tema.pregunta}</h3>
              <div className="ml-decision-options ml-decision-needs" role="group" aria-label="Qué quieres resolver">
                {tema.opciones.map(opcion => (
                  <button className="ml-decision-need" key={opcion.id} type="button" onClick={() => cambiar(temaId, opcion.id)}>
                    <span>{opcion.titulo}</span><b aria-hidden="true">→</b>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 ref={titulo} tabIndex={-1}>¿Qué tema tienes en mente?</h3>
              <div className="ml-decision-options ml-decision-topics" role="group" aria-label="Tema de tu decisión">
                {TEMAS_EXPLORADOR.map(item => (
                  <button className="ml-decision-choice" key={item.id} type="button" onClick={() => cambiarTema(item.id)}>
                    <strong>{item.titulo}</strong><span>{item.bajada}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Los complementos existentes siguen disponibles después de la tarea principal,
// no entre el encabezado y la primera pregunta/campo. El runtime los reemplaza.
export function ReadingExtrasAfterTask() {
  return <>
    <div className="orb-runtime-reserve orb-glossary-reserve" data-orbita-glossary-reserve="true" aria-hidden="true" />
    <div className="orb-runtime-reserve orb-visual-reserve" data-orbita-visual-reserve="true" aria-hidden="true" />
  </>;
}
