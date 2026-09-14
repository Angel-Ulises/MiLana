# Medición, escenarios y reglas de decisión

**Corte: 14/09/2026.** No hay datos privados de tráfico, conversiones ni cobros disponibles para esta investigación. No se han asignado estimaciones de mercado a esos huecos. Los números de ejemplo de este documento son **H: supuestos ilustrativos**, no tarifas, previsiones ni benchmarks de MiLana.

## 1. Qué cuenta como progreso

Se miden dos recorridos separados. El primero es de utilidad: entrar a una herramienta, comenzar, obtener un resultado y entender qué revisar. El segundo es comercial: leer una comparación, visitar al proveedor, generar una acción elegible y cobrar. Una persona puede resolver su problema sin contratar nada; esa visita no es un fracaso.

Métrica principal de producto: sesiones con resultado válido / sesiones que iniciaron una calculadora, por herramienta y dispositivo. Indicadores de confianza: consulta de fuentes, errores reportados con fundamento y tiempo hasta corregirlos. No premiar una caída de consultas de fuentes como si significara mejor UX sin revisar por qué ocurrió.

Métrica principal comercial: ingresos netos de anulaciones efectivamente cobrados por 1,000 sesiones de comparación. Acompañarla de horas de mantenimiento y adquisición. Separar analítica orientativa del sitio, el panel del afiliado y el movimiento recibido: solo el último acredita caja.

## 2. Contrato mínimo de eventos

Los nombres siguientes son una especificación futura. No están instrumentados ni se presentan como datos ya medidos.

| Evento | Cuándo se registra | Parámetros permitidos |
| --- | --- | --- |
| calculator_start | Primera interacción real con una herramienta durante esa visita | calculator_id, page_path limpio, design_version |
| calculator_result | Resultado válido generado, una vez por intento de cálculo | calculator_id, formula_version, design_version |
| calculator_error | Validación bloquea el intento | calculator_id, error_type de lista cerrada |
| source_open | Abrir metodología o una fuente | calculator_id, source_id, placement |
| next_step_click | Elegir una acción posterior | calculator_id, destination_id, placement |
| comparison_view | La comparación principal está visible | comparison_id, content_version |
| affiliate_click | Pulsación deliberada hacia una oferta autorizada | partner_id, product_id, content_id, placement |
| share_tool | Abrir el mecanismo de compartir la herramienta | calculator_id, channel genérico |

