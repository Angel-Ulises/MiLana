import { useMemo, useState } from 'react';
import { crearMapaPreparacionInversion, crearPlanDecisionInversion, crearRadiografiaFinanciera } from './lib/advisorCore.js';
import { crearContextoDeuda } from './lib/debtDecisionContext.js';
import AdReserve from './AdReserve.jsx';

const dinero = (n) => new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN', maximumFractionDigits:0 }).format(Number(n) || 0);

export function esRutaInversionEducativa() {
  if (typeof window === 'undefined') return false;
  return /^\/finanzas\/inversion\/?$/.test(window.location.pathname);
}

function Header() {
  return <header className="site-header"><div className="shell header-inner"><a className="brand" href="/" aria-label="MiLana, inicio"><img className="brand-logo" src="/milana-horizontal.svg" width="144" height="27" alt="" aria-hidden="true" /></a><nav className="desktop-nav" aria-label="Principal"><a href="/finanzas">Finanzas</a><a href="/estados">Estados</a><a href="/carreras">Carreras</a><a href="/economia">Economía</a></nav><a className="header-cta" href="/finanzas/mi-situacion">Mi situación</a></div></header>;
}

function Campo({ label, value, onChange, help }) {
  return <label className="investment-field"><span>{label}</span><div><b>$</b><input inputMode="decimal" type="number" min="0" step="100" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" /></div>{help && <small>{help}</small>}</label>;
}

function CampoDato({ label, value, onChange, help, prefix, suffix, step = '1' }) {
  return <label className="investment-field-data"><span>{label}</span><div>{prefix && <b>{prefix}</b>}<input inputMode="decimal" type="number" min="0" step={step} value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" />{suffix && <em>{suffix}</em>}</div>{help && <small>{help}</small>}</label>;
}

function EstadoFactor({ estado }) {
  const copy = estado === 'observado' ? 'Dato observado' : estado === 'revisar' ? 'Revisar' : 'Falta dato';
  return <span className={`investment-factor-state ${estado}`}>{copy}</span>;
}

function Escenario({ escenario }) {
  const valor = escenario.unidad === 'meses-con-flujo'
    ? escenario.valor === null ? 'Sin plazo calculable' : `${escenario.valor} meses`
    : dinero(escenario.valor);
  return <article className="investment-scenario"><span>{escenario.titulo}</span><strong>{valor}</strong>{escenario.unidad === 'aporte-mensual' && <small>por mes · sin rendimiento</small>}<p>{escenario.detalle}</p></article>;
}

