// Alias cotidianos: no se envían búsquedas ni se guardan consultas.
export const SEARCH_INTENTS = Object.freeze({
  '/invertir': ['quiero invertir', 'empezar a invertir', 'no se nada de inversiones', 'invertir desde cero', 'inversiones'],
  '/calculadoras/finiquito': ['renuncie', 'me sali del trabajo', 'me corrieron', 'fin de contrato', 'prestaciones al salir', 'renuncia', 'renunciar', 'voy a renunciar', 'renuncio', 'dejar mi trabajo', 'me voy del trabajo', 'salida del trabajo', 'termino de contrato'],
  '/calculadoras/liquidacion': ['me despidieron', 'despido injustificado', 'me corrieron del trabajo', 'indemnizacion', 'despido', 'me despiden', 'me van a despedir', 'corrieron', 'liquidacion laboral', 'demanda por despido'],
  '/calculadoras/bruto-a-neto': ['cuanto me queda de sueldo', 'salario libre', 'cuanto me depositan', 'nomina', 'salario despues de impuestos', 'recibo de nomina', 'quincena', 'sueldo neto', 'salario neto', 'sueldo bruto', 'cuanto me llega', 'cuanto me pagan', 'descuento del imss'],
  '/calculadoras/isr': ['impuesto a mi sueldo', 'cuanto me quitan de isr', 'retenciones', 'cuanto me descuentan', 'descuentos', 'impuestos', 'impuesto sobre la renta', 'isr de mi sueldo'],
  '/calculadoras/aguinaldo': ['cuanto aguinaldo me toca', 'prestacion de diciembre', 'cuando pagan aguinaldo', 'fecha del aguinaldo', 'aguinaldo proporcional', 'aguinaldo 2026', 'pago de diciembre'],
  '/calculadoras/vacaciones': ['dias de vacaciones', 'prima vacacional', 'descanso pagado', 'cuantos dias de vacaciones me tocan', 'vacaciones por antiguedad'],
  '/calculadoras/resico': ['impuesto freelancer', 'régimen simplificado', 'trabajador independiente', 'honorarios', 'recibos de honorarios', 'facturar', 'freelance', 'trabajo por mi cuenta'],
  '/calculadoras/pension-imss': ['retiro imss', 'semanas cotizadas', 'cuando me puedo pensionar', 'jubilacion', 'jubilarme', 'pension', 'pensionarme', 'semanas imss', 'afore semanas'],
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
  '/finanzas/match': ['comparar productos financieros', 'comparador', 'que banco conviene', 'comparar bancos', 'match'],
  '/finanzas/match/tarjetas': ['tarjeta de credito', 'comparar tarjetas', 'anualidad', 'cat tarjeta'],
  '/finanzas/match/creditos-personales': ['prestamo personal', 'credito personal', 'pedir prestado'],
  '/finanzas/match/hipotecas': ['credito hipotecario', 'comprar casa', 'hipoteca'],
  '/finanzas/match/automotriz': ['credito para auto', 'financiar coche', 'comprar carro'],
  '/finanzas/match/cuentas': ['cuenta de banco', 'cuenta digital', 'abrir cuenta'],
  '/finanzas/match/ahorro': ['donde ahorrar', 'sofipo', 'gat', 'rendimiento ahorro', 'cajitas'],
  '/finanzas/match/inversiones': ['donde invertir poco', 'fondos de deuda', 'liquidez diaria'],
  '/finanzas/match/seguros': ['seguro de vida', 'gastos medicos', 'seguro de auto'],
  '/finanzas/match/afores': ['mejor afore', 'comparar afores', 'rendimiento afore', 'irn'],
  '/economia': ['inflacion mexico', 'tasas banco de mexico', 'noticias economicas'],
  '/aprende': ['no entiendo mi nomina', 'aprender finanzas', 'explicaciones faciles'],
  '/calculadoras/ptu': ['utilidades', 'reparto de utilidades', 'participacion de utilidades', 'cuando pagan utilidades', 'ptu 2026'],
  '/calculadoras/infonavit': ['credito infonavit', 'infonavit', 'vivienda', 'mensualidad infonavit', 'comprar casa con infonavit'],
  '/aprende/jornada-2027': ['horas extra', 'horas extras', 'jornada laboral', '40 horas', '46 horas', '48 horas', 'jornada 2027', 'reduccion de jornada', 'tiempo extra', 'domingo', 'prima dominical', 'dia de descanso', 'registro de jornada'],
  '/aprende/fechas-de-pago': ['fechas de pago', 'cuando me pagan', 'cuando pagan aguinaldo', 'cuando pagan utilidades', 'cuando pagan vacaciones', 'dias de pago', 'cuando debo cobrar'],
  '/aprende/leer-recibo-nomina': ['recibo de nomina', 'recibo', 'talon de pago', 'nomina', 'que significa cada renglon'],
  '/aprende/finiquito-vs-liquidacion': ['finiquito o liquidacion', 'diferencia entre finiquito y liquidacion', 'me despidieron que me deben'],
  '/aprende/aguinaldo-bruto-neto': ['aguinaldo con descuento', 'por que me descuentan del aguinaldo'],
  '/aprende/pension-imss-ley-97': ['pension', 'jubilacion', 'ley 97', 'afore', 'semanas cotizadas'],
  '/situaciones/entender-mi-sueldo': ['no entiendo mi sueldo', 'cuanto gano de verdad'],
  '/situaciones/terminar-relacion-laboral': ['me van a despedir', 'renuncia', 'dejar mi trabajo'],
  '/privacidad': ['aviso de privacidad', 'mis datos', 'datos personales', 'arco'],
  '/contacto': ['contacto', 'escribirles', 'correo', 'reportar un error', 'corregir un dato'],
  '/sobre': ['quienes somos', 'quien hizo esta pagina', 'acerca de'],
  '/metodo': ['como calculan', 'de donde sacan los datos', 'metodologia', 'como revisan'],
  '/terminos': ['terminos y condiciones', 'condiciones de uso'],
  '/financiamiento': ['como se financian', 'publicidad', 'anuncios'],
  '/widgets': ['insertar calculadora', 'widget', 'poner una calculadora en mi pagina'],
  '/estados/ciudad-de-mexico': ['cdmx', 'df', 'distrito federal'],
  '/estados/estado-de-mexico': ['edomex', 'estado de mexico'],
  '/estados/nuevo-leon': ['monterrey', 'nl'],
  '/estados/jalisco': ['guadalajara'],
  '/estados/baja-california': ['tijuana', 'mexicali'],
  '/estados/yucatan': ['merida'],
  '/estados/quintana-roo': ['cancun', 'playa del carmen'],
  '/carreras/profesion/enfermeria': ['enfermera', 'enfermero'],
  '/carreras/profesion/medicina': ['medico', 'doctor', 'doctora'],
  '/carreras/profesion/derecho': ['abogado', 'abogada'],
  '/carreras/profesion/contabilidad': ['contador', 'contadora'],
  '/carreras/profesion/ingenieria-civil': ['ingeniero', 'ingeniera', 'albanil', 'construccion'],
  '/carreras/profesion/ciencias-computacion': ['programador', 'programadora', 'sistemas'],
  '/carreras/profesion/psicologia': ['psicologo', 'psicologa'],
  '/carreras/profesion/arquitectura': ['arquitecto', 'arquitecta'],
});
export const SEARCH_FEATURED = Object.freeze([
  '/calculadoras/aguinaldo',
  '/calculadoras/finiquito',
  '/calculadoras/liquidacion',
  '/calculadoras/bruto-a-neto',
  '/calculadoras/isr',
  '/finanzas/presupuesto'
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