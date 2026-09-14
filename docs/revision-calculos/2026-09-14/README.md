# MiLana: revisión normativa y de cálculos

**Corte: 14 de septiembre de 2026. Bloque de esfuerzo alto.**

Base de código: `64cdc90b783857cc46b2909d22974a433ae7fc05`, confirmada como main al comenzar. Se revisaron los cinco motores prioritarios y los estados de las diez herramientas. Esta entrega documenta decisiones y pruebas: no cambia las fórmulas ni publica una versión del sitio. La corrección de navegación está en el PR #6, separada de este diagnóstico.

## Decisión

No promover todavía ISR, Bruto a Neto, Aguinaldo, Finiquito ni Liquidación como cálculos verificados. Se encontraron discrepancias reproducibles que cambian dinero. La investigación de T02 queda entregada; su criterio de promoción sigue abierto hasta corregir y superar los casos. T03 queda especificada para implementación con esfuerzo medio. No se atribuye esta revisión a un contador ni a un abogado.

El siguiente bloque será **esfuerzo medio**: implementar la ficha de confianza y sus estados, corregir las contradicciones editoriales y preparar en una vista previa las correcciones acotadas de ISR y Aguinaldo aquí definidas. No extender ese bloque a rehacer nómina IMSS o indemnizaciones. Después se vuelve a esfuerzo alto para revisar el resultado numérico y cerrar Finiquito, Liquidación e IMSS con sus condiciones de aplicación.

## Qué leer para continuar

1. `01-hallazgos.md`: problemas, evidencia y prioridad.
2. `02-especificacion-siguiente-bloque.md`: decisiones cerradas para ejecutar a esfuerzo medio.
3. `03-fuentes.md`: fuentes primarias accesibles, fechas y límites de verificación.
4. `reference-cases.json`: casos independientes de aceptación. Son ejemplos ficticios, no recibos reales.
5. `observed-utc.json` y `observed-mexico.json`: salidas del código auditado.

`reproduce.cjs` es un auxiliar de diagnóstico que extrae y ejecuta los callbacks existentes, sin montar React. Sirve para reproducir defectos, no como oráculo independiente ni como prueba de interfaz. El ejecutor puede usarlo con Node y el directorio del proyecto como argumento, bajo TZ=UTC y TZ=America/Mexico_City. Se ejecutó en ambos husos. Los casos de referencia se calcularon por separado con Decimal y fechas civiles en Python.

## Límites y pendientes concretos

- No se ha certificado una liquidación jurídica individual ni un recibo completo de nómina.
- No se verificó una tabla monetaria de pensión garantizada; la herramienta actual solo compara edad y semanas.
- Se accedió al DOF mediante SIDOF y a las leyes consolidadas de Cámara de Diputados. Algunas páginas de SAT, IMSS y SCJN no devolvieron el documento íntegro; sus fragmentos de búsqueda no se utilizaron para cerrar esos pendientes.
- Para IMSS faltan en este expediente una fuente operativa íntegra sobre aplicación de UMA a la base y una comparación de cotización con periodo, SBC e incidencias definidos. La falta de estas piezas no impide demostrar los defectos del salario mínimo y de la ausencia de tope.
- No se enviaron mensajes a Claude ni se alteró producción. Todo queda en GitHub para retomar sin transportar parches desde el teléfono.
