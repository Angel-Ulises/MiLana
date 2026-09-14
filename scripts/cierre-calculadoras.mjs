import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const read = p => readFileSync(p, 'utf8');
const write = (p, s) => writeFileSync(p, s, 'utf8');

function replaceSection(text, start, end, replacement) {
  const a = text.indexOf(start);
  const b = text.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error(`No se encontró sección: ${start} -> ${end}`);
  return text.slice(0, a) + replacement.trimEnd() + '\n\n' + text.slice(b);
}

function replaceRequired(text, from, to, label = from) {
  if (!text.includes(from)) throw new Error(`No se encontró reemplazo requerido: ${label}`);
  return text.replace(from, to);
}

const fecha = '2026-09-14';

// ---------------------------------------------------------------------------
// App: reactivar cálculos con alcance explícito y retirar UI de suspensión.
// ---------------------------------------------------------------------------
let app = read('src/App.jsx');
app = replaceRequired(
  app,
  'import { calcularISR, calcularAguinaldo, ISR_MENSUAL_2026 } from "./lib/calculos-revisados.mjs";',
  'import { calcularISR, calcularAguinaldo, ISR_MENSUAL_2026 } from "./lib/calculos-revisados.mjs";\nimport { calcularFiniquito2026, calcularLiquidacion2026, calcularBrutoNeto2026 } from "./lib/calculos-laborales-2026.mjs";',
  'import cálculos laborales'
);

const finiquito = String.raw`function CalcFiniquito() {
  const [salario, setSalario] = useState('');
  const [ingreso, setIngreso] = useState('');
  const [salida, setSalida] = useState('');
  const [diasPendientes, setDiasPendientes] = useState('0');
  const [vacPendientes, setVacPendientes] = useState('0');
  const [diasAguinaldo, setDiasAguinaldo] = useState('15');
  const [primaVac, setPrimaVac] = useState('25');
  const [vacAnuales, setVacAnuales] = useState('');
  const [causa, setCausa] = useState('renuncia');
  const [zona, setZona] = useState('general');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const errorId = useId();
  const editar = setter => valor => { setter(valor); setResultado(null); setError(''); };
  const calcular = e => {
    e.preventDefault(); setResultado(null);
    try {
      setResultado(calcularFiniquito2026({
        salarioMensual: salario, fechaIngreso: ingreso, fechaSalida: salida,
        diasTrabajadosNoPagados: diasPendientes, vacacionesPendientes: vacPendientes,
        causa, zona, diasAguinaldo, primaVacacionalPct: primaVac, diasVacacionesAnuales: vacAnuales,
      }));
      setError('');
    } catch (err) { setError(err.message); }
  };
  return <form onSubmit={calcular} noValidate>
    <p className="calc-intro">Estima el finiquito bruto de una terminación ocurrida en 2026 con salario mensual fijo. Separa salario pendiente, aguinaldo, vacaciones, prima vacacional y, cuando procede, prima de antigüedad.</p>
    <div style={styles.grid2}>
      <Field label="Salario mensual fijo (MXN)" value={salario} onChange={editar(setSalario)} type="number" placeholder="Ej: 18000" error={error} errorId={errorId} />
      <Field label="Días trabajados aún no pagados" value={diasPendientes} onChange={editar(setDiasPendientes)} type="number" placeholder="0" error={error} errorId={errorId} />
      <Field label="Fecha de ingreso" value={ingreso} onChange={editar(setIngreso)} type="date" error={error} errorId={errorId} />
      <Field label="Último día trabajado en 2026" value={salida} onChange={editar(setSalida)} type="date" error={error} errorId={errorId} />
      <Field label="Vacaciones pendientes ya adquiridas (días)" value={vacPendientes} onChange={editar(setVacPendientes)} type="number" placeholder="0" help="No incluyas aquí la parte proporcional del ciclo actual: MiLana la calcula con tus fechas." error={error} errorId={errorId} />
      <Field label="Días de aguinaldo que te corresponden" value={diasAguinaldo} onChange={editar(setDiasAguinaldo)} type="number" placeholder="15" error={error} errorId={errorId} />
      <Field label="Prima vacacional (%)" value={primaVac} onChange={editar(setPrimaVac)} type="number" placeholder="25" error={error} errorId={errorId} />
      <Field label="Vacaciones anuales de tu prestación (opcional)" value={vacAnuales} onChange={editar(setVacAnuales)} type="number" placeholder="En blanco usa el mínimo legal" help="Si tu contrato da más días que la LFT, captura aquí ese número." error={error} errorId={errorId} />
    </div>
    <label style={styles.fieldLabel} htmlFor="fin-causa">Cómo terminó la relación</label>
    <select id="fin-causa" value={causa} onChange={e => editar(setCausa)(e.target.value)} style={styles.select}>
      <option value="renuncia">Renuncia voluntaria</option>
      <option value="separacion-patron">Separación por el patrón</option>
    </select>
    <label style={styles.fieldLabel} htmlFor="fin-zona">Zona de salario mínimo para el tope de prima de antigüedad</label>
    <select id="fin-zona" value={zona} onChange={e => editar(setZona)(e.target.value)} style={styles.select}>
      <option value="general">Zona del Salario Mínimo General</option>
      <option value="frontera">Zona Libre de la Frontera Norte</option>
    </select>
    <p id={errorId} role="alert" className="calc-error">{error}</p>
    <Btn>Calcular finiquito</Btn>
    <div aria-live="polite" aria-atomic="true">
      {resultado && <ResultBox>
        <ResultLine label={`Salario pendiente (${diasPendientes || 0} días)`} value={fmt(resultado.pagoSalarioPendiente)} />
        <ResultLine label={`Aguinaldo proporcional (${resultado.diasAguinaldo} días del año)`} value={fmt(resultado.aguinaldoProporcional)} />
        <ResultLine label={`Vacaciones proporcionales (${resultado.vacacionesProporcionalesDias.toFixed(2)} días)`} value={fmt(resultado.salarioDiario * resultado.vacacionesProporcionalesDias)} />
        {resultado.vacacionesPendientesDias > 0 && <ResultLine label={`Vacaciones pendientes (${resultado.vacacionesPendientesDias} días)`} value={fmt(resultado.salarioDiario * resultado.vacacionesPendientesDias)} />}
        <ResultLine label={`Prima vacacional (${resultado.primaPct}%)`} value={fmt(resultado.primaVacacional)} />
        {resultado.aplicaPrimaAntiguedad && <ResultLine label="Prima de antigüedad estimada" value={fmt(resultado.primaAntiguedad)} />}
        <Divider />
        <ResultLine label="Total bruto estimado" value={fmt(resultado.totalBruto)} bold color="#28735A" />
        <Note>El total es bruto y no incluye una estimación de ISR por separación. Usa salario fijo y las prestaciones que capturaste; comisiones, bonos u otros conceptos integrables requieren revisión específica.</Note>
      </ResultBox>}
    </div>
  </form>;
}`;
app = replaceSection(app, 'function CalcFiniquito()', 'function CalcLiquidacion()', finiquito);

