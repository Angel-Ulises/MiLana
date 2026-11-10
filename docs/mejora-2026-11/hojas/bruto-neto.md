# Hoja de verificación — Sueldo bruto a neto 2026 (IMSS)

> **Estado:** comprobación técnica hecha por MiLana contra los textos oficiales vigentes (actualizada el 11 de noviembre de 2026). **No es una validación de contador.** Motor: `calcularBrutoNeto2026` (sin cambios) con el SBC estimado (`sbcEstimado`). Los renglones «Revisado por» siguen vacíos.

## Qué hace el modo rápido

La persona escribe solo su sueldo bruto mensual. Si no conoce su salario base de cotización (SBC):

- SBC diario = (sueldo ÷ 30) × (365 + 15 + 12 × 25%) ÷ 365 = (sueldo ÷ 30) × 1.049315, redondeado a centavos. Es el factor de integración mínimo de ley del primer año: 15 días de aguinaldo (LFT art. 87), 12 días de vacaciones (art. 76) y prima de 25% (art. 80). La integración del SBC está en LSS art. 27.
- Ingreso gravable para ISR = sueldo bruto (supone que todo el sueldo paga ISR).
- Días cotizados = 30; tarifa mensual y subsidio de noviembre de 2026 (iguales de febrero a diciembre).
- «Solo gano el salario mínimo» es una casilla en «Más opciones», desmarcada al inicio. Si se marca, ISR = $0 (LISR art. 96) y cuota obrera IMSS = $0, porque la paga el patrón (LSS art. 36).

## Cuotas obreras IMSS usadas (LSS, última reforma DOF 15-01-2026)

- 0.25% prestaciones en dinero (art. 107), 0.375% gastos médicos de pensionados (art. 25), 0.625% invalidez y vida (art. 147) y 1.125% cesantía y vejez (art. 168): en total 2.375% del SBC.
- 0.40% sobre lo que el SBC pase de 3 UMA diarias (art. 106 fr. II; el 2% del texto se redujo 0.16 puntos por año de 1998 a 2007, transitorio Décimo Noveno).
- Tope del SBC: 25 UMA = $2,932.75 diarios (art. 28; el texto dice salario mínimo del DF y se lee como UMA por la desindexación de 2016). UMA diaria 2026: $117.31.

## Supuestos que necesitan decisión de un contador

1. **Factor de integración.** El factor del primer año subestima un poco el SBC de quien tiene más antigüedad (de 14 días de vacaciones en adelante) o prestaciones superiores. Para 5 años de antigüedad (20 días de vacaciones) el factor sería 1.054795. La página permite escribir el SBC real.
2. **Salario mínimo (caso 1).** Si la persona gana *únicamente* el mínimo y no marca la casilla, la calculadora le resta ISR e IMSS que por ley no le corresponden. El neto saldría $9,082.00 en vez de $9,451.20. No se corrige detectándolo por el monto: un sueldo mensual bajo o parcial no prueba por sí solo que la persona perciba únicamente el salario mínimo. Opciones para decidir: dejar la casilla más visible, preguntar directo «¿ganas el salario mínimo?» o dejarlo como está con una nota.
3. **Piso del SBC.** LSS art. 28 fija como límite inferior el salario mínimo del área. El modo rápido no aplica ese piso. Solo importa si el sueldo diario es menor al mínimo (jornada parcial), un caso que la calculadora no cubre.
4. **Meses de 31 días.** El modo rápido siempre usa 30 días cotizados; en un mes de 31 días la cuota IMSS real es un poco mayor.

## Caso 1 — Salario mínimo general ($315.04 × 30 = $9,451.20), sin marcar «Solo gano el salario mínimo»

1. SBC estimado: $9,451.20 ÷ 30 × 1.049315 = $330.58.
2. ISR: tramo $7,168.52–$12,598.02: $420.95 + ($9,451.20 − $7,168.52) × 10.88% = $669.31. Subsidio: $535.65. ISR retenido = **$133.66**.
3. IMSS: $330.58 × 30 × 2.375% = $235.54; excedente de 3 UMA: $0.00 × 30 × 0.40% = $0.00. Cuota obrera = **$235.54**.
4. Neto = $9,451.20 − $133.66 − $235.54 = **$9,082.00**.
5. Con la casilla «Solo gano el salario mínimo» marcada: ISR $0.00, IMSS $0.00, neto **$9,451.20** (LISR art. 96 y LSS art. 36).

Revisado por (contador): ____________________  Fecha: __________  ¿Correcto? Sí / No — Observaciones: ____________________

## Caso 2 — Sueldo de $20,000

1. SBC estimado: $20,000.00 ÷ 30 × 1.049315 = $699.54.
2. ISR: tramo $17,533.65–$35,362.83: $1,856.84 + ($20,000.00 − $17,533.65) × 21.36% = $2,383.65. Subsidio: $0.00. ISR retenido = **$2,383.65**.
3. IMSS: $699.54 × 30 × 2.375% = $498.42; excedente de 3 UMA: $347.61 × 30 × 0.40% = $41.71. Cuota obrera = **$540.14**.
4. Neto = $20,000.00 − $2,383.65 − $540.14 = **$17,076.21**.

Revisado por (contador): ____________________  Fecha: __________  ¿Correcto? Sí / No — Observaciones: ____________________

## Caso 3 — Sueldo de $120,000 (SBC topado en 25 UMA)

1. SBC estimado: $120,000.00 ÷ 30 × 1.049315 = $4,197.26; se topa en $2,932.75.
2. ISR: tramo $106,410.51–$141,880.66: $25,659.23 + ($120,000.00 − $106,410.51) × 32% = $30,007.87. Subsidio: $0.00. ISR retenido = **$30,007.87**.
3. IMSS: $2,932.75 × 30 × 2.375% = $2,089.58; excedente de 3 UMA: $2,580.82 × 30 × 0.40% = $309.70. Cuota obrera = **$2,399.28**.
4. Neto = $120,000.00 − $30,007.87 − $2,399.28 = **$87,592.85**.

Revisado por (contador): ____________________  Fecha: __________  ¿Correcto? Sí / No — Observaciones: ____________________

