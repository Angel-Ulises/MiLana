// Pure route resolver: takes the already-published catalogues as data.
// No network, no runtime state, no financial values.
const SEGURAS = new Set(['finiquito','liquidacion','aguinaldo','isr','resico','ptu','bruto-neto','vacaciones','infonavit']);

export function rutasDespuesDelResultado(id, editorial, paginas) {
  if (!SEGURAS.has(id)) return [];
  const rutas = new Map((paginas?.paginas || []).map(({ id: itemId, slug }) => [itemId, `/calculadoras/${slug}`]));
  return (editorial?.[id]?.siguientes || [])
    .filter((item) => item && typeof item.texto === 'string' && rutas.has(item.destino) && SEGURAS.has(item.destino) && item.destino !== id)
    .slice(0, 2)
    .map((item) => ({ titulo: item.texto, href: rutas.get(item.destino) }));
}
