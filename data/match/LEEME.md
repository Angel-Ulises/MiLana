# MiLana Match · datos fuente

`orion-v2/` contiene, sin modificar, los catálogos y la documentación de la entrega acumulativa v2 de Orion (12-10-2026; ZIP SHA-256 `0d06850301d9f2042eac585e343592427f6e96dfc13aa2e9776b0a1b89fdc146`). `tests/match-catalogo.test.mjs` verifica cada archivo contra `manifest-paquete-v2.json`.

El sitio no lee estos archivos directamente: `node scripts/match/normalizar-catalogo.mjs` los convierte en `src/data/match-catalogo.json` (fuente, fechas y estado por dato; N/D nunca se convierte en 0). Una prueba exige que el JSON publicado sea exactamente esa normalización, así que cualquier corrección de datos se hace en la fuente y se vuelve a normalizar.

Relaciones comerciales: todas en `null` al corte, porque ninguna afiliación está aprobada o activa (registro de afiliados en Notion). Para declarar una, se agrega `relacionComercial: { tipo, entidad, descripcion }` en el normalizador; la etiqueta aparece junto al nombre y antes del enlace, y no participa en el orden.

## Actualizaciones verificadas posteriores a la entrega de Orion

Los JSON de `orion-v2/` no se editan. Una corrección posterior se aplica en el normalizador, con fuente y fecha propias, y queda registrada en `actualizacion` de la ficha publicada.

- **`cetes_1_mes` (issue #103).** Sólo los campos cuya fuente es la tabla oficial `cetes.html` (`tasa_observada`, `plazo_tabla`, `precio_indicativo` y `otras_tasas_por_plazo`) toman el snapshot verificado de `src/data/cetes-reference.js`. Ese snapshot es la misma lectura que muestra `/finanzas/inversion/cetes`.
  - Fechas: el corte es la fecha del encabezado de la tabla, la consulta es la fecha de la lectura verificada y la fecha de subasta queda en `null`, porque la tabla no la publica.
  - Valor nominal, mínimo, comisiones, requisitos y riesgo vienen de otras páginas y conservan su consulta del 12-10-2026.
  - El reemplazo sólo ocurre si la tabla es posterior al corte de Orion, cubre los cinco plazos y tiene la misma URL de fuente. En otro caso, el build falla o deja el dato original.
  - Límite: no hay lectura propia de esta sesión. Es la lectura de GitHub Actions citada en `cetes-reference.js`.
