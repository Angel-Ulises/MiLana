# Fase 0 — Auditoría de MiLana (9 nov 2026)

Base auditada: rama de producción `claude/cloudflare-pages` en `382154d`, construida localmente y servida con el emulador de Cloudflare Pages.
Mediciones de celular: emulación Moto G4 (360×640), CPU 4× más lenta, red 4G lenta (150 ms de latencia, 1.6 Mbps).
Son pruebas locales, no del sitio en vivo: en la red real los tiempos serán iguales o peores.

## Mapa del sitio (157 URLs en el sitemap)

| Familia | URLs | Cómo se generan |
|---|---:|---|
| Inicio, hubs y páginas fijas (calculadoras, finanzas, invertir, sobre, contacto, método, privacidad, widgets, financiamiento) | 14 | Contenido propio |
| Calculadoras | 10 (+ hub) | Contenido propio por calculadora (`contenido-calculadoras.json`); el formulario solo existe tras cargar JavaScript |
| Situaciones | 3 | Contenido propio |
| Aprende (guías) | 10 | Contenido propio |
| Economía | 5 | Contenido propio con datos de referencia |
| Finanzas (herramientas) + inversión | 12 | Contenido propio; herramientas solo con JavaScript |
| Estados | 34 (32 estados + hub + comparador) | **En serie** desde `estados.json` con la misma plantilla |
| Carreras | 19 (7 páginas + 12 profesiones) | **En serie** desde `carreras.json` / `profesiones.json` |
| MiLana Match | 55 (hub + 9 categorías + 45 fichas) | **En serie** desde `match-catalogo.json`; muchas fichas con datos «no disponibles» |

Más de la mitad de las URLs (108 de 157) salen de plantillas en serie. Las calculadoras, que son lo que la gente busca, son solo 10.

## Rendimiento en celular (tiempo hasta que la calculadora se puede usar)

| Página | Primer contenido | Primer campo usable | ¿Campo visible sin scroll? | KB transferidos |
|---|---:|---:|---|---:|
| Inicio | 1.1 s | 1.2 s (rutas) | Sí, a 408 px | 496 |
| Aguinaldo | 1.0 s | **2.6 s** | **No** (677 px; pantalla 640) | 587 |
| ISR | 1.0 s | 2.6 s | No (688 px) | 561 |
| Finiquito | 1.0 s | 2.6 s | Apenas (522 px) | 567 |
| Liquidación | 1.0 s | 2.6 s | Apenas (549 px) | 599 |
| RESICO | 1.0 s | 2.6 s | No (715 px) | 545 |
| PTU | 1.0 s | 2.6 s | No (745 px) | 584 |
| Bruto a neto | 1.0 s | 2.6 s | Apenas (522 px) | 648 |
| Vacaciones | 1.0 s | 2.6 s | No (670 px) | 730 |
| Infonavit | 1.0 s | 2.6 s | No (670 px) | 542 |
| Pensión IMSS | 0.9 s | 2.1 s | No (1,104 px) | 455 |

En todas las calculadoras la persona ve primero texto y tarda unos 2.6 s en tener un campo. En 7 de las 10, además, el campo queda fuera de la primera pantalla.

## Qué recibe Google en el HTML inicial

- **Calculadoras:** el HTML trae el título, el ejemplo resuelto, las explicaciones y las preguntas frecuentes, pero **no el formulario**: lo dibuja JavaScript. Google ve una página de texto, no una herramienta.
- **Antes del contenido de cada página** hay unos 110 enlaces del buscador del encabezado («Sugerencias para empezar»: 32 estados, 13 carreras, 10 comparadores Match, etc.). Las calculadoras tienen entre 139 y 143 enlaces en total y el inicio 162.
- Los datos estructurados de las calculadoras están completos (FAQPage, BreadcrumbList, WebApplication). Las páginas de estados solo tienen WebPage + migas.
- Títulos en lenguaje de catálogo («Calculadora de aguinaldo 2026 | México | MiLana»), no como pregunta de persona.

## Los 10 problemas más graves

