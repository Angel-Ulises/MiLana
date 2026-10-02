const numeroSeguro = (valor) => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? Math.max(0, numero) : 0;
};

const datoNumericoCapturado = (valor) => {
  if (valor === undefined || valor === null) return false;
  if (typeof valor === 'string' && valor.trim() === '') return false;
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0;
};

const mesesParaMeta = (faltante, aportacion) => {
  if (faltante <= 0) return 0;
  if (aportacion <= 0) return null;
  return Math.ceil(faltante / aportacion);
};

const horizonteTexto = (meses) => {
  if (meses <= 0) return 'sin horizonte capturado';
  if (meses <= 12) return 'hasta 12 meses';
  if (meses <= 60) return 'entre 1 y 5 años';
  return 'más de 5 años';
};

const perfilHorizonte = (meses) => {
  if (meses <= 0) {
    return {
      id: 'sin-definir',
      etiqueta: 'Sin horizonte definido',
      lectura: 'Sin una fecha aproximada no puede compararse cuánta liquidez debería conservarse ni cuánto tiempo existe para absorber variaciones.',
    };
  }
  if (meses <= 12) {
    return {
      id: 'corto',
      etiqueta: 'Horizonte corto · hasta 12 meses',
      lectura: 'El tiempo para recuperar una caída o inmovilizar recursos es limitado. La liquidez y la estabilidad deben quedar explícitas al comparar alternativas.',
    };
  }
  if (meses <= 60) {
    return {
      id: 'medio',
      etiqueta: 'Horizonte medio · 1 a 5 años',
      lectura: 'Existe más tiempo, pero siguen importando la fecha de uso, la liquidez, los costos y la posibilidad de necesitar el dinero antes de lo previsto.',
    };
  }
  return {
    id: 'largo',
    etiqueta: 'Horizonte largo · más de 5 años',
    lectura: 'Un plazo largo no elimina pérdidas ni riesgo. Hace especialmente importante entender variación, diversificación, costos acumulados e inflación.',
  };
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

  const capturado = {
    ingresoNeto: datoNumericoCapturado(entrada.ingresoNeto),
    gastosEsenciales: datoNumericoCapturado(entrada.gastosEsenciales),
    gastosVariables: datoNumericoCapturado(entrada.gastosVariables),
    pagosDeuda: datoNumericoCapturado(entrada.pagosDeuda),
    fondoActual: datoNumericoCapturado(entrada.fondoActual),
    metaObjetivo: datoNumericoCapturado(entrada.metaObjetivo),
    ahorroMetaActual: datoNumericoCapturado(entrada.ahorroMetaActual),
    horizonteMeses: datoNumericoCapturado(entrada.horizonteMeses) && horizonteMeses > 0,
  };

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
    version: 3,
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
    capturado,
    flujo: {
      gastoTotal,
      disponible,
      disponiblePct: ingresoNeto > 0 ? (disponible / ingresoNeto) * 100 : 0,
    },
    deuda: {
      pagosMensuales: pagosDeuda,
      proporcionIngresoPct: proporcionDeuda,
      nota: 'Proporción descriptiva del ingreso neto; no es un límite de aprobación de crédito ni permite saber el costo financiero de la deuda.',
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

export function crearMapaPreparacionInversion(radiografia) {
  const r = radiografia ?? crearRadiografiaFinanciera();
  const c = r.capturado ?? {};
  const b = r.banderas ?? {};
  const factores = [];

  if (!c.ingresoNeto || !c.gastosEsenciales) {
    factores.push({ id: 'flujo', estado: 'faltan-datos', titulo: 'Flujo mensual', detalle: 'Falta capturar ingreso neto y gastos esenciales para entender si existe dinero realmente disponible.' });
  } else if (r.flujo.disponible <= 0) {
    factores.push({ id: 'flujo', estado: 'revisar', titulo: 'Flujo mensual', detalle: 'Los rubros capturados no dejan flujo positivo. MiLana no convierte este escenario en una invitación a invertir.' });
  } else {
    factores.push({ id: 'flujo', estado: 'observado', titulo: 'Flujo mensual', detalle: `Los datos capturados dejan ${r.flujo.disponiblePct.toFixed(1)}% del ingreso neto disponible. Es una fotografía, no una recomendación de destino.` });
  }

  if (!c.gastosEsenciales || !c.fondoActual) {
    factores.push({ id: 'liquidez', estado: 'faltan-datos', titulo: 'Respaldo y liquidez', detalle: 'Faltan gastos esenciales o fondo actual para comparar el respaldo con la referencia educativa de tres meses.' });
  } else if (b.fondoDebajoTresMeses) {
    factores.push({ id: 'liquidez', estado: 'revisar', titulo: 'Respaldo y liquidez', detalle: 'El fondo capturado está por debajo de la referencia educativa de tres meses de gastos esenciales.' });
  } else {
    factores.push({ id: 'liquidez', estado: 'observado', titulo: 'Respaldo y liquidez', detalle: 'El fondo capturado alcanza al menos la referencia educativa de tres meses. Eso no determina qué producto usar ni cuánto invertir.' });
  }

  if (!c.pagosDeuda) {
    factores.push({ id: 'deuda', estado: 'faltan-datos', titulo: 'Costo de deuda', detalle: 'Falta confirmar si existen pagos de deuda. Aun con el monto mensual, harían falta tasa, CAT y plazo para comparar su costo.' });
  } else if (r.deuda.pagosMensuales > 0) {
    factores.push({ id: 'deuda', estado: 'revisar', titulo: 'Costo de deuda', detalle: `Hay pagos mensuales de deuda equivalentes a ${r.deuda.proporcionIngresoPct.toFixed(1)}% del ingreso. MiLana no puede decidir entre amortizar e invertir sin conocer costos y condiciones.` });
  } else {
    factores.push({ id: 'deuda', estado: 'observado', titulo: 'Costo de deuda', detalle: 'No se capturaron pagos mensuales de deuda. Esto no descarta saldos, pagos anuales u otras obligaciones.' });
  }

  if (!c.horizonteMeses) {
    factores.push({ id: 'horizonte', estado: 'faltan-datos', titulo: 'Horizonte', detalle: 'Falta indicar cuándo podría necesitarse el dinero. El horizonte cambia qué riesgos y liquidez deben compararse.' });
  } else {
    factores.push({ id: 'horizonte', estado: 'observado', titulo: 'Horizonte', detalle: `El horizonte capturado es de ${r.meta.horizonteMeses} meses (${horizonteTexto(r.meta.horizonteMeses)}). MiLana no lo traduce automáticamente a un producto.` });
  }

  const hayFaltantes = factores.some((f) => f.estado === 'faltan-datos');
  const basePorOrdenar = factores.some((f) => ['flujo', 'liquidez'].includes(f.id) && f.estado === 'revisar');
  const deudaPorRevisar = factores.some((f) => f.id === 'deuda' && f.estado === 'revisar');
  const estado = hayFaltantes ? 'faltan-datos' : basePorOrdenar ? 'ordenar-base' : deudaPorRevisar ? 'revisar-deuda' : 'contexto-educativo';

  return {
    estado,
    factores,
    preguntasAntesDeProducto: [
      '¿Cuándo necesitarías este dinero y qué tan disponible debe permanecer?',
      '¿Qué pérdidas temporales podrías tolerar sin abandonar tu plan?',
      '¿Qué comisiones, impuestos, spreads o costos aplican?',
      '¿Quién custodia el dinero y los valores y qué institución ejecuta la operación?',
      '¿La institución y el producto pueden verificarse en fuentes oficiales?',
    ],
    puedeRecomendarProducto: false,
    puedeEjecutarOperacion: false,
    usaScore: false,
    nota: 'Este mapa organiza preguntas previas. No certifica que una persona esté lista para invertir y no sustituye perfilamiento, suitability ni asesoría regulada.',
  };
}

export function crearPlanDecisionInversion(radiografia) {
  const r = radiografia ?? crearRadiografiaFinanciera();
  const c = r.capturado ?? {};
  const mapa = crearMapaPreparacionInversion(r);
  const horizonte = perfilHorizonte(r.meta?.horizonteMeses ?? 0);
  const faltantes = [];

  if (!c.metaObjetivo) {
    faltantes.push({ id: 'meta-monto', titulo: 'Monto de la meta', detalle: 'Sin un monto objetivo no puede calcularse la brecha ni una aportación mensual de referencia.' });
  }
  if (!c.ahorroMetaActual) {
    faltantes.push({ id: 'meta-ahorro', titulo: 'Ahorro ya dedicado a la meta', detalle: 'Captura 0 si confirmas que todavía no has separado dinero para esta meta.' });
  }
  if (!c.horizonteMeses) {
    faltantes.push({ id: 'meta-horizonte', titulo: 'Fecha aproximada de uso', detalle: 'El horizonte permite convertir la brecha en una aportación mensual sin asumir rendimiento.' });
  }
  if (r.deuda?.pagosMensuales > 0) {
    faltantes.push({ id: 'deuda-costo', titulo: 'Costo real de la deuda', detalle: 'Para una comparación posterior todavía harían falta tasa o CAT, saldo y plazo. El pago mensual por sí solo no basta.' });
  }

  const escenarios = [];
  const metaCompleta = c.metaObjetivo && c.ahorroMetaActual && c.horizonteMeses;
  if (metaCompleta) {
    const faltante = r.meta.faltante;
    const horizonteBase = Math.max(1, r.meta.horizonteMeses);
    const horizonteReducido = Math.max(1, Math.floor(horizonteBase * 0.75));
    const metaMayor = r.meta.monto * 1.10;
    const faltanteMetaMayor = Math.max(0, metaMayor - r.meta.ahorroActual);
    const disponibleEstresado = Math.max(0, r.flujo.disponible * 0.80);

    escenarios.push({
      id: 'base',
      titulo: 'Plazo capturado',
      valor: faltante / horizonteBase,
      unidad: 'aporte-mensual',
      detalle: `Cerrar una brecha de ${Math.round(faltante)} en ${horizonteBase} meses, sin rendimientos ni inflación.`,
    });
    escenarios.push({
      id: 'plazo-menor',
      titulo: 'Si el plazo fuera 25% menor',
      valor: faltante / horizonteReducido,
      unidad: 'aporte-mensual',
      detalle: `Misma meta, pero en ${horizonteReducido} meses. Es una prueba matemática, no un pronóstico.`,
    });
    escenarios.push({
      id: 'meta-mayor',
      titulo: 'Si la meta costara 10% más',
      valor: faltanteMetaMayor / horizonteBase,
      unidad: 'aporte-mensual',
      detalle: 'Mantiene el mismo horizonte y eleva solo el monto objetivo. No intenta estimar inflación real.',
    });

    if (r.flujo.disponible > 0) {
      escenarios.push({
        id: 'flujo-menor',
        titulo: 'Si el flujo disponible bajara 20%',
        valor: mesesParaMeta(faltante, disponibleEstresado),
        unidad: 'meses-con-flujo',
        detalle: 'Usa 80% del flujo disponible capturado como estrés simple y no supone rendimientos.',
      });
    }
  }

  const dimensiones = [
    { id: 'liquidez', titulo: 'Liquidez', detalle: horizonte.id === 'corto' ? 'En un horizonte corto conviene hacer explícito qué parte del dinero no puede quedar inmovilizada.' : 'Define qué parte del dinero tendría que seguir disponible ante cambios de plan o emergencias.' },
    { id: 'variacion', titulo: 'Variación y pérdidas temporales', detalle: 'Falta saber qué caída temporal podrías tolerar sin vender por presión o necesidad. MiLana no convierte esta respuesta en un perfil de riesgo regulatorio.' },
    { id: 'costos', titulo: 'Costos totales', detalle: 'Compara comisiones, spreads, impuestos y costos de fondeo o retiro antes de evaluar cualquier producto.' },
    { id: 'custodia', titulo: 'Custodia y ejecución', detalle: 'Debe quedar claro qué institución abre la cuenta, hace KYC/PLD, custodia activos y ejecuta órdenes.' },
    { id: 'proteccion', titulo: 'Verificación', detalle: 'La institución, el canal y las condiciones deben poder verificarse en fuentes oficiales antes de mover dinero.' },
  ];

  const estado = mapa.estado === 'ordenar-base'
    ? 'ordenar-base'
    : !metaCompleta
      ? 'completar-meta'
      : 'comparar-escenarios';

  return {
    estado,
    horizonte,
    faltantes,
    escenarios,
    dimensiones,
    puedeRecomendarProducto: false,
    puedeEjecutarOperacion: false,
    usaRendimientoSupuesto: false,
    nota: 'Los escenarios son aritmética de flujo, monto y tiempo. No proyectan rendimiento, inflación, impuestos futuros ni comportamiento de mercado.',
  };
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
  const inversion = crearMapaPreparacionInversion(radiografia);

  return {
    acciones: unicas,
    inversion: {
      ...inversion,
      motivo: inversion.estado === 'contexto-educativo'
        ? 'Hay suficiente información capturada para mostrar educación sobre horizonte, liquidez, riesgo, costos y custodia; esto no habilita productos ni operaciones.'
        : 'Antes de mostrar productos, MiLana mantiene visibles los datos faltantes o factores que requieren revisión.',
    },
  };
}
