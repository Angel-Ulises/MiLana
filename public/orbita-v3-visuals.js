(() => {
  'use strict';
  const root = document.documentElement;
  if (root.classList.contains('ml-orbita-embed') || new URLSearchParams(location.search).get('embed') === '1') return;
  if (/^\/calculadoras\/pension-imss\/?$/.test(location.pathname)) return;

  const section = root.dataset.orbitaSection || '';
  const main = document.querySelector('main');
  if (!main || !['carreras', 'estados', 'finanzas', 'economia', 'aprende'].includes(section)) return;
  if (main.querySelector('[data-orbita-section-visual]')) return;

  const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value);
  const clean = (text) => String(text || '').replace(/\s+/g, ' ').trim();

  const card = (kicker, title, copy) => {
    const sectionEl = document.createElement('section');
    sectionEl.className = 'orb-section-visual';
    sectionEl.dataset.orbitaSectionVisual = section;
    const head = document.createElement('div');
    head.className = 'orb-section-visual-head';
    const left = document.createElement('div');
    left.innerHTML = `<span class="orb-section-visual-kicker">${kicker}</span><h2>${title}</h2><p>${copy}</p>`;
    const readout = document.createElement('div');
    readout.className = 'orb-chart-readout';
    readout.setAttribute('aria-live', 'polite');
    readout.textContent = 'Toca la gráfica para ver el dato';
    head.append(left, readout);
    sectionEl.appendChild(head);
    sectionEl._readout = readout;
    return sectionEl;
  };

  const insertVisual = (visual) => {
    const reserve = main.querySelector('[data-orbita-visual-reserve]');
    if (reserve) {
      reserve.replaceWith(visual);
      return;
    }
    const hero = main.querySelector(':scope > .career-hero,:scope > .profession-hero,:scope > .state-hero,:scope > .state-detail-hero,:scope > .finance-page-hero,:scope > .advisor-hero,:scope > .investment-hero,:scope > .economy-hero,:scope > .hubhead');
    if (hero) {
      hero.insertAdjacentElement('afterend', visual);
      return;
    }
    const h1 = main.querySelector('h1');
    const intro = h1?.nextElementSibling?.matches?.('p') ? h1.nextElementSibling : null;
    if (intro) intro.insertAdjacentElement('afterend', visual);
    else if (h1) h1.insertAdjacentElement('afterend', visual);
    else main.prepend(visual);
  };

  const collectMoneyRows = () => {
    const seen = new Set();
    const rows = [];
    const nodes = main.querySelectorAll('li,tr,article,.profession-metric,.career-rank-row,.cc-card');
    for (const node of nodes) {
      const text = clean(node.textContent);
      const match = text.match(/\$\s*([\d,.]+)(?:\s*(?:MXN|mensuales|\/mes))?/i);
      if (!match) continue;
      const value = Number(match[1].replace(/,/g, ''));
      if (!Number.isFinite(value) || value <= 0) continue;
      let label = clean(text.slice(0, match.index)).replace(/[—–:·-]+$/g, '').trim();
      if (!label) label = clean(node.querySelector('strong,h2,h3,td')?.textContent) || 'Dato visible';
      label = label.slice(0, 58);
      const key = `${label}|${value}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({ label, value });
      if (rows.length >= 6) break;
    }
    return rows;
  };

  const careersVisual = () => {
    const rows = collectMoneyRows();
    if (rows.length < 2) return null;
    const visual = card('Carreras', 'Rango de ingresos visible en esta página', 'Las barras usan únicamente cifras que ya aparecen en el contenido; no agregan un ranking nuevo ni predicen tu sueldo.');
    const wrap = document.createElement('div');
    wrap.className = 'orb-bar-chart';
    const min = Math.min(...rows.map((row) => row.value));
    const max = Math.max(...rows.map((row) => row.value));
    for (const row of rows) {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'orb-bar-row';
      const width = max === min ? 100 : 34 + ((row.value - min) / (max - min)) * 66;
      item.innerHTML = `<span class="orb-bar-label">${row.label}</span><span class="orb-bar-track"><span class="orb-bar-fill" style="--orb-bar-width:${width.toFixed(1)}%"></span></span><span class="orb-bar-value">${money(row.value)}</span>`;
      item.addEventListener('click', () => { visual._readout.textContent = `${row.label}: ${money(row.value)}`; });
      wrap.appendChild(item);
    }
    visual._readout.textContent = `${money(min)} – ${money(max)}`;
    visual.appendChild(wrap);
    return visual;
  };

  const stateVisual = () => {
    const links = [];
    const seen = new Set();
    main.querySelectorAll('a[href^="/estados/"]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (!/^\/estados\/[^/?#]+\/?$/.test(href) || href.includes('/comparar')) return;
      const label = clean(a.textContent).replace(/^Estado:\s*/i, '').split(' — ')[0].trim();
      if (!label || seen.has(href)) return;
      seen.add(href);
      links.push({ href, label });
    });
    if (links.length < 2) return null;
    const visual = card('Estados', 'México en mosaico', 'Explora las entidades disponibles. El mosaico es navegación visual: no colorea estados como mejores o peores.');
    const grid = document.createElement('div');
    grid.className = 'orb-state-mosaic';
    links.slice(0, 32).forEach(({ href, label }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'orb-state-tile';
      button.setAttribute('aria-label', `Ver ${label}`);
      button.textContent = label.split(/\s+/).map((part) => part[0]).join('').slice(0, 3).toUpperCase();
      button.addEventListener('click', () => {
        grid.querySelectorAll('.is-active').forEach((n) => n.classList.remove('is-active'));
        button.classList.add('is-active');
        visual._readout.innerHTML = `<span>${label}</span> · <a href="${href}">Abrir estado →</a>`;
      });
      grid.appendChild(button);
    });
    visual._readout.textContent = `${Math.min(links.length, 32)} entidades disponibles`;
    visual.appendChild(grid);
    return visual;
  };

  const financeVisual = () => {
    const visual = card('Finanzas', 'Proyección para entender la ruta', 'Ahorro, CETES y vivienda se comportan distinto. Esta vista no inventa tasas ni rendimientos: te lleva a la herramienta que sí calcula cada caso.');
    const tabs = document.createElement('div');
    tabs.className = 'orb-projection-tabs';
    const chart = document.createElement('div');
    chart.className = 'orb-projection-chart';
    const stages = [['01', 'Hoy'], ['02', 'Aporta'], ['03', 'Revisa'], ['04', 'Meta']];
    for (const [number, label] of stages) {
      const stage = document.createElement('div');
      stage.className = 'orb-projection-stage';
      stage.innerHTML = `<span>${number}</span><strong>${label}</strong>`;
      chart.appendChild(stage);
    }
    const note = document.createElement('p');
    note.className = 'orb-projection-note';
    note.textContent = 'Visual conceptual, sin eje monetario: no representa un rendimiento ni una promesa de crecimiento.';

    const scenarios = [
      { label: 'Ahorro', href: '/finanzas/ahorro', text: 'Ahorro: define meta, ahorro actual y aportación mensual; la calculadora estima el tiempo sin asumir rendimiento.' },
      { label: 'CETES', href: '/finanzas/inversion/cetes', text: 'CETES: revisa la tasa y el plazo vigentes en la herramienta; este camino visual no sustituye ese dato.' },
      { label: 'Casa', href: '/finanzas/vivienda', text: 'Casa: ordena presupuesto, fondo, deuda y después compara el financiamiento.' }
    ];
    const set = (scenario, button) => {
      tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      visual._readout.innerHTML = `${scenario.text} <a href="${scenario.href}">Abrir →</a>`;
    };
    scenarios.forEach((scenario, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = scenario.label;
      button.setAttribute('aria-pressed', String(index === 0));
      button.addEventListener('click', () => set(scenario, button));
      tabs.appendChild(button);
      if (index === 0) requestAnimationFrame(() => set(scenario, button));
    });
    visual.append(tabs, chart, note);
    return visual;
  };

  const economySource = (text) => {
    if (/banxico|banco de m[eé]xico/i.test(text)) return 'Banxico';
    if (/inegi|inpc/i.test(text)) return 'INEGI';
    return clean(text).slice(0, 40) || 'Fuente visible';
  };

  const economyLabel = ({ title, dataLabel, source }) => {
    const text = `${title} ${dataLabel}`;
    if (source === 'Banxico' && /tasa objetivo|tasa de inter[eé]s/i.test(text)) return 'Tasa objetivo Banxico';
    if (source === 'INEGI' && /inflaci[oó]n|inpc/i.test(text)) return 'Inflación anual INEGI';
    if (source === 'INEGI' && /consumo/i.test(text)) return 'Consumo privado INEGI';
    return clean(`${dataLabel || title} · ${source}`).slice(0, 58);
  };

  const collectPercentages = () => {
    const values = [];
    const seen = new Set();
    const cards = [...main.querySelectorAll('.economy-card')];
    for (const node of cards) {
      const strong = node.querySelector('.economy-card-bottom strong');
      const match = clean(strong?.textContent).match(/^(-?\d{1,3}(?:\.\d{1,2})?)\s*%$/);
      if (!match) continue;
      const value = Number(match[1]);
      if (!Number.isFinite(value)) continue;
      const title = clean(node.querySelector('h2,h3')?.textContent);
      const dataLabel = clean(node.querySelector('.economy-card-bottom span')?.textContent);
      const source = economySource(node.textContent);
      const key = `${value}|${source}`;
      if (seen.has(key)) continue;
      seen.add(key);
      values.push({ label: economyLabel({ title, dataLabel, source }), value, source });
    }
    if (values.length) return values.slice(0, 8);

    const nodes = main.querySelectorAll('.economy-big-number,.economy-step,.economy-meta');
    for (const node of nodes) {
      const text = clean(node.textContent);
      const matches = [...text.matchAll(/(-?\d{1,3}(?:\.\d{1,2})?)\s*%/g)];
      for (const match of matches) {
        const value = Number(match[1]);
        if (!Number.isFinite(value)) continue;
        const title = clean(node.closest('article,section')?.querySelector('h1,h2,h3')?.textContent);
        const source = economySource(`${title} ${text}`);
        const key = `${value}|${source}`;
        if (seen.has(key)) continue;
        seen.add(key);
        values.push({ label: economyLabel({ title, dataLabel: '', source }), value, source });
        if (values.length >= 8) return values;
      }
    }
    return values;
  };

  const economyVisual = () => {
    const values = collectPercentages();
    if (values.length < 2) return null;
    const visual = card('Economía', 'Porcentajes visibles, separados', 'La gráfica solo reutiliza porcentajes presentes en esta página. Cada barra es un dato independiente: no representa una tendencia temporal.');
    const maxAbs = Math.max(...values.map((item) => Math.abs(item.value)), 1);
    const wrap = document.createElement('div');
    wrap.className = 'orb-economy-bars';
    for (const item of values) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'orb-economy-bar';
      const width = 18 + (Math.abs(item.value) / maxAbs) * 82;
      button.innerHTML = `<span class="orb-economy-bar-label">${item.label}</span><span class="orb-economy-bar-track"><span class="orb-economy-bar-fill" style="--orb-economy-width:${width.toFixed(1)}%"></span></span><span class="orb-economy-bar-value">${item.value}%</span>`;
      const show = () => { visual._readout.textContent = `${item.label}: ${item.value}%`; };
      button.addEventListener('click', show);
      button.addEventListener('focus', show);
      wrap.appendChild(button);
    }
    visual._readout.textContent = `${values.length} porcentajes visibles`;
    visual.appendChild(wrap);
    return visual;
  };

  const learnVisual = () => {
    const visual = card('Aprende', 'Un camino corto para decidir mejor', 'Las guías están pensadas para convertir una palabra difícil en una decisión que puedas explicar.');
    const path = document.createElement('div');
    path.className = 'orb-learn-path';
    const steps = [
      ['01', 'Lee', 'Entiende el concepto en lenguaje normal.'],
      ['02', 'Calcula', 'Pon tus propios números cuando aplique.'],
      ['03', 'Compara', 'Revisa escenarios y qué cambia entre ellos.'],
      ['04', 'Decide', 'Usa fuentes y supuestos para elegir tu siguiente paso.']
    ];
    steps.forEach(([number, title, copy]) => {
      const item = document.createElement('div');
      item.className = 'orb-learn-step';
      item.innerHTML = `<span>${number}</span><strong>${title}</strong><p>${copy}</p>`;
      path.appendChild(item);
    });
    visual._readout.textContent = '4 pasos · sin registro';
    visual.appendChild(path);
    return visual;
  };

  const fieldValue = (labelText) => {
    const field = [...main.querySelectorAll('.finance-field')].find((node) => clean(node.querySelector(':scope > span')?.textContent).toLocaleLowerCase('es-MX') === labelText.toLocaleLowerCase('es-MX'));
    const value = Number(field?.querySelector('input')?.value);
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  };

  const savingsMonths = () => {
    const card = [...main.querySelectorAll('.finance-result-card')].find((node) => /Tiempo estimado/i.test(node.querySelector(':scope > span')?.textContent || ''));
    const match = clean(card?.querySelector('strong')?.textContent).match(/^(\d+)\s+meses?$/i);
    return match ? Number(match[1]) : null;
  };

  const renderSavingsResultChart = () => {
    if ((location.pathname.replace(/\/$/, '') || '/') !== '/finanzas/ahorro') return;
    const host = main.querySelector('.finance-results');
    if (!host) return;
    const meta = fieldValue('Meta total');
    const actual = fieldValue('Ahorro actual');
    const aportacion = fieldValue('Aportación mensual');
    const meses = savingsMonths();
    let visual = host.querySelector('[data-orbita-savings-result-chart]');
    if (!(meta > 0) || !(aportacion > 0) || !Number.isFinite(meses)) {
      visual?.remove();
      return;
    }
    if (!visual) {
      visual = document.createElement('section');
      visual.className = 'orb-savings-result-chart';
      visual.dataset.orbitaSavingsResultChart = 'true';
      visual.innerHTML = '<p><strong>Tu proyección capturada.</strong> Usa exactamente tu meta, ahorro actual, aportación mensual y el tiempo calculado arriba; no agrega intereses ni rendimientos.</p><div class="orb-savings-result-bars"></div>';
      const next = host.querySelector('.finance-next-box');
      if (next) next.insertAdjacentElement('beforebegin', visual);
      else host.appendChild(visual);
    }
    const bars = visual.querySelector('.orb-savings-result-bars');
    bars.textContent = '';
    const checkpoints = [...new Set([0, Math.ceil(meses / 3), Math.ceil((meses * 2) / 3), meses])];
    checkpoints.forEach((month, index) => {
      const value = Math.min(meta, actual + (aportacion * month));
      const ratio = meta > 0 ? Math.min(1, value / meta) : 0;
      const item = document.createElement('div');
      item.className = 'orb-savings-result-bar';
      item.style.setProperty('--orb-savings-height', `${Math.max(18, 18 + ratio * 82)}%`);
      item.innerHTML = `<span>${index === 0 ? 'Hoy' : month === meses ? `Mes ${meses}` : `Mes ${month}`}</span><strong>${money(value)}</strong>`;
      bars.appendChild(item);
    });
  };

  const scheduleSavingsChart = () => requestAnimationFrame(() => requestAnimationFrame(renderSavingsResultChart));
  if ((location.pathname.replace(/\/$/, '') || '/') === '/finanzas/ahorro') {
    main.addEventListener('input', scheduleSavingsChart);
    main.addEventListener('change', scheduleSavingsChart);
    scheduleSavingsChart();
  }

  const builders = { carreras: careersVisual, estados: stateVisual, finanzas: financeVisual, economia: economyVisual, aprende: learnVisual };
  const visual = builders[section]?.();
  const reserve = main.querySelector('[data-orbita-visual-reserve]');
  if (visual) insertVisual(visual);
  else reserve?.remove();
})();