# Estado de ejecución del plan Astra — 14/09/2026

Este archivo es el punto de continuidad de T22. No sustituye los documentos de investigación; resume qué se ejecutó, qué evidencia existe y qué dependencia bloquea el siguiente paso.

## Integrado en `main`

- **T01** línea base y mapa de archivos: completada. Registro: `docs/avance-esfuerzo-minimo-2026-09-14.md`.
- **T02** revisión prioritaria: revisión cerrada para decidir promoción. ISR y Aguinaldo fueron corregidos y probados; Finiquito, Liquidación y Bruto a Neto permanecen suspendidos porque persisten dudas que cambian dinero. Esto cumple la regla del plan de posponer promoción cuando la evidencia no alcanza. Auditoría: `docs/revision-calculos/2026-09-14/`.
- **T03** estados públicos: completada para el alcance actual; las fichas no presentan como verificado lo que sigue en revisión.
- **T04** navegación compartida: completada; PR #6 fusionado.
- **T05** accesibilidad de formulario/resultado: implementada en la capa Astra para etiquetas, teclado decimal, ayudas, foco y anuncios. Pendiente una prueba manual completa con lector de pantalla y selector de fecha móvil antes de afirmar conformidad general.
- **T06** metadata/404/rutas: 404 útil creado y catch-all que devolvía portada para rutas inexistentes retirado. Metadata de calculadoras/situaciones conserva el generador actual. No se declara indexación como consecuencia del cambio.
- **T07** confianza y privacidad: Sobre MiLana, Método, Financiamiento, Privacidad y Contacto existen. **No está cerrada** porque falta que el titular autorice un canal público y, si desea firma personal, la identidad que quiera publicar. No se inventó correo, equipo, dirección ni credenciales.
- **T08** composición de Inicio: aplicada según la especificación Astra mediante capa separada, con catálogo antes de situaciones y textos/CTA revisados.
- **T09** plantilla de calculadora: aplicada empezando por el flujo revisado, con acceso temprano al cálculo en móvil y fotografía secundaria después de la tarea.
- **T10** movimiento: aplicada con duraciones y `prefers-reduced-motion`; no se añadió biblioteca nueva ni contador de montos.
- **T11** hosting: diagnóstico preparado en `docs/hosting/decision-2026-09-14.md`. **No cerrada** porque no hay acceso verificado a la facturación privada para saber si `mi-lana-pn2f` sigue en Hobby. Si es Hobby y habrá uso comercial, la alternativa preparada es Cloudflare Pages Free; no se tocó DNS.
- **T12** migración: no procede todavía. Depende del dato privado de T11 y de validar una URL temporal antes de cualquier cambio de dominio.
- **T13** instrumentación: navegación y previews quedan aislados de producción. `public/astra-measurement-2026.js` implementa el contrato Astra para `calculator_start`, `calculator_result`, `calculator_error`, `source_open` y `next_step_click`. No existen todavía comparación, afiliación o compartir, por lo que sus eventos no se inventan.
- **T14** recursos editoriales: creados `/guias/aguinaldo-2026` y `/guias/bruto-neto-recibo`, con casos ficticios, fuentes y límites. **Aceptación final pendiente**: el plan pide autor real; no se publica la identidad del titular sin autorización. La guía de Aguinaldo tiene medición del siguiente paso; la guía bruto/neto debe completar la misma verificación antes de distribución.
- **T15** distribución: preparada en `docs/marketing/t15-distribucion-2026-09-14.md`; no enviada. No existe una cuenta de MiLana autorizada para mantener la cadencia y no se reutilizan cuentas de otras marcas del titular sin decisión explícita. El documento usa el contrato real `page_view` + `next_step_click`.
- **T16** afiliación: preparada en `docs/comercial/t16-afiliacion-preparada-2026-09-14.md`; no enviada. Klar mantiene programa público pero no publica comisión completa; docDigitales publica 25% Starter y 30% en niveles superiores en la página revisada. Faltan aceptación contractual y archivo privado de términos concretos.
- **T22** continuidad: este archivo y los registros por bloque permiten retomar sin pedir al titular reconstruir el historial.

PR principales fusionados: #6 navegación, #7 auditoría, #8 ISR/Aguinaldo/confianza, #9 UX/confianza/medición y #10 contenido/hosting/preparación comercial. PR #11 corrige T15 para usar los nombres de evento del contrato Astra.

Addendum solicitado por el titular: `docs/negocio/monetizacion-corto-plazo-2026-09-14.md`. No altera T01–T22 y concluye que no debe forzarse monetización inmediata.

## Bloqueos correctos por dependencia

- **T17** comparación piloto: no iniciar hasta tener un acuerdo aceptado y demanda/encaje observados. No existe todavía un producto remunerado autorizado; construir una comparativa por comisión violaría el orden del plan.
- **T18** enlace comercial: bloqueada hasta T07, T12, T13, T16 y T17 y hasta recibir un enlace real emitido por un programa. No hay enlaces ficticios.
- **T19** AdSense: no cerrada. La cuenta real no está disponible desde las herramientas actuales; una búsqueda en el correo conectado no devolvió mensajes de AdSense y no se usaron antecedentes como sustituto del estado de la cuenta.
- **T20** conciliación: no puede ejecutarse antes de un lanzamiento real; no existen ventas, panel afiliado ni cobros que conciliar.
- **T21** segundo ingreso/B2B: no procede hasta señales de T20. No se preparan funcionalidades nuevas sin comprador o condiciones verificables.

## Cálculos aún suspendidos

Finiquito, Liquidación y Bruto a Neto permanecen suspendidos por diseño. Reactivarlos requiere cerrar la especificación normativa y casos de referencia del bloque alto; no debe levantarse la suspensión solo para completar una lista de tareas.

## Evidencia de despliegue

Los PR #9 y #10 obtuvieron estado **READY** en el proyecto Vercel activo `mi-lana-pn2f` antes del merge. Los fallos que aparecen en `mi-lana` y `mi-lana-wxas` corresponden a proyectos duplicados sin cuenta GitHub conectada y no al proyecto activo.

## Datos que solo puede completar el titular o una cuenta externa

1. Canal público de contacto e identidad de autor que quiera publicar (T07/T14).
2. Plan real de facturación de `mi-lana-pn2f` para decidir si T12 procede (T11).
3. Aceptación y datos privados de una solicitud de afiliación (T16).
4. Estado real dentro de AdSense (T19).
5. Datos posteriores al lanzamiento: Analytics, panel afiliado y cobros (T20/T21).

## Siguiente acción cuando exista una de esas dependencias

- Con canal/autor autorizado: cerrar T07 y aceptación editorial de T14.
- Con plan Vercel confirmado: cerrar T11 y ejecutar o descartar T12.
- Con decisión de solicitar afiliación: enviar T16 después de revisar los datos privados y, solo tras aceptación/enlace real, iniciar T17.
- Con acceso AdSense: ejecutar T19 contra el diagnóstico mostrado en la cuenta, no contra correos antiguos.
- Con tráfico/clics/cobros reales: ejecutar T20 y decidir T21.

## Regla de continuidad

No marcar una tarea como completada solo porque existe código. La tarea se cierra cuando cumple su criterio de aceptación y sus dependencias. Cambios normativos llevan fuente y caso de referencia; cambios visuales no reinterpretan fórmulas; datos comerciales privados nunca se guardan en este repositorio público.
