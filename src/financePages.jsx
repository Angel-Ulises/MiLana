import { useMemo, useState } from 'react';
import datos from './data/finanzas.json';

const FOTO_ID = '6963848';
const foto = (width = 1400) => `https://images.pexels.com/photos/${FOTO_ID}/pexels-photo-${FOTO_ID}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
const dinero = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0);
const valor = (v) => Math.max(0, Number(v) || 0);

export function esRutaFinanzas() {
  if (typeof window === 'undefined') return false;
  return /^\/finanzas(?:\/[^/]+)?\/?$/.test(window.location.pathname);
}

function slugActual() {
  if (typeof window === 'undefined') return '';
  const p = window.location.pathname.split('/').filter(Boolean);
  return p[0] === 'finanzas' ? (p[1] || '') : '';
}

function Header() {
  return <header className="site-header"><div className="shell header-inner"><a className="brand" href="/" aria-label="MiLana, inicio"><span className="brand-mark" aria-hidden="true">M</span><span className="brand-name">MiLana</span></a><nav className="desktop-nav" aria-label="Principal"><a href="/finanzas">Finanzas</a><a href="/carreras">Carreras</a><a href="/#calculadoras">Calculadoras</a><a href="/aprende/">Aprende</a></nav><a className="header-cta" href="/finanzas/presupuesto">Ordenar mi dinero</a></div></header>;
}

function Footer() {
  return <footer className="site-footer"><div className="shell footer-inner"><div><span className="brand-name">MiLana</span><p>Dinero claro para decidir mejor.</p><p>{datos.nota}</p></div><p>MiLana © 2026 · Hecho en México</p></div></footer>;
}

function Fuente({ tipo }) {
  const f = datos.fuentes[tipo];
  if (!f) return null;
  return <aside className="finance-source"><span>Fuente</span><div><strong>{f.nombre}</strong><p>{f.fecha}</p></div></aside>;
}

function Hero({ eyebrow, title, lede, photo = true }) {
  return <section className="finance-page-hero"><div className="shell finance-page-hero-grid"><div className="finance-page-hero-copy"><nav aria-label="Ruta"><a href="/">Inicio</a><span>/</span><a href="/finanzas">Finanzas</a></nav><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="finance-page-lede">{lede}</p><div className="finance-page-proof"><span>Sin registro</span><span>Todo en tu navegador</span><span>Supuestos visibles</span></div></div>{photo && <figure className="finance-page-photo"><img src={foto(1400)} srcSet={`${foto(720)} 720w, ${foto(1400)} 1400w`} sizes="(max-width: 900px) 100vw, 46vw" alt="Persona organizando un presupuesto con laptop y calculadora" loading="eager" /></figure>}</div></section>;
}

function Campo({ label, value, onChange, help, placeholder = '0' }) {
  return <label className="finance-field"><span>{label}</span><div><b>$</b><input inputMode="decimal" type="number" min="0" step="100" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></div>{help && <small>{help}</small>}</label>;
}

function Resultado({ label, value, note, tone = '' }) {
  return <article className={`finance-result-card ${tone}`}><span>{label}</span><strong>{value}</strong>{note && <p>{note}</p>}</article>;
}

function Hub() {
  const rutas = [
    ['01','Presupuesto','¿Cuánto entra, cuánto sale y cuánto queda?','/finanzas/presupuesto'],
    ['02','Fondo de emergencia','Convierte tus gastos esenciales en una meta de 3 a 6 meses.','/finanzas/fondo-emergencia'],
    ['03','Deuda y crédito','Mide cuánto de tu ingreso ya está comprometido y qué comparar.','/finanzas/deuda-y-credito'],
    ['04','Ahorro','Pon fecha aproximada a una meta sin inventar rendimientos.','/finanzas/ahorro'],
    ['05','Vivienda','Ordena ingreso, ahorro y deuda antes de rentar o comprar.','/finanzas/vivienda'],
    ['06','Retiro','Revisa requisitos y continúa hacia Pensión IMSS.','/calculadoras/pension-imss'],
  ];
  return <><Hero eyebrow="Finanzas personales · México" title="Tu dinero no vive en temas separados." lede="Sueldo, gastos, deuda, ahorro y vivienda se afectan entre sí. MiLana los conecta para que puedas entender qué cambia antes de tomar una decisión." /><main><section className="finance-hub"><div className="shell finance-hub-grid"><div className="finance-hub-copy"><p className="eyebrow">Empieza por tu situación</p><h2>Primero entiende el flujo. Después decide.</h2><p>No necesitas saber de finanzas para empezar. Elige la pregunta que tengas hoy y MiLana te lleva a una herramienta o a la siguiente decisión útil.</p></div><div className="finance-route-list">{rutas.map(([n,t,d,h]) => <a href={h} key={n}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div><b>↗</b></a>)}</div></div></section><section className="finance-advisor-preview"><div className="shell finance-advisor-preview-inner"><div><p className="eyebrow">La base del futuro asesor</p><h2>“Gano X, gasto Y y quiero lograr Z.”</h2><p>Estas herramientas crean las piezas que después permitirán a MiLana conectar contexto personal, escenarios y calculadoras sin convertir una sola cifra en una recomendación automática.</p></div><a href="/finanzas/presupuesto">Empezar con mi presupuesto <span>→</span></a></div></section></main></>;
}

function Presupuesto() {
  const [ingreso,setIngreso] = useState(''); const [esenciales,setEsenciales] = useState(''); const [variables,setVariables] = useState(''); const [deuda,setDeuda] = useState('');
  const r = useMemo(() => { const i=valor(ingreso), e=valor(esenciales), v=valor(variables), d=valor(deuda), gastos=e+v+d, saldo=i-gastos; return {i,e,v,d,gastos,saldo,tasa:i>0?(saldo/i)*100:0,deudaPct:i>0?(d/i)*100:0}; }, [ingreso,esenciales,variables,deuda]);
  return <><Hero eyebrow="Herramienta · Presupuesto" title="¿A dónde se va tu dinero cada mes?" lede="Empieza por tu ingreso neto y separa gastos esenciales, variables y pagos de deuda. El objetivo no es juzgar el gasto: es ver el flujo completo en una sola pantalla." /><main className="finance-tool-main"><section className="finance-tool-section"><div className="shell finance-tool-layout"><div className="finance-form-card"><p className="eyebrow">Tus números</p><h2>Presupuesto mensual</h2><Campo label="Ingreso neto mensual" value={ingreso} onChange={setIngreso} help="Lo que realmente llega a tu cuenta." /><Campo label="Gastos esenciales" value={esenciales} onChange={setEsenciales} help="Vivienda, comida, transporte, servicios, salud y otros básicos." /><Campo label="Gastos variables" value={variables} onChange={setVariables} help="Ocio, salidas, compras y otros gastos que cambian mes con mes." /><Campo label="Pagos mensuales de deuda" value={deuda} onChange={setDeuda} help="Tarjetas, préstamos, auto u otras mensualidades." /></div><div className="finance-results"><p className="eyebrow">Tu fotografía mensual</p><div className="finance-results-grid"><Resultado label="Ingreso" value={dinero(r.i)} /><Resultado label="Gasto total" value={dinero(r.gastos)} /><Resultado label="Disponible" value={dinero(r.saldo)} tone={r.saldo < 0 ? 'warning' : 'positive'} note={r.i>0 ? `${r.tasa.toFixed(1)}% del ingreso queda después de los gastos capturados.` : 'Captura tu ingreso para calcular la proporción.'} /><Resultado label="Pagos de deuda" value={r.i>0 ? `${r.deudaPct.toFixed(1)}%` : '—'} note="Proporción descriptiva de tu ingreso neto; no es un límite de aprobación de crédito." /></div><div className="finance-next-box"><span>Siguiente pregunta</span><h3>{r.saldo > 0 ? '¿Qué quieres hacer con lo que queda?' : 'Tus gastos capturados superan el ingreso.'}</h3><p>{r.saldo > 0 ? 'Puedes convertir parte de ese saldo en una meta de fondo de emergencia o ahorro.' : 'Revisa primero qué rubros pueden ajustarse o si falta registrar algún ingreso; MiLana no asume que todos los gastos sean prescindibles.'}</p><div><a href="/finanzas/fondo-emergencia">Fondo de emergencia →</a><a href="/finanzas/ahorro">Meta de ahorro →</a></div></div><Fuente tipo="presupuesto" /></div></div></section></main></>;
}

function FondoEmergencia() {
  const [esenciales,setEsenciales]=useState(''); const [actual,setActual]=useState(''); const [mensual,setMensual]=useState('');
  const r=useMemo(()=>{const e=valor(esenciales),a=valor(actual),m=valor(mensual),min=e*3,max=e*6; const meses=(meta)=>m>0?Math.max(0,Math.ceil((meta-a)/m)):null;return {min,max,a,m,m3:meses(min),m6:meses(max)}},[esenciales,actual,mensual]);
  return <><Hero eyebrow="Herramienta · Respaldo" title="Ponle número a tu fondo de emergencia." lede="CONDUSEF usa como referencia un fondo equivalente a 3 a 6 meses de gastos esenciales. MiLana convierte esa idea en una meta y te deja elegir cuánto aportar cada mes." /><main className="finance-tool-main"><section className="finance-tool-section"><div className="shell finance-tool-layout"><div className="finance-form-card"><p className="eyebrow">Tu punto de partida</p><h2>Meta de respaldo</h2><Campo label="Gastos esenciales mensuales" value={esenciales} onChange={setEsenciales} /><Campo label="Ahorro que ya tienes para emergencias" value={actual} onChange={setActual} /><Campo label="Aportación mensual que tú eliges" value={mensual} onChange={setMensual} /></div><div className="finance-results"><p className="eyebrow">Rango de referencia</p><div className="finance-results-grid"><Resultado label="3 meses" value={dinero(r.min)} note={r.m3===null?'Captura una aportación para estimar tiempo.':`A este ritmo: ${r.m3} meses para llegar.`} /><Resultado label="6 meses" value={dinero(r.max)} note={r.m6===null?'Captura una aportación para estimar tiempo.':`A este ritmo: ${r.m6} meses para llegar.`} /><Resultado label="Ya acumulado" value={dinero(r.a)} /><Resultado label="Aportación mensual" value={dinero(r.m)} /></div><div className="finance-next-box"><span>Importante</span><h3>El fondo necesita liquidez, no promesas de rendimiento.</h3><p>La referencia de CONDUSEF prioriza que el dinero esté separado, disponible y en una institución formal. Esta herramienta no asigna productos ni supone rendimientos.</p><a href="/finanzas/ahorro">Después: planear otra meta →</a></div><Fuente tipo="fondo" /></div></div></section></main></>;
}

function DeudaCredito() {
  const [ingreso,setIngreso]=useState(''); const [pagos,setPagos]=useState('');
  const i=valor(ingreso), p=valor(pagos), pct=i>0?(p/i)*100:0;
  return <><Hero eyebrow="Herramienta · Crédito" title="¿Cuánto de tu ingreso ya está comprometido en deuda?" lede="Esta proporción no decide si un crédito es bueno o malo. Sirve para hacer visible cuánto del ingreso neto se usa en pagos antes de comparar un nuevo financiamiento." /><main className="finance-tool-main"><section className="finance-tool-section"><div className="shell finance-tool-layout"><div className="finance-form-card"><p className="eyebrow">Dos datos</p><h2>Compromiso mensual</h2><Campo label="Ingreso neto mensual" value={ingreso} onChange={setIngreso} /><Campo label="Pagos mensuales de todas tus deudas" value={pagos} onChange={setPagos} /></div><div className="finance-results"><Resultado label="Ingreso destinado a deudas" value={i>0?`${pct.toFixed(1)}%`:'—'} note={i>0?`${dinero(p)} de ${dinero(i)} al mes.`:'Captura ingreso y pagos para calcularlo.'} /><div className="finance-checklist"><p className="eyebrow">Antes de contratar otro crédito</p><h2>Compara costo, no solo mensualidad.</h2><ul><li><strong>CAT:</strong> resume costos y comisiones bajo una metodología comparable.</li><li><strong>Tasa de interés:</strong> no es lo mismo que CAT.</li><li><strong>Comisiones y seguros:</strong> pueden cambiar el costo total.</li><li><strong>Monto total a pagar:</strong> ayuda a ver el efecto del plazo.</li><li><strong>Pago periódico:</strong> debe caber en tu presupuesto real.</li></ul></div><Fuente tipo="credito" /></div></div></section></main></>;
}

function Ahorro() {
  const [meta,setMeta]=useState(''); const [actual,setActual]=useState(''); const [mensual,setMensual]=useState('');
  const m=valor(meta),a=valor(actual),ap=valor(mensual),faltante=Math.max(0,m-a),meses=ap>0?Math.ceil(faltante/ap):null;
  return <><Hero eyebrow="Herramienta · Metas" title="¿Cuánto tardarías en llegar a una meta de ahorro?" lede="Haz primero la versión simple: meta, ahorro actual y aportación mensual. MiLana no supone rendimientos porque una meta de corto plazo no debería depender de una tasa inventada." /><main className="finance-tool-main"><section className="finance-tool-section"><div className="shell finance-tool-layout"><div className="finance-form-card"><p className="eyebrow">Tu meta</p><h2>Ahorro sin supuestos ocultos</h2><Campo label="Meta total" value={meta} onChange={setMeta} /><Campo label="Ahorro actual" value={actual} onChange={setActual} /><Campo label="Aportación mensual" value={mensual} onChange={setMensual} /></div><div className="finance-results"><div className="finance-results-grid"><Resultado label="Falta por reunir" value={dinero(faltante)} /><Resultado label="Tiempo estimado" value={meses===null?'—':`${meses} meses`} note="Sin asumir intereses ni rendimientos." /></div><div className="finance-next-box"><span>Hazlo sostenible</span><h3>La constancia importa más que una cifra perfecta.</h3><p>CONDUSEF recomienda incorporar el ahorro al presupuesto y, cuando sea posible, automatizarlo. La cantidad adecuada depende de tu flujo, tus deudas y tu horizonte.</p><a href="/finanzas/presupuesto">Revisar mi presupuesto →</a></div><Fuente tipo="ahorro" /></div></div></section></main></>;
}

function Vivienda() {
  const pasos=[['01','Ingreso neto','Empieza por cuánto llega realmente a tu cuenta.','/calculadoras/bruto-a-neto'],['02','Presupuesto','Mide cuánto queda después de tus gastos y deudas.','/finanzas/presupuesto'],['03','Respaldo','Separa el fondo de emergencia de un enganche o meta de vivienda.','/finanzas/fondo-emergencia'],['04','Deuda','Haz visible cuánto ingreso ya está comprometido.','/finanzas/deuda-y-credito'],['05','Crédito','Solo después compara un escenario de financiamiento.','/calculadoras/infonavit']];
  return <><Hero eyebrow="Ruta · Vivienda" title="Antes de rentar o comprar, ordena cinco números." lede="La vivienda no debería empezar por ‘¿cuánto me prestan?’. MiLana propone empezar por ingreso neto, presupuesto, respaldo, deuda y después comparar financiamiento." /><main><section className="finance-housing"><div className="shell"><div className="finance-housing-head"><p className="eyebrow">Orden sugerido de análisis</p><h2>De tu sueldo al costo de vivienda.</h2></div><div className="finance-housing-steps">{pasos.map(([n,t,d,h])=><a href={h} key={n}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div><b>→</b></a>)}</div><aside className="finance-source"><span>Alcance</span><div><strong>MiLana no determina si debes rentar, comprar o contratar un crédito.</strong><p>La ruta organiza datos para que puedas comparar escenarios y después revisar condiciones oficiales del producto que corresponda.</p></div></aside></div></section></main></>;
}

export default function FinancePages(){const slug=slugActual();let contenido;if(!slug)contenido=<Hub/>;else if(slug==='presupuesto')contenido=<Presupuesto/>;else if(slug==='fondo-emergencia')contenido=<FondoEmergencia/>;else if(slug==='deuda-y-credito')contenido=<DeudaCredito/>;else if(slug==='ahorro')contenido=<Ahorro/>;else if(slug==='vivienda')contenido=<Vivienda/>;else contenido=<main className="finance-not-found"><h1>Página no encontrada</h1><a href="/finanzas">Volver a finanzas</a></main>;return <div className="finance-pages"><Header/>{contenido}<Footer/></div>}
