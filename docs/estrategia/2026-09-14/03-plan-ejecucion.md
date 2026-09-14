# Plan de ejecución por tareas

**No ejecutar automáticamente al leer.** Este paquete es la salida de investigación solicitada el 14/09/2026. La implementación comienza cuando el propietario la encargue. Las prioridades, dependencias y tamaños son estimaciones de organización, no tiempos garantizados. Cada tarea se toma desde el estado actual del repositorio, porque Claude u otro agente pueden haber avanzado después de este corte.

## Protocolo para ahorrar vueltas y contexto

Leer README, la tarea concreta, la sección de especificación indicada y los archivos implicados. Comparar el main actual con el commit auditado. Si el objetivo ya se cumple, registrar evidencia y cerrar sin rehacerlo. Trabajar en una rama por entrega y evitar que dos agentes editen simultáneamente el mismo archivo.

Cada entrega incluye: problema resuelto, lista breve de archivos, resultado esperado, comprobación realizada, enlace a vista previa cuando haya cambios visibles y limitación pendiente. Publicar requiere el encargo o aprobación correspondiente al resultado concreto; no pedir permiso para cada lectura o comprobación. Nunca convertir al usuario en mensajero de parches y registros.

Esfuerzo **bajo**: implementación acotada con decisiones cerradas. **Medio**: integración o interacción con varios estados. **Alto**: interpretación fiscal/laboral, conflicto de fuentes, condiciones comerciales, diagnóstico desconocido o corte de infraestructura. El modelo mínimo no debe improvisar decisiones nuevas para cerrar una tarea.

## Secuencia compacta

| Entrega | Tareas | Depende de | Salida |
| --- | --- | --- | --- |
| Base de evidencia | T01-T03 | Estado actual del repo | Herramientas promovibles y registro de fuentes |
| Navegación y confianza | T04-T07 | T01 | Recorridos correctos y transparencia real |
| Visual validado | T08-T10 | T02, T04, T05 | Inicio y plantilla aprobables en móvil |
| Operación y hosting | T11-T12 | T01; antes de monetización | Vista previa y despliegue sostenible |
| Medición y editorial | T13-T15 | T05-T10 | Embudo comprobado y primeras dos piezas |
| Primer ingreso piloto | T16-T19 | T03, T07, T12-T15 | Acuerdo, comparación y atribución |
| Evaluación y extensión | T20-T22 | Datos del piloto | Decisión de continuar, corregir o parar |

## T01. Confirmar línea base y resolver duplicados de entrada

**Prioridad P0; esfuerzo bajo; responsable técnico.** Revisar src/main.jsx, src/App.jsx, App.jsx de la raíz, package.json, scripts/generar-paginas.mjs y configuración del hosting. Entregar un mapa de archivos activos. No borrar duplicados en esta tarea: documentar primero quién los consume. Criterio: cualquier ejecutor sabe qué archivo cambiar y qué build produce el sitio. Fuente: auditoría 06, observación O.

## T02. Cerrar revisión de las herramientas prioritarias

**P0; alto; responsable técnico con revisión normativa competente cuando haga falta.** Alcance inicial: bruto a neto, ISR, aguinaldo, finiquito y liquidación. Archivos: src/data/regulatory-data.json, src/data/contenido-calculadoras.json y funciones correspondientes en src/App.jsx.

Para cada constante y supuesto: fuente primaria accesible, artículo/tabla, vigencia, fecha de consulta y rango de aplicación. La UMA cuenta ya con fuente oficial localizada en el informe. No extrapolar de ahí que ISR, subsidios, IMSS o indemnizaciones están comprobados. Si una fuente oficial no responde, buscar publicación oficial alternativa; una cuenta aritmética autoconsistente no sustituye la norma.

Criterio: cada herramienta promovida tiene casos de referencia calculados de forma independiente y límites explícitos; incluir un caso normal, uno de borde y uno fuera de alcance. Si persiste una duda que cambia dinero, el estado público la explica y se pospone su promoción. No inventar una revisión profesional. No cambiar reglas silenciosamente para hacer que los tests pasen.

