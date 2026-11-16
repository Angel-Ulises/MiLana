# Análisis a fondo: puntos ciegos y dónde ser pionera (16-nov-2026)

> **Si solo lees una parte, lee las secciones 8 y 9:** problemas que ya existen y problemas previstos, cada uno con su solución.
>
> **Léelo primero.** Este documento manda sobre el orden de `08-ideas-pendientes.md` y `09-auditoria-y-plan.md`. Corrige cuatro cosas que esos documentos decían y que al medir resultaron distintas (sección 4).

## 1. Cómo se hizo y qué límites tiene

- **Medido** en Chrome real a 390 px sobre el build local de producción (commit `3e42ac6`, con el PR 168). No sobre el sitio en vivo: el dominio no se alcanza desde el entorno de trabajo.
- **Leyes leídas** en los PDF vigentes de diputados.gob.mx: Ley Federal del Trabajo (última reforma DOF 14-05-2026), Ley del Seguro Social (DOF 15-01-2026), Ley del ISR (DOF 01-04-2024) y Ley Federal de Protección de Datos Personales en Posesión de los Particulares (nueva ley DOF 20-03-2025, última reforma DOF 14-11-2025).
- **Competencia:** solo títulos y resúmenes de dos búsquedas web; no abrí los sitios. Lo que diga de ellos es indicio, no hecho.
- **Velocidad:** simulada (procesador 4 veces más lento, red de 1.6 Mbps con 150 ms de retraso), sin las letras externas porque aquí están bloqueadas. En vivo habrá diferencias.
- **Teclado del celular:** simulado con una ventana de 420 px de alto. En un teléfono real el navegador puede desplazar distinto.
- Nada de esto es revisión de un contador o abogado.

## 2. Lo que está bien (no romperlo)

| Aspecto | Resultado |
|---|---|
| Velocidad simulada en celular lento | Contenido principal visible entre 0.8 y 2.2 s en las 7 páginas probadas; casi sin saltos de diseño |
| Accesibilidad automática (13 páginas) | Ninguna falla grave ni de contraste; solo 4 tipos de avisos menores |
| Buscadores | 162 páginas sin títulos ni descripciones repetidos, un solo título principal por página, direcciones canónicas correctas, migas de pan en 148 |
| Liquidación | Ya ofrece zona fronteriza y los 20 días por año como opción |
| Privacidad | El aviso sí explica qué se guarda en el navegador |
| Calculadoras | Ninguna con desborde; todos los campos con etiqueta; 55 px de alto |

## 3. Hallazgos nuevos, por urgencia

### Con fecha límite: 1 de enero de 2027

**H-1. La calculadora de pensión quedará mal el 1 de enero.**
- El código tiene fijo el requisito de 2026: `SEMANAS_MINIMAS_2026 = 875` (`src/lib/calculos-directos.mjs`, línea 82).
- La Ley del Seguro Social (transitorio Cuarto del decreto DOF 16-12-2020) sube 25 semanas cada año hasta 1,000 en 2031. En 2027 serán 900.
- Desde el 1 de enero, a alguien con 880 semanas el sitio le dirá «Ya cumples» cuando no cumple.
- Además, hoy «Te faltan 75 semanas» engaña a quien sigue trabajando: mientras junta esas 75, el requisito sube. Con 800 semanas en noviembre de 2026 y cotizando sin parar, se alcanza el requisito hacia 2029, no en año y medio. A una persona joven le aplicarán 1,000, no 875.
- **Qué hacer:** calcular el requisito según el año (tabla 2021 a 2031 tomada de la ley), y decir las dos cosas: «hoy se piden X» y «si sigues cotizando, lo alcanzarías aproximadamente en el año Y, cuando se pidan Z». Probar con reloj simulado en 2027.

**H-2. La jornada baja a 46 horas el 1 de enero y el sitio no dice nada.**
Es el cambio laboral más grande en décadas y está en la ley vigente. Leído en el decreto publicado en el DOF el 1 de mayo de 2026:

| Año | Jornada semanal máxima | Horas extra por semana (art. 66) |
|---|---|---|
| 2026 | 48 | 9 |
| 2027 | 46 | 9 |
| 2028 | 44 | 10 |
| 2029 | 42 | 11 |
| 2030 | 40 | 12 |

- Las horas extra se pagan con 100% más; pueden repartirse en hasta cuatro horas diarias, en un máximo de cuatro días (art. 66).
- Pasado ese límite, hasta cuatro horas más a la semana, con 200% más (art. 68).
- Jornada ordinaria más extra: nunca más de doce horas al día (art. 68).
- Jornada diaria: ocho horas diurna, siete nocturna, siete y media mixta (art. 61).
- Trabajar en domingo: prima de 25% por lo menos (art. 71).
- La reducción no puede bajar sueldos ni prestaciones (transitorio Séptimo).
- El patrón debe registrar electrónicamente la jornada (art. 132, fracc. XXXIV); las reglas de la Secretaría del Trabajo entran en vigor el 1 de enero de 2027 (transitorio Quinto).
- Búsqueda en el sitio: cero menciones de jornada, 48 horas, 40 horas u horas extra fuera de dos frases de advertencia.
- **Qué hacer:** ver apuesta P-1 en la sección 5.

**H-3. Cambio de año en general.** Sigue vigente la tarea T11 del plan. La pensión (H-1) es el primer caso confirmado de cálculo que quedará mal; hay que buscar los demás con reloj simulado.

### Experiencia: lo que la gente vive hoy

**H-4. El resultado queda fuera de la vista mientras escribes, en las 10 calculadoras.**
Con el teclado abierto (unos 420 px útiles), el monto aparece debajo de lo visible:

| Calculadora | Píxeles que faltan para verlo |
|---|---|
| Vacaciones | 337 |
| Aguinaldo, Finiquito | 261 |
| Bruto a neto | 227 |
| ISR | 207 |
| Pensión | 191 |
| Liquidación | 169 |
| PTU | 154 |
| RESICO | 124 |
| Infonavit | 71 |

La persona escribe su sueldo y no ve que ya hay respuesta. Es el momento más importante del sitio y hoy falla en silencio.
- **Qué hacer:** una franja fija sobre el teclado con el resultado en una línea («Te llegan ≈ $5,634 · ver detalle»), o desplazar el resultado a la vista cuando el dato ya es válido. Probar en teléfono real.

