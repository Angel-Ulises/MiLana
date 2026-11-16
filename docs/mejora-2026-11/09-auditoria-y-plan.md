# Auditoría del sitio y plan de mejora sin terceros (16-nov-2026)

> **Qué es esto:** hallazgos medidos en un navegador real (Chrome, 390 px de ancho) sobre el build local de producción (`1a2209b` + PR 168), no sobre el sitio en vivo. Todo lo de esta lista se puede hacer sin depender de nadie externo. Las ideas que dependen de terceros (probar con personas, contador, alianzas, canal de WhatsApp) quedan fuera por decisión de Ángel.
>
> Las reglas vigentes están en `08-ideas-pendientes.md`. Aplican todas.
>
> **El orden de trabajo vigente está en `10-analisis-a-fondo.md`, sección 6.** Ese análisis agregó las tareas T12 a T17 de abajo y bajó la prioridad de T7.

## Hallazgos

### 1. Las calculadoras aceptan datos imposibles y dan un resultado

Probado escribiendo `999999999999` en el primer campo:

| Calculadora | Lo que mostró |
|---|---|
| Vacaciones | «400000000018 días» |
| Pensión IMSS (edad) | «Te faltan 75 semanas», como si nada |
| RESICO | ISR de $24,999,999,999.98; el régimen tiene tope de ingresos y la tabla del código termina en $3,500,000 |
| Aguinaldo, ISR, Infonavit | Montos de cientos o miles de millones |
| Finiquito, liquidación, bruto a neto | Sí lo rechazan |

### 2. Los mensajes de error no hablan igual

Para el mismo problema (campo vacío, cero, negativo o letras) hay cuatro estilos:

- Aguinaldo e ISR: «Captura un importe positivo con un máximo de dos decimales.»
- Finiquito y liquidación: «Salario mensual: revisa el valor capturado.» / «Salario mensual: captura un número válido.»
- Bruto a neto: «Sueldo: escribe una cantidad mayor que cero.» y, con un valor enorme, «Percepciones brutas del mes: revisa el…»
- El resto: «<Campo>: escribe una cantidad mayor que cero.»

Además, el mensaje dice «Salario mensual» aunque la persona haya elegido pago por semana o quincena, y usa nombres internos («Percepciones brutas», «Renta gravable de la empresa») distintos de la etiqueta que ve.

### 3. Lo que tiene cada resultado no es parejo

| Calculadora | Semana/quincena/mes | «¿Y si no me lo pagan?» | «¿Me pagaron bien?» |
|---|---|---|---|
| Aguinaldo | Sí | Sí | Sí |
| Finiquito | Sí | Sí | No |
| Liquidación | Sí | Sí | No |
| Vacaciones | Sí | Sí | No |
| PTU | No aplica | **No** (y sí se puede reclamar) | No |
| ISR | Quincena/mes | No aplica | No |
| Bruto a neto | Quincena/mes | No aplica | No |
| RESICO, Infonavit, Pensión | No aplica | No aplica | No aplica |

Todas tienen «Escuchar», WhatsApp, «Ver cómo se calculó» y un siguiente paso.

### 4. Botones y enlaces chicos para el dedo

- «Ver cómo se calculó», «¿Y si no me lo pagan?» y «¿Ya te lo depositaron?»: 36 px de alto.
- El enlace del siguiente paso: 35 px.
- «← Todas las calculadoras»: 17 px.
- Enlaces dentro de texto: 20 px.

La referencia usual es 44 px o más.

### 5. La explicación plegada sigue escrita para especialistas

Con «Ejemplo, cómo se calcula y fuentes» abierto, cada calculadora tiene entre 760 y 1,080 palabras y de 3 a 8 frases de más de 28 palabras. Palabras frecuentes sin explicar: «capturar», «percepciones», «gravable», «devengado», «integrado», «cotización», «amortización», «subsidio». Ejemplos reales:

