import { useEffect, useState } from 'react';
import { registrarEvento } from './lib/medicion.js';
import './resultado-claro.css';

const SITIO = 'https://www.milanaaqui.mx';

// Resultado común de todas las calculadoras (mejora 2026-11):
// Página limpia (2026-11-14): solo la cifra grande, una línea y compartir. El desglose, los pasos y la
// fecha de los datos van plegados en «Ver cómo se calculó»; el siguiente paso es un enlace discreto.
export default function ResultadoClaro({
  calculadora,
  etiqueta,
  monto,
  linea,
  secundarios = [],
  detalle,
  siguiente,
  actualizado,
  reclamo,
  valoresDe,
  children,
}) {
  // «Escuchar»: lee el resultado en voz alta, en el propio teléfono (no se envía nada a ningún servidor).
  const [puedeHablar, setPuedeHablar] = useState(false);
  useEffect(() => { setPuedeHablar(typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function'); }, []);
  const escuchar = () => {
    try {
      const voz = new window.SpeechSynthesisUtterance(textoHablado(`${etiqueta}: ${monto}. ${linea || ''}`));
      voz.lang = 'es-MX';
      voz.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(voz);
      registrarEvento('escuchar_resultado', { calculadora: calculadora.replace(/[^a-z0-9_-]/g, '') });
    } catch { /* sin voz disponible */ }
  };
  const ruta = `/calculadoras/${calculadora === 'bruto-neto' ? 'bruto-a-neto' : calculadora === 'pension' ? 'pension-imss' : calculadora}`;
  const textoCompartir = `Calculadora gratuita de MiLana: ${SITIO}${ruta}`;
  return (
    <section className="rc" aria-label="Tu resultado" data-resultado-claro>
      <div className="rc-etiqueta">{etiqueta}</div>
      <div className="rc-monto">{monto}</div>
      {linea && <div className="rc-linea">{linea}</div>}
      {/* Aviso de año (R-15): si el cálculo usa tablas o valores de un año anterior al actual, se dice a la vista. */}
      {valoresDe && new Date().getFullYear() > valoresDe && (
        <p className="rc-aviso-anio">Calculado con los valores oficiales de {valoresDe}. Los de {new Date().getFullYear()} se agregan a MiLana en cuanto se publiquen.</p>
      )}
      {puedeHablar && <button type="button" className="rc-escuchar" onClick={escuchar}>
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>
        Escuchar
      </button>}
      <a className="rc-whatsapp" href={`https://wa.me/?text=${encodeURIComponent(textoCompartir)}`} target="_blank" rel="noopener noreferrer"
        title="Se comparte solo el enlace de la herramienta, sin tus cifras ni resultados."
        onClick={() => registrarEvento('compartir_whatsapp', { calculadora })}>
        Compartir por WhatsApp
      </a>
      {(detalle || secundarios.length > 0) && (
        <details className="rc-detalle">
          <summary>Ver cómo se calculó</summary>
          <div className="rc-detalle-cuerpo">
            {secundarios.length > 0 && (
              <dl className="rc-secundarios">
                {secundarios.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
              </dl>
            )}
            {detalle}
            {actualizado && <p className="rc-actualizado">Datos actualizados al {actualizado}. Es una estimación; tu recibo puede variar.</p>}
          </div>
        </details>
      )}
      {reclamo && (
        <details className="rc-detalle rc-reclamo">
          <summary>¿Y si no me lo pagan?</summary>
          <div className="rc-detalle-cuerpo">
            <p>La Procuraduría de la Defensa del Trabajo te asesora y te representa <strong>gratis</strong>. No necesitas pagar un abogado para empezar.</p>
            <p>{reclamo === 'despido'
              ? <>Si te despidieron, tienes <strong>2 meses</strong> para reclamar, contados desde el día siguiente al despido. Para los demás pagos tienes 1 año.</>
              : <>Tienes <strong>1 año</strong> para reclamar, contado desde el día en que te debieron pagar.</>}</p>
            <p><a href="https://www.gob.mx/profedet" target="_blank" rel="noopener noreferrer">Ir a PROFEDET (gob.mx) ↗</a></p>
            <p className="rc-actualizado">Ley Federal del Trabajo, artículos 516, 518, 530 y 534.</p>
          </div>
        </details>
      )}
      {children}
      {siguiente && (
        <a className="rc-siguiente" href={siguiente.href}
          onClick={() => registrarEvento('clic_siguiente_paso', { calculadora: calculadora.replace(/[^a-z0-9_-]/g, ''), destino: siguiente.href.split('/').filter(Boolean).pop() })}>
          <span className="rc-siguiente-texto">{siguiente.texto}</span>
          <span aria-hidden="true" className="rc-flecha">→</span>
        </a>
      )}
    </section>
  );
}

// «$5,633.71» → «5633 pesos con 71 centavos», para que la voz lo lea como lo diría una persona.
export function textoHablado(texto) {
  return String(texto).replace(/\$\s?([\d,]+)(?:\.(\d{2}))?/g, (_, entero, cent) => {
    const pesos = Number(entero.replace(/,/g, ''));
    return `${pesos} ${pesos === 1 ? 'peso' : 'pesos'}${cent && cent !== '00' ? ` con ${Number(cent)} centavos` : ''}`;
  }).replace(/ISR/g, 'I S R').replace(/\s+/g, ' ').trim();
}

export const fmtMx = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
export const fmtFecha = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} de ${['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][m - 1]} de ${y}`;
};
