// Alias cotidianos: no se envían búsquedas ni se guardan consultas.
export const SEARCH_INTENTS = Object.freeze({
  '/invertir': ['quiero invertir', 'empezar a invertir', 'no se nada de inversiones', 'invertir desde cero', 'inversiones'],
  '/calculadoras/finiquito': ['renuncie', 'me sali del trabajo', 'me corrieron', 'fin de contrato', 'prestaciones al salir'],
  '/calculadoras/liquidacion': ['me despidieron', 'despido injustificado', 'me corrieron del trabajo', 'indemnizacion'],
  '/calculadoras/bruto-a-neto': ['cuanto me queda de sueldo', 'salario libre', 'cuanto me depositan', 'nomina', 'salario despues de impuestos'],
  '/calculadoras/isr': ['impuesto a mi sueldo', 'cuanto me quitan de isr', 'retenciones'],
  '/calculadoras/aguinaldo': ['cuanto aguinaldo me toca', 'prestacion de diciembre'],
  '/calculadoras/vacaciones': ['dias de vacaciones', 'prima vacacional', 'descanso pagado'],
  '/calculadoras/resico': ['impuesto freelancer', 'régimen simplificado', 'trabajador independiente'],
  '/calculadoras/pension-imss': ['retiro imss', 'semanas cotizadas', 'cuando me puedo pensionar'],
  '/finanzas/presupuesto': ['en que se me va el dinero', 'organizar gastos', 'no me alcanza', 'cuanto me sobra', 'cuanto gasto'],
  '/finanzas/ahorro': ['como ahorrar', 'juntar dinero', 'meta de ahorro'],
  '/finanzas/fondo-emergencia': ['dinero para emergencias', 'perdi mi empleo', 'respaldo'],
  '/finanzas/deuda-y-credito': ['tarjetas', 'deudas', 'pagar credito', 'cat'],
  '/carreras/comparar': ['que carrera estudiar', 'elegir carrera', 'comparar carreras', 'universidad'],
  '/carreras/ocupaciones': ['de que trabajan', 'profesion y oficio', 'empleos'],
  '/estados/comparar': ['donde vivir', 'comparar ciudades', 'comparar estados', 'mudanza'],
  '/finanzas/inversion/comparar': ['cetes vs etf', 'comparar inversiones', 'fondos vs acciones'],
  '/finanzas/inversion/cetes': ['invertir en cetes', 'tasas de cetes', 'bonos gobierno', 'prestamo del gobierno cetes'],
  '/finanzas/inversion/fondos': ['fondos de inversion', 'fondos cnbv'],
  '/economia': ['inflacion mexico', 'tasas banco de mexico', 'noticias economicas'],
  '/aprende': ['no entiendo mi nomina', 'aprender finanzas', 'explicaciones faciles'],
});
export const SEARCH_FEATURED = Object.freeze([
  '/calculadoras/finiquito',
  '/calculadoras/bruto-a-neto',
  '/finanzas/presupuesto',
  '/carreras/comparar',
  '/estados/comparar',
  '/invertir'
]);
export function normalizeSearch(value=''){
 return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es-MX').replace(/[¿?¡!.,;:]/g,' ').replace(/\s+/g,' ').trim();
}
const STOP_WORDS = new Set(['quiero','saber','necesito','como','cuanto','cuanta','me','mi','el','la','los','las','que','de','del','en','por','para','un','una','estoy','hacer','puedo','tengo']);
export function matchesSearch(text, aliases, query){
 const q=normalizeSearch(query);
 if(!q)return false;
 const haystack=normalizeSearch(text+' '+(Array.isArray(aliases)?aliases.join(' '):String(aliases??'')));
 if(haystack.includes(q))return true;
 const tokens=q.split(' ').filter(x=>x.length>2&&!STOP_WORDS.has(x));
 return tokens.length>0&&tokens.every(t=>haystack.includes(t));
}