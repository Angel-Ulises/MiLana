# MiLana: primera práctica de presupuesto

## Objetivo

Ofrecer una entrada útil a quien todavía no conoce el vocabulario financiero: entender qué entra, qué sale y qué queda, antes de usar sus propios números. Es un incremento de la experiencia existente, no una validación de crecimiento ni una prueba con usuarios reales.

## Base de la propuesta

- `main`: `ea3c6a0c71a500d435b7665d8341995db4ae3c34`, incluido el arreglo de arranque de PR #132.
- Recorrido progresivo pendiente de PR #131: `a48aa4ccad04da4ae1aebb3ea7e6ecdfb9f6da23`.
- Se integran ambas bases sin alterar las ramas originales. La práctica amplía la misma superficie; no añade un cuarto problema ni un segundo hub.
- PR #96 queda fuera de esta propuesta.

## Experiencia

- «¿Primera vez? Entender con un ejemplo» aparece en Organizar mi dinero y en la respuesta «No sé cuánto me queda».
- Tres pasos breves enseñan ingreso neto, gastos básicos/otros/deuda y saldo.
- Las cantidades se identifican como hipotéticas desde el inicio. El caso base es $10,000 de ingreso y $8,000 de gastos, incluyendo $1,000 de pagos de deuda.
- Sumar $500 de gasto permite llegar a saldo positivo, exactamente cero y faltante. El extra es reversible y la práctica puede reiniciarse o cerrarse.
- «Usar mis propios números» abre la calculadora existente con el acompañamiento del recorrido. El ejemplo no se copia. Traslados reales pendientes de otras herramientas conservan su comportamiento.
- Presupuesto ofrece la misma ayuda cerrada después del primer campo, para no retrasar la entrada directa.
- El estado de la práctica sólo vive en memoria de React: sin importes en URL, handoffs, almacenamiento ni métricas nuevas.
- Teclado, foco de paso/cierre, controles nativos, estado anunciado y texto para explicar positivo/cero/negativo, además del color.

## Verificación local, 10 de octubre de 2026

Sobre el código final de esta propuesta:

- `npm test`: **508 pruebas; 434 aprobadas, 0 fallidas, 74 omitidas** porque Chromium no puede iniciar en este executor.
- `npm run build`: pruebas anteriores, compilación Vite, prerender de inicio, generadores y verificación de Órbita completados. El agregado **queda bloqueado** en `verificar-contraste.mjs`: «Chrome no inició».
- Diagnóstico de Chromium: `socket() failed: Operation not permitted`. La ejecución permitida fuera del sandbox tampoco logró iniciar el navegador. Esto no es una prueba de comportamiento de la página.
- Comprobaciones independientes sobre el `dist` generado: **204 destinos/anclas en 101 HTML, 0 rotos**; **97 URLs del sitemap alcanzables, 0 huérfanas**; SEO aprobado; JS inicial **152,330 B de 220,000 B**.
- `git diff --check` y comprobación sintáctica de los nuevos scripts: aprobados.
- Sin cambios a fórmulas de las calculadoras, datos oficiales, fuentes, estados de confianza, Pensión, AdSense ni transferencias existentes.

## Verificación todavía pendiente

No se han validado visualmente los nuevos estados ni ejecutado las nuevas interacciones en Chrome. Los resultados de las pruebas omitidas no se consideran aprobados.

`tests/budget-practice-browser.test.mjs` prepara cinco casos de Chrome: recorridos completos a 320, 390 y 1440 px; modo experto y ambos traslados pendientes; almacenamiento bloqueado. Cubre Enter/Espacio, foco visible, tres pasos, saldo positivo/cero/negativo, tope de gasto, quitar extra, anterior, reinicio, cierre/reapertura, regreso al hub y conservación de los cuatro campos propios.

`scripts/capturar-principiantes.mjs` genera 24 capturas del build completo y un manifiesto con el SHA del checkout/head del PR y comprobaciones. CI guarda el artefacto `principiantes-qa-*` durante siete días. Hace falta inspeccionar esas imágenes y resolver cualquier hallazgo antes de considerar lista la propuesta.

La publicación de una rama/PR, la fusión y el despliegue son decisiones distintas. Este documento no autoriza ninguna de ellas.
