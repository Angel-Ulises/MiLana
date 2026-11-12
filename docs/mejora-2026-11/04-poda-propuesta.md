# Fase 4 — Propuesta de poda conservadora (pendiente de decisión de Ángel)

> **Estado:** solo propuesta. **No se aplicó** ningún `noindex`, retiro del menú, redirección ni borrado. Lista exacta, URL por URL, en `04-poda-urls.csv` (158 URLs del sitemap del último build completo de la rama). Diagnóstico corregido el 10 de noviembre de 2026.

## Corrección del diagnóstico anterior

- **Cómo se cuenta ahora:** el porcentaje de datos verificados se cuenta **por campo** en cada categoría. Antes era un promedio de porcentajes por ficha, que distorsionaba el resultado: decía que tarjetas tenía como máximo 24%, cuando tiene **49 de 124 campos verificados (40%)**.
- **«Observado sin vigencia explícita» no es un dato falso.** Es un dato tomado de la fuente oficial cuya vigencia la fuente no publica.
- **Un «ND» no siempre es un defecto.** Puede ser legítimo, por ejemplo cuando la condición depende de una oferta personalizada que el emisor no publica.
- **`/widgets` sale de la propuesta.** Ofrece calculadoras reales para insertar en otros sitios.
- **Fecha de CNBV precisada:** el periodo de los datos es el 31/07/2026 y la revisión fue el 01/10/2026.

## Estado de los datos de MiLana Match (catálogo con corte 12/10/2026, conteo por campo)

| Categoría | Fichas | Verificados | Observados sin vigencia explícita | ND | En conflicto | Caducados |
|---|---:|---|---:|---:|---:|---:|
| hipotecas | 3 | 4/58 (7%) | 50 | 2 | 2 | 0 |
| automotriz | 3 | 3/38 (8%) | 29 | 6 | 0 | 0 |
| tarjetas | 8 | 49/124 (40%) | 41 | 31 | 3 | 0 |
| créditos personales | 6 | 3/69 (4%) | 51 | 9 | 0 | 6 |
| cuentas | 3 | 0/32 (0%) | 23 | 4 | 1 | 0 |
| ahorro | 3 | 6/35 (17%) | 17 | 5 | 0 | 0 |
| inversiones | 3 | 6/32 (19%) | 14 | 3 | 0 | 0 |
| seguros | 6 | 0/79 (0%) | 49 | 23 | 1 | 0 |
| afores | 10 | 20/110 (18%) | 40 | 10 | 0 | 0 |

El 10/11/2026 se actualizaron 12 fichas con lectura delegada: 10 Afores SB 90–94 (IRN de septiembre de 2026), Klar Light 30 días y Win Banregio. El conteo de la tabla no cambia, porque los estados de esos campos se conservan. El resto del catálogo sigue con el corte del 12/10/2026.

## Recomendación

| Grupo | URLs | Propuesta | Por qué |
|---|---:|---|---|
| MiLana Match (portada, metodología, 9 categorías, 45 fichas) | 56 | Candidatas a quitar del índice; **decisión por categoría** | La mayoría de los campos son observados sin vigencia explícita y el catálogo no se actualiza solo. La calidad varía mucho: tarjetas tiene 40% verificado; cuentas y seguros, 0%. Una opción intermedia es mantener indexadas las categorías con más verificación (tarjetas y, después de actualizarlas, afores) y quitar del índice el resto. |
| `/finanzas/inversion/fondos` | 1 | Candidata a quitar del índice | Periodo de los datos 31/07/2026, revisión 01/10/2026; la actualización está bloqueada (issue #147). |
| `/widgets` | 1 | Sin cambio | Ofrece herramientas reales. |
| Estados (32) | 32 | Sin cambio por ahora | Datos reales y distintos; el 72% del texto se repite. Se recomienda reescribir la plantilla (decisión pendiente). |
| Profesiones (12) | 12 | Sin cambio por ahora | Datos del Observatorio Laboral, pero páginas cortas que repiten el 65% del texto (decisión pendiente). |
| Resto | 56 | Sin cambio | Contenido propio. |

**Candidatas: 57 de 158 URLs.** Ninguna se borra ni se redirige.

## Cómo se aplicaría y cómo revertirlo (cuando se apruebe)

1. Una lista en un archivo de datos con las URLs aprobadas.
2. El build agregaría `<meta name="robots" content="noindex,follow">` a esas páginas y las sacaría de `sitemap.xml`. Las páginas siguen abiertas para quien tenga el enlace.
3. Opcionalmente, sacarlas del índice del buscador interno (`/buscar-indice.json`).
4. **Revertir:** vaciar la lista y volver a compilar.

## Decisiones pendientes de Ángel

1. Match: quitar del índice todas las categorías, solo algunas (¿cuáles?) o ninguna.
2. ¿Quitar también los enlaces a Match desde `/finanzas`, `/aprende` y las guías de crédito?
3. `/finanzas/inversion/fondos`: quitarla del índice o esperar a que se resuelva #147.
4. Estados: reescribir la plantilla.
5. Profesiones: enriquecerlas o quitarlas del índice.
