import { useState } from "react";
import regulatoryData from "./data/regulatory-data.json";

// ═══════════════════════════════════════════════════════════════
// DATOS OFICIALES 2026 — SAT / CONASAMI / INEGI
// ═══════════════════════════════════════════════════════════════

const SALARIO_MINIMO_GENERAL = 315.04;
const SALARIO_MINIMO_FRONTERA = 440.87;
const UMA_DIARIA = 117.31;
const UMA_MENSUAL = 3566.22;
const UMA_ANUAL = 42794.64;
const SUBSIDIO_EMPLEO_MENSUAL = 536.22;

// Tabla ISR mensual 2026 — Anexo 8 RMF DOF 28/12/2025
const ISR_MENSUAL_2026 = [
  { li: 0.01, ls: 844.59, cf: 0, tasa: 1.92 },
  { li: 844.60, ls: 7168.51, cf: 16.22, tasa: 6.40 },
  { li: 7168.52, ls: 12598.02, cf: 420.95, tasa: 10.88 },
  { li: 12598.03, ls: 14644.64, cf: 1011.68, tasa: 16.00 },
  { li: 14644.65, ls: 17533.64, cf: 1339.14, tasa: 17.92 },
  { li: 17533.65, ls: 35362.83, cf: 1856.84, tasa: 21.36 },
  { li: 35362.84, ls: 55736.68, cf: 5665.16, tasa: 23.52 },
  { li: 55736.69, ls: 106410.50, cf: 10457.09, tasa: 30.00 },
  { li: 106410.51, ls: 141880.66, cf: 25659.23, tasa: 32.00 },
  { li: 141880.67, ls: 425641.99, cf: 37009.69, tasa: 34.00 },
  { li: 425642.00, ls: Infinity, cf: 133488.54, tasa: 35.00 },
];

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
  const idx = Math.min(anios, VACACIONES_POR_ANIO.length) - 1;
  return VACACIONES_POR_ANIO[idx] || 32;
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
  const isr = calcISR(brutoMensual, ISR_MENSUAL_2026);
  // Subsidio al empleo (aplica si ingreso <= ~$9,500 aprox)
  const subsidio = brutoMensual <= (UMA_DIARIA * 3 * 30.4) ? SUBSIDIO_EMPLEO_MENSUAL : 0;
  return Math.max(isr - subsidio, 0);
}

function diasEntre(f1, f2) {
  const d1 = new Date(f1), d2 = new Date(f2);
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
}

function fmt(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

function fmtPct(n) { return n.toFixed(2) + '%'; }

// ═══════════════════════════════════════════════════════════════
// CALCULADORAS
// ═══════════════════════════════════════════════════════════════

function CalcFiniquito() {
  const [salarioMensual, setSalarioMensual] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [diasTrabajados, setDiasTrabajados] = useState('');
  const [vacPendientes, setVacPendientes] = useState('0');
  const [result, setResult] = useState(null);

  const calcular = () => {
    const sm = parseFloat(salarioMensual) || 0;
    const sd = sm / 30;
    const dt = parseInt(diasTrabajados) || 0;
    const vp = parseInt(vacPendientes) || 0;
    if (!fechaIngreso || !fechaSalida || sm <= 0) return;

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
    const fraccionAnio = (diasAnio / 365);
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

    // ISR estimado simplificado
    const isrEstimado = calcISR(bruto, ISR_MENSUAL_2026);

    setResult({
      sd: sd,
      pagoSalario, dt, aguinaldo, diasAnio,
      vacDias, vacProporcionales: totalVacDias, pagoVacaciones,
      primaVac, primaAnt, aniosCompletos,
      bruto, isrEstimado,
      neto: bruto - isrEstimado
    });
  };

  return (
    <div>
      <p style={{color:'#64748b',marginBottom:20,fontSize:14,lineHeight:1.6}}>
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
          <ResultLine label="Total bruto" value={fmt(result.bruto)} bold />
          <ResultLine label="ISR estimado" value={`- ${fmt(result.isrEstimado)}`} color="#b91c1c" />
          <ResultLine label="Total neto estimado" value={fmt(result.neto)} bold color="#15803d" />
          <Note>Cálculo basado en LFT y tablas ISR 2026. Para montos exactos consulta con un especialista laboral.</Note>
        </ResultBox>
      )}
    </div>
  );
}

