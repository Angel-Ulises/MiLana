# Hoja de verificación — Aguinaldo neto 2026 (empresa privada)

> **Estado:** comprobación técnica hecha por MiLana contra los textos oficiales vigentes (actualizada el 10 de noviembre de 2026). **No es una validación de contador.** Las cifras se generan con el motor del sitio (`calcularAguinaldoNeto` en `src/lib/calculos-revisados.mjs`); los renglones «Revisado por» siguen vacíos.

## Fórmula que usa la calculadora

1. Sueldo diario = sueldo mensual ÷ 30 (LFT art. 89).
2. Aguinaldo bruto = sueldo diario × días de aguinaldo (mínimo 15, LFT art. 87) × (días trabajados en 2026 ÷ 365). Se cuentan el día de ingreso y el 31 de diciembre.
3. Parte exenta = mín(bruto, 30 UMA) = mín(bruto, $3,519.30). LISR art. 93 fr. XIV dice «30 días de salario mínimo general del área geográfica»; se lee como UMA por el transitorio Tercero de la reforma constitucional DOF 27-01-2016. UMA 2026: $117.31 (INEGI). **Es una interpretación**: ver el punto a confirmar 3.
4. Parte gravada = bruto − exenta.
5. ISR del aguinaldo (método general, LISR art. 96) = retención del mes con (sueldo + parte gravada) − retención del mes con el sueldo solo. Tarifa: Anexo 8 RMF 2026, apartado V (DOF 28-12-2025). Subsidio para el empleo: 15.02% de la UMA mensual ($535.65) si el ingreso del mes no pasa de $11,492.66 (decreto DOF 31-12-2025).
6. Neto = bruto − ISR.

## Puntos que necesitan decisión de un contador

1. **Método de retención.** La calculadora usa el método general del art. 96 LISR. El art. 174 del Reglamento de la LISR (última reforma DOF 06-05-2016) permite a la empresa un procedimiento opcional. Comparación con los mismos casos:

| Caso | Art. 96 (calculadora) | Art. 174 con ISR causado | Art. 174 con retención (ISR − subsidio) |
|---|---|---|---|
| 1 | $366.29 | $269.90 (tasa 10.8800%) | $269.90 (tasa 10.8800%) |
| 2 | $131.25 | $131.25 (tasa 10.8800%) | $131.25 (tasa 10.8800%) |
| 3 | $863.44 | $863.44 (tasa 21.3600%) | $863.44 (tasa 21.3600%) |

   El art. 174 solo da menos cuando el aguinaldo hace brincar el ingreso del mes a un tramo más alto (caso 1). Hay dos lecturas que conviene resolver: (a) aquí se aplica sobre la **parte gravada**, porque la exenta no paga ISR, aunque el texto dice «la remuneración de que se trate»; (b) en el caso 2 cambia si la fr. III usa el impuesto antes o después del subsidio.

2. **Quien gana el salario mínimo (caso 2).** El art. 96 LISR dice que no se retiene a quien en el mes *solo* percibe el salario mínimo general. En un mes normal esa persona no tiene retención. En diciembre recibe además el aguinaldo, así que ya no percibe «solo» el mínimo. El motor resta la retención del mes sin aguinaldo calculada con la tarifa ($133.66), aunque en la práctica esa retención sería $0. Que un sueldo mensual sea bajo no prueba por sí solo que la persona perciba únicamente el salario mínimo (puede trabajar media jornada o tener otras percepciones), así que la calculadora no lo detecta sola. Si el contador considera que la base sin aguinaldo debe ser $0, el ISR del caso 2 sería la retención completa del mes con aguinaldo: **$264.90** en lugar de **$131.25**.

3. **Exención en UMA o en salario mínimo.** Con UMA la parte exenta es $3,519.30; con 30 días de salario mínimo general sería $9,451.20. La calculadora usa UMA. Con la lectura en salario mínimo, ninguno de los tres casos pagaría ISR (sus aguinaldos son menores a $9,451.20), y en la frontera norte el tope sería $13,226.10. La diferencia es grande, así que esta lectura necesita confirmación profesional.

## Caso 1 — Sueldo de $12,000, todo el año

