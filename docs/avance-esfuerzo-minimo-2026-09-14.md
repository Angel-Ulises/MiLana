# Avance de ejecución: esfuerzo mínimo

Corte: 14/09/2026. Base main: 64cdc90b783857cc46b2909d22974a433ae7fc05.

## T01 completada: mapa de archivos activos

- index.html carga src/main.jsx; esta entrada importa src/App.jsx.
- src/App.jsx importa src/design-home.css y los datos editoriales/regulatorios.
- App.jsx de raíz no es la entrada de src/main.jsx; se conserva.
- package.json compila Vite y luego scripts/generar-paginas.mjs; salida dist.
- vercel.json contiene el rewrite del despliegue actual. No se modifica.
- main no presenta cambios posteriores a la auditoría.

## T04: corrección de navegación

- Encabezado y botones de portada apuntan a /#seccion.
- Breadcrumb Calculadoras deja navegar al destino real /#calculadoras.
- Al cargar la portada con ancla, se espera al render React para ubicar la sección.
- Margen de desplazamiento de 88 px para que el encabezado no tape el destino.
- Solo se modifican src/App.jsx y src/design-home.css; no se cambian fórmulas.

## Próximo bloque

Ajustar a esfuerzo alto para T02 y T03: contrastar fuentes, fórmulas y estados públicos antes de promover herramientas. T05 y maquetación visual se ejecutarán después con esfuerzo medio/bajo según sus dependencias. T06, T07 y hosting no se improvisan durante este bloque.

Plan completo: https://github.com/Angel-Ulises/MiLana/tree/docs/estrategia-milana-2026-09-14/docs/estrategia/2026-09-14

## Verificación realizada

- Vercel: compilación correcta del proyecto mi-lana-pn2f para el commit c3c3f9aa1cfc29034df88761ed67e8317704c80c.
- Navegador: desde Aguinaldo, el enlace Calculadoras del encabezado y el breadcrumb llegan a /#calculadoras; destino a 87.9 px con encabezado de 72 px.
- Carga directa de /#aprende: después del render, destino a 87.8 px; ancla restaurada.
- PR #6 en borrador; no fusionado ni publicado en producción. No se verificaron fórmulas en este bloque.
- Dos proyectos adicionales de Vercel reportan falta de una cuenta GitHub conectada. El proyecto actual mi-lana-pn2f sí está Ready; revisar las conexiones duplicadas durante el bloque de hosting, sin modificarlas aquí.
