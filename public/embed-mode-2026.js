(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  if (params.get('embed') !== '1') return;
  const match = location.pathname.match(/^\/calculadoras\/([^/]+)\/?$/);
  if (!match) return;
  const slug = match[1];

  document.documentElement.classList.add('milana-embed');
  const style = document.createElement('style');
  style.textContent = `
    html.milana-embed,html.milana-embed body{background:#fff!important}
    html.milana-embed .site-header,html.milana-embed .calculator-hero,html.milana-embed .site-footer{display:none!important}
    html.milana-embed .calculator-main{max-width:760px!important;margin:0 auto!important;padding:14px 16px 24px!important}
    html.milana-embed .calculator-main>*:not(form):not(.ml-embed-brand){display:none!important}
    html.milana-embed .ml-embed-brand{display:flex!important;align-items:center;justify-content:space-between;gap:12px;margin:0 0 14px;padding:8px 0 12px;border-bottom:1px solid #e6e9ee;font:600 12px/1.4 Inter,system-ui,sans-serif;color:#5e6b78}
    html.milana-embed .ml-embed-brand a{color:#2d6caa;text-decoration:none}
    html.milana-embed .ml-embed-brand strong{color:#13263b}
  `;
  document.head.appendChild(style);

  function mount() {
    const main = document.querySelector('.calculator-main');
    const form = main?.querySelector('form');
    if (!main || !form || main.querySelector('.ml-embed-brand')) return;
    const bar = document.createElement('div');
    bar.className = 'ml-embed-brand';
    bar.innerHTML = `<span><strong>MiLana</strong> · calculadora gratuita</span><a href="${location.origin}${location.pathname}" target="_blank" rel="noopener noreferrer">Abrir completa ↗</a>`;
    main.insertBefore(bar, form);
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'widget_view', { calculator_id: slug, page_path: location.pathname });
    }
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; mount(); });
  };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true }); else schedule();
})();