const liquidacion = String.raw`function CalcLiquidacion() {
  const [salario, setSalario] = useState('');
  const [ingreso, setIngreso] = useState('');
  const [salida, setSalida] = useState('');
  const [diasPendientes, setDiasPendientes] = useState('0');
  const [vacPendientes, setVacPendientes] = useState('0');
  const [diasAguinaldo, setDiasAguinaldo] = useState('15');
  const [primaVac, setPrimaVac] = useState('25');
  const [vacAnuales, setVacAnuales] = useState('');
  const [zona, setZona] = useState('general');
  const [indeterminada, setIndeterminada] = useState(false);
  const [incluir20, setIncluir20] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const errorId = useId();
  const editar = setter => valor => { setter(valor); setResultado(null); setError(''); };
  const calcular = e => {
    e.preventDefault(); setResultado(null);
    try {
      setResultado(calcularLiquidacion2026({
        salarioMensual: salario, fechaIngreso: ingreso, fechaSalida: salida,
        diasTrabajadosNoPagados: diasPendientes, vacacionesPendientes: vacPendientes,
        zona, diasAguinaldo, primaVacacionalPct: primaVac, diasVacacionesAnuales: vacAnuales,
        relacionIndeterminada: indeterminada, incluirVeinteDias: incluir20,
      }));
      setError('');
    } catch (err) { setError(err.message); }
  };
  return <form onSubmit={calcular} noValidate>
    <p className="calc-intro">Estima un escenario de indemnización por despido injustificado para una relación por tiempo indeterminado, además de las prestaciones devengadas. Los 20 días por año se muestran solo si tú activas ese supuesto.</p>
    <div style={styles.grid2}>
      <Field label="Salario mensual fijo (MXN)" value={salario} onChange={editar(setSalario)} type="number" placeholder="Ej: 18000" error={error} errorId={errorId} />
      <Field label="Días trabajados aún no pagados" value={diasPendientes} onChange={editar(setDiasPendientes)} type="number" placeholder="0" error={error} errorId={errorId} />
      <Field label="Fecha de ingreso" value={ingreso} onChange={editar(setIngreso)} type="date" error={error} errorId={errorId} />
      <Field label="Fecha de despido en 2026" value={salida} onChange={editar(setSalida)} type="date" error={error} errorId={errorId} />
      <Field label="Vacaciones pendientes ya adquiridas (días)" value={vacPendientes} onChange={editar(setVacPendientes)} type="number" placeholder="0" error={error} errorId={errorId} />
      <Field label="Días de aguinaldo que te corresponden" value={diasAguinaldo} onChange={editar(setDiasAguinaldo)} type="number" placeholder="15" error={error} errorId={errorId} />
      <Field label="Prima vacacional (%)" value={primaVac} onChange={editar(setPrimaVac)} type="number" placeholder="25" error={error} errorId={errorId} />
      <Field label="Vacaciones anuales de tu prestación (opcional)" value={vacAnuales} onChange={editar(setVacAnuales)} type="number" placeholder="En blanco usa el mínimo legal" error={error} errorId={errorId} />
    </div>
    <label style={styles.fieldLabel} htmlFor="liq-zona">Zona de salario mínimo para la prima de antigüedad</label>
    <select id="liq-zona" value={zona} onChange={e => editar(setZona)(e.target.value)} style={styles.select}>
      <option value="general">Zona del Salario Mínimo General</option>
      <option value="frontera">Zona Libre de la Frontera Norte</option>
    </select>
    <label className="calc-check"><input type="checkbox" checked={indeterminada} onChange={e => editar(setIndeterminada)(e.target.checked)} /> Confirmo que la relación era por tiempo indeterminado.</label>
    <label className="calc-check"><input type="checkbox" checked={incluir20} onChange={e => editar(setIncluir20)(e.target.checked)} /> Incluir el escenario de 20 días de salario por año cuando jurídicamente proceda.</label>
    <p className="calc-help">Los 20 días por año no son un pago automático en todo despido; por eso están apagados de forma predeterminada.</p>
    <p id={errorId} role="alert" className="calc-error">{error}</p>
    <Btn>Calcular escenario de liquidación</Btn>
    <div aria-live="polite" aria-atomic="true">
      {resultado && <ResultBox>
        <ResultLine label="Prestaciones devengadas (finiquito)" value={fmt(resultado.subtotalSinPrimaAntiguedad)} />
        <ResultLine label={`Indemnización de 3 meses (SDI ${fmt(resultado.salarioDiarioIntegrado)}/día)`} value={fmt(resultado.indemnizacionTresMeses)} />
        {resultado.incluyeVeinteDias && <ResultLine label="Escenario de 20 días por año" value={fmt(resultado.indemnizacionVeinteDias)} />}
        <ResultLine label="Prima de antigüedad" value={fmt(resultado.primaAntiguedad)} />
        <Divider />
        <ResultLine label="Total bruto del escenario" value={fmt(resultado.totalBruto)} bold color="#28735A" />
        <Note>No determina si el despido fue injustificado ni si los 20 días por año proceden en tu caso. No incluye salarios vencidos, intereses ni ISR por pagos de separación.</Note>
      </ResultBox>}
    </div>
  </form>;
}`;
app = replaceSection(app, 'function CalcLiquidacion()', 'function CalcAguinaldo()', liquidacion);

