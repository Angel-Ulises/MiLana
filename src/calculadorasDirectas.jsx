import { useMemo, useState } from 'react';
import { calcularISR } from './lib/calculos-revisados.mjs';
import { calcularFiniquito2026, calcularLiquidacion2026, calcularBrutoNeto2026, SALARIOS_MINIMOS_2026 } from './lib/calculos-laborales-2026.mjs';
import { calcularRESICO, calcularPTUTotal, calcularVacaciones, calcularCredito, revisarPension, sbcEstimado, FACTOR_INTEGRACION_MINIMO } from './lib/calculos-directos.mjs';
import ResultadoClaro, { fmtMx, fmtFecha } from './resultadoClaro.jsx';
import {
  CampoDinero, CampoNumero, CampoFecha, Opciones, Casilla, MasOpciones, Formulario, MensajeError,
  useEventoResultado, hoy2026, Contenedor, limpiarNumero, ACTUALIZADO_2026,
} from './calcComun.jsx';

const ACT = fmtFecha(ACTUALIZADO_2026);
const intentar = (fn) => { try { return { r: fn(), error: '' }; } catch (e) { return { r: null, error: e.message }; } };
const dias = (n) => `${Number(n.toFixed(2))} ${Math.abs(n - 1) < 1e-9 ? 'día' : 'días'}`;

function AvisoGobierno({ children, onVolver }) {
  return <div className="cc-panel" role="note">
    <p><strong>Si trabajas en gobierno o en la SEP</strong></p>
    <p>{children}</p>
    <p className="cc-mas"><button type="button" className="cc-enlace" onClick={onVolver}>← Volver al cálculo para empresa privada</button></p>
  </div>;
}

