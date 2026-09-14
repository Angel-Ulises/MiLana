(() => {
  const apply = () => {
    const learn = document.querySelector('#aprende');
    if (learn && learn.dataset.astraGuides !== 'true') {
      learn.dataset.astraGuides = 'true';
      const rows = [...learn.querySelectorAll('.article-row')];
      const guides = [
        { href: '/guias/aguinaldo-2026', title: 'Aguinaldo proporcional: qué significa la cifra', topic: 'Prestaciones · caso revisado' },
        { href: '/guias/bruto-neto-recibo', title: 'Bruto no es neto: aprende a leer las piezas', topic: 'Sueldo · caso revisado' }
      ];
      guides.forEach((g, i) => {
        const row = rows[i]; if (!row) return;
        row.href = g.href;
        row.onclick = null;
        const h3 = row.querySelector('h3'); if (h3) h3.textContent = g.title;
        const p = row.querySelector('p'); if (p) p.textContent = g.topic;
      });
      const copy = learn.querySelector('.learn-copy p:not(.eyebrow)');
      if (copy) copy.textContent = 'Casos revisados para entender cómo se construye una cifra, qué supuesto la cambia y cuándo conviene desconfiar de un atajo.';
      const button = learn.querySelector('.learn-copy button');
      if (button) {
        const link = document.createElement('a');
        link.className = button.className; link.href = '/guias'; link.textContent = 'Ver guías';
        button.replaceWith(link);
      }
    }
    const footerLinks = document.querySelector('.astra-footer-links');
    if (footerLinks && !footerLinks.querySelector('a[href="/guias"]')) {
      const a = document.createElement('a'); a.href = '/guias'; a.textContent = 'Guías'; footerLinks.prepend(a);
    }
  };
  let queued = false;
  const schedule = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; apply(); }); };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true }); else schedule();
})();
