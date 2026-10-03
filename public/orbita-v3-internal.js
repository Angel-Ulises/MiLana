(() => {
  'use strict';
  const html = document.documentElement;
  if (html.classList.contains('ml-orbita-embed') || new URLSearchParams(location.search).get('embed') === '1') return;

  const sectionForPath = () => {
    const p = location.pathname;
    if (p.startsWith('/calculadoras/')) return 'calculadoras';
    if (p.startsWith('/carreras')) return 'carreras';
    if (p.startsWith('/estados')) return 'estados';
    if (p.startsWith('/finanzas')) return 'finanzas';
    if (p.startsWith('/economia')) return 'economia';
    if (p.startsWith('/aprende')) return 'aprende';
    return 'inicio';
  };
  const syncSection = () => { html.dataset.orbitaSection = sectionForPath(); };
  syncSection();

  let currentRoot = null;
  let questions = [];
  let step = 0;
  let assistant = null;
  let actions = null;
  let primaryAction = null;

  const isInsideResult = (node) => Boolean(node.closest('.ml-result'));
  const labelFor = (root, control) => {
    if (!control.id) return null;
    return [...root.querySelectorAll('label')].find((label) => label.htmlFor === control.id) || null;
  };
  const buildQuestions = (root) => {
    const seen = new Set();
    const list = [];
    const controls = [...root.querySelectorAll('input:not([type="hidden"]),select')].filter((control) => !isInsideResult(control));
    for (const control of controls) {
      let nodes = [];
      if (control.type === 'checkbox') {
        const host = control.closest('label') || control.parentElement;
        if (host) nodes = [host];
      } else if (control.tagName === 'SELECT') {
        const label = labelFor(root, control);
        nodes = [label, control].filter(Boolean);
      } else {
        const host = control.parentElement;
        if (host) nodes = [host];
      }
      const key = nodes[0];
      if (!key || seen.has(key)) continue;
      seen.add(key);
      nodes.forEach((node) => node.setAttribute('data-orbita-question', 'true'));
      list.push({ control, nodes });
    }
    return list;
  };

  const setReactInputValue = (input, value) => {
    const proto = input instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) setter.call(input, value); else input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const addExamples = (list) => {
    for (const { control, nodes } of list) {
      if (control.type !== 'number' || control.dataset.orbitaExampleReady === '1') continue;
      const match = (control.getAttribute('placeholder') || '').match(/^Ej:\s*(.+)$/i);
      if (!match) continue;
      const host = nodes[0];
      if (!host || host.tagName === 'LABEL') continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ml-calc-example';
      button.textContent = `Usar ejemplo: ${match[1]}`;
      button.addEventListener('click', () => {
        setReactInputValue(control, match[1].replace(/[^0-9.,-]/g, '').replace(/,/g, ''));
        control.focus();
      });
      host.appendChild(button);
      control.dataset.orbitaExampleReady = '1';
    }
  };

  const markPrimaryResult = (root) => {
    const result = root.querySelector('.ml-result');
    if (!result || result.dataset.orbitaResultReady === '1') return;
    const rows = [...result.children].filter((node) => node.querySelectorAll?.(':scope > span').length >= 2);
    const strong = rows.filter((row) => {
      const spans = row.querySelectorAll(':scope > span');
      return Number.parseInt(getComputedStyle(spans[spans.length - 1]).fontWeight, 10) >= 600;
    });
    const money = strong.find((row) => row.querySelector(':scope > span:last-child')?.textContent.includes('$'));
    const primary = money || strong[0];
    if (primary) primary.dataset.orbitaPrimaryResult = 'true';
    result.dataset.orbitaResultReady = '1';
  };
  const renderStep = ({ focus = false } = {}) => {
    if (!currentRoot || !questions.length || !assistant || !actions) return;
    step = Math.max(0, Math.min(step, questions.length - 1));
    questions.forEach((question, index) => {
      const active = index === step;
      question.nodes.forEach((node) => {
        node.hidden = !active;
        node.setAttribute('aria-hidden', String(!active));
      });
    });
    const count = assistant.querySelector('[data-orbita-calc-count]');
    const progress = assistant.querySelector('[data-orbita-calc-progress]');
    if (count) count.textContent = `Pregunta ${step + 1} de ${questions.length}`;
    if (progress) progress.style.width = `${((step + 1) / questions.length) * 100}%`;
    const back = actions.querySelector('[data-orbita-calc-back]');
    const next = actions.querySelector('[data-orbita-calc-next]');
    if (back) back.hidden = step === 0;
    if (next) next.hidden = step === questions.length - 1;
    if (primaryAction) primaryAction.hidden = step !== questions.length - 1;
    const hasResult = Boolean(currentRoot.querySelector('.ml-result'));
    actions.hidden = hasResult;
    if (focus) requestAnimationFrame(() => questions[step]?.control?.focus({ preventScroll: true }));
  };

  const buildAssistant = (main) => {
    const head = document.createElement('section');
    head.className = 'ml-calc-assistant';
    head.setAttribute('aria-label', 'Progreso de la calculadora');
    head.innerHTML = '<div class="ml-calc-assistant-head"><span class="ml-calc-assistant-kicker">Paso a paso</span><span class="ml-calc-assistant-count" data-orbita-calc-count></span></div><div class="ml-calc-assistant-track" aria-hidden="true"><span class="ml-calc-assistant-progress" data-orbita-calc-progress></span></div><p class="ml-calc-assistant-copy">Una pregunta a la vez. Puedes volver atrás sin perder lo que ya capturaste.</p>';
    main.insertBefore(head, currentRoot);
    assistant = head;

    const nav = document.createElement('div');
    nav.className = 'ml-calc-flow-actions';
    nav.innerHTML = '<button type="button" class="ml-calc-flow-back" data-orbita-calc-back>← Atrás</button><button type="button" class="ml-calc-flow-next" data-orbita-calc-next>Siguiente →</button>';
    currentRoot.insertAdjacentElement('afterend', nav);
    nav.querySelector('[data-orbita-calc-back]').addEventListener('click', () => { step -= 1; renderStep({ focus: true }); });
    nav.querySelector('[data-orbita-calc-next]').addEventListener('click', () => { step += 1; renderStep({ focus: true }); });
    actions = nav;
  };
  const enhanceCalculator = () => {
    syncSection();
    if (html.dataset.orbitaSection !== 'calculadoras' || !html.classList.contains('ml-orbita-enabled')) return;
    const main = document.querySelector('.calculator-main');
    if (!main) return;
    const candidate = main.querySelector(':scope > form, :scope > div:first-child');
    if (!candidate) return;

    if (candidate !== currentRoot) {
      assistant?.remove();
      actions?.remove();
      currentRoot = candidate;
      step = 0;
      questions = buildQuestions(currentRoot);
      if (!questions.length) return;
      addExamples(questions);
      primaryAction = [...currentRoot.querySelectorAll('.ml-btn')].find((button) => !button.closest('.ml-result')) || null;
      if (primaryAction) primaryAction.dataset.orbitaPrimaryAction = 'true';
      buildAssistant(main);
    } else {
      questions = buildQuestions(currentRoot);
      addExamples(questions);
    }
    markPrimaryResult(currentRoot);
    renderStep();
  };

  let queued = false;
  const queueEnhance = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; enhanceCalculator(); });
  };
  const observer = new MutationObserver(queueEnhance);
  observer.observe(document.body, { childList: true, subtree: true });
  addEventListener('popstate', queueEnhance);
  addEventListener('hashchange', queueEnhance);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', queueEnhance, { once: true });
  else queueEnhance();
})();