// ─── Finiquito ───────────────────────────────────────────────────────────────
export function CalcFiniquitoDirecta() {
  const [sueldo, setSueldo] = useState('');
  const [ingreso, setIngreso] = useState('');
  const [salida, setSalida] = useState(hoy2026);
  const [causa, setCausa] = useState('renuncia');
  const [pendientes, setPendientes] = useState('0');
  const [vacPend, setVacPend] = useState('0');
  const [diasAg, setDiasAg] = useState('15');
  const [prima, setPrima] = useState('25');
  const [vacAnuales, setVacAnuales] = useState('');
  const [frontera, setFrontera] = useState(false);
  const [gobierno, setGobierno] = useState(false);
  const { r, error } = useMemo(() => {
    if (!limpiarNumero(sueldo) || !ingreso || !salida) return { r: null, error: '' };
    return intentar(() => calcularFiniquito2026({
      salarioMensual: limpiarNumero(sueldo), fechaIngreso: ingreso, fechaSalida: salida,
      diasTrabajadosNoPagados: pendientes || '0', vacacionesPendientes: vacPend || '0', causa,
      zona: frontera ? 'frontera' : 'general', diasAguinaldo: diasAg || '15', primaVacacionalPct: prima || '25', diasVacacionesAnuales: vacAnuales,
    }));
  }, [sueldo, ingreso, salida, causa, pendientes, vacPend, diasAg, prima, vacAnuales, frontera]);
  useEventoResultado('finiquito', Boolean(r), causa === 'renuncia' ? 'renuncia' : 'despido');
  if (gobierno) return <Contenedor><AvisoGobierno onVolver={() => setGobierno(false)}>
    Esta calculadora usa la Ley Federal del Trabajo. En una plaza de gobierno federal o de la SEP (Ley Federal de los Trabajadores al Servicio del Estado), la baja depende de tu nombramiento y de las reglas de tu dependencia, así que no te daremos una cifra que podría estar mal. Pide tu cálculo a Recursos Humanos de tu dependencia.
  </AvisoGobierno></Contenedor>;
  return <Contenedor>
    <Formulario>
      <CampoDinero name="sueldo" label="Tu sueldo mensual, antes de descuentos" placeholder="18,000" value={sueldo} onChange={setSueldo} />
      <CampoFecha name="ingreso" label="¿Qué día entraste a trabajar?" value={ingreso} onChange={setIngreso} max="2026-12-31" />
      <CampoFecha name="salida" label="Tu último día de trabajo" value={salida} onChange={setSalida} min="2026-01-01" max="2026-12-31" />
      <Opciones name="causa" legend="¿Cómo terminó?" value={causa} onChange={setCausa} opciones={[['renuncia', 'Renuncié'], ['separacion-patron', 'Me despidieron']]} />
      <MensajeError error={error} />
      <MasOpciones texto="¿Te deben días de sueldo o vacaciones? Más opciones">
        <CampoNumero label="Días trabajados que no te han pagado" value={pendientes} onChange={setPendientes} />
        <CampoNumero label="Vacaciones de años anteriores que no tomaste" sufijo="días" value={vacPend} onChange={setVacPend} ayuda="Las vacaciones de este año se calculan solas con tus fechas." />
        <CampoNumero label="Días de aguinaldo que te da tu empresa" value={diasAg} onChange={setDiasAg} ayuda="La ley pide al menos 15." />
        <CampoNumero label="Prima vacacional" sufijo="%" value={prima} onChange={setPrima} ayuda="La ley pide al menos 25%." />
        <CampoNumero label="Días de vacaciones al año, si tu contrato da más que la ley" value={vacAnuales} onChange={setVacAnuales} placeholder="Déjalo vacío si no sabes" />
        <Casilla checked={frontera} onChange={setFrontera}>Trabajo en la zona libre de la frontera norte</Casilla>
      </MasOpciones>
      <p className="cc-mas"><button type="button" className="cc-enlace" onClick={() => setGobierno(true)}>¿Trabajas en gobierno o SEP?</button></p>
    </Formulario>
    <div aria-live="polite">{r && <ResultadoClaro calculadora="finiquito"
      etiqueta="Te deben aproximadamente"
      monto={fmtMx(r.totalBruto)}
      linea="Es el total antes de impuestos. Tu empresa puede retener ISR de una parte."
      secundarios={[
        ...(r.pagoSalarioPendiente > 0 ? [['Sueldo pendiente', fmtMx(r.pagoSalarioPendiente)]] : []),
        ['Aguinaldo de este año', fmtMx(r.aguinaldoProporcional)],
        ['Vacaciones', fmtMx(r.salarioDiario * (r.vacacionesProporcionalesDias + r.vacacionesPendientesDias))],
        ['Prima vacacional', fmtMx(r.primaVacacional)],
        ...(r.aplicaPrimaAntiguedad ? [['Prima de antigüedad', fmtMx(r.primaAntiguedad)]] : []),
      ]}
      detalle={<ul>
        <li>Sueldo diario: {fmtMx(r.salarioDiario)}.</li>
        <li>Aguinaldo: {r.diasAguinaldo} días trabajados en 2026 de 365.</li>
        <li>Vacaciones de este año: {dias(r.vacacionesProporcionalesDias)}{r.vacacionesPendientesDias > 0 ? `, más ${dias(r.vacacionesPendientesDias)} pendientes` : ''}; prima de {r.primaPct}%.</li>
        <li>{r.aplicaPrimaAntiguedad ? 'Incluye prima de antigüedad: 12 días por año, con tope de dos salarios mínimos diarios.' : 'Sin prima de antigüedad: al renunciar solo aplica con 15 años o más.'}</li>
      </ul>}
      siguiente={causa === 'renuncia'
        ? { texto: 'Calcula cuántos meses te alcanza este dinero', href: '/finanzas/fondo-emergencia' }
        : { texto: 'Si te despidieron sin causa, calcula tu liquidación', href: '/calculadoras/liquidacion' }}
      compartir={`Según MiLana, mi finiquito sale en unos ${fmtMx(r.totalBruto)} antes de impuestos.`}
      actualizado={ACT} />}</div>
  </Contenedor>;
}

