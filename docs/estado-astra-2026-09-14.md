# Estado de ejecución del plan Astra — 14/09/2026

Este archivo es el punto de continuidad de T22. Resume el estado vigente; las auditorías anteriores se conservan como historial, no como descripción de producción.

## Producto y cálculos

- **T01–T04**: línea base, auditoría, estados y navegación completados.
- **T02 — cierre actualizado**: las diez herramientas tienen un alcance publicable y documentado. ISR y Aguinaldo conservan el motor revisado previamente. Finiquito, Liquidación y Bruto a Neto fueron reimplementados el 14/09/2026 con entradas suficientes y casos de referencia; ya no dependen de aproximaciones silenciosas.
- **Finiquito**: terminaciones de 2026, salario mensual fijo, fechas civiles, salario pendiente, aguinaldo, vacaciones del ciclo, vacaciones ya adquiridas pendientes, prima vacacional, causa de terminación y zona de salario mínimo. La prima de antigüedad se incorpora solo cuando corresponde al supuesto declarado. El total es bruto y no estima ISR por separación.
- **Liquidación**: escenario de despido injustificado para relación por tiempo indeterminado. Separa prestaciones devengadas, tres meses de salario diario integrado, prima de antigüedad y un escenario opcional de 20 días por año. Los 20 días permanecen apagados de forma predeterminada porque no proceden automáticamente en todo despido.
- **Bruto a Neto**: mes completo ordinario de febrero a diciembre de 2026 con un solo empleador. Pide por separado percepciones brutas, ingreso gravable para ISR, SBC diario y días cotizados. Calcula ISR e IMSS dentro de ese alcance y muestra “Neto después de ISR e IMSS”, no promete coincidir con el depósito si existen otras deducciones.
- **Pensión IMSS**: orientación de edad y semanas Ley 97; no inventa un monto de pensión.
- **Infonavit**: simulación matemática con datos capturados; no se presenta como cotización oficial.
- **T03**: cada herramienta muestra una etiqueta positiva y específica de alcance comprobado, con periodo, fuentes y fecha. No se usa un estado genérico para ocultar límites; los límites se explican directamente.

Evidencia del cierre: `tests/calculos-laborales-2026.test.mjs`, `tests/calculos-revisados.test.mjs`, `src/lib/calculos-laborales-2026.mjs`, `src/lib/calculos-revisados.mjs` y `docs/cierre-2026-09-14/README.md`.

## Experiencia y visual

- **T05**: etiquetas, ayudas, campos numéricos, mensajes y regiones de resultado accesibles implementados. Una auditoría manual completa con lector de pantalla sigue siendo una validación de accesibilidad adicional, no un bloqueo del cálculo.
- **T06**: rutas, metadata y 404 útil implementados.
- **T07**: Sobre MiLana, Método, Financiamiento, Privacidad y Contacto existen. Falta únicamente que el titular decida si quiere publicar un canal de contacto y una firma personal; no se inventan identidad o dirección.
- **T08**: composición de Inicio aplicada.
- **T09 — cierre móvil actualizado**: se eliminó el enlace suelto “Ir al cálculo”, la fotografía duplicada después del formulario y los mensajes repetidos. En móvil la fotografía permanece integrada en el encabezado editorial y la herramienta comienza debajo con una sola jerarquía.
- **T10**: movimiento y `prefers-reduced-motion` implementados sin animar cifras.
- **T13**: contrato de eventos implementado sin enviar importes, salarios, RFC, nombres o texto libre.
- **T14**: guías de Aguinaldo y Bruto/Neto publicadas con casos, fuentes y límites.

## Validación del cierre 14/09/2026

La rama `fix/cierre-calculadoras-visual-2026-09-14` ejecutó pruebas automatizadas, compiló las 10 páginas de calculadora y 3 hubs de situación, y comprobó que el contenido público no conserve mensajes de suspensión. Antes de integrar a producción se requiere además el estado READY del proyecto Vercel activo `mi-lana-pn2f`.

## Negocio y dependencias externas

- **T11**: decisión de hosting preparada; falta conocer el plan privado vigente de Vercel antes de tocar DNS.
- **T12**: solo procede si T11 demuestra que la migración es necesaria.
- **T15**: distribución preparada, no enviada a cuentas externas sin una cuenta MiLana autorizada.
- **T16**: expediente de afiliación preparado; no se envían contratos o datos privados desde el repositorio.
- **T17–T18**: requieren primero un programa aceptado y un enlace real emitido por el proveedor.
- **T19**: requiere el diagnóstico real de la cuenta AdSense.
- **T20–T21**: requieren datos de un piloto real, no estimaciones fabricadas.

## Regla de continuidad

Una limitación de alcance no se presenta como trabajo pendiente. Cada herramienta debe pedir los datos que necesita, rechazar entradas fuera de su alcance y explicar lo que no incluye. Los cambios normativos llevan fuente y casos de referencia; los cambios visuales no reinterpretan fórmulas; los datos comerciales privados no se guardan en este repositorio público.
