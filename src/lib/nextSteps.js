// «Tu siguiente paso»: una acción principal y hasta dos alternativas al terminar cada herramienta.
// Datos puros y rutas internas publicadas; nada se calcula ni se envía con estos enlaces.
const p = (texto, href) => ({ texto, href });

export const SIGUIENTE_PASO = Object.freeze({
  '/finanzas/presupuesto': {
    titulo: 'Con tu flujo claro, protege lo que ya tienes',
    texto: 'Un fondo de emergencia evita que un imprevisto se convierta en deuda.',
    principal: p('Calcular mi fondo de emergencia', '/finanzas/fondo-emergencia'),
    otras: [p('Revisar cuánto pago en deudas', '/finanzas/deuda-y-credito'), p('Ver todo en Mi situación', '/finanzas/mi-situacion')],
  },
  '/finanzas/fondo-emergencia': {
    titulo: 'Decide dónde guardar tu fondo',
    texto: 'Compara cuentas y ahorro con su disponibilidad, rendimiento publicado y protección, con fuente y fecha.',
    principal: p('Comparar opciones de ahorro', '/finanzas/match/ahorro'),
    otras: [p('Planear otra meta de ahorro', '/finanzas/ahorro'), p('Ver todo en Mi situación', '/finanzas/mi-situacion')],
  },
  '/finanzas/deuda-y-credito': {
    titulo: 'Antes de pedir otro crédito, compara su costo',
    texto: 'Revisa CAT, anualidad y comisiones publicadas de tarjetas y créditos, cada dato con su fuente.',
    principal: p('Comparar tarjetas de crédito', '/finanzas/match/tarjetas'),
    otras: [p('Comparar créditos personales', '/finanzas/match/creditos-personales'), p('Revisar mi presupuesto', '/finanzas/presupuesto')],
  },
  '/finanzas/ahorro': {
    titulo: 'Elige dónde crecerá tu ahorro',
    texto: 'Compara GAT, plazos y disponibilidad publicados por cada institución.',
    principal: p('Comparar opciones de ahorro', '/finanzas/match/ahorro'),
    otras: [p('Primero, mi fondo de emergencia', '/finanzas/fondo-emergencia'), p('Ver tasas de CETES', '/finanzas/inversion/cetes')],
  },
  '/finanzas/vivienda': {
    titulo: 'Cuando tus números cierren, compara el crédito',
    texto: 'Hipotecas con su CAT publicado, comisiones y requisitos, sin confundir mensualidad con costo.',
    principal: p('Comparar hipotecas', '/finanzas/match/hipotecas'),
    otras: [p('Calcular un crédito Infonavit', '/calculadoras/infonavit'), p('Revisar mi presupuesto', '/finanzas/presupuesto')],
  },
  '/finanzas/mi-situacion': {
    titulo: 'Convierte tu diagnóstico en una decisión',
    texto: 'Compara productos concretos con sus condiciones a la vista antes de contratar.',
    principal: p('Abrir MiLana Match', '/finanzas/match'),
    otras: [p('Ordenar mi presupuesto', '/finanzas/presupuesto'), p('Calcular mi fondo de emergencia', '/finanzas/fondo-emergencia')],
  },
  '/invertir': {
    titulo: 'Antes de elegir un instrumento, revisa tu punto de partida',
    texto: 'Flujo, respaldo, deuda y horizonte: cuatro preguntas que conviene contestar primero.',
    principal: p('Revisar si estoy listo para invertir', '/finanzas/inversion'),
    otras: [p('Comparar tipos de instrumentos', '/finanzas/inversion/comparar'), p('Ver tasas de CETES', '/finanzas/inversion/cetes')],
  },
  '/finanzas/inversion': {
    titulo: 'Compara familias de instrumentos',
    texto: 'Qué compras, cuándo puedes disponer del dinero y qué puede variar en CETES, fondos, acciones y ETF.',
    principal: p('Comparar tipos de instrumentos', '/finanzas/inversion/comparar'),
    otras: [p('Ver opciones concretas con fuente', '/finanzas/match/inversiones'), p('Revisar Mi situación', '/finanzas/mi-situacion')],
  },
  '/finanzas/inversion/comparar': {
    titulo: 'Pasa de la familia al producto',
    texto: 'Revisa instrumentos concretos con su indicador propio, liquidez y costos documentados.',
    principal: p('Ver inversiones con fuente', '/finanzas/match/inversiones'),
    otras: [p('Ver tasas de CETES', '/finanzas/inversion/cetes'), p('Ver fondos reportados a CNBV', '/finanzas/inversion/fondos')],
  },
  '/finanzas/inversion/cetes': {
    titulo: 'Compara CETES con otras opciones',
    texto: 'Fondos de deuda y liquidez diaria tienen otros plazos, costos y riesgos; revísalos lado a lado.',
    principal: p('Comparar inversiones', '/finanzas/match/inversiones'),
    otras: [p('Comparar tipos de instrumentos', '/finanzas/inversion/comparar'), p('Comparar opciones de ahorro', '/finanzas/match/ahorro')],
  },
  '/finanzas/inversion/fondos': {
    titulo: 'Revisa fondos y alternativas con su fuente',
    texto: 'Compara instrumentos concretos con liquidez, costo y rendimiento del mismo periodo cuando son comparables.',
    principal: p('Comparar inversiones', '/finanzas/match/inversiones'),
    otras: [p('Comparar tipos de instrumentos', '/finanzas/inversion/comparar'), p('Ver tasas de CETES', '/finanzas/inversion/cetes')],
  },
  '/carreras/comparar': {
    titulo: 'Aterriza el sueldo a lo que te llegaría',
    texto: 'Un promedio bruto no es lo que recibes: calcula el neto después de ISR e IMSS.',
    principal: p('Calcular sueldo neto', '/calculadoras/bruto-a-neto'),
    otras: [p('Comparar estados', '/estados/comparar'), p('Revisar Mi situación', '/finanzas/mi-situacion')],
  },
  '/carreras/ocupaciones': {
    titulo: 'Aterriza el sueldo a lo que te llegaría',
    texto: 'Calcula el neto después de ISR e IMSS y compáralo con otra carrera.',
    principal: p('Calcular sueldo neto', '/calculadoras/bruto-a-neto'),
    otras: [p('Comparar carreras', '/carreras/comparar'), p('Comparar estados', '/estados/comparar')],
  },
  '/estados/comparar': {
    titulo: 'Lleva la comparación a tus números',
    texto: 'Con tu ingreso y tus gastos, la diferencia entre estados se vuelve una decisión concreta.',
    principal: p('Analizar Mi situación', '/finanzas/mi-situacion'),
    otras: [p('Ordenar una decisión de vivienda', '/finanzas/vivienda'), p('Revisar mi presupuesto', '/finanzas/presupuesto')],
  },
  // Calculadoras sin «Siguiente paso» propio (las demás ya llevan su cifra a Finanzas).
  '/calculadoras/isr': {
    titulo: 'Ve cuánto te queda después de impuestos',
    texto: 'Suma ISR e IMSS para conocer lo que realmente llega a tu cuenta.',
    principal: p('Calcular sueldo neto', '/calculadoras/bruto-a-neto'),
    otras: [p('Revisar mi presupuesto', '/finanzas/presupuesto')],
  },
  '/calculadoras/resico': {
    titulo: 'Ordena tu mes con este ingreso',
    texto: 'Separa lo que apartas para impuestos de lo que puedes gastar y ahorrar.',
    principal: p('Ordenar mi presupuesto', '/finanzas/presupuesto'),
    otras: [p('Calcular mi fondo de emergencia', '/finanzas/fondo-emergencia')],
  },
  '/calculadoras/ptu': {
    titulo: 'Decide qué harás con tu PTU',
    texto: 'Un pago único puede adelantar tu fondo de emergencia o una meta de ahorro.',
    principal: p('Planear una meta de ahorro', '/finanzas/ahorro'),
    otras: [p('Calcular mi fondo de emergencia', '/finanzas/fondo-emergencia')],
  },
  '/calculadoras/vacaciones': {
    titulo: '¿Vas a dejar tu empleo?',
    texto: 'Los días pendientes y la prima vacacional forman parte de tu finiquito.',
    principal: p('Calcular mi finiquito', '/calculadoras/finiquito'),
    otras: [p('Calcular mi aguinaldo', '/calculadoras/aguinaldo')],
  },
  // MiLana Match: después de comparar, revisar la capacidad propia antes de contratar.
  '/finanzas/match/hipotecas': { titulo: 'Antes de contratar, revisa tu capacidad de pago', texto: 'Ordena ingreso, gastos, respaldo y deuda antes de comprometer una mensualidad.', principal: p('Ordenar una decisión de vivienda', '/finanzas/vivienda'), otras: [p('Calcular un crédito Infonavit', '/calculadoras/infonavit')] },
  '/finanzas/match/automotriz': { titulo: 'Antes de contratar, revisa tu capacidad de pago', texto: 'Mide cuánto de tu ingreso ya está comprometido antes de sumar otra mensualidad.', principal: p('Revisar mis deudas', '/finanzas/deuda-y-credito'), otras: [p('Revisar mi presupuesto', '/finanzas/presupuesto')] },
  '/finanzas/match/tarjetas': { titulo: 'Antes de contratar, revisa tu capacidad de pago', texto: 'Mide cuánto de tu ingreso ya está comprometido antes de sumar otra tarjeta.', principal: p('Revisar mis deudas', '/finanzas/deuda-y-credito'), otras: [p('Revisar mi presupuesto', '/finanzas/presupuesto')] },
  '/finanzas/match/creditos-personales': { titulo: 'Antes de contratar, revisa tu capacidad de pago', texto: 'Mide cuánto de tu ingreso ya está comprometido antes de sumar otro crédito.', principal: p('Revisar mis deudas', '/finanzas/deuda-y-credito'), otras: [p('Calcular mi fondo de emergencia', '/finanzas/fondo-emergencia')] },
  '/finanzas/match/cuentas': { titulo: 'Usa la cuenta con un plan', texto: 'Un presupuesto mensual te dice cuánto mover a ahorro y cuánto dejar disponible.', principal: p('Ordenar mi presupuesto', '/finanzas/presupuesto'), otras: [p('Calcular mi fondo de emergencia', '/finanzas/fondo-emergencia')] },
  '/finanzas/match/ahorro': { titulo: 'Define cuánto y para qué ahorras', texto: 'Ponle número a tu fondo de emergencia o a una meta antes de elegir dónde guardarla.', principal: p('Calcular mi fondo de emergencia', '/finanzas/fondo-emergencia'), otras: [p('Planear una meta de ahorro', '/finanzas/ahorro')] },
  '/finanzas/match/inversiones': { titulo: 'Antes de invertir, revisa tu punto de partida', texto: 'Flujo, respaldo, deuda y horizonte cambian qué riesgo puedes tomar.', principal: p('Revisar si estoy listo para invertir', '/finanzas/inversion'), otras: [p('Aprender a invertir desde cero', '/invertir')] },
  '/finanzas/match/seguros': { titulo: 'Ordena tu respaldo completo', texto: 'Un seguro protege contra un riesgo; el fondo de emergencia cubre lo que la póliza no paga.', principal: p('Calcular mi fondo de emergencia', '/finanzas/fondo-emergencia'), otras: [p('Ver todo en Mi situación', '/finanzas/mi-situacion')] },
  '/finanzas/match/afores': { titulo: 'Revisa tu retiro con tus datos', texto: 'Semanas cotizadas, edad y régimen definen qué puedes esperar de tu pensión.', principal: p('Revisar mi pensión IMSS', '/calculadoras/pension-imss'), otras: [p('Leer la guía de Pensión IMSS Ley 97', '/aprende/pension-imss-ley-97')] },
});

export function siguientePaso(pathname = '/') {
  const ruta = String(pathname).replace(/\/+$/, '') || '/';
  return SIGUIENTE_PASO[ruta] || null;
}
