import { useState } from 'react';
import { useReadingDepth } from './lib/useReadingDepth.js';

// La preferencia abre el contexto; una decisión manual manda durante la visita.
// Conserva <details>/<summary> nativos y no guarda aperturas individuales.
export default function ReadingDetails({ children, ...props }) {
  const nivel = useReadingDepth();
  const [manual, setManual] = useState(null);
  const abierto = manual ?? nivel === 'experto';
  return <details {...props} open={abierto} onToggle={(event) => {
    // Ignora toggles de bloques anidados y los causados por la propia preferencia.
    if (event.target === event.currentTarget && event.currentTarget.open !== abierto) {
      setManual(event.currentTarget.open);
    }
  }}>{children}</details>;
}
