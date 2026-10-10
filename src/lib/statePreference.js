export const STATE_PREFERENCE_KEY = 'milana_estado_contexto_v1';

export const STATE_SLUGS = Object.freeze([
  'aguascalientes', 'baja-california', 'baja-california-sur', 'campeche', 'chiapas', 'chihuahua',
  'ciudad-de-mexico', 'coahuila', 'colima', 'durango', 'estado-de-mexico', 'guanajuato', 'guerrero',
  'hidalgo', 'jalisco', 'michoacan', 'morelos', 'nayarit', 'nuevo-leon', 'oaxaca', 'puebla', 'queretaro',
  'quintana-roo', 'san-luis-potosi', 'sinaloa', 'sonora', 'tabasco', 'tamaulipas', 'tlaxcala', 'veracruz',
  'yucatan', 'zacatecas',
]);

const slugs = new Set(STATE_SLUGS);

export function estadoPermitido(slug) {
  return typeof slug === 'string' && slugs.has(slug);
}

export function leerEstadoGuardado(storage) {
  try {
    // El getter de localStorage también puede lanzar SecurityError.
    // Resolverlo dentro del try evita desmontar las herramientas de Finanzas.
    if (storage === undefined) storage = globalThis?.localStorage;
    const slug = storage?.getItem(STATE_PREFERENCE_KEY) || '';
    return estadoPermitido(slug) ? slug : '';
  } catch {
    return '';
  }
}

export function guardarEstado(slug, storage) {
  if (!estadoPermitido(slug)) return false;
  try {
    // El getter de localStorage también puede lanzar SecurityError.
    // Resolverlo dentro del try evita desmontar las herramientas de Finanzas.
    if (storage === undefined) storage = globalThis?.localStorage;
    storage?.setItem(STATE_PREFERENCE_KEY, slug);
    return true;
  } catch {
    return false;
  }
}

export function borrarEstadoGuardado(storage) {
  try {
    // El getter de localStorage también puede lanzar SecurityError.
    // Resolverlo dentro del try evita desmontar las herramientas de Finanzas.
    if (storage === undefined) storage = globalThis?.localStorage;
    storage?.removeItem(STATE_PREFERENCE_KEY);
    return true;
  } catch {
    return false;
  }
}
