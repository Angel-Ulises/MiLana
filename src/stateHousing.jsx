import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import vivienda from './data/viviendaEstados.json';

const dinero = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(Number(n) || 0);
const pp = (valor, nacional) => `${valor - nacional >= 0 ? '+' : ''}${(valor - nacional).toFixed(1)} pp vs. México`;
const pct = (valor, nacional) => `${valor - nacional >= 0 ? '+' : ''}${(((valor - nacional) / nacional) * 100).toFixed(1)}% vs. México`;
const fechaLarga = (iso) => new Intl.DateTimeFormat('es-MX', { day:'numeric', month:'long', year:'numeric', timeZone:'America/Mexico_City' }).format(new Date(`${iso}T12:00:00-06:00`));

function Fuente() {
  return <aside className="state-housing-source"><span>Fuente de vivienda</span><div><strong>{vivienda.fuente}</strong><p>Publicado el {fechaLarga(vivienda.publicado)}. {vivienda.nota}</p></div></aside>;
}

function HubHousing() {
  const n = vivienda.nacional;
  return <section className="state-housing state-housing-hub"><div className="shell"><div className="state-housing-head"><div><p className="eyebrow">Vivienda · SHF {vivienda.actualizado}</p><h2>El contexto estatal también cambia cuando buscas vivienda.</h2></div><p>MiLana separa el nivel de los avalúos hipotecarios de la velocidad con la que se mueven los precios. Ninguno de los dos sustituye tu presupuesto personal.</p></div><div className="state-housing-grid state-housing-grid-hub"><article><span>Mediana nacional</span><strong>{dinero(n.mediana)}</strong><p>La mitad de las operaciones hipotecarias valuadas quedó por debajo de esta cifra en {vivienda.periodoValores}.</p></article><article><span>Apreciación 2026-II</span><strong>{n.apreciacion.toFixed(1)}%</strong><p>Cambio frente al mismo trimestre de 2025. No es una tasa hipotecaria.</p></article><article><span>Rango central de operaciones</span><strong>{dinero(n.p25)} – {dinero(n.p75)}</strong><p>Entre P25 y P75 se ubica la mitad central de los avalúos observados.</p></article></div><Fuente /></div></section>;
}

function DetailHousing({ dato }) {
  const n = vivienda.nacional;
  const distribucion = useMemo(() => [
    { etiqueta:'25% de operaciones por debajo de', valor:dato.p25 },
    { etiqueta:'Mediana · 50% por debajo de', valor:dato.mediana },
    { etiqueta:'75% de operaciones por debajo de', valor:dato.p75 },
  ], [dato]);

  return <section className="state-housing"><div className="shell"><div className="state-housing-head"><div><p className="eyebrow">Vivienda · SHF {vivienda.actualizado}</p><h2>¿Qué está pasando con la vivienda en {dato.estado}?</h2></div><p>SHF observa viviendas adquiridas mediante crédito hipotecario. Aquí mostramos nivel de avalúo y apreciación por separado para no confundir “cuánto cuesta” con “cuánto subió”.</p></div><div className="state-housing-grid"><article className="state-housing-primary"><span>Mediana de avalúo</span><strong>{dinero(dato.mediana)}</strong><p>{pct(dato.mediana, n.mediana)}. La mediana suele describir mejor el centro del mercado que el promedio cuando existen operaciones muy caras.</p></article><article><span>Apreciación interanual · 2026-II</span><strong>{dato.apreciacion.toFixed(1)}%</strong><p>{pp(dato.apreciacion, n.apreciacion)}. Compara el segundo trimestre de 2026 con el mismo trimestre de 2025.</p></article><article><span>Promedio de avalúo</span><strong>{dinero(dato.promedio)}</strong><p>Es sensible a valores extremos; por eso MiLana no lo usa como “precio típico” de una vivienda.</p></article></div><div className="state-housing-distribution"><div className="state-housing-distribution-copy"><span>Distribución observada</span><strong>No todo el mercado cuesta lo mismo.</strong><p>Estos cortes describen las operaciones hipotecarias de {vivienda.periodoValores}; no son precios mínimos o máximos del estado.</p></div><div className="state-housing-quarters">{distribucion.map((item) => <article key={item.etiqueta}><span>{item.etiqueta}</span><strong>{dinero(item.valor)}</strong></article>)}</div></div><div className="state-housing-guardrails"><article><span>Este dato sí responde</span><strong>Cómo se valuaron operaciones con hipoteca</strong><p>Incluye vivienda nueva y usada observada por SHF bajo su metodología.</p></article><article><span>Este dato no responde</span><strong>Cuánto vale una casa específica</strong><p>No es una valuación individual, precio de anuncio ni referencia de renta.</p></article><article><span>No mezclamos</span><strong>Precio estatal con capacidad de pago</strong><p>Tu presupuesto depende de ingreso, ahorro, deuda, tasa, plazo y condiciones del crédito.</p></article></div><div className="state-housing-actions"><a href="/finanzas/vivienda"><span>Vivienda</span><strong>Ordena la decisión de vivienda</strong><b>→</b></a><a href="/finanzas/ahorro"><span>Ahorro</span><strong>Calcula una meta para enganche</strong><b>→</b></a><a href="/calculadoras/infonavit"><span>Infonavit</span><strong>Revisa la herramienta disponible</strong><b>→</b></a><a href="/finanzas/mi-situacion"><span>Mi situación</span><strong>Aterriza ingreso, deuda y ahorro</strong><b>→</b></a></div><Fuente /></div></section>;
}

export default function StateHousing() {
  const [target, setTarget] = useState(null);
  const [slug, setSlug] = useState('');

  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (!/^\/estados(?:\/[^/]+)?$/.test(path)) return undefined;
    const actual = path.split('/').filter(Boolean)[1] || '';
    setSlug(actual);
    let intentos = 0;
    let timer = null;
    let mount = null;

    const buscar = () => {
      const referencia = actual ? document.querySelector('.state-labor') : document.querySelector('.state-directory');
      if (referencia) {
        mount = document.createElement('div');
        mount.className = 'state-housing-mount';
        referencia.insertAdjacentElement('afterend', mount);
        setTarget(mount);
      } else if (++intentos < 40) {
        timer = window.setTimeout(buscar, 100);
      }
    };

    buscar();
    return () => {
      if (timer) window.clearTimeout(timer);
      if (mount?.parentNode) mount.parentNode.removeChild(mount);
    };
  }, []);

  if (!target) return null;
  if (!slug) return createPortal(<HubHousing />, target);
  const dato = vivienda.estados.find((e) => e.slug === slug);
  return dato ? createPortal(<DetailHousing dato={dato} />, target) : null;
}
