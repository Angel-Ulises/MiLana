# Fase 4 — Propuesta de poda (pendiente de tu aprobación)

No se borró ni se ocultó ninguna página. Esta es la recomendación por URL; nada se ejecuta hasta que la apruebes.

**Cómo se midió:** el parecido es la proporción de frases de 5 palabras compartidas entre páginas de la misma familia (0% = textos distintos, 100% = iguales). La calidad de Match sale de `match-catalogo.json` (estado de cada dato).

**Qué significa cada decisión:**
- *Conservar*: se queda igual en el índice.
- *Conservar y enriquecer*: se queda, pero hay que reescribir la plantilla.
- *Quitar del índice*: la URL sigue funcionando (nadie llega a un error), pero lleva `noindex` y sale del sitemap.
- *Fusionar*: ninguna lo necesita por ahora; si alguna se fusiona, llevará redirección 301.

**Resumen:** Conservar: 55 · Quitar del índice: 57 · Conservar y enriquecer: 32 · Quitar del índice (o enriquecer): 12 · Quitar del menú y del índice: 1 · Total: 157 URLs.

| URL | Recomendación | Motivo |
|---|---|---|
| `/` | Conservar | Portada; rediseñada en la fase 2. |
| `/calculadoras` | Conservar | Índice de las 10 calculadoras. |
| `/calculadoras/finiquito` | Conservar | Calculadora con contenido propio; rehecha en la fase 1. |
| `/calculadoras/liquidacion` | Conservar | Calculadora con contenido propio; rehecha en la fase 1. |
| `/calculadoras/aguinaldo` | Conservar | Calculadora con contenido propio; rehecha en la fase 1. |
| `/calculadoras/isr` | Conservar | Calculadora con contenido propio; rehecha en la fase 1. |
| `/calculadoras/resico` | Conservar | Calculadora con contenido propio; rehecha en la fase 1. |
| `/calculadoras/ptu` | Conservar | Calculadora con contenido propio; rehecha en la fase 1. |
| `/calculadoras/bruto-a-neto` | Conservar | Calculadora con contenido propio; rehecha en la fase 1. |
| `/calculadoras/vacaciones` | Conservar | Calculadora con contenido propio; rehecha en la fase 1. |
| `/calculadoras/infonavit` | Conservar | Calculadora con contenido propio; rehecha en la fase 1. |
| `/calculadoras/pension-imss` | Conservar | Calculadora con contenido propio; rehecha en la fase 1. |
| `/situaciones/entender-mi-sueldo` | Conservar | Ruta guiada con texto propio que enlaza a calculadoras. |
| `/situaciones/revisar-mis-prestaciones` | Conservar | Ruta guiada con texto propio que enlaza a calculadoras. |
| `/situaciones/terminar-relacion-laboral` | Conservar | Ruta guiada con texto propio que enlaza a calculadoras. |
| `/aprende/aguinaldo-bruto-neto` | Conservar | Guía con texto propio (parecido máximo con otra guía: 10%). |
| `/aprende/cat-y-gat-que-comparan` | Conservar | Guía con texto propio (parecido máximo con otra guía: 9%). |
| `/aprende/finiquito-vs-liquidacion` | Conservar | Guía con texto propio (parecido máximo con otra guía: 9%). |
| `/aprende/leer-fuentes-comparador-financiero` | Conservar | Guía con texto propio (parecido máximo con otra guía: 10%). |
| `/aprende/leer-recibo-nomina` | Conservar | Guía con texto propio (parecido máximo con otra guía: 12%). |
| `/aprende/mensualidad-y-costo-del-credito` | Conservar | Guía con texto propio (parecido máximo con otra guía: 10%). |
| `/aprende/pension-imss-ley-97` | Conservar | Guía con texto propio (parecido máximo con otra guía: 13%). |
| `/aprende/resico-ingresos-cobrados` | Conservar | Guía con texto propio (parecido máximo con otra guía: 13%). |
| `/aprende/vacaciones-prima-vacacional` | Conservar | Guía con texto propio (parecido máximo con otra guía: 13%). |
| `/aprende` | Conservar | Índice de guías. |
| `/finanzas/ahorro` | Conservar | Herramienta o página de finanzas con contenido propio. |
| `/finanzas/deuda-y-credito` | Conservar | Herramienta o página de finanzas con contenido propio. |
| `/finanzas/fondo-emergencia` | Conservar | Herramienta o página de finanzas con contenido propio. |
| `/finanzas/mi-situacion` | Conservar | Herramienta o página de finanzas con contenido propio. |
| `/finanzas/presupuesto` | Conservar | Herramienta o página de finanzas con contenido propio. |
| `/finanzas/vivienda` | Conservar | Herramienta o página de finanzas con contenido propio. |
| `/finanzas` | Conservar | Índice de finanzas. |
| `/finanzas/inversion` | Conservar | Guía de inversión; datos propios. |
| `/finanzas/inversion/comparar` | Conservar | Comparador educativo de instrumentos. |
| `/finanzas/inversion/cetes` | Conservar | Tasas CETES verificadas al 6 nov 2026. |
| `/finanzas/inversion/fondos` | Quitar del índice | Muestra de fondos CNBV con corte del 1 oct 2026; la actualización está bloqueada (issue #147). Volver a indexar cuando se actualice. |
| `/invertir` | Conservar | Página educativa de inversión. |
| `/economia` | Conservar | Índice del radar económico. |
| `/economia/banxico-mantiene-tasa-650-septiembre-2026` | Conservar | Artículo con datos oficiales (actualizado 1 oct 2026; conviene refrescarlo). |
| `/economia/consumo-privado-agosto-2026` | Conservar | Artículo con datos oficiales (actualizado 1 oct 2026; conviene refrescarlo). |
| `/economia/economias-regionales-segundo-trimestre-2026` | Conservar | Artículo con datos oficiales (actualizado 1 oct 2026; conviene refrescarlo). |
| `/economia/inflacion-primera-quincena-septiembre-2026` | Conservar | Artículo con datos oficiales (actualizado 1 oct 2026; conviene refrescarlo). |
| `/estados` | Conservar | Índice de estados. |
| `/estados/aguascalientes` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 75% del texto es igual al de los otros estados (máx. 85%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/baja-california-sur` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 73% del texto es igual al de los otros estados (máx. 82%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/baja-california` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 69% del texto es igual al de los otros estados (máx. 75%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/campeche` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 75% del texto es igual al de los otros estados (máx. 81%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/chiapas` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 76% del texto es igual al de los otros estados (máx. 87%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/chihuahua` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 73% del texto es igual al de los otros estados (máx. 82%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/ciudad-de-mexico` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 70% del texto es igual al de los otros estados (máx. 77%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/coahuila` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 71% del texto es igual al de los otros estados (máx. 81%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/colima` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 75% del texto es igual al de los otros estados (máx. 81%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/comparar` | Conservar | Comparador entre estados. |
| `/estados/durango` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 77% del texto es igual al de los otros estados (máx. 85%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/estado-de-mexico` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 73% del texto es igual al de los otros estados (máx. 81%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/guanajuato` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 74% del texto es igual al de los otros estados (máx. 81%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/guerrero` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 76% del texto es igual al de los otros estados (máx. 87%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/hidalgo` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 75% del texto es igual al de los otros estados (máx. 85%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/jalisco` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 77% del texto es igual al de los otros estados (máx. 84%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/michoacan` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 76% del texto es igual al de los otros estados (máx. 85%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/morelos` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 76% del texto es igual al de los otros estados (máx. 83%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/nayarit` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 76% del texto es igual al de los otros estados (máx. 84%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/nuevo-leon` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 72% del texto es igual al de los otros estados (máx. 79%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/oaxaca` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 75% del texto es igual al de los otros estados (máx. 85%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/puebla` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 75% del texto es igual al de los otros estados (máx. 83%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/queretaro` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 75% del texto es igual al de los otros estados (máx. 85%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/quintana-roo` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 74% del texto es igual al de los otros estados (máx. 82%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/san-luis-potosi` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 75% del texto es igual al de los otros estados (máx. 85%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/sinaloa` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 74% del texto es igual al de los otros estados (máx. 85%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/sonora` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 74% del texto es igual al de los otros estados (máx. 81%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/tabasco` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 74% del texto es igual al de los otros estados (máx. 84%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/tamaulipas` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 75% del texto es igual al de los otros estados (máx. 85%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/tlaxcala` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 75% del texto es igual al de los otros estados (máx. 84%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/veracruz` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 75% del texto es igual al de los otros estados (máx. 83%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/yucatan` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 75% del texto es igual al de los otros estados (máx. 85%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/estados/zacatecas` | Conservar y enriquecer | Datos reales y distintos (ENOE T2 2026, ingresos de profesionistas, vivienda SHF, ocupaciones), pero el 75% del texto es igual al de los otros estados (máx. 82%). Reducir texto de plantilla y abrir con el dato propio del estado. |
| `/carreras` | Conservar | Índice de carreras. |
| `/carreras/comparar` | Conservar | Ranking o comparador con contenido propio (parecido máximo 6%). |
| `/carreras/mas-demandadas` | Conservar | Ranking o comparador con contenido propio (parecido máximo 20%). |
| `/carreras/mejor-pagadas` | Conservar | Ranking o comparador con contenido propio (parecido máximo 20%). |
| `/carreras/ocupaciones` | Conservar | Ranking o comparador con contenido propio (parecido máximo 6%). |
| `/carreras/peor-pagadas` | Conservar | Ranking o comparador con contenido propio (parecido máximo 19%). |
| `/carreras/por-estado` | Conservar | Ranking o comparador con contenido propio (parecido máximo 13%). |
| `/carreras/profesion/administracion` | Quitar del índice (o enriquecer) | Página corta (181 frases de 5 palabras) y 64% igual a las otras profesiones. Mantener la URL para quien llega del comparador, con noindex hasta añadir datos propios (rango salarial por estado, empleos, ejemplo de sueldo neto). |
| `/carreras/profesion/arquitectura` | Quitar del índice (o enriquecer) | Página corta (178 frases de 5 palabras) y 64% igual a las otras profesiones. Mantener la URL para quien llega del comparador, con noindex hasta añadir datos propios (rango salarial por estado, empleos, ejemplo de sueldo neto). |
| `/carreras/profesion/ciencias-computacion` | Quitar del índice (o enriquecer) | Página corta (181 frases de 5 palabras) y 64% igual a las otras profesiones. Mantener la URL para quien llega del comparador, con noindex hasta añadir datos propios (rango salarial por estado, empleos, ejemplo de sueldo neto). |
| `/carreras/profesion/contabilidad` | Quitar del índice (o enriquecer) | Página corta (178 frases de 5 palabras) y 66% igual a las otras profesiones. Mantener la URL para quien llega del comparador, con noindex hasta añadir datos propios (rango salarial por estado, empleos, ejemplo de sueldo neto). |
| `/carreras/profesion/derecho` | Quitar del índice (o enriquecer) | Página corta (175 frases de 5 palabras) y 67% igual a las otras profesiones. Mantener la URL para quien llega del comparador, con noindex hasta añadir datos propios (rango salarial por estado, empleos, ejemplo de sueldo neto). |
| `/carreras/profesion/diseno` | Quitar del índice (o enriquecer) | Página corta (172 frases de 5 palabras) y 65% igual a las otras profesiones. Mantener la URL para quien llega del comparador, con noindex hasta añadir datos propios (rango salarial por estado, empleos, ejemplo de sueldo neto). |
| `/carreras/profesion/enfermeria` | Quitar del índice (o enriquecer) | Página corta (179 frases de 5 palabras) y 64% igual a las otras profesiones. Mantener la URL para quien llega del comparador, con noindex hasta añadir datos propios (rango salarial por estado, empleos, ejemplo de sueldo neto). |
| `/carreras/profesion/finanzas-banca-seguros` | Quitar del índice (o enriquecer) | Página corta (180 frases de 5 palabras) y 65% igual a las otras profesiones. Mantener la URL para quien llega del comparador, con noindex hasta añadir datos propios (rango salarial por estado, empleos, ejemplo de sueldo neto). |
| `/carreras/profesion/ingenieria-civil` | Quitar del índice (o enriquecer) | Página corta (178 frases de 5 palabras) y 64% igual a las otras profesiones. Mantener la URL para quien llega del comparador, con noindex hasta añadir datos propios (rango salarial por estado, empleos, ejemplo de sueldo neto). |
| `/carreras/profesion/medicina` | Quitar del índice (o enriquecer) | Página corta (175 frases de 5 palabras) y 66% igual a las otras profesiones. Mantener la URL para quien llega del comparador, con noindex hasta añadir datos propios (rango salarial por estado, empleos, ejemplo de sueldo neto). |
| `/carreras/profesion/mercadotecnia` | Quitar del índice (o enriquecer) | Página corta (179 frases de 5 palabras) y 66% igual a las otras profesiones. Mantener la URL para quien llega del comparador, con noindex hasta añadir datos propios (rango salarial por estado, empleos, ejemplo de sueldo neto). |
| `/carreras/profesion/psicologia` | Quitar del índice (o enriquecer) | Página corta (175 frases de 5 palabras) y 65% igual a las otras profesiones. Mantener la URL para quien llega del comparador, con noindex hasta añadir datos propios (rango salarial por estado, empleos, ejemplo de sueldo neto). |
| `/finanzas/match` | Quitar del menú y del índice | Comparador con corte del 12 oct 2026; solo 0–24% de los datos verificados por categoría y hasta 45% faltantes. |
| `/finanzas/match/metodologia` | Quitar del índice | Depende de que Match vuelva a publicarse. |
| `/finanzas/match/hipotecas` | Quitar del índice | Categoría con 3 productos; datos al 12 oct 2026 sin actualización automática. |
| `/finanzas/match/automotriz` | Quitar del índice | Categoría con 3 productos; datos al 12 oct 2026 sin actualización automática. |
| `/finanzas/match/tarjetas` | Quitar del índice | Categoría con 8 productos; datos al 12 oct 2026 sin actualización automática. |
| `/finanzas/match/creditos-personales` | Quitar del índice | Categoría con 6 productos; datos al 12 oct 2026 sin actualización automática. |
| `/finanzas/match/cuentas` | Quitar del índice | Categoría con 3 productos; datos al 12 oct 2026 sin actualización automática. |
| `/finanzas/match/ahorro` | Quitar del índice | Categoría con 3 productos; datos al 12 oct 2026 sin actualización automática. |
| `/finanzas/match/inversiones` | Quitar del índice | Categoría con 3 productos; datos al 12 oct 2026 sin actualización automática. |
| `/finanzas/match/seguros` | Quitar del índice | Categoría con 6 productos; datos al 12 oct 2026 sin actualización automática. |
| `/finanzas/match/afores` | Quitar del índice | Categoría con 10 productos; datos al 12 oct 2026 sin actualización automática. |
| `/finanzas/match/hipotecas/mx-hipoteca-bbva-fija` | Quitar del índice | 2 de 22 datos verificados, 1 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/hipotecas/mx-hipoteca-banorte-fuerte-adquisicion` | Quitar del índice | 1 de 17 datos verificados, 0 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/hipotecas/mx-hipoteca-santander-adquisicion` | Quitar del índice | 1 de 19 datos verificados, 1 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/automotriz/mx-auto-banorte-autoestrene-tradicional` | Quitar del índice | 1 de 12 datos verificados, 2 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/automotriz/mx-auto-bbva-consumer-finance` | Quitar del índice | 1 de 15 datos verificados, 4 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/automotriz/mx-auto-scotiabank-crediauto-mas` | Quitar del índice | 1 de 11 datos verificados, 0 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/tarjetas/stori-green-clasica-mx` | Quitar del índice | 20 de 30 datos verificados, 8 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/tarjetas/bbva-azul` | Quitar del índice | 1 de 9 datos verificados, 2 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/tarjetas/hsbc-zero` | Quitar del índice | 1 de 9 datos verificados, 2 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/tarjetas/klar-tarjeta-credito` | Quitar del índice | 1 de 12 datos verificados, 5 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/tarjetas/santander-likeu-mastercard` | Quitar del índice | 1 de 8 datos verificados, 2 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/tarjetas/nu-tarjeta-credito` | Quitar del índice | 0 de 14 datos verificados, 1 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/tarjetas/uala-tarjeta-credito-clasica-mx` | Quitar del índice | 24 de 33 datos verificados, 9 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/tarjetas/banregio-win` | Quitar del índice | 1 de 9 datos verificados, 2 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/creditos-personales/banamex-personal` | Quitar del índice | 0 de 11 datos verificados, 1 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/creditos-personales/hsbc-personal` | Quitar del índice | 1 de 10 datos verificados, 1 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/creditos-personales/santander-personal` | Quitar del índice | 1 de 11 datos verificados, 0 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/creditos-personales/digitt-refinanciamiento` | Quitar del índice | 0 de 12 datos verificados, 4 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/creditos-personales/yotepresto-personal` | Quitar del índice | 0 de 15 datos verificados, 2 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/creditos-personales/bbva-personal-inmediato` | Quitar del índice | 1 de 10 datos verificados, 1 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/cuentas/banamex-switch` | Quitar del índice | 0 de 11 datos verificados, 1 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/cuentas/nu-cuenta` | Quitar del índice | 0 de 10 datos verificados, 2 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/cuentas/bbva-libreton-digital` | Quitar del índice | 0 de 11 datos verificados, 1 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/ahorro/nu-cajitas-24-7` | Quitar del índice | 3 de 10 datos verificados, 0 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/ahorro/klar-deposito-light-30` | Quitar del índice | 3 de 12 datos verificados, 2 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/ahorro/finsus-plazo-360` | Quitar del índice | 0 de 13 datos verificados, 3 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/inversiones/bonddia-pf2` | Quitar del índice | 4 de 12 datos verificados, 0 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/inversiones/cetes-1-mes` | Quitar del índice | 2 de 11 datos verificados, 0 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/inversiones/gbm-smart-cash-pesos` | Quitar del índice | 0 de 9 datos verificados, 3 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/seguros/axa-auto-individual-amplia` | Quitar del índice | 0 de 16 datos verificados, 3 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/seguros/qualitas-amplia` | Quitar del índice | 0 de 11 datos verificados, 6 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/seguros/axa-flex-plus` | Quitar del índice | 0 de 11 datos verificados, 2 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/seguros/gnp-linea-azul-versatil` | Quitar del índice | 0 de 13 datos verificados, 3 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/seguros/metlife-tempolife` | Quitar del índice | 0 de 16 datos verificados, 3 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/seguros/gnp-temporal` | Quitar del índice | 0 de 12 datos verificados, 4 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/afores/afore-azteca-sb9094` | Quitar del índice | 2 de 11 datos verificados, 1 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/afores/afore-banamex-sb9094` | Quitar del índice | 2 de 11 datos verificados, 1 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/afores/afore-coppel-sb9094` | Quitar del índice | 2 de 11 datos verificados, 1 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/afores/afore-inbursa-sb9094` | Quitar del índice | 2 de 11 datos verificados, 1 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/afores/afore-invercap-sb9094` | Quitar del índice | 2 de 11 datos verificados, 1 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/afores/afore-pensionissste-sb9094` | Quitar del índice | 2 de 11 datos verificados, 1 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/afores/afore-principal-sb9094` | Quitar del índice | 2 de 11 datos verificados, 1 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/afores/afore-profuturo-sb9094` | Quitar del índice | 2 de 11 datos verificados, 1 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/afores/afore-sura-sb9094` | Quitar del índice | 2 de 11 datos verificados, 1 no disponibles; corte 12 oct 2026. |
| `/finanzas/match/afores/afore-xxi-banorte-sb9094` | Quitar del índice | 2 de 11 datos verificados, 1 no disponibles; corte 12 oct 2026. |
| `/sobre` | Conservar | Página de confianza. |
| `/contacto` | Conservar | Página de confianza con correo. |
| `/metodo` | Conservar | Método y fuentes; actualizado al 9 nov 2026. |
| `/privacidad` | Conservar | Aviso de privacidad ampliado en la fase 5. |
| `/financiamiento` | Conservar | Transparencia sobre publicidad y afiliación. |
| `/widgets` | Quitar del índice | Página técnica para insertar calculadoras en otros sitios; no responde una búsqueda de persona. |