// ─── Liquidación ─────────────────────────────────────────────────────────────
export function CalcLiquidacionDirecta() {
  const [sueldo, setSueldo] = useState('');
  const [ingreso, setIngreso] = useState('');
  const [salida, setSalida] = useState(hoy2026);
  const [indeterminada, setIndeterminada] = useState(true);
  const [veinte, setVeinte] = useState(false);
  const [pendientes, setPendientes] = useState('0');
  const [vacPend, setVacPend] = useState('0');
  const [diasAg, setDiasAg] = useState('15');
  const [prima, setPrima] = useState('25');
  const [vacAnuales, setVacAnuales] = useState('');
  const [frontera, setFrontera] = useState(false);
  const [gobierno, setGobierno] = useState(false);
  const { r, error } = useMemo(() => {
    if (!limpiarNumero(sueldo) || !ingreso || !salida) return { r: null, error: '' };
    return intentar(() => calcularLiquidacion2026({
      salarioMensual: limpiarNumero(sueldo), fechaIngreso: ingreso, fechaSalida: salida,
      diasTrabajadosNoPagados: pendientes || '0', vacacionesPendientes: vacPend || '0',
      zona: frontera ? 'frontera' : 'general', diasAguinaldo: diasAg || '15', primaVacacionalPct: prima || '25', diasVacacionesAnuales: vacAnuales,
      relacionIndeterminada: indeterminada, incluirVeinteDias: veinte,
    }));
  }, [sueldo, ingreso, salida, indeterminada, veinte, pendientes, vacPend, diasAg, prima, vacAnuales, frontera]);
  useEventoResultado('liquidacion', Boolean(r), veinte ? 'con_20_dias' : 'tres_meses');
  if (gobierno) return <Contenedor><AvisoGobierno onVolver={() => setGobierno(false)}>
    La indemnización de 3 meses es de la Ley Federal del Trabajo. En gobierno federal o la SEP la terminación depende de tu nombramiento y de la Ley Federal de los Trabajadores al Servicio del Estado; no la calculamos para no darte una cifra equivocada.
  </AvisoGobierno></Contenedor>;
  return <Contenedor>
    <Formulario>
      <CampoDinero name="sueldo" label="Tu sueldo mensual, antes de descuentos" placeholder="18,000" value={sueldo} onChange={setSueldo} />
      <CampoFecha name="ingreso" label="¿Qué día entraste a trabajar?" value={ingreso} onChange={setIngreso} max="2026-12-31" />
      <CampoFecha name="salida" label="¿Qué día te despidieron?" value={salida} onChange={setSalida} min="2026-01-01" max="2026-12-31" />
      <MensajeError error={error} />
      <MasOpciones texto="¿Contrato temporal, 20 días por año o días pendientes? Más opciones">
        <Casilla checked={!indeterminada} onChange={(v) => setIndeterminada(!v)}>Mi contrato era temporal o por obra (no indefinido)</Casilla>
        <Casilla checked={veinte} onChange={setVeinte}>Sumar 20 días por año trabajado (solo procede en algunos casos; pregunta a un abogado)</Casilla>
        <CampoNumero label="Días trabajados que no te han pagado" value={pendientes} onChange={setPendientes} />
        <CampoNumero label="Vacaciones de años anteriores que no tomaste" sufijo="días" value={vacPend} onChange={setVacPend} />
        <CampoNumero label="Días de aguinaldo que te da tu empresa" value={diasAg} onChange={setDiasAg} />
        <CampoNumero label="Prima vacacional" sufijo="%" value={prima} onChange={setPrima} />
        <CampoNumero label="Días de vacaciones al año, si tu contrato da más que la ley" value={vacAnuales} onChange={setVacAnuales} placeholder="Déjalo vacío si no sabes" />
        <Casilla checked={frontera} onChange={setFrontera}>Trabajo en la zona libre de la frontera norte</Casilla>
      </MasOpciones>
      <p className="cc-mas"><button type="button" className="cc-enlace" onClick={() => setGobierno(true)}>¿Trabajas en gobierno o SEP?</button></p>
    </Formulario>
    <div aria-live="polite">{r && <ResultadoClaro calculadora="liquidacion"
      etiqueta="Te tocaría aproximadamente"
      monto={fmtMx(r.totalBruto)}
      linea="Si el despido fue sin causa justificada. Es el total antes de impuestos."
      secundarios={[
        ['Finiquito (lo que ya ganaste)', fmtMx(r.subtotalSinPrimaAntiguedad)],
        ['Indemnización de 3 meses', fmtMx(r.indemnizacionTresMeses)],
        ...(r.incluyeVeinteDias ? [['20 días por año', fmtMx(r.indemnizacionVeinteDias)]] : []),
        ['Prima de antigüedad', fmtMx(r.primaAntiguedad)],
      ]}
      detalle={<ul>
        <li>Los 3 meses se calculan con tu salario diario integrado: {fmtMx(r.salarioDiarioIntegrado)} por día (sueldo diario más la parte proporcional de aguinaldo y prima vacacional).</li>
        <li>Prima de antigüedad: 12 días por año, con tope de dos salarios mínimos diarios.</li>
        <li>No incluye salarios caídos, intereses ni impuestos. Si el despido llega a juicio, la cifra puede cambiar.</li>
      </ul>}
      siguiente={{ texto: 'Calcula cuántos meses te alcanza este dinero', href: '/finanzas/fondo-emergencia' }}
      compartir={`Según MiLana, mi liquidación sale en unos ${fmtMx(r.totalBruto)} antes de impuestos.`}
      actualizado={ACT} />}</div>
  </Contenedor>;
}