export default function InvestmentReadinessPage() {
  const [form, setForm] = useState({ ingresoNeto:'', gastosEsenciales:'', gastosVariables:'', pagosDeuda:'', fondoActual:'', objetivo:'inversion', metaObjetivo:'', ahorroMetaActual:'', horizonteMeses:'', saldoDeuda:'', catDeuda:'', tasaDeuda:'', mesesDeuda:'' });
  const set = (key) => (value) => setForm((actual) => ({ ...actual, [key]: value }));
  const radiografia = useMemo(() => crearRadiografiaFinanciera(form), [form]);
  const mapa = useMemo(() => crearMapaPreparacionInversion(radiografia), [radiografia]);
  const plan = useMemo(() => crearPlanDecisionInversion(radiografia), [radiografia]);
  const deudaContexto = useMemo(() => crearContextoDeuda({ pagoMensual: form.pagosDeuda, saldo: form.saldoDeuda, catAnualPct: form.catDeuda, tasaAnualPct: form.tasaDeuda, mesesRestantes: form.mesesDeuda }), [form.pagosDeuda, form.saldoDeuda, form.catDeuda, form.tasaDeuda, form.mesesDeuda]);
  const faltantesPlan = useMemo(() => plan.faltantes.filter((item) => item.id !== 'deuda-costo' || !deudaContexto.completo), [plan.faltantes, deudaContexto.completo]);
  const tienePagoDeuda = Number(form.pagosDeuda) > 0;
  const tituloEstado = {
    'faltan-datos': 'Todavía faltan datos antes de comparar productos.',
    'ordenar-base': 'Primero hay factores básicos que conviene entender mejor.',
    'revisar-deuda': 'El flujo y el respaldo están visibles; falta entender el costo de la deuda.',
    'contexto-educativo': 'Ya puedes comparar conceptos de inversión con más contexto.',
  }[mapa.estado] || 'Construye el contexto antes de comparar productos.';

  return <div className="investment-page">
    <Header />
    <section className="investment-hero"><div className="shell"><nav aria-label="Ruta"><a href="/">Inicio</a><span>/</span><a href="/finanzas">Finanzas</a><span>/</span><span>Inversión</span></nav><p className="eyebrow">Educación financiera · México</p><h1>Antes de invertir, entiende qué dinero estás poniendo en riesgo.</h1><p>MiLana no empieza por un producto. Empieza por flujo, liquidez, deuda, meta y horizonte. Esta herramienta organiza preguntas y escenarios previos; no certifica que estés “listo para invertir”, no asigna un score y no ejecuta operaciones.</p><div className="investment-proof"><span>Sin cuenta</span><span>Sin guardar datos financieros</span><span>Sin recomendar productos</span><span>Sin conectar brokers</span></div></div></section>

    <main>
      <section className="investment-tool"><div className="shell investment-layout">
        <form className="investment-form" onSubmit={(e) => e.preventDefault()}>
          <div><p className="eyebrow">Tu contexto</p><h2>Captura solo lo que quieras revisar.</h2><p>Los cálculos ocurren en tu navegador. Cero es distinto de dejar un campo vacío: si no sabes un dato, déjalo sin llenar.</p></div>
          <Campo label="Ingreso neto mensual" value={form.ingresoNeto} onChange={set('ingresoNeto')} help="Lo que realmente llega a tu cuenta." />
          <Campo label="Gastos esenciales" value={form.gastosEsenciales} onChange={set('gastosEsenciales')} help="Vivienda, comida, transporte, servicios, salud y otros básicos." />
          <Campo label="Gastos variables" value={form.gastosVariables} onChange={set('gastosVariables')} help="Compras, ocio y otros gastos que cambian mes con mes." />
          <Campo label="Pagos mensuales de deuda" value={form.pagosDeuda} onChange={set('pagosDeuda')} help="Captura 0 si confirmas que hoy no tienes pagos mensuales de deuda." />
          {tienePagoDeuda && <><div className="investment-form-divider"><span>Detalle opcional de deuda</span></div><div className="investment-debt-fields"><CampoDato label="Saldo actual" value={form.saldoDeuda} onChange={set('saldoDeuda')} prefix="$" step="100" help="Saldo que hoy reporta tu crédito." /><CampoDato label="Meses restantes" value={form.mesesDeuda} onChange={set('mesesDeuda')} suffix="meses" help="Plazo aproximado que todavía falta." /><CampoDato label="CAT anual" value={form.catDeuda} onChange={set('catDeuda')} suffix="%" step="0.1" help="Si tu estado de cuenta lo muestra. No se usa como rendimiento." /><CampoDato label="Tasa anual" value={form.tasaDeuda} onChange={set('tasaDeuda')} suffix="%" step="0.1" help="Opcional si conoces la tasa; se mantiene separada del CAT." /></div></>}
          <Campo label="Fondo de emergencia disponible" value={form.fondoActual} onChange={set('fondoActual')} help="Dinero líquido que realmente podrías usar ante un imprevisto." />
          <div className="investment-form-divider"><span>Meta y tiempo</span></div>
          <Campo label="Monto de tu meta" value={form.metaObjetivo} onChange={set('metaObjetivo')} help="Una cifra de referencia; no tiene que ser el monto que invertirías." />
          <Campo label="Ahorro ya dedicado a esa meta" value={form.ahorroMetaActual} onChange={set('ahorroMetaActual')} help="Captura 0 si todavía no has separado ahorro para esa meta." />
          <label className="investment-field"><span>Horizonte aproximado</span><div className="investment-months"><input inputMode="numeric" type="number" min="0" step="1" value={form.horizonteMeses} onChange={(e) => set('horizonteMeses')(e.target.value)} placeholder="Meses" /></div><small>Cuándo podrías necesitar ese dinero. MiLana no traduce automáticamente el horizonte a un producto.</small></label>
        </form>

        <div className="investment-output" aria-live="polite">
          <div className="investment-output-head"><p className="eyebrow">Mapa previo</p><h2>{tituloEstado}</h2><p>{mapa.motivo || mapa.nota}</p></div>
          <div className="investment-factors">{mapa.factores.map((factor) => <article key={factor.id}><div><span>{factor.titulo}</span><EstadoFactor estado={factor.estado} /></div><p>{factor.detalle}</p></article>)}</div>
          <div className="investment-summary"><div><span>Disponible mensual capturado</span><strong>{dinero(radiografia.flujo.disponible)}</strong><p>No es “dinero para invertir”; es el saldo matemático de los rubros capturados.</p></div><div><span>Referencia educativa de respaldo</span><strong>{dinero(radiografia.emergencia.referenciaTresMeses)}</strong><p>Tres meses de gastos esenciales. No es un requisito universal ni una instrucción.</p></div></div>

          {tienePagoDeuda && <section className="investment-debt-context" aria-label="Contexto matemático de deuda"><div className="investment-debt-head"><div><p className="eyebrow">Deuda · detalle opcional</p><h3>Separa saldo, costo y pagos restantes.</h3></div><span className={deudaContexto.completo ? 'complete' : ''}>{deudaContexto.completo ? 'Contexto capturado' : 'Faltan datos'}</span></div><div className="investment-debt-grid"><article><span>Saldo declarado</span><strong>{deudaContexto.capturado.saldo ? dinero(deudaContexto.saldo) : '—'}</strong></article><article><span>Pagos restantes declarados</span><strong>{deudaContexto.pagosRestantesDeclarados === null ? '—' : dinero(deudaContexto.pagosRestantesDeclarados)}</strong></article><article><span>CAT declarado</span><strong>{deudaContexto.capturado.catAnualPct ? `${deudaContexto.catAnualPct.toFixed(1)}%` : '—'}</strong></article><article><span>Tasa anual declarada</span><strong>{deudaContexto.capturado.tasaAnualPct ? `${deudaContexto.tasaAnualPct.toFixed(1)}%` : '—'}</strong></article></div>{deudaContexto.diferenciaPagosSaldo !== null && <div className="investment-debt-difference"><span>Diferencia aritmética: pagos declarados menos saldo</span><strong>{dinero(deudaContexto.diferenciaPagosSaldo)}</strong></div>}{deudaContexto.faltantes.length > 0 && <p className="investment-debt-missing">Para completar el contexto todavía falta: {deudaContexto.faltantes.join(', ')}.</p>}<p className="investment-debt-note">{deudaContexto.nota}</p></section>}

          <section className="investment-decision" aria-label="Plan de decisión"><div className="investment-decision-head"><div><p className="eyebrow">Plan de decisión</p><h2>Haz visible qué cambia antes de mirar instrumentos.</h2></div><span>{plan.horizonte.etiqueta}</span></div><p className="investment-horizon-copy">{plan.horizonte.lectura}</p>
            {faltantesPlan.length > 0 && <div className="investment-missing"><strong>Información que todavía falta</strong><div>{faltantesPlan.map((item) => <article key={item.id}><span>{item.titulo}</span><p>{item.detalle}</p></article>)}</div></div>}
            {plan.escenarios.length > 0 ? <div><div className="investment-scenario-title"><strong>Escenarios aritméticos</strong><span>Sin rendimiento, sin pronóstico de mercado</span></div><div className="investment-scenarios">{plan.escenarios.map((escenario) => <Escenario key={escenario.id} escenario={escenario} />)}</div><p className="investment-scenario-note">{plan.nota}</p></div> : <div className="investment-empty-scenarios"><strong>Los escenarios aparecen cuando completas monto de meta, ahorro actual y horizonte.</strong><p>No necesitas inventar datos para obtener una respuesta. Si no conoces algo, MiLana lo deja como faltante.</p></div>}
          </section>
        </div>
      </div></section>

      <section className="investment-questions"><div className="shell"><div className="investment-section-head"><div><p className="eyebrow">Antes de un producto</p><h2>Cinco dimensiones que ningún botón de “invertir” debería esconder.</h2></div><p>MiLana mantiene separada la educación de la recomendación. El horizonte cambia qué preguntas pesan más, pero nunca se traduce automáticamente a un instrumento.</p></div><ol>{plan.dimensiones.map((dimension, index) => <li key={dimension.id}><span>{String(index + 1).padStart(2,'0')}</span><strong>{dimension.titulo}</strong><p>{dimension.detalle}</p></li>)}</ol><aside className="investment-source"><span>Fuente educativa</span><div><strong>CONDUSEF — materiales de Educación Financiera sobre inversión</strong><p>Meta, presupuesto, horizonte, riesgo, comparación, costos y verificación como conceptos previos a mover dinero.</p></div></aside></div></section>

      <section className="investment-security"><div className="shell investment-security-grid"><div><p className="eyebrow">Operación real</p><h2>La integración transaccional sigue apagada.</h2><p>MiLana está preparando una interfaz técnica común para infraestructura regulada. En cualquier integración futura, la institución financiera debe abrir la cuenta, hacer KYC/PLD, ejecutar y custodiar. Hasta tener proveedor, contrato, costos y responsabilidades por escrito, no existe un botón de compra ni conexión con una cuenta bursátil.</p></div><div className="investment-security-list"><article><span>Credenciales</span><strong>MiLana no debe pedir tu contraseña del broker.</strong></article><article><span>Custodia</span><strong>El dinero y los valores deben permanecer con la institución ejecutora.</strong></article><article><span>Productos</span><strong>Esta versión no selecciona CETES, fondos, acciones, ETF ni otro instrumento.</strong></article><article><span>Activación</span><strong>Todo proveedor nuevo debe iniciar técnicamente deshabilitado hasta completar validación y contrato.</strong></article></div></div></section>

      <section className="investment-next"><div className="shell"><div><p className="eyebrow">Siguiente paso</p><h2>Vuelve a tus números, no a un catálogo.</h2><p>Si algo falta en el mapa o en el plan de decisión, puedes trabajar esa pieza por separado sin abrir una cuenta de inversión.</p></div><div><a href="/finanzas/mi-situacion">Mi situación <span>→</span></a><a href="/finanzas/fondo-emergencia">Fondo de emergencia <span>→</span></a><a href="/finanzas/deuda-y-credito">Deuda y crédito <span>→</span></a><a href="/finanzas/ahorro">Meta de ahorro <span>→</span></a></div></div></section>
    </main>

    <><AdReserve size="970x90" /><footer className="site-footer"><div className="shell footer-inner"><div><span className="brand-name">MiLana</span><p>Dinero claro para decidir mejor.</p><p>Contenido educativo. No constituye asesoría de inversión, recomendación de producto ni oferta para comprar o vender valores.</p></div><p>MiLana © 2026 · Hecho en México</p></div></footer></>
  </div>;
}
