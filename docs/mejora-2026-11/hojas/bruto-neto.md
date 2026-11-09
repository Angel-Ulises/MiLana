# Hoja de verificación — Sueldo bruto a neto 2026 (IMSS)

Para revisión de un contador antes de publicar. Motor: `calcularBrutoNeto2026` (sin cambios) con el SBC estimado nuevo (`sbcEstimado`).

## Qué cambió

Antes la persona tenía que escribir su salario base de cotización (SBC), el ingreso gravable, el mes y confirmar varias casillas. Ahora solo escribe su sueldo bruto mensual y, si no conoce su SBC, se estima así:

- SBC diario = (sueldo ÷ 30) × factor de integración mínimo de ley = (sueldo ÷ 30) × (365 + 15 + 12 × 25%) ÷ 365 = (sueldo ÷ 30) × 1.049315, redondeado a centavos.
  (15 días de aguinaldo, LFT art. 87; 12 días de vacaciones del primer año, art. 76; prima de 25 %, art. 80.)
- Ingreso gravable para ISR = sueldo bruto (supone que todo el sueldo paga ISR).
- Días cotizados = 30. Mes = noviembre de 2026 (tabla mensual; subsidio al 15.02 %).

**Decisión que necesita confirmar el contador:** el factor mínimo del primer año subestima un poco el SBC de quien tiene más antigüedad (más días de vacaciones) o prestaciones superiores. La página permite escribir el SBC real en «Más opciones».

## Cuotas obreras IMSS usadas (Ley del Seguro Social, última reforma DOF 15-01-2026)

- 0.25 % prestaciones en dinero (art. 107), 0.375 % gastos médicos de pensionados (art. 25), 0.625 % invalidez y vida (art. 147), 1.125 % cesantía y vejez (art. 168) = 2.375 % del SBC.
- 0.40 % sobre lo que el SBC pase de 3 UMA diarias (art. 106 fr. II, reducido por el transitorio Décimo Noveno).
- Tope del SBC: 25 UMA = $2,932.75 diarios (art. 28). UMA diaria 2026: $117.31.

## Caso 1 — Sueldo de $9,577.22 (salario mínimo general × 30.4), sin marcar «solo gano el mínimo»

1. SBC estimado: $9,577.22 ÷ 30 × 1.049315 = $334.98.
2. ISR: tramo $7,168.52–$12,598.02: $420.95 + ($9,577.22 − $7,168.52) × 10.88% = $683.02. Subsidio: $535.65. ISR retenido = **$147.37**.
3. IMSS: $334.98 × 30 × 2.375% = $238.67; excedente de 3 UMA: $0.00 × 30 × 0.40% = $0.00. Cuota obrera = **$238.67**.
4. Neto = $9,577.22 − $147.37 − $238.67 = **$9,191.18**.

Revisado por: ____________________  Fecha: __________  ¿Correcto? Sí / No — Observaciones: ____________________

## Caso 2 — Sueldo de $20,000

1. SBC estimado: $20,000.00 ÷ 30 × 1.049315 = $699.54.
2. ISR: tramo $17,533.65–$35,362.83: $1,856.84 + ($20,000.00 − $17,533.65) × 21.36% = $2,383.65. Subsidio: $0.00. ISR retenido = **$2,383.65**.
3. IMSS: $699.54 × 30 × 2.375% = $498.42; excedente de 3 UMA: $347.61 × 30 × 0.40% = $41.71. Cuota obrera = **$540.14**.
4. Neto = $20,000.00 − $2,383.65 − $540.14 = **$17,076.21**.

Revisado por: ____________________  Fecha: __________  ¿Correcto? Sí / No — Observaciones: ____________________

## Caso 3 — Sueldo de $120,000 (SBC topado en 25 UMA)

1. SBC estimado: $120,000.00 ÷ 30 × 1.049315 = $4,197.26; se topa en $2,932.75.
2. ISR: tramo $106,410.51–$141,880.66: $25,659.23 + ($120,000.00 − $106,410.51) × 32% = $30,007.87. Subsidio: $0.00. ISR retenido = **$30,007.87**.
3. IMSS: $2,932.75 × 30 × 2.375% = $2,089.58; excedente de 3 UMA: $2,580.82 × 30 × 0.40% = $309.70. Cuota obrera = **$2,399.28**.
4. Neto = $120,000.00 − $30,007.87 − $2,399.28 = **$87,592.85**.

Revisado por: ____________________  Fecha: __________  ¿Correcto? Sí / No — Observaciones: ____________________

