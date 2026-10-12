# MiLana Match: revisión acumulativa 2.0

Corte de investigación: 12 de octubre de 2026. Entrega documental para revisión e integración posterior por Claude. No desplegada en producción. No incluye código de sitio web, formularios de captación ni solicitudes financieras.

## Resultado y conteo correcto

45 fichas únicas: 30 de la primera entrega y 15 incorporaciones. Nueve categorías editoriales: 8 tarjetas, 6 créditos personales, 3 hipotecas, 3 créditos automotrices, 3 cuentas, 3 productos de ahorro, 3 inversiones, 6 seguros y 10 Afores. La cobertura es una muestra documental, salvo el universo Afore especificado; no es un censo del mercado.

El índice único es indice-catalogo-acumulativo.json. Apunta a tres catálogos fuente: crédito base de 14 fichas, ampliación de crédito de 6 y ahorro/inversión acumulativo de 25. Los catálogos de adiciones, universos por categoría y pares son vistas del mismo universo, no productos extra. Los IDs se deduplicaron globalmente.

130 registros de fuentes distribuidos por módulos, con 129 URL exactas distintas. El registro conserva accesos no concluyentes y sus límites; este conteo no equivale a 129 documentos íntegramente leídos ni a 129 ofertas vigentes. Los ID de fuentes conservan su ámbito de módulo para evitar colisiones.

## Qué se puede comparar y qué queda retenido

- Crédito: 20 fichas, de las que 16 documentan CAT con vigencia al corte. Esto no acredita equivalencia de escenarios, contratación ni aprobación. Banamex personal tiene CAT ND. Nu conserva un conflicto de fechas; Digitt y YoTePresto se mantienen fuera del conjunto de vigencia inequívocamente confirmada. Entre las seis nuevas, Klar, Stori y Ualá tienen CAT con vigencia al corte. Stori mantiene visible el conflicto de etiqueta y CAT. No hay ranking universal.
- Afores: 10 de 10 administradoras de la tabla CONSAR para SB 90–94, corte mensual agosto de 2026. El IRN permite comparación histórica solo bajo la misma cohorte, corte y metodología. No es rendimiento futuro ni recomendación de traspaso. No cubre otras cohortes.
- Seguros: dos opciones documentales en vida temporal, gastos médicos mayores y auto amplia. Las seis primas son ND. Comparación de coberturas y condiciones con diferencias visibles, sin ranking de precio ni elegibilidad automática. La edad de GNP Versátil permanece en conflicto entre documentos.
- Cuentas, ahorro e inversión: se conservan las nueve fichas iniciales y sus restricciones por campo. Persisten importes en conflicto, tasas retenidas y fuentes indizadas o no abiertas. ND nunca es cero. La existencia de una ficha no habilita todos sus datos para cálculo.

## Corrección CONSAR que sustituye los metadatos v1

Corte = 2026-08, precisión mensual. Publicación estadística = 2026-09-15, precisión de día, verificada por separado en IRN y comisiones. Emisión y cálculo = ND. No presentar 2026-08-31 como día factual. Se corrigen las cuatro Afores originales y se incorporan las seis restantes, sin modificar IRN ni comisiones.

El catálogo acumulativo y la lectura humana de ahorro/inversión de este paquete son la versión aplicable. Los archivos originales y el primer ZIP permanecen intactos como antecedente; no se incluyen copias sin corregir en este paquete. Su SHA-256 es 7f1c618b618fbf02e822f18831dd7b6790a0f2563e610d86a25b3dbe73d2eea5. El manifiesto de corrección registra diferencias y hashes originales.

## Controles y lectura de archivos

- Crédito conserva sus esquemas y observaciones atómicas: 871 base y 438 nuevas. Ahorro/inversión registra 338 campos auditados. Son unidades de QA distintas y no se suman.
- manifest-paquete-v2.json contiene SHA-256 y tamaño de cada archivo de contenido; se excluye a sí mismo de esa lista para evitar una referencia circular.
- qa-consolidacion.json registra verificaciones cruzadas de conteos, IDs, fuentes, fechas CONSAR, primas ND y conservación de v1.
- Se excluyen PDF descargados, HTML/JS/CSS de inspección, scripts de autoría, secretos y datos personales de visitantes. Se conservan enlaces oficiales en las fichas. Los SVG son diagramas originales y no código de la aplicación.
- Metodología, criterios de integración y tres diagramas originales se conservan. No se renueva ni sustituye el registro de afiliados en Notion con este ZIP.

## Uso posterior

Respetar las alertas junto al dato, estados de vigencia, unidades, perfiles, condiciones de acceso y fechas. CAT, GAT, tasas, rendimientos históricos, IRN y primas no se funden en una clasificación global. La QA es de integridad y procedencia, no dictamen regulatorio. Toda contratación, elegibilidad y cotización individual debe verificarse en el proveedor; esta entrega no realiza esas acciones.
