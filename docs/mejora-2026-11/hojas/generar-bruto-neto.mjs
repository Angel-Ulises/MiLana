// Hoja de verificación de Bruto a neto con SBC estimado. Uso:
// node docs/mejora-2026-11/hojas/generar-bruto-neto.mjs > docs/mejora-2026-11/hojas/bruto-neto.md
import { calcularBrutoNeto2026, UMA_DIARIA_2026, SALARIOS_MINIMOS_2026 } from '../../../src/lib/calculos-laborales-2026.mjs';
import { sbcEstimado, FACTOR_INTEGRACION_MINIMO, TOPE_SBC_2026 } from '../../../src/lib/calculos-directos.mjs';
import { ISR_MENSUAL_2026 } from '../../../src/lib/calculos-revisados.mjs';

const m = (n) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const minimoMensual = (SALARIOS_MINIMOS_2026.general * 30).toFixed(2); // 9,451.20 (LFT art. 89: mensual ÷ 30)
const calcular = (sueldo, soloMinimo) => {
  const sbc = sbcEstimado(sueldo);
  return { sbc, r: calcularBrutoNeto2026({ brutoMensual: sueldo, ingresoGravableISR: sueldo, seguridadSocial: 'imss', sbcDiario: String(sbc), diasCotizados: '30', soloMinimo, periodo: '2026-11', empleadorUnico: true }) };
};
const casos = [
  [`Caso 1 — Salario mínimo general (${m(SALARIOS_MINIMOS_2026.general)} × 30 = ${m(Number(minimoMensual))}), sin marcar «Solo gano el salario mínimo»`, minimoMensual],
  ['Caso 2 — Sueldo de $20,000', '20000'],
  ['Caso 3 — Sueldo de $120,000 (SBC topado en 25 UMA)', '120000'],
];
const conMinimo = calcular(minimoMensual, true).r;

console.log(`# Hoja de verificación — Sueldo bruto a neto 2026 (IMSS)

> **Estado:** comprobación técnica hecha por MiLana contra los textos oficiales vigentes (actualizada el 10 de noviembre de 2026). **No es una validación de contador.** Motor: \`calcularBrutoNeto2026\` (sin cambios) con el SBC estimado (\`sbcEstimado\`). Los renglones «Revisado por» siguen vacíos.

## Qué hace el modo rápido

La persona escribe solo su sueldo bruto mensual. Si no conoce su salario base de cotización (SBC):

- SBC diario = (sueldo ÷ 30) × (365 + 15 + 12 × 25%) ÷ 365 = (sueldo ÷ 30) × ${FACTOR_INTEGRACION_MINIMO.toFixed(6)}, redondeado a centavos. Es el factor de integración mínimo de ley del primer año: 15 días de aguinaldo (LFT art. 87), 12 días de vacaciones (art. 76) y prima de 25% (art. 80). La integración del SBC está en LSS art. 27.
- Ingreso gravable para ISR = sueldo bruto (supone que todo el sueldo paga ISR).
- Días cotizados = 30; tarifa mensual y subsidio de noviembre de 2026 (iguales de febrero a diciembre).
- «Solo gano el salario mínimo» es una casilla en «Más opciones», desmarcada al inicio. Si se marca, ISR = $0 (LISR art. 96) y cuota obrera IMSS = $0, porque la paga el patrón (LSS art. 36).

## Cuotas obreras IMSS usadas (LSS, última reforma DOF 15-01-2026)

- 0.25% prestaciones en dinero (art. 107), 0.375% gastos médicos de pensionados (art. 25), 0.625% invalidez y vida (art. 147) y 1.125% cesantía y vejez (art. 168): en total 2.375% del SBC.
- 0.40% sobre lo que el SBC pase de 3 UMA diarias (art. 106 fr. II; el 2% del texto se redujo 0.16 puntos por año de 1998 a 2007, transitorio Décimo Noveno).
- Tope del SBC: 25 UMA = ${m(TOPE_SBC_2026)} diarios (art. 28; el texto dice salario mínimo del DF y se lee como UMA por la desindexación de 2016). UMA diaria 2026: ${m(UMA_DIARIA_2026)}.

## Supuestos que necesitan decisión de un contador

1. **Factor de integración.** El factor del primer año subestima un poco el SBC de quien tiene más antigüedad (de 14 días de vacaciones en adelante) o prestaciones superiores. Para 5 años de antigüedad (20 días de vacaciones) el factor sería ${((365 + 15 + 20 * 0.25) / 365).toFixed(6)}. La página permite escribir el SBC real.
2. **Salario mínimo (caso 1).** Si la persona gana *únicamente* el mínimo y no marca la casilla, la calculadora le resta ISR e IMSS que por ley no le corresponden. El neto saldría ${m(calcular(minimoMensual, false).r.netoDespuesISRSeguridadSocial)} en vez de ${m(conMinimo.netoDespuesISRSeguridadSocial)}. No se corrige detectándolo por el monto: un sueldo mensual bajo o parcial no prueba por sí solo que la persona perciba únicamente el salario mínimo. Opciones para decidir: dejar la casilla más visible, preguntar directo «¿ganas el salario mínimo?» o dejarlo como está con una nota.
3. **Piso del SBC.** LSS art. 28 fija como límite inferior el salario mínimo del área. El modo rápido no aplica ese piso. Solo importa si el sueldo diario es menor al mínimo (jornada parcial), un caso que la calculadora no cubre.
4. **Meses de 31 días.** El modo rápido siempre usa 30 días cotizados; en un mes de 31 días la cuota IMSS real es un poco mayor.
`);
for (const [titulo, sueldo] of casos) {
  const { sbc, r } = calcular(sueldo, false);
  const tramo = ISR_MENSUAL_2026.find((t) => r.bruto >= t.li && r.bruto <= t.ls);
  const exced = Math.max(r.sbcAplicado - 3 * UMA_DIARIA_2026, 0);
  console.log(`## ${titulo}

1. SBC estimado: ${m(r.bruto)} ÷ 30 × ${FACTOR_INTEGRACION_MINIMO.toFixed(6)} = ${m(sbc)}${r.sbcAplicado < sbc ? `; se topa en ${m(r.sbcAplicado)}` : ''}.
2. ISR: tramo ${m(tramo.li)}–${tramo.ls === Infinity ? 'en adelante' : m(tramo.ls)}: ${m(tramo.cf)} + (${m(r.bruto)} − ${m(tramo.li)}) × ${tramo.tasa}% = ${m(r.causado)}. Subsidio: ${m(r.subsidio)}. ISR retenido = **${m(r.retenido)}**.
3. IMSS: ${m(r.sbcAplicado)} × 30 × 2.375% = ${m(r.sbcAplicado * 30 * 0.02375)}; excedente de 3 UMA: ${m(exced)} × 30 × 0.40% = ${m(exced * 30 * 0.004)}. Cuota obrera = **${m(r.cuotaObrera)}**.
4. Neto = ${m(r.bruto)} − ${m(r.retenido)} − ${m(r.cuotaObrera)} = **${m(r.netoDespuesISRSeguridadSocial)}**.${sueldo === minimoMensual ? `
5. Con la casilla «Solo gano el salario mínimo» marcada: ISR ${m(conMinimo.retenido)}, IMSS ${m(conMinimo.cuotaObrera)}, neto **${m(conMinimo.netoDespuesISRSeguridadSocial)}** (LISR art. 96 y LSS art. 36).` : ''}

Revisado por (contador): ____________________  Fecha: __________  ¿Correcto? Sí / No — Observaciones: ____________________
`);
}
