import { useEffect, useId, useMemo, useState } from 'react';
import { calcularAguinaldoNeto, EXENCION_AGUINALDO_2026, AGUINALDO_ACTUALIZADO } from './lib/calculos-revisados.mjs';
import ResultadoClaro, { fmtMx, fmtFecha } from './resultadoClaro.jsx';
import { registrarResultado, olvidarResultado } from './lib/medicion.js';
import { CampoSueldo, useSueldo, conMiles } from './calcComun.jsx';
import { compararDeposito } from './lib/calculos-directos.mjs';
import { registrarEvento } from './lib/medicion.js';

// Aguinaldo 2026 (mejora 2026-11): caso más común por defecto —empresa privada, 15 días—.
// Solo pide sueldo mensual y, si entraste en 2026, la fecha de ingreso.
// Gobierno federal y SEP siguen disponibles con su calculadora detallada (`modoGobierno`).
export default function CalcAguinaldo({ modoGobierno: ModoGobierno }) {
  const sueldo = useSueldo();
  const [todoElAnio, setTodoElAnio] = useState(true);
  const [fecha, setFecha] = useState('');
  const [verDias, setVerDias] = useState(false);
  const [dias, setDias] = useState('15');
  const [gobierno, setGobierno] = useState(false);
  const ids = { fecha: useId(), dias: useId(), error: useId() };

  const { r, error } = useMemo(() => {
    const limpio = sueldo.mensual;
    if (!limpio) return { r: null, error: '' };
    if (!todoElAnio && !fecha) return { r: null, error: '' };
    try {
      return { r: calcularAguinaldoNeto({ sueldoMensual: limpio, fechaIngreso: todoElAnio ? '' : fecha, dias: dias || '15' }), error: '' };
    } catch (e) {
      return { r: null, error: e.message };
    }
  }, [sueldo.mensual, todoElAnio, fecha, dias]);

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
        <CampoSueldo sueldo={sueldo} placeholder="12,000" />
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
            reclamo="general"
            actualizado={fmtFecha(AGUINALDO_ACTUALIZADO)}
          >
            <MePagaronBien neto={r.neto} bruto={r.bruto} />
          </ResultadoClaro>
        )}
      </div>
    </div>
  );
}

// «¿Me pagaron bien?»: la persona escribe lo que le depositaron y ve si cuadra con la estimación.
// La cifra se queda en el navegador; el evento de medición no lleva importes ni el veredicto.
function MePagaronBien({ neto, bruto }) {
  const [deposito, setDeposito] = useState('');
  const id = useId();
  const c = compararDeposito({ neto, bruto, deposito });
  useEffect(() => { if (c) registrarEvento('comparar_deposito', { calculadora: 'aguinaldo' }); }, [Boolean(c)]);
  return (
    <details className="rc-detalle rc-pagaron">
      <summary>¿Ya te lo depositaron? Revisa si te pagaron bien</summary>
      <div className="rc-detalle-cuerpo">
        <div className="cc-campo">
          <label htmlFor={id}>¿Cuánto te depositaron de aguinaldo?</label>
          <div className="cc-dinero"><input id={id} name="deposito" inputMode="decimal" autoComplete="off" value={deposito}
            onChange={(e) => setDeposito(e.target.value)} onBlur={(e) => { const f = conMiles(e.target.value); if (f !== e.target.value) setDeposito(f); }} /></div>
        </div>
        <div aria-live="polite">
          <VeredictoDeposito c={c} />
        </div>
      </div>
    </details>
  );
}

// Texto del veredicto: dice la diferencia y la tolerancia tal como las calcula compararDeposito,
// y presenta las causas como posibilidades, no como hechos.
export function VeredictoDeposito({ c }) {
  if (!c) return null;
  return (<>
    {c.veredicto === 'exacto' && <p className="rc-veredicto rc-veredicto-bien"><strong>Coincide con el cálculo.</strong> Lo que te depositaron es igual a lo estimado, sin diferencia.</p>}
    {c.veredicto === 'tolerancia' && <>
      <p className="rc-veredicto rc-veredicto-bien"><strong>Casi igual: te llegaron {fmtMx(Math.abs(c.diferencia))} {c.diferencia < 0 ? 'menos' : 'más'}</strong> de lo estimado. La diferencia está dentro de la tolerancia de {fmtMx(c.margen)} que usa esta revisión.</p>
      <p>La tolerancia es lo mayor entre $50 y 1% de tu aguinaldo antes de impuestos. Una diferencia así puede venir del redondeo o de la forma en que tu empresa retuvo el impuesto, pero aquí no podemos saber la causa: tu recibo es el que la dice.</p>
    </>}
    {c.veredicto === 'mas' && <>
      <p className="rc-veredicto rc-veredicto-bien"><strong>Te llegaron {fmtMx(c.diferencia)} más</strong> de lo estimado. Eso rebasa la tolerancia de {fmtMx(c.margen)} que usa esta revisión.</p>
      <p>Puede deberse, por ejemplo, a que tu empresa da más de 15 días o a que retuvo el impuesto con otro método permitido. Aquí no podemos saber la causa: tu recibo es el que la dice.{c.superaBruto ? ' Si te dan más días, toca «¿Te dan más de 15 días?» arriba para afinar el cálculo.' : ''}</p>
    </>}
    {c.veredicto === 'menos' && <>
      <p className="rc-veredicto rc-veredicto-ojo"><strong>Te llegaron {fmtMx(Math.abs(c.diferencia))} menos</strong> de lo estimado. Eso rebasa la tolerancia de {fmtMx(c.margen)} que usa esta revisión. No siempre es un error. Revisa en tu recibo:</p>
      <ul>
        <li>El sueldo que usaron: que sea el que ganas hoy.</li>
        <li>Los días: la ley pide al menos 15 por año completo, o la parte proporcional si entraste este año.</li>
        <li>Otros descuentos que aparezcan en el recibo, por ejemplo un préstamo o una pensión alimenticia.</li>
      </ul>
      <p>Si después de revisar no cuadra, pregunta en nómina. Si no te lo resuelven, abre «¿Y si no me lo pagan?».</p>
    </>}
  </>);
}
