# Auditoría de la base examinada

**Fecha de observación:** 14/09/2026. **Repositorio:** Angel-Ulises/MiLana. **Commit:** 64cdc90b783857cc46b2909d22974a433ae7fc05, publicado 13/09/2026. **Árbol del commit:** 9f6d8c2048311e4a022cece171e7f22719e9eb2f. **Sitio:** https://www.milanaaqui.mx/.

Esta es una auditoría de alcance acotado para planificar negocio y experiencia. No se cambió la aplicación ni se certificaron todos los cálculos. Se revisaron archivos públicos, respuestas HTTP de una muestra y la interfaz de escritorio del inicio y aguinaldo. No se probó visualmente un viewport móvil en esta investigación; las observaciones de móvil proceden del CSS y quedan como casos por validar en ejecución.

## Archivos y estructura

La entrada activa src/main.jsx importa src/App.jsx. Existe además App.jsx en la raíz; no debe confundirse con la entrada actual. El build combina Vite con scripts/generar-paginas.mjs. El catálogo está en src/data/paginas.json; el contenido ampliado en src/data/contenido-calculadoras.json, articulos.json y situaciones.json. Las decisiones visuales viven principalmente en src/design-home.css y estilos de src/App.jsx.

Herramientas del catálogo: finiquito, liquidación, aguinaldo, ISR, RESICO, PTU, bruto a neto, vacaciones, Infonavit y pensión IMSS. Las rutas reales incluyen /calculadoras/bruto-a-neto y /calculadoras/pension-imss, aunque sus identificadores internos pueden ser bruto-neto y pension. No crear alias accidentales al instrumentar eventos.

El sitemap de public/ no es la única evidencia de despliegue: el generador produce uno actualizado durante el build. Un archivo raíz antiguo o un sitemap fuente corto no demuestran que el sitio publicado esté roto.

## HTTP: muestra observada

| Ruta | Respuesta | Metadata y observación |
| --- | --- | --- |
| / | 200 | Canonical https://www.milanaaqui.mx/; HTML inicial de React sin H1 |
| /calculadoras/aguinaldo | 200 | Título y canonical propios; sin H1 en HTML inicial, sí en DOM renderizado |
| /calculadoras/bruto-a-neto | 200 | Título y canonical propios; sin H1 en HTML inicial |
| /situaciones/entender-mi-sueldo | 200 | Título y canonical propios; H1 en HTML inicial |
| /privacidad | 200 | Título y canonical de portada: corregible |
| /sitemap.xml | 200 | Quince URLs: portada, tres situaciones, diez herramientas y privacidad |
| /robots.txt | 200 | Permite rastreo y señala sitemap de dominio principal |
| /pagina-inexistente-verificacion-20260914 | 200 | Sirve HTML de portada; riesgo de soft 404, sin evidencia de señalamiento de Google |

El host sin www redirigió al principal. La URL de Vercel examinada también sirvió contenido. No se observó el estado de indexación de Google, un informe de cobertura ni datos de campo de rendimiento. No se afirma que la falta de H1 en HTML inicial impida por sí sola el rastreo de una aplicación JavaScript.

## Formulario y navegación

En src/App.jsx, Field presenta una etiqueta visual y un input hermano sin id/htmlFor ni otra asociación accesible. El árbol de accesibilidad observado en aguinaldo muestra campos sin nombre accesible explícito. Es un problema concreto, no solo una preferencia de diseño.

El encabezado de aguinaldo conserva enlaces #situaciones, #calculadoras, #aprende y #fuentes que son anclas de portada. Sus destinos deben resolverse a la portada desde rutas internas. La inspección documenta el marcado; la tarea de corrección incluye comprobar el comportamiento completo de navegación.

La introducción de aguinaldo es extensa y la imagen precede al formulario. En CSS, la imagen de la plantilla ocupa 230 px a <=640 px y 320 px entre 641 y 1023 px, además del texto. **Inferencia visual:** acercar campos y reducir redundancia puede facilitar la tarea; la mejora de terminación debe medirse.

## Confianza y datos regulatorios

En src/data/regulatory-data.json, meta.lastReview indica 2026-09-06. Conteo observado:

| Estado | Herramientas |
| --- | --- |
| verified | Finiquito, liquidación, aguinaldo, ISR, RESICO, vacaciones |
| needs-review | PTU, bruto-neto, Infonavit |
| blocked | Pensión |

Todas figuraban además con status=active. Esto revela dos dimensiones distintas, no demuestra por sí solo que se ofrezca un monto de pensión incorrecto. Es necesario revisar el alcance de esa herramienta antes de cambiar su disponibilidad.

Se encontraron fundamentos indirectos en algunas verificaciones: comparación con una publicación secundaria o coherencia con valores presentes en el código. **No es evidencia suficiente para afirmar que una fórmula fue contrastada con la fuente primaria.** Tampoco es prueba de que todos los valores sean erróneos.

Se localizó y leyó el comunicado oficial de INEGI de UMA 2026. Los tres valores del proyecto examinados coinciden: diario 117.31, mensual 3,566.22 y anual 42,794.64, con vigencia desde febrero. Debe incorporarse esa referencia en la revisión futura. No se modificó el registro ni se dio por validado cada uso fiscal de la UMA. [27](https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2026/uma/uma2026.pdf)

## Analítica, anuncios y transparencia

El HTML incorpora scripts de GA4 y AdSense. No se encontraron eventos propios de embudo en el código revisado; el código visible no demuestra si la cuenta recibe datos o tiene aprobación publicitaria. No se obtuvieron reportes privados.

El pie observado enlaza privacidad, pero no ofrece Sobre MiLana, contacto concreto, metodología editorial o relación comercial. La privacidad presenta el cálculo como local y describe analítica de forma general. La revisión debe contrastar ese texto con identificadores, cookies y flujos reales; no afirmar anonimato absoluto por el uso de datos agregados en un panel.

## Qué se mantiene y qué se valida después

Se mantienen URLs existentes, estructura React/Vite, fotografía adaptable, palette marfil/navy y contenido propio aprovechable. Ya hay entradas animadas y parte de la cobertura de movimiento reducido; no se parte de cero. El scroll suave global y efectos de componentes distintos necesitan revisión conjunta.

Validación pendiente: exactitud integral de las calculadoras, comportamiento móvil renderizado, contraste de todas las combinaciones, pruebas de teclado completas, Core Web Vitals reales, indexación, métricas comerciales y contratos. Los hallazgos técnicos son tareas de ejecución; esta auditoría no inicia ese trabajo.
