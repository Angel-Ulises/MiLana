const numeroSeguro = (valor) => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? Math.max(0, numero) : 0;
};

const capturado = (valor) => {
  if (valor === undefined || valor === null) return false;
  if (typeof valor === 'string' && valor.trim() === '') return false;
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0;
};

export function crearContextoDeuda(entrada = {}) {
  const pagoMensual = numeroSeguro(entrada.pagoMensual);
  const saldo = numeroSeguro(entrada.saldo);
  const catAnualPct = numeroSeguro(entrada.catAnualPct);
  const tasaAnualPct = numeroSeguro(entrada.tasaAnualPct);
  const mesesRestantes = Math.floor(numeroSeguro(entrada.mesesRestantes));

  const tienePago = capturado(entrada.pagoMensual) && pagoMensual > 0;
  const tieneSaldo = capturado(entrada.saldo) && saldo > 0;
  const tieneCAT = capturado(entrada.catAnualPct) && catAnualPct > 0;
  const tieneTasa = capturado(entrada.tasaAnualPct) && tasaAnualPct > 0;
  const tienePlazo = capturado(entrada.mesesRestantes) && mesesRestantes > 0;
  const tieneCostoDeclarado = tieneCAT || tieneTasa;

  if (!tienePago) {
    return {
      estado: 'sin-pago-declarado',
      completo: false,
      capturado: { pagoMensual: tienePago, saldo: tieneSaldo, catAnualPct: tieneCAT, tasaAnualPct: tieneTasa, mesesRestantes: tienePlazo },
      pagoMensual,
      saldo,
      catAnualPct,
      tasaAnualPct,
      mesesRestantes,
      pagosRestantesDeclarados: null,
      diferenciaPagosSaldo: null,
      costoReferencia: null,
      faltantes: [],
      nota: 'No hay un pago mensual positivo capturado para construir contexto de deuda.',
    };
  }

  const pagosRestantesDeclarados = tienePlazo ? pagoMensual * mesesRestantes : null;
  const diferenciaPagosSaldo = tieneSaldo && pagosRestantesDeclarados !== null
    ? pagosRestantesDeclarados - saldo
    : null;
  const faltantes = [];
  if (!tieneSaldo) faltantes.push('saldo actual');
  if (!tienePlazo) faltantes.push('meses restantes');
  if (!tieneCostoDeclarado) faltantes.push('CAT o tasa anual');

  const costoReferencia = tieneCAT
    ? { tipo: 'CAT', valorPct: catAnualPct, prioridad: 'declarado-por-usuario' }
    : tieneTasa
      ? { tipo: 'Tasa anual', valorPct: tasaAnualPct, prioridad: 'declarado-por-usuario' }
      : null;

  return {
    estado: faltantes.length === 0 ? 'contexto-capturado' : 'faltan-datos',
    completo: faltantes.length === 0,
    capturado: { pagoMensual: tienePago, saldo: tieneSaldo, catAnualPct: tieneCAT, tasaAnualPct: tieneTasa, mesesRestantes: tienePlazo },
    pagoMensual,
    saldo,
    catAnualPct,
    tasaAnualPct,
    mesesRestantes,
    pagosRestantesDeclarados,
    diferenciaPagosSaldo,
    costoReferencia,
    faltantes,
    nota: 'La suma pago × meses es solo una proyección aritmética de los pagos declarados. La diferencia frente al saldo no equivale necesariamente a intereses: puede incluir seguros, comisiones, cambios de tasa, pagos finales u otras condiciones. CAT y tasa anual se muestran como datos separados y no se convierten en rendimiento de inversión.',
  };
}
