import { TEMAS_EXPLORADOR } from './decisionRoutes.js';

const KEY = 'ml-guide-journey-v1';
const MAX_AGE = 4 * 60 * 60 * 1000;
const path = (href) => typeof href === 'string' ? (href.split('?')[0].replace(/\/$/, '') || '/') : '';

export function resolverRutaAcompanamiento(temaId, opcionId, destino) {
  const tema = TEMAS_EXPLORADOR.find((t) => t.id === temaId);
  const opcion = tema?.opciones.find((o) => o.id === opcionId);
  if (!opcion) return null;
  const rutas = [opcion.principal, ...opcion.relacionadas];
  const actual = rutas.find((r) => path(r.href) === path(destino));
  if (!actual) return null;
  const siguiente = rutas.find((r) => r.href !== actual.href) || null;
  return {
    tema: tema.titulo,
    pregunta: opcion.titulo,
    actual: actual.titulo,
    siguiente,
    volver: temaId === 'carrera' ? '/carreras' : temaId === 'mudanza' ? '/estados' : '/finanzas',
  };
}

export function recordarRutaAcompanamiento(temaId, opcionId, destino) {
  if (!resolverRutaAcompanamiento(temaId, opcionId, destino)) return false;
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ temaId, opcionId, destino: path(destino), creado: Date.now() }));
    return true;
  } catch { return false; }
}

export function leerRutaAcompanamiento(rutaActual) {
  try {
    const guardado = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (!guardado || typeof guardado.creado !== 'number' || Date.now() - guardado.creado > MAX_AGE || guardado.creado > Date.now() + 60_000) return null;
    if (path(guardado.destino) !== path(rutaActual)) return null;
    return resolverRutaAcompanamiento(guardado.temaId, guardado.opcionId, guardado.destino);
  } catch { return null; }
}

export function borrarRutaAcompanamiento() {
  try { sessionStorage.removeItem(KEY); } catch { /* El navegador puede bloquear almacenamiento. */ }
}
