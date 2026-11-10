# Hoja de verificación — Aguinaldo neto 2026 (empresa privada)

Para revisión de un contador antes de publicar. Generada con el motor del sitio (`calcularAguinaldoNeto` en `src/lib/calculos-revisados.mjs`).

## Fórmula

1. Sueldo diario = sueldo mensual ÷ 30.
2. Aguinaldo bruto = sueldo diario × días de aguinaldo (mínimo 15, LFT art. 87) × (días trabajados en 2026 ÷ 365). Se cuentan el día de ingreso y el 31 de diciembre.
3. Parte exenta = mín(bruto, 30 UMA) = mín(bruto, $3,519.30) (LISR art. 93 fr. XIV; UMA 2026 $117.31, INEGI).
4. Parte gravada = bruto − exenta.
5. ISR del aguinaldo (método general, LISR art. 96) = retención del mes con (sueldo + gravada) − retención del mes con el sueldo solo. Tabla: Anexo 8 RMF 2026, apartado V. Subsidio al empleo: 15.02% de la UMA mensual ($535.65) si el ingreso del mes no pasa de $11,492.66.
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

Revisado por: ____________________  Fecha: __________  ¿Correcto? Sí / No — Observaciones: ____________________

## Caso 2 — Salario mínimo general (315.04 × 30.4 = $9,577.22), todo el año (aplica subsidio)

1. Sueldo diario: $9,577.22 ÷ 30 = $319.24.
2. Días trabajados en 2026: 365 de 365. Aguinaldo bruto = $319.24 × 15 × 365/365 = **$4,788.61**.
3. Parte exenta: $3,519.30.
4. Parte gravada: $4,788.61 − $3,519.30 = $1,269.31.
5. ISR:
   - Mes sin aguinaldo: $9,577.22 → tramo $7,168.52–$12,598.02: cuota fija $420.95 + 10.88% sobre el excedente.
     ISR causado = $420.95 + ($9,577.22 − $7,168.52) × 10.88% = $683.02.
     Subsidio al empleo (ingreso ≤ $11,492.66): mín(ISR causado, $535.65) = $535.65. Retención = $147.37.
   - Mes con aguinaldo gravado: $10,846.53 → tramo $7,168.52–$12,598.02: cuota fija $420.95 + 10.88% sobre el excedente.
     ISR causado = $420.95 + ($10,846.53 − $7,168.52) × 10.88% = $821.12.
     Subsidio al empleo (ingreso ≤ $11,492.66): mín(ISR causado, $535.65) = $535.65. Retención = $285.47.
   - ISR del aguinaldo = $285.47 − $147.37 = **$138.10**.
6. Neto = $4,788.61 − $138.10 = **$4,650.51**.

Revisado por: ____________________  Fecha: __________  ¿Correcto? Sí / No — Observaciones: ____________________

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

Revisado por: ____________________  Fecha: __________  ¿Correcto? Sí / No — Observaciones: ____________________

