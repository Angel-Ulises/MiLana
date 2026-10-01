import { useMemo, useState } from 'react';
import { crearRadiografiaFinanciera, crearEscenariosIngreso, crearRutaAsesor } from './lib/advisorCore.js';
import AdvisorProfessionContext from './advisorProfessionContext.jsx';

const dinero = (n) => new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
}).format(Number.isFinite(n) ? n : 0);

export function esRutaAsesor() {
  if (typeof window === 'undefined') return false;
  return /^\/finanzas\/mi-situacion\/?$/.test(window.location.pathname);
}

function Header() {
  return <header className="site-header"><div className="shell header-inner"><a className="brand" href="/" aria-label="MiLana, inicio"><span className="brand-mark" aria-hidden="true">M</span><span className="brand-name">MiLana</span></a><nav className="desktop-nav" aria-label="Principal"><a href="/finanzas">Finanzas</a><a href="/carreras">Carreras</a><a href="/#calculadoras">Calculadoras</a><a href="/economia">Economía</a></nav><a className="header-cta" href="/finanzas/presupuesto">Presupuesto</a></div></header>;
}

function Campo({ label, value, onChange, help }) {
  return <label className="advisor-field"><span>{label}</span><div><b>$</b><input inputMode="decimal" type="number" min="0" step="100" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" /></div>{help && <small>{help}</small>}</label>;
}

function Objetivo({ value, onChange }) {
  return <label className="advisor-select"><span>¿Qué quieres ordenar primero?</span><select value={value} onChange={(e) => onChange(e.target.value)}><option value="">Solo entender mi situación</option><option value="emergencia">Fondo de emergencia</option><option value="deuda">Deuda</option><option value="vivienda">Vivienda</option><option value="compra">Una compra o proyecto</option><option value="retiro">Retiro</option><option value="inversion">Aprender sobre inversión</option></select><small>El objetivo cambia las rutas que MiLana te muestra; no activa recomendaciones de productos.</small></label>;
}

function Resultado({ label, value, note, tone = '' }) {
  return <article className={`advisor-result ${tone}`}><span>{label}</span><strong>{value}</strong>{note && <p>{note}</p>}</article>;
}