## T03. Alinear estados públicos con la evidencia

**P0; medio después de T02.** Revisar el registro completo: seis verified, tres needs-review y una blocked en la base auditada. Separar disponibilidad de la herramienta de revisión de fórmula/datos. No inferir del valor blocked que deba eliminarse una calculadora: comprobar el alcance visible de pensión, que puede ser una orientación de requisitos.

Salida: matriz con alcance, última revisión, próxima condición de revisión, nivel de evidencia y texto visible. Criterio: ninguna insignia dice más de lo demostrado; cada estado tiene explicación concreta y vínculo útil. Diseño de estados: especificación visual §3.

## T04. Corregir rutas y navegación compartida

**P0; bajo.** Archivos: src/App.jsx, catálogo de páginas y encabezado actual. Los enlaces a secciones de portada deben funcionar desde calculadoras y privacidad; usar destinos de portada inequívocos. Revisar breadcrumb, volver, recargar y URL directa. Criterio: navegar desde aguinaldo a calculadoras/situaciones/aprende llega al contenido solicitado con teclado y tacto. No reorganizar fórmulas.

## T05. Accesibilidad del formulario y resultado

**P0; medio.** Componente Field y controles compartidos en src/App.jsx. Asociar etiqueta e input; nombres accesibles, ayuda y errores vinculados; foco visible, teclado apropiado y anuncio de resultado. Conservar valores tras error. Criterio: inspección de accesibilidad identifica cada campo, teclado completa el recorrido y los casos de referencia de T02 conservan resultado. Evitar una suite que solo copie el código; comprobar comportamiento.

## T06. Metadata, 404 y HTML de rutas

**P1; medio.** Archivos: scripts/generar-paginas.mjs, index.html, configuración de rutas y catálogo. Corregir título y canonical de privacidad; devolver 404 de servidor para rutas inexistentes con página útil. Conservar metadata ya correcta. Revisar si conviene generar también el contenido principal estático de calculadoras, evitando duplicarlo cuando hidrata React.

Criterio: respuestas HTTP, títulos, canonical, sitemap y contenido coinciden por URL; una URL inventada no sirve portada 200. No declarar que Google es incapaz de ejecutar JS ni que un test equivale a indexación. Fechas lastmod se actualizan por modificación material de contenido, no solo por recompilar.

## T07. Confianza y privacidad con datos reales

**P0 antes de monetizar; alto para contenido, bajo para maquetar.** Crear Sobre MiLana, Método editorial, Contacto y Cómo nos financiamos; actualizar privacidad. No inventar dirección, credenciales, equipo, correo público o consentimiento. Preparar el contenido completo posible y pedir al titular solo los datos imprescindibles que falten al final.

Criterio: responsable identificable, canal funcional autorizado, proceso de corrección, fuentes y relación comercial explicados; aviso refleja analítica, anuncios y cualquier captura real. Si se añade un boletín, verificar primero condiciones del proveedor y tratamiento. Normas y referencias: fuentes 12, 15, 16, 25 y 26. No crear un checklist vacío de páginas para “garantizar AdSense”.

## T08. Aplicar la composición de inicio

**P1; bajo/medio; ejecución técnica y revisión visual GPT.** Seguir 02-especificacion-visual.md §§1-2. Archivos: src/design-home.css y bloques de inicio de src/App.jsx. Subir catálogo, compactar situaciones, mantener titular y fotografía aprovechable, fijar CTA y eliminar repetición anterior al catálogo.

Criterio: orden y textos coinciden con especificación; cuatro tamaños de viewport sin recortes ni scroll lateral; enlaces funcionan. Entregar vista previa y capturas. No cambiar el conjunto de herramientas en función de preferencias no documentadas.

## T09. Plantilla de calculadora, empezando por aguinaldo

**P1; medio.** Seguir especificación §3. Acortar propósito, acercar formulario, mover foto secundaria en móvil, jerarquizar monto/supuestos y añadir próximos pasos. Reutilizar la misma plantilla, sin redibujar cada herramienta.

