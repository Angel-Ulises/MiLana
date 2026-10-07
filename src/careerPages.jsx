import Detalle from './Detalle.jsx';
import { useMemo, useState } from 'react';
import datos from './data/carreras.json';
import profesiones from './data/profesiones.json';
import ocupacionesEstados from './data/stateOccupations.json';
import AdReserve from './AdReserve.jsx';
import DecisionExplorer from './decisionExplorer.jsx';

const PEXELS = {
  hub: '6147267',
  salarios: '3184465',
  estados: '3184291',
};

// 3184465 (apretón de manos) trae la cabeza cortada en el original: se recorta 16:9 anclado abajo.
const RECORTE_ABAJO = new Set(['3184465']);
const pexels = (id, width = 1400) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}${RECORTE_ABAJO.has(id) ? `&h=${Math.round(width * 0.5625)}&fit=crop&crop=bottom` : ''}`;

const dinero = (valor) => new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
}).format(valor);

const numero = (valor) => new Intl.NumberFormat('es-MX').format(valor);

export function esRutaCarreras() {
  if (typeof window === 'undefined') return false;
  return /^\/carreras(?:\/[^/]+)?\/?$/.test(window.location.pathname);
}

function slugActual() {
  if (typeof window === 'undefined') return '';
  const partes = window.location.pathname.split('/').filter(Boolean);
  return partes[0] === 'carreras' ? (partes[1] || '') : '';
}

function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="brand" href="/" aria-label="MiLana, inicio">
          <img className="brand-logo" src="/milana-horizontal.svg" width="144" height="27" alt="" aria-hidden="true" />
        </a>
        <nav className="desktop-nav" aria-label="Principal">
          <a href="/carreras">Carreras</a>
          <a href="/finanzas">Finanzas</a>
          <a href="/#calculadoras">Calculadoras</a>
          <a href="/aprende">Aprende</a>
        </nav>
        <a className="header-cta" href="/calculadoras/bruto-a-neto">Calcular sueldo</a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <><AdReserve size="970x90" /><footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <span className="brand-name">MiLana</span>
          <p>Dinero claro para decidir mejor.</p>
          <p>Datos laborales: Observatorio Laboral (STPS), con cifras de la ENOE de INEGI al segundo trimestre de 2026.</p>
          <p>Los promedios describen grupos y no garantizan el ingreso de una persona.</p>
        </div>
        <p>MiLana © 2026 · Hecho en México</p>
      </div>
    </footer></>
  );
}

function Fuente() {
  return (
    <aside className="career-source" aria-label="Fuente y alcance">
      <span>Dato verificado</span>
      <div>
        <strong>{datos.fuente}</strong>
        <p>{datos.nota}</p>
      </div>
    </aside>
  );
}

function Hero({ eyebrow, title, lede, image = PEXELS.salarios, imageAlt, compact = false }) {
  return (
    <section className={`career-hero${compact ? " career-hero-compact" : ""}`}>
      <div className="shell career-hero-grid">
        <div className="career-hero-copy">
          <nav className="career-breadcrumb" aria-label="Ruta de navegación">
            <a href="/">Inicio</a><span>/</span><a href="/carreras">Carreras</a>
          </nav>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="career-hero-lede">{lede}</p>
          <div className="career-hero-proof">
            <span>ENOE 2026-T2</span><span>STPS</span><span>INEGI</span>
          </div>
        </div>
        <figure className="career-hero-media">
          <img src={pexels(image)} srcSet={`${pexels(image, 720)} 720w, ${pexels(image, 1400)} 1400w`} sizes="(max-width: 900px) 100vw, 48vw" alt={imageAlt} loading="eager" />
        </figure>
      </div>
    </section>
  );
}

function SalaryRows({ rows, mode = 'income' }) {
  return (
    <div className="career-ranking" role="list">
      {rows.map((row, index) => (
        <article className="career-rank-row" key={row.carrera} role="listitem">
          <span className="career-rank-number">{String(index + 1).padStart(2, '0')}</span>
          <div className="career-rank-name">
            <h3>{row.carrera}</h3>
            <p>{numero(row.ocupados)} profesionistas ocupados</p>
          </div>
          <strong>{mode === 'income' ? `${dinero(row.ingreso)}/mes` : numero(row.ocupados)}</strong>
        </article>
      ))}
    </div>
  );
}

function NextRoutes({ current }) {
  const rutas = [
    ['mejor-pagadas', 'Carreras mejor pagadas', '/carreras/mejor-pagadas'],
    ['mas-demandadas', 'Carreras con más ocupados', '/carreras/mas-demandadas'],
    ['por-estado', 'Sueldos por estado', '/carreras/por-estado'],
    ['menor-ingreso', 'Carreras con menor ingreso', '/carreras/peor-pagadas'],
  ].filter(([id]) => id !== current);
  return (
    <section className="career-next">
      <div className="shell">
        <p className="eyebrow">Sigue comparando</p>
        <div className="career-next-grid">
          {rutas.map(([id, titulo, href]) => <a href={href} key={id}>{titulo}<span>→</span></a>)}
        </div>
      </div>
    </section>
  );
}

function Hub() {
  const rutas = [
    { titulo: 'Carreras mejor pagadas', href: '/carreras/mejor-pagadas' },
    { titulo: 'Profesionistas ocupados', href: '/carreras/mas-demandadas' },
    { titulo: 'Salarios por estado', href: '/carreras/por-estado' },
    { titulo: 'Carreras de menor ingreso', href: '/carreras/peor-pagadas' },
  ];
  const perfiles = profesiones.profesiones.slice(0, 8);
  const preguntas = [
    ['Ingresos', '¿Qué carreras pagan más en México?', '/carreras/mejor-pagadas'],
    ['Mercado', '¿Cuáles concentran más profesionistas ocupados?', '/carreras/mas-demandadas'],
    ['Estados', '¿Cuánto ganan los profesionistas en mi estado?', '/carreras/por-estado'],
    ['Estados', '¿Qué trabajos concentran más personas en mi estado?', '/carreras/por-estado'],
    ['Comparar', '¿Cómo comparo dos carreras sin elegir solo por sueldo?', '/carreras/comparar'],
    ['Conceptos', '¿Carrera estudiada y ocupación son lo mismo?', '/carreras/ocupaciones'],
    ['Profesión', '¿Cuánto gana alguien de Ciencias de la computación?', '/carreras/profesion/ciencias-computacion'],
    ['Profesión', '¿Cuánto gana alguien de Derecho?', '/carreras/profesion/derecho'],
    ['Ingreso real', '¿Cuánto quedaría neto de un sueldo?', '/calculadoras/bruto-a-neto'],
  ];
  return (
    <>
      <Hero compact eyebrow="Carreras · Trabajo · Dinero" title="Elegir carrera también es una decisión financiera." lede="Compara ingresos, tamaño del mercado laboral y diferencias regionales con datos públicos. Después convierte esas cifras en ingreso neto, ahorro y decisiones de vida." image={PEXELS.hub} imageAlt="Estudiantes universitarios colaborando frente a una laptop" />
      <main>
        <section className="career-hub-section ecosystem-hub" id="explorar" aria-label="Explorador de carreras y empleos">
          <div className="shell">
            <DecisionExplorer initialTopic="carrera" />
            <nav className="ecosystem-shortcuts" aria-label="Datos y rankings de carreras">
              <span className="ecosystem-shortcuts-label">Consultar datos de carreras</span>
              <div className="ecosystem-shortcuts-grid">
                {rutas.map((r) => <a href={r.href} key={r.href}>{r.titulo}<span aria-hidden="true">↗</span></a>)}
              </div>
            </nav>
            <details className="ecosystem-more-questions">
              <summary><span><small>Preguntas que abren otras preguntas</small><strong>Explora como buscarías en Google. · 9 preguntas</strong></span><span aria-hidden="true">+</span></summary>
              <nav aria-label="Más preguntas sobre carreras" className="ecosystem-more-links">
                {preguntas.map(([tipo, pregunta, href]) => <a href={href} key={pregunta}><span>{tipo}</span><strong>{pregunta}</strong></a>)}
              </nav>
            </details>
          </div>
        </section>

        <section className="career-snapshot">
          <div className="shell">
            <div className="career-snapshot-head">
              <div><p className="eyebrow">México · 2026</p><h2>Una fotografía rápida antes de explorar.</h2></div>
              <p>El Observatorio Laboral reporta un ingreso promedio mensual de <strong>$19,494</strong> entre profesionistas ocupados en México al segundo trimestre de 2026.</p>
            </div>
            <div className="career-stat-grid">
              <article><span>Mayor ingreso reportado</span><strong>$29,216</strong><p>Finanzas, banca y seguros</p></article>
              <article><span>Más profesionistas ocupados</span><strong>1.02 M</strong><p>Administración y gestión de empresas</p></article>
              <article><span>Ingreso profesional en Nuevo León</span><strong>$26,152</strong><p>Promedio mensual estatal</p></article>
            </div>
            <Fuente />
          </div>
        </section>

        <section className="career-profession-directory">
          <div className="shell">
            <div className="career-profession-head">
              <div><p className="eyebrow">Preguntas concretas</p><h2>¿Cuánto gana una profesión específica?</h2></div>
              <p>Cada perfil usa el mismo corte 2026 y separa ingreso promedio, población ocupada y contexto. No convierte el promedio en sueldo inicial.</p>
            </div>
            <div className="career-profession-grid">
              {perfiles.slice(0, 2).map((p) => <a key={p.slug} href={`/carreras/profesion/${p.slug}`}><span>{p.area}</span><h3>{p.nombre}</h3><strong>{dinero(p.ingreso)}/mes</strong><p>{numero(p.ocupados)} profesionistas ocupados</p><b>Ver perfil →</b></a>)}
            </div>
            {/* Resto de perfiles y profesiones: mismo contenido y enlaces, plegado para que la sección se lea de un vistazo. */}
            <Detalle className="orb-more-professions" titulo={`Ver más profesiones (${perfiles.length - 2 + profesiones.profesiones.slice(8).length})`} resumen={perfiles.slice(2).map((p) => p.nombre).join(' · ')} cta="Ver todas">
              <div className="career-profession-grid">{perfiles.slice(2).map((p) => <a key={p.slug} href={`/carreras/profesion/${p.slug}`}><span>{p.area}</span><h3>{p.nombre}</h3><strong>{dinero(p.ingreso)}/mes</strong><p>{numero(p.ocupados)} profesionistas ocupados</p><b>Ver perfil →</b></a>)}</div>
              <div className="career-profession-more">{profesiones.profesiones.slice(8).map((p) => <a key={p.slug} href={`/carreras/profesion/${p.slug}`}>{p.nombre}<span>→</span></a>)}</div>
            </Detalle>
          </div>
        </section>

        <section className="career-money-bridge">
          <div className="shell career-money-bridge-inner">
            <div><p className="eyebrow">Del dato a tu bolsillo</p><h2>Un salario promedio se vuelve útil cuando lo aterrizas.</h2><p>Prueba cualquier cifra en la calculadora Bruto → Neto para estimar ISR e IMSS y entender cuánto podría llegar realmente a tu cuenta.</p></div>
            <a href="/calculadoras/bruto-a-neto">Calcular ingreso neto <span>→</span></a>
          </div>
        </section>
      </main>
    </>
  );
}

function MejorPagadas() {
  return (
    <>
      <Hero eyebrow="Ingresos profesionales" title="Carreras mejor pagadas en México en 2026" lede="Estas son carreras con ingresos mensuales promedio altos dentro de las estadísticas del Observatorio Laboral. No son sueldos iniciales ni promesas de ingreso." imageAlt="Profesional revisando información financiera en una mesa de trabajo" />
      <main className="career-detail-main">
        <section className="career-data-section"><div className="shell career-data-layout"><div className="career-data-copy"><p className="eyebrow">Ingreso mensual promedio</p><h2>El ranking cambia cuando miras más que el sueldo.</h2><p>Finanzas, banca y seguros encabeza la tabla publicada por OLA con $29,216 mensuales. Diseño y Medicina siguen con $26,941 y $25,776. La cantidad de ocupados es importante: un ingreso alto en un grupo pequeño no describe el mismo mercado que una carrera masiva.</p><Fuente /></div><SalaryRows rows={datos.mejorPagadas} /></div></section>
        <section className="career-explain"><div className="shell career-explain-grid"><article><span>01</span><h3>No es sueldo de recién egresado</h3><p>El promedio incluye personas con distintas edades, experiencias, regiones y condiciones laborales.</p></article><article><span>02</span><h3>No mide vacantes abiertas</h3><p>Ingreso y demanda son preguntas distintas. Una carrera puede pagar bien y tener un mercado pequeño.</p></article><article><span>03</span><h3>El estado cambia la historia</h3><p>La ubicación puede mover significativamente el promedio profesional. Compara también por entidad.</p></article></div></section>
      </main>
      <NextRoutes current="mejor-pagadas" />
    </>
  );
}

function MasDemandadas() {
  return (
    <>
      <Hero eyebrow="Mercado laboral" title="¿Cuáles son las carreras más demandadas? Primero, mide bien." lede="No existe una sola cifra oficial que convierta automáticamente una carrera en ‘la más demandada’. Aquí usamos profesionistas ocupados como indicador de tamaño del mercado y lo distinguimos de vacantes o contrataciones futuras." imageAlt="Personas trabajando y conversando en un entorno profesional" />
      <main className="career-detail-main">
        <section className="career-data-section"><div className="shell career-data-layout"><div className="career-data-copy"><p className="eyebrow">Profesionistas ocupados</p><h2>Administración, Derecho y Contabilidad concentran grandes poblaciones profesionales.</h2><p>Al segundo trimestre de 2026, OLA reporta 1,021,925 profesionistas ocupados en Administración y gestión de empresas, 752,895 en Derecho y 678,464 en Contabilidad y fiscalización. Eso describe cuántas personas trabajan con esa formación; no equivale por sí solo a cuántas empresas están contratando hoy.</p><Fuente /></div><SalaryRows rows={datos.masOcupadas} mode="occupied" /></div></section>
        <section className="career-callout"><div className="shell"><strong>La regla MiLana:</strong><p>para hablar de “demanda” separaremos al menos cuatro señales: personas ocupadas, vacantes/contrataciones, crecimiento reciente y salario. Si una fuente solo mide una, no la presentaremos como si midiera las cuatro.</p></div></section>
      </main>
      <NextRoutes current="mas-demandadas" />
    </>
  );
}

function PorEstado() {
  const orden = useMemo(() => [...datos.estados].sort((a, b) => b.ingreso - a.ingreso), []);
  const [estado, setEstado] = useState('Nuevo León');
  const seleccionado = datos.estados.find((e) => e.estado === estado);
  const mercadoEstado = ocupacionesEstados.states.find((e) => e.state === estado);
  const trabajos = mercadoEstado?.occupations.slice(0, 5) ?? [];
  return (
    <>
      <Hero eyebrow="México por entidad" title="Sueldos de profesionistas por estado en 2026" lede="El lugar donde trabajas cambia el contexto salarial. Compara ingreso promedio y población profesional por entidad con la misma fuente y el mismo corte." image={PEXELS.estados} imageAlt="Vista urbana contemporánea de una ciudad mexicana" />
      <main className="career-detail-main">
        <section className="career-state-section"><div className="shell"><div className="career-state-tool"><div><p className="eyebrow">Compara tu estado</p><h2>¿Dónde quieres mirar?</h2></div><label>Estado<select value={estado} onChange={(e) => setEstado(e.target.value)}>{datos.estados.map((e) => <option key={e.estado}>{e.estado}</option>)}</select></label></div>{seleccionado && <article className="career-state-focus"><span>{seleccionado.estado}</span><strong>{dinero(seleccionado.ingreso)}<small>/mes</small></strong><p>{numero(seleccionado.ocupados)} profesionistas ocupados</p><a href="/calculadoras/bruto-a-neto">¿Cuánto sería neto? <b>→</b></a></article>}{mercadoEstado && <section className="career-state-occupations" aria-labelledby="career-state-occupations-title"><div className="career-state-occupations-head"><div><p className="eyebrow">Trabajo observado · ENOE 2026-T1</p><h2 id="career-state-occupations-title">¿Qué trabajos concentran más personas en {estado}?</h2></div><p>Data México permite mirar ocupaciones dentro de cada entidad. <strong>Ocupación observada no significa carrera estudiada ni vacantes abiertas.</strong></p></div><div className="career-state-occupation-list">{trabajos.map((o, index) => <article key={o.occupationId}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{o.occupation}</h3><p>{o.category} · {numero(o.records)} registros ENOE</p></div><strong>{numero(o.workforce)}<small> ocupados</small></strong></article>)}</div><a className="career-state-deep-link" href={`/estados/${mercadoEstado.slug}`}>Ver ficha laboral completa de {estado} <span>→</span></a></section>}<div className="career-state-table" role="table" tabIndex={0} aria-label="Ingreso promedio profesional por estado"><div className="career-state-row header" role="row"><span role="columnheader">Estado</span><span role="columnheader">Profesionistas ocupados</span><span role="columnheader">Ingreso mensual</span></div>{orden.map((e) => <div className={`career-state-row${e.estado === estado ? ' selected' : ''}`} role="row" key={e.estado}><span role="cell">{e.estado}</span><span role="cell">{numero(e.ocupados)}</span><strong role="cell">{dinero(e.ingreso)}</strong></div>)}</div><Fuente /></div></section>
      </main>
      <NextRoutes current="por-estado" />
    </>
  );
}

function MenorIngreso() {
  return (
    <>
      <Hero eyebrow="Comparar con contexto" title="Carreras peor pagadas en México: qué muestran los datos 2026" lede="‘Peor pagada’ es una búsqueda común, pero el dato correcto es ingreso promedio. Aquí mostramos carreras de los grupos revisados por OLA con promedios bajos y explicamos qué no puede concluirse de esa cifra." imageAlt="Persona joven revisando opciones profesionales y notas de estudio" />
      <main className="career-detail-main">
        <section className="career-data-section"><div className="shell career-data-layout"><div className="career-data-copy"><p className="eyebrow">Menor ingreso promedio observado</p><h2>Un promedio bajo no vuelve ‘mala’ a una carrera.</h2><p>En los grupos profesionales revisados, Didáctica, pedagogía y currículo registra $14,289 mensuales; Trabajo y atención social, $14,470; y formación docente de primaria, $14,974. La decisión también depende de estabilidad, afinidad con el trabajo, región, crecimiento, costo de estudiar y trayectoria individual.</p><Fuente /></div><SalaryRows rows={datos.menorIngreso} /></div></section>
        <section className="career-callout"><div className="shell"><strong>Importante:</strong><p>esta página no pretende etiquetar profesiones como “buenas” o “malas”. Ordena el ingreso promedio de las categorías disponibles que MiLana ha revisado y mantiene visible el alcance de la fuente.</p></div></section>
      </main>
      <NextRoutes current="menor-ingreso" />
    </>
  );
}

export default function CareerPages() {
  const slug = slugActual();
  let contenido;
  if (slug === 'mejor-pagadas') contenido = <MejorPagadas />;
  else if (slug === 'mas-demandadas') contenido = <MasDemandadas />;
  else if (slug === 'por-estado') contenido = <PorEstado />;
  else if (slug === 'peor-pagadas') contenido = <MenorIngreso />;
  else contenido = <Hub />;

  return <><Header />{contenido}<Footer /></>;
}
