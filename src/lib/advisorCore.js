const numeroSeguro = (valor) => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? Math.max(0, numero) : 0;
};

const mesesParaMeta = (faltante, aportacion) => {
  if (faltante <= 0) return 0;
  if (aportacion <= 0) return null;
  return Math.ceil(faltante / aportacion);
};

export function crearRadiografiaFinanciera(entrada = {}) {
  const ingresoNeto = numeroSeguro(entrada.ingresoNeto);
  const gastosEsenciales = numeroSeguro(entrada.gastosEsenciales);
  const gastosVariables = numeroSeguro(entrada.gastosVariables);
  const pagosDeuda = numeroSeguro(entrada.pagosDeuda);
  const fondoActual = numeroSeguro(entrada.fondoActual);
  const metaObjetivo = numeroSeguro(entrada.metaObjetivo);
  const ahorroMetaActual = numeroSeguro(entrada.ahorroMetaActual);
  const horizonteMeses = Math.floor(numeroSeguro(entrada.horizonteMeses));
  const objetivo = typeof entrada.objetivo === 'string' ? entrada.objetivo.trim().toLowerCase() : '';

  const gastoTotal = gastosEsenciales + gastosVariables + pagosDeuda;
  const disponible = ingresoNeto - gastoTotal;
  const disponiblePositivo = Math.max(0, disponible);
  const proporcionDeuda = ingresoNeto > 0 ? (pagosDeuda / ingresoNeto) * 100 : 0;

  const fondoMinimo = gastosEsenciales * 3;
  const fondoAmplio = gastosEsenciales * 6;
  const brechaFondoMinimo = Math.max(0, fondoMinimo - fondoActual);
  const brechaFondoAmplio = Math.max(0, fondoAmplio - fondoActual);

  const brechaMeta = Math.max(0, metaObjetivo - ahorroMetaActual);
  const aporteMetaPorHorizonte = horizonteMeses > 0 ? brechaMeta / horizonteMeses : null;
  const mesesMetaConDisponible = mesesParaMeta(brechaMeta, disponiblePositivo);

  const banderas = {
    tieneIngreso: ingresoNeto > 0,
    flujoNegativo: ingresoNeto > 0 && disponible < 0,
    flujoPositivo: disponible > 0,
    tienePagosDeuda: pagosDeuda > 0,
    fondoDebajoTresMeses: gastosEsenciales > 0 && fondoActual < fondoMinimo,
    fondoEntreTresYSeisMeses: gastosEsenciales > 0 && fondoActual >= fondoMinimo && fondoActual < fondoAmplio,
    fondoSeisMesesOMas: gastosEsenciales > 0 && fondoActual >= fondoAmplio,
    metaDefinida: metaObjetivo > 0,
    horizonteDefinido: horizonteMeses > 0,
  };

  return {
    version: 1,
    entrada: {
      ingresoNeto,
      gastosEsenciales,
      gastosVariables,
      pagosDeuda,
      fondoActual,
      objetivo,
      metaObjetivo,
      ahorroMetaActual,
      horizonteMeses,
    },
    flujo: {
      gastoTotal,
      disponible,
      disponiblePct: ingresoNeto > 0 ? (disponible / ingresoNeto) * 100 : 0,
    },
    deuda: {
      pagosMensuales: pagosDeuda,
      proporcionIngresoPct: proporcionDeuda,
      nota: 'Proporción descriptiva del ingreso neto; no es un límite de aprobación de crédito.',
    },
    emergencia: {
      referenciaTresMeses: fondoMinimo,
      referenciaSeisMeses: fondoAmplio,
      fondoActual,
      brechaTresMeses: brechaFondoMinimo,
      brechaSeisMeses: brechaFondoAmplio,
      mesesATresConDisponible: mesesParaMeta(brechaFondoMinimo, disponiblePositivo),
      mesesASeisConDisponible: mesesParaMeta(brechaFondoAmplio, disponiblePositivo),
      nota: 'La referencia de 3 a 6 meses es educativa; la liquidez y el monto adecuado dependen de la situación de cada persona.',
    },
    meta: {
      tipo: objetivo,
      monto: metaObjetivo,
      ahorroActual: ahorroMetaActual,
      faltante: brechaMeta,
      horizonteMeses,
      aporteMensualNecesarioSinRendimiento: aporteMetaPorHorizonte,
      mesesConDisponibleActualSinRendimiento: mesesMetaConDisponible,
      nota: 'Los escenarios de meta no suponen rendimientos, inflación ni cambios futuros en ingreso o gasto.',
    },
    banderas,
  };
}

