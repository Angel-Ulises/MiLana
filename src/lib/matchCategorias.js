// Textos y reglas editoriales por categoría de MiLana Match (borradores de Orion, 12-10-2026, revisados para integración).
// Los criterios de orden sólo existen donde la fuente define un grupo homogéneo (misma métrica, unidad, cohorte y corte).

export const LECTURAS = {
  catGat: { href: '/aprende/cat-y-gat-que-comparan', titulo: 'CAT y GAT: qué pregunta responde cada indicador' },
  mensualidad: { href: '/aprende/mensualidad-y-costo-del-credito', titulo: 'Antes de elegir una mensualidad, revisa el resto del contrato' },
  fuentes: { href: '/aprende/leer-fuentes-comparador-financiero', titulo: 'Una ficha útil también te dice lo que no sabe' },
};

const PREGUNTAS_CREDITO = [
  '¿Estas condiciones corresponden al mismo monto, plazo y modalidad que estoy revisando?',
  '¿Qué cargos son obligatorios y cuáles opcionales?',
  '¿Qué cambia al terminar una promoción, pagar antes o cancelar?',
  '¿Dónde consulto la carátula y el contrato de mi oferta?',
];

const AVISO_CAT = 'Cada CAT es el promedio publicitario que publica la institución, con sus propios supuestos de monto, plazo y perfil. No están homologados entre sí, por eso no los ordenamos de menor a mayor ni los convertimos en tu costo personal.';

