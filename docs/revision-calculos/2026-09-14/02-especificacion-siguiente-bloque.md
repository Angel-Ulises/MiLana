# Siguiente bloque: esfuerzo medio

Decisiones de producto cerradas el 14/09/2026. Objetivo: que el sitio explique sus límites reales y corregir dos recorridos acotados. No incorporar monetización, animaciones ni nuevas calculadoras todavía. Trabajar desde main actualizado, comparando con esta base y con el PR #6 para no pisar cambios de Claude.

## 1. Ficha de confianza (T03)

Separar **disponibilidad**, **revisión de fuentes** y **revisión del cálculo**. Un estado de revisión no debe eliminar una URL ni convertir una orientación de requisitos en una calculadora monetaria.

Campos mínimos del registro, con nombres equivalentes si se conserva el esquema actual: alcance visible, motivo concreto, fecha de consulta de fuente, fecha de revisión de cálculo, periodo cubierto, fuentes con institución/documento/artículo/URL, casos comprobados y siguiente condición de revisión. Conservar el historial previo como antecedente; marcar expresamente las conclusiones sustituidas, sin seguir presentándolas como evidencia vigente.

La fecha de esta auditoría no debe colocarse como fecha de aprobación del cálculo. El 14/09/2026 es una revisión que detectó fallos. Solo registrar aprobación tras corregir y ejecutar los casos correspondientes.

### Matriz que sustituye las etiquetas genéricas

| Herramienta | Estado inicial recomendado para el siguiente parche | Texto visible exacto | Condición para cambiar |
| --- | --- | --- | --- |
| ISR | En revisión | “Estamos corrigiendo la aplicación del subsidio y el alcance del ingreso mostrado.” | Casos ISR aprobados y alcance febrero–diciembre explícito |
| Bruto a Neto | En revisión | “La estimación necesita corregir el tratamiento del salario mínimo, la base y los límites del IMSS.” | SBC, días, topes y excepciones contrastados con caso independiente |
| Aguinaldo | En revisión | “Estamos corrigiendo el conteo de días y la validación de fechas.” | Casos de fechas e importes aprobados; bruto separado de revisión fiscal |
| Finiquito | En revisión | “Estamos corrigiendo fechas, antigüedad y saldos de prestaciones.” | Fechas civiles, umbral de antigüedad y saldos verificados |
| Liquidación | En revisión | “La procedencia de los veinte días y los datos de la indemnización requieren revisión.” | Escenarios jurídicos separados, bases y casos revisados |
| RESICO | Revisión parcial | “Estima el ISR causado antes de retenciones. No determina por sí solo el pago al SAT.” | Etiquetas/alcance y validación de importes; revisión de retenciones si se incorporan |
| Vacaciones | Reglas contrastadas, alcance limitado | “Días mínimos y prima mínima revisados. Las prestaciones superiores pueden ser distintas.” | Pruebas 1, 5, 6, 35 y 36 años; entradas inválidas y enlaces funcionales |
| PTU | Revisión parcial | “Estima el total empresarial sobre la base aplicable. No calcula tu reparto individual.” | Definición verificable de la base y exclusiones empresariales |
| Infonavit | Simulación orientativa | “Simula capital e intereses. No es una cotización oficial de Infonavit.” | Comprobación de amortización; cualquier futura oferta requiere condiciones reales |
| Pensión | Orientación limitada | “Compara edad y semanas para Ley 97 en 2026. No determina el derecho ni el monto de pensión.” | Revisar alcance ante cambio de año, régimen o requisitos |

Para las cinco primeras, no mostrar un sello verde durante la corrección. Si se prepara una versión que todavía mantiene el defecto monetario, suspender el botón de generar nuevos importes y mostrar el motivo junto al formulario; conservar el contenido, las rutas y los enlaces oficiales. Esto es una decisión de publicación del parche, no un cambio ya aplicado. ISR y Aguinaldo pueden reactivar su cálculo al superar los casos de su alcance, sin esperar la reparación del resto.

Pensión conserva su comparación de edad/semanas. El bloqueo del monto no bloquea esa orientación. Vacaciones no debe afirmar “certificado por SAT”; su referencia laboral es la LFT. Evitar que una revisión parcial herede el verde de una comprobación de campos no vacíos.

### Presentación

Motivo breve visible antes del botón o resultado; detalle colapsable “Alcance, revisión y fuentes”. Mostrar el enlace al documento, artículo, periodo y fecha de consulta dentro del detalle. Texto e icono acompañan al color. Emplear estilos de MiLana ya existentes. No mostrar nombres de archivos ni pasos del proceso técnico al visitante.

## 2. Parche acotado de ISR