**H-5. El buscador no entiende a la gente: 47 de 87 búsquedas comunes no dan nada.**
- Sin resultado aunque el contenido existe: «renuncia», «renunciar», «utilidades», «reparto de utilidades», «cuánto me descuentan», «jubilación», «crédito infonavit», «recibo de nómina», «fechas de pago», «cuándo pagan aguinaldo», «privacidad», «contacto», «cdmx», «enfermera», «salario mínimo».
- Sin resultado porque no hay contenido (demanda sin atender): «horas extra», «incapacidad», «maternidad», «embarazo», «días festivos», «prima de antigüedad», «honorarios», «declaración anual», «devolución», «buró», «negocio», «factura».
- Causas: el índice tiene 90 entradas y **ninguna guía de Aprende**; PTU e Infonavit no tienen palabras alternativas; no reconoce plurales ni conjugaciones («renuncia» no encuentra «renuncié»); «deuda» devuelve por error una página de inversiones.
- Las etiquetas del índice siguen con los nombres viejos («Bruto a Neto», «ISR», «RESICO», «PTU»); el cambio a nombres sencillos no llegó ahí.
- **Qué hacer:** incluir guías y páginas institucionales; palabras alternativas para todas las entradas; comparar por raíz de palabra; una lista fija de 100 búsquedas como prueba automática; para lo que no existe, responder «todavía no tenemos eso» con lo más cercano.

**H-6. Vacaciones deja sin respuesta a quien lleva menos de un año.**
- Con `0` años: «Años cumplidos: escribe una cantidad mayor que cero».
- Con `0.5`: no muestra ni resultado ni aviso.
- **Qué hacer:** decir que los primeros 12 días llegan al cumplir el año y que, si sale antes, se paga la parte proporcional, con enlace a Finiquito. Verificar el texto en los arts. 76 y 79.

**H-7. Los campos de dinero no entienden cómo escribe la gente.**

| Lo que escribe | Lo que pasa |
|---|---|
| `12 mil`, `12mil`, `12k`, `12000 pesos` | Error con jerga: «Captura un importe positivo con un máximo de dos decimales» |
| `12.000` | El mismo error (bien que no lo tome como 12 pesos, pero no ayuda) |
| `12,00` | Lo toma como 1,200 y da resultado, sin avisar |

- **Qué hacer:** aceptar «mil», «k» y la palabra «pesos»; ante `12.000` o `12,00`, preguntar «¿Quisiste decir $12,000?». Es una duda de formato, no una detección por monto.

**H-8. Todas las calculadoras piden el sueldo «antes de descuentos», y mucha gente solo sabe cuánto le depositan.**
- Es la barrera de entrada más grande para el trabajador promedio y nadie la menciona.
- **Qué hacer:** opción «Solo sé cuánto me llega» que estime el sueldo antes de descuentos con la misma fórmula al revés, marcada como aproximada y con sus supuestos visibles. Ver apuesta P-2.
- Relacionado: agregar «por día» a semana, quincena y mes; y permitir «mes y año» cuando no se recuerda el día exacto de ingreso.

**H-9. Precisión falsa.** «Te llegan aproximadamente $5,633.71» junta «aproximadamente» con centavos. Sugerencia: pesos cerrados en grande y los centavos en el detalle.

### Confianza y operación

**H-10. El repositorio es público, sin licencia, y enlaza a un sitio viejo.**
- Cualquiera puede leer el código, la estrategia, estos documentos y el historial.
- No tiene licencia: nadie puede reutilizarlo legalmente, así que tampoco aprovecha el ser abierto.
- En GitHub, la página del proyecto apunta a `mi-lana-pn2f.vercel.app`, y la descripción dice «Datos SAT 2026». No pude abrir esa dirección desde aquí. **Si sigue viva, es una copia vieja del sitio compitiendo con el dominio real y mostrando cálculos atrasados.**
- La rama `main` sigue atrasada respecto a producción.
- **Decisión de Ángel:** hacerlo privado, o convertir la apertura en ventaja (ver apuesta P-4). Lo que no conviene es el punto medio actual. Y revisar hoy mismo si el sitio de Vercel sigue publicado.

