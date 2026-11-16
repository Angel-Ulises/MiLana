# Ideas pendientes para MiLana (lista de trabajo)

> **Estado:** solo ideas. Nada de esta lista está implementado ni aprobado. Ángel decide cuáles se hacen y en qué orden. Reunidas el 16 de noviembre de 2026.

## Cómo usar esta lista

- Cada idea tiene un código (A1, B3…) para poder pedirla por nombre.
- **Tipo:** `calc` (calculadora), `guía` (contenido), `sitio` (navegación o diseño), `dato` (depende de cifras que caducan).
- **Fuente:** `ley` significa que se puede verificar en diputados.gob.mx, gob.mx, INEGI, SAT, DOF o IMSS, que sí se alcanzan desde el entorno de trabajo. `delegada` significa que la fuente (Condusef, Buró, Consar, bancos) no se alcanza y alguien debe pasar el texto oficial, como se hizo con las Afores.

## Reglas que siguen vigentes (no negociables sin Ángel)

- Producción es la rama `claude/cloudflare-pages`, no `main`.
- Verificar cada cifra y cada artículo en la fuente oficial, no de memoria. No presentar nada como validado por un contador o abogado.
- No publicar nombre ni domicilio personal; no inventar responsable del aviso de privacidad.
- No pedir revisión de AdSense. No aplicar poda ni `noindex` (las 57 URLs siguen pendientes de decisión).
- No detectar salario mínimo automáticamente por el monto.
- Los eventos de medición no llevan importes ni datos personales. Hoy no se guarda nada en el dispositivo; cambiarlo requiere visto bueno de Ángel.
- Principios de diseño: celular primero, resultado antes que explicación, lenguaje de persona, una sola acción clara por pantalla, sin saturar.
- Build completo con `CI=true MILANA_CHROME=<ruta de Chrome>` para que las pruebas de navegador no se omitan.

## Ya hecho (no repetir)

Pago por semana/quincena/mes, «Escuchar», «¿Y si no me lo pagan?», comas de miles, «¿Me pagaron bien?» en aguinaldo (con diferencia y tolerancia), títulos en lenguaje sencillo, pie de página corto, guía `/aprende/fechas-de-pago`, secciones plegadas en páginas largas. Ya existe `/aprende/leer-recibo-nomina`.

---

## A. Gente que hoy queda fuera

| Código | Idea | Tipo | Fuente |
|---|---|---|---|
| A1 | Horas extra, días festivos y prima dominical: «¿cuánto me deben?» | calc | ley |
| A2 | Trabajadoras del hogar: aguinaldo, vacaciones, IMSS | calc + guía | ley |
| A3 | Repartidores y choferes de plataformas: derechos nuevos, PTU | guía | ley |
| A4 | Incapacidad y maternidad: cuánto paga el IMSS y desde qué día | calc | ley (conviene contador) |
| A5 | «¿Me pagan menos del salario mínimo?» por zona y oficio | calc | ley |
| A6 | Patrón chico: «¿cuánto me cuesta de verdad un empleado?» | calc | ley (conviene contador) |
| A7 | Adultos mayores: Modalidad 40, Ley 73 contra Ley 97, Pensión Bienestar | guía | ley + delegada |
| A8 | Primer trabajo: qué revisar antes de firmar, qué pedir, primer recibo | guía | ley |
| A9 | El que vende sin estar dado de alta: qué gana y cuánto paga si se registra | guía + calc | ley |
| A10 | Propinas y comisiones: ¿cuentan para aguinaldo y finiquito? | guía | ley |
| A11 | Jornaleros y trabajo del campo | guía | ley |
| A12 | Mexicanos en Estados Unidos o que regresaron: Afore, semanas IMSS | guía | delegada |

## B. Acompañar después del resultado

