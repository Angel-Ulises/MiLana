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
  children,
}) {
  const ruta = `/calculadoras/${calculadora === 'bruto-neto' ? 'bruto-a-neto' : calculadora === 'pension' ? 'pension-imss' : calculadora}`;
  const textoCompartir = `Calculadora gratuita de MiLana: ${SITIO}${ruta}`;
  return (
    <section className="rc" aria-label="Tu resultado" data-resultado-claro>
      <div className="rc-etiqueta">{etiqueta}</div>
      <div className="rc-monto">{monto}</div>
      {linea && <div className="rc-linea">{linea}</div>}
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

export const fmtMx = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
export const fmtFecha = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} de ${['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][m - 1]} de ${y}`;
};