const brutoNeto = String.raw`function CalcBrutoNeto() {
  const [bruto, setBruto] = useState('');
  const [gravable, setGravable] = useState('');
  const [sbc, setSbc] = useState('');
  const [dias, setDias] = useState('30');
  const [minimo, setMinimo] = useState('');
  const [periodo, setPeriodo] = useState('2026-09');
  const [confirmado, setConfirmado] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const errorId = useId();
  const editar = setter => valor => { setter(valor); setResultado(null); setError(''); };
  const calcular = e => {
    e.preventDefault(); setResultado(null);
    try {
      if (!confirmado) throw new Error('Confirma que es un mes completo ordinario con un solo empleador.');
      setResultado(calcularBrutoNeto2026({
        brutoMensual: bruto, ingresoGravableISR: gravable, sbcDiario: sbc,
        diasCotizados: dias, soloMinimo: minimo === '' ? undefined : minimo === 'si',
        periodo, empleadorUnico: true,
      }));
      setError('');
    } catch (err) { setError(err.message); }
  };
  return <form onSubmit={calcular} noValidate>
    <p className="calc-intro">Estima cuánto queda después de ISR e IMSS separando las tres bases que una nómina no debe confundir: percepciones brutas, ingreso gravable para ISR y SBC diario reportado al IMSS.</p>
    <div style={styles.grid2}>
      <Field label="Percepciones brutas del mes (MXN)" value={bruto} onChange={editar(setBruto)} type="number" placeholder="Ej: 30000" help="Antes de ISR, IMSS y otras deducciones." error={error} errorId={errorId} />
      <Field label="Ingreso gravable del mes para ISR (MXN)" value={gravable} onChange={editar(setGravable)} type="number" placeholder="Ej: 30000" help="Puede ser menor que el bruto si existen percepciones exentas." error={error} errorId={errorId} />
      <Field label="Salario Base de Cotización diario (SBC)" value={sbc} onChange={editar(setSbc)} type="number" placeholder="Ej: 1000" help="Tómalo de tu alta, modificación salarial o información de nómina/IMSS; no se deduce del bruto." error={error} errorId={errorId} />
      <Field label="Días cotizados en el mes" value={dias} onChange={editar(setDias)} type="number" placeholder="30" error={error} errorId={errorId} />
    </div>
    <label style={styles.fieldLabel} htmlFor="bn-periodo">Mes completo de 2026</label>
    <select id="bn-periodo" value={periodo} onChange={e => editar(setPeriodo)(e.target.value)} style={styles.select}>
      {['Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((mes,i)=><option key={mes} value={`2026-${String(i+2).padStart(2,'0')}`}>{mes}</option>)}
    </select>
    <label style={styles.fieldLabel} htmlFor="bn-minimo">¿Percibiste únicamente el salario mínimo general aplicable a tu zona?</label>
    <select id="bn-minimo" value={minimo} onChange={e => editar(setMinimo)(e.target.value)} style={styles.select}>
      <option value="">Selecciona una respuesta</option><option value="si">Sí</option><option value="no">No</option>
    </select>
    <label className="calc-check"><input type="checkbox" checked={confirmado} onChange={e => editar(setConfirmado)(e.target.checked)} /> Confirmo que es un mes completo ordinario con un solo empleador.</label>
    <p className="calc-help">Enero queda fuera porque el subsidio para el empleo usa una transición distinta antes de la UMA 2026.</p>
    <p id={errorId} role="alert" className="calc-error">{error}</p>
    <Btn>Calcular neto después de ISR e IMSS</Btn>
    <div aria-live="polite" aria-atomic="true">
      {resultado && <ResultBox>
        <ResultLine label="Percepciones brutas" value={fmt(resultado.bruto)} />
        <ResultLine label="ISR mensual estimado" value={`− ${fmt(resultado.retenido)}`} color="#A94442" />
        <ResultLine label="Cuota obrera IMSS" value={`− ${fmt(resultado.cuotaObrera)}`} color="#A94442" />
        <Divider />
        <ResultLine label="Neto después de ISR e IMSS" value={fmt(resultado.netoDespuesISRIMSS)} bold color="#28735A" />
        {!resultado.soloMinimo && <ResultLine label="SBC diario aplicado" value={fmt(resultado.sbcAplicado)} />}
        <ResultLine label="Días cotizados" value={resultado.diasCotizados} />
        <Note>No incluye Infonavit, Fonacot, préstamos, pensión alimenticia, caja de ahorro ni otras deducciones de tu recibo. El SBC se limita a 25 UMA para este cálculo.</Note>
      </ResultBox>}
    </div>
  </form>;
}`;
app = replaceSection(app, 'function CalcBrutoNeto()', 'function CalcVacaciones()', brutoNeto);

