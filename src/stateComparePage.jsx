import ReadingDetails from './ReadingDetails.jsx';
import SiteHeader from './siteHeader.jsx';
import { useMemo, useState } from 'react';
import estadosData from './data/estados.json';
import laboralData from './data/mercadoLaboralEstados.json';
import viviendaData from './data/viviendaEstados.json';
import AdReserve from './AdReserve.jsx';
import { resolverParComparacion } from './lib/compareFromProfile.js';

const dinero = (n) => new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN', maximumFractionDigits:0 }).format(Number(n)||0);
const numero = (n) => new Intl.NumberFormat('es-MX').format(Number(n)||0);
const puntos = (n) => `${Math.abs(Number(n)||0).toFixed(1)} pp`;

export function esRutaCompararEstados() {
  if (typeof window === 'undefined') return false;
  return /^\/estados\/comparar\/?$/.test(window.location.pathname);
}

function Header() {
  return <SiteHeader ctaHref="/finanzas/mi-situacion" ctaLabel="Mi situación" />;
}

function Footer(){
  return <><AdReserve size="970x90" /><footer className="site-footer"><div className="shell footer-inner"><div><span className="brand-name">MiLana</span><p>Dinero claro para decidir mejor.</p><p>Fuentes: Observatorio Laboral/STPS, ENOE/INEGI y Sociedad Hipotecaria Federal. Cortes 2026-T2.</p></div><p>MiLana © 2026 · Hecho en México</p></div></footer></>;
}

function Metric({ label, a, b, formatter = (v) => v, note }){
  return <article className="sc-metric"><div className="sc-metric-name"><span>{label}</span>{note && <small>{note}</small>}</div><div className="sc-metric-value"><strong>{formatter(a)}</strong><span>Estado A</span></div><div className="sc-metric-value"><strong>{formatter(b)}</strong><span>Estado B</span></div></article>;
}

function StateSummary({ item, label }){
  return <article className="sc-summary"><span>{label}</span><h2>{item.estado}</h2><div><p>Ingreso profesional promedio</p><strong>{dinero(item.ingreso)}</strong></div><a href={`/estados/${item.slug}`}>Abrir panorama completo →</a></article>;
}