export function crearEscenariosIngreso(radiografia, incrementos = [10, 20, 30]) {
  const base = radiografia?.entrada?.ingresoNeto ?? 0;
  const gastoTotal = radiografia?.flujo?.gastoTotal ?? 0;

  return incrementos.map((incremento) => {
    const pct = numeroSeguro(incremento);
    const ingresoEscenario = base * (1 + pct / 100);
    const disponibleEscenario = ingresoEscenario - gastoTotal;
    return {
      incrementoPct: pct,
      ingresoNetoEscenario: ingresoEscenario,
      disponibleEscenario,
      diferenciaDisponible: disponibleEscenario - (radiografia?.flujo?.disponible ?? 0),
      nota: 'Escenario matemático sobre ingreso neto; no recalcula impuestos ni garantiza un aumento salarial.',
    };
  });
}

export function crearRutaAsesor(radiografia) {
  const b = radiografia?.banderas ?? {};
  const objetivo = radiografia?.meta?.tipo ?? '';
  const acciones = [];

  if (!b.tieneIngreso || b.flujoNegativo) {
    acciones.push({ id: 'presupuesto', href: '/finanzas/presupuesto', prioridad: 1, motivo: 'Entender primero el flujo mensual capturado.' });
  }

  if (b.fondoDebajoTresMeses) {
    acciones.push({ id: 'fondo-emergencia', href: '/finanzas/fondo-emergencia', prioridad: 2, motivo: 'Comparar el ahorro líquido actual con la referencia educativa de tres meses de gastos esenciales.' });
  }

  if (b.tienePagosDeuda) {
    acciones.push({ id: 'deuda', href: '/finanzas/deuda-y-credito', prioridad: 3, motivo: 'Hacer visible cuánto ingreso neto ya está comprometido en pagos.' });
  }

  if (b.metaDefinida) {
    acciones.push({ id: 'ahorro', href: '/finanzas/ahorro', prioridad: 4, motivo: 'Convertir la meta y el horizonte en una aportación mensual sin asumir rendimientos.' });
  }

  if (objetivo === 'vivienda') {
    acciones.push({ id: 'vivienda', href: '/finanzas/vivienda', prioridad: 5, motivo: 'Conectar flujo, ahorro y deuda con la decisión de vivienda.' });
  }

  if (objetivo === 'retiro') {
    acciones.push({ id: 'retiro', href: '/calculadoras/pension-imss', prioridad: 5, motivo: 'Continuar con requisitos y escenarios de retiro dentro del alcance de MiLana.' });
  }

  const unicas = [...new Map(acciones.map((accion) => [accion.id, accion])).values()]
    .sort((a, b2) => a.prioridad - b2.prioridad);

  return {
    acciones: unicas,
    inversion: {
      estado: b.flujoPositivo && !b.fondoDebajoTresMeses ? 'contexto-educativo-disponible' : 'solo-educacion',
      motivo: b.flujoPositivo && !b.fondoDebajoTresMeses
        ? 'El flujo capturado es positivo y el fondo alcanza la referencia educativa de tres meses. Esto no constituye una recomendación de invertir.'
        : 'MiLana no debe convertir un flujo insuficiente o un fondo por debajo de la referencia educativa en una recomendación transaccional.',
      puedeRecomendarProducto: false,
    },
  };
}
