export const CETES_REFERENCE = {
  checkedAt: '2026-10-06',
  sourceDate: '2026-10-06',
  sourceLabel: 'cetesdirecto — Valores gubernamentales / CETES',
  sourceUrl: 'https://www.cetesdirecto.com/tablas/valores_gubernamentales/cetes.html',
  institution: 'Nacional Financiera, S.N.C. / cetesdirecto',
  nominalValueMx: 10,
  scope: 'Precios y tasas indicativas publicadas por cetesdirecto. No son una cotización, una promesa de rendimiento ni una recomendación de compra.',
  products: [
    { id:'cetes-28', label:'CETES 28 días', displayTerm:'1 mes', days:28, indicativePrice:9.95, grossAnnualRatePct:6.01 },
    { id:'cetes-91', label:'CETES 91 días', displayTerm:'3 meses', days:91, indicativePrice:9.83, grossAnnualRatePct:6.73 },
    { id:'cetes-182', label:'CETES 182 días', displayTerm:'6 meses', days:182, indicativePrice:9.65, grossAnnualRatePct:7.01 },
    { id:'cetes-364', label:'CETES 364 días', displayTerm:'1 año', days:364, indicativePrice:9.32, grossAnnualRatePct:7.44 },
    { id:'cetes-728', label:'CETES 728 días', displayTerm:'2 años', days:728, indicativePrice:8.68, grossAnnualRatePct:8.01 },
  ],
};

export function getCetesReferenceById(id) {
  return CETES_REFERENCE.products.find((item) => item.id === id) || null;
}