**H-11. Las alarmas suenan y nadie las apaga.**
- Hay 9 automatizaciones que vigilan datos y recuerdan revisiones (además de la de pruebas). Funcionan.
- Pero hay 33 asuntos abiertos (27 avisos y 6 PR): 10 recordatorios semanales de «revisión regulatoria» sin atender desde el 7 de septiembre, 9 candidatos de datos económicos sin procesar, el aviso de que ya hay datos nuevos de vivienda (#159), y 6 PR viejos sin cerrar (#96, #131, #133, #134, #135, #141).
- Una alarma que nadie atiende enseña a ignorar todas.
- **Qué hacer:** cerrar o resolver los 33; dejar solo las alarmas que alguien va a atender; que cada una diga qué hacer y en cuánto tiempo.

**H-12. Identidad.**
- El contacto es una cuenta de Gmail y el aviso de privacidad dice que la identidad del responsable está pendiente.
- La ley vigente (art. 15, fracción I) exige «la identidad y domicilio del responsable». La autoridad ya no es el INAI: es la Secretaría Anticorrupción y Buen Gobierno.
- Para un sitio que le dice a la gente cuánto le debe su patrón, esto pesa más que cualquier mejora de diseño.
- **Decisión de Ángel.** No se toca el aviso sin su instrucción.

**H-13. Faltan piezas básicas de un sitio «instalable» y de papel.**
- No hay ícono para la pantalla de inicio del teléfono ni archivo de aplicación: al guardar el sitio en el celular sale un ícono genérico.
- No hay estilos de impresión: imprimir un resultado saca menús y pie.

**H-14. Antigüedad de los datos (al 16-nov-2026).**

| Datos | Fecha más reciente | Días |
|---|---|---|
| Vivienda por estado | 10-ago | 98 |
| Mercado laboral por estado | 25-ago | 83 |
| Fondos (CNBV), ocupaciones por estado, finanzas, clases de inversión | 1-oct | 46 |
| Datos regulatorios | 4-oct | 43 |
| Economía (señal más nueva) | 5-nov | 11 |
| CETES | 11-nov | 5 |

**H-15. El peso del sitio está en lo más débil.**
De 159 páginas en el mapa del sitio, solo 25 (16%) son el núcleo de trabajo y sueldo (calculadoras, guías y situaciones). Match son 56 (35%) y Estados 34 (21%). Los buscadores juzgan la calidad del sitio completo; las secciones con datos viejos o sin verificar pueden arrastrar a las buenas. Refuerza la decisión pendiente sobre las 57 URLs, que sigue siendo de Ángel.

### Menores

- **Accesibilidad:** los títulos plegables usan un título con función de botón (lo introdujo el cambio de «página limpia»); lo correcto es un botón dentro del título. Hay dos cabeceras en las calculadoras y contenido fuera de regiones en Finanzas, Match y Carreras.
- **Buscadores:** 63 títulos de más de 62 caracteres (casi todos de Match, hasta 140); 11 páginas institucionales sin imagen para compartir.
- **Infonavit:** usa por defecto la tasa de 10.45% y el cambio queda escondido en «Más opciones». Verificar la tabla oficial de tasas antes de tocarlo.

## 4. Correcciones a lo que dije antes

| Dije | Al medir |
|---|---|
| El sitio es pesado y lento para celulares sencillos | **Lo propio no es lento** (ojo: la medición no incluyó los programas de Google, que solo cargan en el dominio real; ver R-42). Carga en 0.8 a 2.2 s simulando celular y red lentos. Sí hay 38 a 44 peticiones y unos 450 a 565 KB por página, pero no es prioridad. La tarea T7 baja al final |
| «Hoy no se guarda nada en el dispositivo» | **Falso.** El sitio ya guarda preferencias (estado elegido, ruta recordada, letra grande) y contexto de la visita, y el aviso de privacidad lo dice |
| Falta vigilancia automática | **Ya existe.** Lo que falta es atender lo que avisa (H-11) y vigilar el sitio en vivo y los cambios de ley |
| Marcar preguntas frecuentes para buscadores | **Ya está** en 10 páginas, y hoy Google casi no las muestra fuera de sitios oficiales o de salud. Poco valor; verificar antes de invertirle |

## 5. Dónde ser pionera

Hay más de 20 calculadoras de aguinaldo y de finiquito en los primeros resultados, varias hechas en serie. En uno de los resúmenes de búsqueda aparecen dos valores distintos de la UMA para 2026 ($113.14 y $117.31), señal de que hay sitios con datos atrasados. Ser «otra calculadora» no distingue a nadie. Estas apuestas sí.

**P-1. Ser los primeros y los más claros con la jornada de 2027.**
- Una herramienta: «¿Cuántas horas me toca trabajar y cuánto valen mis horas extra?», con el año elegible de 2026 a 2030.
- Una guía: «Lo que cambia el 1 de enero de 2027», con la tabla de H-2 y la frase clave: tu sueldo no puede bajar.
- Una versión para el patrón chico: qué debe cambiar y el registro electrónico de jornada.
- Todo sale del decreto ya leído. No interpretar más allá del texto: el valor de la hora y los casos especiales se presentan con sus supuestos a la vista.
- Fecha: publicado antes del 15 de diciembre.

**P-2. La primera pregunta en palabras del trabajador: «¿Cuánto te depositan?»**
Que todas las calculadoras acepten lo que la persona sí sabe. Es un cambio de fondo en cómo se entra al sitio.

**P-3. Cálculo que se puede comprobar.**
- Cada resultado dice con qué reglas se hizo y de qué fecha es la ley («Ley Federal del Trabajo, texto al 14-05-2026»).
- Los casos de prueba se publican: «con estos datos debe dar esto».
- Bitácora pública de correcciones.
- Antes de afirmar «la primera» o «la única», comprobarlo; mientras tanto, decir lo que sí es cierto: «puedes revisar cómo calculamos».

**P-4. Las reglas, abiertas y con licencia.**
Si el repositorio se queda público, que sea a propósito: licencia clara, las fórmulas y tablas como un paquete que otros puedan usar y citar, y los documentos internos fuera. «La ley laboral mexicana en código, con pruebas y fuente» no la he visto en los resultados; verificar antes de decirlo.

**P-5. El día que cambia un número, MiLana ya lo tiene.**
- Fechas que se repiten cada año: salario mínimo (se anuncia en diciembre), tablas del ISR (fin de diciembre), UMA (enero, aplica desde febrero), jornada (cada 1 de enero hasta 2030), semanas de pensión (cada 1 de enero hasta 2031).
- Dejar los datos del año en un solo archivo y un procedimiento escrito, para publicar en horas y con la fuente oficial enlazada.
- No publicar ningún valor que no esté en la fuente oficial.

**P-6. «¿Cómo me afecta?»**
Para cada cambio de ley, una página que lo traduzca a tu caso con tus números: antes y después. Empezar con la jornada.

**P-7. «¿Te tienen registrado con tu sueldo real?»**
- Mucha gente está dada de alta en el IMSS con menos de lo que gana y no lo sabe; eso baja su pensión, su crédito de vivienda y lo que cobra en una incapacidad.
- Una guía de cómo revisarlo y una calculadora de lo que se pierde.
- Las reglas están en la Ley del Seguro Social, que sí se alcanza. Conviene revisión profesional; mientras no se pueda, publicarla como explicación con supuestos visibles.

**P-8. Pensado para quien lee poco.**
- Ya existe «Escuchar». Extender: guías con audio, pasos grandes, y un modo para leerle a un familiar.
- Dictar el dato en voz alta es posible en algunos teléfonos, pero el audio viaja a los servidores del fabricante del navegador: requiere decisión de privacidad antes de considerarlo.

## 6. Orden de trabajo (sustituye a los anteriores)

**Hoy o mañana (fallas que ya existen; arreglos chicos, ver sección 8.1)**
- R-1: widgets vacíos.
- R-2: fecha de salida congelada.
- R-3 y R-4: proteger la rama de producción y fijar versiones (antes de que Opus abra muchos PR).
- R-39: que el ejemplo de sueldo neto coincida con la calculadora.

**Esta semana (temporada de aguinaldo)**
1. H-4 en aguinaldo: que el resultado se vea al escribir.
2. H-7 en aguinaldo: «12 mil», «12k», «12.000».
3. H-5: buscador (guías dentro, palabras alternativas, nombres nuevos).

**Antes del 15 de diciembre**
- R-14: finiquito y liquidación deben aceptar fechas de 2027.
- R-7: pruebas de viaje en el tiempo (procedimiento 8.4-A).
- P-9: vigía de leyes funcionando (sección 9.4), antes de que termine la temporada.
4. H-1: pensión con el requisito por año.
5. P-1: jornada 2027 (herramienta y guía).
6. T11: prueba con reloj simulado de las 10 calculadoras.
7. H-6: vacaciones en el primer año.

**Antes del 1 de enero**
8. P-5: datos del año en un solo archivo y procedimiento de «día del cambio».
9. H-4 y H-7 en las otras nueve calculadoras; T1 y T2 del plan (límites y un solo modo de avisar errores).

**Enero y febrero**
10. P-2: «¿Cuánto te depositan?».
11. P-3: cálculo comprobable.
12. T3, T4, T5 del plan.

**Antes del 11 de enero**
- R-13: decisión sobre Match. Ese día, 71% de sus datos estarán caducados o con revisión vencida y no quedará ninguno vigente.

**Decisiones solo de Ángel (ninguna depende de terceros)**
- Revisar si `mi-lana-pn2f.vercel.app` sigue publicado y apagarlo o redirigirlo.
- Repositorio: privado, o abierto a propósito con licencia.
- Cerrar o resolver los 33 asuntos y los 6 PR viejos.
- Responsable del aviso de privacidad.
- Correo con el dominio propio en lugar de Gmail.
- Las 57 URLs (con fecha: ver R-13).
- Proteger la rama de producción en GitHub (R-3).
- Verificación en dos pasos y códigos de recuperación en GitHub, Cloudflare, Google y el dominio (R-30).
- Si se crea `CLAUDE.md` con el texto de 8.4-E.

## 7. Datos de ley ya verificados (para no repetir la búsqueda)

| Tema | Fuente | Dato |
|---|---|---|
| Jornada gradual | LFT, decreto DOF 01-05-2026, transitorio Segundo | 48, 46, 44, 42, 40 de 2026 a 2030, desde el 1 de enero de cada año |
| Horas extra por semana | Mismo decreto, transitorio Cuarto | 9, 9, 10, 11, 12 |
| Pago de horas extra | LFT arts. 66 y 68 | 100% más; pasado el límite, hasta 4 horas con 200% más; nunca más de 12 horas diarias en total |
| Sueldo no baja | Mismo decreto, transitorio Séptimo | «En ningún caso» |
| Registro electrónico de jornada | LFT art. 132, fracc. XXXIV; transitorio Quinto | Reglas desde el 1 de enero de 2027 |
| Prima dominical | LFT art. 71 | 25% por lo menos |
| Aguinaldo | LFT art. 87 | 15 días por lo menos, antes del 20 de diciembre. Cualquier cambio a 30 días **no** está en la ley vigente |
| Semanas para pensión | LSS, transitorio Cuarto del decreto DOF 16-12-2020 | 750 en 2021, 25 más cada año, 1,000 en 2031 |
| Aviso de privacidad | LFPDPPP (DOF 20-03-2025), art. 15, fracc. I | Identidad y domicilio del responsable |
| Autoridad de datos personales | LFPDPPP, art. 2 | Secretaría Anticorrupción y Buen Gobierno |

Volver a leer la fuente antes de publicar: las leyes pueden haber cambiado después del 16 de noviembre de 2026.

## 8. Problemas que ya existen y problemas previstos, con su solución

Segunda pasada del 16-nov-2026. Aquí no se supuso: se adelantó el reloj a diciembre, enero, febrero, marzo y julio (en las pruebas, en el build y dentro del navegador), se revisó el proceso de publicación en GitHub y se proyectó la caducidad de los datos con la misma función que usa el sitio.

**Lo que salió bien al adelantar el reloj:** las 527 pruebas que no usan navegador pasan en todas las fechas, y el build completo termina bien en enero y marzo de 2027. Nada se rompe solo por el paso del tiempo. **El problema es el contrario: todo sigue en verde mientras varias calculadoras ya están mal** (R-7).

### 8.1 Ya existen hoy (comprobados)

| Código | Problema | Evidencia | Solución | Listo cuando |
|---|---|---|---|---|
| **R-1** | **Los widgets para insertar en otros sitios salen vacíos.** Con `?embed=1` solo se ve «MiLana · calculadora gratuita · Abrir completa»: ni campos ni resultado | Probado en aguinaldo, ISR y finiquito. La hoja de `public/embed-mode-2026.js` oculta todo hijo de `.calculator-main` que no sea `form`; desde el rediseño, el formulario vive dentro de `[data-calc-directo]`, que queda oculto. La página `/widgets` sigue ofreciendo esos códigos | En la regla `.calculator-main>*:not(form):not(.ml-embed-brand)` agregar `:not([data-calc-directo])`, y dentro del contenedor ocultar solo la explicación larga. Ajustar el alto sugerido del `iframe` | Prueba de navegador: con `?embed=1`, escribir un sueldo muestra el monto, en las 10. Hoy no existe esa prueba |
| **R-2** | **La fecha «último día de trabajo» queda congelada al día del último despliegue** en finiquito y liquidación | Con el reloj del navegador en 31-dic, el campo siguió en 16-nov (día del build) y calculó «320 días trabajados». El HTML prerenderizado trae la fecha del build y `restaurarCampos` (`src/lib/calcStartup.js`) la copia encima de la de hoy | Restaurar solo lo que la persona cambió: comparar `el.value` con `el.defaultValue` al capturar. O no prerenderizar el valor de las fechas | Prueba con reloj simulado: build de un día, visita de otro, y el campo muestra el día de la visita |
| **R-3** | **La rama de producción no está protegida.** Se puede fusionar con comprobaciones en rojo o empujar directo | API de GitHub: `protected: false`, sin comprobaciones obligatorias, en `claude/cloudflare-pages` y en `main` | En GitHub, proteger `claude/cloudflare-pages`: exigir PR y las comprobaciones «validar» y «Cloudflare Pages» en verde. Es configuración de Ángel, gratuita en repositorios públicos | Un PR con una prueba rota no se puede fusionar |
| **R-4** | **Las versiones de las dependencias no están fijas.** No existe `package-lock.json`; el flujo usa `npm install`; Node no está fijado (20 en la validación, 22 en local) | `git ls-files` no lista el archivo; `package.json` usa rangos (`vite ^5`, `react ^18.2`) y no tiene `engines` | Generar y subir `package-lock.json`, usar `npm ci` en la validación y en Cloudflare, y fijar Node con `.nvmrc` y `engines`. Actualizar dependencias a propósito, en un PR propio | Dos builds del mismo commit en días distintos instalan exactamente lo mismo |
| **R-5** | **Salen peticiones a terceros que el aviso de privacidad no menciona.** Letras desde Google Fonts en 161 páginas; fotos desde `images.pexels.com` en Carreras, Profesiones, Economía y Finanzas | Dominios externos en el HTML generado; el aviso solo nombra Google Analytics y AdSense | Alojar las letras y esas fotos en el propio sitio (las calculadoras ya lo hacen con sus fotos). Así el aviso queda cierto **sin tocarlo**, y además carga más rápido | El HTML generado no pide nada a `fonts.googleapis.com`, `fonts.gstatic.com` ni `images.pexels.com`; prueba que lo verifique |
| **R-6** | **En Match, 157 de 577 datos (27%) ya se muestran como «caducado» o «revisión vencida»** | Calculado con `estadoEfectivo` del propio sitio al 16-nov. Peor en hipotecas (38 de 58) y tarjetas (48 de 124) | Ver R-13: la decisión hay que tomarla antes del 11 de enero | — |
| **R-7** | **Las pruebas no ven el tiempo.** Pasan igual en 2027 aunque pensión, finiquito y liquidación ya estén mal | 527 de 527 en verde con el reloj en dic-2026, ene, feb y jul-2027 | Agregar pruebas «de viaje en el tiempo» (procedimiento en 8.4) que fijen qué debe pasar el 1-ene, el 1-feb y un año después | Las pruebas nuevas fallan hoy por R-2, R-14 y H-1, y pasan cuando se corrijan |
| **R-8** | **No hay instrucciones escritas para los asistentes ni plantilla de PR.** Las reglas viven en conversaciones | No existen `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md` ni plantilla; el `README` tiene tres líneas | Crear `CLAUDE.md` con el texto de 8.4 y una plantilla de PR con la lista «antes de fusionar» | Una sesión nueva encuentra las reglas sin que nadie se las repita |
| **R-9** | **`main` y producción se separaron en ambos sentidos:** `main` tiene 2 commits que producción no, y producción 60 que `main` no | `git rev-list --left-right --count` | Decidir una sola rama. Lo más simple: que Cloudflare siga en `claude/cloudflare-pages`, y `main` se iguale a ella o se archive con un aviso en el `README` | Una sola rama recibe trabajo |
| **R-10** | **«Datos actualizados al 9 de noviembre de 2026» está escrito fijo** en el detalle de las 10 calculadoras | Mismo texto con el reloj en febrero de 2027 | Separar dos fechas: «Reglas de: ley publicada el…» (no cambia hasta que cambie la ley) y «Revisado contra la fuente el…» (lo actualiza la revisión). Nunca una fecha que envejezca sola | En marzo no dice «noviembre» sin explicación |

Siguen vigentes, de la sección 3: resultado tapado por el teclado (H-4), buscador (H-5), vacaciones en el primer año (H-6), formatos de dinero (H-7), asuntos abiertos (H-11), ícono e impresión (H-13).

### 8.2 Previstos con fecha

| Fecha | Qué va a pasar | Código | Qué tener listo |
|---|---|---|---|
| **Ya, hasta el 20-dic** | Temporada de aguinaldo: el mayor tráfico del año cae sobre una sola página | R-11 | Aguinaldo impecable esta semana (H-4, H-7). No hacer cambios riesgosos en esa página del 10 al 20 de diciembre |
| **En cualquier momento** | Una reforma puede publicarse en plena temporada (circula que el aguinaldo subiría a 30 días; **no** está en la ley vigente) | R-12 | Vigilancia diaria de la fecha «Última reforma» de la LFT, LSS y LISR, y el procedimiento del «día del cambio» (8.4) |
| **8-dic-2026** | Vence la vigencia de Klar en Match; los datos caducados o con revisión vencida suben a 218 de 577 (38%) | R-13 | — |
| **1-ene-2027** | **Finiquito y liquidación no aceptan fechas de 2027.** Los campos traen `max="2026-12-31"` y `hoy2026()` recorta al 31-dic. A quien despidan el 5 de enero no le sirven | R-14 | Quitar el límite al año en curso; calcular aguinaldo y vacaciones proporcionales con el año de la fecha de salida; prueba con reloj en enero |
| **1-ene-2027** | **Pensión dirá «Ya cumples» con 880 semanas;** la ley pedirá 900 | H-1 | Tabla 2021 a 2031 |
| **1-ene-2027** | ISR y sueldo neto siguen con tablas de 2026 sin avisar. Enero es especial: la UMA nueva aplica desde febrero, y el código ya excluye enero de 2026 por eso | R-15 | Aviso visible mientras no haya valores oficiales; cada cifra con su año |
| **1-ene-2027** | Cambian salario mínimo, tablas del ISR y jornada (46 horas). Los títulos siguen diciendo «2026» en 21 páginas y casi 2,000 lugares del código | R-16 | Datos del año en un solo archivo; títulos generados a partir del año vigente; decidir de antemano qué dice el título en enero |
| **11-ene-2027** | **En Match, 410 de 577 datos (71%) estarán caducados o con revisión vencida, y no quedará ninguno vigente.** El resto serán «no disponible», «no aplica» o «en conflicto». Son 56 páginas, el 35% del sitio | R-13 | Decisión de Ángel antes de esa fecha: actualizar el catálogo, quitarlo del índice, o reducirlo a lo que se pueda mantener |
| **1-feb-2027** | Cambia la UMA: tope de aguinaldo exento, descuentos del IMSS, topes | R-17 | Segunda fecha en el procedimiento; prueba con reloj en febrero |
| **Abril de 2027** | Declaración anual: demanda alta y el sitio no tiene nada (búsquedas sin resultado: «declaración anual», «devolución») | R-18 | Guía sencilla en marzo, marcada como explicación |
| **Mayo de 2027** | Utilidades: la calculadora solo da el total que reparte la empresa, no la parte de la persona | R-19 | Estimación individual con supuestos visibles, o decir claro qué datos pedirle a la empresa |
| **1-ene de 2028 a 2031** | Baja la jornada cada año hasta 2030; suben las semanas de pensión hasta 2031 | R-20 | Tablas completas desde ahora; que el año se lea del reloj, no del código |

### 8.3 Previstos sin fecha

| Código | Qué puede pasar | Qué tan probable | Daño | Solución |
|---|---|---|---|---|
| R-21 | **Una corrección urgente tarda demasiado en salir.** Hoy cada cambio pasa por validación (unos 10 minutos), fusión y despliegue (unos 15 más) | Alta | Alto en temporada | Que Cloudflare solo compile y la validación sea la que corre las pruebas (posible una vez protegida la rama, R-3). El procedimiento de 8.4 incluye cómo volver atrás en un minuto |
| R-22 | **Se agotan los builds del mes o un build rebasa el tiempo máximo de Cloudflare.** Cada empuje a cualquier rama dispara uno (comprobado: los ocho empujes de estos documentos dispararon ocho builds de vista previa) | Media si Opus abre muchos PR | Alto: no se puede publicar | Verificar los límites del plan en el panel de Cloudflare. Juntar cambios por PR. Para documentos, empezar el mensaje del commit con `[CF-Pages-Skip]`: comprobado en el commit `761fba4`, que no disparó build. No usarlo en cambios que deban publicarse |
| R-23 | **Un cambio rompe algo visual y nadie lo ve,** porque el sitio en vivo no se alcanza desde el entorno de trabajo | Alta | Medio | La validación ya guarda capturas de recorridos durante 7 días: revisarlas antes de fusionar. Agregar comparación automática de capturas de las páginas clave. Regla: abrir la vista previa del PR en un teléfono antes de fusionar |
| R-24 | **Dos asistentes trabajan lo mismo o se pisan** (ya pasó una vez) | Alta con varios asistentes | Medio | Antes de empezar: revisar PR abiertos y ramas remotas. Un asunto en GitHub por tarea, asignado. Una rama por tarea. Este documento como única lista |
| R-25 | **Se pierde trabajo sin subir** (ya pasó: tres commits) | Media | Medio | Subir la rama tras el primer commit; nunca encadenar «commit y push» sin ver que el build terminó bien |
| R-26 | **Un PR viejo se fusiona por error y revierte trabajo nuevo.** Hay seis abiertos desde octubre | Baja | Alto | Cerrarlos ya (#96, #131, #133, #134, #135, #141), con una nota de por qué |
| R-27 | **Una dependencia nueva rompe el build o trae código malicioso** | Baja cada día, segura con el tiempo | Alto | R-4. Revisar actualizaciones una vez al mes; atender el asunto #79 |
| R-28 | **Alguien copia el sitio,** aprovechando que el repositorio es público | Media | Medio | Decidir: privado, o abierto a propósito con licencia (H-10). Sacar del repositorio los documentos de estrategia si se queda público |
| R-29 | **El sitio viejo en Vercel sigue vivo** con cálculos atrasados y compite con el dominio | No comprobado | Alto si es cierto | Ángel lo abre hoy. Si responde: apagarlo o redirigirlo, y corregir la dirección en la página del repositorio |
| R-30 | **Se pierde el acceso a una cuenta** (GitHub, Cloudflare, Google, dominio). Todo depende de una persona | Baja | Muy alto | Verificación en dos pasos y códigos de recuperación guardados en las cuatro; renovación automática del dominio; anotar en un lugar seguro qué cuenta controla qué |
| R-31 | **Alguien toma una decisión con un resultado equivocado** | Media | Alto para esa persona | Ya hay avisos y términos. Agregar: botón «¿Encontraste un error?», bitácora pública, y en finiquito y liquidación repetir junto al monto que es una estimación y que la Procuraduría asesora gratis. A los términos les falta decir qué ley aplica y de quién es el contenido |
| R-32 | **Google contesta la pregunta sin mandar la visita** (calculadoras propias o respuestas automáticas) | Alta y creciente | Alto para el tráfico | Apostar por lo que una respuesta automática no da: el cálculo con tus propios números, la herramienta que te acompaña después, lo imprimible. Que la gente busque «MiLana» por nombre. Medir cuánta visita llega directa o por WhatsApp |
| R-33 | **El sitio falla en teléfonos viejos.** Usa funciones recientes: `:has()` en 14 reglas de estilo, ventana de búsqueda nativa y funciones nuevas en 11 lugares del código sin transpilar | Baja, sin medición | Medio | Definir qué navegadores se soportan; atrapar errores en el código suelto para que una función faltante no apague el resto; probar una vez en un navegador de hace cuatro años |
| R-34 | **El sitio vuelve a saturarse** al implementar ideas | Alta | Medio | Regla «entra una, se revisa otra»; límite de pantallas por página medido en una prueba; cada tarea dice qué quita, no solo qué agrega |
| R-35 | **Un valor inventado llega a producción** porque un asistente «recordó» una cifra | Media | Muy alto | Regla dura: ninguna cifra sin la línea de la fuente citada en el PR. Prueba que compare las tablas del código contra un archivo de fuentes con fecha y enlace |
| R-36 | **Las alarmas dejan de mirarse** | Ya ocurre | Medio | H-11: poner en ceros y dejar solo las que alguien atienda |
| R-37 | **Las pruebas con números fijos frenan cada cambio** (agregar una guía rompe cinco) | Ya ocurre | Bajo, pero constante | Que los conteos se calculen de los datos (número de carpetas en `aprende`, rutas del mapa) en vez de estar escritos |
| R-38 | **Las secciones con datos viejos arrastran a las buenas** en buscadores | Media | Alto | H-15 y R-13: decidir sobre Match, Estados y Profesiones |

### 8.4 Procedimientos listos para usar

**A. Prueba «de viaje en el tiempo»**

Dos piezas, ya probadas hoy:

1. Pruebas de Node con el reloj adelantado. Un archivo de precarga sustituye `Date` cuando existe la variable `FAKE_NOW`:

   ```js
   // tests/helpers/fake-date.mjs
   if (process.env.FAKE_NOW) {
     const Real = Date;
     const offset = new Real(process.env.FAKE_NOW).getTime() - Real.now();
     class Fake extends Real {
       constructor(...a) { if (a.length === 0) super(Real.now() + offset); else super(...a); }
       static now() { return Real.now() + offset; }
     }
     globalThis.Date = Fake;
   }
   ```

   Uso: `FAKE_NOW=2027-01-02T12:00:00 NODE_OPTIONS="--import ./tests/helpers/fake-date.mjs" npm test`

2. Navegador con el reloj adelantado: `await page.clock.install({ time: new Date('2027-01-02T12:00:00') })` antes de abrir la página (Playwright 1.63 lo trae), y `await page.clock.runFor(1500)` para que avance.

Fechas mínimas que deben probarse siempre: hoy, 31 de diciembre, 2 de enero, 2 de febrero y un año después.

Qué debe afirmar cada prueba el 2 de enero de 2027:
- Finiquito y liquidación aceptan una salida del 2 de enero de 2027 y calculan con ese año.
- La fecha por defecto es el día de la visita, no el del build.
- Pensión con 880 semanas no dice «Ya cumples».
- ISR y sueldo neto muestran el aviso de «valores de 2026» mientras no existan los de 2027.

**B. El «día del cambio» (cuando sale un número oficial)**

1. Confirmar en la fuente primaria (DOF, CONASAMI, INEGI, SAT o el PDF de diputados.gob.mx) y guardar el enlace y la línea exacta.
2. Cambiar el valor en un solo archivo de datos del año.
3. Correr las pruebas, incluidas las de viaje en el tiempo.
4. Un PR solo con ese cambio; en la descripción, la cita de la fuente.
5. Fusionar, esperar el despliegue y abrir dos páginas en el teléfono.
6. Anotarlo en la bitácora pública con la fecha.

Si la fuente todavía no publica el valor: aviso visible «Calculado con valores de 2026; los de 2027 se actualizan cuando se publiquen». Nunca estimar el valor.

Fechas que se repiten cada año: salario mínimo (diciembre), tablas del ISR (fin de diciembre), jornada y semanas de pensión (1 de enero), UMA (enero; aplica el 1 de febrero).

**C. Volver atrás un despliegue**

- Lo más rápido: en el panel de Cloudflare Pages, abrir la lista de despliegues y restaurar el anterior. Tarda segundos y lo hace Ángel.
- Desde el repositorio: revertir el commit de fusión con un PR. Tarda lo que un despliegue normal.
- Después de cualquiera de los dos: abrir un asunto con qué falló y qué prueba faltaba.

**D. Antes de fusionar (plantilla de PR)**

- [ ] Un solo tema.
- [ ] Build completo en verde con navegador real (`CI=true MILANA_CHROME=<ruta>`), cero pruebas omitidas.
- [ ] Cada cifra o artículo nuevo, con la línea de la fuente citada.
- [ ] Probado a 390 px sin desbordes; el resultado se ve al escribir.
- [ ] Vista previa abierta en un teléfono, o capturas revisadas.
- [ ] Dice qué se quitó o simplificó, no solo qué se agregó.
- [ ] No toca aviso de privacidad, medición, anuncios ni indexación sin instrucción de Ángel.

**E. Texto propuesto para `CLAUDE.md`** (no está creado; lo decide Ángel)

```md
# MiLana: reglas para asistentes

- Producción es la rama `claude/cloudflare-pages` (Cloudflare Pages). No es `main`.
- Lee primero `docs/mejora-2026-11/10-analisis-a-fondo.md`: ahí está el orden de trabajo.
- Build y pruebas: `CI=true MILANA_CHROME=<ruta de Chrome> npm run build`. Sin esas variables,
  las pruebas de navegador se omiten y parecen pasar.
- Una rama y un PR por tarea. Sube la rama tras el primer commit.
- Antes de empezar, revisa PR abiertos y ramas remotas para no duplicar trabajo.
- Ninguna cifra, fecha o artículo de ley sin leerlo en la fuente oficial y citar la línea en el PR.
  Fuentes que se alcanzan: diputados.gob.mx, gob.mx, dof.gob.mx, inegi.org.mx, sat.gob.mx, imss.gob.mx.
- No presentes nada como validado por un contador o abogado.
- No publiques nombre ni domicilio personal; no inventes responsable del aviso de privacidad.
- No toques aviso de privacidad, medición, anuncios ni indexación sin instrucción de Ángel.
- No detectes salario mínimo por el monto.
- Diseño: celular primero, resultado antes que explicación, palabras de persona, sin saturar.
- El sitio en vivo no se alcanza desde el entorno de trabajo: di siempre que falta la revisión visual.
```

## 9. Tercera pasada: lo que faltaba por mirar

Zonas revisadas: enlaces a fuentes, cifras viejas, basura visible, anuncios, portada, medición y coherencia entre ejemplos y calculadoras.

### 9.1 Lo que salió limpio (no hay que hacer nada)

- **Ninguna cifra vieja** en las 163 páginas: no aparecen la UMA ni los salarios mínimos de 2024 o 2025, ni «750 semanas», ni «48 horas», ni «INAI».
- **Ningún carácter roto** ni página vacía.
- **Los ejemplos de aguinaldo, ISR, finiquito y sueldo neto se recalculan en las pruebas con el mismo motor** que las calculadoras.
- **Los eventos de medición no llevan importes ni texto escrito por la persona.**
- **No se muestran huecos de anuncios:** el componente de reserva no dibuja nada.
- **La portada ya está bien resuelta:** en la primera pantalla hay un título, una frase y seis situaciones («Voy a cobrar aguinaldo», con etiqueta de temporada; «Me despidieron»; «Renuncié…»). No conviene rehacerla.
- **Calculadoras verificadas contra la ley en esta pasada:** tabla de vacaciones (art. 76 LFT) de 1 a 60 años; cuotas del IMSS del trabajador (2.375% más 0.40% sobre el excedente de 3 UMA); tabla de RESICO (art. 113-E LISR); prima de antigüedad al renunciar solo desde 15 años; liquidación sin los 20 días por defecto.

### 9.2 Problemas nuevos

| Código | Problema | Evidencia | Solución |
|---|---|---|---|
| **R-39** | **El ejemplo y la calculadora de sueldo neto dan resultados distintos para el mismo sueldo.** Con $20,000, el ejemplo de la página dice $17,103.58 y la calculadora $17,076.21 | El ejemplo usa un salario de cotización de $666.67 («bases iguales»); la calculadora usa el salario integrado mínimo ($699.54). IMSS: $512.77 contra $540.14. Los dos son defendibles, pero juntos se contradicen | Que el ejemplo use el mismo supuesto que la calculadora, o que diga en una línea por qué difiere. Prueba: el ejemplo de cada página coincide con lo que da la calculadora con esos datos |
| **R-40** | **Un enlace a fuente oficial está roto y nadie vigila los enlaces externos.** La página del IPAB sobre la garantía de depósitos responde «no encontrada» | Probado dos veces; aparece en 4 fichas de Match (por ejemplo `/finanzas/match/cuentas/banamex-switch`). El sitio enlaza 137 direcciones externas de 50 dominios y el build solo verifica enlaces internos. Desde el entorno de trabajo solo se alcanzan 15 | Corregir el enlace por la vía de «actualizaciones verificadas» (los archivos de `orion-v2` no se editan). Agregar una revisión semanal de enlaces externos en GitHub, donde sí hay salida a internet, que abra **un solo** aviso con la lista |
| **R-41** | **El programa de anuncios de Google se carga en 141 páginas y el sitio no tiene ningún espacio de anuncio.** | `index.html` lo inserta al cargar; `AdReserve` devuelve nada. Solo tiene sentido si la cuenta de AdSense tiene activados los anuncios automáticos | **Decisión de Ángel** (no se tocan anuncios sin su instrucción). Si los automáticos no están activos: quitar el programa hasta que haya anuncios, porque pesa y pone cookies sin dar ingreso. Si lo están: cargarlo después de la primera interacción |
| **R-42** | **Mi medición de velocidad no incluyó los programas de Google.** Solo se cargan en el dominio real (`if (!prod) return`), así que en la prueba local no estaban | Código de `index.html` y `milana-analytics.js` | Medir en vivo con PageSpeed Insights sobre `milanaaqui.mx` (lo corre Ángel u Orion; es gratuito) en la portada, aguinaldo y una guía. Hasta entonces, «el sitio es rápido» vale solo para lo propio |
| **R-43** | **La medición usa tres mecanismos y dos idiomas.** 15 eventos en inglés (`calculator_view`, `calculator_start`…), 4 en español (`compartir_whatsapp`…), 3 directos, y un evento distinto por calculadora (`calcular_aguinaldo`, `calcular_isr`…). `calculator_submit` parece muerto: las calculadoras ya no tienen botón | Inventario del código | Un diccionario de eventos en el repositorio (nombre, cuándo ocurre, parámetros, qué pregunta responde); quitar los muertos; un solo evento `calcular` con el parámetro `calculadora`. Hacerlo **antes** de registrar dimensiones en GA4, para no registrar nombres que van a cambiar |
| **R-44** | **RESICO acepta ingresos que el régimen no admite** | Art. 113-E de la Ley del ISR: tope de $3,500,000 al año; si se rebasa en cualquier momento, deja de aplicar desde el mes siguiente | Cuando el ingreso del mes multiplicado por 12 rebase ese tope, avisar que a ese ritmo dejaría de aplicarle, sin afirmarlo como hecho. Sustituye al límite genérico de T1 en esta calculadora |
| **R-45** | **Solo 4 de 10 calculadoras tienen ejemplo trabajado** | `public/casos-calculadoras.json`: finiquito, aguinaldo, ISR y sueldo neto | Agregar los seis que faltan con el mismo mecanismo (se recalculan en pruebas). Une con T5 |
| **R-46** | Se ve la palabra «null» en una ficha | `/finanzas/match/tarjetas/nu-tarjeta-credito`: «Fechas normalizadas null» | No mostrar el campo cuando no hay dato. Prueba general: ninguna página muestra «null», «undefined» ni «NaN» |

### 9.3 Qué medir, antes de configurar nada

Seis preguntas que la medición debe poder contestar. Si un evento no ayuda a ninguna, sobra.

1. ¿Qué calculadora se abre más y cuál se abandona antes de dar resultado?
2. De quienes ven un resultado, ¿cuántos abren «Ver cómo se calculó», «¿Y si no me lo pagan?» o «¿Me pagaron bien?»?
3. ¿Cuántos siguen al paso siguiente y a cuál?
4. ¿Cuántos comparten o escuchan el resultado?
5. ¿Qué buscan en el buscador interno que no encuentran? (Solo contar «sin resultado»; nunca enviar el texto.)
6. ¿Por dónde llegan: buscador, directo o un enlace compartido?

### 9.4 Novena apuesta: el vigía de leyes (probado)

**P-9. Que el sitio se entere solo cuando cambia un artículo que cita.**

Hoy la «revisión regulatoria» es un recordatorio semanal que nadie atiende (10 acumulados). Lo sustituye una revisión automática que dice exactamente qué cambió:

- Descarga los PDF vigentes de la LFT, la LSS y la LISR desde diputados.gob.mx.
- Extrae el texto y calcula una huella de cada artículo que MiLana usa, ignorando encabezados de página y la fecha de «Última reforma».
- Compara contra la base guardada. Si un artículo cambió, o cambió la fecha de última reforma, termina con error para que la automatización abra un aviso con la lista.

Probado hoy: localiza 55 de 55 artículos (38 de la LFT, 9 de la LSS, 8 de la LISR); dos corridas seguidas dan el mismo resultado; un cambio simulado en el artículo 87 se detecta. Así se habría sabido el 1 de mayo que cambiaron los artículos 59, 61, 66, 68, 69 y 71.

Archivos en `docs/mejora-2026-11/herramientas/`:

| Archivo | Para qué |
|---|---|
| `vigia-leyes.mjs` | El vigía. Uso: `node vigia-leyes.mjs <carpeta>`; con `--guardar` fija la base |
| `huellas-2026-11-16.json` | Base de hoy. Copiarla como `huellas.json` en la carpeta de trabajo |
| `fake-date.mjs` | Precarga para adelantar el reloj en las pruebas de Node |
| `reloj-calculadoras.cjs` | Recorre las 10 calculadoras con el reloj del navegador en cuatro fechas |

Para dejarlo funcionando:
1. Mover `vigia-leyes.mjs` a `scripts/` y la base a `data/`.
2. Una automatización diaria en GitHub que instale `poppler-utils`, lo corra y, si termina con error, abra un aviso. Sustituye a `regulatory-reminder.yml`.
3. Anotar en cada calculadora y guía qué artículos usa, para que el aviso diga también qué páginas revisar.
4. Los transitorios (donde viven el calendario de la jornada y las semanas de pensión) no tienen huella propia: el cambio de fecha de «Última reforma» es la señal para leer el decreto nuevo, al final del PDF.

Límite: vigila leyes, no cifras anuales. Salario mínimo, UMA y tablas del ISR salen en otras publicaciones y siguen el procedimiento del «día del cambio».

### 9.5 Decisiones de Ángel que se agregan

- ¿Están activados los anuncios automáticos en AdSense? De eso depende R-41.
- Correr PageSpeed Insights en vivo y guardar el resultado (R-42).
- Si usa Search Console: guardar cada mes las búsquedas con más impresiones. Es la mejor fuente propia para decidir qué construir.
- Decir el dominio en voz alta a alguien y ver si lo escribe bien. La marca es «MiLana» y el dominio es `milanaaqui.mx`; si la gente no lo recuerda, se pierde el boca a boca. No implica comprar nada: solo saberlo.
