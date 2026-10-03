(() => {
  'use strict';

  const html = document.documentElement;
  const params = new URLSearchParams(location.search);
  if (html.classList.contains('ml-orbita-embed') || params.get('embed') === '1') return;

  const PENSION_PATH = /^\/calculadoras\/pension-imss\/?$/;
  const HEADER_OFFSET = 82;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  const syncSection = () => {
    html.dataset.orbitaSection = sectionForPath();
    if (PENSION_PATH.test(location.pathname)) html.dataset.orbitaProtected = 'pension';
    else delete html.dataset.orbitaProtected;
  };
  syncSection();

  let currentMain = null;
  let currentRoot = null;
  let formHost = null;
  let questions = [];
  let step = 0;
  let assistant = null;
  let actions = null;
  let primaryAction = null;
  let intro = null;
  let editing = false;
  let observer = null;
  let observerTarget = null;
  let queued = false;

  const setText = (node, value) => {
    if (node && node.textContent !== value) node.textContent = value;
  };

  const observeCalculator = () => {
    if (!observer || !observerTarget) return;
    observer.observe(observerTarget, { childList: true, subtree: true });
  };

  const withObserverPaused = (callback) => {
    const shouldResume = Boolean(observer && observerTarget);
    if (shouldResume) observer.disconnect();
    try { return callback(); }
    finally { if (shouldResume) observeCalculator(); }
  };

  const scrollQuestionIntoView = (question) => {
    const target = question?.nodes?.find((node) => node instanceof HTMLElement) || question?.control;
    if (!(target instanceof HTMLElement)) return;
    target.style.scrollMarginTop = `${HEADER_OFFSET}px`;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    requestAnimationFrame(() => question.control?.focus?.({ preventScroll: true }));
  };

  const isInsideResult = (node) => Boolean(node.closest('.ml-result'));
  const labelFor = (root, control) => {
    if (!control.id) return control.closest('label');
    return [...root.querySelectorAll('label')].find((label) => label.htmlFor === control.id) || control.closest('label') || null;
  };

  const buildQuestions = (root) => {
    const seen = new Set();
    const list = [];
    const controls = [...root.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea')]
      .filter((control) => !isInsideResult(control) && !control.closest('[data-orbita-ignore-question]'));

    for (const control of controls) {
      let nodes = [];
      if (control.type === 'checkbox' || control.type === 'radio') {
        const host = control.closest('label') || control.parentElement;
        if (host) nodes = [host];
      } else if (control.tagName === 'SELECT') {
        const label = labelFor(root, control);
        const host = control.parentElement;
        nodes = host && label && host.contains(label) ? [host] : [label, control].filter(Boolean);
      } else {
        const host = control.parentElement;
        if (host) nodes = [host];
      }
      const key = nodes[0];
      if (!key || seen.has(key)) continue;
      seen.add(key);
      nodes.forEach((node) => {
        if (node.getAttribute('data-orbita-question') !== 'true') node.setAttribute('data-orbita-question', 'true');
      });
      list.push({ control, nodes });
    }
    return list;
  };

  const setReactInputValue = (input, value) => {
    const proto = input instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) setter.call(input, value);
    else input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const moneyField = (control, nodes) => {
    const text = `${labelFor(currentRoot, control)?.textContent || ''} ${nodes[0]?.textContent || ''}`.toLocaleLowerCase('es-MX');
    return /(salario|sueldo|ingreso|monto|bruto|neto|mensual|cr[eé]dito|ahorro|pago|precio|valor|pesos|\$)/i.test(text);
  };

  const exampleValues = (control, nodes) => {
    const placeholder = control.getAttribute('placeholder') || '';
    const match = placeholder.match(/Ej:\s*([$\d.,-]+)/i);
    const parsed = match ? Number(match[1].replace(/[^0-9.-]/g, '')) : NaN;
    if (moneyField(control, nodes)) {
      if (Number.isFinite(parsed) && parsed > 0) {
        const round = (value) => Math.max(500, Math.round(value / 500) * 500);
        return [...new Set([round(parsed * .67), round(parsed), round(parsed * 1.67), round(parsed * 2.67)])].slice(0, 4);
      }
      return [10000, 15000, 25000, 40000];
    }
    return Number.isFinite(parsed) ? [parsed] : [];
  };

  const addExamples = (list) => {
    for (const { control, nodes } of list) {
      if (control.type !== 'number' || control.dataset.orbitaExampleReady === '1') continue;
      const values = exampleValues(control, nodes);
      if (!values.length) continue;
      const host = nodes[0];
      if (!(host instanceof HTMLElement) || host.tagName === 'LABEL') continue;

      const wrap = document.createElement('div');
      wrap.className = 'ml-calc-examples';
      wrap.setAttribute('aria-label', 'Montos de ejemplo');
      for (const value of values) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ml-calc-example';
        button.textContent = moneyField(control, nodes)
          ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value)
          : String(value);
        button.addEventListener('click', () => {
          setReactInputValue(control, String(value));
          control.focus({ preventScroll: true });
        });
        wrap.appendChild(button);
      }
      host.appendChild(wrap);
      control.dataset.orbitaExampleReady = '1';
    }
  };

  const glossary = {
    ISR: 'Impuesto Sobre la Renta: impuesto federal que puede retenerse o pagarse sobre ciertos ingresos.',
    UMA: 'Unidad de Medida y Actualización: referencia en pesos que se usa para calcular distintos conceptos legales y administrativos.',
    RESICO: 'Régimen Simplificado de Confianza: régimen fiscal con reglas y tasas propias para personas que cumplen sus requisitos.',
    PTU: 'Participación de los Trabajadores en las Utilidades: reparto de una parte de las utilidades de la empresa entre trabajadores con derecho.',
    SBC: 'Salario Base de Cotización: base usada por el IMSS para calcular cuotas y prestaciones conforme a las reglas aplicables.'
  };

  const addTermHelp = (list) => {
    for (const { control, nodes } of list) {
      const label = labelFor(currentRoot, control) || nodes[0]?.querySelector?.('label');
      if (!(label instanceof HTMLElement) || label.dataset.orbitaGlossaryReady === '1') continue;
      const upper = label.textContent.toUpperCase();
      const term = Object.keys(glossary).find((key) => upper.includes(key));
      if (!term) continue;
      const details = document.createElement('details');
      details.className = 'orb-term-help';
      details.setAttribute('data-orbita-ignore-question', 'true');
      details.innerHTML = `<summary>¿Qué es?</summary><p><strong>${term}</strong>. ${glossary[term]}</p>`;
      label.insertAdjacentElement('afterend', details);
      label.dataset.orbitaGlossaryReady = '1';
    }
  };

  const dedupeCases = () => {
    if (!currentMain) return;
    const seen = new Set();
    currentMain.querySelectorAll('.ml-case').forEach((node) => {
      const slug = node.dataset.caseSlug || node.getAttribute('data-case-slug') || node.textContent.trim().replace(/\s+/g, ' ').slice(0, 180);
      if (seen.has(slug)) node.remove();
      else seen.add(slug);
    });
  };

  const markPrimaryResult = (root) => {
    const result = root.querySelector('.ml-result');
    if (!result) return null;
    const rows = [...result.children].filter((node) => node.querySelectorAll?.(':scope > span').length >= 2);
    const strong = rows.filter((row) => {
      const spans = row.querySelectorAll(':scope > span');
      const weight = Number.parseInt(getComputedStyle(spans[spans.length - 1]).fontWeight, 10);
      return Number.isFinite(weight) && weight >= 600;
    });
    const money = strong.find((row) => row.querySelector(':scope > span:last-child')?.textContent.includes('$'))
      || rows.find((row) => row.querySelector(':scope > span:last-child')?.textContent.includes('$'));
    const primary = money || strong[0] || rows.at(-1);
    if (primary) primary.dataset.orbitaPrimaryResult = 'true';
    return { result, primary };
  };

  const splitMoneyCents = (node) => {
    if (!(node instanceof HTMLElement) || node.dataset.orbitaMoneyReady === '1') return;
    const text = node.textContent.trim();
    const match = text.match(/^(.*?\$\s*[\d,]+)(\.\d{2})(.*)$/);
    if (!match) return;
    node.textContent = '';
    node.append(document.createTextNode(match[1]));
    const cents = document.createElement('span');
    cents.className = 'orb-money-cents';
    cents.textContent = match[2];
    node.append(cents);
    if (match[3]) node.append(document.createTextNode(match[3]));
    node.dataset.orbitaMoneyReady = '1';
  };

  const routeNext = () => {
    const slug = location.pathname.split('/').filter(Boolean).at(-1) || '';
    const routes = {
      finiquito: ['/aprende/finiquito-vs-liquidacion', 'Entender finiquito vs. liquidación'],
      liquidacion: ['/aprende/finiquito-vs-liquidacion', 'Entender finiquito vs. liquidación'],
      aguinaldo: ['/aprende/aguinaldo-bruto-neto', 'Entender tu aguinaldo'],
      isr: ['/aprende/leer-recibo-nomina', 'Leer tu recibo de nómina'],
      resico: ['/aprende/resico-ingresos-cobrados', 'Entender ingresos cobrados en RESICO'],
      vacaciones: ['/aprende/vacaciones-prima-vacacional', 'Entender vacaciones y prima vacacional']
    };
    return routes[slug] || ['/aprende', 'Seguir aprendiendo'];
  };

  const resultPhrase = () => {
    const slug = location.pathname.split('/').filter(Boolean).at(-1) || '';
    if (slug === 'isr' || slug === 'resico') return 'Impuesto aproximado';
    if (slug === 'bruto-a-neto') return 'Tu neto aproximado';
    if (slug === 'infonavit') return 'Tu escenario aproximado';
    return 'Te toca aproximadamente';
  };

  const ensureResultTools = () => {
    if (!currentRoot || PENSION_PATH.test(location.pathname)) return;
    const marked = markPrimaryResult(currentRoot);
    if (!marked) return;
    const { result, primary } = marked;
    const amountNode = primary?.querySelector(':scope > span:last-child');
    const rawAmount = amountNode?.textContent.trim() || '';
    splitMoneyCents(amountNode);

    if (!result.querySelector('[data-orbita-result-head]') && rawAmount) {
      const head = document.createElement('div');
      head.className = 'orb-result-head';
      head.dataset.orbitaResultHead = 'true';
      const label = document.createElement('span');
      label.textContent = resultPhrase();
      const strong = document.createElement('strong');
      strong.textContent = rawAmount;
      splitMoneyCents(strong);
      head.append(label, strong);
      result.insertBefore(head, result.firstChild);
    }

    let tools = result.querySelector('[data-orbita-result-tools]');
    if (!tools) {
      tools = document.createElement('div');
      tools.className = 'orb-result-tools';
      tools.dataset.orbitaResultTools = 'true';

      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'orb-result-edit';
      edit.textContent = 'Editar respuestas';
      edit.addEventListener('click', () => {
        editing = true;
        step = 0;
        renderStep({ focus: true });
      });

      const share = document.createElement('a');
      share.className = 'orb-result-share';
      share.target = '_blank';
      share.rel = 'noopener noreferrer';
      share.textContent = 'Compartir por WhatsApp';
      const shareText = `Mi resultado en MiLana: ${rawAmount || 'revisa el cálculo'} — ${location.href}`;
      share.href = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

      const [href, label] = routeNext();
      const next = document.createElement('a');
      next.className = 'orb-result-next';
      next.href = href;
      next.innerHTML = `<span>Siguiente paso de tu ruta</span><strong>${label} →</strong>`;
      tools.append(edit, share, next);
      result.appendChild(tools);
    } else {
      const share = tools.querySelector('.orb-result-share');
      if (share && rawAmount) {
        share.href = `https://wa.me/?text=${encodeURIComponent(`Mi resultado en MiLana: ${rawAmount} — ${location.href}`)}`;
      }
    }

    if (!result.dataset.orbitaResultReady) result.dataset.orbitaResultReady = '1';
  };

  const moveActionsAfterActiveQuestion = () => {
    if (!actions || !formHost || !questions[step]) return;
    const activeNodes = questions[step].nodes.filter((node) => node?.isConnected);
    const last = activeNodes.at(-1);
    if (last && formHost.contains(last) && last.parentNode) last.insertAdjacentElement('afterend', actions);
    else formHost.appendChild(actions);
  };

  const renderStep = ({ focus = false } = {}) => {
    if (!currentRoot || !questions.length || !assistant || !actions) return;
    step = Math.max(0, Math.min(step, questions.length - 1));

    withObserverPaused(() => {
      questions.forEach((question, index) => {
        const active = index === step;
        question.nodes.forEach((node) => {
          if (node.hidden === active) node.hidden = !active;
          const hidden = String(!active);
          if (node.getAttribute('aria-hidden') !== hidden) node.setAttribute('aria-hidden', hidden);
        });
      });

      if (intro) {
        const showIntro = step === 0;
        if (intro.hidden === showIntro) intro.hidden = !showIntro;
        intro.dataset.orbitaIntro = 'true';
      }

      const count = assistant.querySelector('[data-orbita-calc-count]');
      const progress = assistant.querySelector('[data-orbita-calc-progress]');
      const donut = assistant.querySelector('[data-orbita-donut]');
      const percent = ((step + 1) / questions.length) * 100;
      setText(count, `Pregunta ${step + 1} de ${questions.length}`);
      if (progress && progress.style.width !== `${percent}%`) progress.style.width = `${percent}%`;
      if (donut) {
        donut.style.setProperty('--orb-chart-fill', `${percent}%`);
        setText(donut.querySelector('span'), `${step + 1}/${questions.length}`);
        donut.setAttribute('aria-label', `Progreso: pregunta ${step + 1} de ${questions.length}`);
      }

      const back = actions.querySelector('[data-orbita-calc-back]');
      const next = actions.querySelector('[data-orbita-calc-next]');
      if (back) back.hidden = step === 0;
      if (next) next.hidden = step === questions.length - 1;
      if (primaryAction) primaryAction.hidden = step !== questions.length - 1;

      const result = currentRoot.querySelector('.ml-result');
      if (result) result.hidden = editing;
      actions.hidden = Boolean(result) && !editing;
      if (!actions.hidden) moveActionsAfterActiveQuestion();

      dedupeCases();
      ensureResultTools();
    });

    if (focus) requestAnimationFrame(() => scrollQuestionIntoView(questions[step]));
  };

  const buildAssistant = (main) => {
    const head = document.createElement('section');
    head.className = 'ml-calc-assistant';
    head.setAttribute('aria-label', 'Progreso de la calculadora');
    head.innerHTML = '<div class="ml-calc-assistant-head"><div><span class="ml-calc-assistant-kicker">Paso a paso</span><span class="ml-calc-assistant-count" data-orbita-calc-count></span></div><button type="button" class="orb-donut" data-orbita-donut aria-label="Progreso"><span></span></button></div><div class="ml-calc-assistant-track" aria-hidden="true"><span class="ml-calc-assistant-progress" data-orbita-calc-progress></span></div><p class="ml-calc-assistant-copy">Una pregunta a la vez. Puedes volver atrás sin perder lo que ya capturaste.</p>';
    main.insertBefore(head, currentRoot);
    assistant = head;

    const nav = document.createElement('div');
    nav.className = 'ml-calc-flow-actions';
    nav.innerHTML = '<button type="button" class="ml-calc-flow-back" data-orbita-calc-back>← Atrás</button><button type="button" class="ml-calc-flow-next" data-orbita-calc-next>Siguiente →</button>';
    nav.querySelector('[data-orbita-calc-back]').addEventListener('click', () => {
      step -= 1;
      renderStep({ focus: true });
    });
    nav.querySelector('[data-orbita-calc-next]').addEventListener('click', () => {
      step += 1;
      renderStep({ focus: true });
    });
    actions = nav;
    formHost.appendChild(nav);

    formHost.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' || event.defaultPrevented || event.isComposing) return;
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || ['checkbox', 'radio', 'submit', 'button'].includes(target.type)) return;
      if (step >= questions.length - 1) return;
      event.preventDefault();
      step += 1;
      renderStep({ focus: true });
    });
  };

  const resetCalculatorState = () => {
    observer?.disconnect();
    observerTarget = null;
    assistant?.remove();
    actions?.remove();
    currentMain = null;
    currentRoot = null;
    formHost = null;
    questions = [];
    step = 0;
    assistant = null;
    actions = null;
    primaryAction = null;
    intro = null;
    editing = false;
  };

  const enhanceCalculator = () => {
    syncSection();
    if (html.dataset.orbitaSection !== 'calculadoras' || !html.classList.contains('ml-orbita-enabled')) return;
    if (PENSION_PATH.test(location.pathname)) {
      resetCalculatorState();
      return;
    }

    const main = document.querySelector('.calculator-main');
    if (!main) return;
    const candidate = main.querySelector(':scope > form, :scope > div:first-child');
    if (!candidate) return;

    if (candidate !== currentRoot) {
      resetCalculatorState();
      currentMain = main;
      currentRoot = candidate;
      formHost = currentRoot.matches('form') ? currentRoot : currentRoot.querySelector('form') || currentRoot;
      observerTarget = main;
      observer = new MutationObserver(queueEnhance);
      questions = buildQuestions(currentRoot);
      if (!questions.length) {
        observeCalculator();
        return;
      }
      intro = currentRoot.querySelector('.calc-intro') || currentRoot.querySelector(':scope > p:first-child');
      addExamples(questions);
      addTermHelp(questions);
      primaryAction = [...formHost.querySelectorAll('.ml-btn, button[type="submit"]')]
        .find((button) => !button.closest('.ml-result') && !button.closest('.ml-case')) || null;
      if (primaryAction) {
        primaryAction.dataset.orbitaPrimaryAction = 'true';
        primaryAction.addEventListener('click', () => { editing = false; }, { capture: true });
      }
      buildAssistant(main);
      observeCalculator();
    } else {
      withObserverPaused(() => {
        questions = buildQuestions(currentRoot);
        addExamples(questions);
        addTermHelp(questions);
      });
    }

    withObserverPaused(() => {
      dedupeCases();
      ensureResultTools();
    });
    renderStep();
  };

  function queueEnhance() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      enhanceCalculator();
    });
  }

  const routeChanged = () => {
    syncSection();
    resetCalculatorState();
    queueEnhance();
  };

  addEventListener('popstate', routeChanged);
  addEventListener('hashchange', routeChanged);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', queueEnhance, { once: true });
  else queueEnhance();
})();
