// Reserva de espacio publicitario dentro del flujo. Solo ocupa lugar: no carga ni inicializa AdSense.
// "970x90" se muestra como 970×90 en escritorio y 320×50 en móvil (ver orbita-v3-prepaint.css).
export default function AdReserve({ size = '970x90' }) {
  const compact = size === '320x50';
  return (
    <aside
      className={`orb-ad-reserve orb-ad-leaderboard${compact ? ' orb-ad-compact' : ''}`}
      data-orbita-ad-reserve
      data-ad-size={size}
      aria-hidden="true"
    />
  );
}
