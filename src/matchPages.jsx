import { useEffect, useMemo, useRef, useState } from 'react';
import SiteHeader from './siteHeader.jsx';
import catalogo from './data/match-catalogo.json';
import {
  BASE_MATCH, GRUPOS_LECTURA, MAX_COMPARAR, MICROTEXTO_ESTADO, alternarSeleccion, clasificarPorFiltros, datoDe,
  estadoEfectivo, fechaLegible, filasComparacion, hoyISO, leerSeleccion, ordenar, resumenCobertura, rutaCategoria,
  rutaFicha, soloDiferencias, dominio,
} from './lib/matchCatalog.js';
import { LECTURAS, MATCH_CATEGORIAS, ORDEN_NOMBRE } from './lib/matchCategorias.js';

const CATEGORIAS = catalogo.categorias;
const fuenteDe = (ev) => catalogo.fuentes[ev.f] || {};

export function resolverRutaMatch(pathname = '/') {
  const partes = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  if (partes[0] !== 'finanzas' || partes[1] !== 'match') return { vista: 'fuera' };
  if (partes.length === 2) return { vista: 'inicio' };
  if (partes[2] === 'metodologia' && partes.length === 3) return { vista: 'metodologia' };
  const categoria = CATEGORIAS.find((c) => c.slug === partes[2]);
  if (!categoria) return { vista: 'no-encontrado' };
  if (partes.length === 3) return { vista: 'categoria', categoria };
  const producto = catalogo.productos.find((p) => p.categoria === categoria.id && p.slug === partes[3]);
  if (!producto || partes.length > 4) return { vista: 'no-encontrado', categoria };
  return { vista: 'ficha', categoria, producto };
}

// ---------- Piezas compartidas ----------
function Migas({ items }) {
  return <nav className="match-crumbs" aria-label="Ruta">{items.map(([texto, href], i) => <span key={texto}>{i > 0 && <span aria-hidden="true">/</span>}{href ? <a href={href}>{texto}</a> : <span aria-current="page">{texto}</span>}</span>)}</nav>;
}

const ICONO_ESTADO = { verificado: '✓', observado: '○', nd: '–', na: '∅', conflicto: '!', retenido: '‖', caducado: '×', revision: '↻' };

function Estado({ estado, compacto = false }) {
  return <span className={`match-state match-state-${estado.tipo}`}><span aria-hidden="true">{ICONO_ESTADO[estado.tipo] || '○'}</span>{compacto && estado.tipo === 'verificado' ? <span className="match-sr">{estado.etiqueta}</span> : estado.etiqueta}</span>;
}

function lineasFecha(ev) {
  const out = [];
  if (ev.calculo) out.push(['Cálculo', fechaLegible(ev.calculo)]);
  if (ev.emision) out.push(['Emisión del documento', fechaLegible(ev.emision)]);
  if (ev.corte) out.push(['Corte', fechaLegible(ev.corte)]);
  if (ev.publicacion) out.push(['Publicación', fechaLegible(ev.publicacion)]);
  if (ev.referencia) out.push(['Fecha de referencia', fechaLegible(ev.referencia)]);
  if (ev.desde || ev.hasta) out.push(['Vigencia publicada', ev.desde && ev.hasta ? `del ${fechaLegible(ev.desde)} al ${fechaLegible(ev.hasta)}` : ev.hasta ? `hasta el ${fechaLegible(ev.hasta)}` : `desde el ${fechaLegible(ev.desde)}`]);
  if (!ev.calculo && !ev.emision && !ev.corte && !ev.publicacion) out.push(['Fecha del dato', 'la fuente no la publica']);
  if (ev.consulta) out.push(['Consultado', fechaLegible(ev.consulta)]);
  return out;
}

