// Escenarios matemáticos, no predicciones ni sugerencias sobre instrumentos.
const finito = (n) => typeof n === 'number' && Number.isFinite(n);
const dineroValido = (value) => value !== '' && value !== null && value !== undefined && finito(Number(value)) && Number(value) >= 0 && Number(value) <= 1e9;
const porcentajeValido = (value, minimo, maximo) => value !== '' && finito(Number(value)) && Number(value) >= minimo && Number(value) <= maximo;

export function proyectarInversion({ inicial, mensual, anos, inflacion, costoAnual, tasas }) {
  if (!dineroValido(inicial) || !dineroValido(mensual)) return { error: 'Revisa los importes. Usa cero cuando no harás esa aportación.' };
  if (!Number.isInteger(Number(anos)) || Number(anos) < 1 || Number(anos) > 40) return { error: 'El plazo debe estar entre 1 y 40 años.' };
  if (!porcentajeValido(inflacion, 0, 30) || !porcentajeValido(costoAnual, 0, 25)) return { error: 'Revisa inflación y costos: deben ser porcentajes válidos.' };
  if (!Array.isArray(tasas) || tasas.length !== 3 || tasas.some((t) => !porcentajeValido(t, -95, 100))) return { error: 'Las tres tasas ilustrativas deben estar entre −95% y 100%.' };
  const entrada = Number(inicial), aporte = Number(mensual), years = Number(anos);
  const aportado = entrada + aporte * 12 * years;
  const deflactor = (1 + Number(inflacion) / 100) ** years;
  const factorCosto = (1 - Number(costoAnual) / 100) ** (1 / 12);
  const nombres = ['Adverso', 'Intermedio', 'Favorable'];
  const escenarios = tasas.map((tasa, index) => {
    const factorMensual = ((1 + Number(tasa) / 100) ** (1 / 12)) * factorCosto;
    let saldo = entrada;
    for (let mes = 0; mes < years * 12; mes++) saldo = saldo * factorMensual + aporte;
    const final = Number.isFinite(saldo) ? saldo : 0;
    return {
      nombre: nombres[index], tasa: Number(tasa), final,
      aportado, diferencia: final - aportado, real: final / deflactor,
    };
  });
  return { escenarios, aportado, anos: years, inflation: Number(inflacion), costoAnual: Number(costoAnual) };
}
// Mismo cálculo que el simulador, con la tasa fija y dos costos: muestra cuánto del saldo
// final se va en comisiones. Ejemplo educativo; no describe ningún producto real.
export function compararComision({ inicial, mensual, anos, tasa, comision }) {
  const base = proyectarInversion({ inicial, mensual, anos, inflacion: 0, costoAnual: 0, tasas: [tasa, tasa, tasa] });
  const conCosto = proyectarInversion({ inicial, mensual, anos, inflacion: 0, costoAnual: comision, tasas: [tasa, tasa, tasa] });
  if (base.error || conCosto.error) return { error: base.error || conCosto.error };
  const sin = base.escenarios[1].final;
  const con = conCosto.escenarios[1].final;
  return { aportado: base.aportado, sinComision: sin, conComision: con, costo: sin - con, conservas: sin > 0 ? (con / sin) * 100 : 0 };
}