export default function AdvisorPage() {
  const [form, setForm] = useState({ ingresoNeto:'', gastosEsenciales:'', gastosVariables:'', pagosDeuda:'', fondoActual:'', objetivo:'', metaObjetivo:'', ahorroMetaActual:'', horizonteMeses:'' });
  const set = (key) => (value) => setForm((actual) => ({ ...actual, [key]: value }));
  const radiografia = useMemo(() => crearRadiografiaFinanciera(form), [form]);
  const ruta = useMemo(() => crearRutaAsesor(radiografia), [radiografia]);
  const escenarios = useMemo(() => crearEscenariosIngreso(radiografia), [radiografia]);
  const tieneDatos = radiografia.banderas.tieneIngreso || radiografia.flujo.gastoTotal > 0 || radiografia.emergencia.fondoActual > 0;
  const mesesFondo = radiografia.emergencia.mesesATresConDisponible;

  return <div className="advisor-page">
    <Header />
    <section className="advisor-hero"><div className="shell"><nav aria-label="Ruta"><a href="/">Inicio</a><span>/</span><a href="/finanzas">Finanzas</a><span>/</span><span>Mi situación</span></nav><p className="eyebrow">Asesor MiLana · versión 1</p><h1>Cuéntame tus números. MiLana conecta lo que significan.</h1><p>No es un chat que adivina. Esta primera versión usa reglas visibles para ordenar flujo mensual, deuda, respaldo y una meta. Los cálculos ocurren en tu navegador y no eligen inversiones por ti.</p><div className="advisor-proof"><span>Sin cuenta</span><span>Sin guardar contraseñas</span><span>Sin seleccionar productos</span></div></div></section>

    <main className="advisor-main">
      <div className="shell"><AdvisorProfessionContext /></div>
      <section className="shell advisor-layout">
      <form className="advisor-form" onSubmit={(e) => e.preventDefault()}>
        <div className="advisor-form-head"><p className="eyebrow">Tu fotografía mensual</p><h2>Empieza con lo que ya sabes.</h2><p>Puedes dejar campos vacíos. MiLana solo calcula con lo que captures.</p></div>
        <Campo label="Ingreso neto mensual" value={form.ingresoNeto} onChange={set('ingresoNeto')} help="Lo que realmente llega a tu cuenta." />
        <Campo label="Gastos esenciales" value={form.gastosEsenciales} onChange={set('gastosEsenciales')} help="Vivienda, comida, transporte, servicios, salud y otros básicos." />
        <Campo label="Gastos variables" value={form.gastosVariables} onChange={set('gastosVariables')} help="Compras, salidas, ocio y otros gastos que cambian." />
        <Campo label="Pagos mensuales de deuda" value={form.pagosDeuda} onChange={set('pagosDeuda')} help="Tarjetas, préstamos, auto u otras mensualidades." />
        <Campo label="Fondo de emergencia actual" value={form.fondoActual} onChange={set('fondoActual')} help="Solo dinero que consideras disponible para imprevistos." />
        <Objetivo value={form.objetivo} onChange={set('objetivo')} />
        <div className="advisor-goal-fields"><Campo label="Monto de tu meta" value={form.metaObjetivo} onChange={set('metaObjetivo')} /><Campo label="Ya ahorrado para esa meta" value={form.ahorroMetaActual} onChange={set('ahorroMetaActual')} /><label className="advisor-field"><span>Horizonte en meses</span><div className="advisor-months"><input inputMode="numeric" type="number" min="0" step="1" value={form.horizonteMeses} onChange={(e) => set('horizonteMeses')(e.target.value)} placeholder="0" /></div><small>La meta se calcula sin asumir rendimiento.</small></label></div>
      </form>

      <div className="advisor-output" aria-live="polite">
        <div className="advisor-output-head"><p className="eyebrow">Tu mapa</p><h2>{tieneDatos ? 'Esto es lo que muestran tus números.' : 'Captura algunos datos para construir tu mapa.'}</h2></div>
        <div className="advisor-results">
          <Resultado label="Disponible al mes" value={dinero(radiografia.flujo.disponible)} tone={radiografia.flujo.disponible < 0 ? 'warning' : 'positive'} note={radiografia.banderas.tieneIngreso ? `${radiografia.flujo.disponiblePct.toFixed(1)}% del ingreso después de los rubros capturados.` : 'Falta ingreso para calcular una proporción.'} />
          <Resultado label="Pagos de deuda" value={radiografia.banderas.tieneIngreso ? `${radiografia.deuda.proporcionIngresoPct.toFixed(1)}%` : '—'} note="Proporción descriptiva; no es un límite de crédito." />
          <Resultado label="Referencia de 3 meses" value={dinero(radiografia.emergencia.referenciaTresMeses)} note={mesesFondo === null ? 'Captura flujo positivo para estimar tiempo.' : mesesFondo === 0 ? 'El fondo capturado ya alcanza esta referencia educativa.' : `Con todo el disponible actual: ${mesesFondo} meses. Es un escenario, no una instrucción.`} />
          <Resultado label="Faltante de tu meta" value={dinero(radiografia.meta.faltante)} note={radiografia.meta.aporteMensualNecesarioSinRendimiento === null ? 'Añade un horizonte para calcular una aportación.' : `${dinero(radiografia.meta.aporteMensualNecesarioSinRendimiento)} al mes durante ${radiografia.meta.horizonteMeses} meses, sin rendimiento.`} />
        </div>

        <section className="advisor-path"><div><p className="eyebrow">Siguiente paso lógico</p><h2>MiLana no te manda directo a invertir.</h2><p>Ordena primero la información que falta. Estas rutas salen de reglas fijas y de tus datos capturados.</p></div><div className="advisor-path-list">{ruta.acciones.length ? ruta.acciones.map((accion, index) => <a href={accion.href} key={accion.id}><span>{String(index + 1).padStart(2,'0')}</span><div><strong>{accion.id.replaceAll('-',' ')}</strong><p>{accion.motivo}</p></div><b>→</b></a>) : <div className="advisor-empty">Completa ingreso, gastos o una meta para que aparezcan rutas relacionadas.</div>}</div></section>

        <section className="advisor-scenarios"><div className="advisor-scenarios-head"><p className="eyebrow">Escenarios</p><h2>¿Qué cambia si tu ingreso neto sube?</h2><p>Solo mueve matemáticamente tu ingreso neto. No recalcula ISR, IMSS ni supone que realmente recibirás un aumento.</p></div><div className="advisor-scenario-grid">{escenarios.map((escenario) => <article key={escenario.incrementoPct}><span>+{escenario.incrementoPct}% ingreso</span><strong>{dinero(escenario.disponibleEscenario)}</strong><p>Disponible mensual con los mismos gastos capturados.</p></article>)}</div></section>

        <aside className="advisor-investment-gate"><span>{ruta.inversion.estado === 'contexto-educativo-disponible' ? 'Inversión: contexto disponible' : 'Inversión: todavía solo educación'}</span><p>{ruta.inversion.motivo}</p><strong>MiLana v1 no recomienda ni ejecuta productos de inversión.</strong></aside>
      </div>
    </section></main>

    <footer className="site-footer"><div className="shell footer-inner"><div><span className="brand-name">MiLana</span><p>Dinero claro para decidir mejor.</p><p>Estimaciones informativas. No sustituyen asesoría financiera personalizada ni condiciones contractuales de una institución.</p></div><p>MiLana © 2026 · Hecho en México</p></div></footer>
  </div>;
}
