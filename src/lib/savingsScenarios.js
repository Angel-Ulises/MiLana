// Comparación educativa de aportaciones, sin intereses, inflación ni productos.
// Un campo sin capturar nunca equivale a un cero confirmado.
function montoCapturado(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (String(value).trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function crearEscenariosAhorro({ meta, actual, mensual, porcentaje = 100 }) {
  const objetivo = montoCapturado(meta);
  const acumulado = montoCapturado(actual);
  const aporte = montoCapturado(mensual);
  const factor = Number(porcentaje);
  if (objetivo === null || acumulado === null || aporte === null || objetivo <= 0 || aporte <= 0
    || !Number.isFinite(factor) || factor < 50 || factor > 200) return null;

  const alternativo = aporte * factor / 100;
  const restante = Math.max(0, objetivo - acumulado);
  const mesesA = restante === 0 ? 0 : Math.ceil(restante / aporte);
  const mesesB = restante === 0 ? 0 : Math.ceil(restante / alternativo);
  const horizontes = [6, 12, 24].map((mes) => ({
    mes,
    base: acumulado + aporte * mes,
    alternativo: acumulado + alternativo * mes,
  }));
  const escala = Math.max(objetivo, acumulado, ...horizontes.map(x => Math.max(x.base, x.alternativo)));
  return {
    objetivo, acumulado, aporte, alternativo, restante, porcentaje: factor,
    mesesBase: mesesA, mesesAlternativo: mesesB, horizontes, escala,
  };
}
