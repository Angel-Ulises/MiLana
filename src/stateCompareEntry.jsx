import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import estados from './data/estados.json';
import { enlaceComparacion } from './lib/compareFromProfile.js';

export default function StateCompareEntry(){
  const [target,setTarget]=useState(null);

  useEffect(()=>{
    const path=window.location.pathname.replace(/\/$/,'')||'/';
    if (!path.startsWith('/estados') || path==='/estados/comparar') return undefined;
    let intentos=0;
    let timer=null;
    const buscar=()=>{
      const nodo=path==='/estados'
        ? document.querySelector('.state-directory-head')
        : document.querySelector('.state-actions-head');
      if (nodo) setTarget(nodo);
      else if (++intentos<30) timer=window.setTimeout(buscar,100);
    };
    buscar();
    return ()=>{ if(timer) window.clearTimeout(timer); };
  },[]);

  const slug=window.location.pathname.split('/').filter(Boolean)[1] || '';
  const href=enlaceComparacion('estado', slug, estados.estados);
  return target ? createPortal(<a className="state-compare-entry" href={href}><span>Comparador estatal</span><strong>Comparar dos estados con las mismas fuentes</strong><b>→</b></a>,target) : null;
}
