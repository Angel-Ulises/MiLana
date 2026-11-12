import { useEffect, useId, useState } from 'react';
import { registrarResultado, olvidarResultado } from './lib/medicion.js';
import './resultado-claro.css';

// Piezas comunes de las calculadoras directas (mejora 2026-11): celular primero, pocos campos,
// lo especial escondido en «Más opciones», resultado en vivo.

export const limpiarNumero = (texto) => String(texto ?? '').replace(/[$,\s]/g, '');

export function CampoDinero({ label, value, onChange, placeholder, ayuda, name }) {
  const id = useId();
  return <div className="cc-campo">
    <label htmlFor={id}>{label}</label>
    <div className="cc-dinero"><input id={id} name={name} inputMode="decimal" autoComplete="off" placeholder={placeholder}
      value={value} onChange={(e) => onChange(e.target.value)} aria-describedby={ayuda ? `${id}-a` : undefined} /></div>
    {ayuda && <p id={`${id}-a`} className="cc-ayuda">{ayuda}</p>}
  </div>;
}

export function CampoNumero({ label, value, onChange, placeholder, ayuda, name, sufijo }) {
  const id = useId();
  return <div className="cc-campo">
    <label htmlFor={id}>{label}{sufijo ? <span className="cc-ayuda"> ({sufijo})</span> : null}</label>
    <input id={id} name={name} inputMode="decimal" autoComplete="off" placeholder={placeholder} value={value}
      onChange={(e) => onChange(e.target.value)} aria-describedby={ayuda ? `${id}-a` : undefined} />
    {ayuda && <p id={`${id}-a`} className="cc-ayuda">{ayuda}</p>}
  </div>;
}

export function CampoFecha({ label, value, onChange, ayuda, min, max, name }) {
  const id = useId();
  return <div className="cc-campo">
    <label htmlFor={id}>{label}</label>
    <input id={id} name={name} type="date" min={min} max={max} value={value} onChange={(e) => onChange(e.target.value)}
      aria-describedby={ayuda ? `${id}-a` : undefined} />
    {ayuda && <p id={`${id}-a`} className="cc-ayuda">{ayuda}</p>}
  </div>;
}

export function Opciones({ legend, value, onChange, opciones, name }) {
  return <fieldset className="cc-opciones">
    <legend className="cc-legend">{legend}</legend>
    {opciones.map(([valor, texto]) => <label key={valor} className="cc-opcion">
      <input type="radio" name={name} checked={value === valor} onChange={() => onChange(valor)} /><span>{texto}</span>
    </label>)}
  </fieldset>;
}

export function Casilla({ checked, onChange, children }) {
  return <label className="cc-casilla"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /> <span>{children}</span></label>;
}

// Lo especial queda escondido detrás de un enlace.
export function MasOpciones({ texto = 'Más opciones', children, abierto = false }) {
  const [ver, setVer] = useState(abierto);
  if (!ver) return <p className="cc-mas"><button type="button" className="cc-enlace" onClick={() => setVer(true)}>{texto}</button></p>;
  return <div className="cc-panel">{children}</div>;
}

export function Formulario({ children }) {
  return <form className="cc-form" noValidate onSubmit={(e) => e.preventDefault()}>{children}</form>;
}

export function MensajeError({ error }) {
  return <p className="cc-error" role="alert">{error}</p>;
}

// Registra el evento GA4 «calcular_<id>» cuando aparece (o cambia de modo) un resultado.
export function useEventoResultado(calculadora, hayResultado, modo) {
  useEffect(() => {
    if (hayResultado) registrarResultado(calculadora, modo);
    else olvidarResultado(calculadora);
  }, [calculadora, hayResultado, modo]);
}

// Hoy, limitado a 2026 (las calculadoras laborales cubren terminaciones en 2026).
export function hoy2026() {
  const d = new Date();
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  if (iso < '2026-01-01') return '2026-01-01';
  if (iso > '2026-12-31') return '2026-12-31';
  return iso;
}

export function Contenedor({ children }) {
  return <div data-calc-directo>{children}</div>;
}

export const ACTUALIZADO_2026 = '2026-11-09';
