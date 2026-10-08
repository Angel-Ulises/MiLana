import { createContext, useContext } from 'react';
import contenido from './data/contenido-calculadoras.json';
import catalogo from './data/paginas.json';
import { rutasDespuesDelResultado } from './lib/calculatorResultRoutes.js';

export const CalculatorResultContext = createContext(null);

const SEGURAS = new Set(['finiquito','liquidacion','aguinaldo','isr','resico','ptu','bruto-neto','vacaciones','infonavit']);

export function ResultNextSteps() {
  const id = useContext(CalculatorResultContext);
  if (!SEGURAS.has(id) || !contenido[id]?.interpretacion) return null;
  const proximos = rutasDespuesDelResultado(id, contenido, catalogo);
  return (
    <section className="ml-result-journey" aria-label="Qué hacer después de calcular">
      <div className="ml-result-journey-heading">
        <span>Ya tienes una estimación</span>
        <h3>¿Qué hago con este resultado?</h3>
      </div>
      <a className="ml-result-interpret" href="#ml-calc-interpretation">
        Entender qué significa y qué no incluye <span aria-hidden="true">↓</span>
      </a>
      {proximos.length > 0 && (
        <div className="ml-result-next-links">
          <span>También puedes revisar</span>
          {proximos.map((ruta) => (
            <a key={ruta.href} href={ruta.href}>{ruta.titulo}<span aria-hidden="true">↗</span></a>
          ))}
        </div>
      )}
      <p>Son estimaciones informativas. Antes de decidir, revisa los supuestos y fuentes de esta página.</p>
    </section>
  );
}
