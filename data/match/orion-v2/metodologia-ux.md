# MiLana Match dossier de producto metodología y experiencia

Fecha de elaboración: 12 de octubre de 2026. Destino: revisión editorial y handoff a Claude para planear la implementación en milanaaqui.mx. Estado: propuesta; no autoriza despliegue, publicación, contratación, captación de datos ni cambios en cuentas.

## 1 Decisión de producto

MiLana Match debe ser un comparador editorial de productos financieros mexicanos integrado a MiLana. Su utilidad consiste en mostrar alternativas documentadas, explicar qué sí puede compararse y ayudar a preparar preguntas antes de contratar. La amplitud del catálogo se mide por productos investigados y por calidad de los datos; nunca se llena con tasas inferidas para aparentar cobertura.

La promesa propuesta es: **«Compara opciones con sus condiciones a la vista»**. El producto no promete aprobación, ahorro, rendimientos futuros ni una recomendación individual idónea. «Match» significa coincidencia con filtros explícitos, no un puntaje personal ni una evaluación crediticia.

Calculadoras es una división del medio, junto a las demás herramientas y coberturas editoriales. No debe definir por sí sola la portada, la navegación ni el modelo comercial. La combinación «medio de decisiones de dinero + licencias B2B» es una recomendación de estrategia pendiente de aprobación. Termómetro del Bolsillo Regio y MiLana en Tu Empresa también son conceptos por validar, no servicios lanzados.

El documento original de Grok titulado QUE_COMPRA_SECTOR_FINANCIERO.md no estuvo disponible en este entorno. Se trabajó con el resumen recibido: diagnóstico educativo, Termómetro del Bolsillo Regio y MiLana en Tu Empresa. No se atribuyen al documento original cifras, conclusiones ni compromisos que no se pudieron leer.

### Lo que puede hacer la primera versión

- Explorar nueve categorías sin registro: hipotecas, crédito automotriz, tarjetas, créditos personales, cuentas, ahorro y SOFIPOs, inversiones, seguros y Afores.
- Consultar fichas, filtrar atributos públicos y comparar alternativas de una misma categoría y subcategoría.
- Ver fuente y fecha de cada dato, además de sus condiciones y estado de revisión.
- Mostrar preguntas y lecturas educativas según la decisión que el visitante quiere entender.
- Abrir el sitio oficial de un proveedor mediante un enlace identificado.

### Lo que queda fuera

- Solicitudes de crédito o seguro, evaluación de solvencia, consultas de Buró, depósitos, operaciones de inversión y cambios de Afore.
- Recomendaciones de valores individualizadas, asignación de portafolios, selección de un seguro por antecedentes médicos o afirmaciones de elegibilidad.
- Formularios que capturen ingresos, saldos, deudas, datos de salud, RFC, CURP, identificaciones o documentos financieros.
- Venta de datos del visitante, generación de leads o envío de su diagnóstico a empresas.

