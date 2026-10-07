// Rutas deterministas: no requieren IA, API, cookies ni guardar datos personales.
// Enlazar solo páginas existentes; las opciones no son recomendaciones financieras.
export const TEMAS_EXPLORADOR = [
  {
    id: 'dinero',
    titulo: 'Organizar mi dinero',
    bajada: 'Ingresos, gastos, deudas y respaldo',
    pregunta: '¿Qué necesitas aclarar primero?',
    opciones: [
      {
        id: 'flujo', titulo: 'No sé cuánto me queda',
        explicacion: 'Primero identifica cuánto entra y sale; después conecta ese resultado con tus metas.',
        principal: { titulo: 'Armar mi presupuesto', href: '/finanzas/presupuesto', detalle: 'Captura ingresos y gastos reales. Los campos vacíos no se toman como cero.' },
        relacionadas: [
          { titulo: 'Analizar toda mi situación', href: '/finanzas/mi-situacion' },
          { titulo: 'Convertir el disponible en ahorro', href: '/finanzas/ahorro' },
        ],
      },
      {
        id: 'respaldo', titulo: 'Quiero estar preparado',
        explicacion: 'Separa lo que necesitas para gastos esenciales de tus metas de más largo plazo.',
        principal: { titulo: 'Explorar mi fondo de emergencia', href: '/finanzas/fondo-emergencia', detalle: 'Conoce la referencia educativa de gastos esenciales y haz tus propios escenarios.' },
        relacionadas: [
          { titulo: 'Revisar mi presupuesto', href: '/finanzas/presupuesto' },
          { titulo: 'Analizar mi situación completa', href: '/finanzas/mi-situacion' },
        ],
      },
      {
        id: 'deudas', titulo: 'Mis deudas me preocupan',
        explicacion: 'Empieza por visualizar los pagos que ya comprometen tu ingreso antes de asumir otra obligación.',
        principal: { titulo: 'Revisar deuda y crédito', href: '/finanzas/deuda-y-credito', detalle: 'Compara el peso de las mensualidades sin calificarte ni prometer aprobación.' },
        relacionadas: [
          { titulo: 'Ver mi flujo completo', href: '/finanzas/presupuesto' },
          { titulo: 'Entender mi situación', href: '/finanzas/mi-situacion' },
        ],
      },
    ],
  },
  {
    id: 'carrera',
    titulo: 'Elegir carrera o empleo',
    bajada: 'Ingresos, ocupación y diferencias entre estados',
    pregunta: '¿Qué comparación te ayudaría?',
    opciones: [
      {
        id: 'eleccion', titulo: 'Estoy entre dos carreras',
        explicacion: 'Un ingreso promedio es solo una señal; también importa cuántas personas están ocupadas.',
        principal: { titulo: 'Comparar carreras con contexto', href: '/carreras/comparar', detalle: 'Contrasta indicadores publicados sin confundir promedio con sueldo inicial.' },
        relacionadas: [
          { titulo: 'Explorar carreras mejor pagadas', href: '/carreras/mejor-pagadas' },
          { titulo: 'Entender las ocupaciones', href: '/carreras/ocupaciones' },
        ],
      },
      {
        id: 'estado', titulo: 'Me interesa mi estado',
        explicacion: 'El promedio nacional puede ocultar diferencias regionales importantes.',
        principal: { titulo: 'Ver salarios por estado', href: '/carreras/por-estado', detalle: 'Compara la información pública disponible por entidad y su corte temporal.' },
        relacionadas: [
          { titulo: 'Comparar estados', href: '/estados/comparar' },
          { titulo: 'Explorar profesiones', href: '/carreras' },
        ],
      },
      {
        id: 'neto', titulo: 'Quiero entender un sueldo',
        explicacion: 'Un salario anunciado no es necesariamente lo que llegará a tu cuenta.',
        principal: { titulo: 'Pasar de bruto a neto', href: '/calculadoras/bruto-a-neto', detalle: 'Usa la calculadora de empleo formal y comprueba sus supuestos.' },
        relacionadas: [
          { titulo: 'Comparar carreras', href: '/carreras/comparar' },
          { titulo: 'Planear mi presupuesto', href: '/finanzas/presupuesto' },
        ],
      },
    ],
  },
  {
    id: 'inversion',
    titulo: 'Empezar a invertir',
    bajada: 'Preparación, alternativas y fuentes',
    pregunta: '¿Dónde estás en el proceso?',
    opciones: [
      {
        id: 'primero', titulo: 'No sé si estoy listo',
        explicacion: 'Antes del producto, revisa tus gastos, compromisos y horizonte de tiempo.',
        principal: { titulo: 'Revisar mi preparación', href: '/finanzas/inversion', detalle: 'Un mapa educativo de preguntas previas, no una autorización para invertir.' },
        relacionadas: [
          { titulo: 'Analizar mi situación financiera', href: '/finanzas/mi-situacion' },
          { titulo: 'Evaluar mi fondo de emergencia', href: '/finanzas/fondo-emergencia' },
        ],
      },
      {
        id: 'alternativas', titulo: 'Quiero comparar opciones',
        explicacion: 'Los instrumentos difieren en riesgo, liquidez, plazo y protección aplicable.',
        principal: { titulo: 'Comparar tipos de instrumentos', href: '/finanzas/inversion/comparar', detalle: 'Explora categorías sin confundirlas con recomendaciones de productos.' },
        relacionadas: [
          { titulo: 'Revisar el mapa previo', href: '/finanzas/inversion' },
          { titulo: 'Consultar referencia de CETES', href: '/finanzas/inversion/cetes' },
        ],
      },
      {
        id: 'cetes', titulo: 'Busco información de CETES',
        explicacion: 'Las tasas cambian: importa revisar fuente y fecha antes de comparar.',
        principal: { titulo: 'Consultar CETES con fuente', href: '/finanzas/inversion/cetes', detalle: 'Ver tasas de referencia fechadas, sin tratarlas como rendimientos futuros garantizados.' },
        relacionadas: [
          { titulo: 'Comparar tipos de instrumentos', href: '/finanzas/inversion/comparar' },
          { titulo: 'Revisar preparación para invertir', href: '/finanzas/inversion' },
        ],
      },
    ],
  },
  {
    id: 'mudanza',
    titulo: 'Cambiarme de estado',
    bajada: 'Trabajo, vivienda y contexto regional',
    pregunta: '¿Qué necesitas comparar?',
    opciones: [
      {
        id: 'entidades', titulo: 'Dos estados diferentes',
        explicacion: 'Compara varias dimensiones antes de reducir la decisión a una cifra.',
        principal: { titulo: 'Comparar estados', href: '/estados/comparar', detalle: 'Consulta los indicadores y la disponibilidad real de datos por entidad.' },
        relacionadas: [
          { titulo: 'Comparar salarios estatales', href: '/carreras/por-estado' },
          { titulo: 'Revisar capacidad de vivienda', href: '/finanzas/vivienda' },
        ],
      },
      {
        id: 'salario', titulo: 'Trabajo y sueldo en otro estado',
        explicacion: 'Separar promedio salarial, ocupación y gastos te ayuda a formular mejores preguntas.',
        principal: { titulo: 'Examinar ingresos por estado', href: '/carreras/por-estado', detalle: 'Los ingresos promedio no garantizan empleos ni ofertas individuales.' },
        relacionadas: [
          { titulo: 'Comparar entidades', href: '/estados/comparar' },
          { titulo: 'Pasar sueldo bruto a neto', href: '/calculadoras/bruto-a-neto' },
        ],
      },
      {
        id: 'casa', titulo: 'Rentar o comprar vivienda',
        explicacion: 'Primero revisa tu margen mensual y después explora los indicadores regionales.',
        principal: { titulo: 'Ordenar mi decisión de vivienda', href: '/finanzas/vivienda', detalle: 'Relaciona ingreso, ahorro y deuda; no calcula una aprobación hipotecaria.' },
        relacionadas: [
          { titulo: 'Comparar estados', href: '/estados/comparar' },
          { titulo: 'Conocer mi presupuesto', href: '/finanzas/presupuesto' },
        ],
      },
    ],
  },
];

export function obtenerTemaExplorador(id) {
  return TEMAS_EXPLORADOR.find((tema) => tema.id === id) || null;
}

export function resolverDecision(temaId, opcionId) {
  const tema = obtenerTemaExplorador(temaId);
  if (!tema) return null;
  const opcion = tema.opciones.find((entrada) => entrada.id === opcionId);
  return opcion ? { tema, opcion } : null;
}

export function esRutaInternaSegura(href) {
  return typeof href === 'string' && /^\/(?!\/)[a-z0-9/-]+\/?$/.test(href);
}
