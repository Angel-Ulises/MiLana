# Mejora de MiLana — noviembre 2026

Rama: `claude/inspiring-einstein-kix4fx` (vista previa de Cloudflare Pages). Nada está publicado en producción.

| Documento | Qué contiene |
|---|---|
| `00-auditoria.md` | Fase 0: mapa del sitio, rendimiento en celular, qué ve Google, los 10 problemas más graves y la verificación de valores oficiales. |
| `hojas/aguinaldo.md` | Hoja de verificación del aguinaldo neto (3 casos paso a paso) para el contador. |
| `hojas/bruto-neto.md` | Hoja de verificación de sueldo bruto a neto con el salario base de cotización (SBC) estimado (3 casos). |
| `04-poda-propuesta.md` | Fase 4: recomendación para cada una de las 157 URLs. **No se ejecutó nada.** |

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

1. **Contador:** revisar `hojas/aguinaldo.md` y `hojas/bruto-neto.md`. Puntos a decidir: el método de retención del aguinaldo (art. 96 contra el art. 174 del Reglamento), el caso de quien gana el salario mínimo y el factor de integración mínimo para estimar el SBC.
2. **Aviso de privacidad:** el art. 15 fr. I de la LFPDPPP pide la identidad y el domicilio del responsable. Falta tu nombre o razón social y tu domicilio; no los inventé.
3. **Fase 4:** aprobar, cambiar o rechazar la propuesta por URL antes de aplicar cualquier `noindex` o redirección.
4. **GA4 (en el panel de Google):** registrar `modo`, `calculadora` y `destino` como dimensiones personalizadas y, tras publicar, confirmar los eventos en «Tiempo real».
5. **Pendiente técnico, sin hacer:** el JavaScript y el CSS comunes (unos 150 KB de JS y 240 KB de CSS por página) siguen siendo grandes. Reducirlos es una tarea aparte.
6. **AdSense:** no se volvió a solicitar la revisión.
