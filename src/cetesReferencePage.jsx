import { CETES_REFERENCE } from './data/cetes-reference.js';
import AdReserve from './AdReserve.jsx';

export function esRutaCetesReferencia() {
  if (typeof window === 'undefined') return false;
  return /^\/finanzas\/inversion\/cetes\/?$/.test(window.location.pathname);
}

const fecha = (iso) => new Intl.DateTimeFormat('es-MX', { day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }).format(new Date(`${iso}T12:00:00Z`));
const porcentaje = (n) => `${Number(n).toFixed(2)}%`;
const precio = (n) => new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN', minimumFractionDigits:2, maximumFractionDigits:2 }).format(n);

function Header() {
  return <header className="site-header"><div className="shell header-inner"><a className="brand" href="/" aria-label="MiLana, inicio"><img className="brand-logo" src="/milana-horizontal.svg" width="144" height="27" alt="" aria-hidden="true" /></a><nav className="desktop-nav" aria-label="Principal"><a href="/finanzas">Finanzas</a><a href="/estados">Estados</a><a href="/carreras">Carreras</a><a href="/economia">Economía</a></nav><a className="header-cta" href="/finanzas/mi-situacion">Mi situación</a></div></header>;
}

export default function CetesReferencePage() {
  const { products } = CETES_REFERENCE;
  return <div className="cetes-reference-page">
    <Header />
    <main>
      <section className="cetes-reference-hero"><div className="shell"><nav aria-label="Ruta"><a href="/">Inicio</a><span>/</span><a href="/finanzas">Finanzas</a><span>/</span><a href="/finanzas/inversion">Inversión</a><span>/</span><span>CETES</span></nav><p className="eyebrow">Referencia oficial · México</p><h1>CETES por plazo, con fecha y fuente visibles.</h1><p>Esta página muestra una copia fechada de la tabla oficial de cetesdirecto. Sirve para entender qué cambia entre plazos; no es una cotización en tiempo real, no ordena las opciones y no indica cuál deberías comprar.</p><div className="cetes-reference-proof"><span>Fuente oficial</span><span>Corte fechado</span><span>Sin ranking</span><span>Sin operación</span></div></div></section>

      <section className="cetes-reference-snapshot"><div className="shell"><div className="cetes-reference-head"><div><p className="eyebrow">Corte verificado</p><h2>{fecha(CETES_REFERENCE.sourceDate)}</h2><p>{CETES_REFERENCE.scope}</p></div><a href={CETES_REFERENCE.sourceUrl} target="_blank" rel="noreferrer">Abrir tabla oficial ↗</a></div>
        <div className="cetes-reference-grid">{products.map((item) => <article key={item.id}><div><span>{item.displayTerm}</span><strong>{item.label}</strong></div><dl><div><dt>Tasa bruta anual publicada</dt><dd>{porcentaje(item.grossAnnualRatePct)}</dd></div><div><dt>Precio indicativo publicado</dt><dd>{precio(item.indicativePrice)}</dd></div><div><dt>Plazo de referencia</dt><dd>{item.days} días</dd></div><div><dt>Valor nominal</dt><dd>{precio(CETES_REFERENCE.nominalValueMx)}</dd></div></dl></article>)}</div>
        <p className="cetes-reference-footnote">Las tasas y precios pueden cambiar entre subastas y fechas. El precio mostrado es el publicado en la fuente para ese corte; MiLana no lo trata como precio ejecutable ni calcula un rendimiento futuro garantizado.</p>
      </div></section>

      <section className="cetes-reference-read"><div className="shell"><div><p className="eyebrow">Cómo leerlo</p><h2>Más plazo no significa automáticamente “mejor”.</h2><p>Una tasa publicada más alta en un plazo concreto no sustituye preguntas sobre cuándo necesitarás el dinero, liquidez, impuestos, reinversión y condiciones del canal. Esta vista mantiene los plazos lado a lado sin ordenar por rendimiento.</p></div><ol><li><span>01</span><strong>Fecha</strong><p>Comprueba primero de qué día es la tabla. Una cifra antigua no debe presentarse como tasa vigente.</p></li><li><span>02</span><strong>Plazo</strong><p>El vencimiento cambia cuándo recuperas el valor nominal si mantienes el título hasta el final.</p></li><li><span>03</span><strong>Tasa publicada</strong><p>Es una referencia bruta anual del corte oficial; no equivale a rendimiento neto personal.</p></li><li><span>04</span><strong>Precio indicativo</strong><p>Los CETES se adquieren a descuento respecto a su valor nominal; el precio concreto debe verificarse al operar.</p></li></ol></div></section>

      <section className="cetes-reference-boundary"><div className="shell"><div><p className="eyebrow">Límite</p><h2>Datos concretos, decisión todavía separada.</h2><p>MiLana no usa este corte para recomendar plazo, monto o instrumento. La ejecución, custodia, impuestos y condiciones finales pertenecen al canal financiero que la persona decida utilizar.</p></div><div><a href="/finanzas/inversion/comparar">Comparar familias <span>→</span></a><a href="/finanzas/inversion">Volver al mapa previo <span>→</span></a></div></div></section>
    </main>
    <><AdReserve size="970x90" /><footer className="site-footer"><div className="shell footer-inner"><div><span className="brand-name">MiLana</span><p>Dinero claro para decidir mejor.</p><p>Contenido educativo. No constituye asesoría de inversión ni recomendación de compra, venta o mantenimiento.</p></div><p>MiLana © 2026 · Hecho en México</p></div></footer></>
  </div>;
}
