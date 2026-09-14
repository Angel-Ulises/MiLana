# Especificación visual y de experiencia

**Estado:** lista para ejecución posterior, sin cambios aplicados al sitio. Todas las medidas y decisiones de composición de este documento son **H: parámetros de diseño propuestos**, salvo las referencias a estándares. La base visual observada es src/design-home.css y src/App.jsx en el commit 64cdc90b783857cc46b2909d22974a433ae7fc05. La estructura de cálculo se revisa por separado; una mejora visual no certifica sus resultados.

## 1. Identidad y límites

Conservar el nombre MiLana y el concepto “Dinero claro, decisiones propias”. Mantener la fotografía editorial existente que tenga derechos de uso comprobables. No simular clientes, testimonios, sellos regulatorios, premios ni avales. La fotografía ilustrativa no demuestra que un producto haya sido probado. No rehacer todas las imágenes ni incorporar una ilustración generada por cada publicación.

El diseño combina titulares con carácter, lectura serena y controles prácticos. Se mantienen superficies abiertas y fotografía amplia. Se usan cajas solo cuando agrupan una tarea o permiten comparar elementos equivalentes. No introducir desenfoque decorativo adicional, una animación constante de fondo o un carrusel automático.

| Elemento | Especificación |
| --- | --- |
| Fondo principal | Blanco #FFFFFF; marfil #FBF8F2 para bandas editoriales |
| Titular/texto | Tinta #13263B; cuerpo #18283A; secundario #5E6B78 |
| Acción principal | Azul #2D6CAA; hover #245C93; texto blanco |
| Superficie informativa | Azul muy claro #F2F7FB; borde #D9E1E8 |
| Éxito/corrección | Verde #28735A; no usarlo para implicar aprobación de crédito |
| Advertencia/error | Ámbar #9B6723 / rojo #A94442, siempre con texto e icono además del color |
| Tipografía | Newsreader para títulos; Inter para cuerpo, datos y controles; fallbacks existentes |
| Cuerpo | 16 px mínimo, interlineado 1.55-1.65; texto editorial máximo 68 caracteres aproximados por línea |
| Datos monetarios | Numerales tabulares, moneda MXN explícita en la explicación; sin cambiar centavos visualmente |
| Espacio | Escala 4, 8, 12, 16, 24, 32, 48, 64 px |
| Ancho | Contenedor máximo 1280 px; márgenes 32 escritorio, 24 tableta, 20 móvil |
| Radios | Control 12 px; resultado/producto 16 px; sin forzar bordes redondos al hero completo |
| Controles | Alto objetivo 48 px; objetivos interactivos de 44x44 px cuando sean controles independientes |

La paleta es una continuidad del proyecto; cada combinación real debe comprobar contraste en su tamaño y peso. Se pide 4.5:1 para texto normal, 3:1 para texto grande y 3:1 para información gráfica esencial/controles frente al entorno, según los criterios y excepciones de [contraste textual](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) y [no textual](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). Los colores suaves de la paleta no sirven automáticamente para texto pequeño. No se certifica conformidad de toda la página solo por usar estos valores.

## 2. Inicio: una composición definida

Orden final de bloques:

1. Encabezado con marca; enlaces a Calculadoras, Tu situación, Aprende y Cómo revisamos. En móvil, menú con nombre accesible, foco contenido al abrir, Escape para cerrar y retorno al disparador.
2. Hero abierto, marfil y fotografía: mantener H1 “Entiende lo que tienes. Decide lo que sigue.” Subtítulo propuesto: “Calcula tu sueldo y prestaciones en México. Entiende el resultado, revisa sus fuentes y elige tu siguiente paso.” CTA principal “Ver calculadoras”; secundario “Elegir mi situación”. Ambos llevan a anclas reales de la portada desde cualquier ruta.
3. Catálogo visible de herramientas: mostrar primero sueldo neto, aguinaldo, finiquito, liquidación, vacaciones e ISR; acceso explícito al resto. Cada enlace conserva su URL actual. Texto corto describe qué responde, no solo el nombre técnico.
4. Tres situaciones compactas en filas o columnas según ancho: entender mi sueldo, revisar prestaciones y terminar una relación laboral. Conservar las rutas existentes.
5. Dos o tres lecturas útiles con título, resumen de una línea y destino inequívoco. Si todavía llevan a una calculadora, el texto debe decirlo; no presentar como artículo independiente una ruta que no lo es.
6. Banda breve sobre método: qué fuente se usa, fecha de revisión y cómo avisar de un error. El detalle va a una página propia; no repetir una larga sección de tres pasos antes de las herramientas.
7. Pie con Sobre MiLana, Método editorial, Contacto, Privacidad y Cómo nos financiamos. Los destinos deben existir y contener datos reales.