| Código | Idea | Tipo |
|---|---|---|
| B1 | «¿Qué hago ahora?» paso a paso para despido, renuncia o falta de pago | guía |
| B2 | Carta lista para copiar a nómina o al patrón, con tus cifras; se arma en el celular | sitio |
| B3 | Guardar o imprimir el resultado en una hoja limpia | sitio |
| B4 | Extender «¿Me pagaron bien?» a finiquito, vacaciones y utilidades | calc |
| B5 | Comparte en imagen: tarjeta con el resultado para WhatsApp o estados | sitio |
| B6 | Botón «¿Encontraste un error?» que abre un correo con la página ya anotada | sitio |

## C. Que la página sepa quién eres (sin pedir datos)

| Código | Idea | Tipo |
|---|---|---|
| C1 | «¿Quién eres?» en la portada: empleado, por mi cuenta, negocio chico, estudiante, ama de casa, jubilado. Cada uno con su portada de 4 o 5 cosas | sitio |
| C2 | Entradas por momento de vida: bebé, boda, muerte de un familiar, independizarme, dinero extra | sitio + guía |
| C3 | Página «Empieza aquí» para quien llega sin duda concreta | sitio |
| C4 | «Tu dinero en 2 minutos»: cinco preguntas sin montos exactos y tres acciones en orden | calc |

## D. Lo que falta para ser «financiera total»

| Código | Idea | Tipo | Fuente |
|---|---|---|---|
| D1 | Deudas: «pago el mínimo, ¿cuándo termino?» y «¿cuál pago primero?» | calc | propia |
| D2 | Buró de crédito sin miedo: qué es, consulta gratis, cuánto dura una mancha, cobradores | guía | delegada |
| D3 | Tandas, cajas de ahorro y préstamos de nómina contra opciones formales, con costo real | calc + guía | propia |
| D4 | Fraudes del momento: montadeudas, inversiones milagro, llamadas del «banco» | guía | delegada |
| D5 | Compras grandes: «¿me alcanza para este carro, casa o celular a meses?» | calc | propia |
| D6 | Seguros que ya tienes sin saberlo (IMSS, tarjeta, Afore) | guía | delegada |
| D7 | Localiza tu Afore y tu Infonavit, y qué revisar | guía | delegada |
| D8 | Cuando alguien muere: qué dinero le toca a la familia y cómo cobrarlo | guía | ley + delegada |
| D9 | Remesas: cuánto llega de verdad después de comisión y tipo de cambio | calc | dato |
| D10 | Declaración anual en sencillo: «¿me toca?, ¿me devuelven?» | guía + calc | ley (conviene contador) |
| D11 | Inflación personal: «lo que comprabas con $1,000 en tal año hoy cuesta…» | calc | dato INEGI |
| D12 | «¿Mi aumento le ganó a la inflación?» | calc | dato INEGI |
| D13 | Comparar dos ofertas de trabajo: neto más prestaciones | calc | propia |
| D14 | De neto a bruto: «quiero que me lleguen $X, ¿cuánto pido?» | calc | propia |
| D15 | «¿Me alcanza si me mudo a tal estado?» usando los datos de Estados | calc | dato existente |
| D16 | Meta de ahorro: cuánto apartar y en cuánto tiempo | calc | propia |
| D17 | Retiro simple: «si ahorro tanto, ¿cuánto junto?» sin prometer rendimientos | calc | propia |
| D18 | «¿Cuántas horas de trabajo me cuesta esto?» | calc | propia |
| D19 | Pensión alimenticia: orientación de cómo se fija y qué cuenta | guía | ley (varía por estado) |

## E. Que se queden y regresen

| Código | Idea | Tipo |
|---|---|---|
| E1 | El dato del día en la portada: días para el aguinaldo, tipo de cambio, próximo aumento | sitio + dato |
| E2 | Portada por temporada: diciembre aguinaldo, abril declaración, mayo utilidades | sitio |
| E3 | Calendario del año del trabajador: festivos oficiales, pagos, declaración | guía |
| E4 | «Mi lista»: lo calculado queda solo en tu celular, sin cuenta. **Requiere visto bueno de privacidad** | sitio |
| E5 | Reto de 30 días: una acción chiquita diaria | guía |
| E6 | Preguntas de la gente: una página por pregunta real, cinco líneas | guía |
| E7 | Quiz «¿Cuánto sabes de tu dinero?» para compartir | sitio |
| E8 | «Lo más consultado» fijo por temporada (sin rastrear a nadie) | sitio |
| E9 | Instalable como app en el celular y que las calculadoras funcionen sin internet | sitio |
| E10 | Modo ligero para quien tiene pocos datos: sin fotos ni fuentes externas | sitio |
| E11 | Canal de WhatsApp de MiLana con el aviso de cada temporada (lo abre Ángel) | fuera del sitio |