export const MATCH_CATEGORIAS = {
  hipotecas: {
    titulo: 'Compara hipotecas con el mismo punto de partida',
    lede: 'El monto, el enganche y el plazo cambian la comparación. Revisa el CAT publicado junto a los seguros, las comisiones y los costos iniciales.',
    resumen: 'CAT, enganche, plazo y costos de contratación.',
    metrica: 'CAT publicado',
    aviso: AVISO_CAT,
    ordenes: [],
    filtros: [],
    preguntas: [...PREGUNTAS_CREDITO, '¿Qué costos de escrituración, avalúo y seguros quedan fuera del CAT?'],
    lecturas: ['mensualidad', 'catGat'],
    herramientas: [['Vivienda: antes de rentar o comprar', '/finanzas/vivienda'], ['Calculadora Infonavit', '/calculadoras/infonavit'], ['Deuda y crédito', '/finanzas/deuda-y-credito']],
  },
  autos: {
    titulo: 'Revisa todo el financiamiento de tu auto',
    lede: 'La mensualidad es una parte del contrato. Compara enganche, plazo, seguro y cualquier pago final.',
    resumen: 'Financiamiento, seguros y pagos finales.',
    metrica: 'CAT publicado',
    aviso: AVISO_CAT,
    ordenes: [],
    filtros: [],
    preguntas: [...PREGUNTAS_CREDITO, '¿El seguro va financiado y existe algún pago residual al final?'],
    lecturas: ['mensualidad', 'catGat'],
    herramientas: [['Deuda y crédito', '/finanzas/deuda-y-credito'], ['Presupuesto mensual', '/finanzas/presupuesto']],
  },
  tarjetas: {
    titulo: 'Entiende lo que cobra cada tarjeta',
    lede: 'Consulta anualidad, CAT, comisiones y condiciones. Pagar todo cada mes y financiar compras son usos distintos.',
    resumen: 'Anualidad, CAT, comisiones y condiciones de uso.',
    metrica: 'CAT publicado',
    aviso: AVISO_CAT,
    ordenes: [],
    filtros: [
      { id: 'anualidad', atributo: 'sinAnualidad', tipo: 'booleano', etiqueta: 'Anualidad del titular', opciones: [['', 'Cualquiera'], ['si', 'Anualidad publicada en $0']] },
      { id: 'entidad', atributo: 'tipoEntidad', tipo: 'valor', etiqueta: 'Tipo de institución', opciones: [['', 'Cualquiera'], ['banco', 'Banco'], ['sofipo', 'Sociedad financiera popular']] },
    ],
    preguntas: [...PREGUNTAS_CREDITO, '«Sin anualidad» ¿tiene condiciones de uso o gasto mínimo?'],
    lecturas: ['catGat', 'fuentes'],
    herramientas: [['Deuda y crédito', '/finanzas/deuda-y-credito'], ['Presupuesto mensual', '/finanzas/presupuesto']],
  },
  creditos_personales: {
    titulo: 'Compara condiciones de créditos personales',
    lede: 'Revisa el monto disponible, el calendario de pagos y los costos documentados. Una tasa anunciada desde cierto nivel puede cambiar en la oferta final.',
    resumen: 'Cuánto recibes, cómo pagas y qué puede cambiar.',
    metrica: 'CAT publicado',
    aviso: AVISO_CAT,
    ordenes: [],
    filtros: [
      { id: 'entidad', atributo: 'tipoEntidad', tipo: 'valor', etiqueta: 'Tipo de institución', opciones: [['', 'Cualquiera'], ['banco', 'Banco'], ['otra', 'Otra figura']] },
    ],
    preguntas: [...PREGUNTAS_CREDITO, '¿Cuánto efectivo neto recibo después de la comisión por apertura?'],
    lecturas: ['mensualidad', 'catGat'],
    herramientas: [['Deuda y crédito', '/finanzas/deuda-y-credito'], ['Presupuesto mensual', '/finanzas/presupuesto'], ['Fondo de emergencia', '/finanzas/fondo-emergencia']],
  },
  cuentas: {
    titulo: 'Compara cómo se usa y cuánto cuesta una cuenta',
    lede: 'Revisa saldo mínimo, mantenimiento, retiros, transferencias y límites. Identifica también qué entidad recibe tu dinero.',
    resumen: 'Comisiones, límites y disponibilidad de tu dinero.',
    metrica: null,
    aviso: 'Las cuentas no tienen un indicador único: el costo depende de cómo las usas. Por eso mostramos cada comisión por separado, sin sumarlas en un costo anual inventado.',
    ordenes: [],
    filtros: [],
    preguntas: ['¿Qué comisiones aplican a los retiros, transferencias y reposiciones que yo haría?', '¿Hay límites de depósito mensual por nivel de cuenta?', '¿Qué entidad recibe el saldo y qué protección aplica a ese producto?'],
    lecturas: ['fuentes'],
    herramientas: [['Presupuesto mensual', '/finanzas/presupuesto'], ['Fondo de emergencia', '/finanzas/fondo-emergencia']],
  },
  ahorro: {
    titulo: 'Mira el rendimiento junto a la disponibilidad',
    lede: 'La tasa, el plazo, los topes y la protección aplicable forman parte de la misma decisión. Las promociones tienen condiciones.',
    resumen: 'Rendimientos publicados, liquidez y protección aplicable.',
    metrica: 'GAT nominal',
    aviso: 'La GAT se publica antes de impuestos y depende del plazo y monto del ejemplo. Un depósito disponible a diario y uno a 360 días no se ordenan en la misma lista.',
    ordenes: [],
    filtros: [
      { id: 'disponibilidad', atributo: 'disponibilidad', tipo: 'valor', etiqueta: 'Disponibilidad', opciones: [['', 'Cualquiera'], ['diaria', 'Disponible a diario'], ['plazo', 'A plazo fijo']] },
    ],
    preguntas: ['¿La tasa aplica a todo mi saldo o sólo hasta un tope?', '¿Qué pasa si retiro antes del plazo?', '¿La tasa cambia al terminar una promoción o al renovar?', '¿Qué esquema de protección aplica a esta entidad y producto?'],
    lecturas: ['catGat', 'fuentes'],
    herramientas: [['Meta de ahorro', '/finanzas/ahorro'], ['Fondo de emergencia', '/finanzas/fondo-emergencia'], ['CETES de referencia', '/finanzas/inversion/cetes']],
  },
  inversion: {
    titulo: 'Compara instrumentos con su riesgo a la vista',
    lede: 'Empieza por el tipo de inversión. Consulta costos, liquidez, documentos y rendimientos del mismo periodo cuando sean comparables.',
    resumen: 'Instrumentos, riesgos, costos y periodos de rendimiento.',
    metrica: 'Indicador propio de cada instrumento',
    aviso: 'Una tasa de CETES, un rendimiento histórico de fondo y una tasa variable de liquidez miden cosas distintas. Cada ficha muestra su propio indicador, con su periodo; no los ordenamos entre sí.',
    ordenes: [],
    filtros: [
      { id: 'instrumento', atributo: 'instrumento', tipo: 'valor', etiqueta: 'Instrumento', opciones: [['', 'Cualquiera'], ['Deuda gubernamental', 'Deuda gubernamental'], ['Fondo de deuda', 'Fondo de deuda'], ['Liquidez en casa de bolsa', 'Liquidez en casa de bolsa']] },
    ],
    preguntas: ['¿El rendimiento mostrado es histórico u ofrecido, bruto o neto?', '¿Cuándo puedo disponer del dinero y con qué costo?', '¿Quién custodia los valores y qué comisiones cobra el intermediario?'],
    lecturas: ['catGat', 'fuentes'],
    herramientas: [['Antes de invertir', '/finanzas/inversion'], ['Comparar tipos de instrumentos', '/finanzas/inversion/comparar'], ['CETES de referencia', '/finanzas/inversion/cetes']],
  },
  seguros: {
    titulo: 'Lee qué cubre cada seguro',
    lede: 'Elige un ramo y revisa coberturas, exclusiones, deducibles y condiciones. Las primas sólo se comparan con escenarios equivalentes.',
    resumen: 'Coberturas, exclusiones, deducibles y condiciones.',
    metrica: 'Prima',
    aviso: 'Ninguna de estas pólizas tiene una prima publicada comparable: requiere cotización individual. Comparamos coberturas y condiciones dentro del mismo ramo, sin ordenar por precio.',
    ordenes: [],
    filtros: [
      { id: 'ramo', atributo: 'ramo', tipo: 'valor', etiqueta: 'Ramo', opciones: [['', 'Todos los ramos'], ['Vida temporal', 'Vida temporal'], ['Gastos médicos mayores', 'Gastos médicos mayores'], ['Auto, cobertura amplia', 'Auto, cobertura amplia']] },
    ],
    preguntas: ['¿Qué exclusiones y periodos de espera aplican a mi caso?', '¿Cómo se calcula el deducible y el coaseguro?', '¿La prima cambia al renovar y qué pasa si pago en parcialidades?'],
    lecturas: ['fuentes'],
    herramientas: [['Mi situación financiera', '/finanzas/mi-situacion'], ['Fondo de emergencia', '/finanzas/fondo-emergencia']],
    agrupar: 'ramo',
  },
  afores: {
    titulo: 'Compara tu generación con la misma fecha de corte',
    lede: 'Consulta IRN, comisiones y servicios. Los rendimientos pasados no aseguran resultados futuros.',
    resumen: 'IRN y comisión de la misma generación y corte.',
    metrica: 'IRN',
    aviso: 'Las diez administradoras comparten generación (Siefore Básica 90–94), corte (agosto de 2026) y metodología de CONSAR. El IRN ya descuenta comisiones: no las restes otra vez. Es histórico y no recomienda traspasos.',
    ordenes: [
      { clave: 'irn', direccion: 'desc', etiqueta: 'IRN histórico, de mayor a menor' },
      { clave: 'comision_saldo', direccion: 'asc', etiqueta: 'Comisión sobre saldo, de menor a mayor' },
    ],
    filtros: [],
    preguntas: ['¿En qué Siefore generacional estoy según mi año de nacimiento?', '¿Qué servicios y canales de atención ofrece la administradora?', '¿Qué implica un traspaso y cuándo puedo hacerlo?'],
    lecturas: ['fuentes'],
    herramientas: [['Pensión IMSS', '/calculadoras/pension-imss'], ['Guía Pensión IMSS Ley 97', '/aprende/pension-imss-ley-97']],
  },
};

export const ORDEN_NOMBRE = { clave: 'nombre', etiqueta: 'Nombre de la institución (A–Z)' };