Hero de escritorio: dos zonas de texto/imagen que comparten un fondo, sin tarjeta encerrada. Máximo orientativo de 620 px de alto en un viewport de 1440x900 a texto normal; el objetivo es que empiece a verse el catálogo. En móvil de 360x800: texto primero, botones completos y fotografía de 160-200 px; no obligar a ocupar 100vh. Con texto ampliado prima la lectura y se admite altura adicional.

La foto debe conservar nitidez y proporciones. Mantener gradiente de transición al marfil cuando haga legible el texto; no añadir blur a la imagen. Reservar sus dimensiones para evitar saltos. No se carga perezosamente la imagen principal si es el elemento LCP; las imágenes inferiores sí pueden diferirse.

## 3. Plantilla de calculadora

### Antes del cálculo

Orden móvil: encabezado, breadcrumb, categoría, H1, propósito breve, formulario, resultado cuando exista, pasos siguientes, fotografía editorial secundaria, explicación ampliada, fuentes, preguntas frecuentes y herramientas relacionadas. **La fotografía pasa después de la tarea en móvil**, para que no demore el acceso al primer campo. En escritorio puede permanecer junto al título y propósito.

Ejemplo de propósito de aguinaldo: “Estima tu aguinaldo completo o proporcional. Revisa el desglose y los supuestos antes de compararlo con tu recibo.” La explicación larga actual se conserva abajo en contenido editorial; no se elimina el fundamento.

H1 de calculadora: 44-48 px escritorio y 34-38 px móvil. Introducción: máximo dos frases. Objetivo de aceptación en 360x800 a texto normal: primer campo totalmente visible antes de y=600 px y enlace “Ir al cálculo” disponible al principio cuando el contenido crezca. No fijar una altura que corte texto al ampliar al 200%.

Formulario: ancho máximo 760 px. Una columna hasta 639 px; dos o tres solo cuando las etiquetas y controles quepan completos. Etiquetas siempre visibles, asociadas a cada entrada mediante nombre accesible. El placeholder muestra un ejemplo, no reemplaza la etiqueta. Input numérico con teclado decimal cuando corresponda; no introducir separadores que impidan editar. Las ayudas y errores quedan vinculados al campo. Fecha con ejemplo local legible y sin depender únicamente del formato del navegador.

Botón principal: “Calcular [prestación/concepto]”. No agregar un spinner artificial a una operación local inmediata. Después de error se enfoca el primer campo inválido; conservar los datos ya capturados y explicar qué falta. La validación nunca sustituye los límites legales de la herramienta.

### Resultado

Bloque de resultado con encabezado descriptivo, monto 32 px móvil/40 px escritorio y etiqueta clara de estimado/bruto/neto según lo que realmente calcule. Debajo, desglose y supuestos que cambian el resultado. No usar “Esto te deben pagar” si el alcance es una estimación.

El foco o anuncio accesible informa de que hay resultado sin recorrer toda la página. El valor final se muestra inmediatamente. Se conserva la posibilidad de editar datos y recalcular. “Cómo se calcula” tiene controles accesibles y una fecha de verificación respaldada. Si una referencia está pendiente, el estado debe decirlo y no presentar una insignia genérica de verificación completa.

“Qué revisar ahora” aparece después de la interpretación: máximo tres enlaces. Su orden responde a la necesidad; finiquito/liquidación no muestran crédito contextual por defecto. Compartir utiliza la URL de la herramienta y un texto neutro. **No se incluye sueldo, fecha de ingreso ni monto del resultado en parámetros URL o mensajes prellenados**, salvo acción futura explícita del visitante con vista previa.

### Estados que deben diseñarse

| Estado | Comportamiento visible |
| --- | --- |
| Vacío | Ejemplo de datos y CTA disponible; no resultado ficticio |
| Entrada incompleta | Mensaje junto al campo, manteniendo lo ya escrito |
| Dato fuera del alcance | Explicación del límite y recurso útil; no aproximación silenciosa |
| Resultado correcto técnicamente | Monto, desglose, supuestos y siguientes pasos |
| Fuente caducada o pendiente | Aviso específico; no insinuar revisión completa |
| Fallo de ejecución | Mensaje breve con opción de reintentar, sin filtrar detalles internos |
| Movimiento reducido | Misma información, aparición inmediata y sin traslación |

## 4. Comparaciones y módulo de afiliación

Se crea primero una comparación editorial independiente. La herramienta enlaza a ella de forma secundaria; no inserta una tarjeta de crédito obligatoria junto al monto.

Máximo tres productos en la comparación piloto para hacer viable su revisión. El diseño permite incluir más adelante alternativas pertinentes. Encabezado con la pregunta que resuelve, perfil, fecha material de revisión y metodología. No escribir “las mejores de México” si no hubo un universo, criterios y contraste suficientes para sostenerlo.

