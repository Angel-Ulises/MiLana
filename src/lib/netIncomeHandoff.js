// Puente opcional y de un solo uso: nunca se incorpora a URL, analytics o cookies.
// Solo el usuario puede iniciar la transferencia pulsando un botón.
const KEY = 'ml-net-income-handoff-v1';
const TTL = 15 * 60 * 1000;
const DESTINOS = new Set(['/finanzas/presupuesto', '/finanzas/mi-situacion']);

export function ingresoValido(cantidad) {
  if (typeof cantidad !== 'number' || !Number.isFinite(cantidad) || cantidad <= 0 || cantidad > 100_000_000) return null;
  return Math.round(cantidad * 100) / 100;
}

export function guardarIngresoTemporal(cantidad, destino, now = Date.now()) {
  const importe = ingresoValido(cantidad);
  if (importe === null || !DESTINOS.has(destino) || !Number.isFinite(now)) return false;
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ importe, destino, fuente: 'bruto-neto', creado: now }));
    return true;
  } catch { return false; }
}

export function consumirIngresoTemporal(destino, now = Date.now()) {
  if (!DESTINOS.has(destino)) return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const dato = JSON.parse(raw);
    // No destruyas un traslado pendiente si alguien visita una herramienta diferente.
    if (dato?.destino !== destino) return null;
    sessionStorage.removeItem(KEY);
    if (dato.fuente !== 'bruto-neto' || ingresoValido(dato.importe) === null
      || !Number.isFinite(dato.creado) || !Number.isFinite(now)
      || dato.creado > now || now - dato.creado > TTL) return null;
    return { importe: String(dato.importe), fuente: dato.fuente };
  } catch {
    try { sessionStorage.removeItem(KEY); } catch { /* almacenamiento inhabilitado */ }
    return null;
  }
}