// ─── ISR mensual ─────────────────────────────────────────────────────────────
export function CalcISRDirecta() {
  const [sueldo, setSueldo] = useState('');
  const [minimo, setMinimo] = useState(false);
  const mes = `2026-${String(Math.min(Math.max(new Date().getMonth() + 1, 2), 12)).padStart(2, '0')}`;
  const { r, error } = useMemo(() => {
    if (!limpiarNumero(sueldo)) return { r: null, error: '' };
    return intentar(() => calcularISR({ ingreso: limpiarNumero(sueldo), soloMinimo: minimo, periodo: new Date().getFullYear() === 2026 ? mes : '2026-11' }));
  }, [sueldo, minimo, mes]);
  useEventoResultado('isr', Boolean(r), minimo ? 'salario_minimo' : 'mensual');
  return <Contenedor>
    <Formulario>
      <CampoDinero name="sueldo" label="Tu sueldo mensual, antes de descuentos" placeholder="20,000" value={sueldo} onChange={setSueldo} ayuda="Si parte de tu sueldo no paga impuesto (vales, por ejemplo), escribe solo la parte que sí paga." />
      <MensajeError error={error} />
      <MasOpciones texto="¿Ganas el salario mínimo? Más opciones">
        <Casilla checked={minimo} onChange={setMinimo}>Solo gano el salario mínimo (${SALARIOS_MINIMOS_2026.general.toFixed(2)} diarios; ${SALARIOS_MINIMOS_2026.frontera.toFixed(2)} en la frontera norte)</Casilla>
      </MasOpciones>
    </Formulario>
    <div aria-live="polite">{r && <ResultadoClaro calculadora="isr"
      etiqueta="Te retienen de ISR al mes"
      monto={fmtMx(r.retenido)}
      linea={`Te quedan ${fmtMx(r.despuesISR)} antes de IMSS y otros descuentos.`}
      secundarios={[['ISR según la tabla', fmtMx(r.causado)], ['Subsidio al empleo', r.subsidio > 0 ? `− ${fmtMx(r.subsidio)}` : fmtMx(0)], ['ISR que te retienen', fmtMx(r.retenido)]]}
      detalle={<ul>
        <li>Se usa la tabla mensual de ISR 2026 del SAT (Anexo 8 de la Resolución Miscelánea Fiscal).</li>
        <li>El subsidio al empleo baja tu ISR si ganas hasta $11,492.66 al mes: hasta $535.65 (15.02% de la UMA mensual).</li>
        {r.soloMinimo && <li>Si solo ganas el salario mínimo, no te retienen ISR (Ley del ISR, artículo 96).</li>}
        <li>Supone un mes completo con un solo empleador.</li>
      </ul>}
      siguiente={{ texto: 'Ve tu sueldo neto con IMSS incluido', href: '/calculadoras/bruto-a-neto' }}
      compartir={`Según MiLana, me retienen unos ${fmtMx(r.retenido)} de ISR al mes.`}
      actualizado={ACT} />}</div>
  </Contenedor>;
}