Cada producto tiene: nombre y entidad, tipo de entidad, perfil adecuado, motivo para descartarlo, costo y condiciones importantes con vigencia, dos ventajas justificadas, dos límites relevantes y fuente. El CAT u otro indicador se muestra solo con fuente y vigencia, sin mezclarlo con una comisión que MiLana cobre. No deducir aprobación a partir de un sueldo introducido en otra página.

En escritorio: filas de lectura con columnas equivalentes. En móvil: productos apilados con las mismas etiquetas y el costo visible; detalle desplegable adicional, sin esconder condiciones esenciales. CTA “Ver condiciones en [entidad]”, icono de enlace externo y señal de publicidad cuando exista remuneración. Sin cronómetros, falsa escasez ni cintillos que declaren un ganador por comisión.

Ficha comercial desactivada por defecto hasta tener producto autorizado, enlace emitido, relación editorial declarada y fuentes vigentes. Si falta enlace propio, usar un enlace editorial directo sin promesa de comisión. No inventar parámetros afiliados ni publicarlos como si fueran válidos.

## 5. Movimiento, interacción y rendimiento

Estos valores son decisiones de diseño a probar; no se presentan como cifras de conversión obtenidas en un estudio.

| Interacción | Duración y movimiento | Condición de aceptación |
| --- | --- | --- |
| Hero | Texto y CTA visibles inmediatamente; imagen secundaria puede pasar de opacidad 0.9 a 1 en 240 ms | No retrasar LCP ni depender de JS para mostrar contenido |
| Entrada de secciones | Opacidad + traslación vertical máxima 8 px, 220 ms; una vez por visita a la ruta | Contenido legible si no se ejecuta el efecto; no animación continua al hacer scroll |
| Grupo de enlaces | Desfase máximo 40 ms, máximo tres elementos | El grupo queda completo en <=320 ms |
| Hover en tarjeta | Desplazamiento máximo 2 px, 140 ms; borde refuerza respuesta | La misma acción tiene foco visible y funciona al tacto |
| Pulsación de botón | Escala 0.99 durante 90 ms; retorno en 120 ms | No desplazar la maqueta ni requerir soltar ratón fuera del control |
| Resultado | Entrada de opacidad de 160 ms; monto final desde el primer fotograma | Sin contador ascendente, salto de posición o celebración que sugiera certeza |
| Desplegable | 160 ms en icono; contenido puede abrir inmediato | Estado expandido anunciado y foco visible |
| Movimiento reducido | Suprimir desplazamiento, escala, entrada por scroll y scroll suave | Nada desaparece; la tarea sigue íntegra |

Preferir CSS y las capacidades ya disponibles para estos efectos. Una biblioteca nueva solo se justifica si una interacción aprobada la necesita. No añadir una llamada de IA por visita ni por animación.

Objetivos de campo: LCP <=2.5 s, INP <=200 ms, CLS <=0.1 en percentil 75, separados por móvil/escritorio. Si aún no hay datos de campo suficientes, reportar laboratorio como tal. Presupuesto propio inicial: no aumentar JavaScript inicial comprimido más de 15 KB por el trabajo de movimiento y medir imágenes principales en móvil con objetivo orientativo <=200 KB sin degradación visible. Estos dos presupuestos son H, no requisitos universales de Google. Si se incumplen, documentar el motivo antes de extender el diseño.

Referencias: [Web Vitals](https://web.dev/articles/vitals), [W3C movimiento](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [W3C objetivo táctil](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). El objetivo táctil propio de 44 px es más amplio que el mínimo AA de 24 px con sus excepciones.

## 6. Aceptación del diseño

Validar una plantilla completa antes de replicarla: inicio y aguinaldo en 360x800, 390x844, 768x1024 y 1440x900. Registrar capturas, dimensiones y ruta. Estos tamaños son casos de prueba, no una afirmación de cobertura de todos los dispositivos.

- No hay scroll horizontal involuntario, textos cortados, botones superpuestos ni publicidad pegada al botón de cálculo.
- Se puede completar la tarea con teclado; foco visible y orden lógico; etiquetas y errores se anuncian correctamente.
- Al 200% de texto, los controles y condiciones siguen disponibles.
- La preferencia de reducir movimiento desactiva todos los efectos no esenciales, incluido el scroll suave global.
- Inicio, enlaces del encabezado, breadcrumb, retroceso, enlace directo y recarga funcionan desde cualquier calculadora.
- Tres casos de cálculo de referencia conservan resultado y desglose tras el cambio visual. Un cambio de fórmula se trata como tarea distinta.
- La vista previa sirve fuentes, imágenes y enlaces y no expone una ruta temporal como canonical de producción.

La revisión visual se entrega con el enlace, capturas y una lista breve de diferencias observables. No se pide al usuario ejecutar comandos ni descubrir errores técnicos pegando salidas.
