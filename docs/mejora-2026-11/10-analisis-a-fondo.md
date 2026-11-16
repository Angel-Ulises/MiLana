# Análisis a fondo: puntos ciegos y dónde ser pionera (16-nov-2026)

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
| El sitio es pesado y lento para celulares sencillos | **No es lento.** Carga en 0.8 a 2.2 s simulando celular y red lentos. Sí hay 38 a 44 peticiones y unos 450 a 565 KB por página, pero no es prioridad. La tarea T7 baja al final |
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

**Esta semana (temporada de aguinaldo)**
1. H-4 en aguinaldo: que el resultado se vea al escribir.
2. H-7 en aguinaldo: «12 mil», «12k», «12.000».
3. H-5: buscador (guías dentro, palabras alternativas, nombres nuevos).

**Antes del 15 de diciembre**
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

**Decisiones solo de Ángel (ninguna depende de terceros)**
- Revisar si `mi-lana-pn2f.vercel.app` sigue publicado y apagarlo o redirigirlo.
- Repositorio: privado, o abierto a propósito con licencia.
- Cerrar o resolver los 33 asuntos y los 6 PR viejos.
- Responsable del aviso de privacidad.
- Correo con el dominio propio en lugar de Gmail.
- Las 57 URLs.

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
