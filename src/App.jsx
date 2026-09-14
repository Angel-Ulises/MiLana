import { calcularISR, calcularAguinaldo, ISR_MENSUAL_2026 } from "./lib/calculos-revisados.mjs";
import { useEffect, useState, useId } from "react";
import "./design-home.css";
import catalogoPaginas from "./data/paginas.json";
import regulatoryData from "./data/regulatory-data.json";
import articulos from "./data/articulos.json";
import contenidoCalc from "./data/contenido-calculadoras.json";
import catalogoSituaciones from "./data/situaciones.json";
import catalogoFotos from "./data/fotos.json";

// ═══════════════════════════════════════════════════════════════
// DATOS OFICIALES 2026 — SAT / CONASAMI / INEGI
// ═══════════════════════════════════════════════════════════════

const SALARIO_MINIMO_GENERAL = 315.04;
const SALARIO_MINIMO_FRONTERA = 440.87;
const UMA_DIARIA = 117.31;
const UMA_MENSUAL = 3566.22;
const UMA_ANUAL = 42794.64;

// Tabla ISR mensual 2026 — Anexo 8 RMF DOF 28/12/2025

// Tabla ISR anual 2026
const ISR_ANUAL_2026 = [
  { li: 0.01, ls: 10135.11, cf: 0, tasa: 1.92 },
  { li: 10135.12, ls: 86022.11, cf: 194.59, tasa: 6.40 },
  { li: 86022.12, ls: 151176.19, cf: 5051.37, tasa: 10.88 },
  { li: 151176.20, ls: 175735.66, cf: 12140.13, tasa: 16.00 },
  { li: 175735.67, ls: 210403.69, cf: 16069.64, tasa: 17.92 },
  { li: 210403.70, ls: 424353.97, cf: 22282.14, tasa: 21.36 },
  { li: 424353.98, ls: 668840.14, cf: 67981.92, tasa: 23.52 },
  { li: 668840.15, ls: 1276925.98, cf: 125485.07, tasa: 30.00 },
  { li: 1276925.99, ls: 1702567.97, cf: 307910.81, tasa: 32.00 },
  { li: 1702567.98, ls: 5107703.92, cf: 444116.23, tasa: 34.00 },
  { li: 5107703.93, ls: Infinity, cf: 1601862.46, tasa: 35.00 },
];

// RESICO tasas 2026
const RESICO_TASAS = [
  { li: 0.01, ls: 25000.00, tasa: 1.00 },
  { li: 25000.01, ls: 50000.00, tasa: 1.10 },
  { li: 50000.01, ls: 83333.33, tasa: 1.50 },
  { li: 83333.34, ls: 208333.33, tasa: 2.00 },
  { li: 208333.34, ls: 291666.67, tasa: 2.50 },
];

// Tabla de vacaciones "Vacaciones Dignas" (Art. 76 LFT reforma 2023)
const VACACIONES_POR_ANIO = [
  12, 14, 16, 18, 20,   // años 1-5
  22, 22, 22, 22, 22,   // años 6-10
  24, 24, 24, 24, 24,   // años 11-15
  26, 26, 26, 26, 26,   // años 16-20
  28, 28, 28, 28, 28,   // años 21-25
  30, 30, 30, 30, 30,   // años 26-30
  32, 32, 32, 32, 32,   // años 31-35
];