// ─── Bruto a neto ────────────────────────────────────────────────────────────
export function CalcBrutoNetoDirecta({ modoDetallado: ModoDetallado }) {
  const [sueldo, setSueldo] = useState('');
  const [sbc, setSbc] = useState('');
  const [minimo, setMinimo] = useState(false);
  const [detallado, setDetallado] = useState(false);
  const { r, error, sbcUsado } = useMemo(() => {
    const bruto = limpiarNumero(sueldo);
    if (!bruto) return { r: null, error: '' };
    let sbcUsado = '';
    try { sbcUsado = limpiarNumero(sbc) || String(sbcEstimado(bruto)); } catch (e) { return { r: null, error: e.message }; }
    return { ...intentar(() => calcularBrutoNeto2026({
      brutoMensual: bruto, ingresoGravableISR: bruto, seguridadSocial: 'imss', sbcDiario: sbcUsado, diasCotizados: '30',
      soloMinimo: minimo, periodo: '2026-11', empleadorUnico: true,
    })), sbcUsado };
  }, [sueldo, sbc, minimo]);
  useEventoResultado('bruto_neto', Boolean(r), limpiarNumero(sbc) ? 'sbc_propio' : 'sbc_estimado');
  if (detallado && ModoDetallado) return <Contenedor>
    <p className="cc-mas"><button type="button" className="cc-enlace" onClick={() => setDetallado(false)}>← Volver al cálculo rápido</button></p>
    <ModoDetallado />
  </Contenedor>;
  return <Contenedor>
    <Formulario>
      <CampoDinero name="sueldo" label="Tu sueldo mensual, antes de descuentos" placeholder="20,000" value={sueldo} onChange={setSueldo} />
      <MensajeError error={error} />
      <MasOpciones texto="¿Conoces tu salario base de cotización (SBC)? Más opciones">
        <CampoDinero label="Salario base de cotización diario (viene en tu recibo o en tu alta del IMSS)" placeholder={sueldo ? String(sbcEstimadoSeguro(sueldo)) : '700'} value={sbc} onChange={setSbc} ayuda="Si lo dejas vacío, lo estimamos con las prestaciones mínimas de ley." />
        <Casilla checked={minimo} onChange={setMinimo}>Solo gano el salario mínimo</Casilla>
      </MasOpciones>
      {ModoDetallado && <p className="cc-mas"><button type="button" className="cc-enlace" onClick={() => setDetallado(true)}>¿Trabajas en gobierno o SEP (ISSSTE)?</button></p>}
    </Formulario>
    <div aria-live="polite">{r && <ResultadoClaro calculadora="bruto-neto"
      etiqueta="Te llegan al mes aproximadamente"
      monto={fmtMx(r.netoDespuesISRSeguridadSocial)}
      linea={`De ${fmtMx(r.bruto)} se descuentan ${fmtMx(r.retenido)} de ISR y ${fmtMx(r.cuotaObrera)} de IMSS.`}
      secundarios={[['Sueldo bruto', fmtMx(r.bruto)], ['ISR', `− ${fmtMx(r.retenido)}`], ['IMSS', `− ${fmtMx(r.cuotaObrera)}`], ['Te llega (neto)', fmtMx(r.netoDespuesISRSeguridadSocial)]]}
      detalle={<ul>
        <li>ISR con la tabla mensual 2026 del SAT y el subsidio al empleo cuando aplica.</li>
        <li>IMSS: 2.375% de tu salario base de cotización por 30 días, más 0.40% de lo que pase de 3 UMA diarias.</li>
        <li>Salario base de cotización {limpiarNumero(sbc) ? 'que escribiste' : `estimado: sueldo diario × ${FACTOR_INTEGRACION_MINIMO.toFixed(4)} (aguinaldo de 15 días y prima vacacional de ley)`}: {fmtMx(Number(sbcUsado))} diarios.</li>
        <li>No incluye Infonavit, Fonacot, préstamos ni otros descuentos de tu recibo.</li>
      </ul>}
      siguiente={{ texto: 'Haz tu presupuesto con este sueldo neto', href: '/finanzas/presupuesto' }}
      compartir={`Según MiLana, de mi sueldo me llegan unos ${fmtMx(r.netoDespuesISRSeguridadSocial)} al mes después de ISR e IMSS.`}
      actualizado={ACT} />}</div>
  </Contenedor>;
}
function sbcEstimadoSeguro(sueldo) { try { return sbcEstimado(limpiarNumero(sueldo)); } catch { return ''; } }

