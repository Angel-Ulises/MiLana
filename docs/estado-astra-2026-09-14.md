# Estado final de MiLana — 14/09/2026

Este archivo es el punto de continuidad del producto. Las auditorías y planes anteriores se conservan como historial; este documento describe la versión publicada.

## Producto y cálculos

- Las **10 herramientas** tienen alcance público, fuentes y fecha de comprobación visibles.
- ISR y Aguinaldo usan los motores revisados en `src/lib/calculos-revisados.mjs`.
- Finiquito, Liquidación y Bruto a Neto fueron reimplementados con entradas suficientes y casos automatizados en `src/lib/calculos-laborales-2026.mjs`.
- Finiquito entrega un total bruto dentro del alcance publicado y no inventa ISR por separación.
- Liquidación separa prestaciones, tres meses, prima de antigüedad y deja los 20 días por año como escenario explícito, no automático.
- Bruto a Neto separa bruto, ingreso gravable para ISR, SBC diario y días cotizados; su resultado dice “Neto después de ISR e IMSS”.
- Pensión IMSS es orientación de requisitos Ley 97 y no inventa un monto con datos insuficientes.
- Infonavit se presenta como simulación matemática, no como cotización oficial.

Evidencia: `tests/calculos-revisados.test.mjs`, `tests/calculos-laborales-2026.test.mjs` y `tests/site-integrity.test.mjs`.

## Experiencia publicada

- Inicio prioriza las calculadoras y ofrece rutas por situación para quien no sabe qué herramienta necesita.
- La fotografía principal anterior fue sustituida por una toma horizontal nítida de Pexels 6963026; se retiró el velo de degradados y el escalado que agravaban la percepción de desenfoque en móvil. La fuente queda documentada en `assets-master/FUENTES.json`.
- La plantilla móvil de calculadora tiene una sola jerarquía: encabezado editorial, fotografía y herramienta; no conserva el antiguo enlace suelto ni mensajes repetidos de suspensión.
- Navegación móvil, foco, campos, regiones de resultado, `prefers-reduced-motion` y ayudas siguen activos.
- El centro `/aprende/` publica seis guías: finiquito vs. liquidación, lectura de nómina, aguinaldo bruto/neto, vacaciones, RESICO y pensión IMSS Ley 97.
- Sobre MiLana, Cómo revisamos, Contacto, Privacidad y Financiamiento comparten una presentación editorial coherente.
- Contacto ya no figura como pendiente: el canal público de correcciones es GitHub Issues y advierte que no se publiquen datos personales.

## SEO y operación

- Las 10 calculadoras y los 3 hubs de situación conservan HTML estático con metadata/canonical.
- Inicio usa `WebSite` + `Organization`; se retiró el FAQPage que no tenía contenido FAQ visible equivalente en portada.
- El sitemap final incluye Inicio, 10 calculadoras, 3 situaciones, el centro Aprende, 6 guías y las páginas de confianza. No fabrica `lastmod` nuevo por cada compilación.
- Las antiguas rutas `/guias` redirigen al centro `/aprende` y a sus equivalentes actuales.
- `npm run build` ejecuta primero `npm test`; un fallo numérico o de integridad bloquea el build.
- PR #14, “Finalizar experiencia, contenido y SEO de MiLana”, fue fusionado a `main`; el Vercel activo `mi-lana-pn2f` terminó en SUCCESS.

## Dependencias externas que no forman parte de “terminar la página”

El producto web puede operar sin resolver estas dependencias. No deben presentarse como defectos del sitio:

- plan privado/facturación de Vercel para una futura decisión de hosting;
- aceptación contractual y enlace real de un programa de afiliación;
- diagnóstico privado de la cuenta de AdSense;
- datos posteriores de tráfico, ventas o conciliación para evaluar monetización.

No se activan ofertas, contratos o ingresos ficticios para aparentar que esas dependencias están resueltas.

## Regla de continuidad

Una limitación de alcance no se presenta como trabajo pendiente. Cada herramienta pide los datos que necesita, rechaza entradas fuera de su escenario y explica qué no incluye. Cambios normativos requieren fuente y casos de referencia; cambios visuales no reinterpretan fórmulas; datos comerciales privados no se guardan en el repositorio público.