## F. Que cualquiera lo entienda

| Código | Idea | Tipo |
|---|---|---|
| F1 | Diccionario de bolsillo: 30 palabras en una línea cada una, con ejemplo | guía |
| F2 | Recibo de nómina interactivo: tocas cada renglón y te dice qué es | sitio |
| F3 | Mitos comunes con respuesta corta y artículo de la ley | guía |
| F4 | Todo con un ejemplo de persona («Lupita gana $9,000…»), marcado como ejemplo | guía |
| F5 | «Escuchar» también en las guías | sitio |
| F6 | Traducir cifras a cosas conocidas («equivale a tres semanas de despensa») | guía |
| F7 | Botón «explícamelo más fácil»: versión de tres renglones en cada guía | sitio |
| F8 | Dibujos o esquemas simples en lugar de párrafos donde se pueda | sitio |
| F9 | Modo oscuro y alto contraste | sitio |

## G. Confianza y alcance

| Código | Idea | Tipo |
|---|---|---|
| G1 | Bitácora pública de correcciones: qué se corrigió y cuándo | guía |
| G2 | En cada cifra, fecha y fuente a un toque | sitio |
| G3 | Sello «revisado por…» solo cuando un contador o abogado real lo revise | sitio |
| G4 | Cartel imprimible con código QR para pegar en el trabajo o el sindicato | sitio |
| G5 | Promover los widgets entre sindicatos, contadores, RH y medios locales | fuera del sitio |
| G6 | Página para periodistas con datos citables y cómo citar | guía |

## H. Ser referencia (que otros citen a MiLana)

| Código | Idea | Tipo | Fuente |
|---|---|---|---|
| H1 | «Tablas del año»: ISR, subsidio, UMA, salario mínimo y cuotas IMSS en una sola página, con fecha y fuente | guía | ley |
| H2 | Históricos con gráfica: salario mínimo, UMA e inflación por año | guía | dato INEGI/DOF |
| H3 | «Qué cambió este año» en trabajo e impuestos, en una página por año | guía | ley |
| H4 | Reformas en curso: qué ya es ley y qué sigue en discusión (jornada, aguinaldo, etc.), sin adelantar nada | guía | ley (DOF, Diputados) |
| H5 | La ley en sencillo: una página por artículo clave («Artículo 87: aguinaldo») con el texto oficial y la explicación | guía | ley |
| H6 | Glosario con una dirección por palabra, para que se pueda enlazar cada definición | guía | propia |
| H7 | «Así comprobamos»: por calculadora, casos de prueba públicos con el resultado esperado | guía | propia |
| H8 | Comparación documentada contra simuladores oficiales (SAT, IMSS) donde existan | guía | delegada |
| H9 | Tablero público de vigencias: qué tan al día está cada dato del sitio | sitio | propia |
| H10 | Datos abiertos: descargar las tablas en hoja de cálculo, con «cómo citar a MiLana» | sitio | propia |
| H11 | Informe anual «Cuánto gana México» con datos del INEGI, citable por medios | guía | dato INEGI |
| H12 | «¿A dónde voy?» por estado: Procuraduría del trabajo, centros de conciliación, Condusef, SAT, con datos verificados | guía | ley + delegada |
| H13 | Colaboradores y revisores reales con nombre, cuando existan | sitio | — |
| H14 | Cierre de año: lista fija de lo que cambia cada enero (UMA, salario mínimo, tablas) y quién lo actualiza | interno | ley |

## I. Que te encuentren (buscadores y asistentes de IA)

