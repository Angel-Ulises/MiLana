// Corte verificado con la lectura oficial de cetesdirecto que hizo el workflow cetes-reference-watch
// (GitHub Actions, corrida 42285034850, 2026-11-06 20:03 UTC; issue #103). Tasas idénticas a las
// lecturas del 4 y 5 de noviembre. La fecha es la que encabeza la tabla oficial; no es fecha de subasta.
export const CETES_REFERENCE = {
  checkedAt: '2026-11-06',
  sourceDate: '2026-11-06',
  sourceLabel: 'cetesdirecto — Valores gubernamentales / CETES',
  sourceUrl: 'https://www.cetesdirecto.com/tablas/valores_gubernamentales/cetes.html',
  institution: 'Nacional Financiera, S.N.C. / cetesdirecto',
  nominalValueMx: 10,
  scope: 'Precios y tasas indicativas publicadas por cetesdirecto. No son una cotización, una promesa de rendimiento ni una recomendación de compra.',
  products: [
    { id:'cetes-28', label:'CETES 28 días', displayTerm:'1 mes', days:28, indicativePrice:9.94, grossAnnualRatePct:6.50 },
    { id:'cetes-91', label:'CETES 91 días', displayTerm:'3 meses', days:91, indicativePrice:9.83, grossAnnualRatePct:6.69 },
    { id:'cetes-182', label:'CETES 182 días', displayTerm:'6 meses', days:182, indicativePrice:9.68, grossAnnualRatePct:6.72 },
    { id:'cetes-364', label:'CETES 364 días', displayTerm:'1 año', days:364, indicativePrice:9.35, grossAnnualRatePct:7.12 },
    { id:'cetes-728', label:'CETES 728 días', displayTerm:'2 años', days:728, indicativePrice:8.68, grossAnnualRatePct:7.85 },
  ],
};

export function getCetesReferenceById(id) {
  return CETES_REFERENCE.products.find((item) => item.id === id) || null;
}
