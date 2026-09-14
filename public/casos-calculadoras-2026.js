(() => {
  'use strict';

  const MATCH = location.pathname.match(/^\/calculadoras\/([^/]+)\/?$/);
  if (!MATCH) return;
  const slugInicial = MATCH[1];
  const dinero = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
  let cache = null;
  let cargando = null;

  const cargar = () => {
    if (cache) return Promise.resolve(cache);
    if (!cargando) {
      cargando = fetch('/casos-calculadoras.json', { credentials: 'same-origin' })
        .then(r => {
          if (!r.ok) throw new Error('No se pudieron cargar los ejemplos.');
          return r.json();
        })
        .then(data => (cache = data))
        .catch(() => null);
    }
    return cargando;
  };

  const escapar = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  function estilo() {
    if (document.getElementById('milana-casos-style')) return;
    const s = document.createElement('style');
    s.id = 'milana-casos-style';
    s.textContent = `
      .ml-case{margin:28px 0 6px;padding:20px;border:1px solid var(--ml-border,#e6e9ee);border-radius:16px;background:var(--ml-ivory,#fbf8f2)}
      .ml-case-kicker{margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ml-blue,#2d6caa)}
      .ml-case h2{margin:0 0 10px;font-family:"Newsreader",Georgia,serif;font-size:21px;line-height:1.25;color:var(--ml-ink,#13263b)}
      .ml-case p{margin:0;font-size:13.5px;line-height:1.7;color:var(--ml-slate-600,#4a5a6b)}
      .ml-case-grid{display:grid;gap:16px;margin-top:16px}.ml-case ul{margin:0;padding-left:18px}.ml-case li{margin:4px 0;font-size:13px;line-height:1.55;color:var(--ml-slate-600,#4a5a6b)}
      .ml-case-results{display:grid;gap:8px}.ml-case-result{display:flex;justify-content:space-between;gap:14px;padding:9px 0;border-bottom:1px solid var(--ml-border,#e6e9ee);font-size:13px}.ml-case-result strong{white-space:nowrap;color:var(--ml-ink,#13263b)}
      .ml-case-note{margin-top:14px!important;font-size:12px!important;color:var(--ml-soft,#7a8794)!important}.ml-case button{margin-top:14px;border:0;background:none;padding:0;color:var(--ml-blue,#2d6caa);font:600 13px inherit;cursor:pointer}
      @media(min-width:640px){.ml-case-grid{grid-template-columns:1fr 1fr}}
    `;
    document.head.appendChild(s);
  }

  function htmlCaso(caso, slug) {
    const entradas = (caso.entradas || []).map(x => `<li>${escapar(x)}</li>`).join('');
    const resultados = (caso.resultados || []).map(x =>
      `<div class="ml-case-result"><span>${escapar(x.etiqueta)}</span><strong>${dinero.format(Number(x.valor))}</strong></div>`
    ).join('');
    return `<section class="ml-case" data-case-slug="${escapar(slug)}" aria-labelledby="ml-case-title-${escapar(slug)}">
      <p class="ml-case-kicker">Caso resuelto</p>
      <h2 id="ml-case-title-${escapar(slug)}">${escapar(caso.titulo)}</h2>
      <p>${escapar(caso.resumen)}</p>
      <div class="ml-case-grid"><div><ul>${entradas}</ul></div><div class="ml-case-results">${resultados}</div></div>
      <p class="ml-case-note">${escapar(caso.nota)}</p>
      <button type="button" data-case-try>Probar con mis datos</button>
    </section>`;
  }

  async function pintar() {
    const match = location.pathname.match(/^\/calculadoras\/([^/]+)\/?$/);
    if (!match) return;
    const slug = match[1];
    const main = document.querySelector('.calculator-main');
    const form = main?.querySelector('form');
    if (!main || !form) return;

    const existente = main.querySelector('.ml-case');
    if (existente?.dataset.caseSlug === slug) return;
    existente?.remove();

    const data = await cargar();
    const caso = data?.[slug];
    if (!caso || location.pathname.match(/^\/calculadoras\/([^/]+)\/?$/)?.[1] !== slug) return;

    estilo();
    const wrap = document.createElement('div');
    wrap.innerHTML = htmlCaso(caso, slug);
    const section = wrap.firstElementChild;
    form.insertAdjacentElement('afterend', section);
    section.querySelector('[data-case-try]')?.addEventListener('click', () => {
      const first = form.querySelector('input,select,textarea');
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => first?.focus({ preventScroll: true }), 350);
      if (typeof window.gtag === 'function') window.gtag('event', 'example_try', { calculator_id: slug, page_path: location.pathname });
    });
  }

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; pintar(); });
  };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('popstate', schedule);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true }); else schedule();
  void slugInicial;
})();
