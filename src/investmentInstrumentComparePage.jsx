import { useMemo, useState } from 'react';
import { investmentInstrumentClasses, INSTRUMENT_SOURCE_CHECKED_AT } from './data/investment-instrument-classes.js';
import { compararInstrumentosEducativos } from './lib/investmentInstrumentCompare.js';
import AdReserve from './AdReserve.jsx';

export function esRutaCompararInstrumentos() {
  if (typeof window === 'undefined') return false;
  return /^\/finanzas\/inversion\/comparar\/?$/.test(window.location.pathname);
}

function Header() {
  return <header className="site-header"><div className="shell header-inner"><a className="brand" href="/" aria-label="MiLana, inicio"><span className="brand-mark" aria-hidden="true">M</span><span className="brand-name">MiLana</span></a><nav className="desktop-nav" aria-label="Principal"><a href="/finanzas">Finanzas</a><a href="/estados">Estados</a><a href="/carreras">Carreras</a><a href="/economia">Economía</a></nav><a className="header-cta" href="/finanzas/mi-situacion">Mi situación</a></div></header>;
}

function Selector({ label, value, onChange, exclude }) {
  return <label className="instrument-selector"><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}>{investmentInstrumentClasses.filter((item) => item.id !== exclude).map((item) => <option key={item.id} value={item.id}>{item.nombre} · {item.familia}</option>)}</select></label>;
}

export default function InvestmentInstrumentComparePage() {
  const [a, setA] = useState('cetes');
  const [b, setB] = useState('fondos-inversion');
  const comparacion = useMemo(() => compararInstrumentosEducativos([a, b]), [a, b]);
  const [izquierda, derecha] = comparacion.instrumentos;

  return <div className="instrument-compare-page">
    <Header />
    <main>
      <section className="instrument-compare-hero"><div className="shell"><nav aria-label="Ruta"><a href="/">Inicio</a><span>/</span><a href="/finanzas">Finanzas</a><span>/</span><a href="/finanzas/inversion">Inversión</a><span>/</span><span>Comparar</span></nav><p className="eyebrow">Comparación educativa · México</p><h1>Compara estructuras, no promesas.</h1><p>Elige dos familias para ver qué cambia en plazo, liquidez, variación, diversificación, costos e intermediación. MiLana no usa una tasa del día, no asigna un score y no declara un ganador.</p><div className="instrument-compare-proof"><span>Sin ranking</span><span>Sin rendimiento prometido</span><span>Fuentes oficiales</span><span>Sin operación</span></div></div></section>

      <section className="instrument-compare-tool"><div className="shell"><div className="instrument-compare-controls"><Selector label="Instrumento A" value={a} onChange={setA} exclude={b} /><Selector label="Instrumento B" value={b} onChange={setB} exclude={a} /></div>
        <div className="instrument-compare-heads"><article><span>{izquierda.familia}</span><h2>{izquierda.nombre}</h2><p>{izquierda.resumen}</p></article><article><span>{derecha.familia}</span><h2>{derecha.nombre}</h2><p>{derecha.resumen}</p></article></div>
        <div className="instrument-compare-table">{comparacion.dimensiones.map((dimension) => <section key={dimension.id}><h3>{dimension.etiqueta}</h3><div>{dimension.valores.map((valor) => <article key={valor.instrumentoId}><p>{valor.texto}</p></article>)}</div></section>)}</div>
        <p className="instrument-compare-note">{comparacion.nota}</p>
      </div></section>

      <section className="instrument-source-panel"><div className="shell"><div><p className="eyebrow">Trazabilidad</p><h2>Lee la ficha oficial antes de pasar de una categoría a un producto concreto.</h2><p>Las características reales pueden cambiar por instrumento, serie, prospecto, intermediario y fecha. Estas fuentes se usaron para construir la capa educativa; última revisión editorial: {INSTRUMENT_SOURCE_CHECKED_AT}.</p></div><div className="instrument-source-grid">{comparacion.instrumentos.map((instrumento) => <article key={instrumento.id}><span>{instrumento.nombre}</span><strong>{instrumento.fuente.institucion}</strong><p>{instrumento.fuente.titulo}</p><a href={instrumento.fuente.url} target="_blank" rel="noreferrer">Abrir fuente oficial ↗</a></article>)}</div></div></section>

      <section className="instrument-compare-boundary"><div className="shell"><div><p className="eyebrow">Límite de esta herramienta</p><h2>Una categoría no determina qué le conviene a una persona.</h2><p>Para pasar de educación a una decisión real todavía importan objetivo, horizonte, necesidad de liquidez, capacidad financiera, tolerancia a pérdidas, impuestos, costos, documentación y condiciones del producto concreto.</p></div><div><a href="/finanzas/inversion/cetes">Ver snapshot oficial de CETES <span>→</span></a><a href="/finanzas/inversion/fondos">Ver muestra regulatoria de fondos CNBV <span>→</span></a><a href="/finanzas/inversion">Volver al mapa previo <span>→</span></a><a href="/finanzas/mi-situacion">Revisar mi situación <span>→</span></a></div></div></section>
    </main>
    <><AdReserve size="970x90" /><footer className="site-footer"><div className="shell footer-inner"><div><span className="brand-name">MiLana</span><p>Dinero claro para decidir mejor.</p><p>Contenido educativo. No constituye asesoría de inversión ni recomendación de compra, venta o mantenimiento de instrumentos.</p></div><p>MiLana © 2026 · Hecho en México</p></div></footer></>
  </div>;
}
