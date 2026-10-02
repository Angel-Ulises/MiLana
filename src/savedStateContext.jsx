import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import estados from './data/estados.json';
import laboral from './data/mercadoLaboralEstados.json';
import vivienda from './data/viviendaEstados.json';
import { borrarEstadoGuardado, leerEstadoGuardado } from './lib/statePreference.js';

const dinero = (n) => new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN', maximumFractionDigits:0 }).format(Number(n)||0);

export default function SavedStateContext(){
  const [target,setTarget]=useState(null);
  const [slug,setSlug]=useState(()=>leerEstadoGuardado());
  const contexto=useMemo(()=>{
    if(!slug) return null;
    const estado=estados.estados.find(e=>e.slug===slug);
    const mercado=laboral.estados.find(e=>e.slug===slug);
    const casa=vivienda.estados.find(e=>e.slug===slug);
    return estado&&mercado&&casa?{estado,mercado,casa}:null;
  },[slug]);

  useEffect(()=>{
    const path=window.location.pathname.replace(/\/$/,'')||'/';
    if(!/^\/finanzas(?:\/|$)/.test(path)) return undefined;
    let intentos=0;
    let timer=null;
    const buscar=()=>{
      const nodo=path==='/finanzas/mi-situacion'
        ? document.querySelector('.advisor-main > .shell')
        : document.querySelector('.finance-page-hero-copy');
      if(nodo) setTarget(nodo);
      else if(++intentos<35) timer=window.setTimeout(buscar,100);
    };
    buscar();
    return()=>{if(timer)window.clearTimeout(timer)};
  },[]);

  if(!target||!contexto) return null;
  const quitar=()=>{borrarEstadoGuardado();setSlug('')};
  const {estado,mercado,casa}=contexto;

  return createPortal(<aside className="saved-state-context" aria-label={`Contexto guardado de ${estado.estado}`}>
    <div className="saved-state-context-head"><div><span>Contexto estatal guardado</span><strong>{estado.estado}</strong></div><div><a href={`/estados/${estado.slug}`}>Abrir ficha →</a><button type="button" onClick={quitar}>Quitar</button></div></div>
    <div className="saved-state-context-grid"><div><span>Ingreso profesional promedio</span><strong>{dinero(estado.ingreso)}</strong></div><div><span>Desocupación</span><strong>{mercado.desocupacion.toFixed(1)}%</strong></div><div><span>Informalidad</span><strong>{mercado.informalidad.toFixed(1)}%</strong></div><div><span>Mediana avalúo hipotecario</span><strong>{dinero(casa.mediana)}</strong></div><div><span>Apreciación vivienda 2026-II</span><strong>{casa.apreciacion.toFixed(1)}%</strong></div></div>
    <p>Este contexto viene del estado que elegiste guardar en este dispositivo. No cambia tus fórmulas, no rellena tus campos y no convierte cifras estatales en recomendaciones personales.</p>
  </aside>,target);
}
