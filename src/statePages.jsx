import { useMemo, useState } from 'react';
import datos from './data/estados.json';
import laboral from './data/mercadoLaboralEstados.json';
import actualizacion from './data/actualizacionEstados.json';
import AdReserve from './AdReserve.jsx';

const dinero = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Number(n) || 0);
const numero = (n) => new Intl.NumberFormat('es-MX').format(Number(n) || 0);
const pp = (valor, nacional) => `${valor - nacional >= 0 ? '+' : ''}${(valor - nacional).toFixed(1)} pp vs. México`;
const fechaLarga = (iso) => new Intl.DateTimeFormat('es-MX', { day:'numeric', month:'long', year:'numeric', timeZone:'America/Mexico_City' }).format(new Date(`${iso}T12:00:00-06:00`));

export function esRutaEstado() {
  if (typeof window === 'undefined') return false;
  return /^\/estados(?:\/[^/]+)?\/?$/.test(window.location.pathname);
}

function slugActual() {
  if (typeof window === 'undefined') return '';
  return window.location.pathname.split('/').filter(Boolean)[1] || '';
}

function Header() {
  return <header className="site-header"><div className="shell header-inner"><a className="brand" href="/" aria-label="MiLana, inicio"><span className="brand-mark" aria-hidden="true">M</span><span className="brand-name">MiLana</span></a><nav className="desktop-nav" aria-label="Principal"><a href="/carreras">Carreras</a><a href="/estados">Estados</a><a href="/finanzas">Finanzas</a><a href="/economia">Economía</a></nav><a className="header-cta" href="/finanzas/mi-situacion">Mi situación</a></div></header>;
}

function Footer() {
  return <><AdReserve size="970x90" /><footer className="site-footer"><div className="shell footer-inner"><div><span className="brand-name">MiLana</span><p>Dinero claro para decidir mejor.</p><p>{datos.fuente.nombre}. {datos.fuente.periodo}.</p><p>{laboral.fuente}. {laboral.actualizado}.</p><p>{datos.nota}</p></div><p>MiLana © 2026 · Hecho en México</p></div></footer></>;
}

function Selector({ value = '' }) {
  const [seleccion, setSeleccion] = useState(value);
  // value = estado de la página actual. Antes el botón siempre navegaba a /estados/<selección>; en una ficha la
  // selección inicial ES la página actual, así que "Ver panorama" recargaba la misma URL y no pasaba nada.
  const mismaFicha = Boolean(value) && seleccion === value;
  const destino = datos.estados.find((e) => e.slug === seleccion);
  const ir = () => {
    if (!seleccion) return;
    if (mismaFicha) {
      const panorama = document.getElementById('panorama-estado');
      if (!panorama) return;
      const reducir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      panorama.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'start' });
      panorama.focus({ preventScroll: true });
      return;
    }
    window.location.href = `/estados/${seleccion}`;
  };
  const etiqueta = mismaFicha ? 'Ver panorama' : (value && destino ? `Ir a ${destino.estado}` : 'Ver panorama');
  return <div className="state-selector"><label><span>{value ? 'Cambiar de estado' : 'Elige tu estado'}</span><select value={seleccion} onChange={(e) => setSeleccion(e.target.value)}><option value="">Selecciona una entidad</option>{datos.estados.map((e) => <option key={e.slug} value={e.slug}>{e.estado}</option>)}</select></label><button type="button" onClick={ir} disabled={!seleccion} data-state-action={mismaFicha ? 'panorama' : 'ir'}>{etiqueta} <span aria-hidden="true">{mismaFicha ? '↓' : '→'}</span></button></div>;
}

function Hub() {
  const orden = useMemo(() => [...datos.estados].sort((a,b) => a.estado.localeCompare(b.estado,'es-MX')), []);
  const mercado = new Map(laboral.estados.map((e) => [e.slug, e]));
  return <div className="state-pages"><Header /><main><section className="state-hero"><div className="shell"><nav aria-label="Ruta"><a href="/">Inicio</a><span>/</span><span>Estados</span></nav><p className="eyebrow">México · 32 entidades</p><h1>Tu estado cambia el contexto financiero.</h1><p>El promedio profesional nacional sirve como referencia, pero salarios y condiciones laborales cambian entre entidades. Elige tu estado para partir de datos oficiales comparables.</p><Selector /><div className="state-proof"><span>ENOE 2026-T2</span><span>STPS</span><span>INEGI</span><span>32 entidades</span><span>Próxima revisión: {fechaLarga(actualizacion.proximaPublicacion)}</span></div></div></section><section className="state-directory"><div className="shell"><div className="state-directory-head"><div><p className="eyebrow">Panorama nacional</p><h2>Explora cualquier estado.</h2></div><p>Cada ficha separa la población profesional del mercado laboral general. Ingreso, informalidad y desocupación responden preguntas distintas.</p></div><div className="state-grid">{orden.map((e) => { const m = mercado.get(e.slug); return <a key={e.slug} href={`/estados/${e.slug}`}><span>{e.estado}</span><strong>{dinero(e.ingreso)}<small>/mes profesional</small></strong><p>{m ? `${m.informalidad.toFixed(1)}% informalidad · ${m.desocupacion.toFixed(1)}% desocupación` : `${numero(e.ocupados)} profesionistas ocupados`}</p><b>Ver estado →</b></a>; })}</div></div></section></main><Footer /></div>;
}

