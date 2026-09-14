# SEO de guías — 14 sep 2026

Alcance exclusivo: MiLana.

Este cambio añade una etapa de build que mejora las seis guías de `/aprende/` sin modificar cálculos ni la aplicación React:

- favicon en cada guía;
- `Article` + `BreadcrumbList` en JSON-LD;
- publisher MiLana con logo;
- título más descriptivo para la guía de Pensión IMSS Ley 97;
- proceso idempotente y verificable en cada build.

La auditoría previa mostró que todas las guías eran indexables y sin problemas críticos/altos/medios; el objetivo es eliminar faltantes estructurados reales, no inflar artificialmente el texto para alcanzar un umbral de palabras.