function Evidencia({ fuentes, etiqueta, producto }) {
  if (!fuentes?.length) return <p className="match-evidence-empty">Sin fuente registrada para este dato.</p>;
  return <details className="match-evidence">
    <summary>Fuente y fecha<span className="match-sr"> de {etiqueta} de {producto}</span></summary>
    <ul>{fuentes.map((ev, i) => { const f = fuenteDe(ev); return <li key={i}>
      <a href={f.url} target="_blank" rel="noopener noreferrer">{f.titulo}<span className="match-sr"> (abre el sitio de {dominio(f.url)} en otra pestaña)</span></a>
      {f.localizador && <span className="match-evidence-loc">Ubicación: {f.localizador}</span>}
      {f.acceso && /snippet|indiz|403|502|no_/.test(f.acceso) && <span className="match-evidence-loc">Acceso a la fuente: {f.acceso.replace(/_/g, ' ')}</span>}
      <dl>{lineasFecha(ev).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      {ev.corteNota && <p>{ev.corteNota}</p>}
      {ev.vigenciaTexto && !/^No declarada/i.test(ev.vigenciaTexto) && <p>Según la fuente: «{ev.vigenciaTexto}».</p>}
    </li>; })}</ul>
  </details>;
}

// Sin valor, el texto (N/D, No aplica, En conflicto…) ya expresa el estado: no se repite en una etiqueta.
const tieneValor = (d) => d.valor !== undefined && d.valor !== null;

function ValorDato({ dato, estado, max = null }) {
  if (dato.valor === undefined || dato.valor === null) return <span className="match-value match-value-empty">{estado.tipo === 'na' ? 'No aplica' : estado.tipo === 'retenido' ? 'Dato retenido' : estado.tipo === 'conflicto' ? 'En conflicto' : 'N/D'}</span>;
  if (Array.isArray(dato.valor)) {
    const visibles = max ? dato.valor.slice(0, max) : dato.valor;
    const resto = dato.valor.length - visibles.length;
    return <ul className="match-value-list">{visibles.map((v, i) => <li key={i}>{v}</li>)}{resto > 0 && <li className="match-value-more">y {resto} {resto === 1 ? 'dato más' : 'datos más'} en la ficha</li>}</ul>;
  }
  return <span className="match-value">{dato.valor}</span>;
}

function Dato({ dato, producto, hoy, categoria, nivel = 'normal', completo = true }) {
  const estado = estadoEfectivo(dato, hoy, categoria);
  const explicacion = estado.detalle || (['nd', 'na', 'conflicto', 'retenido'].includes(estado.tipo) ? MICROTEXTO_ESTADO[estado.tipo] : null);
  // En tarjetas de resultado, los datos secundarios se leen en una línea; el detalle completo vive en la ficha.
  if (nivel === 'secundario') return <div className={`match-dato match-dato-secundario${['conflicto', 'caducado', 'revision', 'retenido'].includes(estado.tipo) ? ' match-dato-alerta' : ''}`}>
    <dt>{dato.etiqueta}</dt>
    <dd><ValorDato dato={dato} estado={estado} max={2} />{tieneValor(dato) && <Estado estado={estado} />}<Evidencia fuentes={dato.fuentes} etiqueta={dato.etiqueta} producto={producto.nombre} /></dd>
  </div>;
  return <div className={`match-dato match-dato-${nivel}${['conflicto', 'caducado', 'revision', 'retenido'].includes(estado.tipo) ? ' match-dato-alerta' : ''}`}>
    <dt>{dato.etiqueta}</dt>
    <dd>
      <ValorDato dato={dato} estado={estado} />
      {tieneValor(dato) && <Estado estado={estado} />}
      {explicacion && <p className="match-dato-nota">{explicacion}</p>}
      {completo && dato.nota && <p className="match-dato-nota">{dato.nota}</p>}
      {completo && dato.limites?.map((l, i) => <p className="match-dato-nota" key={i}>{l}</p>)}
      <Evidencia fuentes={dato.fuentes} etiqueta={dato.etiqueta} producto={producto.nombre} />
    </dd>
  </div>;
}

function RelacionComercial({ producto, completa = false }) {
  const r = producto.relacionComercial;
  if (r) return <p className="match-commercial match-commercial-on"><strong>{r.tipo === 'afiliado' ? 'Enlace de afiliado' : 'Patrocinado'}</strong> por {r.entidad}. {r.descripcion} Esta relación no cambia el orden ni las conclusiones editoriales.</p>;
  return completa ? <p className="match-commercial">Sin relación comercial con esta institución. MiLana no recibe pago por mostrar esta ficha ni por la visita a su sitio.</p> : null;
}

function esParcial(p, hoy) {
  return p.datos.some((d) => ['nd', 'conflicto', 'retenido', 'caducado', 'revision'].includes(estadoEfectivo(d, hoy, p.categoria).tipo));
}

function Footer() {
  return <footer className="site-footer"><div className="shell footer-inner"><div><span className="brand-name">MiLana</span><p>Dinero claro para decidir mejor.</p><p>MiLana Match publica información educativa con fuente y fecha. No es una oferta, una aprobación ni una recomendación personalizada; confirma las condiciones con la institución antes de contratar.</p></div><p>MiLana © 2026 · Hecho en México</p></div></footer>;
}

function Header() {
  return <SiteHeader ctaHref="/finanzas/mi-situacion" ctaLabel="Mi situación" />;
}

function Hero({ migas, eyebrow, titulo, lede, children, aside, compacto = false }) {
  return <section className={`finance-page-hero match-hero${compacto ? ' match-hero-compact' : ''}`}>
    <div className="shell match-hero-grid">
      <div className="match-hero-copy">
        <Migas items={migas} />
        <p className="eyebrow">{eyebrow}</p>
        <h1>{titulo}</h1>
        {lede && <p className="finance-page-lede">{lede}</p>}
        {children}
      </div>
      {aside}
    </div>
  </section>;
}

// ---------- Portada ----------
function Inicio({ hoy }) {
  const cob = resumenCobertura(catalogo, hoy);
  return <>
    <Hero migas={[['Inicio', '/'], ['Finanzas', '/finanzas'], ['MiLana Match']]} eyebrow="MiLana Match · Comparación con fuentes visibles" titulo="Compara opciones con sus condiciones a la vista" lede="Revisa créditos, cuentas, ahorro, inversiones, seguros y Afores. Encuentra costos, requisitos y límites en un solo lugar, con la fuente y la fecha de cada dato."
      aside={<aside className="match-coverage" aria-labelledby="match-cobertura-titulo">
        <h2 id="match-cobertura-titulo">Lo que cubre este catálogo</h2>
        <p>Al corte del {fechaLegible(cob.corte)}:</p>
        <dl>
          <div><dt>Fichas documentadas</dt><dd>{cob.total}</dd></div>
          <div><dt>Instituciones</dt><dd>{cob.entidades}</dd></div>
          <div><dt>Categorías</dt><dd>{cob.porCategoria.length}</dd></div>
          <div><dt>Relaciones comerciales</dt><dd>{cob.patrocinadas}</dd></div>
        </dl>
        <p className="match-coverage-note">Es una muestra documentada, no todo el mercado. Algunas fichas tienen datos N/D, retenidos o en conflicto, y así se muestran.</p>
      </aside>}>
      <div className="match-hero-actions"><a className="match-button" href="#categorias">Elegir qué comparar <span aria-hidden="true">↓</span></a><a className="match-link" href={`${BASE_MATCH}/metodologia`}>Cómo comparamos</a></div>
      <p className="match-scope">Puedes explorar sin registrarte. Los resultados son información educativa; no son una oferta, una evaluación crediticia ni una recomendación personalizada.</p>
    </Hero>
    <main id="contenido" className="match-main">
      <section className="match-section" id="categorias" aria-labelledby="match-categorias-titulo">
        <div className="shell">
          <h2 id="match-categorias-titulo">¿Qué quieres comparar?</h2>
          <ul className="match-category-grid">{CATEGORIAS.map((c) => { const t = MATCH_CATEGORIAS[c.id]; const n = cob.porCategoria.find((x) => x.id === c.id); return <li key={c.id}>
            <a href={rutaCategoria(c)}>
              <span className="match-category-name">{c.nombre}</span>
              <span className="match-category-copy">{t.resumen}</span>
              <span className="match-category-meta">{n.total} fichas · {n.entidades} {n.entidades === 1 ? 'institución' : 'instituciones'}{t.metrica ? ` · ${t.metrica}` : ''}</span>
            </a>
          </li>; })}</ul>
        </div>
      </section>
      <section className="match-section match-section-split" aria-labelledby="match-contexto-titulo">
        <div className="shell match-split">
          <div>
            <h2 id="match-contexto-titulo">Cada cifra tiene contexto</h2>
            <p>Una tasa puede depender del monto, del plazo o de una promoción. Por eso mostramos las condiciones junto a la cifra y enlazamos la fuente original. Cuando no podemos comprobar un dato, verás N/D o el motivo que impide compararlo.</p>
            <h3>Cómo se ordenan las opciones</h3>
            <p>El catálogo se abre por nombre de institución. Sólo ofrecemos ordenar por un indicador cuando todas las opciones lo publican con la misma definición, unidad y fecha de corte, como el IRN de las Afores. Ninguna institución puede pagar para cambiar su posición.</p>
            <p><a href={`${BASE_MATCH}/metodologia`}>Leer la metodología completa</a></p>
          </div>
          <div className="match-legend" aria-labelledby="match-leyenda-titulo">
            <h3 id="match-leyenda-titulo">Cómo leer el estado de un dato</h3>
            <ul>
              <li><Estado estado={{ tipo: 'verificado', etiqueta: 'Vigente al corte' }} /> Cotejado con la fuente y dentro de su vigencia publicada.</li>
              <li><Estado estado={{ tipo: 'observado', etiqueta: 'Sin vigencia publicada' }} /> Está en la fuente, pero la institución no publica hasta cuándo aplica.</li>
              <li><Estado estado={{ tipo: 'nd', etiqueta: 'N/D' }} /> No lo encontramos. No significa cero ni gratis.</li>
              <li><Estado estado={{ tipo: 'conflicto', etiqueta: 'En conflicto' }} /> Dos fuentes oficiales dicen cosas distintas.</li>
              <li><Estado estado={{ tipo: 'retenido', etiqueta: 'Retenido' }} /> Falta confirmar vigencia o alcance; no se usa para comparar.</li>
              <li><Estado estado={{ tipo: 'caducado', etiqueta: 'Caducado' }} /> Su vigencia terminó; queda como referencia.</li>
            </ul>
          </div>
        </div>
      </section>
      <section className="match-section" aria-labelledby="match-lecturas-titulo">
        <div className="shell">
          <h2 id="match-lecturas-titulo">Primero entiende qué mide cada cifra</h2>
          <p className="match-section-lede">Tres lecturas cortas para usar el comparador sin confundir costo, rendimiento y evidencia. No necesitamos tus ingresos, tu historial crediticio ni tus documentos.</p>
          <ul className="match-reading-grid">{Object.values(LECTURAS).map((l) => <li key={l.href}><a href={l.href}><span>Aprende</span>{l.titulo}</a></li>)}</ul>
        </div>
      </section>
      <section className="match-section match-closing"><div className="shell"><p>Antes de contratar, confirma las condiciones vigentes con la institución y revisa el contrato. La aprobación, el costo final y las coberturas dependen del producto y de sus condiciones.</p></div></section>
    </main>
  </>;
}

// ---------- Categoría ----------
function TarjetaProducto({ producto, categoria, hoy, seleccionado, onAlternar }) {
  const metrica = producto.metrica ? datoDe(producto, producto.metrica) : null;
  const secundarios = producto.secundarios.map((k) => datoDe(producto, k)).filter(Boolean);
  const parcial = esParcial(producto, hoy);
  return <article className="match-card" aria-labelledby={`p-${producto.id}`}>
    <header>
      <p className="match-card-sub">{producto.subcategoria || categoria.nombre}</p>
      <h3 id={`p-${producto.id}`}><a href={rutaFicha(categoria, producto)}>{producto.nombre}</a></h3>
      <p className="match-card-entity">{producto.entidad}</p>
      <RelacionComercial producto={producto} />
    </header>
    <dl className="match-card-data">
      {metrica && <Dato dato={metrica} producto={producto} hoy={hoy} categoria={producto.categoria} nivel="principal" completo={false} />}
      {secundarios.map((d) => <Dato key={d.clave + d.etiqueta} dato={d} producto={producto} hoy={hoy} categoria={producto.categoria} nivel="secundario" />)}
    </dl>
    {(parcial || producto.motivoExclusion) && <p className="match-card-partial"><strong>Información parcial.</strong> {producto.motivoExclusion || 'Algunos datos de esta ficha son N/D, están retenidos o en conflicto.'}</p>}
    <footer className="match-card-actions">
      <a href={rutaFicha(categoria, producto)}>Ver ficha completa<span className="match-sr"> de {producto.nombre}</span></a>
      <button type="button" aria-pressed={seleccionado} onClick={() => onAlternar(producto)}>{seleccionado ? 'Quitar de comparación' : 'Agregar a comparación'}<span className="match-sr"> {producto.nombre}</span></button>
    </footer>
  </article>;
}

function Comparacion({ productos, categoria, hoy, onCerrar, onQuitar, refTitulo }) {
  const [diferencias, setDiferencias] = useState(false);
  const todos = useMemo(() => filasComparacion(productos, GRUPOS_LECTURA), [productos]);
  const grupos = diferencias ? soloDiferencias(todos) : todos;
  const totalFilas = grupos.reduce((n, g) => n + g.filas.length, 0);
  return <section className="match-compare" id="comparacion" aria-labelledby="match-compare-title">
    <div className="match-compare-head">
      <h2 id="match-compare-title" tabIndex={-1} ref={refTitulo}>Comparación lado a lado</h2>
      <p>{MATCH_CATEGORIAS[categoria.id].aviso}</p>
      <div className="match-compare-tools">
        <label className="match-check"><input type="checkbox" checked={diferencias} onChange={(e) => setDiferencias(e.target.checked)} /> Mostrar sólo diferencias</label>
        <span aria-live="polite">{totalFilas} filas visibles</span>
        <button type="button" onClick={onCerrar}>Cerrar comparación</button>
      </div>
    </div>
    <div className="match-compare-scroll" role="region" aria-label="Tabla de comparación; puedes desplazarla horizontalmente" tabIndex={0}>
      <table className="match-compare-table" style={{ '--match-cols': productos.length }}>
        <caption className="match-sr">Comparación de {productos.map((p) => p.nombre).join(', ')}</caption>
        <thead><tr><td />{productos.map((p) => <th scope="col" key={p.id}><a href={rutaFicha(categoria, p)}>{p.nombre}</a><span>{p.entidad}</span><button type="button" onClick={() => onQuitar(p)}>Quitar<span className="match-sr"> {p.nombre}</span></button></th>)}</tr></thead>
        {grupos.map((g) => <tbody key={g.id}>
          <tr className="match-compare-group"><th scope="rowgroup" colSpan={productos.length + 1}>{g.titulo}</th></tr>
          {g.filas.map((f) => <tr key={f.llave}>
            <th scope="row">{f.etiqueta}</th>
            {f.celdas.map((d, i) => <td key={productos[i].id} data-producto={productos[i].nombre}>
              {d ? <><ValorDato dato={d} estado={estadoEfectivo(d, hoy, productos[i].categoria)} />{tieneValor(d) && <Estado estado={estadoEfectivo(d, hoy, productos[i].categoria)} compacto />}<Evidencia fuentes={d.fuentes} etiqueta={d.etiqueta} producto={productos[i].nombre} /></> : <span className="match-value match-value-empty">No documentado en esta ficha</span>}
            </td>)}
          </tr>)}
        </tbody>)}
      </table>
    </div>
  </section>;
}

function Categoria({ categoria, hoy }) {
  const cfg = MATCH_CATEGORIAS[categoria.id];
  const productos = useMemo(() => catalogo.productos.filter((p) => p.categoria === categoria.id), [categoria.id]);
  const [filtros, setFiltros] = useState({});
  const [ordenId, setOrdenId] = useState('nombre');
  const [seleccion, setSeleccion] = useState(() => (typeof window === 'undefined' ? [] : leerSeleccion(window.location.search, productos.map((p) => p.id))));
  const [comparando, setComparando] = useState(() => seleccion.length >= 2);
  const [anuncio, setAnuncio] = useState('');
  const tituloComparacion = useRef(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (seleccion.length) url.searchParams.set('comparar', seleccion.join(',')); else url.searchParams.delete('comparar');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }, [seleccion]);
  useEffect(() => { if (seleccion.length < 2) setComparando(false); }, [seleccion.length]);

  const criterio = cfg.ordenes.find((o) => o.clave === ordenId) || ORDEN_NOMBRE;
  const { coinciden, sinComprobar, noCoinciden } = clasificarPorFiltros(productos, filtros, cfg.filtros);
  const { ordenados, excluidos } = ordenar(coinciden, criterio, hoy);
  const filtrosActivos = Object.values(filtros).some(Boolean);
  const seleccionados = seleccion.map((id) => productos.find((p) => p.id === id)).filter(Boolean);

  const alternar = (p) => {
    const r = alternarSeleccion(seleccion, p.id);
    setSeleccion(r.seleccion);
    setAnuncio(r.mensaje === 'limite' ? `Puedes comparar hasta ${MAX_COMPARAR} opciones. Quita una para agregar otra.` : r.mensaje === 'agregado' ? `${p.nombre} agregado. Llevas ${r.seleccion.length} de ${MAX_COMPARAR} opciones.` : `${p.nombre} quitado. Llevas ${r.seleccion.length} de ${MAX_COMPARAR} opciones.`);
  };
  const abrirComparacion = () => { setComparando(true); requestAnimationFrame(() => tituloComparacion.current?.focus()); };

  const grupos = cfg.agrupar && ordenId === 'nombre'
    ? [...new Set(ordenados.map((p) => p.atributos[cfg.agrupar]))].map((g) => [g, ordenados.filter((p) => p.atributos[cfg.agrupar] === g)])
    : [[null, ordenados]];
  const tarjeta = (p) => <li key={p.id}><TarjetaProducto producto={p} categoria={categoria} hoy={hoy} seleccionado={seleccion.includes(p.id)} onAlternar={alternar} /></li>;

  return <>
    <Hero compacto migas={[['Inicio', '/'], ['Finanzas', '/finanzas'], ['MiLana Match', BASE_MATCH], [categoria.nombre]]} eyebrow={`MiLana Match · ${categoria.nombre}`} titulo={cfg.titulo} lede={cfg.lede}>
      <div className="finance-page-proof"><span>{productos.length} fichas documentadas</span><span>Corte {fechaLegible(catalogo.fechaCorte)}</span><span>Sin posiciones pagadas</span></div>
    </Hero>
    <main id="contenido" className={`match-main${seleccion.length ? ' match-has-tray' : ''}`}>
      <section className="match-section match-tool" aria-labelledby="match-resultados-titulo">
        <div className="shell">
          <div className="match-controls">
            {cfg.filtros.length > 0 && <fieldset className="match-filters"><legend>Filtrar por datos publicados</legend>
              {cfg.filtros.map((f) => <label key={f.id}><span>{f.etiqueta}</span><select value={filtros[f.id] || ''} onChange={(e) => setFiltros((x) => ({ ...x, [f.id]: e.target.value }))}>{f.opciones.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></label>)}
              {filtrosActivos && <button type="button" className="match-reset" onClick={() => setFiltros({})}>Ver todas las fichas documentadas</button>}
            </fieldset>}
            <div className="match-sort">
              {cfg.ordenes.length ? <label><span>Ordenado por</span><select value={ordenId} onChange={(e) => setOrdenId(e.target.value)}><option value="nombre">{ORDEN_NOMBRE.etiqueta}</option>{cfg.ordenes.map((o) => <option key={o.clave} value={o.clave}>{o.etiqueta}</option>)}</select></label>
                : <p><span>Ordenado por</span> {ORDEN_NOMBRE.etiqueta}</p>}
            </div>
          </div>
          <p className="match-notice">{cfg.aviso} <a href={`${BASE_MATCH}/metodologia`}>Cómo comparamos</a></p>
          <h2 id="match-resultados-titulo" className="match-results-title" aria-live="polite">{filtrosActivos ? `${ordenados.length} coinciden con estos filtros documentados · ${productos.length} fichas en total` : `${productos.length} fichas documentadas`}</h2>
          {comparando && seleccionados.length >= 2 && <Comparacion productos={seleccionados} categoria={categoria} hoy={hoy} refTitulo={tituloComparacion} onCerrar={() => setComparando(false)} onQuitar={alternar} />}
          {ordenados.length === 0 && <p className="match-empty">No encontramos opciones documentadas que cumplan todos estos filtros. Puedes quitar un filtro o <button type="button" className="match-inline-button" onClick={() => setFiltros({})}>ver el catálogo completo</button>.</p>}
          {grupos.map(([g, lista]) => lista.length > 0 && <div key={g || 'todas'} className="match-group">
            {g && <h3 className="match-group-title">{g}</h3>}
            <ul className="match-card-list">{lista.map(tarjeta)}</ul>
          </div>)}
          {excluidos.length > 0 && <div className="match-group match-group-aside"><h3 className="match-group-title">Datos insuficientes para este orden</h3><p>Estas fichas no tienen un {criterio.etiqueta.split(',')[0]} comparable a la fecha. No las ponemos al final como si fueran peores: simplemente no entran al orden.</p><ul className="match-card-list">{excluidos.map((x) => tarjeta(x.producto))}</ul></div>}
          {sinComprobar.length > 0 && <div className="match-group match-group-aside"><h3 className="match-group-title">No podemos comprobarlo con la información disponible</h3><p>Estas fichas no publican el dato del filtro ({[...new Set(sinComprobar.flatMap((x) => x.pendientes.map((y) => y.etiqueta.toLowerCase())))].join(', ')}). No significa que no cumplan.</p><ul className="match-card-list">{sinComprobar.map((x) => tarjeta(x.producto))}</ul></div>}
          {noCoinciden.length > 0 && <p className="match-hidden-count">{noCoinciden.length} {noCoinciden.length === 1 ? 'ficha no coincide' : 'fichas no coinciden'} con el filtro documentado y no se muestra{noCoinciden.length === 1 ? '' : 'n'}.</p>}
        </div>
      </section>
      <section className="match-section match-section-split" aria-labelledby="match-preguntas-titulo">
        <div className="shell match-split">
          <div>
            <h2 id="match-preguntas-titulo">Preguntas antes de contratar</h2>
            <ul className="match-questions">{cfg.preguntas.map((q) => <li key={q}>{q}</li>)}</ul>
          </div>
          <div>
            <h2>Para entender mejor</h2>
            <ul className="match-links">{cfg.lecturas.map((k) => <li key={k}><a href={LECTURAS[k].href}>{LECTURAS[k].titulo}</a></li>)}{cfg.herramientas.map(([t, h]) => <li key={h}><a href={h}>{t}</a></li>)}</ul>
          </div>
        </div>
      </section>
      <section className="match-section match-other-categories" aria-labelledby="match-otras-titulo"><div className="shell">
        <h2 id="match-otras-titulo">Otras categorías</h2>
        <ul>{CATEGORIAS.filter((c) => c.id !== categoria.id).map((c) => <li key={c.id}><a href={rutaCategoria(c)}>{c.nombre}</a></li>)}</ul>
      </div></section>
    </main>
    {seleccion.length > 0 && <div className="match-tray" role="region" aria-label="Selección para comparar">
      <div className="shell match-tray-inner">
        <p><strong>{seleccion.length} de {MAX_COMPARAR}</strong> seleccionadas{seleccion.length < 2 ? ' · necesitas al menos dos para comparar' : ''}</p>
        <div><button type="button" className="match-button" disabled={seleccion.length < 2} onClick={abrirComparacion}>Comparar</button><button type="button" className="match-link-button" onClick={() => { setSeleccion([]); setAnuncio('Selección vaciada.'); }}>Limpiar</button></div>
      </div>
    </div>}
    <p className="match-sr" aria-live="polite">{anuncio}</p>
  </>;
}

// ---------- Ficha ----------
function Ficha({ categoria, producto, hoy }) {
  const cfg = MATCH_CATEGORIAS[categoria.id];
  const metrica = producto.metrica ? datoDe(producto, producto.metrica) : null;
  const pendientes = producto.datos.filter((d) => ['nd', 'conflicto', 'retenido', 'caducado', 'revision'].includes(estadoEfectivo(d, hoy, producto.categoria).tipo));
  const grupos = GRUPOS_LECTURA.map(([id, titulo]) => [id, titulo, producto.datos.filter((d) => d.grupo === id && d !== metrica)]).filter(([, , l]) => l.length);
  const sitio = producto.enlaceOficial ? dominio(producto.enlaceOficial) : null;
  const asunto = encodeURIComponent(`Reporte de dato MiLana Match: ${producto.id}`);
  const cuerpo = encodeURIComponent(`Ficha: ${producto.nombre}\nDato que quiero reportar:\nEnlace a la fuente que considero correcta:\n\n(No incluyas números de cuenta, identificaciones ni documentos personales.)`);
  return <>
    <Hero compacto migas={[['Inicio', '/'], ['Finanzas', '/finanzas'], ['MiLana Match', BASE_MATCH], [categoria.nombre, rutaCategoria(categoria)], [producto.nombre]]} eyebrow={producto.subcategoria || categoria.nombre} titulo={producto.nombre}
      lede={[producto.entidad, producto.tipoEntidad && !producto.entidad.includes(producto.tipoEntidad) ? producto.tipoEntidad : null].filter(Boolean).join(' · ')}>
      {producto.nombreDocumento && <p className="match-scope">Nombre en el documento de costos: {producto.nombreDocumento}.</p>}
      <div className="finance-page-proof"><span>{esParcial(producto, hoy) ? 'Información parcial' : 'Información verificada'}</span><span>Corte {fechaLegible(catalogo.fechaCorte)}</span><span>{producto.datos.length} datos con fuente</span></div>
    </Hero>
    <main id="contenido" className="match-main match-ficha">
      <div className="shell match-ficha-grid">
        <div className="match-ficha-body">
          <RelacionComercial producto={producto} completa />
          {metrica && <section className="match-section-block" aria-labelledby="ficha-principal"><h2 id="ficha-principal">El dato principal</h2><dl className="match-ficha-data"><Dato dato={metrica} producto={producto} hoy={hoy} categoria={producto.categoria} nivel="principal" /></dl>{cfg.aviso && <p className="match-notice">{cfg.aviso}</p>}</section>}
          {grupos.map(([id, titulo, lista]) => <section className="match-section-block" key={id} aria-labelledby={`ficha-${id}`}>
            <h2 id={`ficha-${id}`}>{titulo}</h2>
            <dl className="match-ficha-data">{lista.map((d, i) => <Dato key={d.clave + i} dato={d} producto={producto} hoy={hoy} categoria={producto.categoria} />)}</dl>
            {id === 'requisitos' && <p className="match-notice">Cumplir un requisito publicado no garantiza aprobación. La institución puede pedir información adicional en su proceso.</p>}
          </section>)}
          {(producto.alertas.length > 0 || producto.discrepancias.length > 0 || producto.motivoExclusion) && <section className="match-section-block" aria-labelledby="ficha-cuidado">
            <h2 id="ficha-cuidado">Qué revisar con más cuidado</h2>
            {producto.motivoExclusion && <p className="match-callout"><strong>Fuera del conjunto con vigencia confirmada.</strong> {producto.motivoExclusion}</p>}
            {producto.alertas.length > 0 && <ul className="match-questions">{producto.alertas.map((a) => <li key={a}>{a}</li>)}</ul>}
            {producto.discrepancias.map((d, i) => <div className="match-callout" key={i}><p><strong>Discrepancia entre fuentes:</strong> {d.texto}</p>{d.nota && <p>{d.nota}</p>}<Evidencia fuentes={d.fuentes} etiqueta="la discrepancia" producto={producto.nombre} /></div>)}
          </section>}
          {pendientes.length > 0 && <section className="match-section-block" aria-labelledby="ficha-pendientes">
            <h2 id="ficha-pendientes">Qué no pudimos comprobar</h2>
            <ul className="match-pending">{pendientes.map((d, i) => <li key={d.clave + i}><strong>{d.etiqueta}:</strong> {estadoEfectivo(d, hoy, producto.categoria).etiqueta}.</li>)}</ul>
            <p>Consultamos las fuentes enlazadas el {fechaLegible(catalogo.fechaCorte)}. Estos datos no se usan para ordenar alternativas.</p>
          </section>}
          {producto.historial.length > 0 && <section className="match-section-block" aria-labelledby="ficha-historial">
            <h2 id="ficha-historial">Historial: no usar como vigente</h2>
            {producto.historial.map((h, i) => <div className="match-callout match-callout-muted" key={i}><p>{h.texto}</p>{h.nota && <p>{h.nota}</p>}<Evidencia fuentes={h.fuentes} etiqueta="el dato histórico" producto={producto.nombre} /></div>)}
          </section>}
          <section className="match-section-block" aria-labelledby="ficha-preguntas"><h2 id="ficha-preguntas">Preguntas antes de contratar</h2><ul className="match-questions">{cfg.preguntas.map((q) => <li key={q}>{q}</li>)}</ul></section>
          <p className="match-final">La información describe condiciones publicadas y puede cambiar. No es una oferta, una aprobación ni una recomendación personalizada. Confirma los términos de tu contratación con la institución.</p>
        </div>
        <aside className="match-ficha-aside" aria-label="Acciones">
          {producto.enlaceOficial && <div className="match-exit">
            <h2>Consultar sitio oficial</h2>
            <p>Vas a abrir el sitio de {producto.entidad} en <strong>{sitio}</strong>. Ahí aplican sus condiciones y su aviso de privacidad.</p>
            {!producto.relacionComercial && <p>Este enlace no es de afiliado.</p>}
            <a className="match-button" href={producto.enlaceOficial} target="_blank" rel={producto.relacionComercial ? 'sponsored noopener noreferrer' : 'noopener noreferrer'}>Ir a {sitio}<span className="match-sr"> (abre en otra pestaña)</span></a>
          </div>}
          <div className="match-exit">
            <h2>Comparar</h2>
            <p>Revisa esta ficha junto a otras {categoria.nombre.toLowerCase()} con sus estados y fuentes.</p>
            <a className="match-link" href={`${rutaCategoria(categoria)}?comparar=${producto.id}`}>Agregar a una comparación</a>
          </div>
          <div className="match-exit">
            <h2>Reportar un dato</h2>
            <p>Indica el dato y un enlace a la fuente que consideras correcta. No envíes números de cuenta, identificaciones ni documentos personales.</p>
            <a className="match-link" href={`mailto:contacto.milanaaqui@gmail.com?subject=${asunto}&body=${cuerpo}`}>Escribir a MiLana</a>
          </div>
        </aside>
      </div>
    </main>
  </>;
}

// ---------- Metodología ----------
const FILAS_ESTADOS = [
  ['verificado', 'Verificado en fuente / Vigente al corte', 'Se leyó la evidencia y su vigencia publicada abarca el corte.', 'Puede entrar a un orden si el grupo es comparable.'],
  ['observado', 'Sin vigencia publicada', 'El dato está en la fuente, pero la institución no publica hasta cuándo aplica.', 'Se muestra con su fecha de consulta; no entra a órdenes que exigen vigencia.'],
  ['nd', 'N/D', 'No se encontró en las fuentes revisadas.', 'No equivale a cero; no se ordena por este campo.'],
  ['na', 'No aplica', 'El indicador no corresponde a ese tipo de producto.', 'Se explica en una línea.'],
  ['conflicto', 'En conflicto', 'Fuentes oficiales incompatibles aún no resueltas.', 'Se muestran ambas evidencias; el dato sale del orden.'],
  ['retenido', 'Retenido', 'Existe evidencia, pero falta confirmar vigencia, monto o alcance.', 'No se usa para comparar ni calcular.'],
  ['caducado', 'Caducado', 'La vigencia publicada terminó.', 'Queda como referencia histórica; no se usa para ordenar.'],
  ['revision', 'Revisión vencida', 'Pasó el plazo editorial de relectura.', 'Sale de órdenes y métricas vigentes hasta revalidarse.'],
];

function Metodologia({ hoy }) {
  const cob = resumenCobertura(catalogo, hoy);
  return <>
    <Hero compacto migas={[['Inicio', '/'], ['Finanzas', '/finanzas'], ['MiLana Match', BASE_MATCH], ['Metodología']]} eyebrow="MiLana Match · Metodología" titulo="Cómo comparamos en MiLana Match" lede="Reunimos información pública de productos financieros disponibles en México para que puedas revisar costos, rendimientos, requisitos y condiciones sin perder de vista de dónde viene cada dato." />
    <main id="contenido" className="match-main">
      <div className="shell match-article">
        <h2>Qué incluimos</h2>
        <p>Investigamos productos de nueve categorías. Cada categoría muestra su alcance, fecha de corte y fichas documentadas. Una institución no necesita pagar para aparecer. El catálogo es incompleto por definición: no afirmamos cubrir todo el mercado.</p>
        <div className="match-table-wrap" role="region" aria-label="Cobertura por categoría" tabIndex={0}><table className="match-table">
          <caption>Cobertura al corte del {fechaLegible(cob.corte)}</caption>
          <thead><tr><th scope="col">Categoría</th><th scope="col">Fichas</th><th scope="col">Instituciones</th><th scope="col">Indicador propio</th></tr></thead>
          <tbody>{cob.porCategoria.map((c) => <tr key={c.id}><th scope="row"><a href={rutaCategoria(c)}>{c.nombre}</a></th><td>{c.total}</td><td>{c.entidades}</td><td>{MATCH_CATEGORIAS[c.id].metrica || 'Sin indicador único'}</td></tr>)}</tbody>
        </table></div>
        <p>Las Afores cubren las diez administradoras de la tabla de CONSAR para la Siefore Básica 90–94 con corte de {fechaLegible(catalogo.consar.corte)}. No cubren otras generaciones.</p>
        <h2>De dónde salen los datos</h2>
        <p>Consultamos páginas oficiales, tarifarios, contratos, prospectos y fuentes de autoridades. En cada dato puedes abrir la fuente y ver su fecha de cálculo, emisión o corte cuando se publica, además de la fecha en que la consultamos. La fecha de consulta no extiende una promoción ni sustituye la vigencia del documento. Cuando la fuente sólo publica un mes, como el corte de CONSAR, mostramos el mes y no inventamos un día.</p>
        <h2>Qué significa cada indicador</h2>
        <p>Las categorías usan métricas distintas. El CAT corresponde al costo anual del crédito bajo los supuestos con que se calculó. La GAT se utiliza en productos de ahorro o inversión a los que aplica. Las pólizas se comparan por cobertura y condiciones; las Afores, dentro de la misma generación y corte. Nunca mezclamos CAT, GAT, tasas, rendimientos históricos, primas e IRN en una clasificación única.</p>
        <figure className="match-figure"><img src="/images/match/01-cat-gat.svg" width="900" height="1120" loading="lazy" alt="Dos paneles distinguen el CAT, asociado al costo anual del crédito, y la GAT, asociada al rendimiento de ciertos productos de ahorro o inversión; ambos requieren condiciones, fuente y fecha." /><figcaption>Indicadores distintos. Esquema conceptual sin tasas ni ofertas vigentes.</figcaption></figure>
        <h2>Cómo ordenamos</h2>
        <p>El orden inicial es por nombre de la institución. Sólo ofrecemos otro orden cuando todas las opciones publican el mismo indicador con la misma definición, unidad, cohorte y corte. Hoy eso ocurre con el IRN y la comisión de las Afores. Los CAT publicados por los bancos son promedios con supuestos distintos, así que se muestran junto a cada ficha pero no se ordenan de menor a mayor. Los datos faltantes, vencidos o en conflicto no se convierten en ceros ni reciben una posición favorable.</p>
        <h2>Qué significa una coincidencia</h2>
        <p>Un filtro devuelve tres resultados: coincide con el dato documentado, no coincide, o no podemos comprobarlo con la información disponible. La tercera opción no es un rechazo. Una coincidencia no implica que una institución te aprobará ni que el producto sea adecuado para ti. No consultamos tu historial ni pedimos datos personales.</p>
        <h2>Estados de un dato</h2>
        <div className="match-table-wrap" role="region" aria-label="Estados de un dato" tabIndex={0}><table className="match-table">
          <thead><tr><th scope="col">Estado</th><th scope="col">Significado</th><th scope="col">Qué hacemos</th></tr></thead>
          <tbody>{FILAS_ESTADOS.map(([tipo, etiqueta, sig, hace]) => <tr key={tipo}><th scope="row"><Estado estado={{ tipo, etiqueta }} /></th><td>{sig}</td><td>{hace}</td></tr>)}</tbody>
        </table></div>
        <h2>Cuándo actualizamos</h2>
        <p>Cada dato tiene un plazo editorial de revisión: 30 días para CAT, tasas y comisiones; 45 días para estadísticas mensuales de CONSAR; 90 días para requisitos y condiciones generales. Al vencer ese plazo, la ficha marca «Revisión vencida» automáticamente. Si una vigencia publicada termina, el dato pasa a «Caducado». Estas reglas se calculan con la fecha de tu visita, no con la fecha en que publicamos la página.</p>
        <h2 id="financiamiento">Cómo nos financiamos</h2>
        <p>Al corte del {fechaLegible(cob.corte)}, MiLana Match no tiene relaciones comerciales activas: {cob.patrocinadas} fichas patrocinadas y ningún enlace de afiliado. Si en el futuro existe un patrocinio o un enlace remunerado, lo indicaremos junto al nombre del producto y antes del clic, con el nombre de quien paga. Un patrocinador no compra posición, exclusividad ni una conclusión favorable, y la categoría de Afores se mantiene sin monetización. Consulta también <a href="/financiamiento">cómo se financia MiLana</a>.</p>
        <h2>Límites del servicio</h2>
        <p>Publicamos información educativa. No recibimos depósitos, no gestionamos solicitudes y no realizamos operaciones financieras. Tampoco evaluamos tu solvencia ni emitimos recomendaciones individualizadas de inversión o seguro. Antes de contratar, verifica las condiciones con el proveedor y revisa los documentos correspondientes.</p>
        <h2>Cómo señalar un error</h2>
        <p>En cada ficha encontrarás «Reportar un dato». Indica el atributo y la fuente que consideras correcta; evita enviar documentos o información personal. Revisaremos la evidencia y, cuando corresponda, publicaremos la corrección con su fecha.</p>
        <p className="match-final">Versión del catálogo: {catalogo.version} · corte de investigación: {fechaLegible(catalogo.fechaCorte)}.</p>
      </div>
    </main>
  </>;
}

function NoEncontrado({ categoria }) {
  return <main id="contenido" className="match-main"><div className="shell match-article"><h1>No encontramos esta ficha</h1><p>Puede que la dirección esté incompleta o que la ficha haya cambiado de nombre.</p><p><a href={categoria ? rutaCategoria(categoria) : BASE_MATCH}>{categoria ? `Ver ${categoria.nombre.toLowerCase()}` : 'Ir a MiLana Match'}</a></p></div></main>;
}

export default function MatchPages() {
  const ruta = useMemo(() => resolverRutaMatch(typeof window === 'undefined' ? '/' : window.location.pathname), []);
  const hoy = useMemo(() => hoyISO(), []);
  return <div className="finance-pages match-pages">
    <Header />
    {ruta.vista === 'inicio' && <Inicio hoy={hoy} />}
    {ruta.vista === 'metodologia' && <Metodologia hoy={hoy} />}
    {ruta.vista === 'categoria' && <Categoria categoria={ruta.categoria} hoy={hoy} />}
    {ruta.vista === 'ficha' && <Ficha categoria={ruta.categoria} producto={ruta.producto} hoy={hoy} />}
    {(ruta.vista === 'no-encontrado' || ruta.vista === 'fuera') && <NoEncontrado categoria={ruta.categoria} />}
    <Footer />
  </div>;
}
