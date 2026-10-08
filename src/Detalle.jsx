// Bloque plegable accesible (divulgación progresiva). Usa <details>/<summary> nativo: teclado y lector de
// pantalla funcionan sin JS extra y el contenido sigue en el DOM (SEO). Estilos en public/orbita-v3-detalle.css.
export default function Detalle({ titulo, resumen, children, className = '', abierto = false, nivel = 'span', cta = 'Ver detalle', id }) {
  const Titulo = nivel;
  return (
    <details id={id} className={`orb-more ${className}`.trim()} open={abierto || undefined}>
      <summary>
        <span className="orb-more-text">
          <Titulo className="orb-more-title">{titulo}</Titulo>
          {resumen ? <span className="orb-more-lead">{resumen}</span> : null}
        </span>
        <span className="orb-more-cta"><span className="orb-more-cta-label">{cta}</span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6" /></svg></span>
      </summary>
      <div className="orb-more-body">{children}</div>
    </details>
  );
}

// Primera oración de un texto largo, para que el resumen visible diga algo útil antes de abrir.
export function primeraOracion(texto = '', max = 150) {
  const limpio = String(texto).replace(/\s+/g, ' ').trim();
  const corte = limpio.search(/[.!?](\s|$)/);
  const frase = corte > 0 ? limpio.slice(0, corte + 1) : limpio;
  return frase.length > max ? `${frase.slice(0, max - 1).replace(/\s+\S*$/, '')}…` : frase;
}
