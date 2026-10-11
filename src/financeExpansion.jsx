import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Seis puertas de entrada. Cada una lleva a una sección que empieza con una pregunta sencilla;
// la portada no repite el contenido de esas secciones.
const TEMAS = [
  { id: 'calculadoras', titulo: 'Calculadoras', texto: 'Finiquito, aguinaldo, ISR y 7 más. Te ayudamos a elegir.', href: '/calculadoras', icon: 'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm1 4h8M8 11h2m3 0h3m-8 4h2m3 0h3' },
  { id: 'finanzas', titulo: 'Mi dinero', texto: 'Presupuesto, ahorro, deudas y vivienda, paso a paso.', href: '/finanzas', icon: 'M4 7h15v11H4zM4 9V6h12m3 5h-5v4h5' },
  { id: 'invertir', titulo: 'Invertir', texto: 'Qué es cada instrumento, sus riesgos y un simulador.', href: '/invertir', icon: 'M4 19h16M6 16l4-5 3 3 5-7m0 0h-4m4 0v4' },
  { id: 'carreras', titulo: 'Carreras', texto: 'Cuánto gana cada profesión y cuánto te quedaría.', href: '/carreras', icon: 'm3 9 9-5 9 5-9 5zm4 3v5c3 2 7 2 10 0v-5m4-3v6' },
  { id: 'estados', titulo: 'Estados', texto: 'Ingresos, empleo y vivienda en tus 32 opciones.', href: '/estados', icon: 'm4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2zM9 4v14m6-12v14' },
  { id: 'economia', titulo: 'Economía', texto: 'Inflación y tasas, explicadas por lo que cambian para ti.', href: '/economia', icon: 'M12 3a9 9 0 1 0 9 9M12 3v9h9M12 3a9 9 0 0 1 9 9' },
];

function asegurarDestino() {
  const home = document.querySelector('main .situations');
  if (!home) return null;
  let target = document.getElementById('ml-finance-expansion-root');
  if (!target) {
    target = document.createElement('div');
    target.id = 'ml-finance-expansion-root';
    home.insertAdjacentElement('afterend', target);
  }
  return target;
}

function FinanceContent() {
  return (
    <div className="ml-finance-layer">
      <section id="ml-temas" className="ml-topics" aria-labelledby="ml-topics-title">
        <div className="shell">
          <div className="ml-topics-head">
            <p className="eyebrow">Explora por tema</p>
            <h2 id="ml-topics-title">Todo MiLana, en seis puertas.</h2>
            <p>Cada tema empieza con una pregunta sencilla y te lleva a la herramienta correcta.</p>
          </div>
          <div className="ml-topics-grid">
            {TEMAS.map((t) => (
              <a key={t.id} className={`ml-topic ml-topic-${t.id}`} href={t.href}>
                <span className="ml-topic-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d={t.icon} /></svg></span>
                <strong>{t.titulo}</strong>
                <span className="ml-topic-text">{t.texto}</span>
                <b aria-hidden="true">→</b>
              </a>
            ))}
          </div>
          <div className="ml-start-strip">
            <div>
              <span className="ml-start-kicker">¿No sabes por dónde empezar?</span>
              <h3>Responde una pregunta y te mostramos el primer paso.</h3>
              <p>También puedes practicar con un ejemplo de presupuesto antes de usar tus números.</p>
            </div>
            <div className="ml-start-actions">
              <a href="/finanzas#explorar">Empezar aquí <span aria-hidden="true">→</span></a>
              <a className="ml-start-secondary" href="/finanzas/mi-situacion">Revisar mi situación completa</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function FinanceExpansion() {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    const sincronizar = () => {
      const next = asegurarDestino();
      setTarget((actual) => actual === next ? actual : next);
    };
    sincronizar();
    const root = document.getElementById('root');
    if (!root) return undefined;
    const observer = new MutationObserver(sincronizar);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  if (!target) return null;
  return createPortal(<FinanceContent />, target);
}