1. **El formulario no aparece en la primera pantalla del celular** en 7 de 10 calculadoras: arriba hay migas, icono, etiqueta, título, propósito y un bloque «Paso a paso».
2. **Asistente de «una pregunta a la vez»**: aguinaldo pide 5 pasos y la primera pregunta es el «régimen / tipo de plaza» (LFT, LFTSE, SEP…), con lenguaje de abogado. Explica el 100 % de rebote.
3. **El aguinaldo no dice cuánto llega al bolsillo**: solo da el bruto y la nota «no incluye ISR». ISR tampoco da un neto claro para el sueldo.
4. **El formulario depende de JavaScript**: tarda 2.6 s en celular y Google no lo ve.
5. **Más advertencias que respuestas**: cada resultado lleva notas sobre regímenes, supuestos y límites antes de dar el siguiente paso.
6. **Unos 110 enlaces del buscador en el HTML antes del contenido** de cada página: diluyen el enlazado interno y son ruido para lectores de pantalla.
7. **Inicio con foto de stock y 7 secciones en el menú** (más buscador y «Mi situación»): la persona tiene que elegir antes de llegar a su calculadora. En celular solo se ven 3 situaciones y ninguna es de temporada (aguinaldo).
8. **108 de 157 URLs son páginas en serie** (estados, carreras, Match). Las fichas Match muestran muchos datos «no disponibles». Es una causa típica de rechazo de AdSense («contenido de poco valor»).
9. **Faltan los Términos de uso**. La Política de privacidad es un bloque mínimo dibujado con JavaScript que remite a «nuestras redes sociales» como contacto.
10. **Sin medición de uso real**: no hay un evento cuando alguien obtiene un resultado, así que no se sabe si alguien llega a calcular.

## Verificación de valores oficiales (hecha en esta fase)

| Valor | Fuente leída | Resultado |
|---|---|---|
| UMA 2026: $117.31 diaria, $3,566.22 mensual | INEGI, inegi.org.mx/temas/uma | Coincide con el código |
| Tarifa mensual de ISR 2026 (11 tramos) | Anexo 8 RMF 2026, apartado V, SIDOF nota 5777219 (DOF 28/12/2025) | Coincide renglón por renglón |
| Subsidio al empleo: 15.02 % de la UMA mensual, tope $11,492.66 (enero 15.59 %) | Decreto, SIDOF nota 5777649 (DOF 31/12/2025) | Coincide |
| Aguinaldo: mínimo 15 días, pagar antes del 20 de diciembre, proporcional si no completas el año | LFT art. 87, Cámara de Diputados | Coincide |
| Exención del aguinaldo: 30 días de salario mínimo, leídos como 30 UMA = $3,519.30 | LISR art. 93 **fracción XIV** (última reforma DOF 01-04-2024) + CPEUM, transitorio Tercero de la reforma DOF 27-01-2016 (desindexación) | Coincide. El registro interno decía «fracción XIII»; en el texto vigente es la **XIV** |
| Salario mínimo 2026: $315.04 general, $440.87 frontera norte | CONASAMI (gob.mx) | Coincide |

## Revisión de actualizaciones (10 nov 2026)

| Norma | Versión vigente | ¿Afecta a las calculadoras? |
|---|---|---|
| Ley Federal del Trabajo | Última reforma DOF 14-05-2026 | No. Las reformas de 2026 son jornada (DOF 01-05-2026, 48 h en 2026 bajando a 40 h en 2030; horas extra de 9 a 12), certificación agroexportadora y artistas. Los artículos 50, 76, 80, 84, 87, 89 y 162 no cambiaron. |
| Ley del ISR | Última reforma DOF 01-04-2024 | No. |
| Reglamento de la Ley del ISR | Última reforma DOF 06-05-2016 | No. El art. 174 (método opcional para el aguinaldo) está documentado en la hoja del contador. |
| Ley del Seguro Social | Última reforma DOF 15-01-2026 | No; las cuotas obreras usadas siguen iguales. |
| Ley Federal de Protección de Datos Personales en Posesión de los Particulares | Última reforma DOF 14-11-2025 | Sí, para el aviso de privacidad: art. 15 (contenido mínimo). La autoridad ahora es la Secretaría Anticorrupción y Buen Gobierno. |
| NIF (CINIF) | Mejoras a las NIF 2026 | No. Son normas contables de las empresas (la NIF D-3 cubre cómo registran PTU y prima de antigüedad); no regulan lo que recibe o se retiene a la persona trabajadora. |
