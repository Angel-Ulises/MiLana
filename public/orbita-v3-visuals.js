(() => {
  'use strict';
  const root = document.documentElement;
  if (root.classList.contains('ml-orbita-embed') || new URLSearchParams(location.search).get('embed') === '1') return;
  if (/^\/calculadoras\/pension-imss\/?$/.test(location.pathname)) return;

  const supportedSections = new Set(['carreras', 'estados', 'finanzas', 'economia', 'aprende']);
  const sectionForPath = () => {
    const path = location.pathname;
    if (path.startsWith('/carreras')) return 'carreras';
    if (path.startsWith('/estados')) return 'estados';
    if (path.startsWith('/finanzas')) return 'finanzas';
    if (path.startsWith('/economia')) return 'economia';
    if (path.startsWith('/aprende')) return 'aprende';
    return '';
  };
  let section = '';
  let main = null;
  let observedRoot = null;
  let observer = null;
  let queued = false;
  let savingsMain = null;

  const syncContext = () => {
    section = root.dataset.orbitaSection || sectionForPath();
    main = document.querySelector('main');
    // «Cargando contenido…» es temporal: lo insertado ahí se pintaba un instante y desaparecía con React.
    if (main?.classList.contains('ml-route-loading')) return false;
    return Boolean(main && supportedSections.has(section));
  };

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
    const hero = main.querySelector(':scope > .career-hero,:scope > .profession-hero,:scope > .state-hero,:scope > .state-detail-hero,:scope > .finance-page-hero,:scope > .advisor-hero,:scope > .investment-hero,:scope > .economy-hero,:scope > .hubhead,:scope > .cnbv-funds-hero,:scope > .cetes-reference-hero,:scope > .instrument-compare-hero');
    if (hero) {
      hero.insertAdjacentElement('afterend', visual);
      return;
    }
    const h1 = main.querySelector('h1');
    // Hero desconocido: va después de la sección de primer nivel que contiene el h1, nunca dentro de ella.
    const heroSection = h1?.closest('main > section');
    if (heroSection && heroSection.parentElement === main) {
      heroSection.insertAdjacentElement('afterend', visual);
      return;
    }
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
      // El título de la fila (h3/h2) es la etiqueta; el texto previo a la cifra mezcla número, nombre y conteos sin espacios.
      let label = clean(node.querySelector('h2,h3,h4')?.textContent) || clean(text.slice(0, match.index)).replace(/[—–:·-]+$/g, '').trim();
      if (!label) label = clean(node.querySelector('strong,td')?.textContent) || 'Dato visible';
      if (label.length > 80) label = `${label.slice(0, 80).replace(/\s+\S*$/, '')}…`;
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
      const label = document.createElement('span');
      label.className = 'orb-bar-label';
      label.textContent = row.label;
      const track = document.createElement('span');
      track.className = 'orb-bar-track';
      const fill = document.createElement('span');
      fill.className = 'orb-bar-fill';
      fill.style.setProperty('--orb-bar-width', `${width.toFixed(1)}%`);
      track.appendChild(fill);
      const amount = document.createElement('span');
      amount.className = 'orb-bar-value';
      amount.textContent = money(row.value);
      item.append(label, track, amount);
      item.addEventListener('click', () => { visual._readout.textContent = `${row.label}: ${money(row.value)}`; });
      wrap.appendChild(item);
    }
    visual._readout.textContent = `${money(min)} – ${money(max)}`;
    visual.appendChild(wrap);
    return visual;
  };

  // Nombre y código fijos por entidad (slug de /estados/<slug>); evita derivar iniciales de texto de tarjetas.
  const STATES = {
    'aguascalientes': ['AGS', 'Aguascalientes'], 'baja-california': ['BC', 'Baja California'],
    'baja-california-sur': ['BCS', 'Baja California Sur'], 'campeche': ['CAMP', 'Campeche'],
    'chiapas': ['CHIS', 'Chiapas'], 'chihuahua': ['CHIH', 'Chihuahua'], 'coahuila': ['COAH', 'Coahuila'],
    'colima': ['COL', 'Colima'], 'ciudad-de-mexico': ['CDMX', 'Ciudad de México'], 'durango': ['DGO', 'Durango'],
    'estado-de-mexico': ['MEX', 'Estado de México'], 'guanajuato': ['GTO', 'Guanajuato'], 'guerrero': ['GRO', 'Guerrero'],
    'hidalgo': ['HGO', 'Hidalgo'], 'jalisco': ['JAL', 'Jalisco'], 'michoacan': ['MICH', 'Michoacán'],
    'morelos': ['MOR', 'Morelos'], 'nayarit': ['NAY', 'Nayarit'], 'nuevo-leon': ['NL', 'Nuevo León'],
    'oaxaca': ['OAX', 'Oaxaca'], 'puebla': ['PUE', 'Puebla'], 'queretaro': ['QRO', 'Querétaro'],
    'quintana-roo': ['QROO', 'Quintana Roo'], 'san-luis-potosi': ['SLP', 'San Luis Potosí'], 'sinaloa': ['SIN', 'Sinaloa'],
    'sonora': ['SON', 'Sonora'], 'tabasco': ['TAB', 'Tabasco'], 'tamaulipas': ['TAMS', 'Tamaulipas'],
    'tlaxcala': ['TLAX', 'Tlaxcala'], 'veracruz': ['VER', 'Veracruz'], 'yucatan': ['YUC', 'Yucatán'], 'zacatecas': ['ZAC', 'Zacatecas']
  };

  const stateVisual = () => {
    const slugOf = (href) => (href.match(/^\/estados\/([^/?#]+)\/?$/) || [])[1];
    const currentSlug = slugOf(location.pathname);
    const entries = [];
    const seen = new Set();
    const add = (slug) => {
      if (!slug || !STATES[slug] || seen.has(slug)) return;
      seen.add(slug);
      entries.push({ slug, href: `/estados/${slug}`, code: STATES[slug][0], label: STATES[slug][1] });
    };
    if (currentSlug) add(currentSlug);
    main.querySelectorAll('a[href^="/estados/"]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (href.includes('/comparar')) return;
      add(slugOf(href));
    });
    // Comparar estados enlaza solo a dos entidades: el mosaico muestra las 32 para navegar.
    if (/^\/estados\/comparar\/?$/.test(location.pathname)) Object.keys(STATES).forEach(add);
    if (entries.length < 2) return null;
    const detail = Boolean(currentSlug && STATES[currentSlug]);
    const visual = card('Estados', detail ? 'Tu estado y comparables' : 'México en mosaico', detail
      ? 'Tu entidad aparece resaltada junto con las que esta ficha enlaza. El mosaico es navegación visual: no colorea estados como mejores o peores.'
      : 'Explora las entidades disponibles. El mosaico es navegación visual: no colorea estados como mejores o peores.');
    const grid = document.createElement('div');
    grid.className = 'orb-state-mosaic';
    const select = (button, entry) => {
      grid.querySelectorAll('.is-active').forEach((n) => n.classList.remove('is-active'));
      button.classList.add('is-active');
      visual._readout.innerHTML = entry.slug === currentSlug
        ? `<span>${entry.label}</span> · estás aquí`
        : `<span>${entry.label}</span> · <a href="${entry.href}">Abrir estado →</a>`;
    };
    entries.slice(0, 32).forEach((entry) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'orb-state-tile';
      button.dataset.stateCode = entry.code;
      button.setAttribute('aria-label', `Ver ${entry.label}`);
      button.textContent = entry.code;
      button.addEventListener('click', () => select(button, entry));
      grid.appendChild(button);
      if (entry.slug === currentSlug) { button.classList.add('is-active'); button.setAttribute('aria-current', 'true'); }
    });
    visual._readout.textContent = detail ? `${entries[0].label} y ${entries.length - 1} más` : `${Math.min(entries.length, 32)} entidades disponibles`;
    visual.appendChild(grid);
    return visual;
  };

  const financeVisual = () => {
    // Comparar, CETES y fondos ya son herramientas concretas: la tarjeta genérica Ahorro/CETES/Casa solo empujaba
    // la herramienta ~800px hacia abajo en móvil.
    if (/^\/finanzas\/inversion\/(?:comparar|cetes|fondos)\/?$/.test(location.pathname)) return null;
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
    return cutWords(`${dataLabel || title} · ${source}`, 58);
  };

  // Recorta en el último espacio para no partir palabras ("falt…").
  const cutWords = (text, max) => {
    const value = clean(text);
    if (value.length <= max) return value;
    return `${value.slice(0, max).replace(/\s+\S*$/, '')}…`;
  };

  // Etiqueta de un porcentaje dentro de un párrafo: las palabras que lo describen, no el título de la sección.
  const phraseAround = (text, match) => {
    const before = text.slice(0, match.index).split(/[.:;,\n]\s*/).pop().trim().split(/\s+/).slice(-8).join(' ');
    const after = text.slice(match.index + match[0].length).split(/[.,;\n]/)[0].trim().split(/\s+/).slice(0, 5).join(' ');
    const phrase = before.length >= 12 ? before : after;
    return phrase ? cutWords(phrase.charAt(0).toUpperCase() + phrase.slice(1), 58) : '';
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
      // innerText separa los bloques con saltos de línea; textContent pegaba "oficialINEGI".
      const text = String(node.innerText || node.textContent || '').replace(/[ \t]+/g, ' ');
      const matches = [...text.matchAll(/(-?\d{1,3}(?:\.\d{1,2})?)\s*%/g)];
      for (const match of matches) {
        const value = Number(match[1]);
        if (!Number.isFinite(value)) continue;
        const title = clean(node.closest('article,section')?.querySelector('h1,h2,h3')?.textContent);
        const source = economySource(`${title} ${text}`);
        const key = String(value);
        if (seen.has(key)) continue;
        seen.add(key);
        values.push({ label: phraseAround(text, match) || economyLabel({ title, dataLabel: '', source }), value, source });
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
      const label = document.createElement('span');
      label.className = 'orb-economy-bar-label';
      label.textContent = item.label;
      const track = document.createElement('span');
      track.className = 'orb-economy-bar-track';
      const fill = document.createElement('span');
      fill.className = 'orb-economy-bar-fill';
      fill.style.setProperty('--orb-economy-width', `${width.toFixed(1)}%`);
      track.appendChild(fill);
      const amount = document.createElement('span');
      amount.className = 'orb-economy-bar-value';
      amount.textContent = `${item.value}%`;
      button.append(label, track, amount);
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
    // En una guía individual el lector ya eligió tema: el mapa de 4 pasos empujaba el título ~520 px hacia abajo en móvil.
    if (/^\/aprende\/[^/]+/.test(location.pathname)) return null;
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
  const bindSavingsChart = () => {
    if ((location.pathname.replace(/\/$/, '') || '/') !== '/finanzas/ahorro') {
      savingsMain = null;
      return;
    }
    if (main === savingsMain) return;
    savingsMain = main;
    main.addEventListener('input', scheduleSavingsChart);
    main.addEventListener('change', scheduleSavingsChart);
    scheduleSavingsChart();
  };

  const builders = { carreras: careersVisual, estados: stateVisual, finanzas: financeVisual, economia: economyVisual, aprende: learnVisual };

  const enhanceVisuals = () => {
    if (!syncContext()) return;
    bindSavingsChart();
    if (main.querySelector('[data-orbita-section-visual]')) return;
    const visual = builders[section]?.();
    const reserve = main.querySelector('[data-orbita-visual-reserve]');
    if (visual) insertVisual(visual);
    else reserve?.remove();
  };

  function queueEnhance() {
    if (queued) return;
    queued = true;
    // Microtarea (no rAF): el visual entra en el mismo turno en que React reemplaza #root, antes de cualquier
    // pintado. Con rAF podía pintarse un frame sin visual (el glosario ya entraba por microtarea) y luego todo
    // lo de abajo saltaba ~300 px (CLS intermitente en producción).
    queueMicrotask(() => {
      queued = false;
      if (main && !main.isConnected) main = null;
      observeRoot();
      enhanceVisuals();
    });
  }

  function observeRoot() {
    const target = document.getElementById('root');
    if (!target) return;
    if (!observer) observer = new MutationObserver(queueEnhance);
    if (observedRoot !== target) {
      observer.disconnect();
      observedRoot = target;
    }
    observer.observe(observedRoot, { childList: true, subtree: true });
  }

  observeRoot();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', queueEnhance, { once: true });
  else queueEnhance();
})();
