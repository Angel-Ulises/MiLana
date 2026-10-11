import { useMemo, useState } from 'react';
import SiteHeader from './siteHeader.jsx';
import AdReserve from './AdReserve.jsx';
import { investmentInstrumentClasses } from './data/investment-instrument-classes.js';
import { compararComision, proyectarInversion } from './lib/investmentProjection.js';
import { guardarNivelLectura } from './lib/readingDepth.js';
import { useReadingDepth } from './lib/useReadingDepth.js';
import ReadingDetails from './ReadingDetails.jsx';

const pesos = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
const lecciones = {
  cetes: {
    inicio: 'Le prestas dinero al Gobierno de México durante un plazo. Al terminar, recibes lo acordado según las condiciones de compra.',
    medio: 'Son valores de deuda gubernamental comprados a descuento. Su tasa depende de la subasta y del momento en que inviertes.',
  },
  'fondos-inversion': {
    inicio: 'Tu dinero se reúne con el de otras personas para comprar una combinación de inversiones. Las reglas dependen de cada fondo.',
    medio: 'Son carteras administradas. Revisa objetivo, activos, comisiones, serie y cuándo puedes recuperar el dinero.',
  },
  acciones: {
    inicio: 'Compras una pequeña parte de una empresa. Si su valor baja, también puede bajar lo que invertiste.',
    medio: 'Representan participación en una empresa. Su precio varía y puede existir un diferencial al comprar y vender.',
  },
  etf: {
    inicio: 'Es como comprar una canasta de inversiones a través de un solo producto. Puede diversificar, pero también perder valor.',
    medio: 'Es un fondo negociado en bolsa. Revisa qué activos sigue, costos, divisa y concentración.',
  },
};
const niveles = [
  { id: 'inicio', label: 'Voy empezando' },
  { id: 'medio', label: 'Ya conozco lo básico' },
  { id: 'experto', label: 'Quiero profundizar' },
];
const enlace = [
  { href: '/finanzas/inversion', titulo: 'Antes de invertir', detalle: 'Revisa deuda, liquidez y objetivos' },
  { href: '/finanzas/inversion/comparar', titulo: 'Comparar instrumentos', detalle: 'Qué cambia entre CETES, acciones, ETF y fondos' },
  { href: '/finanzas/inversion/cetes', titulo: 'CETES con fuente', detalle: 'Tasas publicadas, fecha y limitaciones' },
  { href: '/finanzas/inversion/fondos', titulo: 'Fondos reportados a CNBV', detalle: 'Datos oficiales, sin ranking' },
];
function Campo({ label, value, onChange, min = 0, max = 1000000000, step = 1, suffix = '', help = '' }) {
  return <label className="ml-inv-input"><span>{label}</span><span className="ml-inv-field"><input type="number" inputMode="decimal" min={min} max={max} step={step} value={value} onChange={(e) => onChange(e.target.value)} />{suffix && <b>{suffix}</b>}</span>{help && <small>{help}</small>}</label>;
}
function Profundidad({ value, onChange, guardado }) {
  return <fieldset className="ml-inv-level"><legend>¿Cuánto conoces del tema?</legend><div>{niveles.map((item) => <button type="button" aria-pressed={value === item.id} className={value === item.id ? 'active' : ''} key={item.id} onClick={() => onChange(item.id)}>{item.label}</button>)}</div><p aria-live="polite">{guardado === false ? 'Tu navegador no permite recordarlo. El nivel se aplica mientras sigas en esta página.' : 'Esta forma de leer acompaña tus explicaciones por MiLana en esta pestaña. Puedes abrir o cerrar cada bloque. No guardamos tus cifras.'}</p></fieldset>;
}
function Entender({ nivel }) {
  const [producto, setProducto] = useState('cetes');
  const actual = investmentInstrumentClasses.find((i) => i.id === producto);
  const simple = lecciones[producto];
  return <section id="entender" className="ml-inv-lesson shell" aria-labelledby="ml-inv-lesson-title">
    <div className="ml-inv-section-title"><span>01 · Entender</span><h2 id="ml-inv-lesson-title">Toca un instrumento y descubre qué compras.</h2></div>
    <div className="ml-inv-instruments" role="group" aria-label="Tipos de inversión">{investmentInstrumentClasses.map((i) => <button type="button" aria-pressed={producto === i.id} className={producto === i.id ? 'active' : ''} key={i.id} onClick={() => setProducto(i.id)}>{i.nombre}</button>)}</div>
    <article className="ml-inv-explainer" aria-live="polite">
      <div><span className="ml-inv-kicker">Estás explorando</span><h3>{actual.nombre}</h3><p>{nivel === 'inicio' ? simple.inicio : nivel === 'medio' ? simple.medio : actual.resumen}</p></div>
      <div className="ml-inv-remember"><strong>Lo que nunca debes olvidar</strong><p>Tu dinero puede perder valor o no estar disponible cuando lo necesites. Comprueba las condiciones del instrumento concreto.</p></div>
      <ReadingDetails className="ml-inv-more"><summary>¿Quieres saber más sobre {actual.nombre}?</summary>
        <dl>
          <div><dt>Plazo y disponibilidad</dt><dd>{actual.dimensiones.plazo} {actual.dimensiones.liquidez}</dd></div>
          <div><dt>Costos</dt><dd>{actual.dimensiones.costos}</dd></div>
          <div><dt>Quién interviene</dt><dd>{actual.dimensiones.custodia}</dd></div>
        </dl>
        <a href={actual.fuente.url} target="_blank" rel="noopener noreferrer">Consultar fuente oficial ↗</a>
      </ReadingDetails>
    </article>
  </section>;
}
function Simulador() {
  const [inflacionAbierta, setInflacionAbierta] = useState(null);
  const [form, setForm] = useState({ inicial: '10000', mensual: '500', anos: '10', inflacion: '3', costoAnual: '0.5', tasas: ['-5', '5', '10'] });
  const set = (k) => (v) => setForm((x) => ({ ...x, [k]: v }));
  const setTasa = (index) => (v) => setForm((x) => ({ ...x, tasas: x.tasas.map((t, i) => i === index ? v : t) }));
  const resultado = useMemo(() => proyectarInversion(form), [form]);
  const max = resultado.escenarios ? Math.max(...resultado.escenarios.map((x) => x.final), 1) : 1;
  return <section className="ml-inv-sim" id="simular" aria-labelledby="ml-inv-sim-title"><div className="shell">
    <div className="ml-inv-section-title"><span>02 · Simular</span><h2 id="ml-inv-sim-title">Mueve los números. Mira qué podría pasar.</h2><p>Empieza con un ejemplo o cambia las cantidades. Son escenarios inventados para aprender, no predicciones.</p></div>
    <div className="ml-inv-sim-grid">
      <div className="ml-inv-form">
        <Campo label="Dinero inicial (MXN)" value={form.inicial} onChange={set('inicial')} />
        <Campo label="Aportación mensual (MXN)" value={form.mensual} onChange={set('mensual')} />
        <Campo label="Años" value={form.anos} onChange={set('anos')} min={1} max={40} />
        <details className="ml-inv-assumptions"><summary>Ajustar inflación, costos y escenarios</summary>
          <div className="ml-inv-assumption-grid">
            <Campo label="Inflación anual hipotética" suffix="%" value={form.inflacion} onChange={set('inflacion')} min={0} max={30} step={0.5} />
            <Campo label="Costo anual supuesto" suffix="%" value={form.costoAnual} onChange={set('costoAnual')} min={0} max={25} step={0.1} />
            {['Tasa anual adversa', 'Tasa anual intermedia', 'Tasa anual favorable'].map((nombre,i)=><Campo key={nombre} label={nombre} suffix="%" min={-95} max={100} step={0.5} value={form.tasas[i]} onChange={setTasa(i)}/>)}
          </div>
          <p>Los costos son un porcentaje ilustrativo anual aplicado al saldo. No representan el precio de ningún servicio de MiLana ni de una institución.</p>
        </details>
      </div>
      <div className="ml-inv-outcome" aria-live="polite">
        {resultado.error ? <p role="alert">{resultado.error}</p> : <>
          <p className="ml-inv-outcome-label">Total que tú aportarías</p><strong className="ml-inv-capital">{pesos(resultado.aportado)}</strong>
          <div className="ml-inv-bars">{resultado.escenarios.map((x) => <div className="ml-inv-bar-row" key={x.nombre}>
            <div><strong>{x.nombre}</strong><span>{x.tasa >= 0 ? '+' : ''}{x.tasa}% anual supuesto</span></div>
            <div className="ml-inv-bar-track" role="img" aria-label={x.nombre + ': saldo final ' + pesos(x.final)}><span style={{ width: String(Math.max(1, x.final / max * 100)) + '%' }} /></div>
            <strong className="ml-inv-bar-value">{pesos(x.final)}</strong>
            <small>{x.diferencia < 0 ? 'Pérdida vs. aportado: ' : 'Diferencia vs. aportado: '}{pesos(x.diferencia)}</small>
          </div>)}</div>
          <ReadingDetails className="ml-inv-more" manualOpen={inflacionAbierta} onManualChange={setInflacionAbierta}><summary>¿Y si los precios también suben?</summary><p>Al ajustar por la inflación hipotética del {resultado.inflation}% anual, el poder de compra estimado de los saldos sería:</p><ul>{resultado.escenarios.map((x)=><li key={x.nombre}>{x.nombre}: {pesos(x.real)} en pesos de hoy, aproximadamente.</li>)}</ul></ReadingDetails>
        </>}
      </div>
    </div>
    <p className="ml-inv-warning"><strong>Importante:</strong> incluso el escenario favorable puede no ocurrir. La simulación supone aportaciones regulares y una tasa constante, algo que no sucede necesariamente en la realidad. No incluye impuestos, diferenciales de compraventa ni costos reales de intermediarios. No es una cotización ni un consejo de inversión.</p>
  </div></section>;
}