- Aguinaldo: «Aguinaldo bruto 2026: LFT con días capturados; LFTSE federal con mínimo de 40 días; SEP federal Básica/apoyo con 40 días y base computable…»
- Liquidación: «Que la calculadora muestre un componente no demuestra por sí mismo que jurídicamente proceda en tu caso…»
- RESICO: «La base no se construye como una utilidad obtenida al restar gastos: para esta mecánica se consideran los ingresos efectivamente cobrados…»
- Bruto a neto: 19 veces «ISR», 13 «UMA», 10 «SBC».

Las guías cortas (`leer-recibo-nomina`, `pension-imss-ley-97`) y las portadas están bien: cero frases largas.

### 6. Peso

- Cada calculadora hace 41 peticiones (pensión, 34).
- Peso sin comprimir por página: de 350 KB (ISR) a 847 KB (RESICO). La diferencia entre páginas parece venir de la foto de cabecera; hay que confirmarlo.
- 12 programas y 11 hojas de estilo por página; letras servidas desde un servidor externo.

**Corrección al medir con celular y red lentos simulados:** el contenido principal aparece entre 0.8 y 2.2 s en las 7 páginas probadas, casi sin saltos de diseño. El sitio no es lento; reducir peticiones es mejora, no urgencia.

### 7. Lo que salió bien

- Ninguna página tiene desborde horizontal a 390 px.
- Un solo `h1` por página; ninguna imagen sin texto alternativo.
- Ningún texto visible menor de 13 px en las calculadoras.
- Todos los botones de opción tienen etiqueta y están agrupados.
- Los campos principales miden 55 px de alto.

---

## Plan, en orden

Cada tarea es un PR independiente contra `claude/cloudflare-pages`, con build completo en verde.

### T1. Límites sensatos en todas las calculadoras
- Definir por campo un mínimo y un máximo razonables en un solo lugar (por ejemplo: edad 15 a 100; años de antigüedad 0 a 60; semanas cotizadas 0 a 3,000).
- Para montos, no inventar un tope legal: si el valor es extraordinariamente alto, mostrar aviso «Revisa la cantidad: parece demasiado alta» y no dar resultado.
- RESICO: verificar el tope de ingresos del régimen en la Ley del ISR vigente (diputados.gob.mx) antes de escribir cualquier cifra; si el ingreso mensual anualizado lo rebasa, avisar que el régimen podría no aplicar, sin afirmarlo.
- **Listo cuando:** `999999999999`, `-1`, `0`, vacío y letras dan aviso y ningún resultado en las 10; hay prueba por calculadora.

### T2. Un solo modo de avisar errores
- Un componente y una función para el mensaje, usados por las 10.
- Texto con la etiqueta que la persona ve, no el nombre interno. Sin «captura», sin «importe».
- Propuesta de textos: vacío, nada; cero o negativo, «Escribe una cantidad mayor que cero»; letras, «Escribe solo números»; demasiado alto, «Revisa la cantidad: parece demasiado alta».
- El aviso va junto al campo, ligado con `aria-describedby`, y se anuncia con `aria-live`.
- **Listo cuando:** una prueba recorre las 10 con los mismos datos malos y compara los textos.

### T3. Resultado parejo
- «¿Y si no me lo pagan?» en PTU, tras verificar plazos en la LFT (arts. 122 y 516).
- «¿Me pagaron bien?» en finiquito, liquidación y vacaciones, reutilizando `compararDeposito` y `VeredictoDeposito`. Ojo: finiquito y liquidación muestran total antes de impuestos; el texto debe decirlo y no comparar un depósito neto contra un bruto sin avisar.
- **Listo cuando:** la tabla del hallazgo 3 queda pareja y con pruebas de texto visible.

### T4. Botones del tamaño de un dedo
- Mínimo 44 px de alto en `summary`, enlace de siguiente paso y «← Todas las calculadoras».
- **Listo cuando:** una prueba de navegador mide los elementos interactivos de las 10 y ninguno principal baja de 44 px.

### T5. Explicación en dos niveles
- En «Ejemplo, cómo se calcula y fuentes»: primero un ejemplo con una persona y cinco renglones; debajo, el detalle técnico tal como está, bajo «Para especialistas».
- No borrar contenido técnico ni fuentes.
- Reemplazar «capturar» por «escribir» en todo texto visible.
- **Listo cuando:** la parte de arriba no tiene frases de más de 25 palabras (prueba automática).