La CNBV describe la asesoría profesional individualizada sobre valores dentro del ámbito de asesores en inversiones. Por ello, estos límites deben existir en la funcionalidad, no sólo en un aviso al pie. La validación del alcance regulatorio y de los documentos del producto es una condición previa al lanzamiento; este dossier no certifica cumplimiento jurídico. [CNBV, preguntas frecuentes de asesores en inversiones](https://www.cnbv.gob.mx/SECTORES-SUPERVISADOS/ASESORES_EN_INVERSIONES/Paginas/PreguntasFrecuentes.aspx), texto oficial consultado el 12-10-2026.

## 2 Arquitectura actual y encaje

### Evidencia observada

La portada pública y la página Invertir se consultaron el 12-10-2026. La navegación presenta Calculadoras, Carreras, Estados, Finanzas, Invertir, Economía y Aprende. También existe el acceso «Mi situación», búsqueda guiada y control «Letra grande». La portada presenta primero situaciones del visitante y después herramientas y guías. Invertir ya distingue exploración educativa de contratación. [Inicio](https://www.milanaaqui.mx/) y [Invertir](https://www.milanaaqui.mx/invertir/).

Los enlaces existentes anuncian /finanzas/mi-situacion, /finanzas/inversion/comparar, /finanzas y /economia. Su presencia en la navegación se verificó; la extracción independiente de varias rutas internas falló. No se da por auditada toda su interfaz ni su lógica.

Se inspeccionaron el HTML público y sus hojas de estilo publicadas. El diseño base declara Newsreader para titulares, Inter para texto, azul #2D6CAA, tinta #13263B, texto #18283A, gris #5E6B78, marfil #FBF8F2 y borde #D9E1E8. También se detectó una capa activa que declara Plus Jakarta Sans para parte del cuerpo y JetBrains Mono para ciertas cifras, además de una cabecera oscura y acentos por sección. Por tanto, Newsreader/Inter describe la base existente, no todos los estilos computados actuales. Claude debe inventariar los componentes reales y comprobarlos en navegador antes de fijar tokens; no debe añadir una tercera familia tipográfica o un tema autónomo de Match.

Fuentes técnicas consultadas el 12-10-2026: [HTML de inicio](https://www.milanaaqui.mx/), [estilos base de navegación](https://www.milanaaqui.mx/orbita-v3-base.css), [estilos de superficies](https://www.milanaaqui.mx/orbita-v3-runtime.css), [geometría de primer render](https://www.milanaaqui.mx/orbita-v3-prepaint.css). Esta revisión es documental; no constituye una auditoría visual completa del sitio en todos los dispositivos.

### Propuesta de navegación

Mantener los siete destinos principales actuales en esta fase. Dentro de Finanzas, incorporar el enlace «Comparar productos» con nombre de servicio «MiLana Match». Incluirlo en la búsqueda global y en el menú móvil existente. No crear un encabezado secundario competidor ni una nueva barra publicitaria.

Rutas propuestas, sujetas a revisar colisiones y reglas de URL del repositorio:

- /finanzas/match/ — portada de Match
- /finanzas/match/hipotecas/
- /finanzas/match/automotriz/
- /finanzas/match/tarjetas/
- /finanzas/match/creditos-personales/
- /finanzas/match/cuentas/
- /finanzas/match/ahorro/
- /finanzas/match/inversiones/
- /finanzas/match/seguros/
- /finanzas/match/afores/
- /finanzas/match/{categoria}/{institucion}-{producto}/ — ficha canónica
- /finanzas/match/metodologia/
- /finanzas/match/como-nos-financiamos/

El comparador es un estado de la categoría, no nueve aplicaciones distintas. Los identificadores de productos pueden viajar en una URL compartible; respuestas sobre dinero personal no deben estar en parámetros, historial, analítica ni enlaces. La URL compartida carga la versión vigente y señala si alguna ficha cambió. Si se ofrece una instantánea histórica, debe tener versión y fecha visibles.

La página existente de comparación de instrumentos conserva su finalidad educativa. Match enlaza desde ella a productos concretos y desde las fichas devuelve a la explicación del instrumento. No se duplica su contenido ni se redirige sin revisar tráfico, enlaces y propósito. «Mi situación» conserva la organización de finanzas personales; Match recibe únicamente la categoría elegida voluntariamente, sin reutilizar saldos ni ingresos.

En portada, el acceso a Match ocuparía un módulo editorial de la misma retícula y jerarquía que los demás destinos. No debe insertarse como banner encima del contenido, como ventana emergente o como bloque que aparece tarde al cargar. La integración en portada debe revisarse dentro del diseño completo y del flujo existente antes de desplegar.

## 3 Sistema visual y componentes

### Dirección

Medio financiero claro y sobrio: jerarquía tipográfica, blanco útil, tinta slate y azul MiLana. Composición editorial conectada a navegación y fichas actuales. El verde existente de Finanzas puede mantenerse como acento de sección; no significará aprobación, seguridad ni recomendación de producto.

Los SVG entregados usan azul, slate y marfil, con Newsreader/Georgia e Inter/Arial como referencias de la identidad base. Son propuestas de activos editoriales originales, no cambios aprobados del sistema de producción.

### Reutilizar antes de crear

1. Cabecera y menú móvil globales, buscador, migas de pan y control de letra.
2. Contenedor de lectura, estilos de título y entradilla, enlaces y botones del sitio.
3. Campos, selectores, acordeones, mensajes y paneles de fuentes ya disponibles, cuando su semántica y accesibilidad sean correctas.
4. Un componente de «dato con evidencia», compartido por ficha, resultados y comparación.
5. Un componente de estado y uno de relación comercial, independientes del estilo visual del producto.

No añadir un archivo de sobrescrituras globales, reglas cada vez más específicas o contenido inyectado después del render para imitar componentes. La implementación deberá modificar la fuente del sistema vigente y eliminar la necesidad de parches locales en las nuevas rutas. No se autoriza una refactorización global ajena a Match.

### Jerarquía propuesta

- Un H1 por página. Titular breve de 32–48 px aproximadamente, adaptado al sistema real.
- Lectura principal de 17–18 px con interlineado amplio. La preferencia Letra grande debe conservarse entre rutas según el comportamiento actual.
- Un dato principal y entre dos y cuatro datos secundarios en cada resultado. Evitar competir con cinco porcentajes enormes.
- Fechas, condiciones, unidades y patrocinios con tamaño legible, sin relegarlos a letra diminuta.
- Cifras alineadas con numerales tabulares; no presentar fechas como importes ni envolver porcentajes en medallas.
- Ilustraciones en flujo normal, sin texto sobre fotografías y sin elementos decorativos que aparenten un sello regulatorio.
- Enlaces subrayados dentro del texto; enlaces de fuente nombran la institución y el documento.

### Componentes nuevos y contrato de contenido

**Dato con evidencia:** etiqueta → valor y unidad → alcance breve → estado → fuente enlazada → fecha de cálculo/publicación → fecha de consulta. Las fechas con función distinta no se fusionan en «actualizado».

**Resultado de producto:** nombre exacto y entidad legal; métrica propia de la categoría; comisiones principales; restricciones; estado de cobertura; acciones «Ver ficha» y «Agregar a comparación». Patrocinio visible junto al nombre cuando corresponda.

**Panel de comparación:** de dos a cuatro alternativas; filas por grupo de información; encabezados persistentes sólo si no ocultan lectura; control «Sólo diferencias» sin borrar las condiciones compartidas; acceso a las fuentes de cada celda.

**Aviso de alcance:** texto corto integrado junto a resultados. Nunca una ventana que se deba aceptar para leer.

**Registro de cambios:** campo cambiado, valor anterior y nuevo cuando sea publicable, fecha, motivo y fuentes. Una corrección relevante no desaparece silenciosamente.

## 4 Modelo de datos con fuente y fecha por dato

La unidad mínima verificable es el dato, no el producto. Una ficha puede tener una tasa recién consultada, una anualidad con otra vigencia y un requisito aún no documentado. Un único «última actualización» no resuelve ese problema.

### Entidades

- Institución: marca, razón social, tipo de entidad, regulador/registro aplicable, identificador y dominio oficial verificado. Un producto puede tener distribuidor y emisor distintos.
- Producto: identificador estable, categoría, subcategoría, denominación oficial, modalidad, moneda, disponibilidad territorial, enlace de contratación oficial y estado comercial.
- Dato: atributo atómico y evidencia. Cada comisión, requisito y condición promocional es un dato independiente.
- Fuente: título, emisor, URL exacta, tipo documental, versión, localizador de sección o página, fecha del documento y fecha de consulta.
- Escenario: condiciones bajo las que se obtuvo una cotización o se ejecutó un ejemplo. No equivale a un perfil del usuario.
- Relación comercial: patrocinio/afiliación, contraparte, modalidad de remuneración, inicio/fin de vigencia, declaración pública y ubicación autorizada. No entra al objeto de ordenamiento.
- Revisión: responsable, fecha, resultado de comprobación, conflicto encontrado y resolución.

### Campos obligatorios de un dato

| Campo | Regla |
|---|---|
| atributo | Identificador inequívoco; p. ej. cat_promedio_publicado, comision_apertura o edad_minima |
| valor | Número, rango, texto o nulo; nunca 0 para representar ausencia |
| unidad | %, MXN, UDI, días, meses, años u otra unidad documentada |
| periodicidad | Anual, mensual, por evento o no aplicable |
| modalidad | Fijo, variable, desde, hasta, promedio, escalonado, promocional, estimado o histórico |
| impuestos | Incluye, excluye, antes de impuestos, tratamiento no documentado o no aplicable; con detalle |
| condiciones | Monto, plazo, saldo, cohorte, cobertura, canal y demás supuestos pertinentes |
| fuente_url y fuente_titulo | Página o documento exacto, no sólo dominio de inicio |
| localizador | Tabla, apartado, página PDF o ancla donde está el dato |
| fecha_dato | Fecha de cálculo, publicación o corte declarada por la fuente; nula si no se publica |
| vigencia_desde y vigencia_hasta | Sólo fechas explícitas; no inventar por la fecha de consulta |
| consultado_en | Fecha y hora de lectura, almacenadas con zona horaria |
| revisar_antes_de | Plazo editorial de revisión; no implica vigencia comercial |
| estado | Verificado en fuente, N/D, no aplica, requiere cotización, revisión vencida, caducado o en conflicto |
| nota_limite | Qué no se puede concluir con ese dato |
| evidencia_id | Identificador del documento/evidencia conservado según permisos de uso |

La presentación humana propuesta es: «Fuente: Banco X, tarifario [enlace]. Cálculo: 01-10-2026. Consultado: 12-10-2026. Vigencia publicada: 31-10-2026». Es una plantilla de formato; esas fechas no son datos de un producto real. Si no hay fecha del documento, decir «La fuente no publica fecha de cálculo».

### Jerarquía de evidencia

1. Condiciones, contrato, carátula, prospecto o tarifario vigente del producto exacto en la institución emisora.
2. Página comercial oficial, preservando toda condición de la oferta y su leyenda legal.
3. Datos de autoridad competente, útiles para identidad, contratos, estadísticas o métricas reguladas según su alcance.
4. Respuesta formal de la institución, si se obtiene en una fase expresamente autorizada y puede publicarse.
5. Fuentes secundarias sólo para descubrir candidatos o contexto; no completan una tasa actual por sustitución.

No existe una precedencia mecánica que resuelva cualquier contradicción. Una página comercial más reciente puede referirse a una promoción y un contrato a otro canal. Si no se puede reconciliar producto, fecha, canal y condiciones, ambos valores quedan como evidencia en conflicto y el atributo sale del ordenamiento.

SIPRES permite comprobar información de la institución, no aprobar ni evaluar cada producto. El catálogo debe evitar insignias como «avalado por CONDUSEF». [CONDUSEF, antes de contratar](https://www.gob.mx/condusef/articulos/vas-a-contratar-un-servicio-financiero?idiom=es), texto oficial indexado consultado el 12-10-2026; apertura directa devolvió 403.

### Cobertura amplia sin inventar exhaustividad

Crear un inventario maestro de entidades y productos por categoría. Registrar también candidatos no comparables y el motivo: documentación incompleta, fuera del alcance, producto retirado, datos vencidos, sólo para clientes invitados o requiere cotización.

Mostrar dos contadores distintos: «Productos documentados» y «Productos comparables con estos filtros». El segundo es dinámico. Publicar fecha de corte y universo definido: México, público elegible, moneda, canales y subcategorías incluidos. No escribir «todo el mercado» ni «todas las opciones» salvo que exista un censo comprobable con denominador, fecha y exclusiones.

La cantidad deseada es «tantas opciones documentables como sea posible». Una ficha útil puede mostrar N/D sin desaparecer, pero no competir como si tuviera costo cero. Variantes por plazo o promoción pertenecen al producto y no inflan artificialmente el conteo. Una tarjeta física y su versión virtual tampoco se duplican por defecto.

### Cadencia editorial propuesta

Estos son plazos de operación propuestos, no promesas de monitoreo ya contratado:

- Tasas promocionales, rendimientos variables y disponibilidad: revalidación cada 7 días, antes si la vigencia vence o surge evidencia de cambio.
- CAT, tasas y comisiones estándar: revalidación máxima de 30 días; para entrar a una selección editorial comercial, volver a consultar antes de publicar.
- Métricas de autoridades con corte periódico: actualizar con cada publicación y mostrar siempre el mes/corte real, aunque la consulta sea reciente.
- Identidad y registros de entidades: cada 30 días y ante aviso de cambios o incidencias.
- Contratos, requisitos y condiciones generales: cada 90 días o en cada nueva versión, lo que ocurra antes; una tarifa cambiante dentro del contrato conserva el plazo más corto de su atributo.

Si el flujo automatizado no puede sostener estos plazos, reducir el catálogo visible con datos activos antes que ampliar una falsa apariencia de actualidad. Una revisión fallida debe producir una exclusión o un estado pendiente, nunca una aprobación automática por silencio. Vencido el plazo editorial, el dato cambia automáticamente a «Revisión vencida»; una fecha de consulta antigua no se reemplaza por la fecha de despliegue.

## 5 Metodología de comparación

### Sin puntaje universal

Primera versión sin un «Score MiLana» agregado. Un mismo porcentaje no permite ordenar hipotecas, tarjetas, cuentas, seguros y Afores. Tampoco debe sumarse popularidad, pago comercial o clics a un supuesto indicador de calidad.

Orden inicial neutral: institución y producto por nombre, dentro de la subcategoría seleccionada. El visitante puede ordenar por un atributo documentado que la interfaz nombre de forma literal: «CAT publicado», «Comisión anual», «GAT nominal», «Liquidez», «IRN del mismo corte y generación». Cada opción muestra su dirección y límites. La etiqueta será «ordenado por…», no «mejores».

El orden por un dato sólo se habilita entre productos cuyos atributos sean comparables: misma definición, unidad, subcategoría y condiciones relevantes. Si no existe cohorte homogénea, mantener listado y comparación descriptiva con aviso; no construir un ganador. Un CAT promedio publicitario no se convierte en CAT personal. Un «desde» no se mezcla con un valor único como si fueran la misma oferta.

### Qué significa coincidir

Los filtros son criterios observables elegidos por el visitante: categoría, moneda, disponibilidad, plazo publicado, saldo/monto de ejemplo, liquidez o modalidad. El sistema devuelve tres estados:

- «Coincide con este filtro documentado».
- «No coincide con este filtro documentado».
- «No podemos comprobarlo con la información disponible».

La tercera opción no es un rechazo del usuario. Evitar «aprobado», «eres elegible», «perfecto para ti» o «98 % compatible». Mostrar el porqué de cada coincidencia. Los rangos mínimos de ingresos o edades publicados se presentan informativamente; no se recopilan datos personales para afirmar aprobación.

### Reglas de ordenamiento

1. Seleccionar categoría y subcategoría; fijar cohorte y escenario cuando corresponda.
2. Identificar campos mínimos del atributo elegido.
3. Excluir del orden numérico los N/D, conflictos, caducados, revisiones vencidas y cotizaciones que no compartan escenario.
4. Mostrar debajo un bloque «Datos insuficientes para este orden», accesible sin ocultarlo en un menú.
5. Ordenar únicamente los valores verificados comparables; resolver empates por nombre de institución y producto.
6. Mantener las condiciones junto a la cifra; ordenar un rango por mínimo requiere acción expresa y etiqueta «mínimo anunciado», nunca presentarlo como costo real.
7. Ofrecer «Ver todos los productos documentados» para salir del filtro.
8. Patrocinio y afiliación no alteran selección, posición, desempate ni tamaño de un resultado.

### Ejemplos y cálculos

Se prefieren métricas oficiales publicadas. No calcular un CAT casero ni una GAT a partir de una tasa publicitaria incompleta. Banxico tiene metodologías específicas; incluso distingue el cálculo de crédito revolvente. [Explicación de CAT](https://www.banxico.org.mx/CAT/Explicaciones.html) y [GAT](https://www.banxico.org.mx/waGAT/), consultados el 12-10-2026.

Un ejemplo matemático propio debe identificar entradas, unidades, fórmula, redondeo y componentes incluidos y excluidos. «Pago estimado», «total de pagos del escenario» y «CAT publicado» son campos distintos. Un costo total no se obtiene sumando porcentajes. No extrapolar un periodo promocional a todo un año sin documentar qué ocurre después. Toda simulación se prueba contra casos conocidos y no se presenta como cotización.

Se puede habilitar después un escenario de uso de tarjetas para totaleros, pero su costo requiere anualidad, condiciones de exención, comportamiento de pago, recompensas válidas y límites; no basta el CAT. La primera versión puede mostrar estos campos sin simular dinero ganado.

## 6 Métricas específicas por categoría

### Hipotecas

**Identidad del escenario:** adquisición, sustitución/mejora, liquidez u otra modalidad; moneda; valor de vivienda; monto de crédito; plazo; enganche; tasa fija/variable/mixta; frecuencia de pago. No mezclar destinos o programas.

**Datos principales:** CAT publicado y tipo de CAT, tasa nominal anual y su modalidad, comisión de apertura con base de cálculo e impuestos, enganche/aforo, plazo y monto permitidos. Por separado: mensualidad del escenario oficial, total de pagos cotizados, seguros obligatorios y costos de contratación.

**Costos que se deben investigar:** avalúo, investigación, gastos notariales e impuestos de adquisición cuando la fuente los desglosa, seguros de vida/daños, administración y condiciones de prepago. No afirmar que todos están dentro del CAT: conservar alcance específico y no duplicarlos al calcular desembolsos.

**Requisitos:** edad y límites al final del crédito, documentación e ingresos publicados, antigüedad, empleo/actividad, geografía, relación bancaria y bienes admisibles. No pedir documentos.

**Orden permitido:** CAT sólo con supuestos suficientemente equivalentes y límites visibles; tasa fija o comisión como atributos separados. Una mensualidad más baja con plazo más largo no es por sí sola menor costo.

### Crédito automotriz

Subcategorías: auto nuevo, seminuevo/usado, refinanciamiento y, en un espacio separado, arrendamiento. Identificar quién presta y quién distribuye.

Campos: CAT; tasa anual fija/variable; enganche; comisión de apertura; plazo; monto; antigüedad admisible del vehículo; seguro obligatorio y si se paga de contado o financiado; accesorios/servicios obligatorios; pago final o residual; prepago; restricciones de agencia y modelo.

No comparar un plan con pago residual con un crédito amortizable como si sus mensualidades cubrieran lo mismo. Si hay arrendamiento, mostrar naturaleza del contrato, pagos iniciales, renta, kilometraje, valor residual y opción de compra en una subcategoría propia; no inventar un CAT equivalente.

### Tarjetas de crédito

Campos: CAT promedio/publicitado, fecha de cálculo y vigencia; tasa promedio o rango anual y carácter variable; anualidad del titular y adicionales, impuestos; gasto requerido para exención; cargos de disposición de efectivo; mora/cobranza según tarifario; comisiones de reposición e inactividad si existen; tipo de garantía; requisitos públicos; promociones y restricciones.

Separar tres vistas educativas: pago total, financiamiento revolvente y tarjeta garantizada. Recompensas necesitan tasa de acumulación, topes, exclusiones, expiración, canje y vigencia. No asignarles un valor en pesos sin condiciones suficientes. «Sin anualidad» debe llevar cualquier condición y no significa «sin comisiones».

### Créditos personales

Separar personal, nómina, descuento vía convenio y otras modalidades. Campos: CAT, tasa fija/variable, comisión de apertura, efectivo neto que recibe el cliente en cotización, monto, plazo, periodicidad real, costo total del escenario, seguro, penalizaciones y prepago, requisito de nómina/cliente previo, garantía o aval cuando se publique.

No comparar tasa mensual con anual. No confundir «pago quincenal» con dos pagos mensuales sin revisar calendario. Una tasa aprobada a cada solicitante debe figurar como rango o «requiere cotización», no inventarse con el mínimo anunciado.

### Cuentas

Subcategorías por naturaleza real: depósito bancario, depósito en entidad popular y fondos de pago electrónico cuando corresponda. «Fintech» no es tipo jurídico ni cobertura de depósitos.

Campos: entidad que recibe el saldo; apertura; saldo promedio mínimo; mantenimiento/manejo; inactividad; transferencia; retiro/cajero propio y ajeno según información disponible; tarjeta/reposición; límites de depósitos/operaciones por nivel; disponibilidad de sucursal y canales; requisitos. Si remunera, añadir tasa, GAT cuando aplique, saldo remunerado, topes y condiciones.

Protección o resguardo del dinero debe describirse por tipo de entidad y producto, con fuente, límites y exclusiones. No llamar «ahorro protegido» a todo saldo en una aplicación. Ordenar por costo específico o por acceso, no por un costo anual inventado sin patrón de uso.

### Ahorro y SOFIPOs

Separar depósitos bancarios a la vista/plazo, SOFIPOs y otras figuras. Campos: tasa nominal anual, GAT nominal y real cuando corresponda, fecha de cálculo, plazo, monto mínimo/máximo, saldo/tier remunerado, capitalización y pago de intereses, liquidez, retiros anticipados, renovación automática, promoción y tasa posterior cuando esté publicada.

Añadir razón social y figura regulatoria, estatus consultado, cobertura aplicable por persona/institución y UDI. Si se muestra equivalencia en pesos, usar la UDI del día indicado; nunca fijar una equivalencia permanente. No usar nivel de capitalización o cobertura como garantía absoluta de seguridad.

El IPAB y la protección aplicable a entidades populares son esquemas distintos. Para depósitos cubiertos, las referencias oficiales consultadas mencionan límites de 400,000 UDI y 25,000 UDI respectivamente; aplicabilidad, exclusiones y situación concreta deben comprobarse por entidad/producto. No publicar estas cifras sin fuente junto al campo. [IPAB](https://www.gob.mx/ipab/articulos/el-ipab-garantiza-los-depositos-bancarios-de-los-pequenos-y-medianos-ahorradores-428232?idiom=es) y [CNBV, padrón del sector popular](https://www.cnbv.gob.mx/SECTORES-SUPERVISADOS/SECTOR-POPULAR/Paginas/Padr%C3%B3n-de-Entidades-Supervisadas.aspx), textos oficiales indexados consultados el 12-10-2026; las aperturas directas no estuvieron disponibles.

### Inversiones

El primer filtro debe elegir instrumento y luego producto/serie, no comenzar con «cuál paga más». Subcategorías: deuda gubernamental, fondos de deuda, fondos de renta variable, ETFs, acciones y otros instrumentos que se incorporen con documentación suficiente. No mezclar depósitos remunerados con rendimientos de mercado en una clasificación única.

Campos comunes: instrumento, emisor/operadora, distribuidor/custodio, moneda, horizonte descrito, liquidez y liquidación, monto mínimo, riesgos, documentos, comisiones y tratamiento del rendimiento mostrado.

Deuda gubernamental: emisión/fecha, plazo, tasa o rendimiento observado, forma de adquisición, precio cuando corresponda, riesgo de venta antes del vencimiento. Fondos: clave y serie, prospecto/DICI, gastos/comisiones atribuibles a esa serie, plazo de liquidación, política, indicador de riesgo de la fuente y rendimiento histórico con periodo. ETF/acción: identificador, mercado/moneda, comisión del intermediario, spreads/costos cambiarios cuando estén documentados; no convertir desempeño pasado en tasa ofertada.

Rendimiento bruto/neto, anualizado/acumulado e histórico/ofrecido permanecen separados. Comparar históricos sólo con igual ventana, moneda, método y tratamiento de distribuciones y comisiones. No publicar volatilidad o máxima caída calculadas sin datos, fórmula, muestra y periodo reproducibles. No diseñar recomendador individual de valores.

### Seguros

Elegir ramo antes de comparar: auto, vida, gastos médicos, hogar u otros. Prima no es tasa de interés; CAT y GAT son «No aplica» en la ficha de la póliza, salvo que se analice por separado un financiamiento claramente documentado.

Campos: aseguradora y producto, modalidad de póliza, cobertura y suma asegurada, exclusiones principales, deducible y su base, coaseguro y tope, carencias, red/proveedores cuando aplique, restricciones territoriales, renovación/cancelación, pago anual/fraccionado y recargos documentados, versión de condiciones y RECAS cuando exista.

Las primas requieren un escenario reproducible sin datos reales de visitantes. El ejemplo se marca «cotización ilustrativa» con fecha, canal y supuestos; si no existe cotización válida, se muestra «Requiere cotización». No ordenar pólizas diferentes únicamente por prima. No solicitar información médica ni recomendar cobertura individual.

RECAS permite consultar modelos contractuales, condiciones, coberturas y exclusiones; no equivale a aprobación editorial ni a garantía de cobertura de un siniestro. [RECAS de CONDUSEF](https://registros.condusef.gob.mx/reca/recas.php), texto oficial indexado consultado el 12-10-2026; apertura directa devolvió error.

### Afores

Seleccionar generación/Siefore con un rango de años, sin pedir fecha de nacimiento exacta. Mostrar IRN oficial del mismo corte y Siefore generacional, comisión aplicable, servicios y métricas operativas oficiales con sus propias fechas. No mezclar IRN de una generación con otra, ni comparar saldo personal ganado con un indicador agregado.

El IRN incorpora la deducción de comisiones aplicables; no descontarlas otra vez. El dato resume desempeño pasado y no promete rendimiento futuro. [CONSAR, Indicador de Rendimiento Neto](https://www.gob.mx/consar/articulos/indicador-de-rendimiento-neto?idiom=es%2F), publicación indicada 15-09-2026, texto oficial consultado el 12-10-2026; [consulta estadística de Siefores generacionales](https://www.consar.gob.mx/gobmx/aplicativo/siset/tdf/FondosGeneracionales.aspx).

## 7 Estados y tratamiento de ausencia

| Estado visible | Significado | Comportamiento |
|---|---|---|
| Verificado en fuente | Se leyó evidencia y se conserva su alcance | Puede entrar al orden si es comparable |
| N/D | No se encontró el dato en fuentes revisadas | No equivale a cero; no ordenar por este campo |
| No aplica | El atributo no corresponde a esa categoría | Mostrar explicación corta |
| Requiere cotización | Cambia con variables que no están fijadas | Mostrar preguntas y enlace oficial; no estimar por defecto |
| Revisión vencida | Se pasó el plazo editorial de relectura | Excluir de orden y métricas «vigentes» hasta revalidar |
| Caducado | La vigencia explícita de la oferta terminó | Mantener como histórico si aporta contexto; no CTA promocional |
| En conflicto | Fuentes incompatibles aún no resueltas | Mostrar límite; excluir del orden afectado |
| Producto retirado | Evidencia de que ya no está disponible | Ficha histórica y fecha; no sustituir silenciosamente |
| Fuente temporalmente inaccesible | Falló lectura nueva | Conservar evidencia anterior con fecha; no declarar retirada ni revalidación |

«Verificado» significa cotejado con la fuente; no certifica que la entidad cumplirá ni que el producto sea recomendable. El estado general de una ficha puede ser «Información parcial», con estados por celda. Un enlace roto no vuelve falsa automáticamente una evidencia anterior, pero exige revalidación.

## 8 Flujos móviles y accesibilidad

### Ruta directa

1. Abrir categoría desde Finanzas, búsqueda o artículo.
2. Elegir subcategoría y ver alcance/corte del catálogo.
3. Aplicar filtros opcionales. El botón muestra «Ver resultados»; no «Encontrar mi aprobación».
4. Revisar listado, fuente del dato principal y condiciones.
5. Añadir entre dos y cuatro productos. El estado se anuncia al lector de pantalla.
6. Comparar por bloques: condiciones, costos/rendimientos, requisitos, riesgos y fuentes.
7. Abrir ficha o sitio oficial. Informar salida a tercero y relación comercial.

En móvil, las tablas extensas no deben obligar a deslizar toda la página. Ofrecer comparación apilada por atributo con selector entre productos y una vista de tabla desplazable dentro de un contenedor etiquetado. Si se fija un encabezado o bandeja, reservar su espacio, permitir cerrarla y probar teclado/zoom; nunca cubrir el botón siguiente ni la información legal.

### Ruta educativa opcional

Título: «¿Qué quieres entender antes de decidir?»

Preguntas, todas con opción «No estoy seguro»:

1. «¿Qué estás comparando?» Categorías y «Quiero explorar».
2. «¿Qué necesitas aclarar primero?» Costos / acceso al dinero / condiciones / protección y riesgos.
3. Pregunta de contexto no sensible de la categoría. Ejemplos: «¿Quieres ver un plazo fijo o disponibilidad diaria?»; «¿Quieres entender pago total o financiamiento de una tarjeta?»; «¿Qué ramo de seguro quieres conocer?».

Salida: «Tu ruta de lectura» con explicación del criterio, dos conceptos, lista de preguntas y enlace al comparador. Puede decir «Elegiste disponibilidad diaria; este filtro muestra productos que la documentan». No puede decir «Por tu perfil invierte en X». El visitante puede abrir todo el catálogo y cambiar respuestas.

No se solicita correo para ver resultados. Las respuestas se mantienen en memoria de la sesión; si se propone guardarlas, debe haber control explícito, explicación de ubicación y borrado, antes de implementarlo. Datos escritos no deben enviarse por defecto a analítica o anunciantes.

### Requisitos de aceptación accesible

- Objetivo WCAG 2.2 AA, sujeto a auditoría real antes de declararlo cumplido.
- Controles principales de al menos 44 × 44 px como objetivo de diseño; no confundirlo con el mínimo normativo de 24 × 24 px y sus excepciones. [W3C, tamaño del objetivo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), consultado 12-10-2026.
- Texto normal con contraste mínimo 4.5:1 y texto grande 3:1 según la definición aplicable. Los estados no dependen sólo del color. [W3C, contraste](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), consultado 12-10-2026.
- Labels permanentes, ayuda asociada al campo, errores específicos y resumen enfocable; no depender de placeholder.
- Navegación por teclado completa, foco visible y orden lógico; dialog de filtros con cierre, gestión de foco y regreso al disparador.
- Lectura útil a 320 CSS px y con zoom/texto ampliado. Pruebas en 360, 390, 768 y 1280 px y al 200 %/400 % donde corresponda.
- No acciones esenciales sólo por hover, arrastre, gesto o tooltip.
- Botones de fuente con nombre accesible: «Fuente y fecha de CAT de [producto]».
- Tablas semánticas con encabezados de fila/columna; «Sólo diferencias» anuncia cuántas filas se muestran y no borra definiciones necesarias.
- Reducción de movimiento respetada, ninguna cifra animada, sin carruseles automáticos.
- Imágenes informativas con ALT; la misma información esencial también está en texto. SVG con título y descripción, sin texto trazado en curvas como única versión.

## 9 Textos completos para las páginas

Los textos siguientes son borradores editoriales listos para integrar después de validar datos, operación y condiciones legales. Las frases sobre prácticas reales sólo pueden publicarse cuando estén implementadas. Los campos entre corchetes son variables de contenido, nunca datos ficticios.

### Landing de MiLana Match

**Miga:** Inicio / Finanzas / MiLana Match

**Etiqueta:** Comparación con fuentes visibles

**H1:** Compara opciones con sus condiciones a la vista

**Entradilla:** Revisa créditos, cuentas, ahorro, inversiones, seguros y Afores. Encuentra costos, requisitos y límites en un solo lugar, con la fuente y la fecha de cada dato.

**Acción principal:** Elegir qué comparar

**Acción secundaria:** Cómo comparamos

**Texto de alcance:** Puedes explorar sin registrarte. Los resultados son información educativa; no son una oferta, una evaluación crediticia ni una recomendación personalizada.

**H2:** ¿Qué quieres comparar?

- Hipotecas. Revisa CAT, enganche, plazo y costos de contratación.
- Crédito automotriz. Compara financiamiento, seguros y pagos finales.
- Tarjetas. Consulta anualidad, CAT, comisiones y condiciones de uso.
- Créditos personales. Revisa cuánto recibes, cómo pagas y qué puede cambiar.
- Cuentas. Entiende comisiones, límites y disponibilidad de tu dinero.
- Ahorro y SOFIPOs. Compara rendimientos publicados, liquidez y protección aplicable.
- Inversiones. Distingue instrumentos, riesgos, costos y periodos de rendimiento.
- Seguros. Revisa coberturas, exclusiones, deducibles y condiciones.
- Afores. Compara información de la misma generación y fecha de corte.

**H2:** Cada cifra tiene contexto

Una tasa puede depender del monto, del plazo o de una promoción. Por eso mostramos las condiciones junto a la cifra y enlazamos la fuente original. Cuando no podemos comprobar un dato, verás N/D o el motivo que impide compararlo.

**H2:** Primero elige qué necesitas entender

Si todavía no sabes por dónde empezar, responde unas preguntas sobre la decisión que quieres explorar. Recibirás una ruta de lectura y los criterios que conviene revisar. No necesitamos tus ingresos, tu historial crediticio ni tus documentos.

**Acción:** Explorar una ruta de lectura

**H2:** Cómo se ordenan las opciones

El catálogo se abre por nombre. Tú eliges si quieres ordenar por un costo, una condición o un indicador comparable. Ninguna institución puede pagar para cambiar su posición en ese orden.

**Enlace:** Leer nuestra metodología

**H2:** Lo que cubre este catálogo

Al corte de [fecha], documentamos [número] productos de [número] instituciones dentro de [alcance]. Algunos requieren cotización o tienen datos pendientes de verificación. La cobertura y las exclusiones se pueden consultar por categoría.

**Enlace:** Ver cobertura y actualizaciones

**Cierre:** Antes de contratar, confirma las condiciones vigentes con la institución y revisa el contrato. La aprobación, el costo final y las coberturas dependen del producto y de sus condiciones.

### Encabezados de categorías

**Hipotecas:** «Compara hipotecas con el mismo punto de partida». Texto: «El monto, el enganche y el plazo cambian la comparación. Revisa el CAT publicado junto a los seguros, las comisiones y los costos iniciales».

**Automotriz:** «Revisa todo el financiamiento de tu auto». Texto: «La mensualidad es una parte del contrato. Compara enganche, plazo, seguro y cualquier pago final».

**Tarjetas:** «Entiende lo que cobra cada tarjeta». Texto: «Consulta anualidad, CAT, comisiones y condiciones. Pagar todo cada mes y financiar compras son usos distintos».

**Personales:** «Compara condiciones de créditos personales». Texto: «Revisa el monto disponible, el calendario de pagos y los costos documentados. Una tasa anunciada desde cierto nivel puede cambiar en la oferta final».

**Cuentas:** «Compara cómo se usa y cuánto cuesta una cuenta». Texto: «Revisa saldo mínimo, mantenimiento, retiros, transferencias y límites. Identifica también qué entidad recibe tu dinero».

**Ahorro:** «Mira el rendimiento junto a la disponibilidad». Texto: «La tasa, el plazo, los topes y la protección aplicable forman parte de la misma decisión. Las promociones tienen condiciones».

**Inversiones:** «Compara instrumentos con su riesgo a la vista». Texto: «Empieza por el tipo de inversión. Consulta costos, liquidez, documentos y rendimientos del mismo periodo cuando sean comparables».

**Seguros:** «Lee qué cubre cada seguro». Texto: «Elige un ramo y revisa coberturas, exclusiones, deducibles y condiciones. Las primas sólo se comparan con escenarios equivalentes».

**Afores:** «Compara tu generación con la misma fecha de corte». Texto: «Consulta IRN, comisiones y servicios. Los rendimientos pasados no aseguran resultados futuros».

### Página pública de metodología

**H1:** Cómo comparamos en MiLana Match

MiLana Match reúne información pública de productos financieros disponibles en México. Buscamos que puedas revisar costos, rendimientos, requisitos y condiciones sin perder de vista de dónde viene cada dato.

**Qué incluimos**

Investigamos productos de las categorías descritas en el catálogo. Cada categoría publica su alcance, fecha de corte, opciones documentadas y exclusiones. Una institución no necesita pagar para aparecer. El catálogo puede ser incompleto: indicamos los productos que todavía no cuentan con información suficiente y no afirmamos cubrir todo el mercado.

**De dónde salen los datos**

Consultamos páginas oficiales, tarifarios, contratos, prospectos y fuentes de autoridades. En cada dato puedes abrir la fuente y ver su fecha de cálculo o corte, cuando se publica, además de la fecha en que la consultamos. La fecha de consulta no extiende una promoción ni sustituye la vigencia del documento.

**Qué significa cada indicador**

Las categorías usan métricas distintas. El CAT corresponde al costo anual del crédito bajo sus supuestos. La GAT se utiliza en productos de ahorro o inversión a los que aplica esa medida. Las pólizas se comparan por cobertura y condiciones; las Afores, dentro de la misma generación y corte. Una cifra mayor o menor no basta para concluir qué producto conviene contratar.

**Cómo ordenamos**

El orden inicial es alfabético. Si eliges otro criterio, mostramos su nombre y dirección. Sólo ordenamos numéricamente productos con datos y condiciones comparables. Los datos faltantes, vencidos o en conflicto no se convierten en ceros ni reciben una posición favorable. Puedes consultarlos fuera del orden y revisar lo que falta.

**Qué significa una coincidencia**

Una coincidencia indica que la información pública cumple un filtro que elegiste. No implica que una institución te aprobará, que el producto sea adecuado para tu situación o que obtendrás el costo anunciado. No consultamos tu historial ni verificamos requisitos personales.

**Cuándo actualizamos**

Los datos tienen plazos editoriales de revisión según su naturaleza. Si una oferta vence, la marcamos como caducada. Si pasa el plazo de revisión, lo señalamos y dejamos de utilizar el dato en ordenamientos que requieren vigencia. Las estadísticas conservan su fecha de corte original. Puedes consultar cambios y correcciones en cada ficha.

**Cómo nos financiamos**

Las relaciones comerciales se identifican donde aparecen. Un patrocinador no compra posición, exclusividad ni una conclusión favorable. Si un enlace puede generar una remuneración, lo indicamos antes de que salgas de MiLana. La relación comercial no cambia los filtros ni el orden de comparación. Consulta la página «Cómo nos financiamos» para ver el modelo vigente.

**Límites del servicio**

Publicamos información educativa. No recibimos depósitos, no gestionamos solicitudes y no realizamos operaciones financieras. Tampoco evaluamos tu solvencia ni emitimos recomendaciones individualizadas de inversión o seguro. Antes de contratar, verifica las condiciones con el proveedor y revisa los documentos correspondientes. Si necesitas asesoría personal, consulta a un profesional habilitado para el servicio que requieres.

**Cómo señalar un error**

En cada ficha encontrarás «Reportar un dato». Indica el atributo y la fuente que consideras correcta; evita enviar documentos o información personal. Revisaremos la evidencia y, cuando corresponda, publicaremos la corrección y su fecha.

**Última revisión de esta metodología:** [fecha]. **Versión:** [identificador].

### Ficha completa y orden de lectura

**Miga:** Inicio / Finanzas / MiLana Match / [Categoría] / [Producto]

**H1:** [Nombre oficial del producto]

**Subtítulo:** [Marca comercial] · [Razón social emisora] · [Subcategoría]

**Estado:** [Información verificada / Información parcial / Revisión vencida / Producto retirado]

**Relación comercial, si existe:** Patrocinado por [entidad]. [Descripción exacta de la remuneración]. Este acuerdo no modifica el orden del comparador.

**Resumen:** [Descripción factual de dos frases: qué tipo de producto es, su modalidad y las condiciones que definen su alcance].

**H2:** Los datos principales

Para cada uno: [Etiqueta]: [valor + unidad + periodicidad]. [Desde/promedio/rango/fijo/variable]. [Condición material]. Fuente: [documento y enlace]. Fecha del dato: [fecha o «no publicada»]. Consultado: [fecha]. Vigencia: [fecha o «no publicada»]. Estado: [estado específico].

**H2:** Costos y condiciones

[Lista completa de comisiones con monto o base, impuestos, periodicidad, exenciones y fuente individual]. [Si es ahorro/inversión, sustituir por rendimientos, costos y disponibilidad]. [Si es seguro, coberturas y condiciones]. [Si es Afore, indicador, comisiones y servicios].

**H2:** Requisitos publicados

[Requisito documentado y fuente]. Cumplir un requisito publicado no garantiza aprobación. La institución puede solicitar información adicional dentro de su proceso.

**H2:** Qué revisar con más cuidado

[Restricción material]. [Condición promocional y qué sucede al terminar, si está documentado]. [Dato faltante]. [Riesgo explicado sin adjetivos de venta].

**H2:** Qué no pudimos comprobar

[Campo]: [N/D / requiere cotización / conflicto]. Consultamos [fuentes] el [fecha]. No lo usamos para ordenar alternativas.

**H2:** Preguntas antes de contratar

- ¿Estas condiciones corresponden al mismo monto, plazo y modalidad que estoy revisando?
- ¿Qué cargos son obligatorios y cuáles opcionales?
- ¿Qué cambia al terminar una promoción, retirar antes o cancelar?
- ¿Dónde puedo consultar el contrato y el documento vigente de mi oferta?

**Acciones:** Agregar a comparación · Consultar sitio oficial

**Texto antes de salida:** Vas a abrir el sitio de [entidad] en [dominio verificado]. Ahí aplican sus condiciones y su aviso de privacidad. [Declaración de afiliación si existe].

**H2:** Fuentes y cambios

[Documentos exactos]. [Cambios cronológicos]. «Reportar un dato».

**Aviso final:** La información describe condiciones publicadas y puede cambiar. No es una oferta, una aprobación ni una recomendación personalizada. Confirma los términos de tu contratación con la institución.

### Microtextos de estado y avisos

- N/D: «No encontramos este dato en las fuentes revisadas. No significa que el costo sea cero».
- No aplica: «Este indicador no corresponde a este tipo de producto».
- Requiere cotización: «El valor depende de condiciones que debe cotizar la institución. No lo estimamos sin esos datos».
- Caducado: «La vigencia publicada terminó el [fecha]. Este dato se conserva como referencia histórica y no se usa para ordenar opciones actuales».
- Revisión vencida: «Consultamos este dato el [fecha] y está pendiente de una nueva revisión. Puede haber cambiado».
- Conflicto: «Encontramos condiciones distintas en fuentes oficiales. Estamos revisando si corresponden a la misma modalidad».
- Sin resultados: «No encontramos opciones documentadas que cumplan todos estos filtros. Puedes quitar [filtro] o ver el catálogo completo».
- Sin comparabilidad: «Estas opciones tienen supuestos diferentes. Puedes revisar sus condiciones lado a lado, pero no las ordenamos como si tuvieran el mismo costo».
- Selección: «[Producto] agregado. Llevas [número] de 4 opciones».
- Límite de selección: «Puedes comparar hasta 4 opciones. Quita una para agregar otra».
- Sin productos suficientes: «Necesitas al menos dos opciones de la misma categoría para comparar».
- Datos nuevos: «Esta comparación cambió desde tu última visita. Revisa las fechas y condiciones señaladas».
- Error técnico: «No pudimos cargar estos datos. Intenta de nuevo o consulta la ficha disponible. No se perdieron tus filtros».
- Reporte: «Selecciona el dato y agrega un enlace de referencia. No envíes números de cuenta, identificaciones ni documentos personales».
- Diagnóstico: «Esta ruta organiza temas para aprender. No determina qué producto debes contratar».
- Comparación histórica: «Estás viendo información al corte de [fecha]. Para contratar, consulta las condiciones vigentes».
- Patrocinio: «Patrocinado por [entidad]. La relación comercial no cambia el orden ni las conclusiones editoriales».
- Afiliación por acción: «Si realizas [acción real definida] desde este enlace, MiLana puede recibir una comisión de [entidad]. Esto no cambia el orden de comparación». No afirmar «sin costo para ti» salvo verificación contractual.

### Privacidad y comercialización

No publicar un aviso de privacidad genérico que invente razón social, domicilio, finalidades o mecanismos de derechos. Antes de agregar cualquier formulario, analítica, almacenamiento o afiliación, documentar el flujo real y obtener revisión legal. La primera versión propuesta no necesita datos financieros personales ni registro.

La frase «Tus respuestas no se envían a servidores ni anunciantes» sólo puede usarse después de verificar instrumentación, logs, scripts de terceros y solicitudes de red. Mientras no exista esa comprobación, no prometer anonimato o almacenamiento exclusivamente local.

## 10 Tres artículos originales

### Artículo 1 CAT y GAT qué pregunta responde cada indicador

Slug propuesto: /aprende/cat-y-gat-que-comparan/

**Entradilla:** Dos porcentajes pueden parecer comparables y medir cosas distintas. Antes de ordenar una lista, identifica si estás viendo el costo de pedir dinero o el rendimiento de un producto de ahorro.

El CAT ayuda a revisar el costo anual de un crédito bajo los supuestos con los que se calculó. La tasa de interés es una parte de la información: las comisiones y otros cargos pertinentes también pueden afectar ese indicador. Por eso, mirar únicamente una tasa anunciada puede dejar condiciones importantes fuera de la comparación.

Lee el nombre completo del dato. «CAT promedio», «tasa desde» y «tasa fija» no describen lo mismo. Un porcentaje publicitario tampoco sustituye la oferta que te entregue la institución con monto, plazo y condiciones definidos. Banxico explica que los créditos revolventes, como las tarjetas, requieren supuestos particulares para calcular su CAT. [Fuente: Banco de México, explicación del CAT](https://www.banxico.org.mx/CAT/Explicaciones.html), consulta 12-10-2026.

La GAT se refiere al rendimiento total de determinados productos de ahorro o inversión, considerando su tasa y los costos exigidos para obtenerla. Se publica antes de impuestos. La GAT nominal y la real tienen funciones diferentes: la real incorpora una referencia de inflación esperada. No es una promesa de cuál será tu rendimiento real al terminar el plazo. [Fuente: Banco de México, explicación de la GAT](https://www.banxico.org.mx/waGAT/), consulta 12-10-2026.

Para usar cualquiera de las dos, anota cuatro cosas: producto exacto, monto o saldo, plazo y fecha del dato. Después revisa si la cifra depende de una promoción, un tope o una condición adicional. Si faltan esos elementos, puedes leer la oferta, pero todavía no tienes una comparación completa.

En MiLana Match, cada categoría muestra el indicador que le corresponde. Una tasa de ahorro no compite en la misma lista con el CAT de un préstamo. La pregunta útil es qué mide la cifra y bajo cuáles condiciones, antes de decidir si parece alta o baja.

**Ilustración:** assets/01-cat-gat.svg. **ALT:** «Dos paneles distinguen el CAT, asociado al costo anual del crédito, y la GAT, asociada al rendimiento de ciertos productos de ahorro o inversión; ambos requieren condiciones, fuente y fecha». **Ubicación:** después de la entradilla. **Pie:** «Indicadores distintos. Esquema conceptual sin tasas ni ofertas vigentes».

### Artículo 2 Antes de elegir una mensualidad revisa el resto del contrato

Slug propuesto: /aprende/mensualidad-y-costo-del-credito/

**Entradilla:** Una cuota que parece cómoda puede venir acompañada de un plazo más largo, seguros financiados o un pago final. La comparación empieza reuniendo todas las piezas.

Si estás revisando una hipoteca, un crédito para auto o un préstamo personal, empieza por el monto que recibirás y el calendario completo de pagos. Pregunta cuánto debes pagar al inicio, qué se cobra durante el crédito y si queda una cantidad pendiente al final.

Luego separa los conceptos. El capital es el dinero financiado. Los intereses son un costo del financiamiento. Las comisiones, los seguros y los impuestos que correspondan deben revisarse según la documentación del producto. El CAT tiene su propia metodología; no se obtiene sumando estos renglones como porcentajes ni multiplicándolo directamente por el monto prestado. [Fuente: Banco de México, cálculo del CAT](https://www.banxico.org.mx/CAT/Explicaciones.html), consulta 12-10-2026.

El siguiente paso es pedir que dos cotizaciones usen supuestos equivalentes. Mismo monto, plazo, frecuencia de pago y modalidad ayudan a identificar qué cambia entre ellas. En un automóvil, revisa si el seguro va financiado y si existe un pago residual. En vivienda, distingue los costos del crédito de los gastos necesarios para adquirir el inmueble. Evita contar dos veces un cargo que ya esté incluido en una cifra total.

Hay una prueba sencilla de lectura: ¿puedes explicar qué pagas hoy, qué pagarás durante el contrato y qué podría quedar al final? Si una pieza no aparece, anótala como pendiente. Un espacio vacío en la ficha no significa que ese costo no exista.

La mensualidad sirve para entender el calendario. El CAT, las comisiones y el total de pagos del escenario ayudan a revisar otras partes del costo. Conserva la cotización y el contrato que correspondan a tu oferta antes de tomar una decisión.

**Ilustración:** assets/02-costo-credito.svg. **ALT:** «Ruta de lectura de una cotización: revisar lo que recibes, los pagos iniciales, los pagos durante el crédito y cualquier pago final; al pie se distinguen capital, intereses, comisiones, seguros e impuestos aplicables». **Ubicación:** después del segundo párrafo. **Pie:** «Lista conceptual para leer una cotización. No representa proporciones ni una fórmula de CAT».

### Artículo 3 Una ficha útil también te dice lo que no sabe

Slug propuesto: /aprende/leer-fuentes-comparador-financiero/

**Entradilla:** La confianza en un comparador depende de que puedas revisar su evidencia, conocer sus límites y entender si existe una relación comercial.

Antes de usar un dato, abre su fuente. Debes poder identificar el producto y la institución, además del documento que respalda la cifra. Un enlace a la página principal del banco puede ayudarte a empezar, pero no demuestra por sí mismo una comisión o una condición concreta.

Después distingue las fechas. La fecha de consulta indica cuándo alguien revisó la página. La fecha de cálculo o corte pertenece al dato. La vigencia establece hasta cuándo aplica una oferta, cuando el proveedor la publica. Son funciones diferentes: volver a abrir una promoción vencida no la vuelve vigente.

También vale la pena leer los espacios sin cifra. N/D significa que el dato no está documentado; «requiere cotización» señala que hacen falta condiciones; «caducado» avisa que terminó la vigencia conocida. Ninguno equivale a cero. Un comparador responsable debe permitirte distinguirlos.

Para confirmar quién está detrás de un producto, consulta los registros pertinentes y la razón social. CONDUSEF explica que SIPRES ofrece información sobre instituciones, no sobre cada producto que venden. Encontrar una institución allí no reemplaza la lectura del contrato ni resuelve si una oferta es apropiada para ti. [Fuente: CONDUSEF, antes de contratar un servicio financiero](https://www.gob.mx/condusef/articulos/vas-a-contratar-un-servicio-financiero?idiom=es), texto oficial consultado el 12-10-2026.

Por último, revisa cómo se financia el sitio. Un enlace remunerado o un contenido patrocinado debe decirlo de forma visible. Esa relación no debería esconder las alternativas ni determinar el orden de una comparación editorial.

Una buena ficha te permite salir con mejores preguntas, incluso cuando no produce una respuesta rápida. Saber qué dato falta también te ayuda a evitar una conclusión que la evidencia todavía no sostiene.

**Ilustración:** assets/03-ruta-comparar.svg. **ALT:** «Cinco pasos antes de decidir: elegir categoría, revisar condiciones equivalentes, comparar datos con fuente y fecha, identificar dudas y confirmar con la institución». **Ubicación:** antes del cierre. **Pie:** «Ruta educativa para revisar información. No determina aprobación ni idoneidad personal».

## 11 Patrocinio y modelo comercial propuesto

La publicidad no puede comprar el ranking porque el ranking no contiene una variable comercial. Esta separación debe poder comprobarse en código, operación y contenido.

- El conjunto editorial incluye opciones sin acuerdo comercial con los mismos criterios de evidencia.
- Una ficha patrocinada sigue las mismas reglas de revisión y puede mostrar N/D, vencimiento, riesgos o una corrección.
- La ficha lleva «Patrocinado» con nombre del pagador y naturaleza del acuerdo. No usar «Aliado» como sustituto ambiguo.
- Contenido encargado por una marca aparece en una plantilla identificada desde el encabezado y separada de análisis editorial independiente.
- No insertar un patrocinador como primer resultado con formato idéntico y una etiqueta mínima.
- No vender insignias «mejor», «más seguro», «recomendado por MiLana» ni un score superior.
- Enlaces remunerados se declaran antes del clic; no cambiar destinos silenciosamente.
- El área comercial no corrige métricas ni decide qué competidor se excluye. Cualquier reclamación del patrocinador entra por el mismo proceso de evidencia.
- La primera fase puede dejar deshabilitada la monetización hasta que estén aprobados contratos, avisos y modelo operativo.

**MiLana en Tu Empresa, concepto pendiente:** licencia de contenidos, módulos educativos autoguiados y herramientas generales de autoservicio para organizaciones. No requiere talleres en vivo ni contratar personal. Entregar a la empresa métricas de uso agregadas con protección contra grupos pequeños, nunca los saldos, deudas, resultados individuales o decisiones de sus colaboradores. No construir un indicador para contratación, despido, promoción o crédito de empleados.

**Licencia de datos B2B, concepto pendiente:** vender el servicio propio de organización, revisión y actualización sólo dentro de derechos de uso comprobados. Que una tarifa sea pública no implica que se pueda redistribuir masivamente un documento, una marca o una base ajena. Revisar licencias, términos, alcance de API y permisos antes de ofrecer exportaciones o reventa.

No se fijan precios, clientes, compromisos de entrega ni metas de ingresos sin investigación y aprobación adicionales.

## 12 Termómetro del Bolsillo Regio

Propuesta editorial dentro de Economía, no puntuación individual de salud financiera. Puede reunir indicadores públicos sobre empleo/ingresos, precios, vivienda y crédito, siempre que cada serie tenga geografía, periodo, fuente, frecuencia y limitaciones visibles.

Condiciones para avanzar:

1. Definir si «Regio» significa municipio de Monterrey, zona metropolitana o Nuevo León. No combinar ámbitos como si fueran uno.
2. Comparar cada indicador contra su propio periodo y serie; distinguir mensual, trimestral, anual y estacionalidad.
3. Evitar trasladar inflación nacional a una experiencia exacta del hogar regiomontano.
4. Mostrar paneles separados antes de inventar un índice compuesto. Si después se propone índice, publicar ponderaciones, base, normalización, revisiones y sensibilidad.
5. Traducir cada dato en preguntas concretas: «qué cambió», «a qué periodo corresponde» y «qué no permite concluir».
6. Fuentes candidatas: INEGI, Banco de México y autoridades sectoriales, seleccionadas en una investigación posterior. No se insertan series actuales no verificadas en este dossier.

La conexión con Match sería editorial: un dato de tasas puede enlazar a una explicación de crédito y al comparador pertinente, sin afirmar que el dato económico obliga a contratar.

## 13 Implementación propuesta para Claude

### Primer paso de Claude

Inspeccionar el repositorio autorizado y el sistema de componentes real. Verificar rutas, navegación, tipografías computadas, controles de letra, estilos y arquitectura de datos. Presentar un plan de cambios y una vista de prototipo para aprobación. El encargo permite preparar material en rama/PR o Notion. Esta entrega usa Notion; Claude integra y revisa diseño y flujo dentro del encargo. Orion no despliega a producción.

### Continuidad con el modelo digital previo

El antecedente de Notion «MiLana · Modelo de negocio: canal de distribución», actualizado el 02-10-2026 y leído el 12-10-2026, prioriza operación digital automatizada sin contratar personal, redirección afiliada y ausencia de captación o transferencia de leads y fondos. Esta propuesta conserva ese perímetro. [Documento previo](https://app.notion.com/p/3ed7d48034d381e69af2cd3bcf8e46be).

No se trasladan sus tarifas, cifras fiscales ni afirmaciones jurídicas como datos vigentes. Sus declaraciones de viabilidad son antecedentes de planificación, no un dictamen comprobado. La afiliación financiera sólo se diseñará sobre programas formales verificados y sus condiciones vigentes; las cuentas comerciales, contratos y cobros quedan fuera de esta entrega. Cualquier patrocinio financiero directo, sistema de alta de anunciantes o cambio a ese perímetro necesita una decisión específica posterior. Afores permanece editorial sin pagos por captación o traspasos; no se habilita monetización en esta categoría por analogía con otras.

La automatización puede recolectar fuentes, detectar cambios, comprobar integridad y caducidad, registrar evidencia y retirar un dato del orden. No puede inventar una fuente faltante, resolver una contradicción sin evidencia ni certificar por sí sola que un producto es jurídicamente adecuado. Las excepciones se detienen y se presentan al responsable; no se abre una contratación de personal como solución implícita. Si un requisito no puede satisfacerse dentro del modelo autorizado, se apaga esa función o se solicita una decisión de alcance.

### Capas de trabajo

1. Datos tipados y validados, con evidencia por atributo y fixture separado de producción.
2. Componentes de lectura, comparación y fuentes reutilizables.
3. Páginas de categorías, fichas, metodología y financiación.
4. Control de estados y vigencias independiente del despliegue.
5. CMS o proceso editorial con revisión y registro de cambios; definir responsable antes de lanzamiento.
6. Analítica minimizada sin respuestas ni montos personales.

No inventar nombres de archivos del repositorio antes de inspeccionarlo. Un prototipo puede usar productos ficticios sólo si todo el entorno muestra «Datos de demostración» y no mezcla esos registros con entidades reales. Para el catálogo real usar exclusivamente el inventario documentado y excluir fixtures de compilación de producción.

### Pruebas de producto obligatorias

- Un dato N/D no se transforma en 0, ni al ordenar ni al exportar.
- Una promoción vencida desaparece del orden vigente aunque la página siga disponible.
- La falta de fecha del proveedor se muestra; no se rellena con la fecha del build.
- Empates se resuelven por nombre; cambiar patrocinio no altera el orden.
- Un resultado con un «desde» no compite como valor fijo sin etiqueta y cohorte explícita.
- Un campo en conflicto no aparece como «verificado» en otra vista.
- Comparaciones de Afores bloquean generaciones/cortes incompatibles.
- Seguros requieren mismo ramo y escenario para ordenar por prima.
- Inversiones no mezclan históricos con tasas ofrecidas ni distintas monedas/periodos.
- El IRN no sufre una segunda resta de comisiones.
- Una ficha de cuenta identifica emisor y protección aplicable; no hereda protección por nombre comercial.
- Fuentes y fechas están disponibles en listado, ficha y comparación, no únicamente en el pie de página.
- Cambios de filtros no disparan aprobación, recomendación personal ni solicitud al proveedor.
- Los textos «patrocinado» y «afiliado» aparecen antes del clic y con lector de pantalla.
- Enlace oficial verificado, sin sustitución por dominio parecido; CTA de producto retirado deshabilitado.
- Sin desbordamiento horizontal de página ni controles tapados en móvil y zoom.
- Sin registro obligatorio, patrones de urgencia ficticia, testimonios inventados ni contadores no documentados.

### Medición responsable

Eventos propuestos: categoría vista, filtro no personal utilizado, comparación iniciada, fuente abierta, ficha consultada, reporte de dato y salida a sitio oficial. No enviar ingresos, patrimonio, deudas, respuestas libres, salud, identificadores ni parámetros sensibles. Revisar scripts de terceros y política de retención antes de habilitarlos.

Indicadores de calidad: porcentaje de datos con evidencia completa, datos con revisión vigente, proporción de N/D por categoría, tiempo de corrección, enlaces de fuente funcionales, comparaciones que abren fuentes y éxito en pruebas de comprensión. Clics comerciales no son prueba de beneficio financiero del visitante.

### Puertas de salida a producción

1. Producto y navegación revisados en conjunto por Claude dentro del encargo, sin considerar el dossier un despliegue aprobado.
2. Catálogo y alcance publicados con fechas, exclusiones y fuente por dato.
3. Revisión financiera/editorial de todas las métricas y fórmulas.
4. Validación documentada de límites de asesoría, avisos, comercialización y privacidad con fuentes vigentes. Las dudas materiales bloquean la función afectada; este dossier no equivale a un dictamen profesional ni autoriza contratar servicios.
5. Responsable de las decisiones y capacidad real del flujo automatizado de actualización definidos, sin asumir nuevas contrataciones.
6. Pruebas visuales, móviles, accesibilidad y estados aprobadas.
7. Derechos de imágenes/documentos y destinos externos comprobados.
8. Autorización explícita para desplegar. Esta entrega no la sustituye.

## 14 Activos entregados

- assets/01-cat-gat.svg — diagrama conceptual de indicadores.
- assets/02-costo-credito.svg — mapa de lectura del costo y calendario de un crédito.
- assets/03-ruta-comparar.svg — recorrido educativo de comparación.
- assets/README.md — ALT, pies, usos y especificación de identidad.

Son ilustraciones vectoriales originales hechas para este dossier. No incorporan logos de terceros, fotografías, personajes, datos de mercado inventados ni tipografías embebidas. Se conservará texto alternativo y texto equivalente al integrarlas. No se autoriza su publicación por el hecho de incluirlas en este paquete.

## 15 Pendientes que deben mantenerse visibles

- Documento original de Grok no leído; confirmar cualquier inferencia estratégica antes de atribuírsela.
- Modelo comercial de medio de decisiones y licencia B2B pendiente de aprobación.
- Auditoría visual integral del sitio y estilos computados pendiente en el entorno de implementación.
- Catálogo real se incorpora desde la investigación de productos; este dossier define su estructura, no sustituye sus evidencias.
- Los límites de protección mencionados provienen de referencias oficiales indexadas; verificar directamente aplicabilidad y vigencia antes de publicar una ficha específica.
- Los plazos de revisión de datos aquí propuestos y los responsables concretos de excepciones todavía necesitan aprobación; no se promete un servicio de actualización ya operativo.
- Rutas nuevas, integración en portada y cambios de navegación son propuestas sujetas a revisión.
