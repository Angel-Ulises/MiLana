// Solo identificadores publicados en los catálogos de MiLana.
// Los importes y los datos introducidos en formularios nunca viajan en el enlace.
const destinos = { estado: '/estados/comparar', carrera: '/carreras/comparar' };

export function resolverParComparacion(lista, busqueda = '') {
  const slugs = (Array.isArray(lista) ? lista : [])
    .map(item => item?.slug)
    .filter(slug => typeof slug === 'string' && /^[a-z0-9-]+$/.test(slug));
  let solicitado = null;
  try { solicitado = new URLSearchParams(busqueda).get('desde'); } catch { /* query no válida */ }
  const origen = slugs.includes(solicitado) ? solicitado : null;
  const primero = origen || slugs[0] || '';
  const segundo = slugs.find(slug => slug !== primero) || primero;
  return { a: primero, b: segundo, origen };
}

export function enlaceComparacion(tipo, slug, lista) {
  const destino = destinos[tipo];
  if (!destino) return null;
  const slugs = (Array.isArray(lista) ? lista : []).map(x => x?.slug);
  if (typeof slug !== 'string' || !slugs.includes(slug) || !/^[a-z0-9-]+$/.test(slug)) return destino;
  return `${destino}?desde=${encodeURIComponent(slug)}`;
}
