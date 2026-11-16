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

---

## Orden sugerido

1. **Primera tanda (aprovecha lo ya construido, sin datos que caduquen):** A1, B1, B4.
2. **Segunda tanda (el salto a «financiera total»):** C1, D1, C4.
3. **Tercera tanda (motivos para volver, baratas):** E1, E2, F1, F3.
4. **Después:** D13, D14, D11, D12, A2, A8, E9.

## Avisos

- **Datos que caducan** (D9, E1 y cualquier comparador de productos): hacerlas como calculadora con los números de la persona, no como catálogo. Ya se vio con Match lo que cuesta mantener cifras de terceros.
- **Conviene contador antes de publicar:** A4, A6, D10.
- **Fuente delegada:** A7, A12, D2, D4, D6, D7, D8. Sin el texto oficial en mano no se publican.
- **Privacidad:** E4 y cualquier cosa que guarde algo en el dispositivo necesita decisión de Ángel y ajuste del aviso de privacidad.
