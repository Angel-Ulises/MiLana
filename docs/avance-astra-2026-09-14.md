# Ejecución del plan Astra — 14/09/2026

Este registro continúa `docs/estrategia/2026-09-14/03-plan-ejecucion.md`. No cambia el orden del plan ni adelanta monetización.

## Cerrado e integrado en main antes de esta rama

- **T01** — mapa de entrada activo documentado: `index.html -> src/main.jsx -> src/App.jsx`; build Vite + generador a `dist`.
- **T02** — ISR y Aguinaldo corregidos y contrastados con casos independientes. Finiquito, Liquidación y Bruto a Neto permanecen con importe suspendido porque la revisión encontró supuestos que sí cambian dinero.
- **T03** — estados públicos alineados con el alcance: fuentes, periodo, razón de revisión y suspensión cuando corresponde.
- **T04** — navegación entre calculadoras y anclas de Inicio corregida e integrada.
- Auditoría y 29 casos de referencia incorporados en `docs/revision-calculos/2026-09-14/`.

## Esta rama

### T05 — accesibilidad del formulario y resultado

Estado: **implementado para la plantilla actual; aceptación visual pendiente del preview**.

- Conserva la asociación `label/input` introducida en T02.
- Controles objetivo de 48 px y foco visible.
- `inputmode=decimal` para entradas numéricas.
- Ayuda adicional para fecha cuando el control no tiene descripción.
- Tras un envío con error, intenta enfocar el primer campo marcado `aria-invalid=true` sin borrar lo ya escrito.
- Resultado anunciado de forma educada mediante regiones `aria-live` existentes.
- Menú móvil: `aria-expanded`, Escape, ciclo de foco y retorno al disparador.

### T06 — metadata, privacidad y 404

Estado: **implementado; requiere comprobar respuestas HTTP del preview**.

- Se añade `public/404.html` con `noindex` y navegación útil.
- Se elimina el catch-all de Vercel que convertía cualquier URL en la portada.
- Se crea una página estática de privacidad con canonical propio y descripción del tratamiento observado.
- No se afirma una penalización SEO; la aceptación depende de comprobar HTTP real después del deploy.

### T07 — confianza y privacidad con datos reales

Estado: **parcial por diseño, sin inventar datos**.

Publicadas en la rama:
- `/sobre/`
- `/metodo/`
- `/privacidad/`
- `/financiamiento/`
- `/contacto/`

`Contacto` declara que el canal público está pendiente porque no se ha autorizado un correo, formulario o cuenta social específica. Esta dependencia no se sustituye por datos inventados. La página de financiamiento declara que no se activaron nuevos enlaces de afiliación en esta implementación.

### T08 — composición de Inicio

Estado: **implementado como capa reversible; aceptación visual pendiente**.

- Mantiene H1 de marca.
- Sustituye el subtítulo por el definido en la especificación.
- CTA principal: `Ver calculadoras`; secundario: `Elegir mi situación`.
- Catálogo pasa antes de Situaciones.
- Primer grupo: Bruto a Neto, Aguinaldo, Finiquito, Liquidación, Vacaciones e ISR; las tres herramientas con importes suspendidos muestran `Importe en revisión`.
- Situaciones se compactan.
- La sección repetitiva `La ruta MiLana` queda retirada de la portada visible, sin borrar su código original.
- Se mantiene el bloque de lecturas y luego la banda breve de método.

### T09 — plantilla de calculadora, piloto Aguinaldo

Estado: **implementado como plantilla compartida; aceptación visual/móvil pendiente**.

- Propósito corto para Aguinaldo y herramientas prioritarias.
- Enlace `Ir al cálculo` al inicio.
- En móvil la fotografía editorial del encabezado se oculta y se replica después del componente de cálculo, para priorizar la tarea.
- En escritorio la fotografía sigue formando parte del encabezado.
- No se cambió ninguna fórmula en esta rama.

### T10 — movimiento y peso

Estado: **implementado; falta medición del preview**.

- Imagen del hero: opacidad 0.9 → 1 en 240 ms.
- Entrada secundaria: opacidad + máximo 8 px en 220 ms.
- Hover de tarjeta: máximo 2 px en 140 ms.
- Pulsación de botón: escala 0.99.
- Resultado: opacidad 160 ms; monto final presente desde el primer fotograma.
- `prefers-reduced-motion` elimina traslaciones, escalas, revelado y scroll suave.
- No se instaló ninguna biblioteca nueva.

### T13 — medición mínima

Estado: **instrumentación implementada; requiere comprobar eventos en la cuenta real**.

Eventos añadidos: `calculator_start`, `calculation_submit`, `trust_open`, `home_calculator_click` y navegación SPA. Los parámetros propios se limitan a ruta/slug; no se envían salario, fecha de ingreso, importe calculado ni valores de formulario.

Analytics y AdSense se cargan únicamente en `milanaaqui.mx` / `www.milanaaqui.mx`, no en previews.

## Monetización

No se adelantan T16–T19. La investigación encontró programas potenciales, pero el plan exige primero confianza, hosting, medición, contenido y condiciones comerciales verificadas. No se ha creado un enlace afiliado, una tarjeta de producto ni una comisión ficticia.

## Próximas puertas del plan

1. Validar build y preview de esta rama; revisar rutas reales y 404.
2. Aceptar Inicio/Aguinaldo en los tamaños de prueba definidos por Astra.
3. T11: confirmar plan real de hosting; preparar alternativa solo si el uso comercial lo requiere.
4. T12 solo si T11 demuestra que la migración procede.
5. T14–T15: piezas editoriales y distribución antes de solicitar/activar afiliación.
6. T16–T19 únicamente con condiciones y cuentas reales.
