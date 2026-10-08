// Enlaces públicos y validados desde perfiles de profesión a la ocupación relacionada.
// Carrera cursada y ocupación desempeñada son poblaciones diferentes.
export const OCUPACION_RUTA = '/carreras/ocupaciones';

export function buscarOcupacionDeCarrera(slug, ocupaciones) {
  if (typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) return null;
  return (Array.isArray(ocupaciones) ? ocupaciones : [])
    .find(o => o?.carreraRelacionadaSlug === slug && typeof o.slug === 'string' && /^[a-z0-9-]+$/.test(o.slug)) || null;
}

export function enlaceOcupacionDeCarrera(slug, ocupaciones) {
  const par = buscarOcupacionDeCarrera(slug, ocupaciones);
  return par ? `${OCUPACION_RUTA}?desde=${encodeURIComponent(slug)}` : null;
}

export function seleccionOcupacionInicial(ocupaciones, busqueda = '') {
  let carreraSlug = '';
  try { carreraSlug = new URLSearchParams(busqueda).get('desde') || ''; } catch { /* referencia inválida */ }
  const encontrado = buscarOcupacionDeCarrera(carreraSlug, ocupaciones);
  return { slug: encontrado?.slug || (ocupaciones?.[0]?.slug || ''), desde: encontrado ? carreraSlug : null };
}