function CalcLiquidacion() {
  const [salarioMensual, setSalarioMensual] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [diasTrabajados, setDiasTrabajados] = useState('');
  const [result, setResult] = useState(null);

  const calcular = () => {
    const sm = parseFloat(salarioMensual) || 0;
    const sd = sm / 30;
    const dt = parseInt(diasTrabajados) || 0;
    if (!fechaIngreso || !fechaSalida || sm <= 0) return;

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
    const vacProporcionales = vacDias * (diasAnio / 365);
    const pagoVacaciones = vacProporcionales * sd;
    const primaVac = pagoVacaciones * 0.25;

    // Indemnización constitucional (90 días SDI)
    const indem90 = sdi * 90;

    // 20 días por año trabajado
    const indem20 = sdi * 20 * Math.max(aniosCompletos, 1);

    // Prima de antigüedad (12 días por año, tope 2x salario mínimo — Art. 162 LFT)
    const topeDiario = SALARIO_MINIMO_GENERAL * 2;
    const sdTope = Math.min(sd, topeDiario);
    const primaAnt = 12 * sdTope * Math.max(aniosCompletos, 1);

    const brutoFiniquito = pagoSalario + aguinaldo + pagoVacaciones + primaVac;
    const brutoLiquidacion = indem90 + indem20 + primaAnt;
    const brutoTotal = brutoFiniquito + brutoLiquidacion;

    setResult({
      sd, sdi, factorIntegracion, dt,
      pagoSalario, aguinaldo, diasAnio, vacProporcionales, pagoVacaciones, primaVac,
      indem90, indem20, primaAnt, aniosCompletos,
      brutoFiniquito, brutoLiquidacion, brutoTotal
    });
  };

  return (
    <div>
      <p style={{color:'#64748b',marginBottom:20,fontSize:14,lineHeight:1.6}}>
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
          <div style={{marginBottom:12,fontWeight:600,color:'#1e293b'}}>📋 Finiquito</div>
          <ResultLine label={`Salario (${result.dt} días)`} value={fmt(result.pagoSalario)} />
          <ResultLine label="Aguinaldo proporcional" value={fmt(result.aguinaldo)} />
          <ResultLine label={`Vacaciones (${result.vacProporcionales.toFixed(1)} días)`} value={fmt(result.pagoVacaciones)} />
          <ResultLine label="Prima vacacional" value={fmt(result.primaVac)} />
          <ResultLine label="Subtotal finiquito" value={fmt(result.brutoFiniquito)} bold />
          <Divider />
          <div style={{marginBottom:12,fontWeight:600,color:'#1e293b'}}>⚖️ Indemnización (despido injustificado)</div>
          <ResultLine label={`90 días SDI (${fmt(result.sdi)}/día)`} value={fmt(result.indem90)} />
          <ResultLine label={`20 días × ${result.aniosCompletos || 1} año(s)`} value={fmt(result.indem20)} />
          <ResultLine label={`Prima antigüedad (12 días × ${result.aniosCompletos || 1} año(s))`} value={fmt(result.primaAnt)} />
          <ResultLine label="Subtotal indemnización" value={fmt(result.brutoLiquidacion)} bold />
          <Divider />
          <ResultLine label="Total bruto" value={fmt(result.brutoTotal)} bold color="#15803d" />
          <Note>SDI calculado con factor de integración {result.factorIntegracion.toFixed(4)}. Montos brutos antes de ISR. Exenciones aplican según Art. 93 LISR.</Note>
        </ResultBox>
      )}
    </div>
  );
}

function CalcAguinaldo() {
  const [salarioMensual, setSalarioMensual] = useState('');
  const [diasAguinaldo, setDiasAguinaldo] = useState('15');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [result, setResult] = useState(null);

  const calcular = () => {
    const sm = parseFloat(salarioMensual) || 0;
    const sd = sm / 30;
    const da = parseInt(diasAguinaldo) || 15;
    if (sm <= 0) return;

    let diasProporcionales = 365;
    if (fechaIngreso) {
      const fi = new Date(fechaIngreso);
      const finAnio = new Date(fi.getFullYear(), 11, 31);
      const hoy = new Date();
      const ref = hoy < finAnio ? hoy : finAnio;
      diasProporcionales = diasEntre(fechaIngreso, ref.toISOString().split('T')[0]);
    }

    const aguinaldoBruto = sd * da * (diasProporcionales / 365);
    const exencion = UMA_DIARIA * 30; // 30 UMAs exención aguinaldo
    const gravado = Math.max(aguinaldoBruto - exencion, 0);
    const isrAguinaldo = calcISR(gravado, ISR_MENSUAL_2026);

    setResult({
      sd, da, diasProporcionales,
      aguinaldoBruto, exencion, gravado,
      isrAguinaldo,
      neto: aguinaldoBruto - isrAguinaldo
    });
  };

  return (
    <div>
      <p style={{color:'#64748b',marginBottom:20,fontSize:14,lineHeight:1.6}}>
        Calcula tu aguinaldo, ya sea completo o proporcional al tiempo trabajado. La ley establece un mínimo de 15 días de salario (Art. 87 LFT) y una exención de ISR equivalente a 30 UMAs.
      </p>
      <div style={styles.grid2}>
        <Field label="Salario mensual bruto ($)" value={salarioMensual} onChange={setSalarioMensual} type="number" placeholder="Ej: 18000" />
        <Field label="Días de aguinaldo (mín. 15)" value={diasAguinaldo} onChange={setDiasAguinaldo} type="number" placeholder="15" />
        <Field label="Fecha de ingreso (si no trabajaste el año completo)" value={fechaIngreso} onChange={setFechaIngreso} type="date" />
      </div>
      <Btn onClick={calcular}>Calcular Aguinaldo</Btn>
      {result && (
        <ResultBox>
          <ResultLine label="Salario diario" value={fmt(result.sd)} />
          <ResultLine label={`Días proporcionales trabajados`} value={result.diasProporcionales} />
          <ResultLine label="Aguinaldo bruto" value={fmt(result.aguinaldoBruto)} bold />
          <Divider />
          <ResultLine label={`Exención ISR (30 UMAs = ${fmt(result.exencion)})`} value={fmt(Math.min(result.aguinaldoBruto, result.exencion))} color="#15803d" />
          <ResultLine label="Gravado" value={fmt(result.gravado)} />
          <ResultLine label="ISR estimado" value={`- ${fmt(result.isrAguinaldo)}`} color="#b91c1c" />
          <Divider />
          <ResultLine label="Aguinaldo neto estimado" value={fmt(result.neto)} bold color="#15803d" />
        </ResultBox>
      )}
    </div>
  );
}

