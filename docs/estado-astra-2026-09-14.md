# Estado de ejecución del plan Astra — 14/09/2026

Este archivo es el punto de continuidad de T22. No sustituye los documentos de investigación; resume qué se ejecutó, qué evidencia existe y qué dependencia bloquea el siguiente paso.

## Integrado en main antes de esta rama

- **T01** línea base y mapa de archivos: completada. Registro: `docs/avance-esfuerzo-minimo-2026-09-14.md`.
- **T02** revisión prioritaria: ISR y Aguinaldo corregidos y probados; Finiquito, Liquidación y Bruto a Neto no se declaran terminados y mantienen importe suspendido. Auditoría completa en `docs/revision-calculos/2026-09-14/`.
- **T03** estados públicos: completada para el alcance actual; las fichas no presentan como verificado lo que sigue en revisión.
- **T04** navegación compartida: completada; PR #6 fusionado.
- **T05** accesibilidad de formulario/resultado: implementada en la capa Astra para etiquetas, teclado decimal, ayudas, foco y anuncios; falta una prueba manual completa con lector de pantalla y selector de fecha móvil antes de afirmar conformidad general.
- **T06** metadata/404/rutas: se creó 404 útil y se retiró el catch-all que devolvía portada para rutas inexistentes. Metadata de calculadoras/situaciones conserva el generador actual. No se declara indexación como consecuencia del cambio.
- **T07** confianza y privacidad: Sobre MiLana, Método, Financiamiento, Privacidad y Contacto existen. Contacto declara que falta autorizar un canal público; no se inventó correo/equipo/dirección.
- **T08** composición de Inicio: aplicada según la especificación Astra mediante capa separada, con catálogo antes de situaciones y textos/CTA revisados.
- **T09** plantilla de calculadora: aplicada empezando por el flujo revisado, con acceso temprano al cálculo en móvil y fotografía secundaria después de la tarea.
- **T10** movimiento: aplicada con duraciones y `prefers-reduced-motion`; no se añadió biblioteca nueva ni contador de montos.
- **T13** instrumentación: navegación/preview aislados en producción; se añadió `public/astra-measurement-2026.js` con los nombres de evento del contrato Astra para `calculator_start`, `calculator_result`, `calculator_error`, `source_open` y `next_step_click`. No existen todavía comparación, afiliación o compartir, por lo que sus eventos no deben fingirse.

PR de UX/confianza: #9, fusionado. Despliegue principal Vercel quedó READY antes del merge y después del merge.

## En la rama `feat/astra-content-hosting-2026-09-14`

- **T11** hosting: diagnóstico preparado en `docs/hosting/decision-2026-09-14.md`. No cerrado porque no hay acceso verificado a la facturación privada para saber si `mi-lana-pn2f` sigue en Hobby. Si es Hobby y habrá uso comercial, la alternativa preparada es Cloudflare Pages Free; no se tocó DNS.
- **T12** migración: no procede todavía. Depende de T11 y de una URL temporal verificada antes de cualquier cambio de dominio.
- **T14** dos recursos editoriales: creados en `/guias/aguinaldo-2026` y `/guias/bruto-neto-recibo`, con casos ficticios, fuentes y límites.
- **T15** distribución: preparada en `docs/marketing/t15-distribucion-2026-09-14.md`; no enviada. No hay una cuenta de MiLana autorizada para mantener la cadencia y no se reutilizan cuentas de otras marcas del titular sin decisión explícita. Aguinaldo tiene medición de siguiente paso preparada; la segunda guía requiere completar la misma aceptación antes de distribuir.
- **T16** afiliación: preparada en `docs/comercial/t16-afiliacion-preparada-2026-09-14.md`; no enviada. Klar mantiene programa público pero no publica comisión completa; docDigitales publica 25% Starter y 30% en niveles superiores en la página revisada. Faltan aceptación contractual y archivo privado de términos concretos.

Addendum solicitado por el titular: `docs/negocio/monetizacion-corto-plazo-2026-09-14.md`. No altera T01–T22 y concluye que no debe forzarse monetización inmediata.

## Bloqueos correctos por dependencia

- **T17** comparación piloto: no iniciar hasta tener un acuerdo aceptado y demanda/encaje observados. No existe todavía un producto remunerado autorizado; construir una comparativa por comisión violaría el orden del plan.
- **T18** enlace comercial: bloqueada hasta T07/T12/T13/T16/T17 y hasta recibir un enlace real emitido por un programa. No hay enlaces ficticios.
- **T19** AdSense: no cerrada. La cuenta real no está disponible desde las herramientas actuales; una búsqueda en el correo conectado no devolvió mensajes de AdSense y no se usaron antecedentes como sustituto del estado de la cuenta.
- **T20** conciliación: no puede ejecutarse antes de un lanzamiento real; no existen ventas, panel afiliado ni cobros que conciliar.
- **T21** segundo ingreso/B2B: no procede hasta señales de T20. No se preparan funcionalidades nuevas sin comprador/condiciones verificables.

## Cálculos aún suspendidos

Finiquito, Liquidación y Bruto a Neto permanecen suspendidos por diseño. Reactivarlos requiere cerrar la especificación normativa y casos de referencia del bloque alto; no debe levantarse la suspensión para completar una lista de tareas.

## Siguiente acción técnicamente ejecutable

1. Validar esta rama en Vercel y fusionarla si el proyecto activo queda READY.
2. Comprobar que las dos guías y páginas de transparencia sirven sin cargar Analytics en previews.
3. Cuando el titular autorice un canal público de contacto, cerrar T07.
4. Cuando se conozca el plan privado de Vercel, cerrar T11 y decidir si T12 procede.
5. Si el titular decide solicitar afiliación, enviar T16 solo después de aceptar los datos y términos requeridos; entonces T17 puede empezar con una única necesidad.

## Regla de continuidad

No marcar una tarea como completada solo porque existe código. La tarea se cierra cuando cumple su criterio de aceptación y sus dependencias. Cambios normativos llevan fuente/caso de referencia; cambios visuales no reinterpretan fórmulas; datos comerciales privados nunca se guardan en este repositorio público.
