import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const PEXELS = {
  carreras: '6147267',
  economia: '13196409',
};

const foto = (id, width = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;

const PREGUNTAS = [
  {
    id: 'mejor-pagadas',
    tag: 'Carreras',
    pregunta: '¿Qué carreras pagan mejor en México?',
    texto: 'Explora por área, ubicación y momento de carrera; después aterriza el salario a dinero neto.',
    ramas: ['Mejor pagadas en México', 'Mejor pagadas por estado', 'Ingenierías mejor pagadas', 'Comparar sueldo bruto vs. neto'],
    accion: '/calculadoras/bruto-a-neto',
    accionTexto: 'Probar un sueldo en Bruto → Neto',
  },
  {
    id: 'demanda',
    tag: 'Empleo',
    pregunta: '¿Qué carreras tienen más demanda?',
    texto: 'La misma carrera cambia mucho según región, experiencia y sector. MiLana organizará esas rutas sin mezclar conceptos.',
    ramas: ['Demanda nacional', 'Demanda por estado', 'Para recién egresados', 'Con poca experiencia'],
    accion: '#ml-finanzas',
    accionTexto: 'Ver rutas de trabajo y dinero',
  },
  {
    id: 'profesion',
    tag: 'Salarios',
    pregunta: '¿Cuánto gana una profesión específica?',
    texto: 'Busca la ocupación y continúa hacia ingreso neto, prestaciones, ahorro y vivienda.',
    ramas: ['Ingeniería', 'Medicina', 'Contaduría', 'Tecnología y software'],
    accion: '/calculadoras/bruto-a-neto',
    accionTexto: 'Convertir salario a ingreso neto',
  },
  {
    id: 'sin-universidad',
    tag: 'Alternativas',
    pregunta: '¿Qué trabajos pagan bien sin universidad?',
    texto: 'Oficios, formación técnica y rutas laborales también deben poder compararse con datos y contexto.',
    ramas: ['Oficios', 'Carreras técnicas', 'Certificaciones', 'Empleos con capacitación corta'],
    accion: '#ml-finanzas',
    accionTexto: 'Explorar decisiones financieras',
  },
  {
    id: 'peor-pagadas',
    tag: 'Comparar',
    pregunta: '¿Cuáles son las carreras peor pagadas?',
    texto: 'No solo importa el promedio: también demanda, región, experiencia y costo de estudiar.',
    ramas: ['Promedio nacional', 'Por estado', 'Primer empleo', 'Comparar retorno de estudiar'],
    accion: '#ml-finanzas',
    accionTexto: 'Ver qué más conviene comparar',
  },
  {
    id: 'vivir-solo',
    tag: 'Vida real',
    pregunta: '¿Cuánto necesito ganar para vivir por mi cuenta?',
    texto: 'Conecta sueldo, impuestos, vivienda, deuda, ahorro y metas en una sola ruta.',
    ramas: ['Ingreso neto', 'Renta y vivienda', 'Ahorro mensual', 'Capacidad de crédito'],
    accion: '/calculadoras/bruto-a-neto',
    accionTexto: 'Empezar por mi ingreso neto',
  },
];

const AREAS = [
  { titulo: 'Trabajo y salarios', texto: 'Carreras, profesiones, demanda, prestaciones y cambios de empleo.', href: '#ml-preguntas', clave: '01' },
  { titulo: 'Impuestos', texto: 'ISR, RESICO y decisiones que cambian lo que realmente recibes.', href: '/calculadoras/isr', clave: '02' },
  { titulo: 'Vivienda', texto: 'Renta, compra, Infonavit y capacidad real de pago.', href: '/calculadoras/infonavit', clave: '03' },
  { titulo: 'Deuda y crédito', texto: 'Entender costo, mensualidad, plazo y cuándo una deuda te limita.', href: '#ml-editorial', clave: '04' },
  { titulo: 'Ahorro e inversión', texto: 'Metas, colchón, rendimiento y decisiones con horizonte claro.', href: '#ml-editorial', clave: '05' },
  { titulo: 'Retiro', texto: 'Pensión, semanas, ahorro de largo plazo y escenarios futuros.', href: '/calculadoras/pension-imss', clave: '06' },
];

const EDITORIAL = [
  {
    tipo: 'Economía cotidiana',
    titulo: 'Inflación, tasas y crédito: qué cambia en tu bolsillo',
    texto: 'La economía importa cuando cambia tu mensualidad, tu ahorro o el precio de lo que compras.',
  },
  {
    tipo: 'Trabajo',
    titulo: 'Empleo y salarios, sin perder el contexto regional',
    texto: 'Lecturas para entender qué sectores crecen, dónde hay demanda y qué significa para tu ingreso.',
  },
  {
    tipo: 'Vivienda',
    titulo: 'Costo de vida, renta y compra de vivienda',
    texto: 'Datos y explicaciones conectados con herramientas para aterrizar una decisión a números propios.',
  },
];

function asegurarDestino() {
  const home = document.querySelector('main .situations');
  if (!home) return null;
  let target = document.getElementById('ml-finance-expansion-root');
  if (!target) {
    target = document.createElement('div');
    target.id = 'ml-finance-expansion-root';
    home.insertAdjacentElement('afterend', target);
  }
  return target;
}

function asegurarNavegacion() {
  const nav = document.querySelector('.desktop-nav');
  if (!nav || nav.querySelector('[data-ml-finance-nav]')) return;
  const carreras = document.createElement('a');
  carreras.href = '/#ml-preguntas';
  carreras.textContent = 'Carreras';
  carreras.dataset.mlFinanceNav = 'true';
  const finanzas = document.createElement('a');
  finanzas.href = '/#ml-finanzas';
  finanzas.textContent = 'Finanzas';
  finanzas.dataset.mlFinanceNav = 'true';
  nav.insertBefore(carreras, nav.children[2] || null);
  nav.insertBefore(finanzas, nav.children[3] || null);
}

function PreguntaCard({ item, abierta, onToggle }) {
  return (
    <article className={`mlq-card${abierta ? ' is-open' : ''}`}>
      <button className="mlq-question" type="button" onClick={onToggle} aria-expanded={abierta}>
        <span className="mlq-tag">{item.tag}</span>
        <span className="mlq-question-title">{item.pregunta}</span>
        <span className="mlq-plus" aria-hidden="true">{abierta ? '−' : '+'}</span>
      </button>
      <div className="mlq-answer" hidden={!abierta}>
        <p>{item.texto}</p>
        <div className="mlq-branches" aria-label={`Rutas relacionadas con ${item.pregunta}`}>
          {item.ramas.map((rama) => <span key={rama}>{rama}</span>)}
        </div>
        <a className="mlq-link" href={item.accion}>{item.accionTexto}<span aria-hidden="true">→</span></a>
      </div>
    </article>
  );
}

function FinanceContent() {
  const [abierta, setAbierta] = useState('mejor-pagadas');
  const preguntas = useMemo(() => PREGUNTAS, []);

  return (
    <div className="ml-finance-layer">
      <section id="ml-preguntas" className="ml-discovery-section">
        <div className="shell ml-discovery-shell">
          <div className="ml-discovery-copy">
            <p className="eyebrow">Preguntas que abren caminos</p>
            <h2>Empieza con una duda. MiLana conecta lo que sigue.</h2>
            <p className="ml-discovery-lede">Carreras, empleo y salarios se vuelven una puerta de entrada a decisiones de dinero reales: cuánto te queda, cuánto puedes ahorrar y qué puedes pagar.</p>
            <div className="ml-discovery-photo">
              <img src={foto(PEXELS.carreras, 1200)} srcSet={`${foto(PEXELS.carreras, 640)} 640w, ${foto(PEXELS.carreras, 1200)} 1200w`} sizes="(max-width: 760px) 92vw, 440px" alt="Estudiantes universitarios trabajando juntos con una laptop" loading="lazy" />
              <span>Trabajo · Carreras · Salarios</span>
            </div>
          </div>
          <div className="mlq-list">
            {preguntas.map((item) => (
              <PreguntaCard key={item.id} item={item} abierta={abierta === item.id} onToggle={() => setAbierta(abierta === item.id ? null : item.id)} />
            ))}
          </div>
        </div>
      </section>

      <section id="ml-finanzas" className="ml-money-map">
        <div className="shell">
          <div className="ml-money-head">
            <div>
              <p className="eyebrow">Tu vida financiera, conectada</p>
              <h2>MiLana crece de calculadora a mapa de decisiones.</h2>
            </div>
            <p>No queremos una colección de artículos sueltos. Cada tema debe llevar a una herramienta, una comparación o una siguiente pregunta útil.</p>
          </div>
          <div className="ml-money-grid">
            {AREAS.map((area) => (
              <a key={area.titulo} className="ml-money-card" href={area.href}>
                <span>{area.clave}</span>
                <h3>{area.titulo}</h3>
                <p>{area.texto}</p>
                <b aria-hidden="true">↗</b>
              </a>
            ))}
          </div>
          <div className="ml-advisor-strip">
            <div>
              <span className="ml-advisor-kicker">Próxima evolución</span>
              <h3>“Gano $28,000. ¿Qué puedo hacer con eso?”</h3>
              <p>La meta es que MiLana conecte ingreso neto, gastos, ahorro, deuda y vivienda con herramientas mexicanas, sin esconder supuestos.</p>
            </div>
            <a href="/calculadoras/bruto-a-neto">Empezar por mi sueldo <span>→</span></a>
          </div>
        </div>
      </section>

      <section id="ml-editorial" className="ml-editorial-section">
        <div className="shell ml-editorial-grid">
          <article className="ml-editorial-feature">
            <img src={foto(PEXELS.economia, 1400)} srcSet={`${foto(PEXELS.economia, 700)} 700w, ${foto(PEXELS.economia, 1400)} 1400w`} sizes="(max-width: 900px) 92vw, 56vw" alt="Edificios modernos del distrito financiero de Ciudad de México" loading="lazy" />
            <div className="ml-editorial-overlay">
              <p className="eyebrow">Economía, sin ruido</p>
              <h2>Lo que pasa afuera, explicado por lo que cambia para ti.</h2>
              <p>Inflación, tasas, empleo, vivienda y actividad económica con contexto y rutas hacia herramientas de MiLana.</p>
            </div>
          </article>
          <div className="ml-editorial-list">
            <div className="ml-editorial-list-head">
              <span>Análisis y actualidad</span>
              <a href="/aprende/">Ver explicaciones <span>→</span></a>
            </div>
            {EDITORIAL.map((nota) => (
              <article className="ml-editorial-row" key={nota.titulo}>
                <span>{nota.tipo}</span>
                <h3>{nota.titulo}</h3>
                <p>{nota.texto}</p>
              </article>
            ))}
            <p className="ml-editorial-note">Las noticias se incorporarán con fecha, fuente y contexto visibles. MiLana no presentará titulares automáticos como recomendación financiera.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function FinanceExpansion() {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    const sincronizar = () => {
      const next = asegurarDestino();
      asegurarNavegacion();
      setTarget((actual) => actual === next ? actual : next);
    };
    sincronizar();
    const root = document.getElementById('root');
    if (!root) return undefined;
    const observer = new MutationObserver(sincronizar);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  if (!target) return null;
  return createPortal(<FinanceContent />, target);
}
