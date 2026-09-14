import { calcularISR } from './calculos-revisados.mjs';

export const UMA_DIARIA_2026 = 117.31;
export const SALARIOS_MINIMOS_2026 = Object.freeze({
  general: 315.04,
  frontera: 440.87,
});

const DIA = 86_400_000;

function numero(value, nombre, { min = 0, max = Number.MAX_SAFE_INTEGER, decimales = 2, permiteCero = false } = {}) {
  const texto = String(value ?? '').trim();
  const re = decimales === 0 ? /^\d+$/ : new RegExp(`^\\d+(?:\\.\\d{1,${decimales}})?$`);
  if (!re.test(texto)) throw new Error(`${nombre}: captura un número válido.`);
  const n = Number(texto);
  if (!Number.isFinite(n) || n < min || n > max || (!permiteCero && n === 0)) {
    throw new Error(`${nombre}: revisa el valor capturado.`);
  }
  return n;
}

function opcionalNoNegativo(value, nombre, max = 1_000_000) {
  if (value === '' || value == null) return 0;
  return numero(value, nombre, { min: 0, max, decimales: 2, permiteCero: true });
}

function fechaCivil(texto, nombre) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(texto || ''))) throw new Error(`${nombre}: captura una fecha válida.`);
  const [y, m, d] = texto.split('-').map(Number);
  const ms = Date.UTC(y, m - 1, d);
  const f = new Date(ms);
  if (f.getUTCFullYear() !== y || f.getUTCMonth() !== m - 1 || f.getUTCDate() !== d) {
    throw new Error(`${nombre}: captura una fecha válida.`);
  }
  return { y, m, d, ms };
}

function ultimoDiaMes(y, m) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function aniversario(fechaIngreso, y) {
  const d = Math.min(fechaIngreso.d, ultimoDiaMes(y, fechaIngreso.m));
  return Date.UTC(y, fechaIngreso.m - 1, d);
}

function datosServicio(fechaIngreso, fechaSalida) {
  const ingreso = fechaCivil(fechaIngreso, 'Fecha de ingreso');
  const salida = fechaCivil(fechaSalida, 'Fecha de salida');
  if (salida.ms < ingreso.ms) throw new Error('La fecha de salida no puede ser anterior a la fecha de ingreso.');
  if (salida.y !== 2026) throw new Error('Este cálculo está acotado a terminaciones ocurridas durante 2026.');

  let completos = salida.y - ingreso.y;
  if (aniversario(ingreso, ingreso.y + completos) > salida.ms) completos -= 1;
  completos = Math.max(0, completos);

  const ultimoAniversario = aniversario(ingreso, ingreso.y + completos);
  const siguienteAniversario = aniversario(ingreso, ingreso.y + completos + 1);
  const diasCiclo = Math.max(1, Math.round((siguienteAniversario - ultimoAniversario) / DIA));
  const diasTranscurridosCiclo = Math.max(0, Math.floor((salida.ms - ultimoAniversario) / DIA));
  // Para prestaciones proporcionales por días sí se cuenta el último día trabajado.
  // Para antigüedad, en cambio, el propio aniversario representa exactamente el
  // número de años completos: no se suma artificialmente un día de fracción.
  const diasCicloActual = diasTranscurridosCiclo + 1;
  const diasServicio = Math.floor((salida.ms - ingreso.ms) / DIA) + 1;
  const aniosEquivalentes = completos + (diasTranscurridosCiclo / diasCiclo);

  const inicioAguinaldo = Math.max(ingreso.ms, Date.UTC(2026, 0, 1));
  const diasAguinaldo = Math.floor((salida.ms - inicioAguinaldo) / DIA) + 1;

  return {
    ingreso,
    salida,
    aniosCompletos: completos,
    aniosEquivalentes,
    diasServicio,
    diasCiclo,
    diasCicloActual,
    diasAguinaldo,
  };
}

export function diasVacacionesLFT(anioPrestacion) {
  const a = Math.max(1, Math.floor(Number(anioPrestacion) || 1));
  if (a <= 5) return 10 + (2 * a);
  return 22 + (2 * Math.floor((a - 6) / 5));
}