export default function StateComparePage(){
  const [empleoAbierto, setEmpleoAbierto] = useState(null);
  const [viviendaAbierta, setViviendaAbierta] = useState(null);
  const estados = estadosData.estados;
  const laboral = useMemo(() => new Map(laboralData.estados.map((e) => [e.slug,e])), []);
  const vivienda = useMemo(() => new Map(viviendaData.estados.map((e) => [e.slug,e])), []);
  const [seleccionInicial] = useState(() => resolverParComparacion(estados, window.location.search));
  const [a,setA] = useState(seleccionInicial.a);
  const [b,setB] = useState(seleccionInicial.b);
  const ea = estados.find((e) => e.slug === a) || estados[0];
  const eb = estados.find((e) => e.slug === b) || estados[1] || estados[0];
  const la = laboral.get(ea?.slug);
  const lb = laboral.get(eb?.slug);
  const va = vivienda.get(ea?.slug);
  const vb = vivienda.get(eb?.slug);
  const mismo = ea?.slug === eb?.slug;

  const diferencias = !mismo && la && lb && va && vb ? [
    { label:'Ingreso profesional promedio', value:dinero(Math.abs(ea.ingreso-eb.ingreso)), note:'Diferencia absoluta entre promedios OLA/STPS.' },
    { label:'Informalidad laboral', value:puntos(la.informalidad-lb.informalidad), note:'Diferencia absoluta entre tasas ENOE.' },
    { label:'Desocupación', value:puntos(la.desocupacion-lb.desocupacion), note:'Diferencia absoluta entre tasas ENOE.' },
    { label:'Mediana de avalúo hipotecario', value:dinero(Math.abs(va.mediana-vb.mediana)), note:'Diferencia absoluta entre medianas SHF.' },
  ] : [];

  return <div className="state-compare-page"><Header/><section className="sc-hero"><div className="shell"><nav aria-label="Ruta"><a href="/">Inicio</a><span>/</span><a href="/estados">Estados</a><span>/</span><span>Comparar</span></nav><p className="eyebrow">Comparador estatal · México 2026</p><h1>Compara dos estados sin reducir la decisión a un “mejor” o “peor”.</h1><p>Salario profesional, empleo y vivienda describen dimensiones distintas. MiLana las coloca lado a lado usando el mismo corte dentro de cada fuente, pero no las combina en un puntaje ni inventa un índice de costo de vida.</p><a className="ml-mobile-data-jump" href="#comparar">Elegir estados <span aria-hidden="true">↓</span></a></div></section><main><section className="sc-tool" id="comparar"><div className="shell">{seleccionInicial.origen && <p className="ml-compare-origin">Partimos de la entidad que estabas consultando. El segundo estado es una selección inicial: puedes cambiarlo.</p>}<div className="sc-selectors"><label><span>Estado A</span><select value={a} onChange={(e)=>setA(e.target.value)}>{estados.map((e)=><option key={e.slug} value={e.slug}>{e.estado}</option>)}</select></label><label><span>Estado B</span><select value={b} onChange={(e)=>setB(e.target.value)}>{estados.map((e)=><option key={e.slug} value={e.slug}>{e.estado}</option>)}</select></label></div>{mismo ? <div className="sc-same">Elige dos entidades distintas para ver una comparación útil.</div> : <><div className="sc-summaries"><StateSummary item={ea} label="Estado A"/><div className="sc-vs" aria-hidden="true">vs.</div><StateSummary item={eb} label="Estado B"/></div><div className="sc-section-head"><p className="eyebrow">Trabajo profesional</p><h2>Mismo indicador, misma fuente.</h2></div><div className="sc-metrics"><Metric label="Ingreso profesional promedio mensual" a={ea.ingreso} b={eb.ingreso} formatter={dinero} note="OLA/STPS · profesionistas ocupados"/><Metric label="Profesionistas ocupados" a={ea.ocupados} b={eb.ocupados} formatter={numero} note="Tamaño de población profesional, no vacantes"/></div><ReadingDetails className="sc-more-dimensions" manualOpen={empleoAbierto} onManualChange={setEmpleoAbierto}><summary><strong>Explorar empleo e informalidad</strong><span>6 indicadores ↓</span></summary><div className="sc-more-body"><div className="sc-section-head"><p className="eyebrow">Mercado laboral general</p><h2>Las tasas ENOE no son salarios.</h2></div><div className="sc-metrics"><Metric label="Participación económica" a={la.participacion} b={lb.participacion} formatter={(v)=>`${v.toFixed(1)}%`} note="ENOE 2026-T2"/><Metric label="Desocupación" a={la.desocupacion} b={lb.desocupacion} formatter={(v)=>`${v.toFixed(1)}%`} note="ENOE 2026-T2"/><Metric label="Informalidad laboral" a={la.informalidad} b={lb.informalidad} formatter={(v)=>`${v.toFixed(1)}%`} note="ENOE 2026-T2"/><Metric label="Subocupación" a={la.subocupacion} b={lb.subocupacion} formatter={(v)=>`${v.toFixed(1)}%`} note="ENOE 2026-T2"/><Metric label="Trabajo asalariado" a={la.trabajoAsalariado} b={lb.trabajoAsalariado} formatter={(v)=>`${v.toFixed(1)}%`} note="ENOE 2026-T2"/><Metric label="Condiciones críticas" a={la.condicionesCriticas} b={lb.condicionesCriticas} formatter={(v)=>`${v.toFixed(1)}%`} note="ENOE 2026-T2"/></div></div></ReadingDetails><ReadingDetails className="sc-more-dimensions" manualOpen={viviendaAbierta} onManualChange={setViviendaAbierta}><summary><strong>Explorar vivienda</strong><span>3 indicadores ↓</span></summary><div className="sc-more-body"><div className="sc-section-head"><p className="eyebrow">Vivienda hipotecaria</p><h2>Nivel de avalúo y apreciación van separados.</h2></div><div className="sc-metrics"><Metric label="Mediana de avalúo" a={va.mediana} b={vb.mediana} formatter={dinero} note="SHF · enero-junio 2026"/><Metric label="Promedio de avalúo" a={va.promedio} b={vb.promedio} formatter={dinero} note="SHF · sensible a valores extremos"/><Metric label="Apreciación interanual 2026-II" a={va.apreciacion} b={vb.apreciacion} formatter={(v)=>`${v.toFixed(1)}%`} note="SHF · vs. mismo trimestre de 2025"/></div></div></ReadingDetails><section className="sc-differences"><div className="sc-section-head"><p className="eyebrow">Distancias observadas</p><h2>Cuánto se separan las cifras, sin declarar ganador.</h2></div><div>{diferencias.map((d)=><article key={d.label}><span>{d.label}</span><strong>{d.value}</strong><p>{d.note}</p></article>)}</div></section></>}<aside className="sc-rules"><div><span>Qué sí permite</span><strong>Comparar contexto con datos homogéneos</strong><p>Cada fila enfrenta la misma métrica, población, fuente y periodo entre dos entidades.</p></div><div><span>Qué no permite</span><strong>Concluir dónde “conviene más vivir”</strong><p>Faltan renta, transporte, impuestos locales, redes personales, profesión específica, calidad de vida y muchas otras variables.</p></div><div><span>No calculamos</span><strong>Precio de vivienda ÷ sueldo profesional</strong><p>La mediana SHF y el ingreso profesional OLA representan poblaciones diferentes; dividirlas produciría una precisión engañosa.</p></div></aside><div className="sc-next"><a href="/finanzas/mi-situacion"><span>Mis números</span><strong>Analizar mi situación personal</strong><b>→</b></a><a href="/finanzas/vivienda"><span>Vivienda</span><strong>Ordenar una decisión de vivienda</strong><b>→</b></a></div></div></section></main><Footer/></div>;
}