function getVacDias(anios) {
  if (anios < 1) return 0;
  if (anios <= VACACIONES_POR_ANIO.length) return VACACIONES_POR_ANIO[anios - 1];
  // Después del año 35 la LFT no pone tope: se sigue sumando 2 días cada 5 años (Art. 76)
  return 22 + 2 * Math.floor((anios - 6) / 5);
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE CÁLCULO
// ═══════════════════════════════════════════════════════════════

function calcISR(ingreso, tabla) {
  if (ingreso <= 0) return 0;
  for (const r of tabla) {
    if (ingreso >= r.li && ingreso <= r.ls) {
      return ((ingreso - r.li) * r.tasa / 100) + r.cf;
    }
  }
  return 0;
}

function calcISRMensual(brutoMensual) {
  return calcularISR({ ingreso: brutoMensual, soloMinimo: false }).retenido;
}

function diasEntre(f1, f2) {
  const d1 = new Date(f1), d2 = new Date(f2);
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
}

// Último aniversario laboral (mismo día/mes que el ingreso) en o antes de fechaRef.
// Vacaciones y prima vacacional proporcionales se ligan al aniversario de contratación,
// no al año calendario (que sí es el criterio correcto para el aguinaldo).
function aniversarioLaboral(fechaIngreso, fechaRef) {
  const fi = new Date(fechaIngreso);
  const fr = new Date(fechaRef);
  let aniv = new Date(fr.getFullYear(), fi.getMonth(), fi.getDate());
  if (aniv > fr) aniv = new Date(fr.getFullYear() - 1, fi.getMonth(), fi.getDate());
  return aniv;
}

function fmt(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

function fmtPct(n) { return n.toFixed(2) + '%'; }

// ═══════════════════════════════════════════════════════════════
// CALCULADORAS
// ═══════════════════════════════════════════════════════════════

function CalcFiniquito() { return <CalculoSuspendido id="finiquito" />; }

function CalcFiniquitoPendiente() {
  const [salarioMensual, setSalarioMensual] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [diasTrabajados, setDiasTrabajados] = useState('');
  const [vacPendientes, setVacPendientes] = useState('0');
  const [result, setResult] = useState(null);

  const calcular = () => {
    const sm = parseFloat(salarioMensual) || 0;
    const sd = sm / 30;
    const dt = Math.max(parseInt(diasTrabajados) || 0, 0);
    const vp = Math.max(parseInt(vacPendientes) || 0, 0);
    if (!fechaIngreso || !fechaSalida || sm <= 0 || new Date(fechaSalida) <= new Date(fechaIngreso)) return;

    const totalDias = diasEntre(fechaIngreso, fechaSalida);
    const anios = totalDias / 365;
    const aniosCompletos = Math.floor(anios);
    const fi = new Date(fechaIngreso);
    const fs = new Date(fechaSalida);

    // Días trabajados no pagados
    const pagoSalario = sd * dt;

    // Aguinaldo proporcional (15 días / 365 * días trabajados en el año)
    const inicioAnio = new Date(fs.getFullYear(), 0, 1);
    const diasAnio = diasEntre(
      fi > inicioAnio ? fi : inicioAnio,
      fechaSalida
    );
    const aguinaldo = (15 / 365) * diasAnio * sd;

    // Vacaciones proporcionales del año en curso
    const vacDias = getVacDias(aniosCompletos + 1);
    const diasDesdeAniversario = diasEntre(aniversarioLaboral(fechaIngreso, fechaSalida), fechaSalida);
    const fraccionAnio = (diasDesdeAniversario / 365);
    const vacProporcionales = vacDias * fraccionAnio;
    const totalVacDias = vacProporcionales + vp;
    const pagoVacaciones = totalVacDias * sd;

    // Prima vacacional 25%
    const primaVac = pagoVacaciones * 0.25;

    // Prima de antigüedad (solo si >= 15 años en renuncia voluntaria)
    let primaAnt = 0;
    if (aniosCompletos >= 15) {
      const topeDiario = SALARIO_MINIMO_GENERAL * 2; // Art. 162 LFT: tope es 2x salario mínimo, no 2x UMA
      const sdTope = Math.min(sd, topeDiario);
      primaAnt = 12 * sdTope * aniosCompletos;
    }

    const bruto = pagoSalario + aguinaldo + pagoVacaciones + primaVac + primaAnt;

    setResult({
      sd: sd,
      pagoSalario, dt, aguinaldo, diasAnio,
      vacDias, vacProporcionales: totalVacDias, pagoVacaciones,
      primaVac, primaAnt, aniosCompletos,
      bruto,
    });
  };

  return (
    <div>
      <p style={{color:'#5E6B78',marginBottom:20,fontSize:14,lineHeight:1.6}}>
        Calcula el finiquito que te corresponde al renunciar de forma voluntaria. El resultado incluye días trabajados pendientes de pago, aguinaldo proporcional, vacaciones proporcionales y prima vacacional, conforme a la Ley Federal del Trabajo vigente en 2026.
      </p>
      <div style={styles.grid2}>
        <Field label="Salario mensual bruto ($)" value={salarioMensual} onChange={setSalarioMensual} type="number" placeholder="Ej: 15000" />
        <Field label="Días trabajados sin pagar" value={diasTrabajados} onChange={setDiasTrabajados} type="number" placeholder="Ej: 12" />
        <Field label="Fecha de ingreso" value={fechaIngreso} onChange={setFechaIngreso} type="date" />
        <Field label="Fecha de salida" value={fechaSalida} onChange={setFechaSalida} type="date" />
        <Field label="Vacaciones pendientes (días)" value={vacPendientes} onChange={setVacPendientes} type="number" placeholder="0" />
      </div>
      <Btn onClick={calcular}>Calcular Finiquito</Btn>
      {result && (
        <ResultBox>
          <ResultLine label={`Salario (${result.dt} días)`} value={fmt(result.pagoSalario)} />
          <ResultLine label={`Aguinaldo proporcional (${result.diasAnio} días del año)`} value={fmt(result.aguinaldo)} />
          <ResultLine label={`Vacaciones (${result.vacProporcionales.toFixed(1)} días)`} value={fmt(result.pagoVacaciones)} />
          <ResultLine label="Prima vacacional (25%)" value={fmt(result.primaVac)} />
          {result.primaAnt > 0 && <ResultLine label={`Prima antigüedad (${result.aniosCompletos} años)`} value={fmt(result.primaAnt)} />}
          <Divider />
          <ResultLine label="Total bruto estimado" value={fmt(result.bruto)} bold color="#28735A" />
          <Note>Este resultado es el total bruto (antes de impuestos) de tu finiquito. No incluye el ISR por pagos de separación: ese impuesto se calcula con un procedimiento específico (Art. 95 LISR) que depende de tu salario ordinario y de cómo se traten los distintos conceptos que integran el finiquito, así que no lo estimamos aquí para evitar darte una cifra neta poco confiable. Consulta con tu área de Recursos Humanos o un especialista laboral/fiscal para el neto exacto.</Note>
        </ResultBox>
      )}
    </div>
  );
}

function CalcLiquidacion() { return <CalculoSuspendido id="liquidacion" />; }

function CalcLiquidacionPendiente() {
  const [salarioMensual, setSalarioMensual] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [diasTrabajados, setDiasTrabajados] = useState('');
  const [result, setResult] = useState(null);

  const calcular = () => {
    const sm = parseFloat(salarioMensual) || 0;
    const sd = sm / 30;
    const dt = Math.max(parseInt(diasTrabajados) || 0, 0);
    if (!fechaIngreso || !fechaSalida || sm <= 0 || new Date(fechaSalida) <= new Date(fechaIngreso)) return;

    const totalDias = diasEntre(fechaIngreso, fechaSalida);
    const anios = totalDias / 365;
    const aniosCompletos = Math.floor(anios);
    const fs = new Date(fechaSalida);
    const fi = new Date(fechaIngreso);

    // Salario diario integrado (SDI)
    const factorIntegracion = 1 + (15/365) + (getVacDias(aniosCompletos + 1) * 0.25 / 365);
    const sdi = sd * factorIntegracion;

    // Parte finiquito
    const pagoSalario = sd * dt;
    const inicioAnio = new Date(fs.getFullYear(), 0, 1);
    const diasAnio = diasEntre(fi > inicioAnio ? fi : inicioAnio, fechaSalida);
    const aguinaldo = (15 / 365) * diasAnio * sd;
    const vacDias = getVacDias(aniosCompletos + 1);
    const diasDesdeAniversario = diasEntre(aniversarioLaboral(fechaIngreso, fechaSalida), fechaSalida);
    const vacProporcionales = vacDias * (diasDesdeAniversario / 365);
    const pagoVacaciones = vacProporcionales * sd;
    const primaVac = pagoVacaciones * 0.25;

    // Indemnización constitucional (90 días SDI)
    const indem90 = sdi * 90;

    // 20 días por año de servicio (proporcional, sin redondear ni forzar mínimo de 1 año —
    // la SCJN reconoce el pago proporcional cuando el servicio es menor a un año)
    const indem20 = sdi * 20 * anios;

    // Prima de antigüedad (12 días por año, tope 2x salario mínimo — Art. 162 LFT), proporcional
    const topeDiario = SALARIO_MINIMO_GENERAL * 2;
    const sdTope = Math.min(sd, topeDiario);
    const primaAnt = 12 * sdTope * anios;

    const brutoFiniquito = pagoSalario + aguinaldo + pagoVacaciones + primaVac;
    const brutoLiquidacion = indem90 + indem20 + primaAnt;
    const brutoTotal = brutoFiniquito + brutoLiquidacion;

    setResult({
      sd, sdi, factorIntegracion, dt,
      pagoSalario, aguinaldo, diasAnio, vacProporcionales, pagoVacaciones, primaVac,
      indem90, indem20, primaAnt, aniosCompletos, anios,
      brutoFiniquito, brutoLiquidacion, brutoTotal
    });
  };

  return (
    <div>
      <p style={{color:'#5E6B78',marginBottom:20,fontSize:14,lineHeight:1.6}}>
        Calcula la liquidación que te corresponde en caso de despido injustificado. El resultado incluye la indemnización constitucional de 3 meses, 20 días de salario por cada año trabajado y la prima de antigüedad, conforme a los artículos 48 y 50 de la Ley Federal del Trabajo.
      </p>
      <div style={styles.grid2}>
        <Field label="Salario mensual bruto ($)" value={salarioMensual} onChange={setSalarioMensual} type="number" placeholder="Ej: 20000" />
        <Field label="Días trabajados sin pagar" value={diasTrabajados} onChange={setDiasTrabajados} type="number" placeholder="Ej: 15" />
        <Field label="Fecha de ingreso" value={fechaIngreso} onChange={setFechaIngreso} type="date" />
        <Field label="Fecha de despido" value={fechaSalida} onChange={setFechaSalida} type="date" />
      </div>
      <Btn onClick={calcular}>Calcular Liquidación</Btn>
      {result && (
        <ResultBox>
          <div style={{marginBottom:12,fontWeight:600,color:'#13263B',display:'flex',alignItems:'center',gap:6}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v4h4" /><path d="M9 14.5l2 2 4-4.5" /></svg>
            Finiquito
          </div>
          <ResultLine label={`Salario (${result.dt} días)`} value={fmt(result.pagoSalario)} />
          <ResultLine label="Aguinaldo proporcional" value={fmt(result.aguinaldo)} />
          <ResultLine label={`Vacaciones (${result.vacProporcionales.toFixed(1)} días)`} value={fmt(result.pagoVacaciones)} />
          <ResultLine label="Prima vacacional" value={fmt(result.primaVac)} />
          <ResultLine label="Subtotal finiquito" value={fmt(result.brutoFiniquito)} bold />
          <Divider />
          <div style={{marginBottom:12,fontWeight:600,color:'#13263B',display:'flex',alignItems:'center',gap:6}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v18" /><path d="M7 7h10" /><path d="M7 7l-3 6a3 3 0 0 0 6 0z" /><path d="M17 7l-3 6a3 3 0 0 0 6 0z" /><path d="M9 21h6" /></svg>
            Indemnización (despido injustificado)
          </div>
          <ResultLine label={`90 días SDI (${fmt(result.sdi)}/día)`} value={fmt(result.indem90)} />
          <ResultLine label={`20 días × ${result.anios.toFixed(2)} año(s) de servicio`} value={fmt(result.indem20)} />
          <ResultLine label={`Prima antigüedad (12 días × ${result.anios.toFixed(2)} año(s))`} value={fmt(result.primaAnt)} />
          <ResultLine label="Subtotal indemnización" value={fmt(result.brutoLiquidacion)} bold />
          <Divider />
          <ResultLine label="Total bruto" value={fmt(result.brutoTotal)} bold color="#28735A" />
          <Note>SDI calculado con factor de integración {result.factorIntegracion.toFixed(4)}. Montos brutos antes de ISR. Exenciones aplican según Art. 93 LISR.</Note>
        </ResultBox>
      )}
    </div>
  );
}

function CalcAguinaldo() { return <CalculoRevisado tipo="aguinaldo" />; }
function CalcISR() { return <CalculoRevisado tipo="isr" />; }

function CalculoRevisado({ tipo }) {
  const isISR = tipo === 'isr';
  const [importe, setImporte] = useState('');
  const [dias, setDias] = useState('15');
  const [fecha, setFecha] = useState('');
  const [minimo, setMinimo] = useState('');
  const [periodo, setPeriodo] = useState('2026-09');
  const [confirmado, setConfirmado] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const errorId = useId();
  const editar = setter => valor => { setter(valor); setResultado(null); setError(''); };
  const calcular = e => {
    e.preventDefault(); setResultado(null);
    try {
      if (isISR && !confirmado) throw new Error('Confirma que es un mes completo ordinario con un solo empleador.');
      const r = isISR
        ? calcularISR({ ingreso: importe, soloMinimo: minimo === '' ? undefined : minimo === 'si', periodo })
        : calcularAguinaldo({ salario: importe, dias, ingreso: fecha, anioCompleto: confirmado });
      setResultado(r); setError('');
    } catch (err) { setError(err.message); }
  };
  return <form onSubmit={calcular} noValidate>
    <p>{isISR ? 'Estimación de ISR para un mes completo ordinario de febrero a diciembre de 2026, con un solo empleador.' : 'Aguinaldo bruto proyectado al cierre de 2026. Supone salario mensual fijo y servicio continuo hasta el 31 de diciembre.'}</p>
    <Field label={isISR ? 'Ingreso mensual gravable para ISR (MXN)' : 'Salario mensual fijo (MXN)'} type="number" value={importe} onChange={editar(setImporte)} help={isISR ? 'Captura la parte gravada de tus percepciones; puede ser distinta de tu sueldo bruto.' : 'No incluye incidencias ni cambios de salario.'} error={error} errorId={errorId} />
    {isISR ? <>
      <label htmlFor="isr-periodo">Mes completo de 2026</label>
      <select id="isr-periodo" value={periodo} onChange={e=>editar(setPeriodo)(e.target.value)} style={{display:'block',width:'100%',minHeight:48,padding:12,margin:'8px 0 16px',border:'1px solid #64748b',borderRadius:8,fontSize:16}} aria-describedby={error ? errorId : undefined}>
        {['Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((mes,i)=><option key={mes} value={`2026-${String(i+2).padStart(2,'0')}`}>{mes}</option>)}
      </select>
      <p>Enero, nóminas parciales y pagos por separación no están incluidos.</p>
      <label htmlFor="isr-minimo">¿En este mes percibiste únicamente el salario mínimo general de tu zona?</label>
      <select id="isr-minimo" value={minimo} onChange={e=>editar(setMinimo)(e.target.value)} style={{display:'block',width:'100%',minHeight:48,padding:12,margin:'8px 0 16px',border:'1px solid #64748b',borderRadius:8,fontSize:16}} aria-describedby={`isr-minimo-ayuda ${error ? errorId : ''}`}>
        <option value="">Selecciona una respuesta</option><option value="si">Sí</option><option value="no">No</option>
      </select>
      <p id="isr-minimo-ayuda">Se refiere al mínimo general aplicable al lugar donde trabajas.</p>
      <label><input type="checkbox" checked={confirmado} onChange={e=>editar(setConfirmado)(e.target.checked)} aria-describedby={error ? errorId : undefined} /> Confirmo que es un mes completo ordinario con un solo empleador.</label>
    </> : <>
      <Field label="Días de prestación (al menos 15)" type="number" value={dias} onChange={editar(setDias)} help="Se permiten prestaciones superiores, por ejemplo 15.5 días. El valor inicial es 15." error={error} errorId={errorId} />
      <Field label="Fecha de ingreso" type="date" value={fecha} onChange={editar(setFecha)} help="Se supone que continúas hasta el 31 de diciembre de 2026. Para una salida anterior, consulta Finiquito." error={error} errorId={errorId} />
      {!fecha && <label><input type="checkbox" checked={confirmado} onChange={e=>editar(setConfirmado)(e.target.checked)} aria-describedby={error ? errorId : undefined} /> Confirmo que trabajé todo el año 2026.</label>}
      <p>El periodo incluye el día de ingreso y el 31 de diciembre. <a href="/calculadoras/finiquito">Consultar Finiquito</a></p>
    </>}
    <p id={errorId} role="alert" style={{color:'#b42318'}}>{error}</p>
    <Btn>{isISR ? 'Calcular ISR' : 'Calcular Aguinaldo'}</Btn>
    <div aria-live="polite" aria-atomic="true">
    {resultado && <ResultBox>{isISR ? <>
      <ResultLine label="ISR causado para este supuesto" value={fmt(resultado.causado)} />
      <ResultLine label="Subsidio aplicado" value={fmt(resultado.subsidio)} />
      <ResultLine label="ISR mensual estimado" value={fmt(resultado.retenido)} bold />
      <ResultLine label="Ingreso después de ISR, antes de otros descuentos" value={fmt(resultado.despuesISR)} bold />
      {resultado.soloMinimo && <Note>No se aplica retención bajo el supuesto declarado de percibir únicamente el salario mínimo general (art. 96 LISR).</Note>}
      <Note>No incluye IMSS ni otros descuentos. No es una declaración anual.</Note>
    </> : <>
      <ResultLine label="Salario diario" value={fmt(resultado.salarioDiario)} />
      <ResultLine label="Días de prestación" value={resultado.diasPrestacion} />
      <ResultLine label="Días del periodo incluido en 2026" value={resultado.diasPeriodo} />
      <ResultLine label="Aguinaldo bruto proyectado" value={fmt(resultado.bruto)} bold />
      <Note>La retención de ISR no está incluida. La revisión del bruto no certifica la exención fiscal.</Note>
    </>}</ResultBox>}
    </div>
  </form>;
}

function CalcRESICO() {
  const [ingresoMensual, setIngresoMensual] = useState('');
  const [result, setResult] = useState(null);

  const calcular = () => {
    const ing = parseFloat(ingresoMensual) || 0;
    if (ing <= 0) return;

    let tasa = 2.5;
    for (const r of RESICO_TASAS) {
      if (ing >= r.li && ing <= r.ls) { tasa = r.tasa; break; }
    }

    const isrResico = ing * (tasa / 100);
    const neto = ing - isrResico;

    setResult({
      ingreso: ing, tasa, isrResico, neto,
      anual: { ingreso: ing * 12, isr: isrResico * 12, neto: neto * 12 }
    });
  };

  return (
    <div>
      <p style={{color:'#5E6B78',marginBottom:20,fontSize:14,lineHeight:1.6}}>
        Calcula el ISR que pagarías bajo el Régimen Simplificado de Confianza (RESICO), disponible para personas físicas con ingresos anuales de hasta 3.5 millones de pesos. Las tasas aplicables van del 1% al 2.5% sobre tus ingresos efectivamente cobrados, conforme al Art. 113-E LISR.
      </p>
      <div style={styles.grid2}>
        <Field label="Ingresos del mes efectivamente cobrados, sin IVA ($)" value={ingresoMensual} onChange={setIngresoMensual} type="number" placeholder="Ej: 40000" />
      </div>
      <Btn onClick={calcular}>Calcular RESICO</Btn>
      {result && (
        <ResultBox>
          <ResultLine label="Ingreso mensual" value={fmt(result.ingreso)} />
          <ResultLine label="Tasa RESICO" value={fmtPct(result.tasa)} bold />
          <ResultLine label="ISR causado antes de retenciones" value={fmt(result.isrResico)} color="#A94442" />
          <ResultLine label="Ingreso menos ISR causado, antes de otros ajustes" value={fmt(result.neto)} bold color="#28735A" />
          <Note>RESICO aplica para personas físicas con ingresos anuales hasta $3,500,000 y ciertos requisitos de permanencia que esta calculadora no valida. El IVA se calcula aparte (hay actos gravados al 16%, al 0% y exentos, además de acreditamiento), así que no se incluye aquí.</Note>
        </ResultBox>
      )}
    </div>
  );
}

function CalcPTU() {
  const [utilidadesEmpresa, setUtilidadesEmpresa] = useState('');
  const [result, setResult] = useState(null);

  const calcular = () => {
    const util = parseFloat(utilidadesEmpresa) || 0;
    if (util <= 0) return;

    const repartoTotal = util * 0.10;

    setResult({ repartoTotal });
  };

  return (
    <div>
      <p style={{color:'#5E6B78',marginBottom:20,fontSize:14,lineHeight:1.6}}>
        Calcula el monto total que una empresa debe repartir por Participación de los Trabajadores en las Utilidades (PTU): el 10% de sus utilidades anuales, conforme a los artículos 117 al 131 de la Ley Federal del Trabajo.
      </p>
      <div style={styles.grid2}>
        <Field label="Renta gravable para PTU de la empresa ($)" value={utilidadesEmpresa} onChange={setUtilidadesEmpresa} type="number" placeholder="Ej: 5000000" />
      </div>
      <Btn onClick={calcular}>Calcular PTU</Btn>
      {result && (
        <ResultBox>
          <ResultLine label="10% de utilidades a repartir (PTU total)" value={fmt(result.repartoTotal)} bold color="#28735A" />
          <Note>Esta calculadora solo obtiene el monto total a repartir entre todos los trabajadores (10% de las utilidades). No calcula la parte individual que le corresponde a cada trabajador: eso depende de los días trabajados y el salario de cada persona en relación con los de toda la plantilla (Art. 123 LFT), además de un tope de 3 meses de salario o el promedio de la PTU de los últimos 3 años, lo que sea más favorable para el trabajador. Consulta con el área de Recursos Humanos o Nóminas de tu empresa para el monto individual que te corresponde.</Note>
        </ResultBox>
      )}
    </div>
  );
}

function CalcBrutoNeto() { return <CalculoSuspendido id="bruto-neto" />; }

function CalcBrutoNetoPendiente() {
  const [salarioMensual, setSalarioMensual] = useState('');
  const [result, setResult] = useState(null);

  const calcular = () => {
    const sm = parseFloat(salarioMensual) || 0;
    if (sm <= 0) return;

    const sd = sm / 30;
    const isrMensual = calcISRMensual(sm);
    // Cuota obrera IMSS 2026 sobre SBC (aproximado aquí con el salario bruto):
    // 0.25% (EyM dinero) + 0.375% (EyM especie pensionados) + 0.625% (Invalidez y Vida)
    // + 1.125% (Cesantía y Vejez) = 2.375% fijo, más 0.40% sobre el excedente de SBC por
    // encima de 3 UMA mensuales (Enfermedades y Maternidad, excedente)
    const topeExcedente = UMA_MENSUAL * 3;
    const imssObrero = (sm * 0.02375) + (Math.max(sm - topeExcedente, 0) * 0.004);
    const totalDeducciones = isrMensual + imssObrero;
    const neto = sm - totalDeducciones;

    // Prestaciones anuales
    const aguinaldo = sd * 15;
    const vacDias = 12; // primer año
    const primaVac = sd * vacDias * 0.25;

    const ingresoAnualTotal = (sm * 12) + aguinaldo + primaVac;
    const isrAnual = isrMensual * 12;
    const imssAnual = imssObrero * 12;

    setResult({
      bruto: sm, isrMensual, imssObrero, totalDeducciones, neto,
      sd, aguinaldo, primaVac,
      ingresoPorHora: neto / 173.33, // 40 hrs/sem promediadas a un mes de 4.33 semanas
      ingresoAnualTotal, isrAnual, imssAnual,
      netoAnual: ingresoAnualTotal - isrAnual - imssAnual,
      tasaRetencion: (totalDeducciones / sm) * 100
    });
  };

  return (
    <div>
      <p style={{color:'#5E6B78',marginBottom:20,fontSize:14,lineHeight:1.6}}>
        Convierte tu salario bruto a neto y conoce cuánto recibirás realmente después de las retenciones de ISR y de la cuota obrera del IMSS.
      </p>
      <div style={styles.grid2}>
        <Field label="Salario mensual bruto ($)" value={salarioMensual} onChange={setSalarioMensual} type="number" placeholder="Ej: 30000" />
      </div>
      <Btn onClick={calcular}>Calcular Bruto a Neto</Btn>
      {result && (
        <ResultBox>
          <ResultLine label="Salario bruto mensual" value={fmt(result.bruto)} />
          <ResultLine label="ISR retenido" value={`- ${fmt(result.isrMensual)}`} color="#A94442" />
          <ResultLine label="Cuota IMSS obrera estimada" value={`- ${fmt(result.imssObrero)}`} color="#A94442" />
          <Divider />
          <ResultLine label="Sueldo neto mensual" value={fmt(result.neto)} bold color="#28735A" />
          <ResultLine label="Ingreso por hora (40 hrs/sem)" value={fmt(result.ingresoPorHora)} />
          <ResultLine label="Te retienen del total" value={fmtPct(result.tasaRetencion)} />
          <Divider />
          <div style={{marginBottom:8,fontWeight:600,color:'#5E6B78',fontSize:13}}>Ingreso anual (con prestaciones)</div>
          <ResultLine label="12 meses de sueldo" value={fmt(result.bruto * 12)} />
          <ResultLine label="+ Aguinaldo (15 días)" value={fmt(result.aguinaldo)} />
          <ResultLine label="+ Prima vacacional" value={fmt(result.primaVac)} />
          <ResultLine label="Ingreso anual bruto total" value={fmt(result.ingresoAnualTotal)} bold />
          <Note>La cuota IMSS se calcula sobre tu salario bruto para simplificar; el IMSS en realidad la calcula sobre tu Salario Base de Cotización (SBC), que puede ser distinto. El resultado es una aproximación cercana, no un recibo de nómina exacto.</Note>
        </ResultBox>
      )}
    </div>
  );
}

function CalcVacaciones() {
  const [aniosTrabajados, setAniosTrabajados] = useState('');
  const [salarioMensual, setSalarioMensual] = useState('');
  const [result, setResult] = useState(null);

  const calcular = () => {
    const anios = parseInt(aniosTrabajados) || 0;
    const sm = parseFloat(salarioMensual) || 0;
    if (anios <= 0) return;

    const sd = sm / 30;
    const dias = getVacDias(anios);
    const pagoVac = sd * dias;
    const primaVac = pagoVac * 0.25;

    // Tabla completa
    const tabla = [];
    for (let i = 1; i <= Math.max(anios + 5, 10); i++) {
      tabla.push({ anio: i, dias: getVacDias(i) });
    }

    setResult({ anios, dias, sd, pagoVac, primaVac, total: pagoVac + primaVac, tabla });
  };

  return (
    <div>
      <p style={{color:'#5E6B78',marginBottom:20,fontSize:14,lineHeight:1.6}}>
        Consulta cuántos días de vacaciones te corresponden de acuerdo con tu antigüedad en la empresa, conforme a la reforma de Vacaciones Dignas de 2023 (Art. 76 LFT).
      </p>
      <div style={styles.grid2}>
        <Field label="Años trabajados en la empresa" value={aniosTrabajados} onChange={setAniosTrabajados} type="number" placeholder="Ej: 3" />
        <Field label="Salario mensual (opcional, para calcular prima)" value={salarioMensual} onChange={setSalarioMensual} type="number" placeholder="Ej: 20000" />
      </div>
      <Btn onClick={calcular}>Consultar</Btn>
      {result && (
        <ResultBox>
          <ResultLine label={`Con ${result.anios} año(s) de antigüedad`} value={`${result.dias} días de vacaciones`} bold color="#28735A" />
          {result.sd > 0 && (
            <>
              <Divider />
              <ResultLine label="Valor salarial del periodo vacacional" value={fmt(result.pagoVac)} />
              <ResultLine label="Prima vacacional (25%)" value={fmt(result.primaVac)} />
              <ResultLine label="Valor del periodo + prima" value={fmt(result.total)} bold color="#28735A" />
            </>
          )}
          <Divider />
          <div style={{marginBottom:8,fontWeight:600,color:'#5E6B78',fontSize:13}}>Tabla de vacaciones LFT 2026</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))',gap:4}}>
            {result.tabla.map(t => (
              <div key={t.anio} style={{
                padding:'6px 8px',fontSize:12,borderRadius:6,
                background: t.anio === result.anios ? '#28735A' : '#f1f5f9',
                color: t.anio === result.anios ? 'white' : '#475569',
                textAlign:'center'
              }}>
                Año {t.anio}: <strong>{t.dias}d</strong>
              </div>
            ))}
          </div>
        </ResultBox>
      )}
    </div>
  );
}

function CalcInfonavit() {
  const [montoCredito, setMontoCredito] = useState('');
  const [tasaAnual, setTasaAnual] = useState('10.45');
  const [plazoAnios, setPlazoAnios] = useState('20');
  const [result, setResult] = useState(null);
  const [verTabla, setVerTabla] = useState(false);
  const [vistaAnual, setVistaAnual] = useState(true);

  const calcular = () => {
    const monto = parseFloat(montoCredito) || 0;
    const tasa = parseFloat(tasaAnual) || 0;
    const plazo = parseInt(plazoAnios) || 0;
    if (monto <= 0 || plazo <= 0 || tasa < 0) return;

    const tasaMensual = tasa / 100 / 12;
    const numPagos = plazo * 12;
    const pagoBase = tasaMensual === 0
      ? monto / numPagos
      : monto * (tasaMensual * Math.pow(1 + tasaMensual, numPagos)) / (Math.pow(1 + tasaMensual, numPagos) - 1);

    const tablaMensual = [];
    let saldo = monto;
    for (let mes = 1; mes <= numPagos; mes++) {
      const interes = saldo * tasaMensual;
      let capital = pagoBase - interes;
      let pagoFila = pagoBase;
      if (mes === numPagos) {
        // Ajuste del último pago para liquidar el saldo exacto (evita residuo por redondeo)
        capital = saldo;
        pagoFila = capital + interes;
      }
      saldo = Math.max(saldo - capital, 0);
      tablaMensual.push({ mes, pago: pagoFila, interes, capital, saldo });
    }

    const pagoMensual = pagoBase;
    const totalPagado = tablaMensual.reduce((s, f) => s + f.pago, 0);
    const totalIntereses = totalPagado - monto;

    const tablaAnual = [];
    for (let anio = 1; anio <= plazo; anio++) {
      const filasAnio = tablaMensual.slice((anio - 1) * 12, anio * 12);
      tablaAnual.push({
        anio,
        pago: filasAnio.reduce((s, f) => s + f.pago, 0),
        interes: filasAnio.reduce((s, f) => s + f.interes, 0),
        capital: filasAnio.reduce((s, f) => s + f.capital, 0),
        saldo: filasAnio[filasAnio.length - 1].saldo
      });
    }

    setVerTabla(false);
    setResult({
      monto, tasa, plazo, pagoMensual, totalPagado, totalIntereses,
      porcentajeIntereses: (totalIntereses / monto) * 100,
      tablaMensual, tablaAnual
    });
  };

  return (
    <div>
      <p style={{color:'#5E6B78',marginBottom:20,fontSize:14,lineHeight:1.6}}>
        Estima el pago mensual de capital e intereses de un crédito con las condiciones que ingreses. No incluye seguros, cuotas ni aportaciones patronales. Consulta tu contrato o Mi Cuenta Infonavit para tu monto real.
      </p>
      <div style={styles.grid2}>
        <Field label="Monto del crédito ($)" value={montoCredito} onChange={setMontoCredito} type="number" placeholder="Ej: 800000" />
        <Field label="Tasa anual (%)" value={tasaAnual} onChange={setTasaAnual} type="number" placeholder="10.45" />
        <Field label="Plazo (años)" value={plazoAnios} onChange={setPlazoAnios} type="number" placeholder="20" />
      </div>
      <Btn onClick={calcular}>Simular Crédito</Btn>
      {result && (
        <ResultBox>
          <ResultLine label="Monto del crédito" value={fmt(result.monto)} />
          <ResultLine label="Tasa anual" value={fmtPct(result.tasa)} />
          <ResultLine label={`Plazo: ${result.plazo} años (${result.plazo * 12} pagos)`} value="" />
          <Divider />
          <ResultLine label="Pago estimado (capital + interés)" value={fmt(result.pagoMensual)} bold color="#28735A" />
          <Divider />
          <ResultLine label="Total estimado (capital + intereses)" value={fmt(result.totalPagado)} bold />
          <ResultLine label="Total solo en intereses" value={fmt(result.totalIntereses)} color="#A94442" />
          <ResultLine label="Pagarás de intereses" value={fmtPct(result.porcentajeIntereses) + " del crédito"} bold color="#A94442" />
          <Note>Esta es una simulación financiera de amortización de capital e intereses, no un cálculo oficial de Infonavit. No incluye seguros, cuotas, aportaciones patronales ni condiciones particulares de tu crédito (VSM, pesos, puntos Infonavit, tasa según tu nivel salarial). Consulta tu contrato o Mi Cuenta Infonavit para tu pago real.</Note>

          <button onClick={() => setVerTabla(v => !v)} className="ml-btn" style={{
            width:'100%',marginTop:16,padding:'10px 16px',background:'#faf7f0',
            border:'1px solid #e8dcc3',borderRadius:10,color:'#92400e',fontSize:13,
            fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',
            justifyContent:'center',gap:6
          }}>
            {verTabla ? '▲ Ocultar tabla de amortización' : '▼ Ver tabla de amortización'}
          </button>

          {verTabla && (
            <div className="ml-result" style={{marginTop:12}}>
              <div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:10}}>
                <button onClick={() => setVistaAnual(true)} style={{
                  padding:'5px 14px',borderRadius:20,fontSize:12,fontWeight:600,cursor:'pointer',
                  border: vistaAnual ? '1px solid #b45309' : '1px solid #e2e8f0',
                  background: vistaAnual ? '#b45309' : 'white',
                  color: vistaAnual ? 'white' : '#5E6B78'
                }}>Por año</button>
                <button onClick={() => setVistaAnual(false)} style={{
                  padding:'5px 14px',borderRadius:20,fontSize:12,fontWeight:600,cursor:'pointer',
                  border: !vistaAnual ? '1px solid #b45309' : '1px solid #e2e8f0',
                  background: !vistaAnual ? '#b45309' : 'white',
                  color: !vistaAnual ? 'white' : '#5E6B78'
                }}>Por mes</button>
              </div>
              <div style={{maxHeight:320,overflowY:'auto',border:'1px solid #ece2cb',borderRadius:10}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                  <thead>
                    <tr style={{position:'sticky',top:0,background:'#faf7f0',boxShadow:'0 1px 0 #e8dcc3'}}>
                      <th style={{padding:'8px 10px',textAlign:'left',color:'#475569',fontWeight:600}}>{vistaAnual ? 'Año' : 'Mes'}</th>
                      <th style={{padding:'8px 10px',textAlign:'right',color:'#475569',fontWeight:600}}>Interés</th>
                      <th style={{padding:'8px 10px',textAlign:'right',color:'#475569',fontWeight:600}}>Capital</th>
                      <th style={{padding:'8px 10px',textAlign:'right',color:'#475569',fontWeight:600}}>Saldo restante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(vistaAnual ? result.tablaAnual : result.tablaMensual).map((fila, i) => (
                      <tr key={i} style={{borderTop:'1px solid #f3efe6', background: i % 2 ? '#faf8f4' : 'white'}}>
                        <td style={{padding:'7px 10px',color:'#13263B'}}>{vistaAnual ? fila.anio : fila.mes}</td>
                        <td style={{padding:'7px 10px',textAlign:'right',color:'#A94442'}}>{fmt(fila.interes)}</td>
                        <td style={{padding:'7px 10px',textAlign:'right',color:'#28735A'}}>{fmt(fila.capital)}</td>
                        <td style={{padding:'7px 10px',textAlign:'right',color:'#13263B',fontWeight:600}}>{fmt(fila.saldo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </ResultBox>
      )}
    </div>
  );
}

function CalcPension() {
  const [edad, setEdad] = useState('');
  const [semanasCotizadas, setSemanasCotizadas] = useState('');
  const [result, setResult] = useState(null);

  const calcular = () => {
    const ed = parseInt(edad) || 0;
    const sc = parseInt(semanasCotizadas) || 0;
    if (ed <= 0) return;

    // Ley 97 (AFORE) — la mayoría de trabajadores actuales
    const minSemanas = 875; // 2026, sube gradualmente hasta 1000 en 2031
    const cumpleMinimo = sc >= minSemanas;
    const tipoRetiro = ed >= 65 ? 'vejez' : (ed >= 60 ? 'cesantia' : null);

    // Nota: el monto de la pensión (AFORE o "pensión garantizada", Art. 170 LSS)
    // NO se calcula aquí a propósito. Depende del saldo real acumulado en tu
    // AFORE (aportaciones, rendimientos, comisiones) o de una tabla oficial de
    // dos entradas (semanas cotizadas × salario promedio en UMAs) que se
    // actualiza cada febrero con el INPC — no es algo que una fórmula simple
    // de una sola variable pueda aproximar con responsabilidad.

    setResult({
      sc, minSemanas, cumpleMinimo,
      faltanSemanas: Math.max(minSemanas - sc, 0),
      edad: ed,
      tipoRetiro,
    });
  };

  return (
    <div>
      <p style={{color:'#5E6B78',marginBottom:20,fontSize:14,lineHeight:1.6}}>
        Revisa si cumples los requisitos generales de edad y semanas cotizadas para pensionarte bajo el esquema de Ley 97 (AFORE). En 2026 se requiere un mínimo de 875 semanas cotizadas.
      </p>
      <div style={styles.grid2}>
        <Field label="Tu edad actual" value={edad} onChange={setEdad} type="number" placeholder="Ej: 35" />
        <Field label="Semanas cotizadas en IMSS" value={semanasCotizadas} onChange={setSemanasCotizadas} type="number" placeholder="Ej: 520" />
      </div>
      <Btn onClick={calcular}>Revisar Requisitos</Btn>
      {result && (
        <ResultBox>
          <ResultLine label="Semanas cotizadas" value={result.sc} />
          <ResultLine label={`Mínimo requerido (2026)`} value={`${result.minSemanas} semanas`} />
          <ResultLine label="¿Cumples el mínimo de semanas?" value={result.cumpleMinimo ? '✅ Sí' : `❌ Faltan ${result.faltanSemanas} semanas`} color={result.cumpleMinimo ? '#28735A' : '#A94442'} />
          <Divider />
          <ResultLine label="Tipo de retiro según tu edad" value={
            result.tipoRetiro === 'vejez' ? 'Vejez (65 años o más)' :
            result.tipoRetiro === 'cesantia' ? 'Cesantía en edad avanzada (60 a 64 años)' :
            'Aún no alcanzas la edad mínima (60 años)'
          } bold />
          <div style={{marginTop:12,padding:'12px 14px',background:'#f1f5f9',borderRadius:10,fontSize:13,color:'#475569',lineHeight:1.5}}>
            <strong>Pensión garantizada:</strong> no incluida aquí. Depende de las semanas cotizadas y del salario promedio en UMAs durante tu vida laboral (tabla oficial, Art. 170 LSS): no es un monto fijo.
          </div>
          <Note>Esta calculadora solo revisa los requisitos generales de edad y semanas cotizadas del régimen de Ley 97. No estima el monto de tu pensión ni el saldo de tu AFORE: eso depende de tu historial real de aportaciones, rendimientos y comisiones. Consulta tu estado de cuenta en AFORE o el simulador oficial del IMSS/CONSAR para una proyección de tu pensión.</Note>
        </ResultBox>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES UI
// ═══════════════════════════════════════════════════════════════

function CalculoSuspendido({ id }) {
  return <div role="status"><p>{regulatoryData.calculators[id].reviewReason}</p><p>La generación de importes está suspendida mientras corregimos estos puntos. Puedes consultar el alcance y las fuentes a continuación.</p><button disabled>Importes en revisión</button></div>;
}

function Field({ label, value, onChange, type = 'text', placeholder = '', help, error, errorId }) {
  const id = useId();
  return (
    <div style={{marginBottom:12}}>
      <label htmlFor={id} style={{display:'block',fontSize:13,fontWeight:500,color:'var(--ml-slate-600)',marginBottom:6}}>{label}</label>
      <input
        id={id}
        aria-describedby={[help ? `${id}-help` : null, error ? errorId : null].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? true : undefined}
        step={type === 'number' ? 'any' : undefined}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width:'100%',padding:'12px 14px',border:'2px solid var(--ml-slate-200)',borderRadius:'var(--ml-radius-input)',
          fontSize:15,background:'var(--ml-blue-50)',transition:'border 0.2s',outline:'none',
          boxSizing:'border-box'
        }}
        onFocus={e => e.target.style.borderColor = 'var(--ml-blue-600)'}
        onBlur={e => e.target.style.borderColor = 'var(--ml-slate-200)'}
      />
      {help && <p id={`${id}-help`} style={{fontSize:14}}>{help}</p>}
    </div>
  );
}

function Btn({ onClick, children }) {
  return (
    <button onClick={onClick} className="ml-btn" style={{
      width:'100%',padding:'14px 24px',background:'linear-gradient(135deg,var(--ml-blue-600),var(--ml-blue-700))',
      color:'white',border:'none',borderRadius:'var(--ml-radius-control)',fontSize:16,fontWeight:600,
      cursor:'pointer',marginTop:8,marginBottom:16,transition:'transform 0.1s',
      boxShadow:'var(--ml-shadow-btn)'
    }}
    onMouseDown={e => e.target.style.transform = 'scale(0.98)'}
    onMouseUp={e => e.target.style.transform = 'scale(1)'}
    >
      {children}
    </button>
  );
}

function ResultBox({ children }) {
  const compartirWhatsApp = () => {
    const texto = encodeURIComponent('Acabo de calcular mis finanzas gratis en MiLana 💰 Pruébalo tú también: https://www.milanaaqui.mx');
    window.open(`https://wa.me/?text=${texto}`, '_blank', 'noopener,noreferrer');
  };
  return (
    <div className="ml-result" style={{
      background:'var(--ml-blue-50)',border:'1px solid var(--ml-blue-100)',borderRadius:'var(--ml-radius-card)',boxShadow:'var(--ml-shadow-card)',
      padding:20,marginTop:8
    }}>
      {children}
      <button onClick={compartirWhatsApp} style={{
        width:'100%',marginTop:16,padding:'10px 16px',background:'var(--ml-green-50)',
        border:'1px solid #bbf7d0',borderRadius:'var(--ml-radius-input)',color:'var(--ml-green-600)',fontSize:13,
        fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',
        justifyContent:'center',gap:6
      }}>
        📲 Compartir por WhatsApp
      </button>
    </div>
  );
}

function ResultLine({ label, value, bold, color }) {
  return (
    <div style={{
      display:'flex',justifyContent:'space-between',alignItems:'center',
      padding: bold ? '10px 0' : '8px 0',borderBottom:'1px solid var(--ml-blue-100)',
      fontSize:14
    }}>
      <span style={{color:'var(--ml-slate-600)',flex:1,fontSize:bold?13:14}}>{label}</span>
      <span style={{fontWeight: bold ? 700 : 500, fontSize: bold ? 17 : 14, color: color || 'var(--ml-slate-900)', textAlign:'right'}}>
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div style={{borderTop:'2px dashed var(--ml-blue-100)',margin:'12px 0'}} />;
}

// Desplegable nativo (<details>/<summary>), especificación acordada con GPT:
// cerrado por defecto, chevron que gira, sin sombra, separador superior sutil.
function Details({ summary, children }) {
  return (
    <details className="ml-details">
      <summary className="ml-details-summary">
        <span>{summary}</span>
        <svg className="ml-details-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
      </summary>
      <div className="ml-details-body">{children}</div>
    </details>
  );
}

// La primera oración se muestra siempre (suele ser la aclaración esencial para
// interpretar el resultado); el resto queda en "Supuestos y límites", cerrado
// hasta que la persona quiera leerlo. Así el resultado no arrastra un bloque
// de texto largo que casi nadie baja a leer.
function Note({ children }) {
  const texto = typeof children === 'string' ? children : '';
  const corte = texto.indexOf('. ');
  const esencial = corte === -1 ? texto : texto.slice(0, corte + 1);
  const resto = corte === -1 ? '' : texto.slice(corte + 2).trim();

  return (
    <div style={{marginTop:14}}>
      <p style={{fontSize:13,color:'var(--ml-slate-600)',lineHeight:1.5,margin:0}}>{esencial}</p>
      {resto && <Details summary="Supuestos y límites">{resto}</Details>}
    </div>
  );
}

const FICHA_ICONOS = {
  verified: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
  ),
  'needs-review': () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
  ),
  blocked: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  ),
};

const FICHA_ESTILOS = {
  verified: { label: 'Verificado', status: '#18794e', bg: '#edf8f2', border: '#b7e4cc', lastLabel: 'Última verificación', closing: 'Fuentes y fundamento revisados para el periodo indicado.' },
  'needs-review': { label: 'Pendiente de verificación', status: '#8a5a00', bg: '#fff8e6', border: '#efd99b', lastLabel: 'Última revisión', closing: 'La base normativa de este cálculo aún está en proceso de verificación.' },
  blocked: { label: 'Cálculo en revisión', status: '#b42318', bg: '#fff1f0', border: '#f1b8b3', lastLabel: 'Revisión del cálculo', closing: 'Este cálculo está en revisión y sus resultados pueden cambiar.' },
};

function FichaConfianza({ id }) {
  const data=regulatoryData.calculators[id];
  if (!data) return null;
  const primary=(data.sources||[]).filter(s=>s.url && s.document && s.reference);
  const complete=data.calculationReviewedAt && data.verificationScope && primary.length && data.referenceCases?.length;
  const verified=data.verificationStatus==='verified' && complete;
  const label=verified ? 'Cálculo revisado para el alcance indicado' : data.publicLabel || 'Revisión parcial';
  return <section style={{marginTop:18}} aria-label="Estado de revisión">
    <p style={{fontWeight:600,color:verified?'#18794e':'#8a5a00'}}>{label}</p>
    <p>{data.reviewReason}</p>
    <Details summary="Alcance, revisión y fuentes">
      <p><strong>Alcance:</strong> {data.verificationScope}</p>
      <p><strong>Periodo:</strong> {data.period}</p>
      <p><strong>Consulta de fuentes:</strong> {data.sourceCheckedAt || 'Pendiente de comprobación completa'}</p>
      <p><strong>Revisión del cálculo:</strong> {data.calculationReviewedAt || 'Pendiente; no equivale a la fecha de consulta de fuentes'}</p>
      <ul>{(data.sources||[]).map((s,i)=><li key={i}>{s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.institution}: {s.document}</a> : `${s.institution}: ${s.document}`} {s.reference && `(${s.reference})`}</li>)}</ul>
      <p><strong>Revisar nuevamente:</strong> {data.nextReview}</p>
      <p>Información orientativa; no determina un derecho individual ni sustituye asesoría profesional.</p>
    </Details>
  </section>;
}

// Iconos de línea para las calculadoras (sustituyen los emojis), especificación
// acordada con GPT: trazo 1.75, viewBox 24x24, color currentColor (--ml-blue-600),
// contenedor 44x44 con fondo --ml-blue-50 y radio 12px, decorativos (aria-hidden).
const CALC_ICON_PATHS = {
  finiquito: (
    <>
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v4h4" />
      <path d="M9 14.5l2 2 4-4.5" />
    </>
  ),
  liquidacion: (
    <>
      <path d="M12 3v18" />
      <path d="M7 7h10" />
      <path d="M7 7l-3 6a3 3 0 0 0 6 0z" />
      <path d="M17 7l-3 6a3 3 0 0 0 6 0z" />
      <path d="M9 21h6" />
    </>
  ),
  aguinaldo: (
    <>
      <rect x="3" y="9" width="18" height="12" rx="1.5" />
      <path d="M3 13h18" />
      <path d="M12 9v12" />
      <path d="M12 9H8.5a2.25 2.25 0 0 1 0-4.5C11 4.5 12 9 12 9z" />
      <path d="M12 9h3.5a2.25 2.25 0 0 0 0-4.5C13 4.5 12 9 12 9z" />
    </>
  ),
  isr: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7.5h8" />
      <circle cx="8.2" cy="12.2" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12.2" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="15.8" cy="12.2" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="8.2" cy="16" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="16" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="15.8" cy="16" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  resico: (
    <>
      <rect x="3.5" y="8" width="17" height="12" rx="1.5" />
      <path d="M8.5 8V6.5A1.5 1.5 0 0 1 10 5h4a1.5 1.5 0 0 1 1.5 1.5V8" />
      <path d="M3.5 13h17" />
    </>
  ),
  ptu: (
    <>
      <circle cx="8.5" cy="7.5" r="2.5" />
      <circle cx="16" cy="8.5" r="2" />
      <path d="M4 20v-1.5A3.5 3.5 0 0 1 7.5 15h2A3.5 3.5 0 0 1 13 18.5V20" />
      <path d="M15 20v-1a3 3 0 0 1 3-3h.3a2.7 2.7 0 0 1 2.7 2.7V20" />
    </>
  ),
  'bruto-neto': (
    <>
      <path d="M4 8h12" />
      <path d="M13 4l3 4-3 4" />
      <path d="M20 16H8" />
      <path d="M11 12l-3 4 3 4" />
    </>
  ),
  vacaciones: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v3M12 18.5v3M4.7 4.7l2.1 2.1M17.2 17.2l2.1 2.1M2.5 12h3M18.5 12h3M4.7 19.3l2.1-2.1M17.2 6.8l2.1-2.1" />
    </>
  ),
  infonavit: (
    <>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  pension: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
      <path d="M4.5 6.3A8.5 8.5 0 1 1 3.5 12" />
      <path d="M3.5 8.3V12h3.6" />
    </>
  ),
};

function CalculatorIcon({ id }) {
  const content = CALC_ICON_PATHS[id];
  if (!content) return null;
  return (
    <span style={{
      width: 44, height: 44, minWidth: 44, borderRadius: 12, background: 'var(--ml-blue-50)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ml-blue-600)'
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {content}
      </svg>
    </span>
  );
}

// Piloto de heroes visuales (Fase 2): solo Inicio + 3 calculadoras.
// Las otras 7 calculadoras conservan el header de ícono (Fase 3 pendiente).
// Anchos generados por scripts/generar-imagenes.py. Si cambian ahi, cambian aqui.
//
// Aqui estaba la causa real de que las fotos se vieran suaves: los masters
// eran de 1000 px y este arreglo tampoco pedia mas de 1000, asi que una
// pantalla retina de escritorio recibia esa imagen y la estiraba al doble.
// Con masters de 4000-6000 px, el srcset ya puede llegar a 2400.
const ANCHOS_IMAGEN = [480, 768, 1024, 1440, 1920, 2400];

// Entrega a cada pantalla la resolucion que le toca, en WebP con respaldo JPEG.
// Antes se servia siempre el mismo JPG de 1000 px y en pantallas retina el
// navegador lo estiraba: por eso las fotos se veian suaves.
const ANCHOS_MOVIL_IMAGEN = [480, 768, 1024, 1440];

// Punto focal y fuente movil por foto. Vienen de datos, no de CSS global:
// donde esta el sujeto cambia en cada imagen.
const FOTOS = catalogoFotos.fotos;

function Foto({ name, alt = '', sizes, className, eager = false, focal, movil }) {
  const srcset = (base, anchos, ext) =>
    anchos.map(w => `/images/gen/${base}-${w}.${ext} ${w}w`).join(', ');
  // El src es solo el respaldo para navegadores que ignoran srcset: no
  // conviene que sea la variante mas pesada.
  const respaldo = 1440;
  return (
    <picture className={className}>
      {/* Cuatro fotos conservan su master vertical original: en una franja
          de 230px a 100vw el recorte 3:2 de escritorio pierde demasiado. */}
      {movil && (
        <source
          media="(max-width: 640px)"
          type="image/webp"
          srcSet={srcset(movil, ANCHOS_MOVIL_IMAGEN, 'webp')}
          sizes="100vw"
        />
      )}
      {movil && (
        <source
          media="(max-width: 640px)"
          srcSet={srcset(movil, ANCHOS_MOVIL_IMAGEN, 'jpg')}
          sizes="100vw"
        />
      )}
      <source type="image/webp" srcSet={srcset(name, ANCHOS_IMAGEN, 'webp')} sizes={sizes} />
      <img
        src={`/images/gen/${name}-${respaldo}.jpg`}
        srcSet={srcset(name, ANCHOS_IMAGEN, 'jpg')}
        sizes={sizes}
        alt={alt}
        aria-hidden={alt ? undefined : 'true'}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        style={focal ? { objectPosition: focal } : undefined}
      />
    </picture>
  );
}

function Articulo({ id }) {
  const [abierto, setAbierto] = useState(false);
  const data = articulos[id];
  if (!data) return null;
  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #edf0f4' }}>
      <button
        onClick={() => setAbierto(v => !v)}
        style={{
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          color: 'var(--ml-blue-600)', fontSize: 13, fontWeight: 600, display: 'flex',
          alignItems: 'center', gap: 6
        }}
      >
        {abierto ? '▾' : '▸'} {data.titulo}
      </button>
      {abierto && (
        <div style={{ marginTop: 12 }}>
          {data.parrafos.map((p, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ml-blue-700)', margin: '0 0 6px 0' }}>{p.subtitulo}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--ml-slate-600)', margin: 0 }}>{p.texto}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CONTENIDO EDITORIAL POR CALCULADORA (Fase 6)
//
// Lo escribe ChatGPT y vive en src/data/contenido-calculadoras.json.
// El orden lo fijo el propio plan: proposito -> calculadora ->
// interpretacion -> que significa -> metodologia -> supuestos ->
// fundamento -> preguntas frecuentes -> siguiente decision.
//
// Por eso son DOS componentes: <Proposito> va arriba de la
// calculadora y <ContenidoCalculadora> abajo. Si una calculadora
// todavia no tiene contenido, ambos devuelven null y la pagina se
// ve exactamente como antes.
// ═══════════════════════════════════════════════════════════════

const TITULOS_SECCION = {
  interpretacion: 'Cómo leer tu resultado',
  significado: 'Qué significa esto para ti',
  metodologia: 'Cómo se calcula',
  supuestos: 'Supuestos y límites',
  fundamento: 'Fundamento y fuentes',
};

const ORDEN_SECCIONES = ['interpretacion', 'significado', 'metodologia', 'supuestos', 'fundamento'];

function Proposito({ id }) {
  const data = contenidoCalc[id];
  if (!data || !data.proposito) return null;
  // Desde la Fase 8 el proposito forma parte del encabezado editorial y su
  // tipografia la fija .calculator-purpose en design-home.css.
  return <p className="calculator-purpose">{data.proposito}</p>;
}

function Seccion({ titulo, children }) {
  return (
    <section style={{ marginTop: 26 }}>
      <h2 style={{
        fontFamily: '"Newsreader", Georgia, serif', fontSize: 19, fontWeight: 600,
        color: 'var(--ml-ink, #13263B)', margin: '0 0 8px 0', letterSpacing: '-.02em'
      }}>{titulo}</h2>
      {children}
    </section>
  );
}

function Pregunta({ pregunta, respuesta }) {
  const [abierta, setAbierta] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--ml-border, #edf0f4)' }}>
      <button
        type="button"
        onClick={() => setAbierta(v => !v)}
        aria-expanded={abierta}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '12px 0', textAlign: 'left', display: 'flex', gap: 10,
          alignItems: 'flex-start', fontFamily: 'inherit', fontSize: 14,
          fontWeight: 600, color: 'var(--ml-ink, #13263B)', lineHeight: 1.5
        }}
      >
        <span aria-hidden="true" style={{ color: 'var(--ml-blue, #2D6CAA)', flexShrink: 0 }}>
          {abierta ? '−' : '+'}
        </span>
        <span>{pregunta}</span>
      </button>
      {abierta && (
        <p style={{
          margin: '0 0 14px 24px', fontSize: 13.5, lineHeight: 1.7,
          color: 'var(--ml-slate-600, #4A5A6B)'
        }}>{respuesta}</p>
      )}
    </div>
  );
}

function ContenidoCalculadora({ id, ir }) {
  const data = contenidoCalc[id];
  if (!data) return null;
  const parrafo = {
    fontSize: 13.5, lineHeight: 1.75, color: 'var(--ml-slate-600, #4A5A6B)', margin: 0
  };
  return (
    <div style={{ marginTop: 30, paddingTop: 24, borderTop: '1px solid var(--ml-border, #edf0f4)' }}>
      {ORDEN_SECCIONES.filter(k => data[k]).map(k => (
        <Seccion key={k} titulo={TITULOS_SECCION[k]}>
          <p style={parrafo}>{data[k]}</p>
        </Seccion>
      ))}

      {Array.isArray(data.faq) && data.faq.length > 0 && (
        <Seccion titulo="Preguntas frecuentes">
          <div>
            {data.faq.map((f, i) => (
              <Pregunta key={i} pregunta={f.pregunta} respuesta={f.respuesta} />
            ))}
          </div>
        </Seccion>
      )}

      {Array.isArray(data.siguientes) && data.siguientes.length > 0 && (
        <Seccion titulo="Qué revisar después">
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
            {data.siguientes.map((s, i) => (
              <li key={i}>
                <a
                  href={rutaDe(s.destino)}
                  onClick={(e) => { if (ir) { e.preventDefault(); ir(s.destino); } }}
                  style={{
                    display: 'flex', gap: 10, alignItems: 'center',
                    padding: '12px 14px', borderRadius: 12,
                    border: '1px solid var(--ml-border, #edf0f4)',
                    background: 'var(--ml-ivory, #FBF8F2)',
                    color: 'var(--ml-blue, #2D6CAA)', textDecoration: 'none',
                    fontSize: 13.5, fontWeight: 600, lineHeight: 1.5
                  }}
                >
                  <span aria-hidden="true">→</span>
                  <span>{s.texto}</span>
                </a>
              </li>
            ))}
          </ul>
        </Seccion>
      )}

      <p style={{
        marginTop: 22, fontSize: 12, lineHeight: 1.6,
        color: 'var(--ml-soft, #7A8794)'
      }}>
        MiLana es informativo y no sustituye asesoría profesional sobre tu caso particular.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RUTAS DE SITUACION (Fase 7)
//
// Un solo componente para las tres: el contenido vive en
// src/data/situaciones.json y aqui solo se dibuja, en el orden que
// fijo ChatGPT: hero, que necesitas resolver, explicacion editorial,
// ruta de decision, herramientas, antes de decidir, lecturas,
// confianza y siguiente ruta.
//
// Todo son enlaces normales y texto renderizado, no un cuestionario:
// un rastreador debe poder leer la pagina entera y seguir cada
// enlace sin ejecutar nada.
// ═══════════════════════════════════════════════════════════════

function SituationHub({ situacion, ir, irASituacion }) {
  const s = situacion;
  const calcDe = (id) => CALCULADORAS.find((c) => c.id === id);

  const enlaceDecision = (d) =>
    d.ancla ? `#${d.ancla}` : rutaDe(d.destino);

  const clicDecision = (e, d) => {
    if (d.ancla) return; // el ancla la maneja el navegador
    e.preventDefault();
    ir(d.destino);
  };

  const tarjetaHerramienta = (id) => {
    const c = calcDe(id);
    if (!c) return null;
    return (
      <a
        key={id}
        href={rutaDe(id)}
        onClick={(e) => { e.preventDefault(); ir(id); }}
        style={{
          display: 'flex', gap: 12, alignItems: 'flex-start', padding: 16,
          borderRadius: 14, border: '1px solid var(--ml-border, #e6e9ee)',
          background: 'var(--ml-paper, #fff)', textDecoration: 'none',
          boxShadow: 'var(--ml-shadow-soft, 0 2px 10px rgba(15,23,42,.05))'
        }}
      >
        <CalculatorIcon id={id} />
        <span>
          <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: 'var(--ml-ink, #13263B)' }}>{c.nombre}</span>
          <span style={{ display: 'block', fontSize: 13, lineHeight: 1.5, color: 'var(--ml-soft, #6B7885)', marginTop: 3 }}>{c.desc}</span>
        </span>
      </a>
    );
  };

  const rejilla = (ids) => (
    <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
      {ids.map(tarjetaHerramienta)}
    </div>
  );

  return (
    <main className="shell" style={{ maxWidth: 860, paddingTop: 28, paddingBottom: 72 }}>
      {/* 1. Breadcrumb + hero */}
      <nav aria-label="Ruta de navegación" style={{ fontSize: 13, color: 'var(--ml-soft, #6B7885)', marginBottom: 22 }}>
        <a href="/" onClick={(e) => { e.preventDefault(); irASituacion(null, true); }} style={{ color: 'var(--ml-blue, #2D6CAA)', textDecoration: 'none' }}>Inicio</a>
        <span aria-hidden="true"> / </span>
        <span>Situaciones</span>
      </nav>

      <header style={{ marginBottom: 34 }}>
        <p className="eyebrow" style={{ margin: 0 }}>{s.eyebrow}</p>
        <h1 style={{
          fontFamily: '"Newsreader", Georgia, serif', fontSize: 38, fontWeight: 600,
          letterSpacing: '-.03em', lineHeight: 1.12, color: 'var(--ml-ink, #13263B)',
          margin: '10px 0 14px 0'
        }}>{s.h1}</h1>
        <p style={{ fontSize: 17, lineHeight: 1.65, color: 'var(--ml-slate-600, #4A5A6B)', margin: 0, maxWidth: 660 }}>{s.lede}</p>
      </header>

      {/* 2. Que necesitas resolver */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={hubH2}>¿Qué necesitas resolver?</h2>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {s.decisiones.map((d, i) => (
            <a
              key={i}
              href={enlaceDecision(d)}
              onClick={(e) => clicDecision(e, d)}
              style={{
                display: 'block', padding: '20px 18px', borderRadius: 16,
                border: '1px solid var(--ml-border, #e6e9ee)',
                background: 'var(--ml-ivory, #FBF8F2)', textDecoration: 'none'
              }}
            >
              <span style={{ display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', color: 'var(--ml-blue, #2D6CAA)', marginBottom: 8 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ display: 'block', fontSize: 15.5, fontWeight: 600, lineHeight: 1.45, color: 'var(--ml-ink, #13263B)' }}>{d.texto}</span>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ml-blue, #2D6CAA)', marginTop: 12 }}>Ver ruta →</span>
            </a>
          ))}
        </div>
      </section>

      {/* 3. Explicacion editorial */}
      <section style={{ marginBottom: 40 }}>
        {s.explicacion.map((p, i) => (
          <p key={i} style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--ml-slate-600, #4A5A6B)', margin: '0 0 16px 0' }}>{p}</p>
        ))}
      </section>

      {/* Pieza exclusiva del hub de cierre laboral */}
      {s.comparacion && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={hubH2}>{s.comparacion.titulo}</h2>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {s.comparacion.columnas.map((c, i) => (
              <div key={i} style={{
                padding: 20, borderRadius: 16, background: 'var(--ml-navy, #17324D)', color: '#fff'
              }}>
                <h3 style={{ margin: '0 0 8px 0', fontFamily: '"Newsreader", Georgia, serif', fontSize: 20, fontWeight: 600 }}>{c.titulo}</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, opacity: .88 }}>{c.texto}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--ml-soft, #6B7885)', margin: '14px 0 0 0' }}>{s.comparacion.nota}</p>
        </section>
      )}

      {/* 4. Ruta de decision */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={hubH2}>Tu ruta de decisión</h2>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
          {s.ruta.map((r, i) => (
            <li key={i} style={{ padding: '18px 16px', borderRadius: 14, border: '1px solid var(--ml-border, #e6e9ee)' }}>
              <span style={{ display: 'block', fontFamily: '"Newsreader", Georgia, serif', fontSize: 26, color: 'var(--ml-blue, #2D6CAA)', lineHeight: 1 }}>{i + 1}</span>
              <h3 style={{ margin: '10px 0 6px 0', fontSize: 15.5, fontWeight: 700, color: 'var(--ml-ink, #13263B)' }}>{r.paso}</h3>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--ml-slate-600, #4A5A6B)' }}>{r.detalle}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 5. Herramientas para esta situacion */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={hubH2}>Herramientas para esta situación</h2>
        {s.grupos ? (
          s.grupos.map((g) => (
            <div key={g.ancla} id={g.ancla} style={{ marginBottom: 20, scrollMarginTop: 90 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ml-soft, #6B7885)', margin: '0 0 10px 0' }}>{g.titulo}</h3>
              {rejilla(g.ids)}
            </div>
          ))
        ) : rejilla(s.herramientas)}
      </section>

      {/* 6. Antes de decidir */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={hubH2}>Antes de decidir</h2>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
          {s.antes.map((a, i) => (
            <li key={i} style={{ paddingLeft: 16, borderLeft: '3px solid var(--ml-green, #28735A)' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 700, color: 'var(--ml-ink, #13263B)' }}>{a.titulo}</h3>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: 'var(--ml-slate-600, #4A5A6B)' }}>{a.detalle}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 7. Lecturas relacionadas */}
      {Array.isArray(s.lecturas) && s.lecturas.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={hubH2}>Lecturas relacionadas</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
            {s.lecturas.map((id) => {
              const a = articulos[id];
              if (!a) return null;
              return (
                <li key={id}>
                  <a href={rutaDe(id)} onClick={(e) => { e.preventDefault(); ir(id); }}
                     style={{ display: 'block', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--ml-border, #e6e9ee)', color: 'var(--ml-blue, #2D6CAA)', textDecoration: 'none', fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>
                    {a.titulo}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* 8. Confianza */}
      <section style={{
        marginBottom: 34, padding: '16px 18px', borderRadius: 14,
        background: 'var(--ml-ivory, #FBF8F2)', border: '1px solid var(--ml-border, #e6e9ee)',
        display: 'flex', flexWrap: 'wrap', gap: '8px 22px', fontSize: 12.5, color: 'var(--ml-soft, #6B7885)'
      }}>
        <span>Fuentes oficiales citadas en cada cálculo</span>
        <span>Metodología y supuestos a la vista</span>
        <span>Sin registro y sin guardar tus datos</span>
      </section>

      {/* 9. Siguiente ruta */}
      <a
        href={`/situaciones/${s.siguiente.destino}`}
        onClick={(e) => { e.preventDefault(); irASituacion(s.siguiente.destino); }}
        style={{
          display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 22px', borderRadius: 16, background: 'var(--ml-navy, #17324D)',
          color: '#fff', textDecoration: 'none', fontSize: 15.5, fontWeight: 600, lineHeight: 1.5
        }}
      >
        <span>{s.siguiente.texto}</span>
        <span aria-hidden="true">→</span>
      </a>
    </main>
  );
}

const hubH2 = {
  fontFamily: '"Newsreader", Georgia, serif', fontSize: 24, fontWeight: 600,
  letterSpacing: '-.02em', color: 'var(--ml-ink, #13263B)', margin: '0 0 14px 0',
};

// ═══════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ═══════════════════════════════════════════════════════════════

const CALCULADORAS = [
  { id: 'finiquito', nombre: 'Finiquito', desc: 'Renuncia voluntaria', comp: CalcFiniquito },
  { id: 'liquidacion', nombre: 'Liquidación', desc: 'Despido injustificado', comp: CalcLiquidacion },
  { id: 'aguinaldo', nombre: 'Aguinaldo', desc: 'Proporcional o completo', comp: CalcAguinaldo },
  { id: 'isr', nombre: 'ISR Mensual', desc: 'Retención de nómina', comp: CalcISR },
  { id: 'resico', nombre: 'RESICO', desc: 'Ingresos por actividad independiente', comp: CalcRESICO },
  { id: 'ptu', nombre: 'PTU', desc: 'Reparto de utilidades', comp: CalcPTU },
  { id: 'bruto-neto', nombre: 'Bruto a Neto', desc: 'Salario neto real', comp: CalcBrutoNeto },
  { id: 'vacaciones', nombre: 'Vacaciones', desc: 'Días según antigüedad', comp: CalcVacaciones },
  { id: 'infonavit', nombre: 'Infonavit', desc: 'Simulador de crédito', comp: CalcInfonavit },
  { id: 'pension', nombre: 'Pensión IMSS', desc: 'Estimación Ley 97', comp: CalcPension },
];

const styles = {
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }
};



// ---------------------------------------------------------------------------
// Rutas reales por calculadora (/calculadoras/<slug>).
// Cada una se sirve como un HTML propio generado en el build, con su title y
// su metadata; aqui solo se traduce ruta <-> calculadora.
// ---------------------------------------------------------------------------
const RUTAS = catalogoPaginas.paginas;
const SLUG_POR_ID = Object.fromEntries(RUTAS.map(p => [p.id, p.slug]));
const ID_POR_SLUG = Object.fromEntries(RUTAS.map(p => [p.slug, p.id]));

const rutaDe = (id) => (SLUG_POR_ID[id] ? `/calculadoras/${SLUG_POR_ID[id]}` : '/');

function calculadoraDeLaUrl() {
  if (typeof window === 'undefined') return null;
  const m = window.location.pathname.match(/^\/calculadoras\/([^/]+)\/?$/);
  return m ? (ID_POR_SLUG[m[1]] || null) : null;
}

// ---------------------------------------------------------------------------
// Rutas de situacion (/situaciones/<slug>) — Fase 7.
// Mismo patron que las calculadoras: el HTML lo emite el build y aqui solo se
// traduce ruta <-> situacion.
// ---------------------------------------------------------------------------
const SITUACIONES_HUB = catalogoSituaciones.situaciones;

function situacionDeLaUrl() {
  if (typeof window === 'undefined') return null;
  const m = window.location.pathname.match(/^\/situaciones\/([^/]+)\/?$/);
  return m ? (SITUACIONES_HUB.find((s) => s.slug === m[1]) || null) : null;
}

const CSS_CALCULADORAS = `:root{--ml-blue-700:#245C93;--ml-blue-600:#2D6CAA;--ml-blue-500:#2D6CAA;--ml-blue-100:#DCEAF7;--ml-blue-50:#F2F7FB;--ml-slate-900:#13263B;--ml-slate-600:#5E6B78;--ml-slate-400:#7A8794;--ml-slate-200:#D9E1E8;--ml-white:#FFFFFF;--ml-green-600:#28735A;--ml-green-50:#EAF4EF;--ml-red-600:#A94442;--ml-red-50:#FBF1F1;--ml-amber-600:#9B6723;--ml-radius-input:10px;--ml-radius-control:12px;--ml-radius-card:14px;--ml-radius-pill:999px;--ml-shadow-card:0 2px 10px rgba(15,23,42,0.06);--ml-shadow-btn:0 4px 12px rgba(37,99,235,0.28)}@keyframes mlFadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes mlPopIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}.ml-panel{animation:mlFadeInUp 0.35s ease-out}.ml-result{animation:mlPopIn 0.3s ease-out}.ml-btn:hover{filter:brightness(1.05);transform:translateY(-1px)}@keyframes mlFadeOutDown{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(8px)}}.ml-panel-out{animation:mlFadeOutDown 0.18s ease-in forwards}.ml-grid-heading{font-size:22px;font-weight:600;color:var(--ml-slate-900);margin:0 0 12px 4px}@media (min-width:640px){.ml-grid-heading{font-size:26px}}.ml-calc-grid{display:grid;grid-template-columns:1fr;gap:12px}@media (min-width:640px){.ml-calc-grid{grid-template-columns:repeat(2,1fr);gap:20px}}@media (min-width:1024px){.ml-calc-grid{grid-template-columns:repeat(3,1fr)}}.ml-calc-card2{position:relative;display:flex;flex-direction:row;align-items:center;gap:14px;text-align:left;background:var(--ml-white);border:1px solid var(--ml-slate-200);border-radius:14px;box-shadow:var(--ml-shadow-card);padding:20px;padding-right:40px;cursor:pointer;transition:border-color 180ms,box-shadow 180ms,transform 180ms;font-family:inherit}@media (min-width:640px){.ml-calc-card2{flex-direction:column;align-items:flex-start;padding:24px;min-height:176px}}.ml-calc-card2:hover{border-color:var(--ml-blue-500);transform:translateY(-2px);box-shadow:0 10px 26px rgba(37,99,235,0.16)}.ml-calc-card2:focus-visible{outline:2px solid var(--ml-blue-600);outline-offset:3px}.ml-calc-card2 .ml-card-title{display:block;font-size:18px;font-weight:600;color:var(--ml-slate-900)}.ml-calc-card2 .ml-card-desc{display:block;font-size:14px;line-height:1.5;color:var(--ml-slate-600);margin-top:4px}.ml-calc-card2 .ml-card-arrow{position:absolute;color:var(--ml-slate-400);display:flex;right:16px;top:50%;transform:translateY(-50%)}@media (min-width:640px){.ml-calc-card2 .ml-card-arrow{top:16px;transform:none}}@media (prefers-reduced-motion: reduce){.ml-panel,.ml-result,.ml-panel-out{animation:none}.ml-btn:hover{transform:none}.ml-calc-card2{transition:none}.ml-calc-card2:hover{transform:none}}.ml-details{margin-top:10px;padding-top:10px;border-top:1px solid var(--ml-slate-200);background:transparent}.ml-details-summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:44px;padding:4px 0;font-size:14px;font-weight:500;color:var(--ml-slate-600);cursor:pointer}.ml-details-summary::-webkit-details-marker{display:none}.ml-details-summary:focus-visible{outline:2px solid var(--ml-blue-600);outline-offset:2px}.ml-details-chevron{flex:none;transition:transform 180ms}.ml-details[open] .ml-details-chevron{transform:rotate(180deg)}.ml-details-body{font-size:14px;line-height:1.6;color:var(--ml-slate-600);padding-bottom:6px}@media (prefers-reduced-motion: reduce){.ml-details-chevron{transition:none}}`;

// Metadatos de presentacion para las tarjetas del nuevo Inicio.
const CALC_META = {
  finiquito:  { tag: 'Trabajo',      largo: 'Estima lo que corresponde al cerrar una relación laboral y revisa qué integra el cálculo.' },
  isr:        { tag: 'Impuestos',    largo: 'Calcula la retención estimada y entiende de dónde sale.' },
  aguinaldo:  { tag: 'Prestaciones', largo: 'Revisa tu monto proporcional o anual con datos claros.' },
  'bruto-neto':{ tag: 'Sueldo',      largo: 'Visualiza cuánto llega realmente a tu cuenta y qué se descuenta.' },
  resico:     { tag: 'Impuestos',    largo: 'Estima el ISR del régimen simplificado con fundamento visible.' },
  liquidacion:{ tag: 'Trabajo',      largo: 'Calcula los conceptos de un despido injustificado y qué los integra.' },
  ptu:        { tag: 'Prestaciones', largo: 'Revisa el 10% de utilidades que corresponde repartir.' },
  vacaciones: { tag: 'Prestaciones', largo: 'Días que te tocan según tu antigüedad, con la tabla vigente.' },
  infonavit:  { tag: 'Crédito',      largo: 'Simula la amortización de capital e intereses de tu crédito.' },
  pension:    { tag: 'Retiro',       largo: 'Revisa si cumples los requisitos de la Ley 97 antes de proyectar nada.' },
};

// Orden de aparicion en el Inicio (las cinco primeras son las tarjetas visibles).
const ORDEN_INICIO = ['finiquito','isr','aguinaldo','bruto-neto','resico','liquidacion','ptu','vacaciones','infonavit','pension'];

// Las tres tarjetas del Inicio. Desde la Fase 7 ya no filtran la rejilla de
// calculadoras: llevan a su ruta de decision real en /situaciones/<slug>.
const SITUACIONES = [
  { slug: 'entender-mi-sueldo', titulo: 'Entender mi sueldo', desc: 'Bruto a neto, ISR, RESICO y lo que realmente cambia tu ingreso disponible.' },
  { slug: 'revisar-mis-prestaciones', titulo: 'Revisar mis prestaciones', desc: 'Aguinaldo, vacaciones, PTU, vivienda y retiro, con contexto para saber si el cálculo tiene sentido.' },
  { slug: 'terminar-relacion-laboral', titulo: 'Terminar una relación laboral', desc: 'Finiquito, liquidación y los conceptos que debes distinguir antes de aceptar una cifra.' },
];

const LECTURAS = [
  { id: 'finiquito',  min: '5 min', tema: 'Trabajo', titulo: 'Finiquito vs. liquidación: la diferencia que cambia el monto' },
  { id: 'bruto-neto', min: '4 min', tema: 'Sueldo',  titulo: 'Por qué tu sueldo bruto no es lo que llega a tu cuenta' },
  { id: 'pension',    min: '6 min', tema: 'Retiro',  titulo: 'Qué revisar antes de confiar en una cifra de pensión' },
];

export default function App() { if (typeof window !== 'undefined' && window.location.pathname.replace(/\/$/,'') === '/privacidad') { return (<div style={{maxWidth:680,margin:'40px auto',padding:'0 16px 60px',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',color:'#18283A',lineHeight:1.7}}><h1 style={{fontSize:26,color:'#17324D'}}>Política de Privacidad</h1><p>MiLana ("el Sitio", "nosotros") es un sitio informativo de calculadoras financieras y fiscales para México. Esta política explica qué datos se recopilan y cómo se usan.</p><h2 style={{fontSize:18,color:'#17324D'}}>Datos que recopilamos</h2><p>Las calculadoras del Sitio funcionan enteramente en tu navegador: los datos que ingresas (salarios, fechas, etc.) no se envían ni se almacenan en nuestros servidores.</p><h2 style={{fontSize:18,color:'#17324D'}}>Analítica y cookies</h2><p>Usamos Google Analytics para entender el uso general del Sitio (páginas vistas, país, dispositivo) de forma agregada y anónima. Puede usar cookies, que puedes bloquear desde la configuración de tu navegador.</p><h2 style={{fontSize:18,color:'#17324D'}}>Publicidad</h2><p>Este Sitio puede mostrar anuncios de Google AdSense. Google y sus socios publicitarios pueden usar cookies para mostrar anuncios relevantes según tus visitas a este y otros sitios. Puedes gestionar tus preferencias en la Configuración de anuncios de Google.</p><h2 style={{fontSize:18,color:'#17324D'}}>Contacto</h2><p>Para dudas sobre esta política, contáctanos a través de nuestras redes sociales.</p><p style={{fontSize:12,color:'#7A8794',marginTop:24}}>Última actualización: septiembre 2026.</p><a href="/" style={{color:'#2D6CAA'}}>← Volver a MiLana</a></div>); }
  const [activa, _setActiva] = useState(calculadoraDeLaUrl);

  // Navegar cambia la URL de verdad: el usuario puede compartirla, recargarla
  // y el boton de atras del navegador funciona.
  const setActiva = (id) => {
    _setActiva(id);
    _setSituacion(null);
    if (typeof window !== 'undefined') {
      const destino = id ? rutaDe(id) : '/';
      if (window.location.pathname !== destino) window.history.pushState({ id }, '', destino);
      window.scrollTo({ top: 0 });
      const meta = RUTAS.find(p => p.id === id);
      document.title = meta ? meta.titulo : 'MiLana — Calculadoras Financieras México 2026';
    }
  };

  // Situacion abierta (/situaciones/<slug>). Vive aparte de `activa` porque
  // son dos familias de rutas distintas, pero comparten el mismo popstate.
  const [situacion, _setSituacion] = useState(situacionDeLaUrl);

  const irASituacion = (slug, aInicio = false) => {
    const s = slug ? SITUACIONES_HUB.find((x) => x.slug === slug) : null;
    _setSituacion(s);
    if (s) _setActiva(null);
    if (typeof window !== 'undefined') {
      const destino = s ? `/situaciones/${s.slug}` : '/';
      if (window.location.pathname !== destino) window.history.pushState({ slug }, '', destino);
      window.scrollTo({ top: 0 });
      document.title = s ? s.titulo : 'MiLana — Calculadoras Financieras México 2026';
    }
    if (aInicio) _setSituacion(null);
  };

  useEffect(() => {
    const alNavegar = () => { _setActiva(calculadoraDeLaUrl()); _setSituacion(situacionDeLaUrl()); };
    window.addEventListener('popstate', alNavegar);
    return () => window.removeEventListener('popstate', alNavegar);
  }, []);

  // La portada se monta con React: restaurar el ancla después del render.
  useEffect(() => {
    if (window.location.pathname !== '/') return;
    const id = window.location.hash.slice(1);
    if (!['situaciones', 'calculadoras', 'aprende', 'fuentes'].includes(id)) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const [cerrando, setCerrando] = useState(false);
  const cerrarCalc = () => { setCerrando(true); setTimeout(() => { setActiva(null); setCerrando(false); }, 180); };

  const Comp = activa ? CALCULADORAS.find(c => c.id === activa)?.comp : null;
  const calc = CALCULADORAS.find(c => c.id === activa);

  const [verTodas, setVerTodas] = useState(false);
  const [filtro, setFiltro] = useState(null);

  const porId = Object.fromEntries(CALCULADORAS.map(c => [c.id, c]));
  const idsVisibles = filtro ? filtro : (verTodas ? ORDEN_INICIO : ORDEN_INICIO.slice(0, 5));
  const visibles = idsVisibles.map(id => ({ ...porId[id], ...CALC_META[id] }));

  return (
    <>
      <style>{CSS_CALCULADORAS}</style>

      <header className="site-header">
        <div className="shell header-inner">
          <a className="brand" href="/" aria-label="MiLana, inicio">
            <span className="brand-mark" aria-hidden="true">M</span>
            <span className="brand-name">MiLana</span>
          </a>
          <nav className="desktop-nav" aria-label="Principal">
            <a href="/#situaciones">Tu situación</a>
            <a href="/#calculadoras">Calculadoras</a>
            <a href="/#aprende">Aprende</a>
            <a href="/#fuentes">Fuentes</a>
          </nav>
          <a className="header-cta" href="/#situaciones">Empezar</a>
        </div>
      </header>

      {situacion && !activa && !cerrando ? (
        <SituationHub situacion={situacion} ir={setActiva} irASituacion={irASituacion} />
      ) : (activa || cerrando) ? (
        <div key={activa} className={cerrando ? "ml-panel ml-panel-out" : "ml-panel"}>
          {/*
            Encabezado editorial de la calculadora (Fase 8).
            El proposito deja de ser un bloque aislado y pasa a formar parte
            del encabezado, conservando su posicion antes de la calculadora.
            La foto se integra aqui mismo: al costado en escritorio, como
            franja debajo del texto en tablet y movil.
          */}
          <header className="calculator-hero">
            <div className="calculator-hero-inner">
              <div className="calculator-hero-copy">
                <nav aria-label="Ruta de navegación" style={{fontSize:13,color:'var(--ml-soft)',marginBottom:18}}>
                  <a href="/" onClick={(e) => { e.preventDefault(); cerrarCalc(); }} style={{color:'var(--ml-blue)',textDecoration:'none'}}>Inicio</a>
                  <span aria-hidden="true"> / </span>
                  <a href="/#calculadoras" style={{color:'var(--ml-blue)',textDecoration:'none'}}>Calculadoras</a>
                </nav>
                <div className="calculator-hero-icon" style={{display:'flex',alignItems:'center',gap:10}}>
                  <CalculatorIcon id={calc.id} />
                  <span style={{fontSize:12,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--ml-blue)'}}>
                    {CALC_META[calc.id]?.tag || calc.desc}
                  </span>
                </div>
                <h1>{calc.nombre}</h1>
                <Proposito id={calc.id} />
              </div>

              {FOTOS[calc.id] && (
                <div className="calculator-hero-media">
                  <Foto
                    name={calc.id}
                    sizes="(max-width: 1023px) 100vw, min(48vw, 760px)"
                    focal={FOTOS[calc.id].focal}
                    movil={FOTOS[calc.id].movil}
                    eager
                  />
                </div>
              )}
            </div>
          </header>

          <main className="shell calculator-main" style={{maxWidth:720, paddingBottom:64}}>
            <Comp />
            <FichaConfianza id={calc.id} />
            <Articulo id={calc.id} />
            <ContenidoCalculadora id={calc.id} ir={setActiva} />
            <p style={{marginTop:30}}>
              <a href="/" onClick={(e) => { e.preventDefault(); cerrarCalc(); }} style={{color:'var(--ml-blue)',fontSize:14,fontWeight:600,textDecoration:'none'}}>
                ← Todas las calculadoras
              </a>
            </p>
          </main>
        </div>
      ) : (
        <main>
          <section className="hero">
            <div className="shell hero-grid">
              <div className="hero-copy">
                <p className="eyebrow">Dinero claro, decisiones propias</p>
                <h1>Entiende lo que tienes. Decide lo que sigue.</h1>
                <p className="hero-lede">MiLana reúne calculadoras, explicaciones y datos oficiales para ayudarte a pasar de la duda a una decisión concreta, sin lenguaje de banco y sin promesas fáciles.</p>
                <div className="hero-actions">
                  <a className="btn btn-primary" href="/#situaciones">Explorar mi situación</a>
                  <a className="btn btn-secondary" href="/#calculadoras">Ver calculadoras</a>
                </div>
                <div className="hero-proof" aria-label="Señales de confianza">
                  <span>Datos 2026</span>
                  <span>Fuentes oficiales</span>
                  <span>Sin registro</span>
                </div>
              </div>

              <div className="hero-media-wrap">
                <div className="hero-orbit hero-orbit-one" aria-hidden="true"></div>
                <div className="hero-orbit hero-orbit-two" aria-hidden="true"></div>
                <figure className="hero-media">
                  <Foto name="inicio" sizes="(max-width: 1023px) 102vw, (max-width: 1279px) 88vw, (max-width: 1599px) 83vw, 1230px" eager />
                </figure>
                <aside className="hero-note" aria-label="Qué ofrece MiLana">
                  <span className="hero-note-kicker">Primero entiende</span>
                  <strong>Luego compara escenarios.</strong>
                  <span className="hero-note-copy">Y decide con números que sí puedes explicar.</span>
                </aside>
              </div>
            </div>
          </section>

          <section id="situaciones" className="section situations">
            <div className="shell">
              <div className="section-head split-head">
                <div>
                  <p className="eyebrow">Empieza por lo que estás viviendo</p>
                  <h2>No necesitas saber qué calculadora buscar.</h2>
                </div>
                <p>Elige una situación y MiLana te lleva a las herramientas y explicaciones que tienen sentido para ese momento.</p>
              </div>
              <div className="situation-grid">
                {SITUACIONES.map((s, i) => (
                  <a key={s.titulo} className="situation-card" href={`/situaciones/${s.slug}`}
                     onClick={(e) => { e.preventDefault(); irASituacion(s.slug); }}>
                    <span className="situation-icon">{String(i + 1).padStart(2, '0')}</span>
                    <h3>{s.titulo}</h3>
                    <p>{s.desc}</p>
                    <span className="text-link">Ver ruta <span>→</span></span>
                  </a>
                ))}
              </div>
            </div>
          </section>

          <section className="section path-section">
            <div className="shell">
              <p className="eyebrow">La ruta MiLana</p>
              <h2 className="path-title">De “no entiendo” a “sé por qué elegir esto”.</h2>
              <div className="path-grid">
                <div className="path-step">
                  <span className="path-number">1</span>
                  <div><h3>Entender</h3><p>Traducimos conceptos y reglas a lenguaje normal.</p></div>
                </div>
                <div className="path-step">
                  <span className="path-number">2</span>
                  <div><h3>Comparar</h3><p>Prueba números y escenarios sin perder el contexto.</p></div>
                </div>
                <div className="path-step">
                  <span className="path-number">3</span>
                  <div><h3>Decidir</h3><p>Qué cambia, qué revisar y qué conviene preguntar antes de actuar.</p></div>
                </div>
              </div>
            </div>
          </section>

          <section id="calculadoras" className="section calculators">
            <div className="shell">
              <div className="section-head calculators-head">
                <div>
                  <p className="eyebrow">Herramientas</p>
                  <h2>Calculadoras que explican el resultado.</h2>
                </div>
                <button className="text-link standalone" onClick={() => { setFiltro(null); setVerTodas(true); }}
                        style={{background:'none',border:0,cursor:'pointer',fontFamily:'inherit',padding:0}}>
                  Ver las 10 calculadoras <span>→</span>
                </button>
              </div>
              <div className="calculator-grid">
                {visibles.map((c, i) => (
                  <article key={c.id} className={`calculator-card${i === 0 && !verTodas && !filtro ? ' feature-card' : ''}`}>
                    <span className="card-tag">{c.tag}</span>
                    <h3>{c.nombre}</h3>
                    <p>{c.largo}</p>
                    <a className="text-link" href={rutaDe(c.id)}
                       onClick={(e) => { e.preventDefault(); setActiva(c.id); }}>
                      Calcular <span>→</span>
                    </a>
                  </article>
                ))}
                {!verTodas && !filtro && (
                  <article className="calculator-card quiet-card">
                    <span className="card-tag">Más herramientas</span>
                    <h3>Vacaciones, PTU, Infonavit y pensión</h3>
                    <p>Accede al resto de herramientas cuando tu situación lo necesite.</p>
                    <button className="text-link" onClick={() => setVerTodas(true)}
                            style={{background:'none',border:0,cursor:'pointer',fontFamily:'inherit',padding:0}}>
                      Ver todas <span>→</span>
                    </button>
                  </article>
                )}
              </div>
            </div>
          </section>

          <section id="aprende" className="section learn-section">
            <div className="shell learn-grid">
              <div className="learn-copy">
                <p className="eyebrow">Aprende antes de decidir</p>
                <h2>La cifra importa. Entender qué significa importa más.</h2>
                <p>Los mini-artículos responden la pregunta que aparece justo después del cálculo: “¿y ahora qué hago con esto?”</p>
                <button className="btn btn-secondary" onClick={() => { setFiltro(null); setVerTodas(true); document.getElementById('calculadoras')?.scrollIntoView({behavior:'smooth'}); }}
                        style={{cursor:'pointer',fontFamily:'inherit'}}>
                  Explorar explicaciones
                </button>
              </div>
              <div className="article-stack">
                {LECTURAS.map(l => (
                  <a key={l.id} className="article-row" href={rutaDe(l.id)}
                     onClick={(e) => { e.preventDefault(); setActiva(l.id); }}>
                    <span>{l.min}</span>
                    <div><h3>{l.titulo}</h3><p>{l.tema}</p></div>
                    <b>→</b>
                  </a>
                ))}
              </div>
            </div>
          </section>

          <section id="fuentes" className="trust-band">
            <div className="shell trust-grid">
              <div>
                <p className="eyebrow">Confianza visible</p>
                <h2>Cada número debe decir de dónde salió.</h2>
              </div>
              <div className="trust-points">
                <div><span>01</span><p>Fuente oficial y fundamento por calculadora.</p></div>
                <div><span>02</span><p>Fecha de revisión visible, no escondida en el pie.</p></div>
                <div><span>03</span><p>Estado de verificación claro cuando un dato requiere revisión.</p></div>
              </div>
            </div>
          </section>
        </main>
      )}

      <footer className="site-footer">
        <div className="shell footer-inner">
          <div>
            <span className="brand-name">MiLana</span>
            <p>Dinero claro para decidir mejor.</p>
            <p>Datos basados en: Anexo 8 RMF 2026 (DOF 28/12/2025) · Ley Federal del Trabajo · CONASAMI · INEGI UMA 2026</p>
            <p>Salario mínimo general: ${SALARIO_MINIMO_GENERAL}/día · Frontera: ${SALARIO_MINIMO_FRONTERA}/día · UMA: ${UMA_DIARIA}/día</p>
            <p>Los cálculos son estimaciones informativas. Para montos exactos consulta con un especialista fiscal o laboral.</p>
          </div>
          <p>MiLana © 2026 · Hecho en México · <a href="/privacidad" style={{textDecoration:'underline'}}>Privacidad</a></p>
        </div>
      </footer>
    </>
  );
}

