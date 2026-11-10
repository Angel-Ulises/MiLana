# Fase 4 — Propuesta de poda conservadora (pendiente de decisión de Ángel)

> **Estado:** solo propuesta. **No se aplicó** ningún `noindex`, retiro del menú, redirección ni borrado. Lista exacta, URL por URL, en `04-poda-urls.csv` (158 URLs del sitemap del último build completo de la rama).

## Recomendación

| Grupo | URLs | Acción propuesta | Por qué |
|---|---:|---|---|
| MiLana Match (portada, metodología, 9 categorías, 45 fichas) | 56 | Quitar del índice | Datos con corte del 12 de octubre de 2026, sin actualización automática. Por categoría solo 0–24% de los datos están verificados y hasta 45% faltan. Es contenido de poco valor ante Google y AdSense mientras no se actualice. |
| `/finanzas/inversion/fondos` | 1 | Quitar del índice | Muestra CNBV con corte del 1 de octubre de 2026; la actualización está bloqueada (issue #147). |
| `/widgets` | 1 | Quitar del índice | Página técnica, no responde a la búsqueda de una persona. |
| Estados (32) | 32 | Sin cambio por ahora | Tienen datos reales y distintos por estado y, según Analytics, retienen mejor que el resto. El 72% del texto se repite entre estados; se recomienda reescribir la plantilla (decisión pendiente). |
| Profesiones (12) | 12 | Sin cambio por ahora | Tienen datos del Observatorio Laboral, pero son cortas y repiten el 65% del texto. Hay que decidir entre enriquecerlas o quitarlas del índice. |
| Resto (inicio, calculadoras, guías, finanzas, economía, confianza, Términos) | 56 | Sin cambio | Contenido propio. |

**Total con acción propuesta: 58 de 158 URLs.** Ninguna se borra y ninguna dirección deja de responder. No hacen falta redirecciones 301 porque nada se fusiona.

## Qué significa «quitar del índice» y cómo revertirlo

Cuando se apruebe, el cambio sería pequeño y reversible:

1. Una lista en un archivo de datos con las 58 URLs.
2. El build agregaría `<meta name="robots" content="noindex,follow">` a esas páginas y las sacaría de `sitemap.xml`. Las páginas siguen abiertas para quien tenga el enlace, y Google sigue sus enlaces.
3. Opcionalmente, sacar las 56 de Match del índice del buscador interno (`/buscar-indice.json`). Hoy Match no está en el menú principal; tiene enlaces desde `/finanzas`, `/aprende` y tres guías de crédito.
4. **Revertir:** vaciar la lista y volver a compilar. Las páginas recuperan su indexación en el siguiente rastreo de Google.

## Decisiones pendientes de Ángel

1. ¿Aprobar el `noindex` de las 58 URLs (o solo de una parte)?
2. ¿Quitar también los enlaces a Match desde `/finanzas`, `/aprende` y las guías, o dejarlos?
3. Estados: ¿reescribir la plantilla para que cada página abra con su dato propio?
4. Profesiones: ¿enriquecerlas o quitarlas del índice?
5. ¿Cuándo y con qué fuente se actualizaría Match para volver a indexarlo?
