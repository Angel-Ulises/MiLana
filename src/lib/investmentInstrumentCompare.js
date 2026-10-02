import { investmentComparisonDimensions, investmentInstrumentClasses } from '../data/investment-instrument-classes.js';

export function obtenerInstrumentoEducativo(id) {
  return investmentInstrumentClasses.find((item) => item.id === id) || null;
}

export function compararInstrumentosEducativos(ids = []) {
  const unicos = [...new Set(ids.filter(Boolean))].slice(0, 2);
  const instrumentos = unicos.map(obtenerInstrumentoEducativo).filter(Boolean);
  return {
    instrumentos,
    dimensiones: investmentComparisonDimensions.map((dimension) => ({
      ...dimension,
      valores: instrumentos.map((instrumento) => ({
        instrumentoId: instrumento.id,
        texto: instrumento.dimensiones[dimension.id],
      })),
    })),
    tieneGanador: false,
    recomiendaProducto: false,
    usaRendimientoActual: false,
    usaScore: false,
    nota: 'La comparación describe diferencias estructurales. No ordena instrumentos, no evalúa idoneidad personal y no sustituye prospectos, contratos ni asesoría regulada.',
  };
}
