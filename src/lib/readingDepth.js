// Solo guarda una preferencia de lectura en la pestaña actual; nunca importes ni datos financieros.
const KEY = 'ml-lectura-v1';
const CHANGE = 'ml:reading-depth';
const VALIDOS = new Set(['inicio', 'medio', 'experto']);
let nivelEnPagina = 'inicio';
let soloEnPagina = false;

export function leerNivelLectura() {
  if (typeof window !== 'undefined' && soloEnPagina) return nivelEnPagina;
  try {
    const valor = sessionStorage.getItem(KEY);
    const nivel = VALIDOS.has(valor) ? valor : 'inicio';
    if (typeof window !== 'undefined') nivelEnPagina = nivel;
    return nivel;
  } catch {
    // Sin almacenamiento, la selección dura únicamente en este documento.
    return typeof window === 'undefined' ? 'inicio' : nivelEnPagina;
  }
}

export function guardarNivelLectura(valor) {
  if (!VALIDOS.has(valor)) return false;
  let guardado = false;
  try { sessionStorage.setItem(KEY, valor); guardado = true; } catch { /* Lectura sin almacenamiento. */ }
  if (typeof window !== 'undefined') {
    nivelEnPagina = valor;
    soloEnPagina = !guardado;
    window.dispatchEvent(new CustomEvent(CHANGE, { detail: { nivel: valor, guardado } }));
  }
  return guardado;
}

export function observarNivelLectura(onChange) {
  if (typeof window === 'undefined') return () => {};
  const cambiar = (event) => { if (VALIDOS.has(event.detail?.nivel)) onChange(event.detail.nivel); };
  const restaurar = () => onChange(leerNivelLectura());
  window.addEventListener(CHANGE, cambiar);
  window.addEventListener('pageshow', restaurar);
  return () => {
    window.removeEventListener(CHANGE, cambiar);
    window.removeEventListener('pageshow', restaurar);
  };
}
