import datos from './data/profesiones.json';

const FOTO_ID = '3184465';
const foto = (width = 1400) => `https://images.pexels.com/photos/${FOTO_ID}/pexels-photo-${FOTO_ID}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
const dinero = (valor) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(valor);
const numero = (valor) => new Intl.NumberFormat('es-MX').format(valor);

export function esRutaProfesion() {
  if (typeof window === 'undefined') return false;
  return /^\/carreras\/profesion\/[^/]+\/?$/.test(window.location.pathname);
}

function profesionActual() {
  if (typeof window === 'undefined') return null;
  const slug = window.location.pathname.split('/').filter(Boolean)[2];
  return datos.profesiones.find((p) => p.slug === slug) || null;
}

function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="brand" href="/" aria-label="MiLana, inicio"><span className="brand-mark" aria-hidden="true">M</span><span className="brand-name">MiLana</span></a>
        <nav className="desktop-nav" aria-label="Principal"><a href="/carreras">Carreras</a><a href="/finanzas">Finanzas</a><a href="/#calculadoras">Calculadoras</a><a href="/aprende">Aprende</a></nav>
        <a className="header-cta" href="/calculadoras/bruto-a-neto">Calcular sueldo</a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer"><div className="shell footer-inner"><div><span className="brand-name">MiLana</span><p>Dinero claro para decidir mejor.</p><p>{datos.fuenteGeneral}.</p><p>{datos.nota}</p></div><p>MiLana © 2026 · Hecho en México</p></div></footer>
  );
}

function Metric({ label, value, note }) {
  return <article className="profession-metric"><span>{label}</span><strong>{value}</strong><p>{note}</p></article>;
}

export default function CareerProfessionPages() {
  const p = profesionActual();
  if (!p) return <><Header /><main className="profession-not-found"><h1>Profesión no encontrada</h1><a href="/carreras">Volver a carreras</a></main><Footer /></>;

  const diferencia = p.ingreso - datos.promedioNacional;
  const diferenciaPct = (diferencia / datos.promedioNacional) * 100;
  const relacionadas = datos.profesiones
    .filter((x) => x.slug !== p.slug)
    .sort((a, b) => Math.abs(a.ingreso - p.ingreso) - Math.abs(b.ingreso - p.ingreso))
    .slice(0, 4);

  return (
    <div className="profession-page">
      <Header />
      <main>
        <section className="profession-hero">
          <div className="shell profession-hero-grid">
            <div className="profession-hero-copy">
              <nav aria-label="Ruta"><a href="/">Inicio</a><span>/</span><a href="/carreras">Carreras</a><span>/</span><span>{p.nombre}</span></nav>
              <p className="eyebrow">Cuánto gana · México 2026</p>
              <h1>{p.consulta}</h1>
              <p className="profession-lede">El Observatorio Laboral reporta un ingreso mensual promedio de <strong>{dinero(p.ingreso)}</strong> para profesionistas ocupados en {p.nombre}. Úsalo como referencia de grupo, no como sueldo inicial ni como oferta de trabajo.</p>
              <div className="profession-proof"><span>ENOE 2026-T2</span><span>STPS</span><span>INEGI</span></div>
            </div>
            <figure className="profession-hero-media"><img src={foto(1400)} srcSet={`${foto(720)} 720w, ${foto(1400)} 1400w`} sizes="(max-width: 900px) 100vw, 46vw" alt="Profesionales revisando información de trabajo y salarios" loading="eager" /></figure>
          </div>
        </section>

        <section className="profession-summary">
          <div className="shell">
            <div className="profession-metrics">
              <Metric label="Ingreso promedio mensual" value={dinero(p.ingreso)} note={`${diferencia >= 0 ? '+' : ''}${diferenciaPct.toFixed(1)}% frente al promedio profesional nacional`} />
              <Metric label="Profesionistas ocupados" value={numero(p.ocupados)} note={`Personas ocupadas con esta formación en el corte publicado`} />
              <Metric label="Área" value={p.area} note="Clasificación usada por el Observatorio Laboral" />
            </div>
            <aside className="profession-source"><span>Dato verificado</span><div><strong>{datos.fuenteGeneral}</strong><p>{datos.nota}</p></div></aside>
          </div>
        </section>

        <section className="profession-context">
          <div className="shell profession-context-grid">
            <div className="profession-context-copy"><p className="eyebrow">Cómo leer la cifra</p><h2>El promedio sirve para orientarte; no para predecir tu primer sueldo.</h2><p>La cifra agrupa personas de distintas edades, regiones, experiencias y tipos de empleo. Por eso MiLana la compara con el promedio nacional y la acompaña con el tamaño observado del mercado laboral.</p><p>Si estás evaluando una carrera, conviene mirar también ubicación, afinidad entre estudios y empleo, modalidad de trabajo y evolución del sector antes de decidir.</p></div>
            <div className="profession-distribution">
              <div><span>Hombres entre profesionistas ocupados</span><strong>{p.hombres}%</strong><i style={{'--profession-share': `${p.hombres}%`}} /></div>
              <div><span>Mujeres entre profesionistas ocupados</span><strong>{p.mujeres}%</strong><i style={{'--profession-share': `${p.mujeres}%`}} /></div>
              {p.afinidad && <div><span>Ocupación afín a los estudios</span><strong>{p.afinidad}%</strong><p>Dato nacional publicado por OLA para esta carrera.</p></div>}
              {p.subordinados && <div><span>Trabajo subordinado y remunerado</span><strong>{p.subordinados}%</strong><p>Proporción publicada por OLA para esta carrera.</p></div>}
              {p.cuentaPropia && <div><span>Trabajo por cuenta propia</span><strong>{p.cuentaPropia}%</strong><p>Proporción publicada por OLA para esta carrera.</p></div>}
            </div>
          </div>
        </section>

        <section className="profession-money">
          <div className="shell profession-money-inner"><div><p className="eyebrow">Del promedio a tu bolsillo</p><h2>¿Qué significaría ese sueldo después de impuestos y cuotas?</h2><p>Usa {dinero(p.ingreso)} como punto de partida en Bruto → Neto y compara después con ahorro, vivienda y otras metas. El resultado seguirá siendo una estimación, pero ya estará aterrizado a una decisión personal.</p></div><div className="profession-actions"><a className="btn btn-primary" href="/calculadoras/bruto-a-neto">Calcular sueldo neto</a><a className="btn btn-secondary" href="/finanzas/presupuesto">Llevarlo a un presupuesto</a></div></div>
        </section>

        <section className="profession-related">
          <div className="shell"><div className="profession-related-head"><div><p className="eyebrow">Compara sin perder contexto</p><h2>Profesiones con ingresos cercanos</h2></div><a href="/carreras/mejor-pagadas">Ver ranking completo →</a></div><div className="profession-related-grid">{relacionadas.map((r) => <a key={r.slug} href={`/carreras/profesion/${r.slug}`}><span>{r.area}</span><h3>{r.nombre}</h3><strong>{dinero(r.ingreso)}/mes</strong><p>{numero(r.ocupados)} ocupados</p></a>)}</div></div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
