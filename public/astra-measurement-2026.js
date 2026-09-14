(() => {
  'use strict';

  const PROD = new Set(['milanaaqui.mx', 'www.milanaaqui.mx']);
  if (!PROD.has(location.hostname) || typeof window.gtag !== 'function') return;

  const DESIGN_VERSION = 'astra-2026-09-14';
  const cleanPath = () => location.pathname.replace(/\/+$/, '') || '/';
  const slug = () => cleanPath().split('/').filter(Boolean).at(-1) || 'home';
  const send = (event, params) => window.gtag('event', event, { page_path: cleanPath(), ...params });
  const formulaVersion = () => 'verified-scope-2026-09-14';

  function instrumentCalculator() {
    if (!cleanPath().startsWith('/calculadoras/')) return;
    const main = document.querySelector('.calculator-main');
    if (!main || main.dataset.astraMeasurement === 'true') return;
    main.dataset.astraMeasurement = 'true';
    const calculatorId = slug();
    let attempt = 0;
    let resultSeenForAttempt = -1;

    const firstControl = main.querySelector('input, select, textarea');
    firstControl?.addEventListener('focus', () => send('calculator_start', {
      calculator_id: calculatorId,
      design_version: DESIGN_VERSION
    }), { once: true });

    main.querySelectorAll('form').forEach(form => form.addEventListener('submit', () => {
      attempt += 1;
      setTimeout(() => {
        const alert = [...form.querySelectorAll('[role="alert"]')].find(el => el.textContent.trim());
        if (alert) send('calculator_error', {
          calculator_id: calculatorId,
          error_type: 'validation',
          design_version: DESIGN_VERSION
        });
      }, 0);
    }));

    const observeResults = new MutationObserver(() => {
      const result = main.querySelector('.ml-result, [data-result], [aria-live="polite"] .ml-result');
      if (!result || resultSeenForAttempt === attempt) return;
      resultSeenForAttempt = attempt;
      send('calculator_result', {
        calculator_id: calculatorId,
        formula_version: formulaVersion(calculatorId),
        design_version: DESIGN_VERSION
      });
    });
    observeResults.observe(main, { childList: true, subtree: true });

    main.querySelectorAll('details').forEach((details, index) => details.addEventListener('toggle', () => {
      if (!details.open) return;
      send('source_open', {
        calculator_id: calculatorId,
        source_id: `trust_${index + 1}`,
        placement: 'trust_card'
      });
    }));

    main.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      if (href.startsWith('/calculadoras/') && !href.endsWith(`/${calculatorId}`)) {
        send('next_step_click', {
          calculator_id: calculatorId,
          destination_id: href.split('/').filter(Boolean).at(-1) || 'calculator',
          placement: 'calculator_content'
        });
      }
      if (/diputados\.gob\.mx|sidof\.segob\.gob\.mx|inegi\.org\.mx|inegi\.gob\.mx|gob\.mx|sat\.gob\.mx|imss\.gob\.mx|infonavit\.org\.mx/.test(link.hostname)) {
        send('source_open', {
          calculator_id: calculatorId,
          source_id: link.hostname,
          placement: 'source_link'
        });
      }
    });
  }

  function instrumentGuide() {
    if (!cleanPath().startsWith('/guias/')) return;
    const contentId = slug();
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href^="/calculadoras/"]');
      if (!link) return;
      send('next_step_click', {
        calculator_id: 'guide',
        destination_id: link.getAttribute('href').split('/').filter(Boolean).at(-1) || 'calculator',
        placement: contentId
      });
    });
  }

  function init() {
    instrumentCalculator();
    instrumentGuide();
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; init(); });
  };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true }); else schedule();
})();
