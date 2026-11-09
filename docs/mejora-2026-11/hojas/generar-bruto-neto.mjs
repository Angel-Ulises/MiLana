// Hoja de verificación de Bruto a neto con SBC estimado. Uso:
// node docs/mejora-2026-11/hojas/generar-bruto-neto.mjs > docs/mejora-2026-11/hojas/bruto-neto.md
import { calcularBrutoNeto2026, UMA_DIARIA_2026 } from '../../../src/lib/calculos-laborales-2026.mjs';
import { sbcEstimado, FACTOR_INTEGRACION_MINIMO, TOPE_SBC_2026 } from '../../../src/lib/calculos-directos.mjs';
import { ISR_MENSUAL_2026 } from '../../../src/lib/calculos-revisados.mjs';

const m = (n) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const casos = [
  ['Caso 1 — Sueldo de $9,577.22 (salario mínimo general × 30.4), sin marcar «solo gano el mínimo»', '9577.22'],
  ['Caso 2 — Sueldo de $20,000', '20000'],
  ['Caso 3 — Sueldo de $120,000 (SBC topado en 25 UMA)', '120000'],
];
console.log(`# Hoja de verificación — Sueldo bruto a neto 2026 (IMSS)

Para revisión de un contador antes de publicar. Motor: \`calcularBrutoNeto2026\` (sin cambios) con el SBC estimado nuevo (\`sbcEstimado\`).

## Qué cambió

Antes la persona tenía que escribir su salario base de cotización (SBC), el ingreso gravable, el mes y confirmar varias casillas. Ahora solo escribe su sueldo bruto mensual y, si no conoce su SBC, se estima así:

- SBC diario = (sueldo ÷ 30) × factor de integración mínimo de ley = (sueldo ÷ 30) × (365 + 15 + 12 × 25%) ÷ 365 = (sueldo ÷ 30) × ${FACTOR_INTEGRACION_MINIMO.toFixed(6)}, redondeado a centavos.
  (15 días de aguinaldo, LFT art. 87; 12 días de vacaciones del primer año, art. 76; prima de 25 %, art. 80.)
- Ingreso gravable para ISR = sueldo bruto (supone que todo el sueldo paga ISR).
- Días cotizados = 30. Mes = noviembre de 2026 (tabla mensual; subsidio al 15.02 %).

**Decisión que necesita confirmar el contador:** el factor mínimo del primer año subestima un poco el SBC de quien tiene más antigüedad (más días de vacaciones) o prestaciones superiores. La página permite escribir el SBC real en «Más opciones».

## Cuotas obreras IMSS usadas (Ley del Seguro Social, última reforma DOF 15-01-2026)

- 0.25 % prestaciones en dinero (art. 107), 0.375 % gastos médicos de pensionados (art. 25), 0.625 % invalidez y vida (art. 147), 1.125 % cesantía y vejez (art. 168) = 2.375 % del SBC.
- 0.40 % sobre lo que el SBC pase de 3 UMA diarias (art. 106 fr. II, reducido por el transitorio Décimo Noveno).
- Tope del SBC: 25 UMA = ${m(TOPE_SBC_2026)} diarios (art. 28). UMA diaria 2026: ${m(UMA_DIARIA_2026)}.
`);
for (const [titulo, sueldo] of casos) {
  const sbc = sbcEstimado(sueldo);
  const r = calcularBrutoNeto2026({ brutoMensual: sueldo, ingresoGravableISR: sueldo, seguridadSocial: 'imss', sbcDiario: String(sbc), diasCotizados: '30', soloMinimo: false, periodo: '2026-11', empleadorUnico: true });
  const tramo = ISR_MENSUAL_2026.find((t) => r.bruto >= t.li && r.bruto <= t.ls);
  const exced = Math.max(r.sbcAplicado - 3 * UMA_DIARIA_2026, 0);
  console.log(`## ${titulo}

1. SBC estimado: ${m(r.bruto)} ÷ 30 × ${FACTOR_INTEGRACION_MINIMO.toFixed(6)} = ${m(sbc)}${r.sbcAplicado < sbc ? `; se topa en ${m(r.sbcAplicado)}` : ''}.
2. ISR: tramo ${m(tramo.li)}–${tramo.ls === Infinity ? 'en adelante' : m(tramo.ls)}: ${m(tramo.cf)} + (${m(r.bruto)} − ${m(tramo.li)}) × ${tramo.tasa}% = ${m(r.causado)}. Subsidio: ${m(r.subsidio)}. ISR retenido = **${m(r.retenido)}**.
3. IMSS: ${m(r.sbcAplicado)} × 30 × 2.375% = ${m(r.sbcAplicado * 30 * 0.02375)}; excedente de 3 UMA: ${m(exced)} × 30 × 0.40% = ${m(exced * 30 * 0.004)}. Cuota obrera = **${m(r.cuotaObrera)}**.
4. Neto = ${m(r.bruto)} − ${m(r.retenido)} − ${m(r.cuotaObrera)} = **${m(r.netoDespuesISRSeguridadSocial)}**.

Revisado por: ____________________  Fecha: __________  ¿Correcto? Sí / No — Observaciones: ____________________
`);
}