const PLAZOS = [5, 10, 20, 30];
// Ejemplo fijo y declarado: lo único que cambia la persona es la comisión y el plazo.
function CostoComision() {
  const [comision, setComision] = useState(1);
  const [anos, setAnos] = useState(20);
  const r = compararComision({ inicial: '50000', mensual: '1000', anos: String(anos), tasa: '7', comision: String(comision) });
  return <section className="ml-inv-fees" id="costos" aria-labelledby="ml-inv-fees-title"><div className="shell">
    <div className="ml-inv-section-title"><span>03 · Costos</span><h2 id="ml-inv-fees-title">Una comisión pequeña, con los años, pesa mucho.</h2><p>Ejemplo hipotético: $50,000 al inicio, $1,000 al mes y un 7% anual supuesto. Mueve la comisión y el plazo.</p></div>
    <div className="ml-inv-fees-grid">
      <div className="ml-inv-fees-controls">
        <label className="ml-inv-fees-range"><span>Comisión anual: <strong>{comision.toFixed(2)}%</strong></span>
          <input type="range" min="0" max="3" step="0.25" value={comision} onChange={(e) => setComision(Number(e.target.value))} aria-valuetext={`${comision.toFixed(2)}% anual`} />
          <span className="ml-inv-fees-scale" aria-hidden="true"><b>0%</b><b>1.5%</b><b>3%</b></span>
        </label>
        <fieldset className="ml-inv-fees-years"><legend>Plazo</legend><div>{PLAZOS.map((p) => <button type="button" key={p} aria-pressed={anos === p} className={anos === p ? 'active' : ''} onClick={() => setAnos(p)}>{p} años</button>)}</div></fieldset>
      </div>
      <div className="ml-inv-fees-result" aria-live="polite">
        {r.error ? <p role="alert">{r.error}</p> : <>
          <p className="ml-inv-fees-big"><span>De cada $100 que tendrías sin comisión, te quedarías con</span><strong>${r.conservas.toFixed(0)}</strong></p>
          <div className="ml-inv-fees-bars">
            <div><span>Sin comisión</span><i style={{ width: '100%' }} /><b>{pesos(r.sinComision)}</b></div>
            <div><span>Con {comision.toFixed(2)}% anual</span><i className="is-cost" style={{ width: `${Math.max(2, r.conservas)}%` }} /><b>{pesos(r.conComision)}</b></div>
          </div>
          <p className="ml-inv-fees-note">La comisión se llevaría <strong>{pesos(r.costo)}</strong> en {anos} años. Tú habrías aportado {pesos(r.aportado)}.</p>
        </>}
        <ReadingDetails className="ml-inv-more"><summary>¿Dónde aparecen estas comisiones?</summary><p>En fondos de inversión se cobran como porcentaje anual del saldo (administración y distribución). En acciones y ETF suele haber comisión por operación, diferencial de compraventa y, en los ETF, un gasto anual propio. Compara siempre el costo total del instrumento y canal concretos; esta cifra es ilustrativa.</p></ReadingDetails>
      </div>
    </div>
  </div></section>;
}

