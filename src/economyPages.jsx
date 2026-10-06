import Detalle from './Detalle.jsx';
import { useMemo, useState } from 'react';
import datos from './data/economia.json';
import AdReserve from './AdReserve.jsx';

const foto = (id, width = 1400) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
const fechaLarga = (fecha) => new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${fecha}T12:00:00Z`));

export function esRutaEconomia() {
  if (typeof window === 'undefined') return false;
  return /^\/economia(?:\/[^/]+)?\/?$/.test(window.location.pathname);
}

function slugActual() {
  if (typeof window === 'undefined') return '';
  const partes = window.location.pathname.split('/').filter(Boolean);
  return partes[0] === 'economia' ? (partes[1] || '') : '';
}

function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="brand" href="/" aria-label="MiLana, inicio"><span className="brand-mark" aria-hidden="true">M</span><span className="brand-name">MiLana</span></a>
        <nav className="desktop-nav" aria-label="Principal">
          <a href="/finanzas">Finanzas</a><a href="/economia">Economía</a><a href="/carreras">Carreras</a><a href="/#calculadoras">Calculadoras</a><a href="/aprende">Aprende</a>
        </nav>
        <a className="header-cta" href="/finanzas/presupuesto">Ordenar mi dinero</a>
      </div>
    </header>
  );
}

function Footer() {
  return <><AdReserve size="970x90" /><footer className="site-footer"><div className="shell footer-inner"><div><span className="brand-name">MiLana</span><p>Dinero claro para decidir mejor.</p><p>{datos.nota}</p></div><p>MiLana © 2026 · Hecho en México</p></div></footer></>;
}

function Fuente({ articulo }) {
  const fuente = datos.fuentes.find((f) => f.id === articulo.fuenteId);
  if (!fuente) return null;
  return <Detalle className="orb-more-source" titulo="Fuente oficial" resumen={`${fuente.nombre} · ${articulo.fuenteFecha}`} cta="Ver fuente"><aside className="economy-source"><span>Fuente oficial</span><div><strong>{fuente.nombre}</strong><p>Publicado o actualizado: {articulo.fuenteFecha}. MiLana conserva la URL oficial en su registro editorial y muestra aquí el alcance sin convertir la nota en asesoría personalizada.</p></div></aside></Detalle>;
}

const NOTAS_TIPOGRAFICAS = new Set(['inflacion-primera-quincena-septiembre-2026', 'consumo-privado-agosto-2026']);

function ArticleCard({ articulo, featured = false }) {
  const conFoto = !NOTAS_TIPOGRAFICAS.has(articulo.slug);
  return (
    <a className={`economy-card${featured ? ' featured' : ''}${conFoto ? '' : ' economy-card--text'}`} href={`/economia/${articulo.slug}`}>
      {conFoto && <figure><img src={foto(articulo.fotoId, featured ? 1400 : 900)} alt={articulo.fotoAlt} loading={featured ? 'eager' : 'lazy'} /></figure>}
      <div className="economy-card-copy">
        <div className="economy-meta"><span>{articulo.categoria}</span><time dateTime={articulo.fecha}>{fechaLarga(articulo.fecha)}</time></div>
        <h2>{articulo.titulo}</h2>
        <p>{articulo.descripcion}</p>
        <div className="economy-card-bottom"><strong>{articulo.datoPrincipal}</strong><span>{articulo.datoEtiqueta}</span><b>Entender qué cambia →</b></div>
      </div>
    </a>
  );
}

function Hub() {
  const categorias = ['Todos', ...new Set(datos.articulos.map((a) => a.categoria))];
  const [categoria, setCategoria] = useState('Todos');
  const ordenados = useMemo(() => [...datos.articulos].sort((a, b) => b.fecha.localeCompare(a.fecha)), []);
  const visibles = categoria === 'Todos' ? ordenados : ordenados.filter((a) => a.categoria === categoria);
  const principal = visibles[0];
  const resto = visibles.slice(1);

  return (
    <div className="economy-page">
      <Header />
      <main>
        <section className="economy-hero">
          <div className="shell economy-hero-grid">
            <div>
              <p className="eyebrow">Radar económico · México</p>
              <h1>Economía para entender qué cambia en tu dinero.</h1>
              <p>Inflación, tasas, empleo, consumo y regiones, explicados con una regla simple: primero el dato oficial, después el contexto y al final una herramienta útil.</p>
              <nav className="ml-hub-shortcuts" aria-label="Explorar el Radar"><a href="#radar">Ver señales del Radar ↓</a><a href="#fuentes-radar">Consultar fuentes y fechas ↓</a></nav>
              <div className="economy-proof"><span>Fuentes oficiales</span><span>Fecha visible</span><span>Sin recomendaciones automáticas</span></div>
            </div>
            <div className="economy-hero-panel">
              <span>Cómo leer MiLana</span>
              <ol><li><b>01</b> Qué pasó</li><li><b>02</b> Por qué importa</li><li><b>03</b> A quién afecta</li><li><b>04</b> Qué herramienta sirve</li></ol>
            </div>
          </div>
        </section>

        <section className="economy-radar" id="radar">
          <div className="shell">
            <div className="economy-section-head"><div><p className="eyebrow">Actualidad con contexto</p><h2>Señales que vale la pena entender.</h2></div><p>El Radar no publica por volumen. Una señal entra cuando puede explicarse con una fuente identificable y conectarse con una decisión financiera o laboral concreta.</p></div>
            <div className="economy-filters" aria-label="Filtrar por categoría">{categorias.map((c) => <button key={c} type="button" className={categoria === c ? 'is-active' : ''} onClick={() => setCategoria(c)}>{c}</button>)}</div>
            {principal && <ArticleCard articulo={principal} featured />}
            {resto.length > 0 && <div className="economy-grid">{resto.map((a) => <ArticleCard key={a.slug} articulo={a} />)}</div>}
          </div>
        </section>

        <section className="economy-sources-section" id="fuentes-radar">
          <div className="shell economy-sources-grid">
            <div><p className="eyebrow">Fuentes que revisamos</p><h2>Cuándo se actualiza cada dato.</h2><p>Usamos datos públicos de INEGI y Banco de México. Actualizamos el Radar cuando sale una publicación nueva, no para llenar la portada de titulares.</p></div>
            <Detalle className="orb-more-calendar" titulo="Calendario de próximas publicaciones" resumen={datos.fuentes.map((f) => f.nombre.split(' — ')[0]).filter((v, i, arr) => arr.indexOf(v) === i).join(' · ')} cta="Ver fechas"><div className="economy-source-list">{datos.fuentes.map((f) => <article key={f.id}><span>{f.cadencia}</span><h3>{f.nombre}</h3><p>Próxima revisión prevista: {f.proximaRevision}</p></article>)}</div></Detalle>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Article({ articulo }) {
  const conFoto = !NOTAS_TIPOGRAFICAS.has(articulo.slug);
  const relacionados = datos.articulos.filter((a) => a.slug !== articulo.slug).slice(0, 3);
  return (
    <div className="economy-page economy-article-page">
      <Header />
      <main>
        <section className={`economy-article-hero${conFoto ? '' : ' economy-article-hero--text'}`}>
          <div className="shell economy-article-hero-grid">
            <div className="economy-article-copy">
              <nav aria-label="Ruta"><a href="/">Inicio</a><span>/</span><a href="/economia">Economía</a></nav>
              <div className="economy-meta"><span>{articulo.categoria}</span><time dateTime={articulo.fecha}>{fechaLarga(articulo.fecha)}</time></div>
              <h1>{articulo.titulo}</h1>
              <p>{articulo.descripcion}</p>
              <div className="economy-big-number"><strong>{articulo.datoPrincipal}</strong><span>{articulo.datoEtiqueta}</span></div>
            </div>
            {conFoto && <figure><img src={foto(articulo.fotoId)} srcSet={`${foto(articulo.fotoId, 720)} 720w, ${foto(articulo.fotoId, 1400)} 1400w`} sizes="(max-width: 900px) 100vw, 45vw" alt={articulo.fotoAlt} loading="eager" /></figure>}
          </div>
        </section>

        <section className="economy-steps-section"><div className="shell economy-steps">
          <article className="economy-step"><span>01</span><div><p className="eyebrow">Qué pasó</p><h2>El dato oficial</h2><p>{articulo.quePaso}</p></div></article>
          <article className="economy-step"><span>02</span><div><p className="eyebrow">Por qué importa</p><h2>El contexto que falta en un titular</h2><p>{articulo.porQueImporta}</p></div></article>
          <article className="economy-step"><span>03</span><div><p className="eyebrow">A quién afecta</p><h2>Dónde puede aparecer en la vida real</h2><p>{articulo.aQuienAfecta}</p></div></article>
          <article className="economy-step"><span>04</span><div><p className="eyebrow">Qué hacer con la información</p><h2>Convierte contexto en una revisión útil</h2><p>{articulo.queHacer}</p><div className="economy-actions"><a className="btn btn-primary" href={articulo.herramienta.href}>{articulo.herramienta.texto}</a><a className="btn btn-secondary" href={articulo.herramientaSecundaria.href}>{articulo.herramientaSecundaria.texto}</a></div></div></article>
        </div></section>

        <section className="economy-source-wrap"><div className="shell"><Fuente articulo={articulo} /></div></section>

        <section className="economy-related"><div className="shell"><div className="economy-related-head"><div><p className="eyebrow">Sigue el contexto</p><h2>Otras señales del Radar</h2></div><a href="/economia">Ver todo →</a></div><div className="economy-related-grid">{relacionados.map((a) => <a key={a.slug} href={`/economia/${a.slug}`}><span>{a.categoria}</span><h3>{a.titulo}</h3><strong>{a.datoPrincipal}</strong><p>{a.datoEtiqueta}</p></a>)}</div></div></section>
      </main>
      <Footer />
    </div>
  );
}

export default function EconomyPages() {
  const slug = slugActual();
  if (!slug) return <Hub />;
  const articulo = datos.articulos.find((a) => a.slug === slug);
  if (!articulo) return <div className="economy-page"><Header /><main className="economy-not-found"><h1>Nota no encontrada</h1><a href="/economia">Volver al Radar económico</a></main><Footer /></div>;
  return <Article articulo={articulo} />;
}
