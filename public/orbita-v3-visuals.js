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
    if (links.length < 8) return null;
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
    const line = document.createElement('div');
    line.className = 'orb-projection-line';
    chart.appendChild(line);
    const note = document.createElement('p');
    note.className = 'orb-projection-note';
    note.textContent = 'Visual conceptual, sin eje monetario: no representa un rendimiento ni una promesa de crecimiento.';

    const scenarios = [
      { label: 'Ahorro', href: '/finanzas/ahorro', angle: '-7deg', text: 'Ahorro: define meta, ahorro actual y aportación mensual; la calculadora estima el tiempo sin asumir rendimiento.' },
      { label: 'CETES', href: '/finanzas/inversion/cetes', angle: '-4deg', text: 'CETES: revisa la tasa y el plazo vigentes en la herramienta; esta línea no sustituye ese dato.' },
      { label: 'Casa', href: '/finanzas/vivienda', angle: '-2deg', text: 'Casa: ordena presupuesto, fondo, deuda y después compara el financiamiento.' }
    ];
    const set = (scenario, button) => {
      tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      line.style.setProperty('--orb-line-angle', scenario.angle);
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

  const collectPercentages = () => {
    const values = [];
    const seen = new Set();
    const nodes = main.querySelectorAll('p,li,td,strong,.economy-card,.economy-meta');
    for (const node of nodes) {
      const text = clean(node.textContent);
      const matches = [...text.matchAll(/(-?\d{1,3}(?:\.\d{1,2})?)\s*%/g)];
      for (const match of matches) {
        const value = Number(match[1]);
        if (!Number.isFinite(value)) continue;
        const label = clean(text.slice(0, match.index)).slice(-40).replace(/[—–:·-]+$/g, '').trim() || 'Dato';
        const key = `${label}|${value}`;
        if (seen.has(key)) continue;
        seen.add(key);
        values.push({ label, value });
        if (values.length >= 8) return values;
      }
    }
    return values;
  };

  const economyVisual = () => {
    const values = collectPercentages();
    if (values.length < 2) return null;
    const visual = card('Economía', 'Línea de porcentajes visibles', 'La gráfica solo reutiliza porcentajes presentes en esta página. Toca un punto para ver su valor y contexto inmediato.');
    const min = Math.min(...values.map((item) => item.value));
    const max = Math.max(...values.map((item) => item.value));
    const span = Math.max(max - min, 1);
    const width = 640;
    const height = 220;
    const pad = 28;
    const points = values.map((item, index) => {
      const x = pad + (index * (width - pad * 2)) / Math.max(values.length - 1, 1);
      const y = height - pad - ((item.value - min) / span) * (height - pad * 2);
      return { ...item, x, y };
    });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'orb-economy-line');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Línea de porcentajes visibles en la página');
    const area = document.createElementNS(svg.namespaceURI, 'path');
    const line = document.createElementNS(svg.namespaceURI, 'polyline');
    const pointText = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    area.setAttribute('d', `M ${points[0].x} ${height - pad} L ${pointText.replace(/,/g, ' ')} L ${points.at(-1).x} ${height - pad} Z`);
    area.setAttribute('class', 'orb-economy-area');
    line.setAttribute('points', pointText);
    line.setAttribute('class', 'orb-economy-polyline');
    svg.append(area, line);
    points.forEach((point) => {
      const circle = document.createElementNS(svg.namespaceURI, 'circle');
      circle.setAttribute('cx', point.x);
      circle.setAttribute('cy', point.y);
      circle.setAttribute('r', '7');
      circle.setAttribute('class', 'orb-economy-point');
      circle.setAttribute('tabindex', '0');
      circle.setAttribute('role', 'button');
      circle.setAttribute('aria-label', `${point.label}: ${point.value}%`);
      const show = () => { visual._readout.textContent = `${point.label}: ${point.value}%`; };
      circle.addEventListener('click', show);
      circle.addEventListener('focus', show);
      svg.appendChild(circle);
    });
    visual._readout.textContent = `${min}% – ${max}%`;
    visual.appendChild(svg);
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

  const builders = {
    carreras: careersVisual,
    estados: stateVisual,
    finanzas: financeVisual,
    economia: economyVisual,
    aprende: learnVisual,
  };
  const visual = builders[section]?.();
  if (visual) insertVisual(visual);
})();
