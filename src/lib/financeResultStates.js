// Presentation guards: an empty field is not a confirmed zero.
const capturado = (value) => value !== null && value !== undefined
  && String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0;

export function estadoPresupuesto({ ingreso, esenciales, variables, deuda }, saldo) {
  const ingresoCapturado = capturado(ingreso);
  const gastosCapturados = [esenciales, variables, deuda].every(capturado);
  const completo = ingresoCapturado && gastosCapturados;
  if (!completo) return {
    completo, ingresoCapturado, gastosCapturados, tone: '',
    titulo: 'Completa tus datos para revisar el presupuesto.',
    detalle: 'Captura tu ingreso y cada rubro de gastos. Si no tienes ingreso o algún gasto, escribe 0 para confirmarlo.',
  };
  return {
    completo, ingresoCapturado, gastosCapturados,
    tone: saldo < 0 ? 'warning' : saldo > 0 ? 'positive' : '',
    titulo: saldo > 0 ? '¿Qué quieres hacer con lo que queda?' : saldo < 0 ? 'Tus gastos capturados superan el ingreso.' : 'Tus ingresos y gastos capturados están equilibrados.',
    detalle: saldo > 0 ? 'Puedes convertir parte de ese saldo en una meta de fondo de emergencia o ahorro.' : saldo < 0 ? 'Revisa primero qué rubros pueden ajustarse o si falta registrar algún ingreso; MiLana no asume que todos los gastos sean prescindibles.' : 'El disponible es $0 con los datos capturados. Revisa que hayas incluido todos tus gastos antes de planear una meta de ahorro.',
  };
}

export function estadoReferenciaFondo(radiografia) {
  const { capturado: datos, entrada, emergencia } = radiografia;
  if (!datos.gastosEsenciales) return { mostrarReferencia: false, nota: 'Captura tus gastos esenciales para calcular la referencia de tres meses.' };
  if (entrada.gastosEsenciales <= 0) return { mostrarReferencia: true, nota: 'Con gastos esenciales de $0 no hay una referencia útil de respaldo. Revisa este monto antes de evaluar tu fondo.' };
  if (!datos.fondoActual) return { mostrarReferencia: true, nota: 'Captura tu fondo actual para compararlo con esta referencia. Si no tienes fondo, escribe 0.' };
  if (emergencia.brechaTresMeses === 0) return { mostrarReferencia: true, nota: 'El fondo capturado ya alcanza esta referencia educativa.' };
  if (![datos.ingresoNeto, datos.gastosVariables, datos.pagosDeuda].every(Boolean)) return { mostrarReferencia: true, nota: 'Completa ingreso, gastos variables y pagos de deuda para estimar tiempo. Escribe 0 en los rubros que no tengas.' };
  const meses = emergencia.mesesATresConDisponible;
  return { mostrarReferencia: true, nota: meses === null ? 'Captura flujo positivo para estimar tiempo.' : `Con todo el disponible actual: ${meses} meses. Es un escenario, no una instrucción.` };
}
