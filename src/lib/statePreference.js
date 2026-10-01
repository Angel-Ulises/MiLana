import estados from '../data/estados.json';

export const STATE_PREFERENCE_KEY = 'milana_estado_contexto_v1';
const slugs = new Set(estados.estados.map((e) => e.slug));

export function estadoPermitido(slug) {
  return typeof slug === 'string' && slugs.has(slug);
}

export function leerEstadoGuardado(storage = globalThis?.localStorage) {
  try {
    const slug = storage?.getItem(STATE_PREFERENCE_KEY) || '';
    return estadoPermitido(slug) ? slug : '';
  } catch {
    return '';
  }
}

export function guardarEstado(slug, storage = globalThis?.localStorage) {
  if (!estadoPermitido(slug)) return false;
  try {
    storage?.setItem(STATE_PREFERENCE_KEY, slug);
    return true;
  } catch {
    return false;
  }
}

export function borrarEstadoGuardado(storage = globalThis?.localStorage) {
  try {
    storage?.removeItem(STATE_PREFERENCE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function obtenerEstado(slug) {
  return estados.estados.find((e) => e.slug === slug) || null;
}