function CalcISR() {
  const [salarioMensual, setSalarioMensual] = useState('');
  const [result, setResult] = useState(null);

  const calcular = () => {
    const sm = parseFloat(salarioMensual) || 0;
    if (sm <= 0) return;

    const isrBruto = calcISR(sm, ISR_MENSUAL_2026);
    const subsidio = sm <= (UMA_DIARIA * 3 * 30.4) ? SUBSIDIO_EMPLEO_MENSUAL : 0;
    const isrNeto = Math.max(isrBruto - subsidio, 0);
    const neto = sm - isrNeto;
    const tasaEfectiva = (isrNeto / sm) * 100;

    // Encontrar rango
    let rango = ISR_MENSUAL_2026[0];
    for (const r of ISR_MENSUAL_2026) {
      if (sm >= r.li && sm <= r.ls) { rango = r; break; }
    }

    setResult({
      bruto: sm, isrBruto, subsidio, isrNeto, neto,
      tasaEfectiva, tasaMarginal: rango.tasa, cuotaFija: rango.cf,
      anual: { bruto: sm * 12, isr: isrNeto * 12, neto: neto * 12 }
    });
  };

  return (
    <div>
      <p style={{color:'#64748b',marginBottom:20,fontSize:14,lineHeight:1.6}}>
        Calcula el Impuesto Sobre la Renta que se retiene de tu sueldo mensual, con base en las tablas del Anexo 8 de la Resolución Miscelánea Fiscal 2026, publicadas en el Diario Oficial de la Federación el 28 de diciembre de 2025.
      </p>
      <div style={styles.grid2}>
        <Field label="Salario mensual bruto ($)" value={salarioMensual} onChange={setSalarioMensual} type="number" placeholder="Ej: 25000" />
      </div>
      <Btn onClick={calcular}>Calcular ISR</Btn>
      {result && (
        <ResultBox>
          <ResultLine label="Ingreso mensual bruto" value={fmt(result.bruto)} />
          <ResultLine label={`Tasa marginal (tu rango)`} value={fmtPct(result.tasaMarginal)} />
          <ResultLine label="Cuota fija del rango" value={fmt(result.cuotaFija)} />
          <ResultLine label="ISR causado" value={fmt(result.isrBruto)} />
          {result.subsidio > 0 && <ResultLine label="Subsidio al empleo" value={`- ${fmt(result.subsidio)}`} color="#15803d" />}
          <Divider />
          <ResultLine label="ISR a retener mensual" value={fmt(result.isrNeto)} bold color="#b91c1c" />
          <ResultLine label="Sueldo neto mensual" value={fmt(result.neto)} bold color="#15803d" />
          <ResultLine label="Tasa efectiva real" value={fmtPct(result.tasaEfectiva)} bold />
          <Divider />
          <div style={{marginBottom:8,fontWeight:600,color:'#64748b',fontSize:13}}>Proyección anual</div>
          <ResultLine label="Ingreso anual bruto" value={fmt(result.anual.bruto)} />
          <ResultLine label="ISR anual" value={fmt(result.anual.isr)} />
          <ResultLine label="Neto anual" value={fmt(result.anual.neto)} color="#15803d" />
        </ResultBox>
      )}
    </div>
  );
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
    const ivaMensual = ing * 0.16;
    const totalImpuestos = isrResico + ivaMensual;
    const neto = ing - isrResico;

    // Comparar con régimen general
    const isrGeneral = calcISR(ing, ISR_MENSUAL_2026);
    const ahorro = isrGeneral - isrResico;

    setResult({
      ingreso: ing, tasa, isrResico, ivaMensual, totalImpuestos, neto,
      isrGeneral, ahorro,
      anual: { ingreso: ing * 12, isr: isrResico * 12, neto: neto * 12 }
    });
  };

  return (
    <div>
      <p style={{color:'#64748b',marginBottom:20,fontSize:14,lineHeight:1.6}}>
        Calcula el impuesto que pagarías bajo el Régimen Simplificado de Confianza (RESICO), disponible para personas físicas con ingresos anuales de hasta 3.5 millones de pesos. Las tasas aplicables van del 1% al 2.5% sobre tus ingresos.
      </p>
      <div style={styles.grid2}>
        <Field label="Ingreso mensual facturado ($)" value={ingresoMensual} onChange={setIngresoMensual} type="number" placeholder="Ej: 40000" />
      </div>
      <Btn onClick={calcular}>Calcular RESICO</Btn>
      {result && (
        <ResultBox>
          <ResultLine label="Ingreso mensual" value={fmt(result.ingreso)} />
          <ResultLine label="Tasa RESICO" value={fmtPct(result.tasa)} bold />
          <ResultLine label="ISR RESICO mensual" value={fmt(result.isrResico)} color="#b91c1c" />
          <ResultLine label="Neto después de ISR" value={fmt(result.neto)} bold color="#15803d" />
          <Divider />
          <div style={{marginBottom:8,fontWeight:600,color:'#64748b',fontSize:13}}>Comparación vs Régimen General</div>
          <ResultLine label="ISR régimen general" value={fmt(result.isrGeneral)} />
          <ResultLine label="ISR RESICO" value={fmt(result.isrResico)} />
          <ResultLine label="Ahorro mensual con RESICO" value={fmt(result.ahorro)} bold color="#15803d" />
          <ResultLine label="Ahorro anual" value={fmt(result.ahorro * 12)} color="#15803d" />
          <Note>RESICO aplica para personas físicas con ingresos anuales hasta $3,500,000. Recuerda que también debes pagar IVA (16%) a tus clientes.</Note>
        </ResultBox>
      )}
    </div>
  );
}