function LaborMetric({ label, value, note }) {
  return <article><span>{label}</span><strong>{value}</strong><p>{note}</p></article>;
}

function Detail({ estado }) {
  const ordenIngreso = useMemo(() => [...datos.estados].sort((a,b) => b.ingreso - a.ingreso), []);
  const ordenOcupados = useMemo(() => [...datos.estados].sort((a,b) => b.ocupados - a.ocupados), []);
  const rankIngreso = ordenIngreso.findIndex((e) => e.slug === estado.slug) + 1;
  const rankOcupados = ordenOcupados.findIndex((e) => e.slug === estado.slug) + 1;
  const diferencia = estado.ingreso - datos.promedioNacional;
  const diferenciaPct = (diferencia / datos.promedioNacional) * 100;
  const cercanos = [...datos.estados].filter((e) => e.slug !== estado.slug).sort((a,b) => Math.abs(a.ingreso - estado.ingreso) - Math.abs(b.ingreso - estado.ingreso)).slice(0,4);
  const mercado = laboral.estados.find((e) => e.slug === estado.slug);
  const mx = laboral.nacional;

  return <div className="state-pages"><Header /><main><section className="state-detail-hero"><div className="shell"><nav aria-label="Ruta"><a href="/">Inicio</a><span>/</span><a href="/estados">Estados</a><span>/</span><span>{estado.estado}</span></nav><p className="eyebrow">{estado.estado} · {datos.actualizado}</p><h1>Trabajo, salarios y decisiones de dinero en {estado.estado}.</h1><p>MiLana combina dos lecturas oficiales del mismo trimestre: panorama profesional de OLA/STPS y mercado laboral general de ENOE/INEGI. Se muestran juntas, pero nunca como si fueran la misma población.</p><Selector value={estado.slug} /></div></section>

  <section className="state-metrics" id="panorama-estado" tabIndex={-1} aria-label={`Panorama de ${estado.estado}`}><div className="shell"><div className="state-metric-grid"><article><span>Ingreso profesional promedio</span><strong>{dinero(estado.ingreso)}</strong><p>{diferencia >= 0 ? '+' : ''}{diferenciaPct.toFixed(1)}% frente al promedio profesional nacional de {dinero(datos.promedioNacional)}.</p></article><article><span>Profesionistas ocupados</span><strong>{numero(estado.ocupados)}</strong><p>Personas ocupadas con formación profesional en el corte OLA.</p></article><article><span>Posición por ingreso promedio</span><strong>{rankIngreso}<small> de 32</small></strong><p>Orden descriptivo entre entidades con el mismo corte.</p></article><article><span>Posición por profesionistas ocupados</span><strong>{rankOcupados}<small> de 32</small></strong><p>Describe tamaño de la población profesional, no vacantes abiertas.</p></article></div><aside className="state-source"><span>Fuente profesional</span><div><strong>{datos.fuente.nombre}</strong><p>{datos.fuente.periodo}. {datos.nota}</p></div></aside></div></section>

  {mercado && <section className="state-labor"><div className="shell"><div className="state-labor-head"><div><p className="eyebrow">Mercado laboral · ENOE {laboral.actualizado}</p><h2>¿Cómo está el trabajo en {estado.estado}?</h2></div><p>Estas tasas describen al mercado laboral general del estado, no solo a profesionistas. La comparación usa el mismo trimestre para México y las 32 entidades.</p></div><div className="state-labor-grid"><LaborMetric label="Participación económica" value={`${mercado.participacion.toFixed(1)}%`} note={pp(mercado.participacion, mx.participacion)} /><LaborMetric label="Desocupación" value={`${mercado.desocupacion.toFixed(1)}%`} note={pp(mercado.desocupacion, mx.desocupacion)} /><LaborMetric label="Informalidad laboral" value={`${mercado.informalidad.toFixed(1)}%`} note={pp(mercado.informalidad, mx.informalidad)} /><LaborMetric label="Subocupación" value={`${mercado.subocupacion.toFixed(1)}%`} note={pp(mercado.subocupacion, mx.subocupacion)} /><LaborMetric label="Trabajo asalariado" value={`${mercado.trabajoAsalariado.toFixed(1)}%`} note={pp(mercado.trabajoAsalariado, mx.trabajoAsalariado)} /><LaborMetric label="Condiciones críticas" value={`${mercado.condicionesCriticas.toFixed(1)}%`} note={pp(mercado.condicionesCriticas, mx.condicionesCriticas)} /></div><div className="state-labor-pop"><div><span>Población ocupada</span><strong>{numero(mercado.ocupados)}</strong></div><div><span>Población desocupada</span><strong>{numero(mercado.desocupados)}</strong></div><div><span>Ocupación en sector informal</span><strong>{mercado.sectorInformal.toFixed(1)}%</strong></div></div><aside className="state-source state-source-labor"><span>Fuente laboral</span><div><strong>{laboral.fuente}</strong><p>Publicado el {fechaLarga(laboral.publicado)}. Próxima publicación trimestral programada: {fechaLarga(actualizacion.proximaPublicacion)}. {laboral.nota}</p></div></aside></div></section>}

  <section className="state-meaning"><div className="shell state-meaning-grid"><div><p className="eyebrow">Cómo leer la ficha</p><h2>Un estado no se resume en una sola cifra.</h2><p>El ingreso profesional promedio de {estado.estado} se compara con México dentro de la población profesional. Las tasas ENOE describen el mercado laboral general. Juntas dan contexto; ninguna predice tu sueldo individual.</p><p>Tampoco usamos informalidad, desocupación o ingreso estatal como sustitutos de renta, transporte o costo de vida.</p></div><div className="state-checks"><article><span>Dato compatible</span><strong>Estado vs. México</strong><p>Las comparaciones se hacen dentro de la misma fuente, población y periodo.</p></article><article><span>No inferimos</span><strong>Salario por carrera dentro del estado</strong><p>No lo publicamos hasta tener una fuente oficial con ese cruce.</p></article><article><span>No confundimos</span><strong>Ocupados con vacantes</strong><p>La población ocupada describe mercado observado, no contrataciones abiertas.</p></article></div></div></section>

  <section className="state-actions"><div className="shell"><div className="state-actions-head"><div><p className="eyebrow">Aterriza el dato</p><h2>Del contexto estatal a una decisión personal.</h2></div><p>El estado te da contexto. Tus números personales empiezan en las herramientas.</p></div><div className="state-action-grid"><a href="/carreras"><span>01</span><h3>Explorar carreras</h3><p>Compara profesiones con datos nacionales y contexto metodológico.</p><b>→</b></a><a href="/carreras/comparar"><span>02</span><h3>Comparar dos carreras</h3><p>Usa el mismo corte para ingreso y población profesional.</p><b>→</b></a><a href="/calculadoras/bruto-a-neto"><span>03</span><h3>Calcular sueldo neto</h3><p>Aterriza una cifra salarial a ISR e IMSS estimados.</p><b>→</b></a><a href="/finanzas/mi-situacion"><span>04</span><h3>Analizar mi situación</h3><p>Ingreso, gastos, deuda, fondo y metas sin guardar tus datos.</p><b>→</b></a></div></div></section>

  <section className="state-near"><div className="shell"><div className="state-near-head"><p className="eyebrow">Ingresos estatales cercanos</p><h2>Compara entidades con promedios similares.</h2></div><div className="state-near-grid">{cercanos.map((e) => <a key={e.slug} href={`/estados/${e.slug}`}><span>{e.estado}</span><strong>{dinero(e.ingreso)}/mes</strong><p>{numero(e.ocupados)} profesionistas ocupados</p></a>)}</div></div></section>
  </main><Footer /></div>;
}

export default function StatePages() {
  const slug = slugActual();
  if (!slug) return <Hub />;
  const estado = datos.estados.find((e) => e.slug === slug);
  if (!estado) return <div className="state-pages"><Header /><main className="state-not-found"><h1>Estado no encontrado</h1><p>Elige una de las 32 entidades disponibles.</p><a href="/estados">Ver todos los estados</a></main><Footer /></div>;
  return <Detail estado={estado} />;
}
