import { useMemo, useState } from 'react';
import { CNBV_FUND_SAMPLE } from './data/cnbv-fund-sample.js';

export function esRutaFondosCNBV() {
  if (typeof window === 'undefined') return false;
  return /^\/finanzas\/inversion\/fondos\/?$/.test(window.location.pathname);
}

const money = (value) => new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN', maximumFractionDigits:0 }).format(value);

function Header() {
  return <header className="site-header"><div className="shell header-inner"><a className="brand" href="/" aria-label="MiLana, inicio"><span className="brand-mark" aria-hidden="true">M</span><span className="brand-name">MiLana</span></a><nav className="desktop-nav" aria-label="Principal"><a href="/finanzas">Finanzas</a><a href="/estados">Estados</a><a href="/carreras">Carreras</a><a href="/economia">Economía</a></nav><a className="header-cta" href="/finanzas/mi-situacion">Mi situación</a></div></header>;
}

export default function CnbvFundsPage() {
  const [tipo, setTipo] = useState('todos');
  const [texto, setTexto] = useState('');
  const visibles = useMemo(() => {
    const q = texto.trim().toLowerCase();
    return CNBV_FUND_SAMPLE.records.filter((item) => {
      if (tipo !== 'todos' && item.fundType !== tipo) return false;
      if (!q) return true;
      return [item.operatorCode, item.fundCode, item.classification, item.fundType].some((value) => String(value).toLowerCase().includes(q));
    });
  }, [tipo, texto]);

  return <div className="cnbv-funds-page">
    <Header />
    <main>
      <section className="cnbv-funds-hero"><div className="shell"><nav aria-label="Ruta"><a href="/">Inicio</a><span>/</span><a href="/finanzas">Finanzas</a><span>/</span><a href="/finanzas/inversion">Inversión</a><span>/</span><span>Fondos CNBV</span></nav><p className="eyebrow">Registro regulatorio · México</p><h1>Fondos reportados a CNBV, con el corte a la vista.</h1><p>Esta primera capa usa el Reporte R1 del Portafolio de Información de CNBV. Muestra cómo la autoridad recibió cada fondo: operadora, tipo, clasificación y activo neto diario. No muestra una oferta comercial ni decide cuál comprar.</p><div className="cnbv-funds-proof"><span>Corte {CNBV_FUND_SAMPLE.sourcePeriod}</span><span>Sin ranking</span><span>Sin recomendación</span><span>Fuente CNBV</span></div></div></section>

      <section className="cnbv-funds-tool"><div className="shell"><div className="cnbv-funds-controls"><label><span>Tipo de fondo</span><select value={tipo} onChange={(e) => setTipo(e.target.value)}><option value="todos">Todos</option><option value="Deuda">Deuda</option><option value="Renta Variable">Renta Variable</option></select></label><label><span>Buscar en la muestra</span><input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ej. FT-LIQU, gubernamental, OPFRANK" /></label></div><p className="cnbv-funds-count">{visibles.length} de {CNBV_FUND_SAMPLE.records.length} registros de la muestra inicial</p><div className="cnbv-funds-grid">{visibles.map((item) => <article key={`${item.operatorCode}-${item.fundCode}`}><div className="cnbv-funds-card-top"><span>{item.fundType}</span><strong>{item.fundCode}</strong></div><dl><div><dt>Operadora · clave CNBV</dt><dd>{item.operatorCode}</dd></div><div><dt>Clasificación regulatoria</dt><dd>{item.classification}</dd></div><div><dt>Activo neto diario reportado</dt><dd>{money(item.netAssets)}</dd></div><div><dt>Periodo</dt><dd>{CNBV_FUND_SAMPLE.sourcePeriod}</dd></div></dl></article>)}</div></div></section>

      <section className="cnbv-funds-reading"><div className="shell"><div><p className="eyebrow">Cómo leer el R1</p><h2>Activo neto no es precio, rendimiento ni dinero disponible para invertir.</h2><p>CNBV define activo neto como la diferencia entre activos y pasivos del fondo. Sirve para dimensionar patrimonio reportado, pero no sustituye el precio de una serie, su rendimiento histórico, sus comisiones ni las reglas de recompra.</p></div><div className="cnbv-funds-checklist"><h3>Antes de evaluar un fondo concreto todavía falta revisar</h3><ul><li>Serie disponible para la persona inversionista.</li><li>Prospecto, objetivo y régimen de inversión.</li><li>Comisiones y gastos aplicables.</li><li>Liquidez y condiciones de recompra.</li><li>Precio de la serie y rendimiento histórico con fecha.</li><li>Distribuidora/intermediario y custodia.</li></ul></div></div></section>

      <section className="cnbv-funds-source"><div className="shell"><div><p className="eyebrow">Trazabilidad</p><h2>Fuente regulatoria, no selección editorial por desempeño.</h2><p>{CNBV_FUND_SAMPLE.note} Última revisión de MiLana: {CNBV_FUND_SAMPLE.checkedAt}.</p></div><div><strong>{CNBV_FUND_SAMPLE.sourceLabel}</strong><p>Campos usados: {CNBV_FUND_SAMPLE.fields.join(' · ')}.</p><a href={CNBV_FUND_SAMPLE.sourceUrl} target="_blank" rel="noreferrer">Abrir Portafolio de Información CNBV ↗</a></div></div></section>

      <section className="cnbv-funds-boundary"><div className="shell"><div><p className="eyebrow">Límite</p><h2>Que un fondo aparezca en este reporte no significa que sea adecuado ni que esté disponible en cualquier plataforma.</h2><p>MiLana no ordena estos registros por tamaño, rendimiento o conveniencia. Para una decisión real todavía debe revisarse la serie concreta, documentación contractual, perfilamiento y condiciones del intermediario.</p></div><div><a href="/finanzas/inversion/comparar">Comparar familias <span>→</span></a><a href="/finanzas/inversion/cetes">Ver referencias CETES <span>→</span></a><a href="/finanzas/inversion">Volver al mapa previo <span>→</span></a></div></div></section>
    </main>
    <footer className="site-footer"><div className="shell footer-inner"><div><span className="brand-name">MiLana</span><p>Dinero claro para decidir mejor.</p><p>Contenido educativo. No constituye asesoría de inversión ni recomendación de compra, venta o mantenimiento de instrumentos.</p></div><p>MiLana © 2026 · Hecho en México</p></div></footer>
  </div>;
}