function parametrosPrestaciones({ datos, diasAguinaldo = '15', primaVacacionalPct = '25', diasVacacionesAnuales = '' }) {
  const aguinaldo = numero(diasAguinaldo, 'Días de aguinaldo', { min: 15, max: 365, decimales: 2 });
  const primaPct = numero(primaVacacionalPct, 'Prima vacacional', { min: 25, max: 500, decimales: 2 });
  const minimoVac = diasVacacionesLFT(datos.aniosCompletos + 1);
  const vacAnuales = diasVacacionesAnuales === '' || diasVacacionesAnuales == null
    ? minimoVac
    : numero(diasVacacionesAnuales, 'Días anuales de vacaciones', { min: minimoVac, max: 365, decimales: 2 });
  return { aguinaldo, primaPct, minimoVac, vacAnuales };
}

function zonaValida(zona) {
  if (!Object.prototype.hasOwnProperty.call(SALARIOS_MINIMOS_2026, zona)) {
    throw new Error('Selecciona la zona de salario mínimo aplicable.');
  }
  return zona;
}

export function calcularFiniquito2026({
  salarioMensual,
  fechaIngreso,
  fechaSalida,
  diasTrabajadosNoPagados = '0',
  vacacionesPendientes = '0',
  causa = 'renuncia',
  zona = 'general',
  diasAguinaldo = '15',
  primaVacacionalPct = '25',
  diasVacacionesAnuales = '',
}) {
  const salario = numero(salarioMensual, 'Salario mensual', { min: 0.01, max: 100_000_000, decimales: 2 });
  const datos = datosServicio(fechaIngreso, fechaSalida);
  const zonaOk = zonaValida(zona);
  if (!['renuncia', 'separacion-patron'].includes(causa)) throw new Error('Selecciona cómo terminó la relación laboral.');

  const pendientesSalario = opcionalNoNegativo(diasTrabajadosNoPagados, 'Días trabajados no pagados', 31);
  const vacPendientes = opcionalNoNegativo(vacacionesPendientes, 'Vacaciones pendientes', 365);
  const prestaciones = parametrosPrestaciones({ datos, diasAguinaldo, primaVacacionalPct, diasVacacionesAnuales });
  const salarioDiario = salario / 30;

  const pagoSalarioPendiente = salarioDiario * pendientesSalario;
  const aguinaldoProporcional = salarioDiario * prestaciones.aguinaldo * (datos.diasAguinaldo / 365);
  const vacacionesProporcionalesDias = prestaciones.vacAnuales * (datos.diasCicloActual / datos.diasCiclo);
  const vacacionesTotalesDias = vacacionesProporcionalesDias + vacPendientes;
  const pagoVacaciones = salarioDiario * vacacionesTotalesDias;
  const primaVacacional = pagoVacaciones * (prestaciones.primaPct / 100);

  const aplicaPrimaAntiguedad = causa === 'separacion-patron' || (causa === 'renuncia' && datos.aniosCompletos >= 15);
  const topePrimaDiario = SALARIOS_MINIMOS_2026[zonaOk] * 2;
  const primaAntiguedad = aplicaPrimaAntiguedad
    ? 12 * Math.min(salarioDiario, topePrimaDiario) * datos.aniosEquivalentes
    : 0;

  const subtotalSinPrimaAntiguedad = pagoSalarioPendiente + aguinaldoProporcional + pagoVacaciones + primaVacacional;
  const totalBruto = subtotalSinPrimaAntiguedad + primaAntiguedad;

  return {
    salarioDiario,
    ...datos,
    ...prestaciones,
    pagoSalarioPendiente,
    aguinaldoProporcional,
    vacacionesProporcionalesDias,
    vacacionesPendientesDias: vacPendientes,
    vacacionesTotalesDias,
    pagoVacaciones,
    primaVacacional,
    aplicaPrimaAntiguedad,
    topePrimaDiario,
    primaAntiguedad,
    subtotalSinPrimaAntiguedad,
    totalBruto,
  };
}

