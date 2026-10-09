import ReadingDetails from './ReadingDetails.jsx';
import SiteHeader from './siteHeader.jsx';
import { useMemo, useState } from 'react';
import datos from './data/profesiones.json';
import AdReserve from './AdReserve.jsx';
import { resolverParComparacion } from './lib/compareFromProfile.js';

const dinero = (n) => new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN', maximumFractionDigits:0 }).format(Number(n)||0);
const numero = (n) => new Intl.NumberFormat('es-MX').format(Number(n)||0);

export function esRutaCompararCarreras() {
  if (typeof window === 'undefined') return false;
  return /^\/carreras\/comparar\/?$/.test(window.location.pathname);
}

function Header() {
  return <SiteHeader ctaHref="/finanzas/mi-situacion" ctaLabel="Mi situación" />;
}

function Footer(){return <><AdReserve size="970x90" /><footer className="site-footer"><div className="shell footer-inner"><div><span className="brand-name">MiLana</span><p>Dinero claro para decidir mejor.</p><p>{datos.nota}</p></div><p>MiLana © 2026 · Hecho en México</p></div></footer></>}

function Card({ p, label }){
  return <article className="cc-card"><span className="cc-label">{label}</span><p className="cc-area">{p.area}</p><h2>{p.nombre}</h2><div className="cc-primary"><span>Ingreso promedio mensual</span><strong>{dinero(p.ingreso)}</strong></div><dl><div><dt>Profesionistas ocupados</dt><dd>{numero(p.ocupados)}</dd></div></dl><ReadingDetails className="cc-card-more"><summary>Ver composición de este grupo</summary><dl><div><dt>Hombres</dt><dd>{p.hombres}%</dd></div><div><dt>Mujeres</dt><dd>{p.mujeres}%</dd></div></dl></ReadingDetails><a href={`/carreras/profesion/${p.slug}`}>Abrir perfil completo →</a></article>
}

export default function CareerComparePage(){
  const lista = datos.profesiones;
  const [seleccionInicial] = useState(() => resolverParComparacion(lista, window.location.search));
  const [a,setA]=useState(seleccionInicial.a);
  const [b,setB]=useState(seleccionInicial.b);
  const pa=useMemo(()=>lista.find(x=>x.slug===a)||lista[0],[a,lista]);
  const pb=useMemo(()=>lista.find(x=>x.slug===b)||lista[1]||lista[0],[b,lista]);
  const diferenciaIngreso = Math.abs((pa?.ingreso||0)-(pb?.ingreso||0));
  const diferenciaOcupados = Math.abs((pa?.ocupados||0)-(pb?.ocupados||0));
  const mismo = pa?.slug===pb?.slug;

  return <div className="career-compare-page"><Header/><section className="cc-hero"><div className="shell"><nav aria-label="Ruta"><a href="/">Inicio</a><span>/</span><a href="/carreras">Carreras</a><span>/</span><span>Comparar</span></nav><p className="eyebrow">Comparador · México 2026</p><h1>Compara dos carreras sin convertir la decisión en un ranking.</h1><p>Ingreso promedio y tamaño de la población profesional ayudan a entender contexto, pero no deciden por ti. Todos los perfiles usan el mismo corte del Observatorio Laboral con ENOE 2026-T2.</p><a className="ml-mobile-data-jump" href="#comparar">Elegir carreras <span aria-hidden="true">↓</span></a></div></section><main><section className="cc-tool" id="comparar"><div className="shell">{seleccionInicial.origen && <p className="ml-compare-origin">Partimos de la profesión que estabas consultando. La segunda carrera es una selección inicial: puedes cambiarla.</p>}<div className="cc-selectors"><label><span>Carrera A</span><select value={a} onChange={e=>setA(e.target.value)}>{lista.map(p=><option value={p.slug} key={p.slug}>{p.nombre}</option>)}</select></label><label><span>Carrera B</span><select value={b} onChange={e=>setB(e.target.value)}>{lista.map(p=><option value={p.slug} key={p.slug}>{p.nombre}</option>)}</select></label></div>{mismo?<div className="cc-same">Elige dos carreras distintas para ver una comparación útil.</div>:<><div className="cc-grid"><Card p={pa} label="Carrera A"/><div className="cc-vs" aria-hidden="true">vs.</div><Card p={pb} label="Carrera B"/></div><section className="cc-diff"><p className="eyebrow">Diferencias observadas</p><div><article><span>Diferencia entre promedios de ingreso</span><strong>{dinero(diferenciaIngreso)}</strong><p>No implica que una persona concreta vaya a ganar esa diferencia.</p></article><article><span>Diferencia en población profesional ocupada</span><strong>{numero(diferenciaOcupados)}</strong><p>No equivale a vacantes abiertas ni a probabilidad de conseguir empleo.</p></article></div></section></>}<aside className="cc-rule"><strong>Qué sí puedes concluir</strong><p>Estas cifras describen grupos profesionales bajo la misma fuente y corte. Sirven para comparar escala e ingreso promedio; faltan experiencia, región, formalidad, afinidad, costo de estudiar y preferencias personales.</p></aside></div></section><section className="cc-next"><div className="shell"><div><p className="eyebrow">Aterriza el dato</p><h2>Después de comparar carreras, compara tu escenario.</h2><p>Usa un salario como punto de partida en Bruto→Neto o captura tus propios números en Mi situación.</p></div><div><a href="/calculadoras/bruto-a-neto">Bruto → Neto</a><a href="/finanzas/mi-situacion">Analizar mi situación</a></div></div></section></main><Footer/></div>
}