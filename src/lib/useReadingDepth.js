import { useEffect, useState } from 'react';
import { leerNivelLectura, observarNivelLectura } from './readingDepth.js';

export function useReadingDepth() {
  const [nivel, setNivel] = useState(leerNivelLectura);
  useEffect(() => {
    const dejarDeObservar = observarNivelLectura(setNivel);
    setNivel(leerNivelLectura());
    return dejarDeObservar;
  }, []);
  return nivel;
}
