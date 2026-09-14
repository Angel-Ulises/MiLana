# Hallazgos y decisiones

Consulta y pruebas: 14/09/2026. Las referencias S1–S7 están en `03-fuentes.md`. **A**: norma primaria leída; **O**: código o salida observados; **D**: deducción/caso independiente; **P**: pendiente de cerrar. Un A sobre una constante no verifica el motor completo.

## H01. ISR mantiene dos tratamientos del subsidio — P0, A+O+D

`CalcISR` usa $536.22 y un límite calculado como UMA diaria × 3 × 30.4, aproximadamente $10,698.67. `CalcBrutoNeto` llama a `calcISRMensual`, que usa $11,492.66 y UMA mensual × 15.02%. El registro afirma que ambos se corrigieron; el callback de ISR demuestra que no ocurrió.

Para un mes completo ordinario entre febrero y diciembre de 2026, un solo empleador, base salarial gravable de $11,000 y sin excepción de salario mínimo:

| Elemento | Resultado |
| --- | ---: |
| ISR causado por tarifa | $837.82 |
| Subsidio calculado como 3,566.22 × 15.02% | $535.65 |
| Retención de referencia | $302.17 |
| ISR mostrado por la calculadora ISR actual | $837.82 |
| ISR usado por Bruto a Neto actual | $302.17 |

La diferencia de $535.65 no es un desacuerdo entre las tablas: es una divergencia de implementación. Los once renglones mensuales coinciden con el apartado V del Anexo 8 leído en S1. El considerando de S2 menciona $536.22; su disposición operativa establece el porcentaje. Aplicado a la UMA efectiva de S3 produce $535.646244. No sustituir esa operación por la cifra del considerando. Enero tiene una disposición transitoria distinta y queda fuera del primer parche, expresamente en la interfaz.

## H02. Salario mínimo y alcance de “neto” — P0, A+O

Las dos rutas calculan retención para una persona cuya única percepción es el mínimo general; tampoco hay entrada para identificar ese supuesto. En un ejemplo de 30 días a $315.04, el código usa $9,451.20 como base y obtiene ISR de $133.09 o $133.66 según la ruta. S4, art. 96, prevé la excepción a la retención. No identificar automáticamente esa condición por comparar una cifra mensual: hacen falta el supuesto y el periodo.

Bruto a Neto además descuenta $224.47 de IMSS en ese ejemplo. S5, art. 36, asigna íntegramente al patrón la cuota del trabajador que percibe el salario mínimo como cuota diaria. El hallazgo es jurídico y reproducible; no una diferencia de redondeo.

En ISR, “Sueldo neto mensual” solo resta ISR, sin IMSS ni otras deducciones. Debe decir “Ingreso después de ISR, antes de otros descuentos”. El campo debe identificar ingreso gravable. El texto editorial habla de base gravable, pero el campo visible dice bruto.

## H03. IMSS: base, periodo, tope y comentario incorrecto — P0, A+O+P

El agregado fijo de 2.375% se explica por los arts. 25, 107, 147 y 168 de S5. El excedente obrero de 0.40% se deriva del art. 106 II y del transitorio décimo noveno; corresponde a Enfermedades y Maternidad, no a Cesantía y Vejez como dice el comentario actual.

El código usa sueldo bruto mensual como SBC, resta un umbral de UMA mensual y no aplica límite superior. No pide SBC diario, días cotizados, salario mínimo ni incidencias. Por ello la etiqueta “aproximación cercana” no está demostrada. Con $100,000 de sueldo calcula cuota obrera de $2,732.21, sin posibilidad de activar un tope. La existencia de un límite está en el art. 28; la verificación operativa de la conversión a UMA y el caso de nómina completo queda pendiente, no se declara aprobado un importe sustituto.

El editorial asegura que se utiliza SBC y que los valores se leen del JSON; la implementación usa el bruto y constantes en App.jsx. Corregir esta descripción ahora; no simular que el registro ya controla las fórmulas.

## H04. Aguinaldo: fechas, días y validación — P0, O+D

Con salario mensual de $18,000 y 15 días de prestación:

| Entrada | Código actual | Referencia del escenario |
| --- | ---: | ---: |
| Año completo, sin fecha | $9,000.00 | $9,000.00 |
| Ingreso 01/07/2026; continúa hasta 31/12 | 183 días, $4,512.33 | 184 días civiles incluidos, $4,536.99 |
| Ingreso 31/12/2026; trabaja ese día | $0.00 | Un día, $24.66 |
| Ingreso 01/01/2027 | −$24.66 | Rechazo: fuera del ejercicio |
| Prestación −15 días | −$9,000.00 | Rechazo con explicación |
| Prestación 15.5 días | Se trunca a 15 | Conservar 15.5 si se admiten prestaciones superiores |

La entrada 01/01/2026 produce 364 días en UTC y 365 en Ciudad de México, porque se mezclan fechas ISO interpretadas como UTC con getters de fecha local. El conteo civil debe ser independiente del dispositivo. La referencia supone servicio continuo y que el 31/12 es día incluido; esa convención se debe mostrar. La salida no es el aguinaldo devengado “hasta hoy”, sino una proyección al cierre de 2026. Ausencias y casos especiales quedan fuera del primer alcance.