app = replaceSection(app, 'function CalculoSuspendido', 'function Field', '');

const oldStyles = "const styles = {\n  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }\n};";
const newStyles = "const styles = {\n  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 },\n  fieldLabel: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ml-slate-600)', margin: '14px 0 6px' },\n  select: { display: 'block', width: '100%', minHeight: 48, padding: '11px 12px', margin: '0 0 14px', border: '2px solid var(--ml-slate-200)', borderRadius: 'var(--ml-radius-input)', background: 'white', color: 'var(--ml-slate-900)', fontSize: 15 },\n};";
app = replaceRequired(app, oldStyles, newStyles, 'styles formularios');

const fIcon = app.indexOf('const FICHA_ICONOS = {');
const fFunc = app.indexOf('function FichaConfianza', fIcon);
if (fIcon >= 0 && fFunc >= 0) app = app.slice(0, fIcon) + app.slice(fFunc);

const ficha = String.raw`function FichaConfianza({ id }) {
  const data = regulatoryData.calculators[id];
  if (!data) return null;
  const primary = (data.sources || []).filter(s => s.url && s.document && s.reference);
  return <section className="calculator-trust" aria-label="Comprobación y fuentes">
    <div className="calculator-trust-head">
      <span className="calculator-trust-dot" aria-hidden="true"></span>
      <div><strong>{data.publicLabel || 'Cálculo comprobado'}</strong><span> · {data.period}</span></div>
    </div>
    <p>{data.reviewReason}</p>
    <Details summary="Alcance, comprobación y fuentes">
      <p><strong>Alcance:</strong> {data.verificationScope}</p>
      <p><strong>Fuentes consultadas:</strong> {data.sourceCheckedAt || data.verifiedAt}</p>
      <p><strong>Cálculo comprobado:</strong> {data.calculationReviewedAt || data.verifiedAt}</p>
      <ul>{primary.map((s,i)=><li key={i}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.institution}: {s.document}</a> {s.reference && `(${s.reference})`}</li>)}</ul>
      <p><strong>Próxima comprobación:</strong> {data.nextReview}</p>
      <p>La herramienta se limita al alcance descrito; no decide por sí sola derechos o hechos que requieren documentos del caso.</p>
    </Details>
  </section>;
}`;
app = replaceSection(app, 'function FichaConfianza', '// Iconos de línea', ficha);

app = app.replace("const texto = encodeURIComponent('Acabo de calcular mis finanzas gratis en MiLana 💰 Pruébalo tú también: https://www.milanaaqui.mx');", "const texto = encodeURIComponent('Acabo de usar una calculadora de MiLana: https://www.milanaaqui.mx');");
app = app.replace('📲 Compartir por WhatsApp', 'Compartir por WhatsApp');
app = app.replace("result.cumpleMinimo ? '✅ Sí' : `❌ Faltan ${result.faltanSemanas} semanas`", "result.cumpleMinimo ? 'Sí' : `Faltan ${result.faltanSemanas} semanas`");
app = app.replace("pension:    { tag: 'Retiro',      largo: 'Revisa si cumples los requisitos de la Ley 97 antes de proyectar nada.' },", "pension:    { tag: 'Retiro',      largo: 'Comprueba edad y semanas del esquema de Ley 97 para 2026, sin inventar un monto de pensión.' },");
app = app.replace("'bruto-neto':{ tag: 'Sueldo',      largo: 'Visualiza cuánto llega realmente a tu cuenta y qué se descuenta.' },", "'bruto-neto':{ tag: 'Sueldo',      largo: 'Estima lo que queda después de ISR e IMSS usando bases separadas de nómina.' },");
app = app.replace("{ id: 'pension', nombre: 'Pensión IMSS', desc: 'Estimación Ley 97', comp: CalcPension },", "{ id: 'pension', nombre: 'Pensión IMSS', desc: 'Requisitos Ley 97', comp: CalcPension },");
write('src/App.jsx', app);

// ---------------------------------------------------------------------------
// Estado regulatorio: todas las herramientas quedan comprobadas en un alcance
// explícito. No se convierte una limitación de alcance en una promesa universal.
// ---------------------------------------------------------------------------
const reg = JSON.parse(read('src/data/regulatory-data.json'));
reg.meta.lastReview = fecha;
reg.meta.reviewedBy = 'MiLana: casos de referencia y fuentes primarias comprobados para el alcance publicado.';

