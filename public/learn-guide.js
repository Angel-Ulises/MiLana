(() => {
  'use strict';
  const root=document.querySelector('.learn-finder');
  if (!root) return;
  // Cada opción tiene rutas reales; no pedimos información personal ni inferimos prestaciones.
  const options={
    trabajo: { title:'Comprueba qué pasa al terminar un empleo', detail:'Finiquito y liquidación no son lo mismo. Revisa primero las diferencias y luego calcula tu caso.', guide:'/aprende/finiquito-vs-liquidacion', tool:'/calculadoras/finiquito', toolLabel:'Calcular finiquito →' },
    nomina: { title:'Entiende lo que llega a tu cuenta', detail:'El sueldo anunciado, los descuentos y el dinero neto pueden ser distintos.', guide:'/aprende/leer-recibo-nomina', tool:'/calculadoras/bruto-a-neto', toolLabel:'Calcular sueldo neto →' },
    aguinaldo: { title:'Revisa tu aguinaldo', detail:'Distingue el monto de la prestación de sus posibles efectos fiscales.', guide:'/aprende/aguinaldo-bruto-neto', tool:'/calculadoras/aguinaldo', toolLabel:'Calcular aguinaldo →' },
    vacaciones: { title:'Separa días y prima vacacional', detail:'Los días de descanso y la prima vacacional son conceptos distintos.', guide:'/aprende/vacaciones-prima-vacacional', tool:'/calculadoras/vacaciones', toolLabel:'Calcular vacaciones →' },
    resico: { title:'Entiende cuándo un ingreso cuenta', detail:'En RESICO es importante distinguir facturado, cobrado e IVA.', guide:'/aprende/resico-ingresos-cobrados', tool:'/calculadoras/resico', toolLabel:'Explorar RESICO →' },
    retiro: { title:'Antes de confiar en una cifra de pensión', detail:'Primero verifica el régimen, la edad, las semanas y los límites de la herramienta.', guide:'/aprende/pension-imss-ley-97', tool:'/calculadoras/pension-imss', toolLabel:'Consultar alcance →' },
    invertir: { title:'Invierte primero en entender', detail:'Descubre qué compras, cuánto podría variar y qué revisar antes de operar.', guide:'/invertir', tool:'/finanzas/inversion/comparar', guideLabel:'Descubrir Invertir →', toolLabel:'Comparar instrumentos →' },
  };
  const buttons=[...root.querySelectorAll('[data-learn-topic]')];
  const answer=root.querySelector('[data-learn-result]');
  const title=root.querySelector('[data-learn-title]');
  const description=root.querySelector('[data-learn-description]');
  const guide=root.querySelector('[data-learn-guide]');
  const tool=root.querySelector('[data-learn-tool]');
  if (!answer||!title||!description||!guide||!tool) return;
  buttons.forEach((button) => {
    button.addEventListener('click',()=>{
      const choice=options[button.dataset.learnTopic];
      if(!choice)return;
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      title.textContent=choice.title;
      description.textContent=choice.detail;
      guide.href=choice.guide;guide.textContent=choice.guideLabel||'Leer guía →';
      tool.href=choice.tool;tool.textContent=choice.toolLabel;
      answer.hidden=false;
    });
  });
  root.dataset.learnReady='true';
})();