import { NAVEGACION_MILANA, seccionNavegacion } from './lib/siteNavigation.js';

// Fallback semántico React. El shell Órbita visible se genera con la misma lista.
// CTA individual conserva el contexto de cada sección.
export default function SiteHeader({ ctaHref = '/finanzas/mi-situacion', ctaLabel = 'Mi situación' }) {
  const actual = typeof window === 'undefined' ? null : seccionNavegacion(window.location.pathname);
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="brand" href="/" aria-label="MiLana, inicio">
          <img className="brand-logo" src="/milana-horizontal.svg" width="144" height="27" alt="" aria-hidden="true" />
        </a>
        <nav className="desktop-nav" aria-label="Principal">
          {NAVEGACION_MILANA.map(([id, href, titulo]) => (
            <a key={id} href={href} aria-current={actual === id ? 'page' : undefined}>{titulo}</a>
          ))}
        </nav>
        <a className="header-cta" href={ctaHref}>{ctaLabel}</a>
      </div>
    </header>
  );
}
