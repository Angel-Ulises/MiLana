// Reglas puras de selección de páginas. Las vistas se descargan solo cuando se necesitan.
export const esRutaInvertir = (p = locationPath()) => /^\/invertir\/?$/.test(p);
export const esRutaProfesion = (p = locationPath()) => /^\/carreras\/profesion\/[^/]+\/?$/.test(p);
export const esRutaOcupaciones = (p = locationPath()) => /^\/carreras\/ocupaciones\/?$/.test(p);
export const esRutaCompararCarreras = (p = locationPath()) => /^\/carreras\/comparar\/?$/.test(p);
export const esRutaCompararEstados = (p = locationPath()) => /^\/estados\/comparar\/?$/.test(p);
export const esRutaEstado = (p = locationPath()) => /^\/estados(?:\/[^/]+)?\/?$/.test(p);
export const esRutaCarreras = (p = locationPath()) => /^\/carreras(?:\/[^/]+)?\/?$/.test(p);
export const esRutaFondosCNBV = (p = locationPath()) => /^\/finanzas\/inversion\/fondos\/?$/.test(p);
export const esRutaCetesReferencia = (p = locationPath()) => /^\/finanzas\/inversion\/cetes\/?$/.test(p);
export const esRutaCompararInstrumentos = (p = locationPath()) => /^\/finanzas\/inversion\/comparar\/?$/.test(p);
export const esRutaInversionEducativa = (p = locationPath()) => /^\/finanzas\/inversion\/?$/.test(p);
export const esRutaAsesor = (p = locationPath()) => /^\/finanzas\/mi-situacion\/?$/.test(p);
export const esRutaFinanzas = (p = locationPath()) => /^\/finanzas(?:\/[^/]+)?\/?$/.test(p);
export const esRutaEconomia = (p = locationPath()) => /^\/economia(?:\/[^/]+)?\/?$/.test(p);
export function locationPath() { return typeof window === 'undefined' ? '/' : window.location.pathname; }
export function rutaConExtras(pathname = locationPath()) {
  const p = pathname.replace(/\/$/, '') || '/';
  const esCarreras = p === '/carreras';
  const esEstados = /^\/estados(?:\/[^/]+)?$/.test(p) && p !== '/estados/comparar';
  const esFinanzas = p === '/finanzas' || p.startsWith('/finanzas/');
  return {
    occupationEntry: esCarreras,
    stateEntry: p === '/' || esCarreras,
    stateHousing: esEstados,
    stateOccupations: esEstados,
    stateCompareEntry: esEstados,
    savedStateContext: esFinanzas,
    advisorEntry: p === '/' || p === '/finanzas' || p.startsWith('/carreras/profesion/'),
    investmentEntry: esFinanzas && !p.startsWith('/finanzas/inversion'),
    investmentCompareEntry: p === '/finanzas/inversion',
    economyNavigation: p === '/',
  };
}