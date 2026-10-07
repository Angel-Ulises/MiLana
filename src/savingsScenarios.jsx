import { useMemo, useState } from 'react';
import { crearEscenariosAhorro } from './lib/savingsScenarios.js';
import './savings-scenarios.css';

const dinero = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
const meses = (n) => `${n} ${n === 1 ? 'mes' : 'meses'}`;

// Presentación separada: NO cambia las fórmulas de las calculadoras existentes.
export default function SavingsScenarios({ meta, actual, mensual }) {
  const [porcentaje, setPorcentaje] = useState(120);
  const datos = useMemo(() => crearEscenariosAhorro({ meta, actual, mensual, porcentaje }), [meta, actual, mensual, porcentaje]);

  return (
    <section className="ml-scenarios" aria-labelledby="ml-scenarios-title">
      <div className="ml-scenarios-heading">
        <span className="ml-scenarios-eyebrow">Comparador interactivo</span>
        <h3 id="ml-scenarios-title">¿Qué cambia si ajustas tu ahorro mensual?</h3>
        <p>Compara dos ritmos durante 6, 12 y 24 meses. Moviendo un control, sin asumir intereses ni rendimientos.</p>
      </div>
      {!datos ? (
        <div className="ml-scenarios-empty" role="status">
          Captura una meta mayor que cero, tu ahorro actual y una aportación mensual mayor que cero. El comparador no supone cantidades cuando faltan datos.
        </div>
      ) : (
        <>
          <div className="ml-scenarios-control">
            <div className="ml-scenarios-control-head">
              <label htmlFor="ml-scenarios-range">Aportación alternativa</label>
              <strong>{porcentaje}% de tu aportación</strong>
            </div>
            <input id="ml-scenarios-range" type="range" min="50" max="200" step="10" value={porcentaje} onChange={e => setPorcentaje(Number(e.target.value))} />
            <div className="ml-scenarios-boundaries" aria-hidden="true"><span>50%</span><span>100%</span><span>200%</span></div>
          </div>
          <div className="ml-scenarios-legend">
            <span><i className="ml-scenarios-dot base" aria-hidden="true" /> Actual: {dinero(datos.aporte)}/mes</span>
            <span><i className="ml-scenarios-dot alternative" aria-hidden="true" /> Alternativo: {dinero(datos.alternativo)}/mes</span>
          </div>
          <div className="ml-scenarios-chart" aria-label="Comparación del saldo total acumulado en tres plazos">
            {datos.horizontes.map(f => (
              <div className="ml-scenarios-chart-row" key={f.mes}>
                <div className="ml-scenarios-chart-title"><b>{f.mes} meses</b><span>{dinero(f.base)} vs. {dinero(f.alternativo)}</span></div>
                <div className="ml-scenarios-bar" role="img" aria-label={`En ${f.mes} meses: con aportación actual ${dinero(f.base)}, con la alternativa ${dinero(f.alternativo)}`}>
                  <span className="base" style={{ width: `${(f.base / datos.escala) * 100}%` }} />
                  <span className="alternative" style={{ width: `${(f.alternativo / datos.escala) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="ml-scenarios-summary" aria-live="polite">
            <div><span>Meta establecida</span><strong>{dinero(datos.objetivo)}</strong></div>
            <div><span>Tiempo con aporte actual</span><strong>{meses(datos.mesesBase)}</strong></div>
            <div><span>Tiempo alternativo</span><strong>{meses(datos.mesesAlternativo)}</strong></div>
          </div>
          <p className="ml-scenarios-warning">Proyección aritmética: ahorro inicial + aportaciones constantes. Ignora intereses, inflación, comisiones e imprevistos; no indica si la aportación es sostenible. Los importes pueden superar la meta para mostrar la comparación sin recortes.</p>
        </>
      )}
    </section>
  );
}