1. Sueldo diario: $12,000.00 ÷ 30 = $400.00.
2. Días trabajados en 2026: 365 de 365. Aguinaldo bruto = $400.00 × 15 × 365/365 = **$6,000.00**.
3. Parte exenta: $3,519.30.
4. Parte gravada: $6,000.00 − $3,519.30 = $2,480.70.
5. ISR:
   - Mes sin aguinaldo: $12,000.00 → tramo $7,168.52–$12,598.02: cuota fija $420.95 + 10.88% sobre el excedente.
     ISR causado = $420.95 + ($12,000.00 − $7,168.52) × 10.88% = $946.62.
     Sin subsidio (ingreso > $11,492.66). Retención = $946.62.
   - Mes con aguinaldo gravado: $14,480.70 → tramo $12,598.03–$14,644.64: cuota fija $1,011.68 + 16% sobre el excedente.
     ISR causado = $1,011.68 + ($14,480.70 − $12,598.03) × 16% = $1,312.91.
     Sin subsidio (ingreso > $11,492.66). Retención = $1,312.91.
   - ISR del aguinaldo = $1,312.91 − $946.62 = **$366.29**.
6. Neto = $6,000.00 − $366.29 = **$5,633.71**.

Revisado por (contador): ____________________  Fecha: __________  ¿Correcto? Sí / No — Observaciones: ____________________

## Caso 2 — Salario mínimo general ($315.04 × 30 = $9,451.20), todo el año (aplica subsidio)

1. Sueldo diario: $9,451.20 ÷ 30 = $315.04.
2. Días trabajados en 2026: 365 de 365. Aguinaldo bruto = $315.04 × 15 × 365/365 = **$4,725.60**.
3. Parte exenta: $3,519.30.
4. Parte gravada: $4,725.60 − $3,519.30 = $1,206.30.
5. ISR:
   - Mes sin aguinaldo: $9,451.20 → tramo $7,168.52–$12,598.02: cuota fija $420.95 + 10.88% sobre el excedente.
     ISR causado = $420.95 + ($9,451.20 − $7,168.52) × 10.88% = $669.31.
     Subsidio para el empleo (ingreso ≤ $11,492.66): mín(ISR causado, $535.65) = $535.65. Retención = $133.66.
   - Mes con aguinaldo gravado: $10,657.50 → tramo $7,168.52–$12,598.02: cuota fija $420.95 + 10.88% sobre el excedente.
     ISR causado = $420.95 + ($10,657.50 − $7,168.52) × 10.88% = $800.55.
     Subsidio para el empleo (ingreso ≤ $11,492.66): mín(ISR causado, $535.65) = $535.65. Retención = $264.90.
   - ISR del aguinaldo = $264.90 − $133.66 = **$131.25**.
6. Neto = $4,725.60 − $131.25 = **$4,594.35**.

Revisado por (contador): ____________________  Fecha: __________  ¿Correcto? Sí / No — Observaciones: ____________________

## Caso 3 — Sueldo de $30,000, ingresó el 1 de julio de 2026

1. Sueldo diario: $30,000.00 ÷ 30 = $1,000.00.
2. Días trabajados en 2026: 184 de 365. Aguinaldo bruto = $1,000.00 × 15 × 184/365 = **$7,561.64**.
3. Parte exenta: $3,519.30.
4. Parte gravada: $7,561.64 − $3,519.30 = $4,042.34.
5. ISR:
   - Mes sin aguinaldo: $30,000.00 → tramo $17,533.65–$35,362.83: cuota fija $1,856.84 + 21.36% sobre el excedente.
     ISR causado = $1,856.84 + ($30,000.00 − $17,533.65) × 21.36% = $4,519.65.
     Sin subsidio (ingreso > $11,492.66). Retención = $4,519.65.
   - Mes con aguinaldo gravado: $34,042.34 → tramo $17,533.65–$35,362.83: cuota fija $1,856.84 + 21.36% sobre el excedente.
     ISR causado = $1,856.84 + ($34,042.34 − $17,533.65) × 21.36% = $5,383.10.
     Sin subsidio (ingreso > $11,492.66). Retención = $5,383.10.
   - ISR del aguinaldo = $5,383.10 − $4,519.65 = **$863.44**.
6. Neto = $7,561.64 − $863.44 = **$6,698.20**.

Revisado por (contador): ____________________  Fecha: __________  ¿Correcto? Sí / No — Observaciones: ____________________

