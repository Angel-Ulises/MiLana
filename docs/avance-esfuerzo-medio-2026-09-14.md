# Bloque de esfuerzo medio — 14 de septiembre de 2026

Estado: implementado en borrador PR #8; pendiente aceptación con esfuerzo alto. No fusionado ni publicado en producción. PR #6 (navegación) permanece separado.

## Cambios
- Motor común de ISR para meses completos ordinarios de febrero a diciembre de 2026, un empleador y declaración explícita de salario mínimo.
- Aguinaldo bruto con fechas civiles inclusivas, salario fijo y proyección al cierre de 2026.
- Validación de entradas, etiquetas asociadas y retirada de resultados al editar.
- Fichas con alcance, periodo, fuentes enlazadas y revisión final pendiente.
- Importes suspendidos en Finiquito, Liquidación y Bruto a Neto mientras se resuelven los defectos de PR #7. Se conservan sus páginas y contenido orientativo.
- Textos relacionados ajustados para no presentar ISR mensual como cálculo fiscal del aguinaldo.

## Evidencia de verificación
- Cinco grupos de pruebas numéricas aprobados tanto en UTC como en America/Mexico_City.
- Vercel del proyecto mi-lana-pn2f: build READY para c18a3aa5f04fd638fc34500b503a11f223a6af85.
- Navegador, ISR: ingreso 11000, no solo mínimo y un empleador => causado 837.82, subsidio 535.65, retenido 302.17.
- Navegador, ISR: ingreso 11492.67 => 891.42. Editar elimina el resultado anterior.
- Navegador, Aguinaldo: salario 18000, 15 días, ingreso 2026-07-01 => 184 días y 4536.99 brutos.
- Navegador, Aguinaldo: fecha de 2027 rechazada; edición de fecha retira resultados.
- El rellenado automatizado de la fecha no actualizó inicialmente el estado del formulario. La interacción de teclado con el control nativo sí lo hizo y permitió comprobar el caso. Queda pendiente prueba manual móvil del selector en aceptación.
- Ficha ISR expandida muestra alcance, periodo, fecha de consulta y revisión del cálculo pendiente.
- Finiquito muestra revisión y botón de importes deshabilitado.
- No se realizó certificación normativa ni revisión completa móvil/accesibilidad.

## Siguiente bloque — esfuerzo alto
1. Revisar aceptación y supuestos de ISR/Aguinaldo, incluida interacción móvil de fechas.
2. Resolver especificación de IMSS, Finiquito y Liquidación antes de reactivar importes.
3. Decidir integración de PR #6 y #8 y validar conjuntamente antes de solicitar publicación.
4. Mantener separado el desarrollo comercial/afiliación: este bloque mejora confiabilidad, no demuestra ingresos ni posicionamiento.
