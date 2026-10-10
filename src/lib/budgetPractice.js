// Cantidades ficticias para aprender. Nunca se importan al presupuesto real.
export const EJEMPLO_PRESUPUESTO = Object.freeze({ ingreso: 10000, esenciales: 6000, variables: 1000, deuda: 1000 });
export const PASO_GASTO_EXTRA = 500;
export const MAX_GASTO_EXTRA = 3000;

export function calcularEjemploPresupuesto(extra = 0) {
  const gastoExtra = Number.isFinite(extra) ? Math.min(MAX_GASTO_EXTRA, Math.max(0, extra)) : 0;
  const { ingreso, esenciales, variables, deuda } = EJEMPLO_PRESUPUESTO;
  const gastos = esenciales + variables + deuda + gastoExtra;
  const saldo = ingreso - gastos;
  return { ingreso, esenciales, variables, deuda, gastoExtra, gastos, saldo,
    estado: saldo > 0 ? 'disponible' : saldo < 0 ? 'faltante' : 'equilibrado' };
}