- Un único cálculo compartido para ISR y el componente ISR de Bruto a Neto. No basta cambiar una constante en una ruta.
- Primer alcance: mes completo ordinario entre **febrero y diciembre de 2026**, ingresos salariales de un empleador. Mostrar ese periodo junto al formulario. Enero, nómina parcial, varios patrones y pagos de separación quedan fuera de este modo; no extrapolar la proyección ×12 a impuesto anual.
- Etiqueta de entrada: “Ingreso mensual gravable para ISR (MXN)”. Ayuda: “Captura la parte gravada de tus percepciones; puede ser distinta de tu sueldo bruto.”
- Añadir una pregunta explícita: “¿En este mes percibiste únicamente el salario mínimo general de tu zona?” Respuestas Sí/No; sin selección asumida. Ayuda: “Se refiere al mínimo general aplicable al lugar donde trabajas.” En Sí, retención cero por el supuesto declarado del art. 96; no intentar inferirlo solo del importe.
- Para No, conservar la tarifa mensual oficial ya contrastada. Subsidio elegible hasta $11,492.66 inclusive, con máximo calculado de $535.646244; retención nunca negativa. Mostrar “Subsidio aplicado” limitado al ISR causado, no dinero adicional a entregar. Las condiciones de empleador único y periodo deben ser explícitas.
- Mostrar dinero a dos decimales; fijar y probar una sola política de redondeo. Para los casos del expediente, conservar precisión interna y redondear al mostrar. Validar entrada monetaria finita, positiva, máximo dos decimales; un tercer decimal debe producir un error, no un tramo inexistente con ISR cero.
- Resultado: “ISR mensual estimado” y “Ingreso después de ISR, antes de otros descuentos”. Eliminar “tasa efectiva real”; usar “Tasa efectiva estimada”. La retención ×12 puede seguir como simulación uniforme, claramente no declaración anual ni calendario con enero incluido.
- Tras superar los casos: “Cálculo revisado para el alcance indicado”. No validar Bruto a Neto completo porque su componente ISR pase.

## 3. Parche acotado de Aguinaldo

- Alcance: salario mensual fijo, servicio continuo, aguinaldo proyectado al cierre de 2026, prestación de al menos 15 días. No llamarlo acumulado hasta hoy.
- Etiqueta: “Fecha de ingreso”. Ayuda: “Se supone que la relación continúa hasta el 31 de diciembre de 2026. Para una salida anterior, consulta Finiquito.” Si fecha anterior a 2026 o ausente con confirmación de año completo, usar 365 días.
- Leer año, mes y día como fecha civil. No mezclar `new Date('YYYY-MM-DD')` con getters locales. Para ingreso dentro de 2026, contar ambos extremos, del ingreso al 31/12. Validar fecha real y no posterior al cierre. Ejecutar en UTC y America/Mexico_City con el mismo resultado.
- Prestación: número finito >=15, admitir fracciones sin truncar (15.5 conserva 15.5). Vacío usa 15 únicamente si se explica como valor predeterminado. Cero y negativos provocan mensaje claro. Sueldo finito positivo, hasta dos decimales.
- Resultado bruto = salario mensual / 30 × días de prestación × días del periodo / 365. Mostrar las variables y el periodo. Los casos de referencia no incluyen descuentos ni incidencias que suspendan generación.
- Separar el bruto de cualquier exención o retención. Primer parche: presentar el bruto revisado y una nota “La retención de ISR no está incluida”. No certificar automáticamente la exención por corregir el conteo. Puede retirarse el desglose fiscal de la salida hasta cerrar generalidad, unidad de referencia y exención anual ya utilizada; conservar la explicación de fuente con el art. 93 XIV correctamente identificado.

## 4. Correcciones editoriales cerradas

En `contenido-calculadoras.json` y `articulos.json`, retirar afirmaciones de que valores se leen del registro mientras sigan definidos en App.jsx. Sustituirlas por descripciones de lo que hace la herramienta sin exponer arquitectura. Pensión no verifica baja laboral; Liquidación no tiene selector jurídico; Bruto a Neto no captura SBC real. No añadir esas capacidades ficticiamente al texto.

En el registro: sustituir las referencias XIII erróneas de exención de aguinaldo/PTU por XIV; dejar la XIII solo donde se trate realmente de separación. Marcar como sustituida la conclusión sobre siete UMAs combinadas y la equivalencia del subsidio fijo $536.22 con el porcentaje efectivo. Actualizar el comentario del excedente IMSS para nombrar Enfermedades y Maternidad. Esto no resuelve por sí mismo H03.

## 5. Verificación y parada

Casos numéricos en `reference-cases.json`, especialmente el límite del subsidio, salario mínimo y las dos zonas horarias. Comprobar en la vista previa campos, errores y resultados; una entrada inválida no debe dejar un resultado anterior que parezca corresponder al dato nuevo. Etiquetas accesibles y errores asociados en los controles que se toquen; no adelantar toda T05 si amplía demasiado el parche.

Verificar que ficha, formulario, editorial y registro cuentan la misma historia. Crear PR con vista previa y resultados. No mezclar automáticamente el PR #6 ni publicar esta rama sin revisar el resultado concreto.

Al terminar este bloque medio, indicar **“Ahora ajusta el esfuerzo a alto”** para revisión de aceptación y cierre de las decisiones de IMSS y separación. La animación y monetización siguen en el plan, después de esta base de confianza.