### T6. Prueba automática de lectura fácil
- Un test que recorra los HTML generados y falle si el texto visible fuera de «Para especialistas» tiene frases de más de 28 palabras o palabras de una lista prohibida sin su explicación.
- Empezar como informe (no bloquea) y volverlo obligatorio cuando el sitio esté limpio.

### T7. Peso y velocidad (prioridad baja tras medir)
- Medir primero: guardar en el repositorio un informe por página (peticiones, peso, tiempo hasta poder escribir) para comparar después.
- Unir las hojas `orbita-v3-*` en una y los programas `orbita-v3-*` en uno.
- Servir las letras desde el propio sitio.
- Confirmar si la foto de cabecera explica la diferencia de 350 a 847 KB y, si es así, servirla más ligera en celular.
- **Listo cuando:** menos de 15 peticiones por calculadora y el informe muestra la mejora. No cambiar el aspecto.

### T8. Orden por dentro
- Un solo componente de pie y uno de encabezado (hoy repetidos en unos 18 archivos).
- Partir `src/App.jsx` (1,442 líneas) por calculadora.
- Quitar reglas `!important` conforme T7 una las hojas.
- **Listo cuando:** las pruebas siguen en verde y no cambia nada visible (comparación de capturas).

### T9. Datos del año en un solo lugar
- Salario mínimo, UMA, tablas de ISR y cuotas en un único archivo con fecha y fuente, usado por cálculos y por los textos.
- Lista escrita de «qué cambia en enero y dónde».
- **Listo cuando:** cambiar el salario mínimo en un archivo actualiza calculadoras, textos y pruebas.

### T10. Vigilancia sin terceros
- Ya existen 9 automatizaciones de datos y recordatorios. Primero: resolver o cerrar los 33 asuntos abiertos y los 6 PR viejos, y dejar solo las alarmas que alguien atienda.
- Agregar una revisión diaria que compile, corra las pruebas y abra un aviso si algo falla.
- Una segunda que revise si cambió la fecha de «última reforma» de la LFT y la LISR en diputados.gob.mx y avise, sin cambiar nada sola.

### T11. Cambio de año (urgente: faltan seis semanas)
- El año «2026» está escrito a mano en unos 1,970 lugares de `src`, 21 páginas HTML de `public`, 90 de `scripts` y 297 de `tests`.
- **Caso confirmado:** pensión usa `SEMANAS_MINIMAS_2026 = 875`; en 2027 la ley pide 900 (ver T16).
- La calculadora de ISR, a partir del 1 de enero de 2027, usa en silencio el periodo `2026-11` (`src/calculadorasDirectas.jsx`, línea 165). No se rompe, pero mostrará cifras de 2026 sin avisar que el año ya cambió.
- Hacer **antes de diciembre**: una prueba que simule el reloj en enero y en febrero de 2027 y recorra las 10 calculadoras, para ver cuáles fallan, cuáles calculan con el año equivocado (por ejemplo, días trabajados «en 2026») y cuáles solo necesitan un aviso.
- Mientras no existan los valores oficiales de 2027, mostrar un aviso visible: «Cálculo con valores de 2026; los de 2027 se actualizan cuando se publiquen».
- No escribir ningún valor de 2027 que no esté publicado en el DOF, CONASAMI, INEGI o SAT.
- **Listo cuando:** la prueba con reloj simulado pasa y existe la lista «qué cambia en enero y dónde» (une con T9).

### T12. Que el resultado se vea al escribir
- Con el teclado abierto el monto queda de 71 a 337 px debajo de lo visible en las 10 calculadoras.
- Franja fija con el resultado en una línea, o desplazar el resultado a la vista cuando el dato ya es válido. Sin tapar el campo que se está llenando.
- **Listo cuando:** prueba de navegador con ventana de 420 px de alto: tras escribir un dato válido, el monto es visible en las 10. Revisado en un teléfono real por Ángel u Orion.