| Código | Idea | Tipo |
|---|---|---|
| I1 | Respuesta directa al inicio de cada página: la primera línea contesta la pregunta | sitio |
| I2 | Títulos escritos como la pregunta que hace la gente | sitio |
| I3 | Páginas por oficio: «¿cuánto gana un albañil, una enfermera?» con los datos de ocupaciones que ya existen | guía |
| I4 | Unas pocas páginas por monto muy buscado («aguinaldo con sueldo de $10,000»), con explicación real, no relleno | guía |
| I5 | Preguntas frecuentes marcadas para buscadores en cada calculadora | sitio |
| I6 | Preparar el sitio para asistentes de IA: resúmenes claros, datos marcados y un archivo guía para que citen a MiLana | sitio |
| I7 | Imagen para compartir propia de cada página y cada resultado | sitio |
| I8 | «Siguiente duda»: al final de cada página, la pregunta que normalmente sigue | sitio |
| I9 | Medir y cuidar la velocidad en celulares lentos | sitio |
| I10 | Páginas clave en inglés para mexicanos en Estados Unidos | guía |

## J. Sostener el sitio (decisiones de Ángel)

| Código | Idea | Nota |
|---|---|---|
| J1 | «¿Te sirvió? Sí / No» de un toque, sin datos personales, para saber qué mejorar | Solo cuenta toques |
| J2 | Donativos voluntarios | Requiere una cuenta de Ángel |
| J3 | Patrocinio transparente y etiquetado | Cuidar la independencia |
| J4 | Widgets con la marca de contadores, sindicatos o despachos | Es vender un servicio |
| J5 | Boletín por correo | Recoge correos: cambia el aviso de privacidad |
| J6 | Alianzas con universidades u organizaciones para revisar contenido | Da el sello real de G3 |
| J7 | Enlaces de afiliado | Riesgo para la credibilidad; solo etiquetados, o no hacerlo |

## K. Contenido vivo y comunidad

| Código | Idea | Tipo |
|---|---|---|
| K1 | «Pregúntale a MiLana»: la gente manda su duda por correo y las respuestas se publican sin nombres | guía |
| K2 | Casos reales contados con permiso y sin datos que identifiquen | guía |
| K3 | Guiones cortos para video y audio sacados de cada guía | fuera del sitio |
| K4 | Infografías descargables de cada tema | sitio |
| K5 | Kit para maestros: una clase de dinero lista para secundaria y prepa | guía |
| K6 | Kit para sindicatos y Recursos Humanos: hoja para explicar el aguinaldo, las utilidades, el recibo | guía |

## L. Mejoras de producto que cruzan todo el sitio

| Código | Idea | Tipo |
|---|---|---|
| L1 | «Mi panorama»: escribes sueldo y fecha de ingreso una vez y ves aguinaldo, vacaciones, lo que te llega y el tope de utilidades juntos | calc |
| L2 | Línea de tiempo personal: con tu fecha de ingreso, cuándo te tocan vacaciones, aniversario y cada pago | calc |
| L3 | «Agregar a mi calendario»: un archivo con la fecha del aguinaldo o las utilidades; no guarda nada en el sitio | sitio |
| L4 | «¿Y si…?»: mover el sueldo o los días y ver cómo cambia el resultado | calc |
| L5 | Dibujo de a dónde se va tu sueldo: lo que te llega, impuesto, IMSS | calc |
| L6 | El sueldo que escribes se conserva al pasar de una calculadora a otra en la misma visita | sitio |
| L7 | El buscador como entrada principal: escribes «me despidieron» y te lleva | sitio |
| L8 | «¿Qué te pasó?» guiado en todo el sitio, no solo en calculadoras | sitio |
| L9 | Revisión completa con lector de pantalla y teclado | sitio |
| L10 | Audio en lenguas indígenas para las guías principales | guía |

## M. Nichos por oficio o forma de trabajo

Cada uno sería una portada corta («Si trabajas en…») que reúne lo que ya existe y agrega lo propio del oficio.

