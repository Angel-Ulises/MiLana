// Navegación voluntaria entre herramientas financieras.
// Solo valores autorizados por pareja origen-destino; 15 minutos, una lectura.
// No se transfieren formularios enteros, datos por URL, cookies ni analytics.
export const FINANCE_CONTEXT_KEY = 'ml-finance-context-once-v1';
const DURACION = 15 * 60 * 1000;

export const CAMPOS_DESTINO = Object.freeze({
  '/finanzas/presupuesto': ['ingresoNeto', 'gastosEsenciales', 'gastosVariables', 'pagosDeuda'],
  '/finanzas/fondo-emergencia': ['gastosEsenciales', 'fondoActual'],
  '/finanzas/deuda-y-credito': ['ingresoNeto', 'pagosDeuda'],
  '/finanzas/ahorro': ['metaObjetivo', 'ahorroMetaActual'],
  '/finanzas/mi-situacion': ['ingresoNeto', 'gastosEsenciales', 'gastosVariables', 'pagosDeuda', 'fondoActual', 'metaObjetivo', 'ahorroMetaActual'],
});

export const RUTAS_TRANSFERENCIA = Object.freeze({
  '/finanzas/presupuesto': {
    '/finanzas/fondo-emergencia': ['gastosEsenciales'],
    '/finanzas/deuda-y-credito': ['ingresoNeto', 'pagosDeuda'],
    '/finanzas/mi-situacion': ['ingresoNeto', 'gastosEsenciales', 'gastosVariables', 'pagosDeuda'],
  },
  '/finanzas/fondo-emergencia': {
    '/finanzas/presupuesto': ['gastosEsenciales'],
    '/finanzas/mi-situacion': ['gastosEsenciales', 'fondoActual'],
  },
  '/finanzas/deuda-y-credito': {
    '/finanzas/presupuesto': ['ingresoNeto', 'pagosDeuda'],
    '/finanzas/mi-situacion': ['ingresoNeto', 'pagosDeuda'],
  },
  '/finanzas/ahorro': {
    '/finanzas/mi-situacion': ['metaObjetivo', 'ahorroMetaActual'],
  },
  '/finanzas/mi-situacion': {
    '/finanzas/presupuesto': ['ingresoNeto', 'gastosEsenciales', 'gastosVariables', 'pagosDeuda'],
    '/finanzas/fondo-emergencia': ['gastosEsenciales', 'fondoActual'],
    '/finanzas/deuda-y-credito': ['ingresoNeto', 'pagosDeuda'],
    '/finanzas/ahorro': ['metaObjetivo', 'ahorroMetaActual'],
  },
});

export const ETIQUETAS_ORIGEN = Object.freeze({
  '/finanzas/presupuesto': 'Presupuesto',
  '/finanzas/fondo-emergencia': 'Fondo de emergencia',
  '/finanzas/deuda-y-credito': 'Deuda y crédito',
  '/finanzas/ahorro': 'Ahorro',
  '/finanzas/mi-situacion': 'Mi situación',
});

function cantidadCapturada(input) {
  if (typeof input !== 'string' && typeof input !== 'number') return null;
  const value = String(input).trim();
  if (!value || !/^(?:\d+)(?:\.\d{1,2})?$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100_000_000) return null;
  return value;
}

function proyectoPermitido(origen, destino, entradas) {
  const campos = RUTAS_TRANSFERENCIA[origen]?.[destino];
  if (!campos || !entradas || typeof entradas !== 'object' || Array.isArray(entradas)) return null;
  const salida = {};
  for (const key of campos) {
    const value = cantidadCapturada(entradas[key]);
    if (value !== null) salida[key] = value;
  }
  return Object.keys(salida).length > 0 ? salida : null;
}

export function prepararContextoFinanciero(origen, destino, entradas, ahora = Date.now()) {
  const valores = proyectoPermitido(origen, destino, entradas);
  if (!valores || !Number.isFinite(ahora)) return false;
  try {
    sessionStorage.setItem(FINANCE_CONTEXT_KEY, JSON.stringify({ origen, destino, valores, creado: ahora }));
    return true;
  } catch { return false; }
}

export function consumirContextoFinanciero(destino, ahora = Date.now()) {
  if (!CAMPOS_DESTINO[destino]) return null;
  try {
    const raw = sessionStorage.getItem(FINANCE_CONTEXT_KEY);
    if (!raw) return null;
    const item = JSON.parse(raw);
    // Una navegación a otro destino no debe consumir la elección pendiente.
    if (item?.destino !== destino) return null;
    sessionStorage.removeItem(FINANCE_CONTEXT_KEY);
    if (!Number.isFinite(ahora) || !Number.isFinite(item.creado) || item.creado > ahora ||
       ahora - item.creado > DURACION) return null;
    const proyectado = proyectoPermitido(item.origen, destino, item.valores);
    if (!proyectado) return null;
    return { origen: item.origen, titulo: ETIQUETAS_ORIGEN[item.origen], valores: proyectado };
  } catch {
    try { sessionStorage.removeItem(FINANCE_CONTEXT_KEY); } catch { /* navegadores privados */ }
    return null;
  }
}

// Eliminar los valores importados solo si el usuario aún no los modificó.
// No borra campos manuales, ni interpreta campos vacíos como cero.
export function quitarValoresImportados(estado, importados) {
  const salida = { ...estado };
  for (const [campo, valor] of Object.entries(importados || {})) {
    if (String(salida[campo]) === String(valor)) salida[campo] = '';
  }
  return salida;
}
