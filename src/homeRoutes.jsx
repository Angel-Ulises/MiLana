// Bloques V4 del hero de Inicio renderizados desde React (antes los insertaba orbita-v3-experience.js
// después del primer render, lo que retrasaba el LCP y movía el layout). Mantener sincronizado con
// `options` y con enhanceHome() de public/orbita-v3-experience.js, que sale si estos nodos ya existen.
import { useState } from 'react';

const ICONOS = {
  exit: 'M14 5H6v14h8M10 12h10m0 0-3-3m3 3-3 3',
  work: 'M8 7V5h8v2m-11 3h14v9H5zM5 13h14',
  gift: 'M4 10h16v10H4zM3 7h18v3H3zm9 0v13M12 7c-1-4-6-4-6-1 0 2 3 1 6 1zm0 0c1-4 6-4 6-1 0 2-3 1-6 1z',
  wallet: 'M4 7h15v11H4zM4 9V6h12m3 5h-5v4h5',
  cap: 'm3 9 9-5 9 5-9 5zm4 3v5c3 2 7 2 10 0v-5m4-3v6',
  map: 'm4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2zM9 4v14m6-12v14'
};

const RUTAS = [
  { label: 'Me despidieron', href: '/calculadoras/liquidacion', icon: 'exit', tone: 'blue' },
  { label: 'Renuncié', href: '/calculadoras/finiquito', icon: 'work', tone: 'blue' },
  { label: 'Voy a cobrar aguinaldo', href: '/calculadoras/aguinaldo', icon: 'gift', tone: 'coral' },
  { label: 'Quiero ahorrar', href: '/finanzas', icon: 'wallet', tone: 'green' },
  { label: 'Estoy eligiendo carrera', href: '/carreras', icon: 'cap', tone: 'violet' },
  { label: 'Pienso mudarme de estado', href: '/estados', icon: 'map', tone: 'teal' }
];

function rutaGuardada() {
  try {
    const guardada = JSON.parse(localStorage.getItem('ml-orbita-route') || 'null');
    // Solo rutas internas guardadas por este mismo componente.
    return guardada && typeof guardada.label === 'string' && /^\/(?!\/)/.test(String(guardada.href)) ? guardada : null;
  }
  catch { return null; }
}

function recordarRuta(ruta) {
  try {
    localStorage.setItem('ml-orbita-route', JSON.stringify({ label: ruta.label, href: ruta.href, step: 1, updatedAt: Date.now() }));
  } catch { /* sin almacenamiento */ }
}

export function HomeRoutes() {
  return (
    <section className="orb-home-routes" id="orb-home-routes" aria-labelledby="orb-home-routes-title">
      <h2 id="orb-home-routes-title">¿Qué estás viviendo?</h2>
      <div className="orb-home-route-grid">
        {RUTAS.map((ruta) => (
          <a key={ruta.href} className={`orb-home-route orb-tone-${ruta.tone}`} href={ruta.href} onClick={() => recordarRuta(ruta)}>
            <span className="orb-home-route-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICONOS[ruta.icon]} /></svg></span>
            <span>{ruta.label}</span>
            <b aria-hidden="true">›</b>
          </a>
        ))}
      </div>
      <button type="button" className="orb-home-search" onClick={() => document.querySelector('[data-orbita-search-open]')?.click()}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>
        <span>¿Ya sabes qué buscas? <strong>Busca una calculadora</strong></span>
        <b aria-hidden="true">›</b>
      </button>
    </section>
  );
}

export function SituationCard() {
  const [ruta] = useState(rutaGuardada);
  return (
    <section className="orb-situation-card" data-orbita-situation-card="true" aria-label="Mi situación">
      <div>
        <span>Mi situación · paso 1 de 4</span>
        {ruta ? (
          <>
            <strong>{ruta.label}</strong>
            <p>Tu ruta queda guardada en este dispositivo para que puedas retomarla.</p>
          </>
        ) : (
          <>
            <strong>Empieza por lo que estás viviendo</strong>
            <p>Elige una ruta y MiLana te lleva a la herramienta correcta sin hacerte adivinar qué buscar.</p>
          </>
        )}
      </div>
      <a href={ruta?.href || '#orb-home-routes'}>
        <span>Siguiente:</span> {ruta ? 'continuar mi ruta' : 'elegir mi situación'} <b>→</b>
      </a>
    </section>
  );
}