### T13. Buscador que entienda a la gente
- Incluir en el índice las guías de Aprende, Situaciones y las páginas institucionales.
- Palabras alternativas para todas las entradas (hoy PTU e Infonavit no tienen); usar los nombres sencillos nuevos.
- Comparar por raíz de palabra para que «renuncia» encuentre «renuncié» y «impuestos» encuentre «impuesto».
- Para lo que no existe: «Todavía no tenemos eso» y lo más cercano.
- **Listo cuando:** una prueba con 100 búsquedas fijas (las 87 del análisis y 13 más) da resultado en todas las que tienen contenido; hoy fallan 47 de 87.

### T14. Campos de dinero que entienden a la gente
- Aceptar «12 mil», «12mil», «12k», «12000 pesos».
- Ante «12.000» o «12,00», preguntar «¿Quisiste decir $12,000?» con un botón; no adivinar en silencio.
- Es una duda de formato. No es detección por monto, que sigue prohibida.
- **Listo cuando:** prueba con esos formatos en las 10.

### T15. Vacaciones en el primer año
- Con 0 años o una fracción menor a 1, explicar cuándo llegan los primeros días y enlazar a Finiquito para la parte proporcional. Hoy `0` da error y `0.5` no muestra nada.
- Verificar el texto en los arts. 76 y 79 de la LFT.

### T16. Pensión con el requisito por año (antes del 1 de enero)
- Sustituir la constante `SEMANAS_MINIMAS_2026` por la tabla 2021 a 2031 de la Ley del Seguro Social (transitorio Cuarto, decreto DOF 16-12-2020).
- Mostrar «hoy se piden X» y, si la persona sigue cotizando, en qué año aproximado lo alcanzaría y cuántas se pedirán entonces. Sin prometer fechas.
- **Listo cuando:** con reloj simulado en enero de 2027, 880 semanas ya no dice «Ya cumples»; hay pruebas para 2026 a 2031.

### T17. Jornada 2027 (antes del 15 de diciembre)
- Herramienta y guía con los datos de la sección 7 del documento 10. Transcribir la ley; no interpretar más allá del texto.
- **Listo cuando:** cada cifra visible tiene su artículo o transitorio, y hay pruebas para los cinco años.

### T0. Temporada de aguinaldo (ahora mismo)
- Del 16 de noviembre al 20 de diciembre es el momento del año en que más gente busca esto. La página de aguinaldo debe ser la mejor del sitio antes que cualquier otra tarea.
- Revisar que la portada ponga aguinaldo primero en estas semanas, y que T1, T2 y T4 se apliquen primero a aguinaldo.

## Cómo trabajar este plan (lecciones de esta sesión)

- **Subir la rama en cuanto haya un commit.** El contenedor se reinició una vez y se perdieron tres commits sin subir.
- **Un tema por PR**, pequeño. Los PR 163 a 168 se publicaron así sin incidentes.
- **Nunca encadenar «commit y push» sin comprobar que el build terminó bien.** Pasó una vez en esta sesión: se subió un commit con una prueba rota y hubo que corregirlo antes de abrir el PR.
- **Pruebas con número fijo:** agregar una guía o una página rompe unas cinco pruebas que cuentan elementos. Actualizarlas una por una, entendiendo qué cuentan; no relajarlas.
- **El resumen «En 30 segundos»** de cada guía admite tres ideas de entre 30 y 170 caracteres, y la primera sección de la guía debe quedar justo después de la fecha de revisión.
- **Chrome:** sin `CI=true` y `MILANA_CHROME`, 74 pruebas de navegador se omiten y parecen pasar.
- **Una segunda revisión ayuda.** Las observaciones de Orion y de otro asistente encontraron imprecisiones reales en la guía de fechas y en «¿Me pagaron bien?». Conviene mantener esa revisión cruzada en cada PR de contenido legal.
- **Nadie ha visto el sitio en vivo desde el entorno de trabajo.** Cada despliegue necesita que Ángel u Orion abran la página y confirmen.

## Lo que no se debe hacer

- No cambiar fórmulas al tocar validaciones o textos.
- No presentar los límites de T1 como límites legales.
- No borrar explicación técnica ni fuentes: se reordenan.
- No tocar aviso de privacidad, GA4/AdSense ni la indexación.
