import { useEffect, useRef, useState } from 'react';

// Cifra que llega a su valor en ~0.5 s cuando cambia. El valor final siempre es exacto;
// con «reducir movimiento» o sin requestAnimationFrame se muestra directo.
export function useAnimatedNumber(target, duracion = 480) {
  const [valor, setValor] = useState(target);
  const actual = useRef(target);
  useEffect(() => {
    const desde = actual.current;
    const reducir = typeof window === 'undefined' || !window.requestAnimationFrame
      || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducir || !Number.isFinite(target) || !Number.isFinite(desde) || desde === target) {
      actual.current = target; setValor(target); return undefined;
    }
    let frame; const inicio = performance.now();
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / duracion);
      const suave = 1 - (1 - t) ** 3;
      const v = t === 1 ? target : desde + (target - desde) * suave;
      actual.current = v; setValor(v);
      if (t < 1) frame = requestAnimationFrame(paso);
    };
    frame = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frame);
  }, [target, duracion]);
  return valor;
}