Criterio: primer campo visible en el caso de móvil definido; estados vacío/error/resultado/revisión funcionan; compartir no incluye datos capturados por defecto. Tres casos de referencia mantienen resultado. Solo al cerrar revisión visual se replica la plantilla a las demás rutas.

## T10. Movimiento y peso

**P2; bajo/medio, después de T08-T09.** Seguir tabla de movimiento de la especificación §5. Consolidar efectos ya existentes en vez de duplicarlos; cobertura de prefers-reduced-motion y scroll suave global. Medir tamaño antes/después y laboratorio con el mismo perfil.

Criterio: contenido visible sin animación, monto final inmediato y presupuestos propios documentados. Si el efecto perjudica acceso o estabilidad, retirarlo. No instalar una biblioteca por costumbre ni afirmar aumento de ventas por una animación.

## T11. Verificar hosting y preparar alternativa

**P0 comercial; alto; trabajo técnico.** Confirmar plan real del proyecto Vercel y opciones de cuenta. Si es Hobby y se monetizará, preparar Cloudflare Pages Free conectado a GitHub, sin cambiar dominio público todavía. Usar build existente y salida dist; inventariar variables públicas/necesarias sin copiar secretos a documentación.

Comprobar que build, tamaño de archivos y volumen caben en límites; documentar diferencias de rewrite/redirect/404 y conservar canonical de producción. El titular realiza conexión de cuenta si las herramientas no pueden; no se le entrega una cadena de terminales. Fuentes 17-21.

## T12. Migración controlada, si T11 la requiere

**P0 antes de activar ingresos; alto.** Preparar inventario DNS y comparativa de rutas en URL temporal: diez calculadoras, tres situaciones, privacidad, sitemap, robots, 404 y recursos. Verificar dominio, TLS, correo y redirección a host canónico. Registrar configuración previa y acción de reversión.

Criterio previo a solicitar publicación: vista temporal completa y resultados de comprobación concretos. Solo entonces proponer al titular el cambio de dominio/DNS con el resultado revisable. No comprar un plan, trasladar registrador o tocar registros de correo sin que sea necesario y autorizado. Si ya usa un plan comercial compatible, documentar que no procede migrar.

## T13. Instrumentar medición mínima

**P1; medio.** Aplicar eventos de 05-medicion-y-economia.md; aprovechar analítica existente si es adecuada. Confirmar páginas vistas únicas con navegación de React y excluir vistas previas. No enviar valores financieros, identificadores personales ni URLs contaminadas.

Criterio: una sesión de prueba produce eventos esperados, sin duplicados de navegación; ninguna carga capturada contiene datos introducidos. Informe define denominadores y limitaciones. Crear acceso de lectura/reportes admitidos por las cuentas; no suponer que GitHub da acceso a Google o a afiliados.

## T14. Publicar los dos primeros recursos editoriales

**P1; alto para contenido, bajo para insertar contenido revisado.** Selección inicial: recibo bruto/neto y aguinaldo con casos. Reusar datos editoriales y generador actuales; URL propia solo si es una intención distinta. Fuente oficial por cada regla, ejemplo marcado ficticio, cálculo independiente, autor real y enlaces a herramienta.

Criterio: aporta información verificable que no sea copiar al proveedor; revisar exactitud, enlaces y legibilidad móvil. No publicar un número fijo de palabras como criterio de calidad. La fecha de revisión es real.

## T15. Distribución y señales de autoridad

**P1; medio, posterior a T14.** Preparar dos adaptaciones breves por pieza y enlaces de medición. Seleccionar un canal donde el operador ya pueda mantener la cadencia. Preparar una ficha de recurso citable para medios/despachos; no enviarla sin autorización para contactar.

Criterio: cada publicación tiene un propósito, destino y métrica de uso útil; dos publicaciones editoriales mensuales como máximo inicial. No contratar anuncios ni comprar enlaces. Las cifras de tráfico proceden de la cuenta real, no de estimaciones inventadas.

## T16. Preparar afiliación con Klar y docDigitales

