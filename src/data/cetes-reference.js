// Corte de la tabla oficial de cetesdirecto con encabezado «CETES 11 Noviembre 2026», leído el
// 2026-11-11 por Orion (equipo de MiLana) en navegador y corroborado con lector web. Lectura delegada:
// esta sesión no pudo abrir la URL (sin acceso de red). Evidencia: data/cetes/lecturas/2026-11-11.json.
// La fecha es la que encabeza la tabla oficial; no es fecha de subasta (la tabla no la publica).
export const CETES_REFERENCE = {
  // checkedAt: fecha de la lectura oficial verificada. sourceDate: fecha que encabeza la tabla oficial.
  // auctionDate: la tabla leída no publica fecha de subasta; queda en null en lugar de inferirla.
  checkedAt: '2026-11-11',
  sourceDate: '2026-11-11',
  auctionDate: null,
  verification: 'Lectura delegada del 2026-11-11: tabla oficial leída en navegador por Orion (equipo de MiLana) y corroborada con lector web; evidencia en data/cetes/lecturas/2026-11-11.json.',
  sourceLabel: 'cetesdirecto — Valores gubernamentales / CETES',
  sourceUrl: 'https://www.cetesdirecto.com/tablas/valores_gubernamentales/cetes.html',
  institution: 'Nacional Financiera, S.N.C. / cetesdirecto',
  nominalValueMx: 10,
  scope: 'Precios y tasas indicativas publicadas por cetesdirecto. No son una cotización, una promesa de rendimiento ni una recomendación de compra.',
  products: [
    { id:'cetes-28', label:'CETES 28 días', displayTerm:'1 mes', days:28, indicativePrice:9.95, grossAnnualRatePct:6.20 },
    { id:'cetes-91', label:'CETES 91 días', displayTerm:'3 meses', days:91, indicativePrice:9.83, grossAnnualRatePct:6.47 },
    { id:'cetes-182', label:'CETES 182 días', displayTerm:'6 meses', days:182, indicativePrice:9.67, grossAnnualRatePct:6.61 },
    { id:'cetes-364', label:'CETES 364 días', displayTerm:'1 año', days:364, indicativePrice:9.34, grossAnnualRatePct:6.95 },
    { id:'cetes-728', label:'CETES 728 días', displayTerm:'2 años', days:728, indicativePrice:8.68, grossAnnualRatePct:7.85 },
  ],
};

export function getCetesReferenceById(id) {
  return CETES_REFERENCE.products.find((item) => item.id === id) || null;
}