function CalcPTU() {
  const [salarioMensual, setSalarioMensual] = useState('');
  const [diasTrabajados, setDiasTrabajados] = useState('365');
  const [utilidadesEmpresa, setUtilidadesEmpresa] = useState('');
  const [totalEmpleados, setTotalEmpleados] = useState('');
  const [result, setResult] = useState(null);

  const calcular = () => {
    const sm = parseFloat(salarioMensual) || 0;
    const dt = parseInt(diasTrabajados) || 365;
    const util = parseFloat(utilidadesEmpresa) || 0;
    const emp = parseInt(totalEmpleados) || 1;
    if (sm <= 0 || util <= 0) return;

    const repartoTotal = util * 0.10;
    const mitadDias = repartoTotal / 2;
    const mitadSalarios = repartoTotal / 2;

    // Simplificación: reparto equitativo entre empleados
    const ptuPorDias = (mitadDias / (emp * 365)) * dt;
    const ptuPorSalario = (mitadSalarios / (emp * sm * 12)) * (sm * (dt / 30));
    const ptuBruto = ptuPorDias + ptuPorSalario;

    // Tope de 3 meses de salario o promedio de últimos 3 años PTU
    const tope = sm * 3;
    const ptuFinal = Math.min(ptuBruto, tope);

    // Exención 15 UMAs
    const exencion = UMA_DIARIA * 15;
    const gravado = Math.max(ptuFinal - exencion, 0);
    const isr = calcISR(gravado, ISR_MENSUAL_2026);

    setResult({
      repartoTotal, ptuBruto, ptuFinal, tope, exencion, gravado, isr,
      neto: ptuFinal - isr
    });
  };

  return (
    <div>
      <p style={{color:'#64748b',marginBottom:20,fontSize:14,lineHeight:1.6}}>
        Estima el monto que te corresponde por Participación de los Trabajadores en las Utilidades (PTU). Las empresas están obligadas a repartir el 10% de sus utilidades anuales, con un tope equivalente a 3 meses de salario, conforme a los artículos 117 al 131 de la Ley Federal del Trabajo.
      </p>
      <div style={styles.grid2}>
        <Field label="Tu salario mensual ($)" value={salarioMensual} onChange={setSalarioMensual} type="number" placeholder="Ej: 15000" />
        <Field label="Días trabajados en el año" value={diasTrabajados} onChange={setDiasTrabajados} type="number" placeholder="365" />
        <Field label="Utilidades de la empresa ($)" value={utilidadesEmpresa} onChange={setUtilidadesEmpresa} type="number" placeholder="Ej: 5000000" />
        <Field label="Total de empleados" value={totalEmpleados} onChange={setTotalEmpleados} type="number" placeholder="Ej: 50" />
      </div>
      <Btn onClick={calcular}>Calcular PTU</Btn>
      {result && (
        <ResultBox>
          <ResultLine label="10% de utilidades a repartir" value={fmt(result.repartoTotal)} />
          <ResultLine label="Tu PTU estimado (bruto)" value={fmt(result.ptuBruto)} />
          <ResultLine label={`Tope (3 meses de salario)`} value={fmt(result.tope)} />
          <ResultLine label="PTU a pagar" value={fmt(result.ptuFinal)} bold />
          <Divider />
          <ResultLine label={`Exención ISR (15 UMAs = ${fmt(result.exencion)})`} value={fmt(Math.min(result.ptuFinal, result.exencion))} color="#15803d" />
          <ResultLine label="ISR estimado" value={`- ${fmt(result.isr)}`} color="#b91c1c" />
          <ResultLine label="PTU neto estimado" value={fmt(result.neto)} bold color="#15803d" />
          <Note>Estimación simplificada. El reparto real depende de la estructura salarial de todos los empleados.</Note>
        </ResultBox>
      )}
    </div>
  );
}

