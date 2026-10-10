import { useEffect, useId, useRef, useState } from 'react';
import { calcularEjemploPresupuesto, PASO_GASTO_EXTRA, MAX_GASTO_EXTRA } from './lib/budgetPractice.js';
import './budget-practice.css';

const dinero = valor => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(valor);

// Una práctica aislada: no recibe campos reales ni escribe en almacenamiento,
// handoffs, URL o métricas. Sólo el propietario decide cómo continuar.
export default function BudgetPractice({ onClose, onContinue, continueHref, closeLabel = 'Cerrar ejemplo' }) {
  const [paso, setPaso] = useState(0);
  const [extra, setExtra] = useState(0);
  const titulo = useRef(null);
  const id = useId();
  const r = calcularEjemploPresupuesto(extra);
  const titulos = ['Primero: lo que llega a tu cuenta', 'Después: lo que sale cada mes', 'La diferencia es lo que queda'];
  useEffect(() => {
    titulo.current?.focus({ preventScroll: true });
    titulo.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [paso]);
  const reiniciar = () => { setExtra(0); setPaso(0); };
  const continuar = <><span>Usar mis propios números</span><span aria-hidden="true">→</span></>;
  return <section className="ml-budget-practice" aria-labelledby={`${id}-title`}>
    <div className="ml-practice-topline">
      <button type="button" className="ml-practice-text-button" onClick={onClose}>← {closeLabel}</button>
      {paso > 0 && <button type="button" className="ml-practice-text-button" onClick={reiniciar}>Reiniciar</button>}
    </div>
    <p className="ml-practice-label">Ejemplo hipotético · Paso {paso + 1} de 3</p>
    <h3 id={`${id}-title`} ref={titulo} tabIndex={-1}>{titulos[paso]}</h3>
    {paso === 0 && <>
      <p>Imagina que este mes llegan <strong>{dinero(r.ingreso)}</strong> a tu cuenta después de descuentos.</p>
      <div className="ml-practice-amount"><span>Lo que recibes en el ejemplo</span><strong>{dinero(r.ingreso)}</strong><span>pesos al mes</span></div>
      <p>A eso le llamamos <strong>ingreso neto</strong>. Es el dinero con el que empezamos esta cuenta.</p>
      <button type="button" className="ml-practice-primary" onClick={() => setPaso(1)}>Ver en qué se va <span aria-hidden="true">→</span></button>
    </>}
    {paso === 1 && <>
      <p>En este mes imaginario, los gastos se reparten así:</p>
      <dl className="ml-practice-ledger">
        <div><dt>Básicos <small>Comida, renta, transporte y servicios</small></dt><dd>{dinero(r.esenciales)}</dd></div>
        <div><dt>Otros gastos <small>Salidas y compras de este ejemplo</small></dt><dd>{dinero(r.variables)}</dd></div>
        <div><dt>Pagos de deuda <small>Mensualidades de préstamos o tarjetas</small></dt><dd>{dinero(r.deuda)}</dd></div>
        <>{r.gastoExtra > 0 && <div><dt>Gasto extra <small>Lo que agregaste al explorar el resultado</small></dt><dd>{dinero(r.gastoExtra)}</dd></div>}</>
        <div className="ml-practice-total"><dt>Total que sale</dt><dd>{dinero(r.gastos)}</dd></div>
      </dl>
      <p>Cuenta cada gasto una sola vez. En tu caso, los básicos y los montos pueden ser distintos.</p>
      <button type="button" className="ml-practice-primary" onClick={() => setPaso(2)}>Ver cuánto queda <span aria-hidden="true">→</span></button>
    </>}
    {paso === 2 && <>
      <div className={`ml-practice-balance ml-practice-balance-${r.estado}`} role="status" aria-live="polite" aria-atomic="true">
        <span>{r.saldo < 0 ? 'Faltan' : r.saldo > 0 ? 'Quedan' : 'Quedan justos'}</span>
        <strong>{dinero(Math.abs(r.saldo))}</strong>
        <p>{r.saldo < 0 ? 'En este ejemplo sale más dinero del que entra. Verlo ayuda a revisar qué pasó; no todos los gastos se pueden recortar.' : r.saldo > 0 ? 'Es lo disponible después de los gastos del ejemplo. No es automáticamente ahorro: aún hay que decidir qué hacer con ello.' : 'En este ejemplo entra y sale lo mismo. No queda dinero libre este mes.'}</p>
      </div>
      <p className="ml-practice-equation">{dinero(r.ingreso)} que entran − {dinero(r.gastos)} que salen = {dinero(r.saldo)}</p>
      <div className="ml-practice-experiment">
        <p><strong>¿Y si aparece otro gasto?</strong><br />Gasto extra del ejemplo: {dinero(r.gastoExtra)}</p>
        <div className="ml-practice-experiment-actions">
          <button type="button" onClick={() => setExtra(actual => Math.min(MAX_GASTO_EXTRA, actual + PASO_GASTO_EXTRA))} disabled={extra >= MAX_GASTO_EXTRA}>Sumar $500 de gasto</button>
          <button type="button" onClick={() => setExtra(0)} disabled={extra === 0}>Quitar el extra</button>
        </div>
        {extra >= MAX_GASTO_EXTRA && <small>Hasta $3,000 extra en esta práctica. Puedes quitarlo para comparar.</small>}
      </div>
      <details className="ml-practice-meaning"><summary>¿Entonces, qué es un presupuesto?</summary><p>Es poner por escrito lo que entra y lo que sale durante un periodo, como un mes. Esta resta te muestra si sobra, falta o queda justo.</p></details>
      {continueHref ? <a className="ml-practice-primary" href={continueHref} onClick={onContinue}>{continuar}</a> : <button type="button" className="ml-practice-primary" onClick={onContinue}>{continuar}</button>}
      <p className="ml-practice-footnote">Las cifras son ficticias. No se copian a tus herramientas ni son una recomendación de gasto.</p>
    </>}
    {paso > 0 && <button type="button" className="ml-practice-text-button ml-practice-previous" onClick={() => setPaso(actual => actual - 1)}>← Paso anterior</button>}
  </section>;
}

// La calculadora directa también ofrece ayuda, cerrada incluso en modo experto.
// Abrir, reiniciar y cerrar la práctica nunca modifica los campos capturados.
export function BudgetPracticeHelp() {
  const [abierto, setAbierto] = useState(false);
  const entrada = useRef(null);
  const contenedor = useRef(null);
  const volver = (aFormulario = false) => {
    setAbierto(false);
    requestAnimationFrame(() => {
      const destino = aFormulario ? contenedor.current?.closest('.finance-form-card')?.querySelector('input') : entrada.current;
      destino?.focus({ preventScroll: true });
      destino?.scrollIntoView({ block: 'center', behavior: 'instant' });
    });
  };
  return <div className="ml-practice-help" ref={contenedor}>
    {abierto ? <BudgetPractice onClose={() => volver()} onContinue={() => volver(true)} /> : <button className="ml-practice-entry" type="button" ref={entrada} onClick={() => setAbierto(true)}>¿Primera vez? Ver un ejemplo</button>}
  </div>;
}
