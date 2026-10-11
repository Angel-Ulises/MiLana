(() => {
  'use strict';

  const html = document.documentElement;
  const params = new URLSearchParams(location.search);
  if (html.classList.contains('ml-orbita-embed') || params.get('embed') === '1') return;

  const PENSION_PATH = /^\/calculadoras\/pension-imss\/?$/;
  const HEADER_OFFSET = 82;
  const PURPOSE_MEDIA = matchMedia('(max-width: 760px)');
  const COMPACT_PURPOSES = {
    finiquito: 'Estima tu finiquito bruto 2026 y separa los conceptos que ya generaste al terminar la relación laboral.',
    liquidacion: 'Estima un escenario de liquidación 2026 y separa prestaciones e indemnizaciones según el supuesto declarado.',
    aguinaldo: 'Proyecta tu aguinaldo bruto 2026 según salario, periodo trabajado y días de prestación.',
    vacaciones: 'Estima tus días de vacaciones y prima vacacional según antigüedad y los datos que captures.',
    isr: 'Estima la retención mensual de ISR 2026 sobre el ingreso gravable que declares.',
    resico: 'Estima el ISR mensual de RESICO con ingresos efectivamente cobrados, dentro del alcance indicado.',
    ptu: 'Estima una participación individual de PTU con utilidad repartible, días trabajados y salario capturados.',
    'bruto-a-neto': 'Estima tu sueldo neto separando sueldo bruto, base de ISR y SBC para IMSS.',
    infonavit: 'Simula la evolución de un crédito Infonavit con saldo, pago, tasa y los datos que captures.'
  };
  const QUESTION_SELECTOR = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // En pantallas táctiles, enfocar un campo de texto abre el teclado y su barra de sugerencias:
  // al cambiar de pregunta o tocar un monto de ejemplo eso destellaba. Ahí el foco va a la etiqueta.
  const touchInput = matchMedia('(pointer: coarse)').matches;
  const opensKeyboard = (control) => control instanceof HTMLTextAreaElement
    || (control instanceof HTMLInputElement && !['checkbox', 'radio', 'button', 'submit', 'range', 'color', 'file'].includes(control.type));

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
  // Dirección del último cambio de paso: la transición entra por la derecha al avanzar y por la izquierda al volver.
  let lastRenderedStep = null;
  let questionTotal = 0;
  let step = 0;
  let assistant = null;
  let actions = null;
  let primaryAction = null;
  let intro = null;
  let introRepeatsHero = false;
  let editing = false;
  let observer = null;
  let observerTarget = null;
  let queued = false;

  const setText = (node, value) => {
    if (node && node.textContent !== value) node.textContent = value;
  };

  const normalizeCopy = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-MX')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const syncCalculatorPurpose = () => {
    const purpose = document.querySelector('.calculator-purpose');
    if (!(purpose instanceof HTMLElement)) {
      html.classList.remove('orb-purpose-ready');
      return;
    }
    if (!purpose.dataset.orbitaFullPurpose) purpose.dataset.orbitaFullPurpose = purpose.textContent.trim();
    const slug = location.pathname.match(/^\/calculadoras\/([^/]+)\/?$/)?.[1] || '';
    const compact = COMPACT_PURPOSES[slug];
    if (PURPOSE_MEDIA.matches && compact) {
      setText(purpose, compact);
      html.classList.add('orb-purpose-ready');
    } else {
      setText(purpose, purpose.dataset.orbitaFullPurpose);
      html.classList.remove('orb-purpose-ready');
    }
  };

  const introDuplicatesHero = (node) => {
    if (!(node instanceof HTMLElement)) return false;
    const introText = normalizeCopy(node.textContent);
    const heroText = normalizeCopy(document.querySelector('.calculator-hero-copy')?.textContent);
    if (introText.length < 55 || heroText.length < 55) return false;
    if (heroText.includes(introText) || introText.includes(heroText)) return true;
    const words = introText.split(' ').filter((word) => word.length > 3).slice(0, 14);
    if (words.length < 6) return false;
    const heroWords = new Set(heroText.split(' '));
    const overlap = words.filter((word) => heroWords.has(word)).length;
    return overlap / words.length >= .72;
  };

  const liveObserverTarget = () => document.getElementById('root');

  const observeCalculator = () => {
    if (!observer) return;
    const target = liveObserverTarget();
    if (!target) return;
    if (observerTarget !== target) {
      observer.disconnect();
      observerTarget = target;
    }
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
    requestAnimationFrame(() => focusQuestion(question));
  };

  const focusQuestion = (question) => {
    const control = question?.control;
    if (!control?.focus) return;
    if (!touchInput || !opensKeyboard(control)) { control.focus({ preventScroll: true }); return; }
    const label = labelFor(currentRoot || document, control);
    if (!(label instanceof HTMLElement)) return;
    if (!label.hasAttribute('tabindex')) label.setAttribute('tabindex', '-1');
    label.dataset.orbitaQuestionFocus = 'true';
    label.focus({ preventScroll: true });
  };

  const isInsideResult = (node) => Boolean(node.closest('.ml-result'));
  const labelFor = (root, control) => {
    if (!control.id) return control.closest('label');
    return [...root.querySelectorAll('label')].find((label) => label.htmlFor === control.id) || control.closest('label') || null;
  };

  const questionControlCount = (host) => host?.querySelectorAll?.(QUESTION_SELECTOR)?.length || 0;
  const isQuestionHostSafe = (host, root) => Boolean(
    host &&
    host !== root &&
    host !== formHost &&
    host.tagName !== 'FORM' &&
    questionControlCount(host) <= 1
  );

  const questionNodes = (root, control) => {
    const label = labelFor(root, control);
    const host = control.parentElement;
    if (control.type === 'checkbox' || control.type === 'radio') {
      const labeledHost = control.closest('label');
      if (isQuestionHostSafe(labeledHost, root)) return [labeledHost];
      if (isQuestionHostSafe(host, root)) return [host];
      return [label, control].filter(Boolean);
    }
    if (isQuestionHostSafe(host, root)) {
      if (label && host.contains(label)) return [host];
      if (control.tagName !== 'SELECT' && control.tagName !== 'TEXTAREA') return [host];
    }
    return [label, control].filter(Boolean);
  };

  const buildQuestions = (root) => {
    const seen = new Set();
    const list = [];
    const controls = [...root.querySelectorAll(QUESTION_SELECTOR)]
      .filter((control) => !isInsideResult(control) && !control.closest('[data-orbita-ignore-question]'));

    for (const control of controls) {
      const nodes = questionNodes(root, control);
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
    for (const question of list) {
      const { control, nodes } = question;
      if (control.type !== 'number' || control.dataset.orbitaExampleReady === '1') continue;
      const values = exampleValues(control, nodes);
      if (!values.length) continue;
      const host = nodes.find((node) => node instanceof HTMLElement && node.tagName !== 'LABEL' && node !== control);

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
          if (!touchInput || !opensKeyboard(control)) control.focus({ preventScroll: true });
        });
        wrap.appendChild(button);
      }
      if (host instanceof HTMLElement) host.appendChild(wrap);
      else control.insertAdjacentElement('afterend', wrap);
      if (!nodes.includes(wrap)) nodes.push(wrap);
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

  const hasNativeWhatsAppShare = (result) => [...result.querySelectorAll('a,button')]
    .some((node) => /Compartir\s+por\s+WhatsApp/i.test(node.textContent || ''));

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
      tools.appendChild(edit);

      if (!hasNativeWhatsAppShare(result)) {
        const share = document.createElement('a');
        share.className = 'orb-result-share';
        share.target = '_blank';
        share.rel = 'noopener noreferrer';
        share.textContent = 'Compartir por WhatsApp';
        const shareText = `Mi resultado en MiLana: ${rawAmount || 'revisa el cálculo'} — ${location.href}`;
        share.href = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        tools.appendChild(share);
      }

      const [href, label] = routeNext();
      const next = document.createElement('a');
      next.className = 'orb-result-next';
      next.href = href;
      next.innerHTML = `<span>Siguiente paso de tu ruta</span><strong>${label} →</strong>`;
      tools.appendChild(next);
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
      const result = currentRoot.querySelector('.ml-result');
      const showingResult = Boolean(result) && !editing;

      // Sin animación en la carga: solo cuando la persona cambia de pregunta.
      if (lastRenderedStep !== null && lastRenderedStep !== step) {
        const dir = step > lastRenderedStep ? 'fwd' : 'back';
        if (currentRoot.dataset.orbitaStepDir !== dir) currentRoot.dataset.orbitaStepDir = dir;
        if (currentRoot.dataset.orbitaStepAnimate !== 'true') currentRoot.dataset.orbitaStepAnimate = 'true';
      }
      lastRenderedStep = step;

      questions.forEach((question, index) => {
        const active = !showingResult && index === step;
        question.nodes.forEach((node) => {
          if (node instanceof HTMLElement && node.dataset.orbitaStep !== 'true') node.dataset.orbitaStep = 'true';
          if (node.hidden === active) node.hidden = !active;
          const hidden = String(!active);
          if (node.getAttribute('aria-hidden') !== hidden) node.setAttribute('aria-hidden', hidden);
        });
      });

      if (intro) {
        const showIntro = !showingResult && step === 0 && !introRepeatsHero;
        if (intro.hidden === showIntro) intro.hidden = !showIntro;
        intro.dataset.orbitaIntro = 'true';
        intro.dataset.orbitaDuplicateIntro = String(introRepeatsHero);
      }

      const total = Math.max(questionTotal, 1);
      const count = assistant.querySelector('[data-orbita-calc-count]');
      const progress = assistant.querySelector('[data-orbita-calc-progress]');
      const donut = assistant.querySelector('[data-orbita-donut]');
      const percent = Math.min(100, ((step + 1) / total) * 100);
      setText(count, `Pregunta ${step + 1} de ${total}`);
      if (progress && progress.style.width !== `${percent}%`) progress.style.width = `${percent}%`;
      if (donut) {
        donut.style.setProperty('--orb-chart-fill', `${percent}%`);
        setText(donut.querySelector('span'), `${step + 1}/${total}`);
        donut.setAttribute('aria-label', `Progreso: pregunta ${step + 1} de ${total}`);
      }

      const back = actions.querySelector('[data-orbita-calc-back]');
      const next = actions.querySelector('[data-orbita-calc-next]');
      if (back) back.hidden = step === 0 || showingResult;
      if (next) next.hidden = step === questions.length - 1 || showingResult;
      if (primaryAction) primaryAction.hidden = showingResult || step !== questions.length - 1;

      if (result) result.hidden = editing;
      actions.hidden = showingResult;
      if (!actions.hidden) moveActionsAfterActiveQuestion();

      dedupeCases();
      ensureResultTools();
    });

    if (focus && !currentRoot.querySelector('.ml-result:not([hidden])')) {
      requestAnimationFrame(() => scrollQuestionIntoView(questions[step]));
    }
  };

  const questionLabelText = (question) => normalizeCopy(
    labelFor(currentRoot, question.control)?.textContent || question.nodes.map((node) => node.textContent || '').join(' ')
  );

  const questionIndexForError = () => {
    const errorText = normalizeCopy(currentRoot?.querySelector('.calc-error,[role="alert"]')?.textContent);
    if (errorText) {
      if (errorText.includes('salario minimo')) {
        const index = questions.findIndex((question) => questionLabelText(question).includes('salario minimo'));
        if (index >= 0) return index;
      }
      if (errorText.includes('vacaciones') && errorText.includes('anuales')) {
        const index = questions.findIndex((question) => {
          const label = questionLabelText(question);
          return label.includes('vacaciones') && label.includes('anuales');
        });
        if (index >= 0) return index;
      }

      const prefix = errorText.split(' captura ')[0].split(' revisa ')[0].split(' selecciona ')[0].trim();
      const tokens = prefix.split(' ').filter((word) => word.length > 3);
      let best = { index: -1, matches: 0, exact: 0 };
      questions.forEach((question, index) => {
        const label = questionLabelText(question);
        const matches = tokens.filter((word) => label.includes(word)).length;
        if (tokens.length && matches === tokens.length) {
          best = { index, matches, exact: tokens.length + 1 };
          return;
        }
        const exact = prefix && label.includes(prefix) ? matches + 1 : matches;
        if (exact > best.exact || (exact === best.exact && matches > best.matches)) best = { index, matches, exact };
      });
      if (best.index >= 0 && best.matches >= Math.max(1, Math.ceil(tokens.length * .5))) return best.index;
    }

    const invalidIndex = questions.findIndex(({ control }) => {
      try { return control.matches(':invalid'); }
      catch { return false; }
    });
    if (invalidIndex >= 0) return invalidIndex;

    return questions.findIndex((question) => {
      const { control } = question;
      if (!(control instanceof HTMLInputElement) || !['number', 'date'].includes(control.type)) return false;
      if (questionLabelText(question).includes('opcional')) return false;
      const value = control.value.trim();
      if (!value) return true;
      if (control.type === 'number') return !Number.isFinite(control.valueAsNumber);
      if (control.type === 'date') return Number.isNaN(Date.parse(value));
      return false;
    });
  };

  const recoverValidationStep = () => {
    if (!currentRoot || currentRoot.querySelector('.ml-result')) return false;
    const index = questionIndexForError();
    if (index < 0) return false;
    editing = true;
    step = index;
    renderStep({ focus: true });
    return true;
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
    formHost.addEventListener('invalid', (event) => {
      const index = questions.findIndex((question) => question.control === event.target);
      if (index < 0) return;
      event.preventDefault();
      editing = true;
      step = index;
      renderStep({ focus: true });
    }, true);
    formHost.addEventListener('submit', () => {
      setTimeout(recoverValidationStep, 0);
      setTimeout(recoverValidationStep, 40);
    }, true);
  };

  const resetCalculatorState = () => {
    assistant?.remove();
    actions?.remove();
    currentMain = null;
    currentRoot = null;
    formHost = null;
    questions = [];
    lastRenderedStep = null;
    questionTotal = 0;
    step = 0;
    assistant = null;
    actions = null;
    primaryAction = null;
    intro = null;
    introRepeatsHero = false;
    editing = false;
  };

  const enhanceCalculator = () => {
    syncSection();
    if (html.dataset.orbitaSection !== 'calculadoras' || !html.classList.contains('ml-orbita-enabled')) return;
    if (PENSION_PATH.test(location.pathname)) {
      resetCalculatorState();
      html.classList.remove('orb-purpose-ready');
      return;
    }

    syncCalculatorPurpose();
    const main = document.querySelector('.calculator-main');
    if (!main) return;
    const candidate = main.querySelector(':scope > form, :scope > div:first-child');
    if (!candidate) return;

    if (candidate !== currentRoot) {
      resetCalculatorState();
      currentMain = main;
      currentRoot = candidate;
      formHost = currentRoot.matches('form') ? currentRoot : currentRoot.querySelector('form') || currentRoot;
      questions = buildQuestions(currentRoot);
      questionTotal = questions.length;
      if (!questions.length) {
        observeCalculator();
        return;
      }
      intro = currentRoot.querySelector('.calc-intro') || currentRoot.querySelector(':scope > p:first-child');
      introRepeatsHero = introDuplicatesHero(intro);
      if (introRepeatsHero && intro) intro.hidden = true;
      addExamples(questions);
      addTermHelp(questions);
      primaryAction = [...formHost.querySelectorAll('.ml-btn, button[type="submit"]')]
        .find((button) => !button.closest('.ml-result') && !button.closest('.ml-case')) || null;
      if (primaryAction) {
        primaryAction.dataset.orbitaPrimaryAction = 'true';
        primaryAction.addEventListener('click', () => {
          editing = false;
          setTimeout(recoverValidationStep, 0);
          setTimeout(recoverValidationStep, 40);
        }, { capture: true });
      }
      buildAssistant(main);
      observeCalculator();
    } else {
      withObserverPaused(() => {
        const refreshed = buildQuestions(currentRoot);
        if (refreshed.length) {
          questions = refreshed;
          // React puede añadir o retirar preguntas según una respuesta (p. ej. régimen LFT/SEP).
          // Mantén el contador y el paso sincronizados mientras el formulario siga en edición.
          if (!currentRoot.querySelector('.ml-result')) questionTotal = questions.length;
          step = Math.min(step, Math.max(questions.length - 1, 0));
        }
        addExamples(questions);
        addTermHelp(questions);
      });
    }

    withObserverPaused(() => {
      dedupeCases();
      ensureResultTools();
    });
    if (!currentRoot.querySelector('.ml-result') && currentRoot.querySelector('.calc-error,[role="alert"]')?.textContent.trim() && recoverValidationStep()) return;
    renderStep();
  };

  function queueEnhance() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      const disconnected = Boolean(currentMain || currentRoot) && (!currentMain?.isConnected || !currentRoot?.isConnected);
      if (disconnected) resetCalculatorState();
      observeCalculator();
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
  PURPOSE_MEDIA.addEventListener?.('change', queueEnhance);
  observer = new MutationObserver(queueEnhance);
  observeCalculator();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', queueEnhance, { once: true });
  else queueEnhance();
})();
