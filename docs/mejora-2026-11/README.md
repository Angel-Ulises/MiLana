# Mejora de MiLana — noviembre 2026

Rama: `claude/inspiring-einstein-kix4fx`. Vista previa: https://claude-inspiring-einstein-ki.milana.pages.dev (se actualiza con cada cambio de la rama). Nada está publicado en producción.

| Documento | Qué contiene |
|---|---|
| `00-auditoria.md` | Fase 0: mapa del sitio, rendimiento en celular, qué ve Google, los 10 problemas más graves y la verificación de valores oficiales. |
| `hojas/aguinaldo.md` | Hoja de verificación del aguinaldo neto (3 casos paso a paso) para el contador. |
| `hojas/bruto-neto.md` | Hoja de verificación de sueldo bruto a neto con el salario base de cotización (SBC) estimado (3 casos). |
| `04-poda-propuesta.md` + `04-poda-urls.csv` | Fase 4: propuesta conservadora (57 de 158 URLs candidatas a quitar del índice, decisión por categoría en Match) con la lista exacta y diagnóstico corregido el 10/11/2026. **No se aplicó nada.** |
| `05-comprobacion-fuentes.md` | Comprobación contra fuentes oficiales vigentes y diagnóstico de las 3 discrepancias (salario mínimo, art. 96 frente a art. 174, SBC estimado). **No es una validación de contador.** |

## Antes y después (celular emulado: Moto G4, CPU 4× más lenta, 4G lenta; emulador local, no el sitio en vivo)

| Medida | Antes | Después |
|---|---|---|
| Tiempo hasta poder escribir en la calculadora | 2.6 s | ~1.55 s |
| Calculadoras con el campo visible sin hacer scroll | 3 de 10 | 10 de 10 |
| Pasos para obtener el aguinaldo | asistente de 5 preguntas, empezando por «régimen» | 1 campo (sueldo); el resultado aparece al escribir |
| Enlaces en el HTML de cada calculadora | ~140 | ~42 |
| Enlaces en Inicio | 162 | 67 |
| Formulario en el HTML que recibe Google | No | Sí |

## Fase 6 — Eventos de Google Analytics 4

| Evento | Cuándo | Parámetros |
|---|---|---|
| `calcular_<calculadora>` (p. ej. `calcular_aguinaldo`) | Aparece un resultado o cambia el modo | `calculadora`, `modo` (p. ej. `anio_completo`, `parte_del_anio`, `renuncia`, `despido`, `sbc_estimado`) |
| `compartir_whatsapp` | Toque en «Compartir por WhatsApp» | `calculadora` |
| `clic_siguiente_paso` | Toque en la sugerencia de siguiente paso | `calculadora`, `destino` |

Nunca se envían importes, fechas ni lo que escribe la persona. En producción los eventos salen por `window.milanaTrack` (GA4 `G-M4819QE19R`). En la vista previa GA4 no se carga a propósito, para no mezclar visitas de prueba con las reales. Ahí los eventos quedan en `window.dataLayer` y `window.milanaEventos`, y una prueba de navegador comprueba que se registran en las 10 calculadoras.

## Pendiente de tu aprobación o de revisión humana

1. **Contador (pendiente; nada validado):** revisar `hojas/aguinaldo.md`, `hojas/bruto-neto.md` y `05-comprobacion-fuentes.md`. Hay que decidir: el método de retención del aguinaldo (art. 96 o art. 174 RLISR, y la base del 174), la base sin aguinaldo para quien gana el mínimo, la exención en UMA o en salario mínimo, el factor de integración del SBC y cómo preguntar si la persona gana el mínimo. La detección automática por monto quedó descartada.
2. **Aviso de privacidad:** el art. 15 fr. I de la LFPDPPP pide la identidad y el domicilio del responsable. Falta tu nombre o razón social y tu domicilio; no los inventé.
3. **Fase 4:** aprobar, cambiar o rechazar la propuesta por URL antes de aplicar cualquier `noindex` o redirección.
4. **GA4:** las dimensiones `calculadora`, `modo` y `destino` se revisan por separado; no están registradas por esta rama.
5. **Pendiente técnico, sin hacer:** el JavaScript y el CSS comunes (unos 150 KB de JS y 240 KB de CSS por página) siguen siendo grandes. Reducirlos es una tarea aparte.
6. **AdSense:** no se volvió a solicitar la revisión.


## Actualización de 12 fichas de Match (aplicada en la rama, 10/11/2026)


Autorizada por Ángel («Actualice las entonces»). Esta sesión no pudo abrir las páginas: los dominios no resuelven desde su entorno. Se aplicó con la **transcripción de evidencia** que aportó el equipo con su lector web autorizado el 10/11/2026. La transcripción quedó guardada con URL, fecha y procedencia en `data/match/actualizaciones/2026-11-10-lectura-delegada.json`.


- **10 Afores SB 90–94:** IRN de septiembre de 2026. Antes de aplicarlo se comprobó que la columna de agosto coincida con Orion en las 10.
- **Klar Light 30 días:** cifras iguales; vigencia del 05/11 al 07/12/2026.
- **Win Banregio:** CAT 40.3 % (antes 40.6 %), tasa promedio 34.1 % (antes 34.2 %), cálculo del 31/08/2026 y oferta al 28/02/2027.


Las otras 33 fichas no cambiaron. El detalle está en `data/match/LEEME.md`.