**P1; alto para revisar condiciones; el titular acepta contratos.** Reunir descripción pública del sitio, audiencia objetivo, rutas relevantes y método editorial. Usar las solicitudes oficiales enlazadas en fuentes 5 y 6. Pedir país, medios, atribución, conversión, base de comisión, anulaciones, pagos, documentación y marca.

Criterio: términos concretos archivados en espacio privado apropiado y resumen operativo sin datos confidenciales. Ningún contrato o dato bancario en repositorio público. No enviar solicitudes o información personal hasta el encargo correspondiente; no presupuestar la tarifa oculta de un banco.

## T17. Ficha de producto y comparación piloto

**P1; alto para selección, medio para interfaz.** Elegir una sola necesidad, inicialmente tarjeta sin anualidad por perfil o facturación para independiente, según acuerdo aceptado y demanda observada. Contrastar máximo tres productos iniciales, incluyendo alternativas pertinentes sin comisión. Documentar universo, criterios, fuente, fecha, condiciones y límites.

Criterio: selección no depende de pago, no hay aprobación prometida ni dato comercial vencido. La plantilla sigue especificación §4. Si faltan condiciones, publicar solo la comparación editorial contrastada y mantener el módulo remunerado apagado.

## T18. Activar enlace y registro comercial

**P1; medio; depende de T07, T12, T13, T16 y T17.** Insertar únicamente enlace emitido por el programa; añadir divulgación y atributo comercial. Subid solo si lo admite el proveedor. Vincular al contenido adecuado desde próximos pasos.

Criterio: destinos y seguimiento correctos, clic deliberado, registro de campaña y botón para desactivar la oferta sin alterar resultados de calculadora. No modificar vínculos para evadir condiciones de atribución ni activar publicidad en flujos vulnerables.

## T19. Revisar AdSense como complemento

**P2; medio.** Comprobar estado real en la cuenta. Si hay rechazo, tratar la razón específica, no suponerla a partir de antecedentes. Ensayar anuncios después del contenido editorial, fuera de formulario y resultado; medir interferencia y cambios de layout. No usar anuncios simulados como si fueran ingresos.

Criterio: cuenta/ruta habilitadas, publicidad distinguible, sin clics accidentales, contenido sigue siendo la parte principal. Activación y publicación según autorización de esa etapa. No prometer aprobación.

## T20. Conciliar y decidir

**P1; medio/alto.** Aplicar E1-E3 de medición. Contrastar Analytics, panel afiliado y pagos; separar pendiente/aprobado/cobrado. Registrar horas. Entregar diagnóstico que identifica el tramo que falla y una sola siguiente intervención.

Criterio: no se presenta registro o clic como venta. Si el volumen es bajo, declarar insuficiencia; no usar porcentajes inestables para reclamar éxito. Revisiones 30/90/180 días relativas al lanzamiento real, no al día de este informe.

## T21. Segundo ingreso y propuesta B2B

**P2; alto; depende de señales de T20.** Probar el segundo programa o una oferta pequeña de patrocinio/licencia, no ambos simultáneamente. Primero preparar muestra y alcance con mantenimiento; conversar solo tras autorización. Global66/Wise quedan reservados para una demanda internacional comprobada.

Criterio: comprador o términos verificables antes de crear funcionalidades nuevas; ingreso por hora razonable para el propietario. No vender asesoría profesional que el equipo no esté habilitado para prestar ni una integración ilimitada por pago único.

## T22. Revisiones de vigencia y continuidad entre agentes

**P1 continuo; bajo para registro, alto ante cambios normativos.** Mantener un archivo corto de estado con tarea terminada, commit, pruebas, tarea siguiente y bloqueos. Revisar productos al vencer su promoción o cambiar contrato; reglas fiscales al publicarse norma relevante y antes de cada campaña estacional. No confundir “última comprobación de enlace” con “última revisión de regla”.

Criterio: cualquier agente retoma desde GitHub sin pedir el historial entero al usuario. Los cambios normativos se aplican con fuente y casos de referencia; el trabajo visual no reinterpreta fórmulas. Un cambio de plan significativo queda documentado con evidencia y motivo.
