// Catálogo de /calculadoras organizado por necesidad. Solo enlaza a las calculadoras existentes:
// no calcula nada ni cambia fórmulas. Lo usan la página React y el HTML estático del build.
export const CALCULADORAS_HUB = Object.freeze({
  finiquito: { nombre: 'Finiquito', href: '/calculadoras/finiquito', usala: 'Renunciaste o terminó tu contrato y quieres saber qué te deben pagar.' },
  liquidacion: { nombre: 'Liquidación', href: '/calculadoras/liquidacion', usala: 'Te despidieron sin causa justificada y quieres estimar la indemnización.' },
  'bruto-a-neto': { nombre: 'Bruto a neto', href: '/calculadoras/bruto-a-neto', usala: 'Conoces tu sueldo bruto y quieres saber cuánto te llega después de ISR y seguridad social.' },
  isr: { nombre: 'ISR mensual', href: '/calculadoras/isr', usala: 'Quieres revisar si la retención de impuesto de tu recibo tiene sentido.' },
  resico: { nombre: 'RESICO', href: '/calculadoras/resico', usala: 'Trabajas por tu cuenta en el Régimen Simplificado de Confianza.' },
  aguinaldo: { nombre: 'Aguinaldo', href: '/calculadoras/aguinaldo', usala: 'Quieres saber cuánto aguinaldo te toca, completo o proporcional.' },
  vacaciones: { nombre: 'Vacaciones', href: '/calculadoras/vacaciones', usala: 'Quieres saber cuántos días de vacaciones y prima te corresponden.' },
  ptu: { nombre: 'PTU', href: '/calculadoras/ptu', usala: 'Tu empresa reparte utilidades y quieres revisar tu parte.' },
  infonavit: { nombre: 'Infonavit', href: '/calculadoras/infonavit', usala: 'Tienes o piensas tomar un crédito Infonavit y quieres ver capital e intereses.' },
  'pension-imss': { nombre: 'Pensión IMSS', href: '/calculadoras/pension-imss', usala: 'Quieres revisar los requisitos de pensión de la Ley 97 antes de proyectar una cifra.' },
});

export const GRUPOS_HUB = Object.freeze([
  { id: 'trabajo', titulo: 'Dejé o perdí mi trabajo', ids: ['finiquito', 'liquidacion'], aprende: { href: '/aprende/finiquito-vs-liquidacion', texto: '¿Finiquito o liquidación? La diferencia en 5 minutos' } },
  { id: 'sueldo', titulo: 'Quiero entender mi sueldo', ids: ['bruto-a-neto', 'isr', 'resico'], aprende: { href: '/aprende/leer-recibo-nomina', texto: 'Cómo leer tu recibo de nómina' } },
  { id: 'prestaciones', titulo: 'Me toca una prestación', ids: ['aguinaldo', 'vacaciones', 'ptu'], aprende: { href: '/aprende/aguinaldo-bruto-neto', texto: 'Por qué tu aguinaldo llega con descuento' } },
  { id: 'futuro', titulo: 'Vivienda y retiro', ids: ['infonavit', 'pension-imss'], aprende: { href: '/aprende/pension-imss-ley-97', texto: 'Qué revisar antes de confiar en una cifra de pensión' } },
]);

// Selector de dos pasos: cada respuesta termina en una sola calculadora con su motivo.
export const SELECTOR_HUB = Object.freeze([
  {
    id: 'trabajo', pregunta: 'Dejé o voy a dejar mi trabajo', sigue: '¿Cómo terminó?',
    opciones: [
      { texto: 'Renuncié o terminó mi contrato', calc: 'finiquito', porque: 'Al renunciar se paga el finiquito: salario pendiente, aguinaldo y vacaciones proporcionales.' },
      { texto: 'Me despidieron', calc: 'liquidacion', porque: 'Un despido sin causa justificada suma la indemnización al finiquito.' },
      { texto: 'No estoy seguro', calc: 'finiquito', porque: 'Empieza por el finiquito: se paga en cualquier salida. Si fue despido, después compara con la liquidación.', aprende: '/aprende/finiquito-vs-liquidacion' },
    ],
  },
  {
    id: 'sueldo', pregunta: 'Quiero saber cuánto me llega', sigue: '¿Cómo recibes tu ingreso?',
    opciones: [
      { texto: 'Soy empleado con nómina', calc: 'bruto-a-neto', porque: 'Convierte tu sueldo bruto en lo que realmente cae a tu cuenta.' },
      { texto: 'Trabajo por mi cuenta (RESICO)', calc: 'resico', porque: 'Estima el ISR del régimen simplificado sobre lo que cobraste.' },
      { texto: 'Quiero revisar mi recibo', calc: 'isr', porque: 'Compara la retención de tu recibo con la tabla vigente.' },
    ],
  },
  {
    id: 'prestaciones', pregunta: 'Me toca una prestación', sigue: '¿Cuál?',
    opciones: [
      { texto: 'Aguinaldo', calc: 'aguinaldo', porque: 'Mínimo 15 días de salario por año trabajado, o la parte proporcional.' },
      { texto: 'Vacaciones', calc: 'vacaciones', porque: 'Los días crecen con tu antigüedad y llevan prima vacacional.' },
      { texto: 'Reparto de utilidades', calc: 'ptu', porque: 'Revisa la parte del 10% de utilidades que te corresponde.' },
    ],
  },
  {
    id: 'futuro', pregunta: 'Pienso en vivienda o retiro', sigue: '¿Qué te interesa?',
    opciones: [
      { texto: 'Crédito Infonavit', calc: 'infonavit', porque: 'Separa cuánto de cada pago va a capital y cuánto a intereses.' },
      { texto: 'Mi pensión', calc: 'pension-imss', porque: 'Primero confirma si cumples los requisitos de la Ley 97.' },
    ],
  },
]);