export default function InvestirHomePage() {
  const nivel = useReadingDepth();
  const [guardado, setGuardado] = useState(null);
  const cambiarNivel = (nuevo) => setGuardado(guardarNivelLectura(nuevo));
  return <div className="ml-invertir">
    <SiteHeader ctaHref="/finanzas/inversion/comparar" ctaLabel="Comparar opciones" />
    <main>
      <section className="ml-inv-hero"><div className="shell">
        <nav className="ml-inv-breadcrumb" aria-label="Ruta"><a href="/">Inicio</a><span aria-hidden="true">/</span>Invertir</nav>
        <p className="ml-inv-kicker">MiLana · Inversión sin complicaciones</p>
        <h1>Descubre cómo funciona invertir. A tu ritmo.</h1>
        <p>No necesitas saber de finanzas para empezar a entenderlas. Toca, compara y prueba escenarios sin arriesgar dinero.</p>
        <nav className="ml-inv-hero-actions" aria-label="Qué hacer"><a href="#entender">Entender un instrumento <span aria-hidden="true">→</span></a><a href="#simular">Probar una simulación <span aria-hidden="true">→</span></a><a href="#costos">Ver el peso de las comisiones <span aria-hidden="true">→</span></a></nav>
      </div></section>
      <div className="shell"><Profundidad value={nivel} onChange={cambiarNivel} guardado={guardado} /></div>
      <Entender nivel={nivel} />
      <Simulador />
      <CostoComision />
      <section className="shell ml-inv-paths" id="explorar" aria-labelledby="ml-inv-paths-title">
        <div className="ml-inv-section-title"><span>04 · Seguir explorando</span><h2 id="ml-inv-paths-title">Elige qué quieres revisar ahora.</h2></div>
        <div className="ml-inv-paths-grid">{enlace.map((r) => <a key={r.href} href={r.href}><strong>{r.titulo}</strong><span>{r.detalle}</span><b aria-hidden="true">↗</b></a>)}</div>
      </section>
      <section className="ml-inv-boundary"><div className="shell"><h2>Aprender aquí es gratis. Operar es otra cosa.</h2><p>MiLana todavía no recibe dinero, no abre cuentas, no compra o vende inversiones y no recomienda productos personalizados. Una futura operación real solo podría ofrecerse con la estructura y autorizaciones correspondientes.</p><ReadingDetails className="ml-inv-more"><summary>¿Qué habría que comprobar antes de operar?</summary><p>Institución autorizada, contrato, costos completos, liquidez, impuestos, riesgos y quién custodia los activos. Ningún rendimiento está garantizado por esta página.</p></ReadingDetails></div></section>
    </main>
    <AdReserve size="970x90" />
    <footer className="site-footer"><div className="shell footer-inner"><div><span className="brand-name">MiLana</span><p>Dinero claro para decidir mejor.</p><p>Contenido educativo. No constituye asesoría de inversión ni recomendación de compra o venta.</p></div><p>MiLana © 2026 · Hecho en México</p></div></footer>
  </div>;
}