// Solo guarda una preferencia de lectura en la pestaña actual; nunca importes ni datos financieros.
const KEY='ml-lectura-v1';
const VALIDOS=new Set(['inicio','medio','experto']);
export function leerNivelLectura(){
  try { const valor=sessionStorage.getItem(KEY);return VALIDOS.has(valor)?valor:'inicio'; }
  catch { return 'inicio'; }
}
export function guardarNivelLectura(valor) {
  if (!VALIDOS.has(valor)) return false;
  try { sessionStorage.setItem(KEY,valor); return true; }
  catch { return false; }
}