## H05. Finiquito y Liquidación: calendario y antigüedad — P0, O+D

En Finiquito, salario $18,000, entrada 01/07/2026, salida 14/09/2026, cero salarios pendientes y cero vacaciones anteriores: el resultado es $3,698.63 en UTC y $3,723.29 en Ciudad de México. No es aceptable que un mismo caso cambie de importe por dispositivo. Bajo la convención explícita de último día trabajado incluido y 76 días continuos, la referencia bruta de este caso simple es $3,747.95. Este caso no certifica todas las separaciones.

`floor(totalDias / 365)` no calcula aniversarios completos. Entrada 18/09/2011 y salida 14/09/2026 se clasifica como 15 años y agrega $108,000 de prima de antigüedad en una renuncia voluntaria, aunque aún faltan varios días para el aniversario 15. Los bisiestos contaminan el umbral. Debe separarse antigüedad por calendario de prorrateos económicos.

El finiquito usa solo años enteros para la prima una vez habilitada; la liquidación usa años fraccionarios. La fracción indemnizable y el cómputo de servicio efectivo requieren cierre jurídico antes de cambiar esa fórmula. El tope de la prima usa solo el mínimo general sin preguntar zona. S6 remite al área del lugar de trabajo. Liquidación carece del campo de vacaciones anteriores pendientes; un total sin ese saldo debe declararse incompleto. Un año exacto puede mostrar vacaciones proporcionales cero si no se incorpora el saldo generado: especificar qué incluye el saldo pendiente para evitar pérdida o doble conteo.

## H06. Veinte días de indemnización automáticos — P0, A+O

Liquidación suma siempre `SDI × 20 × años`. El formulario no pregunta escenario jurídico, pero el texto promete esos conceptos en un despido injustificado. El propio editorial ya advierte que los veinte días no son automáticos. S6, arts. 48–52, distingue supuestos; el motor no puede resolverlos con salario y fechas.

Decisión de producto: separar simulaciones “sin incluir veinte días” y “supuesto con veinte días jurídicamente procedentes”, sin seleccionar la segunda por defecto ni afirmar que la selección determina un derecho. La base integrada también debe limitarse a las prestaciones realmente modeladas o admitir una base conocida. No basta con añadir una nota al total actual. El siguiente bloque medio solo corrige el estado/copy; el motor de separación se cierra con esfuerzo alto.

## H07. Referencias legales y fuentes de confianza — P0, A+O

La exención de gratificaciones, prima vacacional y PTU aparece en **art. 93 XIV LISR**, no XIII. La fracción XIII trata pagos por separación. El registro había cambiado XIV por XIII y lo llamó verificado. Corregir la referencia con S4, p. 123; no conservar ese cambio como autoridad.

La nota que describe un “tope combinado de siete UMAs anuales para aguinaldo + PTU + prima vacacional” no se sostiene con el párrafo consultado: allí se regula previsión social. Retirar esa afirmación del registro; no implementar ese límite a las tres prestaciones. La operación 30 × UMA vale $3,519.30, pero verificar aritmética no sustituye la comprobación de condiciones fiscales, generalidad y exención anual ya utilizada. En el primer parche de Aguinaldo se puede verificar el bruto y mantener la parte fiscal como alcance separado pendiente, en lugar de certificarla por asociación.

## H08. Diez fichas y realidad visible — P0, O

El JSON contiene seis `verified`, tres `needs-review` y una `blocked`. La función visible produce **cinco verdes**, cuatro pendientes y una en revisión: ISR baja a pendiente porque no tiene `legalBasis`. No afirmar que existen seis insignias verdes.

Siete herramientas no tienen ni una URL de fuente en el registro. La ficha imprime nombres de instituciones, pero no ofrece enlaces ni muestra `verificationScope`. Basta un nombre de institución para cumplir su comprobación `hasSource`. Tener una fecha y el texto “SAT” no demuestra revisión.

RESICO calcula impuesto causado, sin descontar retenciones; el art. 113-J de S4 importa para distinguirlo del pago a realizar. Vacaciones coincide con los hitos de días revisados, pero no se auditó toda entrada posible. PTU solo calcula un total empresarial; su base debe identificarse como renta gravable aplicable, no cualquier utilidad contable. Infonavit es una amortización genérica, no una oferta oficial. Pensión compara edad/semanas: el editorial afirma que comprueba baja laboral y consulta el mínimo desde JSON, pero no hay entrada de baja y usa 875 fijo en App.jsx. Corregir estas afirmaciones sin incorporar un simulador de pensión monetaria.

## Cierre

La evidencia alcanza para ordenar correcciones, no para declarar las cinco herramientas prioritarias listas para promoción. Los oráculos y el alcance del primer parche están en los archivos siguientes. La promoción se decide tras ejecutar esos casos en la versión corregida y revisar los supuestos pendientes.