export function calcularLiquidacion2026({
  salarioMensual,
  fechaIngreso,
  fechaSalida,
  diasTrabajadosNoPagados = '0',
  vacacionesPendientes = '0',
  zona = 'general',
  diasAguinaldo = '15',
  primaVacacionalPct = '25',
  diasVacacionesAnuales = '',
  relacionIndeterminada = false,
  incluirVeinteDias = false,
}) {
  if (relacionIndeterminada !== true) {
    throw new Error('Este modo cubre una relación por tiempo indeterminado. Confirma ese supuesto para continuar.');
  }

  const finiquito = calcularFiniquito2026({
    salarioMensual,
    fechaIngreso,
    fechaSalida,
    diasTrabajadosNoPagados,
    vacacionesPendientes,
    causa: 'separacion-patron',
    zona,
    diasAguinaldo,
    primaVacacionalPct,
    diasVacacionesAnuales,
  });

  const factorIntegracion = 1 + (finiquito.aguinaldo / 365) + ((finiquito.vacAnuales * finiquito.primaPct / 100) / 365);
  const salarioDiarioIntegrado = finiquito.salarioDiario * factorIntegracion;
  const indemnizacionTresMeses = salarioDiarioIntegrado * 90;
  const indemnizacionVeinteDias = incluirVeinteDias
    ? salarioDiarioIntegrado * 20 * finiquito.aniosEquivalentes
    : 0;
  const subtotalIndemnizacion = indemnizacionTresMeses + indemnizacionVeinteDias + finiquito.primaAntiguedad;
  const totalBruto = finiquito.subtotalSinPrimaAntiguedad + subtotalIndemnizacion;

  return {
    ...finiquito,
    factorIntegracion,
    salarioDiarioIntegrado,
    indemnizacionTresMeses,
    incluyeVeinteDias: Boolean(incluirVeinteDias),
    indemnizacionVeinteDias,
    subtotalIndemnizacion,
    totalBruto,
  };
}

export function calcularCuotaObreraIMSS2026({ sbcDiario, diasCotizados, soloMinimo = false }) {
  const dias = numero(diasCotizados, 'Días cotizados', { min: 1, max: 31, decimales: 0 });
  if (soloMinimo === true) {
    return { diasCotizados: dias, sbcCapturado: Number(sbcDiario || 0), sbcAplicado: Number(sbcDiario || 0), cuotaObrera: 0, topeSbc: 25 * UMA_DIARIA_2026 };
  }
  const sbc = numero(sbcDiario, 'SBC diario', { min: 0.01, max: 1_000_000, decimales: 2 });
  const topeSbc = 25 * UMA_DIARIA_2026;
  const sbcAplicado = Math.min(sbc, topeSbc);
  const fija = sbcAplicado * dias * 0.02375;
  const excedenteTresUma = Math.max(sbcAplicado - (3 * UMA_DIARIA_2026), 0) * dias * 0.004;
  return { diasCotizados: dias, sbcCapturado: sbc, sbcAplicado, topeSbc, cuotaObrera: fija + excedenteTresUma };
}

export function calcularBrutoNeto2026({
  brutoMensual,
  ingresoGravableISR,
  sbcDiario,
  diasCotizados,
  soloMinimo,
  periodo = '2026-09',
  empleadorUnico = true,
}) {
  const bruto = numero(brutoMensual, 'Percepciones brutas del mes', { min: 0.01, max: 100_000_000, decimales: 2 });
  const gravable = numero(ingresoGravableISR, 'Ingreso gravable para ISR', { min: 0.01, max: 100_000_000, decimales: 2 });
  if (gravable > bruto) throw new Error('El ingreso gravable para ISR no puede superar las percepciones brutas capturadas en este modo.');
  if (typeof soloMinimo !== 'boolean') throw new Error('Indica si percibiste únicamente el salario mínimo general de tu zona.');
  if (empleadorUnico !== true) throw new Error('Este modo cubre un mes completo ordinario con un solo empleador.');

  const isr = calcularISR({ ingreso: gravable, soloMinimo, periodo, empleadorUnico: true });
  const imss = calcularCuotaObreraIMSS2026({ sbcDiario, diasCotizados, soloMinimo });
  const netoDespuesISRIMSS = bruto - isr.retenido - imss.cuotaObrera;
  if (netoDespuesISRIMSS < 0) throw new Error('Las bases capturadas producen deducciones superiores al bruto. Revisa los datos.');

  return {
    bruto,
    gravable,
    ...isr,
    ...imss,
    netoDespuesISRIMSS,
    otrasDeduccionesIncluidas: false,
  };
}