| Código | Idea | Lo propio del nicho | Fuente |
|---|---|---|---|
| M1 | Gobierno y maestros | Otra ley (apartado B), ISSSTE, aguinaldo distinto | ley |
| M2 | Salud | Guardias, turnos de noche, jornadas acumuladas | ley |
| M3 | Construcción | Contrato por obra, IMSS por obra, utilidades | ley |
| M4 | Fábrica y maquila | Turnos, bonos de asistencia y puntualidad, paros técnicos | ley |
| M5 | Tiendas y restaurantes | Comisiones, propinas, descanso semanal | ley |
| M6 | Choferes y transporte | Pago por viaje o por kilómetro | ley |
| M7 | Seguridad privada | Jornadas de 12 y 24 horas | ley |
| M8 | Subcontratados y call centers | Quién es tu patrón de verdad, utilidades | ley |
| M9 | Independientes y creadores | Qué régimen conviene, cómo cobrar, plataformas | ley (conviene contador) |
| M10 | Comerciantes | RESICO, comisiones de la terminal de cobro | ley + dato |
| M11 | Eventuales y por temporada | Parte proporcional, utilidades desde 60 días | ley |
| M12 | Medio tiempo y por horas | Prestaciones proporcionales | ley |
| M13 | Trabajo desde casa | Qué debe pagar el patrón (luz, internet, equipo) | ley |
| M14 | Becarios y practicantes | Cuándo es práctica y cuándo ya es trabajo | ley |
| M15 | Puestos de confianza | Qué cambia en utilidades y despido | ley |

## N. Quien llega asustado o enojado

Hoy el sitio habla a quien tiene calma para calcular. Mucha gente llega el día que la despidieron.

| Código | Idea | Tipo | Fuente |
|---|---|---|---|
| N1 | Botón «Me acaban de despedir» en la portada: cinco cosas en orden y qué no firmar | guía | ley |
| N2 | Cuenta regresiva de plazos: pones la fecha del despido y te dice hasta qué día puedes reclamar, con sus salvedades | calc | ley |
| N3 | «Me ofrecen $X, ¿es justo?»: compara la oferta contra el estimado de finiquito o liquidación | calc | propia |
| N4 | «Me quieren hacer firmar mi renuncia» | guía | ley |
| N5 | «No me han pagado» y «me descontaron de más» | guía | ley |
| N6 | La conciliación paso a paso: qué es, cuánto tarda, qué llevar | guía | ley |
| N7 | Lista de papeles para llevar a la Procuraduría, para imprimir | guía | ley + delegada |
| N8 | Embarazo y despido | guía | ley |
| N9 | Accidente de trabajo: primeros pasos | guía | ley (conviene abogado) |
| N10 | Acoso o violencia en el trabajo: a dónde acudir | guía | delegada |
| N11 | «No puedo pagar mis deudas»: qué hacer y qué no pueden hacerte los cobradores | guía | delegada |
| N12 | Emergencia de dinero: opciones de menos a más caras (incluye el costo de retirar de la Afore) | guía | delegada |
| N13 | Tono de calma en estas páginas: frases cortas, un paso a la vez, sin distracciones | sitio | — |

## O. Ordenar antes de crecer

Con más de cien ideas, el riesgo es volver al sitio saturado que ya limpiamos. Esto va primero o en paralelo.

| Código | Idea | Tipo |
|---|---|---|
| O1 | Reorganizar el menú por necesidad, no por tipo de página: Mi trabajo, Mis impuestos, Mi dinero, Mi futuro | sitio |
| O2 | Una página por tema («Todo sobre el aguinaldo») que junte calculadora, guía, fechas y mitos | sitio |
| O3 | Fusionar Aprende y Situaciones dentro de cada tema | sitio |
| O4 | Menú del celular de cinco opciones o menos | sitio |
| O5 | Resolver lo pendiente antes de sumar: Match y las 57 URLs, plantillas repetidas de Estados y Profesiones | decisión |
| O6 | Regla «entra una, se revisa otra»: cada página nueva obliga a revisar una vieja | interno |
| O7 | Una sola plantilla para guías y otra para calculadoras | sitio |
| O8 | Un solo pie de página y encabezado en el código (hoy está repetido en unos 18 archivos) | interno |
| O9 | Una sola rama principal: `main` sigue atrasada | interno |
| O10 | Guía de redacción escrita y una prueba automática de lectura fácil | interno |
| O11 | Probar con cinco personas reales y ver dónde se atoran | fuera del sitio |
| O12 | Terminar la medición (dimensiones de GA4) para saber qué se usa antes de construir más | decisión |
| O13 | Retirar o fusionar lo que nadie usa, ya con datos | decisión |

