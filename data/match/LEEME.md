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
  - Procedencia del corte vigente: tabla «CETES 11 Noviembre 2026», leída el 11-11-2026 por Orion en navegador y corroborada con lector web. Es una lectura delegada: la sesión que preparó el cambio no abrió la URL. Evidencia en `data/cetes/lecturas/2026-11-11.json`.
- **Lectura delegada del 10-11-2026 (12 fichas, autorizada por Ángel).** La evidencia está en `actualizaciones/2026-11-10-lectura-delegada.json`: URL, fecha, procedencia y extractos literales aportados por el equipo. Esta sesión no reabrió las URLs. El ajuste vive en `scripts/match/actualizaciones-verificadas.mjs`.
  - **10 Afores SB 90–94:** el IRN pasa al corte de septiembre de 2026 (CONSAR SISET, serie 212, cifras preliminares). Antes de aplicarlo se comprueba que la columna de agosto de la lectura coincida con el valor de Orion; si alguna no coincide, esa ficha no se actualiza y queda una alerta. Las comisiones conservan el corte de agosto y la consulta del 12-10-2026. `consar.corte` es el corte del IRN y `consar.corteComisiones` el de las comisiones.
  - **Klar Depósito a Plazo Light, 30 días:** tasa 6.20 %, GAT nominal 6.42 % y GAT real 2.25 %, iguales a la tabla anterior. Cambia la vigencia, calculada del 05-11-2026 al 07-12-2026 (un intervalo, no una fecha de cálculo). Sin mezclar Plus, Platino ni Max.
  - **Win Banregio:** CAT promedio 40.3 % sin IVA, tasa variable, cálculo del 31-08-2026 y oferta vigente al 28-02-2027 (fuente nueva: recompensas.banregio.com). La tasa promedio ponderada es 34.1 %; las fórmulas mínima y máxima siguen siendo las del folleto del 12-10-2026, con fuente y fecha separadas. La anualidad de $0 y las recompensas de 1 % y 2 % solo suman la fuente nueva. Comisiones y requisitos no cambian.
  - Los valores anteriores quedan en el historial de cada ficha («no usar como vigente»). El corte general del catálogo sigue siendo 12-10-2026.
