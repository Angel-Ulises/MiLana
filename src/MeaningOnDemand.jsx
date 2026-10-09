// Una explicación corta dentro del resultado, con el contexto completo disponible al tocar.
// Reutiliza la preferencia de lectura; no almacena resultados ni modifica cálculos.
import ReadingDetails from './ReadingDetails.jsx';
export default function MeaningOnDemand({ resumen = 'Entender este resultado', detalle, children, className = '' }) {
  if (!detalle && !children) return null;
  return (
    <ReadingDetails className={['ml-result-meaning', className].filter(Boolean).join(' ')}>
      <summary>{resumen} <span aria-hidden="true">↓</span></summary>
      <div className="ml-result-meaning-body">
        {detalle && <p>{detalle}</p>}
        {children}
      </div>
    </ReadingDetails>
  );
}