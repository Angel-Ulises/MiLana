# SEO de guías — 14 sep 2026

Alcance exclusivo: MiLana.

Este cambio añade una etapa de build que mejora las seis guías de `/aprende/` sin modificar cálculos ni la aplicación React:

- favicon en cada guía;
- `WebPage` + `BreadcrumbList` en JSON-LD;
- publisher MiLana con logo;
- título más descriptivo para la guía de Pensión IMSS Ley 97;
- proceso idempotente y verificable en cada build.

La primera implementación usó `Article`, pero la auditoría posterior exigió `image` y `datePublished`. Como las páginas muestran fecha de revisión pero no una fecha original de publicación verificable, se cambió a `WebPage` para describirlas con precisión y evitar inventar metadatos. Los avisos de contenido corto se conservan como señal editorial, sin rellenar texto artificialmente para superar un umbral del auditor.
