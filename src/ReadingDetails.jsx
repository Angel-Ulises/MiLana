import { useState } from 'react';
import { useReadingDepth } from './lib/useReadingDepth.js';

// La preferencia abre el contexto; una decisión manual manda durante la visita.
// Conserva <details>/<summary> nativos y no persiste aperturas individuales.
export default function ReadingDetails({ children, manualOpen, onManualChange, ...props }) {
  const nivel = useReadingDepth();
  const [localManual, setLocalManual] = useState(null);
  // Un propietario estable puede conservar la decisión si el resultado se desmonta.
  const manual = onManualChange ? manualOpen : localManual;
  const setManual = onManualChange || setLocalManual;
  const abierto = manual ?? nivel === 'experto';
  return <details {...props} open={abierto} onToggle={(event) => {
    // Ignora toggles de bloques anidados y los causados por la propia preferencia.
    if (event.target === event.currentTarget && event.currentTarget.open !== abierto) {
      setManual(event.currentTarget.open);
    }
  }}>{children}</details>;
}