No transmitir salario, monto calculado, RFC, nombre, correo, fecha laboral, número de tarjeta, texto libre ni URLs que contengan esos datos. No crear audiencias publicitarias por pérdida de empleo o mala situación financiera. Los eventos describen uso de funciones, no un perfil crediticio. [16](https://support.google.com/adsense/answer/10502938?hl=es-419)

Para las tasas usar sesiones únicas por etapa, no dividir eventos que pueden repetirse sin deduplicar. Una persona que recalcula cinco veces no son cinco clientes. Definir sesión según la herramienta de analítica elegida; documentar limitaciones de consentimiento, bloqueadores y navegación entre dispositivos. Desactivar envío de eventos desde la vista previa o marcarlos como prueba para excluirlos.

Los subidentificadores que acepte el afiliado pueden representar contenido o ubicación del enlace, nunca datos del visitante. No modificar el enlace emitido fuera de lo permitido por el contrato. Sin atribución entre proveedores confirmada, reportar agregados; no afirmar que se conoce cada venta individual desde Analytics.

## 3. Tablero semanal pequeño

| Área | Dato que se necesita | Decisión que permite |
| --- | --- | --- |
| Descubrimiento | Impresiones y clics por consulta/página de Search Console | Ver qué preguntas reales aparecen y qué páginas necesitan mejor respuesta |
| Utilidad | Inicio, resultado y errores por herramienta | Identificar campos o recorridos que interrumpen la tarea |
| Comparación | Sesiones, clics externos y producto | Separar falta de intención de una oferta poco pertinente |
| Afiliación | Acciones pendientes, aprobadas, anuladas y fecha | Validar atribución y calidad del tráfico según contrato |
| Caja | Pagos recibidos menos devoluciones y costos directos | Saber si ya existe ingreso y margen |
| Operación | Horas de revisión, publicación, soporte y corrección | Evitar un modelo que absorba más trabajo del que compensa |

No pedir al propietario capturas semanales indefinidas. Durante la configuración, elegir acceso de lectura admitido por cada proveedor o reportes descargables una vez; si no existe conexión, documentar la limitación y reducir frecuencia. Un conector de GitHub no concede acceso automático a Analytics o a los paneles de afiliación.

## 4. Fórmulas sin cifras inventadas

Afiliación por acción: **ingreso reconocido = sesiones comerciales x proporción que pulsa al proveedor x proporción de esas visitas con acción aprobada x comisión neta por acción**. El dinero cobrado incorpora además el calendario de liquidación. No contar registros pendientes como si estuvieran pagados.

Afiliación porcentual: **comisión reconocida = base efectivamente comisionable x porcentaje acordado**, dentro del plazo remunerado y descontando anulaciones. docDigitales publica 20% durante un año por referido; falta confirmar la base y las demás condiciones para estimar ingresos reales. [6](https://www.docdigitales.com/programa-afiliados)

AdSense: **ingreso = vistas de página monetizadas / 1,000 x RPM de página observado**. No sustituir vistas por usuarios, mezclar RPM por impresión de anuncio ni inferir ingresos del mero script instalado.

Margen de caja: cobros recibidos menos costos pagados, reembolsos y cargos aplicables. Resultado económico de operación: margen menos horas trabajadas por el valor/hora elegido por el propietario. Los impuestos se determinan según su situación fiscal y documentación, no con un porcentaje genérico supuesto aquí.

## 5. Sensibilidad ilustrativa, no pronóstico

Este ejemplo **no corresponde a Klar, a ningún banco ni a un acuerdo de MiLana**. Se usan 5,000 sesiones mensuales en páginas con intención comercial y una comisión hipotética de MXN 250 para mostrar sensibilidad.

| Escenario ilustrativo | Clic al proveedor | Conversión aprobada por clic | Acciones resultantes | Ingreso hipotético |
| --- | --- | --- | --- | --- |
| A | 2% | 1% | 1 | MXN 250 |
| B | 5% | 2% | 5 | MXN 1,250 |
| C | 10% | 4% | 20 | MXN 5,000 |

La aritmética explica por qué el volumen de visitantes, por sí solo, no permite valorar una web. **No asigna probabilidades ni plazos**. No se presupone que MiLana tenga hoy 5,000 sesiones ni que toda visita a una calculadora sea comercial.

Para un objetivo elegido de MXN 3,000/mes, una comisión hipotética de 250 exige 12 acciones aprobadas. Con 2% de conversión por clic y 5% de clic por sesión comercial, se necesitarían 12,000 sesiones comerciales. Al duplicarse cualquiera de las dos tasas, esa necesidad se reduce a la mitad, si todo lo demás permanece igual. Ninguna de esas tasas está medida aquí.

En una comisión porcentual, una base elegible hipotética de MXN 300 mensuales generaría MXN 60 al 20%, mientras se cumplan contrato y plazo. Diez clientes con esa misma base producirían MXN 600/mes antes de costos. La base de MXN 300 no se presenta como precio de docDigitales. Las suscripciones canceladas, planes no elegibles o descuentos cambiarían el resultado.

## 6. Validaciones con recursos limitados

### E1. Encontrar y completar una tarea

Cinco sesiones exploratorias voluntarias desde teléfono. Pedir encontrar una herramienta, calcular con datos ficticios, explicar el resultado y localizar una fuente. Registrar dificultades y tiempo aproximado sin capturar datos personales. Objetivo propio: cuatro de cinco completan sin instrucciones adicionales; cualquier interpretación peligrosa del resultado se corrige. Esto detecta problemas evidentes, no estima estadísticamente conversión de mercado.

### E2. Atribución y encaje comercial

Antes de publicar: enlace emitido, página admitida, condiciones y evento elegible conocidos. Después: confirmar que clics deliberados se registran; usar un modo de prueba del proveedor si existe. No autorreferirse ni generar operaciones ficticias para obtener pagos. Mantener una sola comparación piloto hasta entender su recorrido.

Revisar al llegar a 100 clics externos válidos o tras 30 días, lo que permita detectar antes un fallo; son umbrales operativos propios. Cero conversiones en una muestra pequeña no demuestra que el canal sea inviable. Confirmar primero seguimiento, país, elegibilidad y plazo de validación. Un contrato que tarda más en liquidar requiere esperar su ventana real antes de juzgar caja.

### E3. Contenido que trae uso útil

Dos piezas originales en un mes, con enlaces diferenciados desde la distribución permitida. Evaluar sesiones que inician y completan una herramienta, consultas reales y errores. Si no hay volumen suficiente, usar observación cualitativa y reforzar distribución; no proclamar victoria con un cambio de una a dos visitas. Mantener la unidad editorial pequeña antes de escalar.

### E4. Patrocinio o licencia

No construir funciones adicionales. Preparar una muestra existente, alcance cerrado, qué recibe el comprador y cómo se medirá. Con autorización futura, conversar con cinco organizaciones pertinentes; continuar si al menos una acepta una prueba pagada con condiciones sostenibles. Es un criterio exploratorio diseñado para evitar construir a ciegas; no evidencia de demanda ya existente. El precio se define por entrega y mantenimiento, no por CPM inventado.

## 7. Decisiones a 30, 90 y 180 días desde la ejecución

- A 30 días: confirmar funcionamiento y medición; mantener o simplificar el flujo según problemas observados.
- A 90 días: buscar repetición de uso y un embudo comercial atribuible; si faltan visitas, corregir adquisición antes de ampliar productos.
- A 180 días: evaluar cobros repetidos, concentración en un proveedor y horas de mantenimiento. Reinvertir solo desde caja comprobada y autorización, no desde comisiones pendientes.

No usar A/B estadístico si el tráfico no permite obtener una muestra razonable. Los cambios secuenciales pueden orientar, pero están confundidos por temporada, fuente y composición del tráfico; no atribuir causalidad sin diseño suficiente. Las animaciones se conservan por utilidad y calidad si no perjudican la tarea, no porque se les atribuya un aumento de ingresos no medido.