// ─── RESICO ──────────────────────────────────────────────────────────────────
export function CalcRESICODirecta() {
  const [ingreso, setIngreso] = useState('');
  const { r, error } = useMemo(() => limpiarNumero(ingreso) ? intentar(() => calcularRESICO({ ingresoMensual: limpiarNumero(ingreso) })) : { r: null, error: '' }, [ingreso]);
  useEventoResultado('resico', Boolean(r), 'mensual');
  return <Contenedor>
    <Formulario>
      <CampoDinero name="ingreso" label="Lo que cobraste este mes, sin IVA" placeholder="40,000" value={ingreso} onChange={setIngreso} ayuda="Solo lo que ya te pagaron y facturaste." />
      <MensajeError error={error} />
    </Formulario>
    <div aria-live="polite">{r && <ResultadoClaro calculadora="resico"
      etiqueta="Pagas de ISR este mes"
      monto={fmtMx(r.isr)}
      linea={`Es el ${r.tasa.toFixed(2)}% de lo que cobraste. Te quedan ${fmtMx(r.neto)} antes de IVA y retenciones.`}
      detalle={<ul>
        <li>Tabla mensual del RESICO (Ley del ISR, artículo 113-E): 1% hasta $25,000; 1.10% hasta $50,000; 1.50% hasta $83,333.33; 2% hasta $208,333.33 y 2.50% arriba de eso.</li>
        <li>Si le facturas a una empresa (persona moral), te retiene 1.25% de ISR y lo restas de este pago (artículo 113-J).</li>
        <li>Solo para personas que ganan hasta $3.5 millones al año. El IVA se calcula aparte.</li>
      </ul>}
      siguiente={{ texto: 'Aparta cada mes para tus impuestos y tu presupuesto', href: '/finanzas/presupuesto' }}
      compartir={`Según MiLana, en RESICO pago unos ${fmtMx(r.isr)} de ISR este mes.`}
      actualizado={ACT} />}</div>
  </Contenedor>;
}

// ─── PTU ─────────────────────────────────────────────────────────────────────
export function CalcPTUDirecta() {
  const [renta, setRenta] = useState('');
  const { r, error } = useMemo(() => limpiarNumero(renta) ? intentar(() => calcularPTUTotal({ rentaGravable: limpiarNumero(renta) })) : { r: null, error: '' }, [renta]);
  useEventoResultado('ptu', Boolean(r), 'total_empresa');
  return <Contenedor>
    <Formulario>
      <CampoDinero name="renta" label="Utilidad de la empresa para PTU (renta gravable del año)" placeholder="5,000,000" value={renta} onChange={setRenta} ayuda="Viene en la declaración anual de la empresa. Tu área de nómina te la puede dar." />
      <MensajeError error={error} />
    </Formulario>
    <div aria-live="polite">{r && <ResultadoClaro calculadora="ptu"
      etiqueta="La empresa reparte entre todos"
      monto={fmtMx(r.repartoTotal)}
      linea="Es el 10% de la utilidad. Tu parte depende de tus días trabajados y tu sueldo, comparados con los de toda la plantilla."
      detalle={<ul>
        <li>La mitad se reparte por días trabajados y la otra mitad según el sueldo de cada persona (artículo 123).</li>
        <li>Tu parte tiene un tope: 3 meses de sueldo o el promedio de lo que recibiste en los últimos 3 años, lo que te convenga más (artículo 127).</li>
        <li>Se paga dentro de los 60 días después de la fecha en que la empresa debe pagar su impuesto anual (Ley Federal del Trabajo, artículo 122).</li>
      </ul>}
      siguiente={{ texto: 'Decide qué harás con tu PTU antes de recibirla', href: '/finanzas/ahorro' }}
      compartir={`Según MiLana, la PTU total a repartir en mi empresa sería de ${fmtMx(r.repartoTotal)}.`}
      actualizado={ACT} />}</div>
  </Contenedor>;
}

