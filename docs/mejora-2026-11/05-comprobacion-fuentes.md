# Comprobación contra fuentes oficiales — 11 de noviembre de 2026

> Comprobación técnica hecha por MiLana en la rama `claude/inspiring-einstein-kix4fx`. **No es una validación de contador ni de abogado.** No se cambió ninguna regla fiscal de la calculadora; las propuestas de abajo esperan decisión.

## Fuentes leídas (texto vigente)

| Fuente | Versión | Dónde |
|---|---|---|
| Ley Federal del Trabajo | Última reforma DOF 14-05-2026 | Cámara de Diputados |
| Ley del ISR | Última reforma DOF 01-04-2024 | Cámara de Diputados |
| Reglamento de la Ley del ISR | Última reforma DOF 06-05-2016 | Cámara de Diputados |
| Ley del Seguro Social | Última reforma DOF 15-01-2026 | Cámara de Diputados |
| Anexo 8 RMF 2026 (tarifa mensual, apartado V) | DOF 28-12-2025 | SIDOF, nota 5777219 |
| Decreto del subsidio para el empleo | DOF 31-12-2025 | SIDOF, nota 5777649 |
| UMA 2026 | $117.31 diaria · $3,566.22 mensual | INEGI |
| Salarios mínimos 2026 | $315.04 general · $440.87 frontera norte | CONASAMI (gob.mx) |
| Constitución, transitorio Tercero de la reforma de desindexación | DOF 27-01-2016 | Cámara de Diputados |
| LFPDPPP | Última reforma DOF 14-11-2025 | Cámara de Diputados |

## Las tres discrepancias

### 1. Salario mínimo en las hojas (corregido en los documentos)
- **Qué estaba mal:** los casos «salario mínimo» usaban 315.04 × 30.4 = $9,577.22. La calculadora obtiene el salario diario dividiendo el mensual entre 30 (LFT art. 89), así que ese sueldo da $319.24 diarios, no $315.04. El aguinaldo salía en $4,788.61, cuando 15 días de mínimo son $4,725.60.
- **Corrección hecha:** ambas hojas usan ahora 315.04 × 30 = $9,451.20. Aguinaldo: bruto $4,725.60, ISR $131.25, neto $4,594.35. Bruto a neto: neto $9,082.00 sin la casilla, $9,451.20 con ella.
- **Pruebas:** `tests/aguinaldo-neto.test.mjs` y `tests/calculadoras-directas.test.mjs`.

### 2. Retención del aguinaldo: art. 96 LISR contra art. 174 RLISR (pendiente de contador)
- **Qué hace la calculadora:** método general del art. 96. Suma la parte gravada al sueldo del mes y retiene la diferencia de ISR, con tarifa 2026 y subsidio.
- **Método opcional del art. 174:** comprobado en el texto vigente del Reglamento. Mensualiza la parte gravada (÷ 365 × 30.4), obtiene una tasa y la aplica a la parte gravada. Con los casos de la hoja: $366.29 contra $269.90 en el caso 1, e igual en los casos 2 y 3. Solo difiere cuando el aguinaldo cambia el tramo de la tarifa.
- **Decisiones pendientes:**
  - ¿Cuál método se muestra?
  - ¿El art. 174 se aplica sobre la parte gravada o sobre toda la remuneración?
  - En el caso de salario mínimo (LISR art. 96: no se retiene a quien en el mes *solo* percibe el mínimo), ¿la base sin aguinaldo es $0? Con esa lectura el ISR del caso 2 sería $264.90 en lugar de $131.25.
- **Interpretación a confirmar:** la exención de 30 días de salario mínimo (LISR art. 93 fr. XIV) se calcula en UMA ($3,519.30) por la desindexación. Con salario mínimo serían $9,451.20, y ninguno de los tres casos pagaría ISR. La página hoy lo presenta como un hecho; si el contador confirma la UMA, conviene citar la base; si no, cambia la cifra.

### 3. Estimación del salario base de cotización (pendiente de contador)
- **Cuotas comprobadas en la LSS:** 2.375% del SBC (arts. 25, 107, 147 y 168), 0.40% sobre lo que pase de 3 UMA (art. 106 fr. II y transitorio Décimo Noveno) y tope de 25 UMA (art. 28).
- **Supuestos del modo rápido:**
  - Factor de integración del primer año, 1.049315 (15 días de aguinaldo, 12 de vacaciones, 25% de prima). Subestima con más antigüedad: con 5 años sería 1.054795.
  - Gravable igual al bruto.
  - 30 días cotizados.
  - Sin piso de salario mínimo (LSS art. 28).
- **Quien gana el salario mínimo:** el motor ya aplica LISR art. 96 (ISR $0) y LSS art. 36 (el patrón paga la cuota obrera), pero solo si se marca la casilla «Solo gano el salario mínimo», escondida en «Más opciones». Sin marcarla, el neto sale $369.20 menor.
- **Propuesta descartada:** detectarlo cuando el sueldo mensual ÷ 30 no pasa del mínimo. Se descartó porque un sueldo bajo o parcial no prueba por sí solo que la persona gane *únicamente* el mínimo.
- **Opciones para decidir, sin aplicar:** hacer visible la pregunta «¿Ganas el salario mínimo?» junto al sueldo, dejar la casilla como está con una nota en el resultado, o no cambiar nada.

## Otras afirmaciones legales revisadas

| Afirmación en el sitio | Fuente | Resultado |
|---|---|---|
| Aguinaldo de al menos 15 días, pagado antes del 20 de diciembre, proporcional si no se completó el año | LFT art. 87 | Coincide |
| Gobierno federal: al menos 40 días | LFTSE art. 42 Bis | Coincide (el artículo además divide el pago: 50% antes del 15 de diciembre y 50% a más tardar el 15 de enero; el sitio no lo dice) |
| Vacaciones: 12 días el primer año, +2 hasta 20, luego +2 cada 5 años | LFT art. 76 (reforma DOF 27-12-2022) | Coincide |
| Prima vacacional mínima de 25% | LFT art. 80 | Coincide |
| Prima de antigüedad: 12 días por año, tope de 2 salarios mínimos de la zona; al renunciar, solo con 15 años o más | LFT arts. 162 y 486 | Coincide; usa salario mínimo, no UMA |
| Indemnización de 3 meses y 20 días por año | LFT arts. 48–50 | Coincide |
| Salario diario = mensual ÷ 30 | LFT art. 89 | Coincide |
| PTU: 10%, mitad por días y mitad por salario, tope de 3 meses o el promedio de 3 años, pago dentro de 60 días | LFT arts. 117, 122, 123 y 127 | Coincide (el 10% lo fija la Comisión Nacional, art. 117) |
| RESICO: tasas del 1% al 2.5%; retención de 1.25% por personas morales | LISR arts. 113-E y 113-J | Coincide |
| Pensión Ley 97: 875 semanas en 2026, +25 por año hasta 1,000 en 2031 | LSS, transitorio Cuarto del decreto de 2020 | Coincide |
| Jornada laboral | LFT, reforma DOF 01-05-2026 | Ninguna calculadora la usa; sin efecto |

## Lo que no se cambió

- No se cambió ninguna fórmula ni regla fiscal de la calculadora.
- No se añadió la detección automática del salario mínimo.
- No se tocaron producción, permisos ni credenciales.
