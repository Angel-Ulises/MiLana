# MiLana Match · datos fuente

`orion-v2/` contiene, sin modificar, los catálogos y la documentación de la entrega acumulativa v2 de Orion (12-10-2026; ZIP SHA-256 `0d06850301d9f2042eac585e343592427f6e96dfc13aa2e9776b0a1b89fdc146`). `tests/match-catalogo.test.mjs` verifica cada archivo contra `manifest-paquete-v2.json`.

El sitio no lee estos archivos directamente: `node scripts/match/normalizar-catalogo.mjs` los convierte en `src/data/match-catalogo.json` (fuente, fechas y estado por dato; N/D nunca se convierte en 0). Una prueba exige que el JSON publicado sea exactamente esa normalización, así que cualquier corrección de datos se hace en la fuente y se vuelve a normalizar.

Relaciones comerciales: todas en `null` al corte, porque ninguna afiliación está aprobada o activa (registro de afiliados en Notion). Para declarar una, se agrega `relacionComercial: { tipo, entidad, descripcion }` en el normalizador; la etiqueta aparece junto al nombre y antes del enlace, y no participa en el orden.
