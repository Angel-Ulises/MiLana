// Genera la hoja de verificación del aguinaldo neto con el motor real del sitio.
// Uso: node docs/mejora-2026-11/hojas/generar-aguinaldo.mjs > docs/mejora-2026-11/hojas/aguinaldo.md
import { calcularAguinaldoNeto, EXENCION_AGUINALDO_2026, SUBSIDIO_MAXIMO_2026, LIMITE_SUBSIDIO_2026, ISR_MENSUAL_2026 } from '../../../src/lib/calculos-revisados.mjs';

const SALARIO_MINIMO_GENERAL_2026 = 315.04; // CONASAMI, vigente desde el 1 de enero de 2026
const m = (n) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const t = (r) => `tramo ${m(r.tramo.li)}–${r.tramo.ls === Infinity ? 'en adelante' : m(r.tramo.ls)}: cuota fija ${m(r.tramo.cf)} + ${r.tramo.tasa}% sobre el excedente`;

// Tarifa mensual + subsidio, igual que el motor (para el método opcional del art. 174 RLISR).
function isrMes(x) {
  const tr = ISR_MENSUAL_2026.find((r) => x >= r.li && x <= r.ls)
    || ISR_MENSUAL_2026.find((r, i, a) => i < a.length - 1 && x > r.ls && x < a[i + 1].li)
    || ISR_MENSUAL_2026[ISR_MENSUAL_2026.length - 1];
  const causado = (x - tr.li) * tr.tasa / 100 + tr.cf;
  const subsidio = x <= LIMITE_SUBSIDIO_2026 ? Math.min(causado, SUBSIDIO_MAXIMO_2026) : 0;
  return { causado, retenido: Math.max(0, causado - subsidio) };
}
// RLISR art. 174, leído sobre la parte gravada: fr. I gravada/365×30.4; fr. II se suma al sueldo del mes;
// fr. III diferencia de impuesto; fr. V tasa = diferencia / monto de fr. I; fr. IV tasa × parte gravada.
function art174(sueldo, gravado, campo) {
  if (gravado <= 0) return { mensualizado: 0, tasa: 0, isr: 0 };
  const mensualizado = gravado / 365 * 30.4;
  const tasa = (isrMes(sueldo + mensualizado)[campo] - isrMes(sueldo)[campo]) / mensualizado;
  return { mensualizado, tasa, isr: gravado * tasa };
}

function isrPasos(nombre, ingreso, r) {
  const lineas = [`   - ${nombre}: ${m(ingreso)} → ${t(r)}.`,
    `     ISR causado = ${m(r.tramo.cf)} + (${m(ingreso)} − ${m(r.tramo.li)}) × ${r.tramo.tasa}% = ${m(r.causado)}.`];
  lineas.push(ingreso <= LIMITE_SUBSIDIO_2026
    ? `     Subsidio para el empleo (ingreso ≤ ${m(LIMITE_SUBSIDIO_2026)}): mín(ISR causado, ${m(SUBSIDIO_MAXIMO_2026)}) = ${m(r.subsidio)}. Retención = ${m(r.retenido)}.`
    : `     Sin subsidio (ingreso > ${m(LIMITE_SUBSIDIO_2026)}). Retención = ${m(r.retenido)}.`);
  return lineas.join('\n');
}

const minimoMensual = (SALARIO_MINIMO_GENERAL_2026 * 30).toFixed(2); // 9,451.20 — LFT art. 89: mensual ÷ 30 = diario
const casos = [
  ['Caso 1 — Sueldo de $12,000, todo el año', { sueldoMensual: '12000', fechaIngreso: '', dias: '15' }],
  [`Caso 2 — Salario mínimo general ($315.04 × 30 = ${m(Number(minimoMensual))}), todo el año (aplica subsidio)`, { sueldoMensual: minimoMensual, fechaIngreso: '', dias: '15' }],
  ['Caso 3 — Sueldo de $30,000, ingresó el 1 de julio de 2026', { sueldoMensual: '30000', fechaIngreso: '2026-07-01', dias: '15' }],
];
const resultados = casos.map(([titulo, entrada]) => [titulo, calcularAguinaldoNeto(entrada)]);

