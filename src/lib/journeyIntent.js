import { TEMAS_EXPLORADOR } from './decisionRoutes.js';

const KEY = 'ml-guide-journey-v1';
const MAX_AGE = 4 * 60 * 60 * 1000;
const HUBS = ['/finanzas', '/carreras'];
const path = href => typeof href === 'string' ? (href.split(/[?#]/)[0].replace(/\/$/, '') || '/') : '';
const hubPorTema = temaId => temaId === 'carrera' ? '/carreras' : '/finanzas';
const avisarCambio = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('milana:journey-change'));
};

export function resolverRutaAcompanamiento(temaId, opcionId, destino, inicio = hubPorTema(temaId)) {
  const tema = TEMAS_EXPLORADOR.find(t => t.id === temaId);
  const opcion = tema?.opciones.find(o => o.id === opcionId);
  if (!opcion || !HUBS.includes(inicio)) return null;
  const rutas = [opcion.principal, ...opcion.relacionadas];
  const posicion = rutas.findIndex(r => path(r.href) === path(destino));
  if (posicion < 0) return null;
  const actual = rutas[posicion];
  return {
    temaId, opcionId, tema: tema.titulo, pregunta: opcion.titulo,
    actual: actual.titulo, destino: actual.href,
    siguiente: rutas[posicion + 1] || null,
    volver: inicio,
  };
}

export function recordarRutaAcompanamiento(temaId, opcionId, destino, inicio = hubPorTema(temaId)) {
  if (!resolverRutaAcompanamiento(temaId, opcionId, destino, inicio)) return false;
  try {
    // Mismo registro de intención: nunca cifras ni estado de formularios.
    sessionStorage.setItem(KEY, JSON.stringify({ temaId, opcionId, destino: path(destino), inicio, creado: Date.now() }));
    avisarCambio();
    return true;
  } catch { return false; }
}

function leerIntencion() {
  try {
    const item = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (!item || !Number.isFinite(item.creado) || Date.now() - item.creado > MAX_AGE || item.creado > Date.now() + 60_000) return null;
    return resolverRutaAcompanamiento(item.temaId, item.opcionId, item.destino, item.inicio);
  } catch { return null; }
}

export function leerEleccionExplorador(inicio) {
  const ruta = leerIntencion();
  return ruta?.volver === inicio ? ruta : null;
}

export function leerRutaAcompanamiento(rutaActual) {
  const ruta = leerIntencion();
  // Sólo el hub de origen restaura esta pregunta. Otro hub puede ser un
  // destino legítimo y todavía necesita el enlace de retorno.
  if (ruta?.volver === path(rutaActual)) return null;
  // Cualquier enlace o traslado voluntario dentro del recorrido conserva la pregunta.
  return ruta ? resolverRutaAcompanamiento(ruta.temaId, ruta.opcionId, rutaActual, ruta.volver) : null;
}

export function borrarRutaAcompanamiento() {
  try { sessionStorage.removeItem(KEY); } catch { /* El navegador puede bloquear almacenamiento. */ }
  avisarCambio();
}
