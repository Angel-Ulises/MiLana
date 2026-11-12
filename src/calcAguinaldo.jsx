import { useEffect, useId, useMemo, useState } from 'react';
import { calcularAguinaldoNeto, EXENCION_AGUINALDO_2026, AGUINALDO_ACTUALIZADO } from './lib/calculos-revisados.mjs';
import ResultadoClaro, { fmtMx, fmtFecha } from './resultadoClaro.jsx';
import { registrarResultado, olvidarResultado } from './lib/medicion.js';

// Aguinaldo 2026 (mejora 2026-11): caso más común por defecto —empresa privada, 15 días—.
// Solo pide sueldo mensual y, si entraste en 2026, la fecha de ingreso.
// Gobierno federal y SEP siguen disponibles con su calculadora detallada (`modoGobierno`).
export default function CalcAguinaldo({ modoGobierno: ModoGobierno }) {
  const [sueldo, setSueldo] = useState('');
  const [todoElAnio, setTodoElAnio] = useState(true);
  const [fecha, setFecha] = useState('');
  const [verDias, setVerDias] = useState(false);
  const [dias, setDias] = useState('15');
  const [gobierno, setGobierno] = useState(false);
  const ids = { sueldo: useId(), fecha: useId(), dias: useId(), error: useId() };

  const { r, error } = useMemo(() => {
    const limpio = String(sueldo).replace(/[$,\s]/g, '');
    if (!limpio) return { r: null, error: '' };
    if (!todoElAnio && !fecha) return { r: null, error: '' };
    try {
      return { r: calcularAguinaldoNeto({ sueldoMensual: limpio, fechaIngreso: todoElAnio ? '' : fecha, dias: dias || '15' }), error: '' };
    } catch (e) {
      return { r: null, error: e.message };
    }
  }, [sueldo, todoElAnio, fecha, dias]);

  useEffect(() => {
    if (r) registrarResultado('aguinaldo', todoElAnio ? 'anio_completo' : 'parte_del_anio');
    else olvidarResultado('aguinaldo');
  }, [r, todoElAnio]);

  if (gobierno && ModoGobierno) {
    return <div data-calc-directo>
      <p className="cc-mas"><button type="button" className="cc-enlace" onClick={() => setGobierno(false)}>← Volver al cálculo para empresa privada</button></p>
      <ModoGobierno />
    </div>;
  }

  return (
    <div data-calc-directo>
      <form className="cc-form" noValidate onSubmit={(e) => e.preventDefault()}>
        <div className="cc-campo">
          <label htmlFor={ids.sueldo}>Tu sueldo mensual, antes de descuentos</label>
          <div className="cc-dinero">
            <input id={ids.sueldo} name="sueldo" inputMode="decimal" autoComplete="off" placeholder="12,000"
              value={sueldo} onChange={(e) => setSueldo(e.target.value)} aria-describedby={error ? ids.error : undefined} aria-invalid={error ? true : undefined} />
          </div>
        </div>
        <fieldset className="cc-opciones">
          <legend className="cc-legend">¿Trabajaste todo 2026 en esa empresa?</legend>
          <label className="cc-opcion"><input type="radio" name="periodo" checked={todoElAnio} onChange={() => setTodoElAnio(true)} /><span>Sí, todo el año</span></label>
          <label className="cc-opcion"><input type="radio" name="periodo" checked={!todoElAnio} onChange={() => setTodoElAnio(false)} /><span>Entré en 2026</span></label>
        </fieldset>
        {!todoElAnio && (
          <div className="cc-campo">
            <label htmlFor={ids.fecha}>¿Qué día entraste?</label>
            <input id={ids.fecha} type="date" min="2026-01-01" max="2026-12-31" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
        )}
        {verDias && (
          <div className="cc-campo">
            <label htmlFor={ids.dias}>Días de aguinaldo que te da tu empresa</label>
            <input id={ids.dias} inputMode="decimal" value={dias} onChange={(e) => setDias(e.target.value)} />
            <p className="cc-ayuda">La ley pide al menos 15. Revisa tu contrato si te dan más.</p>
          </div>
        )}
        <p id={ids.error} className="cc-error" role="alert">{error}</p>
        <p className="cc-mas">
          {!verDias && <button type="button" className="cc-enlace" onClick={() => setVerDias(true)}>¿Te dan más de 15 días?</button>}
          {ModoGobierno && <button type="button" className="cc-enlace" onClick={() => setGobierno(true)}>¿Trabajas en gobierno o SEP?</button>}
        </p>
      </form>

      <div aria-live="polite">
        {r && (
          <ResultadoClaro
            calculadora="aguinaldo"
            etiqueta="Te llegan aproximadamente"
            monto={fmtMx(r.neto)}
            linea={r.isr > 0
              ? `Tu aguinaldo es de ${fmtMx(r.bruto)}. Tu empresa retiene unos ${fmtMx(r.isr)} de ISR.`
              : r.gravado === 0
                ? `Tu aguinaldo es de ${fmtMx(r.bruto)} y no paga ISR: no supera el límite exento de ${fmtMx(EXENCION_AGUINALDO_2026)}.`
                : `Tu aguinaldo es de ${fmtMx(r.bruto)}. La retención estimada es cero con este método y subsidio; la parte gravada es ${fmtMx(r.gravado)}.`}
            secundarios={[
              ['Aguinaldo (bruto)', fmtMx(r.bruto)],
              ['ISR estimado', r.isr > 0 ? `− ${fmtMx(r.isr)}` : fmtMx(0)],
              ['Te llega (neto)', fmtMx(r.neto)],
            ]}
            detalle={<ol>
              <li>Sueldo diario: {fmtMx(r.sueldo)} ÷ 30 = {fmtMx(r.salarioDiario)}.</li>
              <li>Aguinaldo: {fmtMx(r.salarioDiario)} × {r.diasPrestacion} días{r.diasPeriodo < 365 ? ` × ${r.diasPeriodo} de 365 días trabajados en 2026` : ''} = <strong>{fmtMx(r.bruto)}</strong>.</li>
              <li>Parte sin impuesto (30 UMA = 30 × $117.31): {fmtMx(r.exento)}.</li>
              <li>Parte gravada: {fmtMx(r.gravado)}.</li>
              {r.gravado > 0 && <li>ISR: se suma esa parte a tu sueldo del mes y se calcula la diferencia con la tabla mensual del SAT 2026
                ({fmtMx(r.isrSueldoMasAguinaldo.retenido)} − {fmtMx(r.isrSueldo.retenido)}) = <strong>{fmtMx(r.isr)}</strong>.</li>}
              <li>Te llega: {fmtMx(r.bruto)} − {fmtMx(r.isr)} = <strong>{fmtMx(r.neto)}</strong>.</li>
            </ol>}
            siguiente={{ texto: 'Decide cuánto apartar para tu fondo de emergencia', href: '/finanzas/fondo-emergencia' }}
            compartir={`Mi aguinaldo 2026 sale en ${fmtMx(r.bruto)} y me llegan unos ${fmtMx(r.neto)} después de ISR.`}
            actualizado={fmtFecha(AGUINALDO_ACTUALIZADO)}
          />
        )}
        {!r && !error && <p className="cc-ayuda" style={{ marginTop: 12 }}>Escribe tu sueldo y verás al instante cuánto te toca y cuánto te llega. Se paga a más tardar el 19 de diciembre.</p>}
      </div>
    </div>
  );
}