function CalcBrutoNeto() {
  const [salarioMensual, setSalarioMensual] = useState('');
  const [result, setResult] = useState(null);

  const calcular = () => {
    const sm = parseFloat(salarioMensual) || 0;
    if (sm <= 0) return;

    const sd = sm / 30;
    const isrMensual = calcISRMensual(sm);
    const imssObrero = sm * 0.02625; // 2.625% cuota obrera IMSS 2026 (EyM dinero 0.25% + EyM especie 0.625% + Invalidez y Vida 0.625% + Cesantía y Vejez 1.125%), aproximada sobre salario bruto
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
      ingresoPorHora: neto / 160, // 40 hrs * 4 semanas
      ingresoAnualTotal, isrAnual, imssAnual,
      netoAnual: ingresoAnualTotal - isrAnual - imssAnual,
      tasaRetencion: (totalDeducciones / sm) * 100
    });
  };

  return (
    <div>
      <p style={{color:'#64748b',marginBottom:20,fontSize:14,lineHeight:1.6}}>
        Convierte tu salario bruto a neto y conoce cuánto recibirás realmente después de las retenciones de ISR y de la cuota obrera del IMSS.
      </p>
      <div style={styles.grid2}>
        <Field label="Salario mensual bruto ($)" value={salarioMensual} onChange={setSalarioMensual} type="number" placeholder="Ej: 30000" />
      </div>
      <Btn onClick={calcular}>Calcular Bruto a Neto</Btn>
      {result && (
        <ResultBox>
          <ResultLine label="Salario bruto mensual" value={fmt(result.bruto)} />
          <ResultLine label="ISR retenido" value={`- ${fmt(result.isrMensual)}`} color="#b91c1c" />
          <ResultLine label="Cuota IMSS obrera (2.625%)" value={`- ${fmt(result.imssObrero)}`} color="#b91c1c" />
          <Divider />
          <ResultLine label="Sueldo neto mensual" value={fmt(result.neto)} bold color="#15803d" />
          <ResultLine label="Ingreso por hora (40 hrs/sem)" value={fmt(result.ingresoPorHora)} />
          <ResultLine label="Te retienen del total" value={fmtPct(result.tasaRetencion)} />
          <Divider />
          <div style={{marginBottom:8,fontWeight:600,color:'#64748b',fontSize:13}}>Ingreso anual (con prestaciones)</div>
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
      <p style={{color:'#64748b',marginBottom:20,fontSize:14,lineHeight:1.6}}>
        Consulta cuántos días de vacaciones te corresponden de acuerdo con tu antigüedad en la empresa, conforme a la reforma de Vacaciones Dignas de 2023 (Art. 76 LFT).
      </p>
      <div style={styles.grid2}>
        <Field label="Años trabajados en la empresa" value={aniosTrabajados} onChange={setAniosTrabajados} type="number" placeholder="Ej: 3" />
        <Field label="Salario mensual (opcional, para calcular prima)" value={salarioMensual} onChange={setSalarioMensual} type="number" placeholder="Ej: 20000" />
      </div>
      <Btn onClick={calcular}>Consultar</Btn>
      {result && (
        <ResultBox>
          <ResultLine label={`Con ${result.anios} año(s) de antigüedad`} value={`${result.dias} días de vacaciones`} bold color="#15803d" />
          {result.sd > 0 && (
            <>
              <Divider />
              <ResultLine label="Pago de vacaciones" value={fmt(result.pagoVac)} />
              <ResultLine label="Prima vacacional (25%)" value={fmt(result.primaVac)} />
              <ResultLine label="Total a recibir" value={fmt(result.total)} bold color="#15803d" />
            </>
          )}
          <Divider />
          <div style={{marginBottom:8,fontWeight:600,color:'#64748b',fontSize:13}}>Tabla de vacaciones LFT 2026</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))',gap:4}}>
            {result.tabla.map(t => (
              <div key={t.anio} style={{
                padding:'6px 8px',fontSize:12,borderRadius:6,
                background: t.anio === result.anios ? '#15803d' : '#f1f5f9',
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
    if (monto <= 0 || plazo <= 0) return;

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
      <p style={{color:'#64748b',marginBottom:20,fontSize:14,lineHeight:1.6}}>
        Estima el pago mensual de capital e intereses de un crédito con las condiciones que ingreses. No incluye seguros, cuotas, aportaciones patronales ni otras condiciones particulares de tu crédito Infonavit — consulta tu contrato o Mi Cuenta Infonavit para tu monto real.
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
          <ResultLine label="Pago estimado (capital + interés)" value={fmt(result.pagoMensual)} bold color="#15803d" />
          <Divider />
          <ResultLine label="Total estimado (capital + intereses)" value={fmt(result.totalPagado)} bold />
          <ResultLine label="Total solo en intereses" value={fmt(result.totalIntereses)} color="#b91c1c" />
          <ResultLine label="Pagarás de intereses" value={fmtPct(result.porcentajeIntereses) + " del crédito"} bold color="#b91c1c" />
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
                  color: vistaAnual ? 'white' : '#64748b'
                }}>Por año</button>
                <button onClick={() => setVistaAnual(false)} style={{
                  padding:'5px 14px',borderRadius:20,fontSize:12,fontWeight:600,cursor:'pointer',
                  border: !vistaAnual ? '1px solid #b45309' : '1px solid #e2e8f0',
                  background: !vistaAnual ? '#b45309' : 'white',
                  color: !vistaAnual ? 'white' : '#64748b'
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
                        <td style={{padding:'7px 10px',color:'#1e293b'}}>{vistaAnual ? fila.anio : fila.mes}</td>
                        <td style={{padding:'7px 10px',textAlign:'right',color:'#b91c1c'}}>{fmt(fila.interes)}</td>
                        <td style={{padding:'7px 10px',textAlign:'right',color:'#15803d'}}>{fmt(fila.capital)}</td>
                        <td style={{padding:'7px 10px',textAlign:'right',color:'#1e293b',fontWeight:600}}>{fmt(fila.saldo)}</td>
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
  const [salarioActual, setSalarioActual] = useState('');
  const [edad, setEdad] = useState('');
  const [semanasCotizadas, setSemanasCotizadas] = useState('');
  const [result, setResult] = useState(null);

  const calcular = () => {
    const sm = parseFloat(salarioActual) || 0;
    const ed = parseInt(edad) || 0;
    const sc = parseInt(semanasCotizadas) || 0;
    if (sm <= 0 || ed <= 0) return;

    const sd = sm / 30;

    // Ley 97 (AFORE) — la mayoría de trabajadores actuales
    const minSemanas = 875; // 2026, sube gradualmente
    const cumpleMinimo = sc >= minSemanas;

    // Estimación de ahorro en AFORE
    const aniosCotizados = sc / 52;
    const aportacionMensual = sm * 0.065; // ~6.5% cuota total AFORE
    const saldoEstimado = aportacionMensual * 12 * aniosCotizados * 1.04; // rendimiento 4% promedio

    // Pensión estimada con AFORE (renta vitalicia muy simplificada)
    const aniosPension = 85 - Math.max(ed, 65);
    const pensionAFORE = aniosPension > 0 ? saldoEstimado / (aniosPension * 12) : 0;

    // Nota: la "pensión garantizada" (Art. 170 LSS) NO se calcula aquí a propósito.
    // Depende de una tabla oficial de dos entradas (semanas cotizadas × salario
    // promedio en UMAs) que se actualiza cada febrero con el INPC — no es un monto
    // fijo, así que no se aproxima con una fórmula de una sola variable.

    setResult({
      sd, sc, minSemanas, cumpleMinimo,
      aniosCotizados, aportacionMensual, saldoEstimado,
      pensionAFORE,
      faltanSemanas: Math.max(minSemanas - sc, 0),
      edadRetiro: 65
    });
  };

  return (
    <div>
      <p style={{color:'#64748b',marginBottom:20,fontSize:14,lineHeight:1.6}}>
        Estima el monto de tu pensión bajo el esquema de Ley 97 (AFORE). En 2026 se requiere un mínimo de 875 semanas cotizadas y una edad mínima de retiro de 65 años.
      </p>
      <div style={styles.grid2}>
        <Field label="Salario mensual actual ($)" value={salarioActual} onChange={setSalarioActual} type="number" placeholder="Ej: 25000" />
        <Field label="Tu edad actual" value={edad} onChange={setEdad} type="number" placeholder="Ej: 35" />
        <Field label="Semanas cotizadas en IMSS" value={semanasCotizadas} onChange={setSemanasCotizadas} type="number" placeholder="Ej: 520" />
      </div>
      <Btn onClick={calcular}>Estimar Pensión</Btn>
      {result && (
        <ResultBox>
          <ResultLine label="Semanas cotizadas" value={result.sc} />
          <ResultLine label={`Mínimo requerido (2026)`} value={`${result.minSemanas} semanas`} />
          <ResultLine label="¿Cumples el mínimo?" value={result.cumpleMinimo ? '✅ Sí' : `❌ Faltan ${result.faltanSemanas} semanas`} color={result.cumpleMinimo ? '#15803d' : '#b91c1c'} />
          <Divider />
          <ResultLine label={`Años cotizados`} value={`${result.aniosCotizados.toFixed(1)} años`} />
          <ResultLine label="Aportación mensual a AFORE (~6.5%)" value={fmt(result.aportacionMensual)} />
          <ResultLine label="Saldo estimado en AFORE" value={fmt(result.saldoEstimado)} bold />
          <Divider />
          <ResultLine label="Pensión estimada con AFORE" value={fmt(result.pensionAFORE) + "/mes"} bold color="#15803d" />
          <div style={{marginTop:12,padding:'12px 14px',background:'#f1f5f9',borderRadius:10,fontSize:13,color:'#475569',lineHeight:1.5}}>
            <strong>Pensión garantizada:</strong> no incluida en esta estimación. Su determinación depende de las semanas cotizadas y del salario promedio expresado en UMAs durante toda tu vida laboral, conforme a la tabla oficial aplicable (Art. 170 LSS) — no es un monto fijo.
          </div>
          <Note>Esta es una proyección ilustrativa del ahorro en AFORE bajo los supuestos indicados (rendimiento 4% anual, aportación ~6.5%), no una cotización ni una determinación oficial de pensión. Tu pensión real también depende del rendimiento real de tu AFORE, las aportaciones voluntarias y tu modalidad de retiro. Consulta tu estado de cuenta en AFORE o el simulador oficial del IMSS para un cálculo preciso.</Note>
        </ResultBox>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES UI
// ═══════════════════════════════════════════════════════════════

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div style={{marginBottom:12}}>
      <label style={{display:'block',fontSize:13,fontWeight:500,color:'#475569',marginBottom:6}}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width:'100%',padding:'12px 14px',border:'2px solid #e2e8f0',borderRadius:10,
          fontSize:15,background:'#f8fafc',transition:'border 0.2s',outline:'none',
          boxSizing:'border-box'
        }}
        onFocus={e => e.target.style.borderColor = '#b45309'}
        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      />
    </div>
  );
}

function Btn({ onClick, children }) {
  return (
    <button onClick={onClick} className="ml-btn" style={{
      width:'100%',padding:'14px 24px',background:'linear-gradient(135deg,#b45309,#92400e)',
      color:'white',border:'none',borderRadius:12,fontSize:16,fontWeight:600,
      cursor:'pointer',marginTop:8,marginBottom:16,transition:'transform 0.1s',
      boxShadow:'0 4px 12px rgba(180,83,9,0.28)'
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
    const texto = encodeURIComponent('Acabo de calcular mis finanzas gratis en MiLana 💰 Pruébalo tú también: https://milanaaqui.mx');
    window.open(`https://wa.me/?text=${texto}`, '_blank', 'noopener,noreferrer');
  };
  return (
    <div className="ml-result" style={{
      background:'#faf7f0',border:'1px solid #e8dcc3',borderRadius:14,boxShadow:'0 2px 10px rgba(0,0,0,0.04)',
      padding:20,marginTop:8
    }}>
      {children}
      <button onClick={compartirWhatsApp} style={{
        width:'100%',marginTop:16,padding:'10px 16px',background:'#e9f9ef',
        border:'1px solid #bfe8cd',borderRadius:10,color:'#15803d',fontSize:13,
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
      padding: bold ? '10px 0' : '8px 0',borderBottom:'1px solid #ece2cb',
      fontSize:14
    }}>
      <span style={{color:'#475569',flex:1,fontSize:bold?13:14}}>{label}</span>
      <span style={{fontWeight: bold ? 700 : 500, fontSize: bold ? 17 : 14, color: color || '#1e293b', textAlign:'right'}}>
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div style={{borderTop:'2px dashed #ddd0b0',margin:'12px 0'}} />;
}

function Note({ children }) {
  return (
    <p style={{fontSize:12,color:'#94a3b8',marginTop:14,lineHeight:1.5,fontStyle:'italic'}}>
      ⚠️ {children}
    </p>
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
  const data = regulatoryData.calculators[id];
  if (!data) return null;

  const fuentes = (data.sources || []).map(s => s.institution).filter(Boolean);
  const fundamento = (data.legalBasis || [])
    .map(l => (l.reference ? `${l.name} — ${l.reference}` : l.name))
    .filter(Boolean);

  const hasSource = fuentes.length > 0;
  const hasLegalBasis = fundamento.length > 0;
  const hasVerificationDate = Boolean(data.verifiedAt);
  const canShowVerified = data.verificationStatus === 'verified' && hasSource && hasLegalBasis && hasVerificationDate;
  const displayStatus = canShowVerified ? 'verified' : (data.verificationStatus === 'blocked' ? 'blocked' : 'needs-review');
  const cfg = FICHA_ESTILOS[displayStatus];
  const Icono = FICHA_ICONOS[displayStatus];

  return (
    <div style={{
      position: 'relative', marginTop: 20, padding: '14px 16px',
      background: 'rgba(255,255,255,0.82)', border: '1px solid #e5e7eb',
      borderLeft: `3px solid ${cfg.status}`, borderRadius: 14,
      boxShadow: '0 1px 2px rgba(15,23,42,0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 650, color: '#172033' }}>
          <span style={{ color: cfg.status, display: 'flex' }}><Icono /></span>
          Sobre este cálculo
        </div>
        <span style={{
          padding: '4px 8px', border: `1px solid ${cfg.border}`, borderRadius: 999,
          background: cfg.bg, color: cfg.status, fontSize: 11, fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap'
        }}>{cfg.label.toUpperCase()}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px' }}>
        <div style={{ flex: '1 1 160px' }}>
          <span style={{ display: 'block', marginBottom: 3, fontSize: 11, fontWeight: 650, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#7b8495' }}>Fundamento</span>
          <span style={{ fontSize: 13, lineHeight: 1.45, color: '#354052' }}>{hasLegalBasis ? fundamento.join('; ') : 'Pendiente de verificación'}</span>
        </div>
        <div style={{ flex: '1 1 110px' }}>
          <span style={{ display: 'block', marginBottom: 3, fontSize: 11, fontWeight: 650, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#7b8495' }}>{cfg.lastLabel}</span>
          <span style={{ fontSize: 13, lineHeight: 1.45, color: '#354052' }}>{data.verifiedAt || 'Pendiente'}</span>
        </div>
        <div style={{ flex: '1 1 100%' }}>
          <span style={{ display: 'block', marginBottom: 3, fontSize: 11, fontWeight: 650, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#7b8495' }}>Fuente</span>
          <span style={{ fontSize: 13, lineHeight: 1.45, color: '#354052' }}>{hasSource ? fuentes.join(', ') : 'Pendiente de verificación'}</span>
        </div>
      </div>
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #edf0f4', fontSize: 12, lineHeight: 1.5, color: '#667085' }}>
        {cfg.closing} Este cálculo es informativo, no una asesoría fiscal o legal.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ═══════════════════════════════════════════════════════════════

const CALCULADORAS = [
  { id: 'finiquito', nombre: 'Finiquito', emoji: '📋', desc: 'Renuncia voluntaria', comp: CalcFiniquito },
  { id: 'liquidacion', nombre: 'Liquidación', emoji: '⚖️', desc: 'Despido injustificado', comp: CalcLiquidacion },
  { id: 'aguinaldo', nombre: 'Aguinaldo', emoji: '🎄', desc: 'Proporcional o completo', comp: CalcAguinaldo },
  { id: 'isr', nombre: 'ISR Mensual', emoji: '🧾', desc: 'Retención de nómina', comp: CalcISR },
  { id: 'resico', nombre: 'RESICO', emoji: '💼', desc: 'Ingresos por actividad independiente', comp: CalcRESICO },
  { id: 'ptu', nombre: 'PTU', emoji: '💰', desc: 'Reparto de utilidades', comp: CalcPTU },
  { id: 'bruto-neto', nombre: 'Bruto a Neto', emoji: '💵', desc: 'Salario neto real', comp: CalcBrutoNeto },
  { id: 'vacaciones', nombre: 'Vacaciones', emoji: '🏖️', desc: 'Días según antigüedad', comp: CalcVacaciones },
  { id: 'infonavit', nombre: 'Infonavit', emoji: '🏠', desc: 'Simulador de crédito', comp: CalcInfonavit },
  { id: 'pension', nombre: 'Pensión IMSS', emoji: '👴', desc: 'Estimación Ley 97', comp: CalcPension },
];

const styles = {
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }
};

export default function App() { if (typeof window !== 'undefined' && window.location.pathname.replace(/\/$/,'') === '/privacidad') { return (<div style={{maxWidth:680,margin:'40px auto',padding:'0 16px 60px',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',color:'#1e293b',lineHeight:1.7}}><h1 style={{fontSize:26,color:'#16324a'}}>Política de Privacidad</h1><p>MiLana ("el Sitio", "nosotros") es un sitio informativo de calculadoras financieras y fiscales para México. Esta política explica qué datos se recopilan y cómo se usan.</p><h2 style={{fontSize:18,color:'#16324a'}}>Datos que recopilamos</h2><p>Las calculadoras del Sitio funcionan enteramente en tu navegador: los datos que ingresas (salarios, fechas, etc.) no se envían ni se almacenan en nuestros servidores.</p><h2 style={{fontSize:18,color:'#16324a'}}>Analítica y cookies</h2><p>Usamos Google Analytics para entender el uso general del Sitio (páginas vistas, país, dispositivo) de forma agregada y anónima. Puede usar cookies, que puedes bloquear desde la configuración de tu navegador.</p><h2 style={{fontSize:18,color:'#16324a'}}>Publicidad</h2><p>Este Sitio puede mostrar anuncios de Google AdSense. Google y sus socios publicitarios pueden usar cookies para mostrar anuncios relevantes según tus visitas a este y otros sitios. Puedes gestionar tus preferencias en la Configuración de anuncios de Google.</p><h2 style={{fontSize:18,color:'#16324a'}}>Contacto</h2><p>Para dudas sobre esta política, contáctanos a través de nuestras redes sociales.</p><p style={{fontSize:12,color:'#94a3b8',marginTop:24}}>Última actualización: septiembre 2026.</p><a href="/" style={{color:'#b45309'}}>← Volver a MiLana</a></div>); }
  const [activa, setActiva] = useState(null);
  const [cerrando, setCerrando] = useState(false);
  const cerrarCalc = () => { setCerrando(true); setTimeout(() => { setActiva(null); setCerrando(false); }, 180); };

  const Comp = activa ? CALCULADORAS.find(c => c.id === activa)?.comp : null;
  const calc = CALCULADORAS.find(c => c.id === activa);

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(180deg,#faf8f4 0%,#f3efe6 35%,#f8fafc 100%)',
      fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'
    }}>
      <div style={{maxWidth:680,margin:'0 auto',padding:'24px 16px'}}>
        
        <style>{`@keyframes mlFadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes mlPopIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}.ml-panel{animation:mlFadeInUp 0.35s ease-out}.ml-result{animation:mlPopIn 0.3s ease-out}.ml-btn:hover{filter:brightness(1.05);transform:translateY(-1px)}@keyframes mlFadeOutDown{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(8px)}}.ml-panel-out{animation:mlFadeOutDown 0.18s ease-in forwards}.ml-calc-card{transition:border-color 0.15s,box-shadow 0.15s,transform 0.15s}.ml-calc-card:hover{border-color:#b45309;transform:translateY(-2px);box-shadow:0 8px 24px rgba(180,83,9,0.14)}@media (prefers-reduced-motion: reduce){.ml-panel,.ml-result,.ml-panel-out{animation:none}.ml-btn:hover{transform:none}.ml-calc-card:hover{transform:none}}`}</style>{/* Header */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <span style={{
            display:'inline-block',fontSize:11,fontWeight:700,color:'#92400e',
            letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:12,
            background:'#f3efe6',padding:'4px 12px',borderRadius:20,
            border:'1px solid #e8dcc3'
          }}>
            México
          </span>
          <h1 style={{
            fontSize:28,fontWeight:800,color:'#16324a',margin:'0 0 4px 0',
            letterSpacing:'-0.5px'
          }}>
            MiLana
          </h1>
          <p style={{color:'#64748b',fontSize:14,margin:0}}>
            Calculadoras financieras y fiscales para México — Datos 2026
          </p>
          <div style={{
            display:'inline-flex',alignItems:'center',gap:6,
            background:'#eef7f0',color:'#15803d',padding:'4px 12px',
            borderRadius:20,fontSize:11,fontWeight:600,marginTop:8
          }}>
            <span style={{width:6,height:6,background:'#15803d',borderRadius:'50%',display:'inline-block'}} />
            Fuentes y fecha de revisión por calculadora
          </div>
        </div>

        {/* Calculadora activa */}
        {(activa || cerrando) && (
          <div key={activa} className={cerrando ? "ml-panel ml-panel-out" : "ml-panel"} style={{marginBottom:24}}>
            <button onClick={cerrarCalc} style={{
              background:'none',border:'none',color:'#b45309',fontSize:14,
              cursor:'pointer',padding:'8px 0',fontWeight:500,display:'flex',
              alignItems:'center',gap:4
            }}>
              ← Todas las calculadoras
            </button>
            <div style={{
              background:'white',borderRadius:16,padding:24,
              boxShadow:'0 4px 24px rgba(0,0,0,0.06)',
              border:'1px solid #e2e8f0'
            }}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
                <span style={{fontSize:28}}>{calc.emoji}</span>
                <div>
                  <h2 style={{margin:0,fontSize:20,fontWeight:700,color:'#16324a'}}>{calc.nombre}</h2>
                  <span style={{fontSize:12,color:'#94a3b8'}}>{calc.desc}</span>
                </div>
              </div>
              <Comp />
              <FichaConfianza id={calc.id} />
            </div>
          </div>
        )}

        {/* Grid de calculadoras */}
        {!activa && (
          <>
            <h2 style={{fontSize:15,fontWeight:600,color:'#475569',margin:'0 0 12px 4px'}}>¿Qué necesitas calcular?</h2>
            <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:12}}>
            {CALCULADORAS.map(c => (
              <button key={c.id} onClick={() => setActiva(c.id)} className="ml-calc-card" style={{
                flex:'1 1 150px',maxWidth:200,
                background:'white',border:'2px solid #e2e8f0',borderRadius:14,
                padding:'20px 14px',textAlign:'center',cursor:'pointer',
                boxShadow:'0 2px 8px rgba(0,0,0,0.04)'
              }}
              >
                <div style={{fontSize:32,marginBottom:8}}>{c.emoji}</div>
                <div style={{fontSize:14,fontWeight:600,color:'#1e293b'}}>{c.nombre}</div>
                <div style={{fontSize:11,color:'#94a3b8',marginTop:4}}>{c.desc}</div>
              </button>
              ))}
            </div>
          </>
        )}

        {/* Footer con datos legales */}
        <div style={{textAlign:'center',marginTop:40,padding:'20px 0',borderTop:'1px solid #e2e8f0'}}>
          <p style={{fontSize:11,color:'#94a3b8',lineHeight:1.6,margin:0}}>
            Datos basados en: Anexo 8 RMF 2026 (DOF 28/12/2025) · Ley Federal del Trabajo · CONASAMI · INEGI UMA 2026
            <br/>
            Salario mínimo general: ${SALARIO_MINIMO_GENERAL}/día · Frontera: ${SALARIO_MINIMO_FRONTERA}/día · UMA: ${UMA_DIARIA}/día
            <br/>
            Los cálculos son estimaciones informativas. Para montos exactos consulta con un especialista fiscal o laboral.
          </p>
          <p style={{fontSize:11,color:'#cbd5e1',marginTop:8}}>
            MiLana © 2026 · Hecho en México · <a href="/privacidad" style={{color:'#94a3b8'}}>Privacidad</a>
          </p>
        </div>
      </div>
    </div>
  );
}