// ─── Vacaciones ──────────────────────────────────────────────────────────────
export function CalcVacacionesDirecta({ modoGobierno: ModoGobierno }) {
  const [anios, setAnios] = useState('');
  const [sueldo, setSueldo] = useState('');
  const [prima, setPrima] = useState('25');
  const [gobierno, setGobierno] = useState(false);
  const { r, error } = useMemo(() => String(anios).trim()
    ? intentar(() => calcularVacaciones({ anios: limpiarNumero(anios), sueldoMensual: limpiarNumero(sueldo), primaPct: prima || '25' }))
    : { r: null, error: '' }, [anios, sueldo, prima]);
  useEventoResultado('vacaciones', Boolean(r), r?.total > 0 ? 'con_sueldo' : 'solo_dias');
  if (gobierno && ModoGobierno) return <Contenedor>
    <p className="cc-mas"><button type="button" className="cc-enlace" onClick={() => setGobierno(false)}>← Volver al cálculo para empresa privada</button></p>
    <ModoGobierno />
  </Contenedor>;
  return <Contenedor>
    <Formulario>
      <CampoNumero name="anios" label="¿Cuántos años cumplidos llevas en tu trabajo?" placeholder="3" value={anios} onChange={setAnios} />
      <CampoDinero name="sueldo" label="Tu sueldo mensual (opcional, para saber cuánto te pagan)" placeholder="18,000" value={sueldo} onChange={setSueldo} />
      <MensajeError error={error} />
      <MasOpciones texto="¿Tu prima vacacional es mayor a 25%?">
        <CampoNumero label="Prima vacacional" sufijo="%" value={prima} onChange={setPrima} ayuda="La ley pide al menos 25%." />
      </MasOpciones>
      {ModoGobierno && <p className="cc-mas"><button type="button" className="cc-enlace" onClick={() => setGobierno(true)}>¿Trabajas en gobierno o SEP?</button></p>}
    </Formulario>
    <div aria-live="polite">{r && (r.dias === 0
      ? <p className="cc-ayuda" style={{ marginTop: 12 }}>Las vacaciones se ganan al cumplir el primer año. Si llevas menos, te tocarán 12 días en tu primer aniversario.</p>
      : <ResultadoClaro calculadora="vacaciones"
        etiqueta="Te tocan al año"
        monto={`${r.dias} días`}
        linea={r.total > 0 ? `Te pagan ${fmtMx(r.pagoDias)} por esos días más ${fmtMx(r.primaVacacional)} de prima vacacional: ${fmtMx(r.total)} en total.` : 'Escribe tu sueldo para ver cuánto te pagan con la prima vacacional.'}
        detalle={<ul>
          <li>Ley Federal del Trabajo, artículo 76 (reforma de 2023): 12 días el primer año y 2 más cada año hasta 20; desde el sexto año, 2 más cada 5 años.</li>
          <li>Prima vacacional: al menos 25% de lo que te pagan por esos días (artículo 80).</li>
          <li>Año 1: 12 · Año 2: 14 · Año 3: 16 · Año 4: 18 · Año 5: 20 · Años 6–10: 22 · Años 11–15: 24 · Años 16–20: 26.</li>
        </ul>}
        siguiente={{ texto: 'Si vas a dejar tu trabajo, calcula tu finiquito', href: '/calculadoras/finiquito' }}
        compartir={`Según MiLana, me tocan ${r.dias} días de vacaciones al año.`}
        actualizado={ACT} />)}</div>
  </Contenedor>;
}