## P. Dinero de la familia

| Código | Idea | Tipo | Fuente |
|---|---|---|---|
| P1 | ¿Cuánto cuesta un bebé el primer año? Con tus propios números | calc | propia |
| P2 | Dinero en pareja: repartir gastos según lo que gana cada quien | calc | propia |
| P3 | ¿Rentar o comprar casa? | calc | propia |
| P4 | Regreso a clases y colegiaturas: presupuesto y qué se puede deducir | guía + calc | ley (conviene contador) |
| P5 | Fiestas sin deuda: Navidad, XV años, boda | calc | propia |
| P6 | Reparte tu aguinaldo: deuda cara primero, luego colchón, luego gusto | calc | propia |
| P7 | Gasto hormiga: cuánto suma al año lo chiquito de cada día | calc | propia |
| P8 | Presupuesto por semana o quincena (adaptar el que ya existe) | calc | propia |
| P9 | Cuidar a los papás: cómo darlos de alta en tu IMSS y qué cubre | guía | ley IMSS |
| P10 | Permiso de paternidad, lactancia y guardería del IMSS | guía | ley |
| P11 | Beneficiarios al día: Afore, banco y seguro; y el testamento | guía | delegada |
| P12 | Separación o divorcio: qué pasa con el dinero (varía por estado) | guía | ley estatal |
| P13 | Enseñar dinero a los hijos: mesada y primeras metas | guía | propia |
| P14 | ¿Vale la pena esa carrera? Costo de estudiar contra lo que se gana (une con Carreras) | calc | dato existente |
| P15 | Apoyos y becas del gobierno: cuáles existen y dónde se piden | guía | dato gob.mx |
| P16 | Recibo de luz en sencillo y por qué sube de tarifa | guía | delegada |
| P17 | Precio por unidad: ¿cuál presentación sale más barata? | calc | propia |

## Q. Dinero del negocio chico

| Código | Idea | Tipo | Fuente |
|---|---|---|---|
| Q1 | ¿A cuánto debo vender? Costo más ganancia | calc | propia |
| Q2 | ¿Cuánto tengo que vender para no perder? | calc | propia |
| Q3 | Separa el dinero del negocio del tuyo y «págate un sueldo» | guía | propia |
| Q4 | Terminal de cobro: cuánto se queda en comisión, con tu tasa | calc | propia |
| Q5 | ¿Me conviene este préstamo para el negocio? Costo total | calc | propia |
| Q6 | Darme de alta en el SAT paso a paso | guía | ley SAT |
| Q7 | Mi primer empleado: qué me toca hacer (une con A6) | guía | ley |
| Q8 | Factura e IVA en sencillo | guía | ley (conviene contador) |
| Q9 | Vender por redes o plataformas: comisiones y retenciones | guía | ley |
| Q10 | Fiar y cobrar: control sencillo | guía | propia |
| Q11 | Meses buenos y meses malos: planear el dinero del año | calc | propia |
| Q12 | Corte de caja diario, hoja para imprimir | sitio | propia |
| Q13 | Mercancía y merma: cuánto pierdo sin darme cuenta | calc | propia |
| Q14 | Cerrar el negocio y darse de baja | guía | ley SAT |

## R. Ideas poco comunes (para que hablen de MiLana)

