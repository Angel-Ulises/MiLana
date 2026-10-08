import { useMemo, useState } from 'react';
import carreras from './data/profesiones.json';
import ocupaciones from './data/ocupaciones.json';
import AdReserve from './AdReserve.jsx';
import SiteHeader from './siteHeader.jsx';
import { seleccionOcupacionInicial } from './lib/occupationFromProfession.js';

const dinero = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Number(n) || 0);
const numero = (n) => new Intl.NumberFormat('es-MX').format(Number(n) || 0);

export function esRutaOcupaciones() {
  if (typeof window === 'undefined') return false;
  return /^\/carreras\/ocupaciones\/?$/.test(window.location.pathname);
}

function Header() {
  return <SiteHeader ctaHref="/finanzas/mi-situacion" ctaLabel="Mi situación" />;
}

function Footer() {
  return <><AdReserve size="970x90" /><footer className="site-footer"><div className="shell footer-inner"><div><span className="brand-name">MiLana</span><p>Dinero claro para decidir mejor.</p><p>Carrera y ocupación son estadísticas distintas; MiLana no las convierte en una sola cifra.</p></div><p>MiLana © 2026 · Hecho en México</p></div></footer></>;
}

function TarjetaCarrera({ carrera }) {
  return <article className="co-card career"><div className="co-card-kicker"><span>Carrera / formación</span><b>OLA · 2026-T2</b></div><h2>{carrera.nombre}</h2><div className="co-metric"><span>Ingreso profesional promedio</span><strong>{dinero(carrera.ingreso)}<small>/mes</small></strong></div><div className="co-mini-grid"><div><span>Profesionistas ocupados</span><strong>{numero(carrera.ocupados)}</strong></div><div><span>Área</span><strong>{carrera.area}</strong></div></div><p className="co-card-note">Agrupa profesionistas por campo de formación. No describe necesariamente el puesto que desempeñan hoy.</p><a href={`/carreras/profesion/${carrera.slug}`}>Abrir perfil de la carrera →</a></article>;
}

function TarjetaOcupacion({ ocupacion }) {
  return <article className="co-card occupation"><div className="co-card-kicker"><span>Ocupación / trabajo desempeñado</span><b>Data México · {ocupacion.periodo}</b></div><h2>{ocupacion.nombre}</h2><div className="co-metric"><span>Salario ocupacional reportado</span><strong>{dinero(ocupacion.ingresoMensual)}<small>/mes</small></strong></div><div className="co-mini-grid"><div><span>Personas ocupadas</span><strong>{numero(ocupacion.ocupados)}</strong></div><div><span>Informalidad</span><strong>{ocupacion.informalidadPct}%</strong></div><div><span>Horas/semana</span><strong>{ocupacion.horasSemanales}</strong></div><div><span>Escolaridad media</span><strong>{ocupacion.escolaridadPromedio} años</strong></div></div><p className="co-card-note">Data México marca estas estimaciones salariales con baja precisión estadística. Sirven como contexto de la ocupación, no como predicción individual.</p></article>;
}

export default function OccupationComparePage() {
  const pares = useMemo(() => ocupaciones.ocupaciones.map((ocupacion) => {
    const carrera = carreras.profesiones.find((item) => item.slug === ocupacion.carreraRelacionadaSlug);
    return carrera ? { ocupacion, carrera } : null;
  }).filter(Boolean), []);
  const [inicial] = useState(() => seleccionOcupacionInicial(ocupaciones.ocupaciones, window.location.search));
  const [seleccion, setSeleccion] = useState(inicial.slug);
  const par = pares.find((item) => item.ocupacion.slug === seleccion) || pares[0];

  return <div className="career-occupation-page"><Header /><section className="co-hero"><div className="shell"><nav aria-label="Ruta"><a href="/">Inicio</a><span>/</span><a href="/carreras">Carreras</a><span>/</span><span>Ocupaciones</span></nav><p className="eyebrow">Carrera ≠ ocupación</p><h1>Lo que estudias y el trabajo que desempeñas no son la misma estadística.</h1><p>Observatorio Laboral organiza profesionistas por formación. Data México organiza personas por el trabajo que realizan. Ver ambas capas ayuda a entender el mercado sin fingir que sus promedios son comparables uno a uno.</p><a className="ml-mobile-data-jump" href="#comparar-trabajos">Explorar los datos <span aria-hidden="true">↓</span></a></div></section><main><section className="co-tool" id="comparar-trabajos"><div className="shell">{inicial.desde && <p className="co-origin">Abriste esta comparación desde una ficha profesional. La ocupación relacionada está preseleccionada; puedes cambiarla. No representa el mismo grupo de personas.</p>}<div className="co-picker"><div><p className="eyebrow">Explora un par relacionado</p><h2>Dos lentes sobre el mercado laboral.</h2></div><label><span>Perfil</span><select value={seleccion} onChange={(e) => setSeleccion(e.target.value)}>{pares.map(({ ocupacion, carrera }) => <option value={ocupacion.slug} key={ocupacion.slug}>{carrera.nombre} → {ocupacion.nombre}</option>)}</select></label></div>{par && <div className="co-compare-grid"><TarjetaCarrera carrera={par.carrera} /><div className="co-divider" aria-hidden="true"><span>≠</span></div><TarjetaOcupacion ocupacion={par.ocupacion} /></div>}<aside className="co-warning"><strong>No calculamos una “brecha salarial” entre estas dos tarjetas.</strong><p>Los cortes son distintos (2026-T2 vs. 2026-T1), las poblaciones se clasifican de otra manera y Data México advierte baja precisión salarial. Restar ambas cifras produciría una conclusión engañosa.</p></aside></div></section><section className="co-explain"><div className="shell co-explain-grid"><article><span>01</span><h3>Carrera</h3><p>Responde preguntas sobre personas que estudiaron un campo profesional, aunque hoy puedan trabajar en puestos distintos.</p></article><article><span>02</span><h3>Ocupación</h3><p>Responde preguntas sobre personas que realizan un tipo de trabajo, aunque hayan llegado desde formaciones diferentes.</p></article><article><span>03</span><h3>Vacantes</h3><p>Ninguna de las dos cifras equivale automáticamente a puestos abiertos o contrataciones futuras.</p></article></div></section><section className="co-next"><div className="shell"><div><p className="eyebrow">Del mercado a tus números</p><h2>Después de entender el dato, aterrízalo.</h2><p>Un promedio laboral se vuelve más útil cuando lo conviertes en ingreso neto y lo conectas con presupuesto, ahorro y objetivos.</p></div><div className="co-next-links"><a href="/calculadoras/bruto-a-neto">Bruto → Neto <span>→</span></a><a href="/finanzas/mi-situacion">Analizar mi situación <span>→</span></a></div></div></section></main><Footer /></div>;
}
