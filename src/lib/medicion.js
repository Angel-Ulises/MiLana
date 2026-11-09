// Eventos de Google Analytics 4 de las calculadoras (mejora 2026-11, fase 6).
// Nunca se envían importes, fechas ni respuestas: solo el nombre del evento y parámetros predefinidos.
// En producción usa window.milanaTrack (public/milana-analytics.js). En vista previa o local no hay
// GA4 cargado: el evento queda en window.dataLayer y en window.milanaEventos para poder comprobarlo.
export function registrarEvento(nombre, parametros = {}) {
  if (typeof window === 'undefined') return;
  const limpio = {};
  for (const [clave, valor] of Object.entries(parametros)) {
    if (typeof valor === 'string' && /^[a-z0-9_-]{1,40}$/.test(valor)) limpio[clave] = valor;
  }
  (window.milanaEventos ||= []).push({ evento: nombre, ...limpio });
  if (typeof window.milanaTrack === 'function') window.milanaTrack(nombre, limpio);
  else (window.dataLayer ||= []).push({ event: nombre, ...limpio });
}

// Un mismo resultado no se cuenta dos veces mientras la persona sigue tecleando:
// se registra cuando el resultado cambia de «sin resultado» a «con resultado» o cambia el modo.
const ultimos = new Map();
export function registrarResultado(calculadora, modo) {
  const clave = `${calculadora}:${modo}`;
  if (ultimos.get(calculadora) === clave) return;
  ultimos.set(calculadora, clave);
  registrarEvento(`calcular_${calculadora}`, { calculadora, modo });
}
export function olvidarResultado(calculadora) {
  ultimos.delete(calculadora);
}