// ─── Crédito Infonavit ───────────────────────────────────────────────────────
export function CalcInfonavitDirecta() {
  const [monto, setMonto] = useState('');
  const [tasa, setTasa] = useState('10.45');
  const [plazo, setPlazo] = useState('20');
  const { r, error } = useMemo(() => limpiarNumero(monto) ? intentar(() => calcularCredito({ monto: limpiarNumero(monto), tasaAnual: tasa, plazoAnios: plazo })) : { r: null, error: '' }, [monto, tasa, plazo]);
  useEventoResultado('infonavit', Boolean(r), `plazo_${Math.floor(Number(plazo) || 0)}`);
  return <Contenedor>
    <Formulario>
      <CampoDinero name="monto" label="¿Cuánto te prestan?" placeholder="800,000" value={monto} onChange={setMonto} />
      <MensajeError error={error} />
      <MasOpciones texto="Cambiar tasa (10.45%) o plazo (20 años)">
        <CampoNumero label="Tasa de interés anual" sufijo="%" value={tasa} onChange={setTasa} ayuda="Revisa la tuya en tu contrato o en Mi Cuenta Infonavit." />
        <CampoNumero label="Plazo" sufijo="años" value={plazo} onChange={setPlazo} />
      </MasOpciones>
    </Formulario>
    <div aria-live="polite">{r && <ResultadoClaro calculadora="infonavit"
      etiqueta="Pagarías al mes aproximadamente"
      monto={fmtMx(r.pagoMensual)}
      linea={`En ${r.plazo} años pagarías ${fmtMx(r.totalPagado)}: ${fmtMx(r.totalIntereses)} son intereses.`}
      detalle={<>
        <p>Pago fijo de capital e intereses con tasa de {r.tasa}% anual. No incluye seguros ni cuotas de administración, y no es un cálculo oficial de Infonavit.</p>
        <div className="cc-tabla-caja"><table className="cc-tabla"><thead><tr><th>Año</th><th>Intereses</th><th>Capital</th><th>Debes</th></tr></thead>
          <tbody>{r.tablaAnual.map((f) => <tr key={f.anio}><td>{f.anio}</td><td>{fmtMx(f.interes)}</td><td>{fmtMx(f.capital)}</td><td>{fmtMx(f.saldo)}</td></tr>)}</tbody></table></div>
      </>}
      siguiente={{ texto: 'Revisa si esta mensualidad cabe en tu presupuesto', href: '/finanzas/presupuesto' }}
      compartir={`Según MiLana, un crédito de ${fmtMx(r.monto)} me saldría en unos ${fmtMx(r.pagoMensual)} al mes.`}
      actualizado={ACT} />}</div>
  </Contenedor>;
}

// ─── Pensión IMSS (requisitos) ───────────────────────────────────────────────
export function CalcPensionDirecta() {
  const [edad, setEdad] = useState('');
  const [semanas, setSemanas] = useState('');
  const { r, error } = useMemo(() => String(edad).trim() ? intentar(() => revisarPension({ edad: limpiarNumero(edad), semanas: limpiarNumero(semanas) })) : { r: null, error: '' }, [edad, semanas]);
  useEventoResultado('pension', Boolean(r), r ? (r.cumpleSemanas ? 'cumple_semanas' : 'faltan_semanas') : 'sin_resultado');
  return <Contenedor>
    <Formulario>
      <CampoNumero name="edad" label="¿Cuántos años tienes?" placeholder="45" value={edad} onChange={setEdad} />
      <CampoNumero name="semanas" label="Semanas cotizadas en el IMSS" placeholder="520" value={semanas} onChange={setSemanas} ayuda="Vienen en tu constancia de semanas cotizadas (se descarga gratis en el sitio del IMSS)." />
      <MensajeError error={error} />
    </Formulario>
    <div aria-live="polite">{r && <ResultadoClaro calculadora="pension"
      etiqueta={r.cumpleSemanas ? 'Semanas cotizadas' : 'Te faltan'}
      monto={r.cumpleSemanas ? 'Ya cumples' : `${r.faltan.toLocaleString('es-MX')} semanas`}
      linea={r.tipo === 'vejez' ? 'Por edad ya puedes pedir pensión por vejez (65 años o más).'
        : r.tipo === 'cesantia' ? 'Por edad ya puedes pedir pensión por cesantía (de 60 a 64 años).'
        : `Te faltan ${r.aniosParaSesenta} años para la edad mínima de 60.`}
      detalle={<ul>
        <li>En 2026 se piden {r.minimo} semanas cotizadas (Ley 97, AFORE). Sube 25 semanas cada año hasta llegar a 1,000 en 2031.</li>
        <li>Esta revisión no calcula el monto de tu pensión: depende del saldo de tu AFORE y de tu sueldo promedio.</li>
        <li>Aplica a quienes empezaron a cotizar al IMSS desde julio de 1997. No aplica a ISSSTE.</li>
      </ul>}
      siguiente={{ texto: 'Mira cómo ahorrar más para tu retiro', href: '/finanzas/ahorro' }}
      compartir={r.cumpleSemanas ? 'Según MiLana, ya cumplo las semanas para pensionarme en el IMSS.' : `Según MiLana, me faltan ${r.faltan} semanas para pensionarme en el IMSS.`}
      actualizado={ACT} />}</div>
  </Contenedor>;
}
