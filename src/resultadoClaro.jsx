import { registrarEvento } from './lib/medicion.js';
import './resultado-claro.css';

const SITIO = 'https://www.milanaaqui.mx';

// Resultado común de todas las calculadoras (mejora 2026-11):
// la cifra grande primero, una línea de contexto, el detalle plegado,
// una sola sugerencia de siguiente paso y compartir por WhatsApp.
export default function ResultadoClaro({
  calculadora,
  etiqueta,
  monto,
  linea,
  secundarios = [],
  detalle,
  siguiente,
  compartir,
  actualizado,
  children,
}) {
  const ruta = `/calculadoras/${calculadora === 'bruto-neto' ? 'bruto-a-neto' : calculadora === 'pension' ? 'pension-imss' : calculadora}`;
  const textoCompartir = `${compartir} Calcula el tuyo gratis: ${SITIO}${ruta}`;
  return (
    <section className="rc" aria-label="Tu resultado" data-resultado-claro>
      <div className="rc-etiqueta">{etiqueta}</div>
      <div className="rc-monto">{monto}</div>
      {linea && <div className="rc-linea">{linea}</div>}
      {secundarios.length > 0 && (
        <dl className="rc-secundarios">
          {secundarios.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      )}
      {detalle && (
        <details className="rc-detalle">
          <summary>Ver cómo se calculó</summary>
          <div className="rc-detalle-cuerpo">{detalle}</div>
        </details>
      )}
      {children}
      {siguiente && (
        <a className="rc-siguiente" href={siguiente.href}
          onClick={() => registrarEvento('clic_siguiente_paso', { calculadora: calculadora.replace(/[^a-z0-9_-]/g, ''), destino: siguiente.href.split('/').filter(Boolean).pop() })}>
          <span className="rc-siguiente-kicker">Siguiente paso</span>
          <span className="rc-siguiente-texto">{siguiente.texto}</span>
          <span aria-hidden="true" className="rc-flecha">→</span>
        </a>
      )}
      <a className="rc-whatsapp" href={`https://wa.me/?text=${encodeURIComponent(textoCompartir)}`} target="_blank" rel="noopener noreferrer"
        onClick={() => registrarEvento('compartir_whatsapp', { calculadora })}>
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.8-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z"/></svg>
        Compartir por WhatsApp
      </a>
      {actualizado && <div className="rc-actualizado">Datos actualizados al {actualizado}. Es una estimación; tu recibo puede variar.</div>}
    </section>
  );
}

export const fmtMx = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
export const fmtFecha = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} de ${['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][m - 1]} de ${y}`;
};