| Código | Idea | Tipo | Fuente |
|---|---|---|---|
| R1 | Formal contra informal, en pesos: lo que ganas o pierdes en IMSS, Infonavit, aguinaldo y retiro | calc | ley |
| R2 | «¿Qué lugar ocupo?»: tu ingreso frente al del resto del país | calc | dato INEGI |
| R3 | ¿Cuánto vale esa prestación? Vales, fondo de ahorro y seguro convertidos a pesos (une con D13) | calc | propia |
| R4 | Meses sin intereses o de contado con descuento: ¿qué conviene? | calc | propia |
| R5 | Costo real del carro por mes: gasolina, seguro, tenencia, servicio | calc | propia |
| R6 | El reloj de tu sueldo: cuánto ganas por hora y por minuto | calc | propia |
| R7 | Tu sueldo en el tiempo: lo que valía hace cinco años (une con D11) | calc | dato INEGI |
| R8 | El costo de esperar: cada año sin ahorrar para el retiro, sin prometer rendimientos | calc | propia |
| R9 | «Trabajas hasta tal día del año para pagar tus impuestos» | calc | propia |
| R10 | Traductor de recibo: escribes las claves de tu recibo y te dice qué es cada una | sitio | ley SAT |
| R11 | ¿Mi municipio es zona frontera? Para saber qué salario mínimo aplica | calc | ley (DOF) |
| R12 | Tarjeta «Mis derechos» de bolsillo, para guardar como imagen | sitio | ley |
| R13 | Cada guía como mensaje de cinco líneas para reenviar por WhatsApp | sitio | propia |
| R14 | Modo «para leerle a alguien»: pasos grandes y audio, para ayudar a un familiar | sitio | propia |
| R15 | ¿Es estafa? Lista de señales para ofertas de inversión o de empleo | calc | delegada |
| R16 | Antes de pedir prestado: tres preguntas y el costo total | calc | propia |
| R17 | Juego corto de decisiones: primer trabajo, primera tarjeta, primera renta | sitio | propia |
| R18 | Calendario de quincenas y puentes del año | guía | ley |

---

## Orden sugerido

**Antes de todo:** O11 (probar con cinco personas) y O12 (terminar la medición). Sin eso se construye a ciegas. O1 y O2 deciden dónde vive cada idea nueva.

1. **Primera tanda (aprovecha lo ya construido, sin datos que caduquen):** A1, B1, B4.
2. **Segunda tanda (el salto a «financiera total»):** C1, D1, C4.
3. **Tercera tanda (motivos para volver, baratas):** E1, E2, F1, F3.
4. **Después:** D13, D14, D11, D12, A2, A8, E9.
5. **Para ser referencia:** H1, H5, H7, I1, L1, H9. Son las que hacen que otros enlacen y citen a MiLana.
6. **Para que hablen del sitio:** R1, R2, N2, L1, P6. Son las más fáciles de compartir.

## Avisos

- **Datos que caducan** (D9, E1 y cualquier comparador de productos): hacerlas como calculadora con los números de la persona, no como catálogo. Ya se vio con Match lo que cuesta mantener cifras de terceros.
- **Conviene contador antes de publicar:** A4, A6, D10.
- **Fuente delegada:** A7, A12, D2, D4, D6, D7, D8. Sin el texto oficial en mano no se publican.
- **Reformas (H4):** solo lo publicado en el DOF es ley; lo demás se marca como «en discusión» con su fecha.
- **No rellenar (I3, I4):** pocas páginas y con contenido propio; muchas páginas casi iguales dañan al sitio (ver la propuesta de poda).
- **Plazos (N2):** el plazo puede suspenderse durante la conciliación; la herramienta debe decirlo y no dar una fecha como definitiva.
- **Crisis (N):** no prometer resultados ni sustituir asesoría; siempre remitir a la Procuraduría gratuita.
- **Comparaciones con el país (R2, R7, H11):** usar el dato del INEGI con su año y su definición exacta; no mezclar ingreso por persona con ingreso por hogar.
- **Retiro e inversión (D17, R8):** nunca prometer rendimientos; usar supuestos visibles que la persona pueda cambiar.
- **Privacidad:** E4 y cualquier cosa que guarde algo en el dispositivo necesita decisión de Ángel y ajuste del aviso de privacidad.
