// Fórmulas que antes vivían dentro de los componentes de App.jsx, movidas sin cambios a funciones puras
// para poder probarlas (mejora 2026-11). Valores verificados el 2026-11-09 (docs/mejora-2026-11/00-auditoria.md).
import { UMA_DIARIA_2026 } from './calculos-laborales-2026.mjs';

// LISR art. 113-E, tabla mensual RESICO (Cámara de Diputados, última reforma DOF 01-04-2024).
export const RESICO_TASAS_2026 = [
  { li: 0.01, ls: 25000.00, tasa: 1.00 },
  { li: 25000.01, ls: 50000.00, tasa: 1.10 },
  { li: 50000.01, ls: 83333.33, tasa: 1.50 },
  { li: 83333.34, ls: 208333.33, tasa: 2.00 },
  { li: 208333.34, ls: 3500000.00, tasa: 2.50 },
];

function positivo(texto, nombre) {
  const n = Number(String(texto ?? '').replace(/[$,\s]/g, ''));
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${nombre}: escribe una cantidad mayor que cero.`);
  return n;
}

export function calcularRESICO({ ingresoMensual }) {
  const ingreso = positivo(ingresoMensual, 'Ingresos del mes');
  const tramo = RESICO_TASAS_2026.find((r) => ingreso <= r.ls) || RESICO_TASAS_2026[RESICO_TASAS_2026.length - 1];
  const isr = ingreso * tramo.tasa / 100;
  return { ingreso, tasa: tramo.tasa, isr, neto: ingreso - isr };
}

// LFT art. 117 y resolución de la Comisión Nacional para la PTU: 10% de la renta gravable de la empresa.
export function calcularPTUTotal({ rentaGravable }) {
  const renta = positivo(rentaGravable, 'Renta gravable de la empresa');
  return { renta, repartoTotal: renta * 0.10 };
}

// LFT art. 76 (reforma DOF 27-12-2022): 12 días el primer año, +2 hasta 20; desde el 6.º, +2 cada 5 años. Art. 80: prima ≥ 25%.
export function diasVacacionesLFT2026(anios) {
  const a = Math.floor(anios);
  if (a < 1) return 0;
  if (a <= 5) return 10 + 2 * a;
  return 22 + 2 * Math.floor((a - 6) / 5);
}

export function calcularVacaciones({ anios, sueldoMensual = '', primaPct = '25' }) {
  const a = Math.floor(positivo(anios, 'Años cumplidos'));
  const dias = diasVacacionesLFT2026(a);
  const prima = Number(primaPct) / 100;
  if (!(prima >= 0.25)) throw new Error('La prima vacacional es de al menos 25%.');
  const sueldo = String(sueldoMensual).trim() ? positivo(sueldoMensual, 'Sueldo mensual') : 0;
  const diario = sueldo / 30;
  const pagoDias = diario * dias;
  const primaVacacional = pagoDias * prima;
  return { anios: a, dias, diario, pagoDias, primaVacacional, total: pagoDias + primaVacacional, prima };
}

// Amortización francesa: pago fijo de capital e intereses. No es un cálculo oficial de Infonavit.
export function calcularCredito({ monto, tasaAnual, plazoAnios }) {
  const m = positivo(monto, 'Monto del crédito');
  const tasa = Number(String(tasaAnual).replace(',', '.'));
  if (!Number.isFinite(tasa) || tasa < 0 || tasa > 100) throw new Error('Tasa anual: revisa el porcentaje.');
  const plazo = Math.floor(positivo(plazoAnios, 'Plazo'));
  const i = tasa / 100 / 12;
  const n = plazo * 12;
  const pago = i === 0 ? m / n : m * (i * (1 + i) ** n) / ((1 + i) ** n - 1);
  const tablaMensual = [];
  let saldo = m;
  for (let mes = 1; mes <= n; mes++) {
    const interes = saldo * i;
    let capital = pago - interes;
    let pagoFila = pago;
    if (mes === n) { capital = saldo; pagoFila = capital + interes; }
    saldo = Math.max(saldo - capital, 0);
    tablaMensual.push({ mes, pago: pagoFila, interes, capital, saldo });
  }
  const totalPagado = tablaMensual.reduce((s, f) => s + f.pago, 0);
  const tablaAnual = [];
  for (let anio = 1; anio <= plazo; anio++) {
    const filas = tablaMensual.slice((anio - 1) * 12, anio * 12);
    tablaAnual.push({ anio, interes: filas.reduce((s, f) => s + f.interes, 0), capital: filas.reduce((s, f) => s + f.capital, 0), saldo: filas[filas.length - 1].saldo });
  }
  return { monto: m, tasa, plazo, pagoMensual: pago, totalPagado, totalIntereses: totalPagado - m, tablaAnual };
}

// LSS, transitorio Cuarto del decreto DOF 16-12-2020: 750 semanas en 2021, +25 por año hasta 1,000 en 2031.
export const SEMANAS_MINIMAS_2026 = 875;
export function revisarPension({ edad, semanas }) {
  const e = Math.floor(positivo(edad, 'Edad'));
  const s = String(semanas ?? '').trim() === '' ? 0 : Math.floor(Number(semanas));
  if (!Number.isFinite(s) || s < 0) throw new Error('Semanas cotizadas: revisa el número.');
  return {
    edad: e,
    semanas: s,
    minimo: SEMANAS_MINIMAS_2026,
    faltan: Math.max(SEMANAS_MINIMAS_2026 - s, 0),
    cumpleSemanas: s >= SEMANAS_MINIMAS_2026,
    tipo: e >= 65 ? 'vejez' : e >= 60 ? 'cesantia' : null,
    aniosParaSesenta: Math.max(60 - e, 0),
  };
}

// Bruto a neto: estimación del Salario Base de Cotización cuando la persona no lo conoce.
// Factor de integración mínimo de ley para el primer año: (365 + 15 días de aguinaldo + 12 días × 25% de prima) / 365.
export const FACTOR_INTEGRACION_MINIMO = (365 + 15 + 12 * 0.25) / 365;
export function sbcEstimado(sueldoMensual) {
  const sueldo = positivo(sueldoMensual, 'Sueldo');
  return Math.round((sueldo / 30) * FACTOR_INTEGRACION_MINIMO * 100) / 100;
}
export const TOPE_SBC_2026 = 25 * UMA_DIARIA_2026;
