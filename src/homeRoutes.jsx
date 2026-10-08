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
  { label: 'Quiero ahorrar', href: '/finanzas/ahorro', icon: 'wallet', tone: 'green' },
  { label: 'Estoy eligiendo carrera', href: '/carreras', icon: 'cap', tone: 'violet' },
  { label: 'Pienso mudarme de estado', href: '/estados/comparar', icon: 'map', tone: 'teal' }
];

const DURACION_RUTA = 14 * 24 * 60 * 60 * 1000;

function rutaGuardada() {
  try {
    const dato = JSON.parse(localStorage.getItem('ml-orbita-route') || 'null');
    // Nunca confiar en destinos introducidos manualmente ni mostrar rutas indefinidas.
    const ruta = RUTAS.find((item) => item.href === dato?.href && item.label === dato?.label);
    const tiempo = Number(dato?.updatedAt);
    if (!ruta || !Number.isFinite(tiempo) || tiempo > Date.now() || Date.now() - tiempo > DURACION_RUTA) return null;
    return ruta;
  } catch { return null; }
}

function recordarRuta(ruta) {
  try {
    localStorage.setItem('ml-orbita-route', JSON.stringify({
      label: ruta.label, href: ruta.href, updatedAt: Date.now(),
    }));
  } catch { /* Navegación disponible aunque se bloquee almacenamiento. */ }
}

function descartarRuta() {
  try { localStorage.removeItem('ml-orbita-route'); } catch { /* sin almacenamiento */ }
}

// El primer pantallazo cubre tres necesidades distintas. Las demás rutas
// permanecen como enlaces normales, disponibles en un desplegable nativo.
const RUTAS_INICIO = ['Me despidieron', 'Quiero ahorrar', 'Estoy eligiendo carrera'];
const rutasPrincipales = RUTAS.filter((r) => RUTAS_INICIO.includes(r.label));
const rutasAdicionales = RUTAS.filter((r) => !RUTAS_INICIO.includes(r.label));

function EnlaceSituacion({ ruta }) {
  return (
    <a className={`orb-home-route orb-tone-${ruta.tone}`} href={ruta.href} onClick={() => recordarRuta(ruta)}>
      <span className="orb-home-route-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICONOS[ruta.icon]} /></svg></span>
      <span>{ruta.label}</span>
      <b aria-hidden="true">›</b>
    </a>
  );
}

export function HomeRoutes() {
  return (
    <section className="orb-home-routes" id="orb-home-routes" aria-labelledby="orb-home-routes-title">
      <h2 id="orb-home-routes-title">¿Qué estás viviendo?</h2>
      <div className="orb-home-route-grid">
        {rutasPrincipales.map((ruta) => <EnlaceSituacion key={ruta.href} ruta={ruta} />)}
      </div>
      <details className="orb-home-extra">
        <summary>Ver otras 3 situaciones <span aria-hidden="true">+</span></summary>
        <div className="orb-home-extra-grid">
          {rutasAdicionales.map((ruta) => <EnlaceSituacion key={ruta.href} ruta={ruta} />)}
        </div>
      </details>
      <button type="button" className="orb-home-search" onClick={() => document.querySelector('[data-orbita-search-open]')?.click()}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>
        <span>¿Ya sabes qué buscas? <strong>Busca una calculadora</strong></span>
        <b aria-hidden="true">›</b>
      </button>
    </section>
  );
}

export function SituationCard() {
  const [ruta, setRuta] = useState(rutaGuardada);
  // La portada ya pregunta qué necesita el visitante: no repetirla cuando no hay ruta.
  if (!ruta) return null;
  return (
    <aside className="orb-situation-card" data-orbita-situation-card="true" aria-label="Retomar tu última consulta">
      <div>
        <span>Continúa donde te quedaste</span>
        <strong>{ruta.label}</strong>
      </div>
      <div className="orb-situation-actions">
        <a href={ruta.href}>Retomar herramienta <b aria-hidden="true">→</b></a>
        <button type="button" onClick={() => { descartarRuta(); setRuta(null); }}>Descartar</button>
      </div>
    </aside>
  );
}
