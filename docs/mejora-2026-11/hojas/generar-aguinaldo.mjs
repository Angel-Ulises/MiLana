// Genera la hoja de verificación del aguinaldo neto con el motor real del sitio.
// Uso: node docs/mejora-2026-11/hojas/generar-aguinaldo.mjs > docs/mejora-2026-11/hojas/aguinaldo.md
import { calcularAguinaldoNeto, EXENCION_AGUINALDO_2026, SUBSIDIO_MAXIMO_2026, LIMITE_SUBSIDIO_2026 } from '../../../src/lib/calculos-revisados.mjs';

const m = (n) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const t = (r) => `tramo ${m(r.tramo.li)}–${r.tramo.ls === Infinity ? 'en adelante' : m(r.tramo.ls)}: cuota fija ${m(r.tramo.cf)} + ${r.tramo.tasa}% sobre el excedente`;
function isrPasos(nombre, ingreso, r) {
  const lineas = [`   - ${nombre}: ${m(ingreso)} → ${t(r)}.`,
    `     ISR causado = ${m(r.tramo.cf)} + (${m(ingreso)} − ${m(r.tramo.li)}) × ${r.tramo.tasa}% = ${m(r.causado)}.`];
  lineas.push(ingreso <= LIMITE_SUBSIDIO_2026
    ? `     Subsidio al empleo (ingreso ≤ ${m(LIMITE_SUBSIDIO_2026)}): mín(ISR causado, ${m(SUBSIDIO_MAXIMO_2026)}) = ${m(r.subsidio)}. Retención = ${m(r.retenido)}.`
    : `     Sin subsidio (ingreso > ${m(LIMITE_SUBSIDIO_2026)}). Retención = ${m(r.retenido)}.`);
  return lineas.join('\n');
}

const casos = [
  ['Caso 1 — Sueldo de $12,000, todo el año', { sueldoMensual: '12000', fechaIngreso: '', dias: '15' }],
  ['Caso 2 — Salario mínimo general (315.04 × 30.4 = $9,577.22), todo el año (aplica subsidio)', { sueldoMensual: '9577.22', fechaIngreso: '', dias: '15' }],
  ['Caso 3 — Sueldo de $30,000, ingresó el 1 de julio de 2026', { sueldoMensual: '30000', fechaIngreso: '2026-07-01', dias: '15' }],
];

console.log(`# Hoja de verificación — Aguinaldo neto 2026 (empresa privada)

Para revisión de un contador antes de publicar. Generada con el motor del sitio (\`calcularAguinaldoNeto\` en \`src/lib/calculos-revisados.mjs\`).

## Fórmula

1. Sueldo diario = sueldo mensual ÷ 30.
2. Aguinaldo bruto = sueldo diario × días de aguinaldo (mínimo 15, LFT art. 87) × (días trabajados en 2026 ÷ 365). Se cuentan el día de ingreso y el 31 de diciembre.
3. Parte exenta = mín(bruto, 30 UMA) = mín(bruto, ${m(EXENCION_AGUINALDO_2026)}) (LISR art. 93 fr. XIV; UMA 2026 $117.31, INEGI).
4. Parte gravada = bruto − exenta.
5. ISR del aguinaldo (método general, LISR art. 96) = retención del mes con (sueldo + gravada) − retención del mes con el sueldo solo. Tabla: Anexo 8 RMF 2026, apartado V. Subsidio al empleo: 15.02% de la UMA mensual (${m(SUBSIDIO_MAXIMO_2026)}) si el ingreso del mes no pasa de ${m(LIMITE_SUBSIDIO_2026)}.
6. Neto = bruto − ISR.

**Decisión que necesita confirmar el contador:** se usa el método general del art. 96. El Reglamento del ISR (art. 174) permite a la empresa otro procedimiento opcional que suele retener menos; la página lo menciona y no lo calcula.

**Comparación con el art. 174 del Reglamento del ISR** (texto vigente, última reforma DOF 06-05-2016): divide la parte gravada entre 365, multiplica por 30.4, la suma al sueldo del mes, obtiene la diferencia de ISR, saca una tasa y la aplica a la parte gravada. Con la tabla 2026 y tomando el impuesto causado, los resultados son:

| Caso | Art. 96 (el que usa la calculadora) | Art. 174 (opcional) |
|---|---|---|
| 1 — $12,000 | $366.29 | $269.90 (tasa 10.88%) |
| 2 — $9,577.22 | $138.10 | $138.10 |
| 3 — $30,000 desde julio | $863.44 | $863.44 |

Solo hay diferencia cuando el aguinaldo hace brincar el ingreso del mes a un tramo más alto de la tabla (caso 1). Por eso la página dice «tu empresa puede usar otro método que a veces retiene un poco menos».

**Revisión de actualizaciones (10 nov 2026):** LFT, última reforma DOF 14-05-2026. Las reformas de 2026 son la reducción gradual de la jornada (DOF 01-05-2026: 48 h en 2026 hasta 40 h en 2030), certificación agroexportadora y artistas intérpretes. Ninguna toca los artículos 76, 80, 84, 87, 89, 162 ni el 50, que usan las calculadoras. La Ley del ISR sigue en su reforma DOF 01-04-2024 y la Ley del Seguro Social en DOF 15-01-2026, sin cambios en los artículos usados. Las NIF (CINIF) son normas contables para los estados financieros de las empresas; la NIF D-3 trata cómo la empresa registra la PTU y la prima de antigüedad, no cuánto recibe ni cuánto se retiene a la persona trabajadora, así que no cambia ningún cálculo.

**Segundo punto a confirmar (caso 2):** el art. 96 dice que no se retiene a quien en el mes *solo* gana el salario mínimo. En diciembre esa persona recibe además el aguinaldo, así que el motor calcula la diferencia entre el mes con y sin aguinaldo usando la tarifa y el subsidio normales. Si el contador considera que la base sin aguinaldo debe ser 0, el ISR del caso 2 sería la retención completa del mes con aguinaldo ($285.47), no $138.10.
`);
for (const [titulo, entrada] of casos) {
  const r = calcularAguinaldoNeto(entrada);
  console.log(`## ${titulo}

1. Sueldo diario: ${m(r.sueldo)} ÷ 30 = ${m(r.salarioDiario)}.
2. Días trabajados en 2026: ${r.diasPeriodo} de 365. Aguinaldo bruto = ${m(r.salarioDiario)} × ${r.diasPrestacion} × ${r.diasPeriodo}/365 = **${m(r.bruto)}**.
3. Parte exenta: ${m(r.exento)}.
4. Parte gravada: ${m(r.bruto)} − ${m(r.exento)} = ${m(r.gravado)}.
5. ISR:
${isrPasos('Mes sin aguinaldo', r.sueldo, r.isrSueldo)}
${isrPasos('Mes con aguinaldo gravado', r.sueldo + r.gravado, r.isrSueldoMasAguinaldo)}
   - ISR del aguinaldo = ${m(r.isrSueldoMasAguinaldo.retenido)} − ${m(r.isrSueldo.retenido)} = **${m(r.isr)}**.
6. Neto = ${m(r.bruto)} − ${m(r.isr)} = **${m(r.neto)}**.

Revisado por: ____________________  Fecha: __________  ¿Correcto? Sí / No — Observaciones: ____________________
`);
}