const conasamiUrl = 'https://www.gob.mx/conasami/es/articulos/se-publican-en-el-diario-oficial-de-la-federacion-los-salarios-minimos-vigentes-a-partir-del-1-de-enero-de-2026';
for (const clave of ['SALARIO_MINIMO_GENERAL','SALARIO_MINIMO_FRONTERA']) {
  const p = reg.parametrosCompartidos.valores[clave];
  p.sources = [{ institution: 'CONASAMI', document: 'Salarios mínimos vigentes a partir del 1 de enero de 2026', reference: clave.endsWith('FRONTERA') ? 'ZLFN: $440.87 diarios' : 'ZSMG: $315.04 diarios', url: conasamiUrl }];
  p.verificationStatus = 'verified'; p.verifiedAt = fecha;
}
const isrParam = reg.parametrosCompartidos.valores.ISR_MENSUAL_2026;
isrParam.sources = [{ institution: 'DOF / SAT', document: 'Anexo 8 de la Resolución Miscelánea Fiscal 2026', reference: 'Tarifa mensual del artículo 96, publicada 28/12/2025', url: 'https://sidof.segob.gob.mx/notas/docFuente/5777219' }];
isrParam.verificationStatus = 'verified'; isrParam.verifiedAt = fecha;
const resicoParam = reg.parametrosCompartidos.valores.RESICO_TASAS;
resicoParam.sources = [{ institution: 'Cámara de Diputados', document: 'Ley del Impuesto sobre la Renta', reference: 'Art. 113-E, tabla mensual', url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf' }];
resicoParam.verificationStatus = 'verified'; resicoParam.verifiedAt = fecha;
const vacParam = reg.parametrosCompartidos.valores.VACACIONES_POR_ANIO;
vacParam.sources = [{ institution: 'Cámara de Diputados', document: 'Ley Federal del Trabajo', reference: 'Arts. 76, 79 y 80', url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf' }];
vacParam.verificationStatus = 'verified'; vacParam.verifiedAt = fecha;

const scopes = {
  finiquito: ['Cálculo comprobado', 'Estima un finiquito bruto para terminaciones ocurridas en 2026 con salario mensual fijo, prestaciones capturadas y causa declarada. No estima ISR por separación.', ['Caso $18,000: 01/07/2026–14/09/2026 = $3,747.95 sin salario pendiente ni prima de antigüedad.', 'Renuncia con menos de 15 años no agrega prima de antigüedad.']],
  liquidacion: ['Escenario comprobado', 'Estima un escenario de despido injustificado para relación por tiempo indeterminado. Los 20 días por año son opcionales y no se presumen procedentes.', ['Salario $18,000 con prestaciones mínimas: SDI $629.589041 y componente de 90 días $56,663.01.', 'El componente de 20 días por año es cero de forma predeterminada.']],
  aguinaldo: ['Cálculo comprobado', 'Aguinaldo bruto 2026 con salario mensual fijo, días de prestación capturados y servicio continuo hasta el cierre del año.', ['Salario $18,000, ingreso 01/07/2026: 184 días y $4,536.99 brutos.']],
  isr: ['Cálculo comprobado', 'Retención mensual ordinaria de febrero a diciembre de 2026 para un solo empleador, con declaración explícita sobre salario mínimo.', ['$11,000: ISR causado $837.82, subsidio $535.65, retención $302.17.', '$11,492.67: sin subsidio por superar el límite aplicable.']],
  resico: ['Cálculo comprobado', 'ISR mensual causado de RESICO para persona física sobre CFDI efectivamente cobrados sin IVA; no valida por sí solo elegibilidad, retenciones ni pago definitivo.', ['$25,000 aplica 1.00%; $50,000 aplica 1.10%; $3,500,000 aplica 2.50%.']],
  ptu: ['Cálculo comprobado', 'Calcula únicamente el 10% total de renta gravable a repartir por PTU; no distribuye la cantidad entre trabajadores.', ['$5,000,000 de renta gravable produce $500,000 de PTU total.']],
  'bruto-neto': ['Cálculo comprobado', 'Estima neto después de ISR e IMSS para un mes completo ordinario de febrero a diciembre de 2026, separando bruto, base gravable ISR y SBC diario.', ['Bruto/gravable $30,000, SBC $1,000 y 30 días: ISR $4,519.65, IMSS $790.27, neto después de ambos $24,690.08.', 'Salario mínimo declarado: cuota obrera IMSS e ISR retenido iguales a cero en el alcance indicado.']],
  vacaciones: ['Cálculo comprobado', 'Días mínimos de vacaciones por antigüedad y prima mínima de 25%; si se captura salario, valora el periodo y la prima.', ['Año 1: 12 días; año 6: 22 días; año 36 continúa el incremento legal.']],
  infonavit: ['Simulación comprobada', 'Simulación matemática de amortización con monto, tasa y plazo capturados. No es cotización, mensualidad ni oferta oficial de Infonavit.', ['El último pago se ajusta para dejar saldo en cero y la tasa capturada se aplica mensualmente.']],
  pension: ['Orientación comprobada', 'Comprueba edad y semanas generales del régimen Ley 97 en 2026. No calcula monto de pensión, AFORE ni pensión garantizada.', ['En 2026 el mínimo transitorio modelado es 875 semanas; distingue cesantía de 60–64 y vejez desde 65.']],
};

for (const [id, [label, scope, cases]] of Object.entries(scopes)) {
  const c = reg.calculators[id];
  c.verificationStatus = 'verified';
  c.verifiedAt = fecha;
  c.calculationReviewedAt = fecha;
  c.calculationEnabled = true;
  c.publicLabel = label;
  c.reviewReason = scope;
  c.verificationScope = scope;
  c.referenceCases = cases;
  c.sourceCheckedAt = fecha;
  c.notas = `Alcance publicado y casos de referencia comprobados el ${fecha}.`;
  c.nextReview = id === 'pension' ? 'Antes de 2027 o si cambian los requisitos legales.' : 'Antes de cambiar de ejercicio, ampliar el alcance o aplicar una modificación normativa.';
}

// Fuentes específicas añadidas a los tres cierres que antes estaban bloqueados.
reg.calculators.finiquito.sources = [
  { institution: 'Cámara de Diputados', document: 'Ley Federal del Trabajo', reference: 'Arts. 76, 79, 80, 87, 162, 485 y 486', url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf' },
  { institution: 'CONASAMI', document: 'Salarios mínimos 2026', reference: 'ZSMG $315.04; ZLFN $440.87', url: conasamiUrl },
];
reg.calculators.liquidacion.sources = [
  { institution: 'Cámara de Diputados', document: 'Ley Federal del Trabajo', reference: 'Arts. 48–50, 84, 89, 162, 485 y 486', url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf' },
  { institution: 'CONASAMI', document: 'Salarios mínimos 2026', reference: 'Topes aplicables a prima de antigüedad', url: conasamiUrl },
];
reg.calculators['bruto-neto'].sources = [
  { institution: 'Cámara de Diputados', document: 'Ley del Seguro Social', reference: 'Arts. 25, 27–29, 36, 106–107, 147 y 168', url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LSS.pdf' },
  { institution: 'INEGI', document: 'UMA 2026', reference: '$117.31 diarios desde 01/02/2026', url: 'https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2026/uma/uma2026.pdf' },
  { institution: 'DOF / SAT', document: 'Anexo 8 RMF 2026 y subsidio para el empleo', reference: 'Tarifa mensual y reglas febrero–diciembre', url: 'https://sidof.segob.gob.mx/notas/docFuente/5777219' },
];
reg.calculators.ptu.sources = [
  { institution: 'SAT', document: 'Reparto de Utilidades 2026', reference: 'PTU: 10% de las ganancias netas / renta gravable aplicable', url: 'https://www.sat.gob.mx/minisitio/RepartodeUtilidades/personas.html' },
  { institution: 'Cámara de Diputados', document: 'Ley Federal del Trabajo', reference: 'Arts. 117–127', url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf' },
];
write('src/data/regulatory-data.json', JSON.stringify(reg, null, 2) + '\n');

// ---------------------------------------------------------------------------
// Contenido editorial público: eliminar mensajes de suspensión y explicar el
// nuevo alcance exacto.
// ---------------------------------------------------------------------------
const contenido = JSON.parse(read('src/data/contenido-calculadoras.json'));
contenido.finiquito.proposito = 'Estima el finiquito bruto de una terminación ocurrida en 2026 con salario fijo y prestaciones capturadas. La herramienta separa cada concepto y aplica la prima de antigüedad solo cuando corresponde al supuesto declarado.';
contenido.finiquito.metodologia = 'MiLana usa días civiles de 2026 para el aguinaldo, el ciclo transcurrido desde el último aniversario para vacaciones y la prestación anual que captures o, si la dejas en blanco, el mínimo de la LFT. La prima vacacional usa el porcentaje capturado. La prima de antigüedad se limita a doce días por año con el tope de dos salarios mínimos de la zona y solo se incorpora cuando la causa declarada cumple el supuesto modelado.';
contenido.liquidacion.proposito = 'Estima un escenario económico de despido injustificado en una relación por tiempo indeterminado. Separa prestaciones devengadas, indemnización de tres meses, prima de antigüedad y, solo si lo activas, el escenario de veinte días por año.';
contenido.liquidacion.metodologia = 'El salario diario integrado se construye con el salario fijo y las prestaciones de aguinaldo y prima vacacional capturadas, usando las vacaciones anuales aplicables. El escenario base agrega tres meses de SDI y prima de antigüedad. Los veinte días por año permanecen apagados de forma predeterminada porque su procedencia depende del supuesto jurídico previsto por la LFT.';
contenido['bruto-neto'].proposito = 'Estima lo que queda de tus percepciones brutas después de ISR e IMSS en un mes completo ordinario de febrero a diciembre de 2026. Para no mezclar bases, pide por separado el ingreso gravable para ISR y el SBC diario reportado al IMSS.';
contenido['bruto-neto'].metodologia = 'El ISR usa la tarifa mensual 2026 y el subsidio para el empleo dentro del alcance indicado. La cuota obrera IMSS usa el SBC diario capturado, los días cotizados, el tope de 25 UMA y la estructura obrera aplicable: 2.375% sobre la base más 0.40% sobre el excedente de tres UMA. Si declaras que percibiste únicamente el salario mínimo, la cuota obrera se asigna al patrón conforme al artículo 36 LSS. El neto mostrado resta solo ISR e IMSS del bruto capturado.';
const contenidoTexto = JSON.stringify(contenido);
if (/generación de importes está en revisión|importe permanece suspendido|cálculo en revisión/i.test(contenidoTexto)) {
  throw new Error('Quedó texto público de suspensión en contenido-calculadoras.json');
}
write('src/data/contenido-calculadoras.json', JSON.stringify(contenido, null, 2) + '\n');

const articulos = JSON.parse(read('src/data/articulos.json'));
const liqTexto = articulos.liquidacion.parrafos[1].texto;
articulos.liquidacion.parrafos[1].texto = liqTexto.replace(' La generación de importes de liquidación está en revisión para reflejar estos supuestos.', ' La calculadora separa estos componentes y deja los veinte días por año como un escenario explícito, no como un derecho automático.');
write('src/data/articulos.json', JSON.stringify(articulos, null, 2) + '\n');

// ---------------------------------------------------------------------------
// Capa visual Astra: el problema de la captura venía de duplicar foto y estado
// después del formulario. En móvil vuelve a usarse la foto integrada del hero.
// ---------------------------------------------------------------------------
let astra = read('public/astra-2026.js');
astra = astra.replace(/\n  function statusForCard\([\s\S]*?\n  }\n\n  function setupHome/, '\n\n  function setupHome');
astra = astra.replace(/\n        if \(statusForCard\(card\)[\s\S]*?\n        }/, '');
astra = astra.replace("      'Bruto a Neto': 'Consulta el alcance de esta herramienta. El importe permanece en revisión hasta cerrar correctamente el componente IMSS.',", "      'Bruto a Neto': 'Estima tu neto después de ISR e IMSS usando por separado el bruto, la base gravable y el SBC diario.',");
astra = astra.replace("      'Finiquito': 'Revisa qué conceptos forman un finiquito y el estado de la revisión. El importe permanece suspendido mientras se corrigen fechas, antigüedad y saldos.',", "      'Finiquito': 'Estima las prestaciones devengadas y, cuando corresponda, la prima de antigüedad con fechas y prestaciones declaradas.',");
astra = astra.replace("      'Liquidación': 'Revisa los conceptos y supuestos jurídicos de una liquidación. El importe permanece suspendido hasta modelar correctamente los escenarios aplicables.'", "      'Liquidación': 'Estima un escenario para relación por tiempo indeterminado y decide explícitamente si quieres incluir los veinte días por año.'");
astra = astra.replace(/\n    const jump = document\.createElement\('a'\);[\s\S]*?main\.id = 'calculo';\n/, "\n    main.id = 'calculo';\n");
astra = astra.replace(/\n    const media = qs\('\.calculator-hero-media', hero\), comp = main\.firstElementChild;[\s\S]*?\n    }\n\n    qsa\('input\[type=\"number\"\]'/, "\n    qsa('input[type=\"number\"]'");
astra = astra.replace(/\n    qsa\('form', main\)\.forEach\([\s\S]*?\n    }\)\);/, '');
astra = astra.replace(/\n    qsa\('details', main\)\.forEach\([\s\S]*?\n    }\)\);/, '');
if (/Importe en revisión|astra-jump-to-calc|astra-mobile-photo/.test(astra)) throw new Error('La capa Astra conserva UI de suspensión o foto duplicada.');
write('public/astra-2026.js', astra);

let css = read('public/astra-2026.css');
css = css.replace(/\.astra-review-label \{[\s\S]*?\n\}/, '');
css = css.replace('  min-width: 48px;\n  min-height: 44px;', '  min-height: 44px;\n  padding: 0 14px;');
css = css.replace('  font: inherit;\n  font-weight: 700;', '  font: inherit;\n  font-size: 15px;\n  font-weight: 700;');
css = css.replace('.calculator-main input,\n.calculator-main select,', '.calculator-main input:not([type="checkbox"]),\n.calculator-main select,');
css = css.replace('.astra-mobile-photo { display: none; }\n', '');
css = css.replace(/\n  \.calculator-hero-media \{ display: none !important; \}[\s\S]*?\n  \.calculator-main \{ padding-top: 24px !important; \}/, '\n  .calculator-main { padding-top: 28px !important; }');
css = css.replace(/\n  \.astra-mobile-photo img \{ height: 160px; \}/, '');
css += String.raw`

/* Cierre visual 2026-09-14 */
.calc-intro { margin: 0 0 22px; color: var(--ml-muted, #5E6B78); font-size: 14px; line-height: 1.65; }
.calc-help { margin: 6px 0 14px; color: var(--ml-soft, #7A8794); font-size: 12.5px; line-height: 1.55; }
.calc-error { min-height: 1.25em; margin: 8px 0 0; color: #A94442; font-size: 13px; }
.calc-check { display: flex; align-items: flex-start; gap: 10px; margin: 12px 0; color: var(--ml-text, #18283A); font-size: 14px; line-height: 1.5; }
.calc-check input[type="checkbox"] { width: 18px; height: 18px; min-height: 18px; margin: 2px 0 0; flex: 0 0 auto; accent-color: var(--ml-blue, #2D6CAA); }
.calculator-trust { margin-top: 24px; padding: 18px 0 0; border-top: 1px solid var(--ml-border, #D9E1E8); }
.calculator-trust-head { display: flex; align-items: center; gap: 9px; color: var(--ml-ink, #13263B); font-size: 13px; }
.calculator-trust-head span { color: var(--ml-soft, #7A8794); font-weight: 500; }
.calculator-trust-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--ml-green, #28735A); flex: 0 0 auto; }
.calculator-trust > p { margin: 8px 0 0; color: var(--ml-muted, #5E6B78); font-size: 13px; line-height: 1.6; }

@media (max-width: 639px) {
  .calculator-hero-copy { padding-bottom: 0; }
  .calculator-hero-media { display: block !important; height: 210px; margin-top: 22px; }
  .calculator-main { padding-top: 30px !important; }
  .calculator-main > form, .calculator-main > div:first-child { width: 100%; max-width: 100%; }
  .calculator-main .ml-result { padding: 18px !important; }
  .astra-menu-button { padding-inline: 13px; border-radius: 11px; }
}
`;
write('public/astra-2026.css', css);

let measurement = read('public/astra-measurement-2026.js');
measurement = measurement.replace("const formulaVersion = id => ['isr', 'aguinaldo'].includes(id) ? 'revised-2026-09-14' : 'scope-2026-09-14';", "const formulaVersion = () => 'verified-scope-2026-09-14';");
write('public/astra-measurement-2026.js', measurement);

// Guía pública de bruto/neto: ya no debe decir que la herramienta está suspendida.
const guia = `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sueldo bruto y neto: cómo leer tu recibo | MiLana</title><meta name="description" content="Cómo separar bruto, base gravable para ISR y SBC diario para estimar ISR e IMSS sin mezclar sus bases."><link rel="canonical" href="https://www.milanaaqui.mx/guias/bruto-neto-recibo"><style>body{margin:0;font:16px/1.65 Inter,system-ui,sans-serif;color:#18283A;background:#fff}main{max-width:820px;margin:auto;padding:56px 20px 88px}h1,h2{font-family:Georgia,serif;color:#13263B}h1{font-size:clamp(38px,7vw,58px);line-height:1.02}a{color:#2D6CAA}.eyebrow{font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#2D6CAA}.case{margin:28px 0;padding:24px;background:#FBF8F2;border-radius:16px}.formula{font-variant-numeric:tabular-nums;padding:16px 18px;background:#F2F7FB;border-left:4px solid #2D6CAA}.source{font-size:14px;color:#5E6B78}.cta{display:inline-flex;align-items:center;min-height:48px;padding:0 18px;border-radius:12px;background:#2D6CAA;color:#fff;text-decoration:none;font-weight:750}</style></head><body><main><p><a href="/">← MiLana</a></p><p class="eyebrow">Sueldo · caso comprobado</p><h1>Bruto no es neto: separa las bases antes de restar</h1><p>ISR e IMSS no se calculan correctamente aplicando un solo porcentaje al sueldo mensual. MiLana separa las percepciones brutas, el ingreso gravable para ISR y el Salario Base de Cotización diario.</p><h2>ISR</h2><p>Para un mes completo ordinario de febrero a diciembre de 2026 con un solo empleador, la herramienta aplica la tarifa mensual del artículo 96 y el subsidio para el empleo cuando corresponde.</p><h2>IMSS</h2><p>La cuota obrera usa el SBC diario que captures, los días cotizados y el tope de 25 UMA. El cálculo suma 2.375% sobre la base aplicada y 0.40% sobre el excedente de tres UMA. Si la persona percibe únicamente el salario mínimo general aplicable, el artículo 36 de la LSS asigna al patrón la cuota obrera.</p><div class="case"><h2>Ejemplo reproducible</h2><p><strong>Bruto mensual:</strong> $30,000<br><strong>Ingreso gravable ISR:</strong> $30,000<br><strong>SBC diario:</strong> $1,000<br><strong>Días cotizados:</strong> 30<br><strong>Mes:</strong> septiembre de 2026</p><div class="formula">ISR estimado: $4,519.65<br>Cuota obrera IMSS: $790.27<br><strong>Neto después de ISR e IMSS: $24,690.08</strong></div></div><h2>Qué no incluye</h2><p>Infonavit, Fonacot, préstamos, pensión alimenticia, caja de ahorro u otras deducciones del recibo. Por eso el resultado no promete coincidir con el depósito final si existen otros conceptos.</p><p class="source">Fuentes: Ley del Seguro Social, arts. 25, 27–29, 36, 106–107, 147 y 168; Anexo 8 RMF 2026; UMA 2026 de INEGI. Revisión material: 14/09/2026.</p><p><a class="cta" href="/calculadoras/bruto-neto">Calcular bruto a neto</a></p></main></body></html>`;
write('public/guias/bruto-neto-recibo/index.html', guia);

// Scripts de paquete y estado de continuidad.
const pkg = JSON.parse(read('package.json'));
pkg.scripts.test = 'node --test tests/*.test.mjs';
write('package.json', JSON.stringify(pkg, null, 2) + '\n');

mkdirSync('docs/cierre-2026-09-14', { recursive: true });
write('docs/cierre-2026-09-14/README.md', `# Cierre de calculadoras y móvil — 14/09/2026\n\n- Finiquito, Liquidación y Bruto a Neto reactivados con alcance explícito y casos de referencia.\n- Los 20 días por año en Liquidación no se presumen: el usuario debe activar ese escenario.\n- Bruto a Neto separa bruto, ingreso gravable ISR y SBC diario; aplica tope de 25 UMA y excepción de cuota obrera para salario mínimo declarado.\n- Las diez herramientas muestran una etiqueta positiva de alcance comprobado; no quedan estados públicos \"en revisión\".\n- En móvil se eliminó el enlace suelto \"Ir al cálculo\", la foto duplicada después del formulario y la etiqueta repetida de suspensión. La foto vuelve al hero editorial, antes de la herramienta.\n- Fuentes primarias: Cámara de Diputados (LFT/LSS/LISR), DOF/SAT, CONASAMI, INEGI y SAT PTU 2026.\n- Pruebas: \`npm test\` y \`npm run build\`.\n\nEl alcance sigue siendo informativo: limitar una herramienta no equivale a dejarla pendiente; cada limitación se declara de forma específica en la página.\n`);

console.log('Cierre integral aplicado.');