console.log(`# Hoja de verificación — Aguinaldo neto 2026 (empresa privada)

> **Estado:** comprobación técnica hecha por MiLana contra los textos oficiales vigentes (actualizada el 10 de noviembre de 2026). **No es una validación de contador.** Las cifras se generan con el motor del sitio (\`calcularAguinaldoNeto\` en \`src/lib/calculos-revisados.mjs\`); los renglones «Revisado por» siguen vacíos.

## Fórmula que usa la calculadora

1. Sueldo diario = sueldo mensual ÷ 30 (LFT art. 89).
2. Aguinaldo bruto = sueldo diario × días de aguinaldo (mínimo 15, LFT art. 87) × (días trabajados en 2026 ÷ 365). Se cuentan el día de ingreso y el 31 de diciembre.
3. Parte exenta = mín(bruto, 30 UMA) = mín(bruto, ${m(EXENCION_AGUINALDO_2026)}). LISR art. 93 fr. XIV dice «30 días de salario mínimo general del área geográfica»; se lee como UMA por el transitorio Tercero de la reforma constitucional DOF 27-01-2016. UMA 2026: $117.31 (INEGI). **Es una interpretación**: ver el punto a confirmar 3.
4. Parte gravada = bruto − exenta.
5. ISR del aguinaldo (método general, LISR art. 96) = retención del mes con (sueldo + parte gravada) − retención del mes con el sueldo solo. Tarifa: Anexo 8 RMF 2026, apartado V (DOF 28-12-2025). Subsidio para el empleo: 15.02% de la UMA mensual (${m(SUBSIDIO_MAXIMO_2026)}) si el ingreso del mes no pasa de ${m(LIMITE_SUBSIDIO_2026)} (decreto DOF 31-12-2025).
6. Neto = bruto − ISR.

## Puntos que necesitan decisión de un contador

1. **Método de retención.** La calculadora usa el método general del art. 96 LISR. El art. 174 del Reglamento de la LISR (última reforma DOF 06-05-2016) permite a la empresa un procedimiento opcional. Comparación con los mismos casos:

| Caso | Art. 96 (calculadora) | Art. 174 con ISR causado | Art. 174 con retención (ISR − subsidio) |
|---|---|---|---|
${resultados.map(([titulo, r], i) => { const c = art174(r.sueldo, r.gravado, 'causado'); const s = art174(r.sueldo, r.gravado, 'retenido'); return `| ${i + 1} | ${m(r.isr)} | ${m(c.isr)} (tasa ${(c.tasa * 100).toFixed(4)}%) | ${m(s.isr)} (tasa ${(s.tasa * 100).toFixed(4)}%) |`; }).join('\n')}

   El art. 174 solo da menos cuando el aguinaldo hace brincar el ingreso del mes a un tramo más alto (caso 1). Hay dos lecturas que conviene resolver: (a) aquí se aplica sobre la **parte gravada**, porque la exenta no paga ISR, aunque el texto dice «la remuneración de que se trate»; (b) en el caso 2 cambia si la fr. III usa el impuesto antes o después del subsidio.

2. **Quien gana el salario mínimo (caso 2).** El art. 96 LISR dice que no se retiene a quien en el mes *solo* percibe el salario mínimo general. En un mes normal esa persona no tiene retención. En diciembre recibe además el aguinaldo, así que ya no percibe «solo» el mínimo. El motor resta la retención del mes sin aguinaldo calculada con la tarifa (${m(resultados[1][1].isrSueldo.retenido)}), aunque en la práctica esa retención sería $0. Que un sueldo mensual sea bajo no prueba por sí solo que la persona perciba únicamente el salario mínimo (puede trabajar media jornada o tener otras percepciones), así que la calculadora no lo detecta sola. Si el contador considera que la base sin aguinaldo debe ser $0, el ISR del caso 2 sería la retención completa del mes con aguinaldo: **${m(resultados[1][1].isrSueldoMasAguinaldo.retenido)}** en lugar de **${m(resultados[1][1].isr)}**.

3. **Exención en UMA o en salario mínimo.** Con UMA la parte exenta es ${m(EXENCION_AGUINALDO_2026)}; con 30 días de salario mínimo general sería ${m(30 * SALARIO_MINIMO_GENERAL_2026)}. La calculadora usa UMA. Con la lectura en salario mínimo, ninguno de los tres casos pagaría ISR (sus aguinaldos son menores a ${m(30 * SALARIO_MINIMO_GENERAL_2026)}), y en la frontera norte el tope sería ${m(30 * 440.87)}. La diferencia es grande, así que esta lectura necesita confirmación profesional.
`);
for (const [titulo, r] of resultados) {
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

Revisado por (contador): ____________________  Fecha: __________  ¿Correcto? Sí / No — Observaciones: ____________________
`);
}
