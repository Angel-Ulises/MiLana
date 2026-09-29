import { useEffect } from 'react';

const MONEY = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
});

const CHART_SPECS = {
  finiquito: {
    title: 'Así se forma tu finiquito',
    copy: 'Cada barra usa los importes de este cálculo para mostrar qué conceptos pesan más.',
    items: [
      ['Salario pendiente', 'salario pendiente'],
      ['Aguinaldo', 'aguinaldo proporcional'],
      ['Vacaciones proporcionales', 'vacaciones proporcionales'],
      ['Vacaciones pendientes', 'vacaciones pendientes'],
      ['Prima vacacional', 'prima vacacional'],
      ['Prima de antigüedad', 'prima de antigüedad'],
    ],
  },
  liquidacion: {
    title: 'Composición del escenario',
    copy: 'La visualización separa prestaciones e indemnizaciones para que el total sea más fácil de explicar.',
    items: [
      ['Prestaciones devengadas', 'prestaciones devengadas'],
      ['3 meses de indemnización', 'indemnización de 3 meses'],
      ['20 días por año', 'escenario de 20 días'],
      ['Prima de antigüedad', 'prima de antigüedad'],
    ],
  },
  'bruto-neto': {
    title: 'Cómo se reparte tu bruto',
    copy: 'El neto y las dos deducciones estimadas se muestran como partes del mismo ingreso bruto.',
    items: [
      ['Neto', 'neto después de isr e imss'],
      ['ISR', 'isr mensual estimado'],
      ['IMSS', 'cuota obrera imss'],
    ],
  },
  isr: {
    title: 'Ingreso antes y después del ISR',
    copy: 'Compara la retención estimada con lo que queda antes de otros descuentos.',
    items: [
      ['Después de ISR', 'ingreso después de isr'],
      ['ISR estimado', 'isr mensual estimado'],
    ],
  },
  resico: {
    title: 'Ingreso e ISR RESICO',
    copy: 'Muestra qué proporción del ingreso capturado corresponde al ISR causado en este supuesto.',
    items: [
      ['Ingreso menos ISR', 'ingreso menos isr causado'],
      ['ISR causado', 'isr causado antes de retenciones'],
    ],
  },
  vacaciones: {
    title: 'Valor de vacaciones y prima',
    copy: 'Separa el valor salarial del periodo de vacaciones y la prima vacacional.',
    items: [
      ['Periodo vacacional', 'valor salarial del periodo vacacional'],
      ['Prima vacacional', 'prima vacacional'],
    ],
  },
  infonavit: {
    title: 'Capital frente a intereses',
    copy: 'Compara el monto financiado con los intereses acumulados de esta simulación.',
    items: [
      ['Capital', 'monto del crédito'],
      ['Intereses', 'total solo en intereses'],
    ],
  },
};

const PALETTE_CLASSES = ['one', 'two', 'three', 'four', 'five', 'six'];

function normalizeText(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function parseMoney(value = '') {
  const cleaned = value
    .replace(/\u2212/g, '-')
    .replace(/[^\d.,-]/g, '')
    .replace(/,/g, '');
  const number = Number.parseFloat(cleaned);
  return Number.isFinite(number) ? Math.abs(number) : 0;
}

function parsePlainNumber(value = '') {
  const match = value.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  if (!match) return 0;
  const number = Number.parseFloat(match[0]);
  return Number.isFinite(number) ? Math.abs(number) : 0;
}

function resultRows(box) {
  return [...box.children].flatMap((child) => {
    if (child.tagName !== 'DIV') return [];
    const spans = [...child.children].filter((node) => node.tagName === 'SPAN');
    if (spans.length < 2) return [];
    return [{
      label: spans[0].textContent?.trim() || '',
      valueText: spans[1].textContent?.trim() || '',
    }];
  });
}

function findRow(rows, needle) {
  const normalizedNeedle = normalizeText(needle);
  return rows.find((row) => normalizeText(row.label).startsWith(normalizedNeedle));
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function insertBeforeExplanation(box, viz) {
  const children = [...box.children];
  const explanation = children.find((child) =>
    child.tagName === 'DIV' && (
      [...child.children].some((node) => node.tagName === 'P') ||
      [...child.children].some((node) => node.tagName === 'DETAILS')
    )
  );
  const shareButton = children.find((child) =>
    child.tagName === 'BUTTON' && /compartir por whatsapp/i.test(child.textContent || '')
  );
  box.insertBefore(viz, explanation || shareButton || null);
}

function buildBreakdown(box, slug, spec) {
  const rows = resultRows(box);
  const items = spec.items.flatMap(([label, needle]) => {
    const row = findRow(rows, needle);
    if (!row) return [];
    const value = parseMoney(row.valueText);
    return value > 0 ? [{ label, value, source: row.valueText }] : [];
  });

  if (items.length < 2) return;

  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (!(total > 0)) return;

  const signature = `${slug}:${items.map((item) => item.value.toFixed(2)).join('|')}`;
  if (box.dataset.mlVizSignature === signature) return;

  box.querySelector(':scope > .ml-result-viz')?.remove();

  const viz = element('section', 'ml-result-viz');
  viz.dataset.mlViz = 'true';

  const head = element('div', 'ml-viz-head');
  head.append(element('strong', 'ml-viz-title', spec.title));
  head.append(element('p', 'ml-viz-copy', spec.copy));
  viz.append(head);

  const track = element('div', 'ml-viz-track');
  track.setAttribute('role', 'img');
  track.setAttribute(
    'aria-label',
    items.map((item) => `${item.label}: ${MONEY.format(item.value)}`).join('. ')
  );

  items.forEach((item, index) => {
    const percent = (item.value / total) * 100;
    const segment = element('span', `ml-viz-segment ml-viz-${PALETTE_CLASSES[index % PALETTE_CLASSES.length]}`);
    segment.style.width = `${percent}%`;
    segment.style.setProperty('--ml-viz-delay', `${index * 90}ms`);
    track.append(segment);
  });
  viz.append(track);

  const legend = element('div', 'ml-viz-legend');
  items.forEach((item, index) => {
    const percent = (item.value / total) * 100;
    const row = element('div', 'ml-viz-legend-row');
    const dot = element('span', `ml-viz-dot ml-viz-${PALETTE_CLASSES[index % PALETTE_CLASSES.length]}`);
    dot.setAttribute('aria-hidden', 'true');

    const copy = element('div', 'ml-viz-legend-copy');
    copy.append(element('span', 'ml-viz-label', item.label));
    copy.append(element('strong', 'ml-viz-value', MONEY.format(item.value)));

    const pct = element('span', 'ml-viz-percent', `${percent < 1 ? '<1' : Math.round(percent)}%`);
    row.append(dot, copy, pct);
    legend.append(row);
  });
  viz.append(legend);

  insertBeforeExplanation(box, viz);
  box.dataset.mlVizSignature = signature;
}

function buildPensionProgress(box) {
  const rows = resultRows(box);
  const currentRow = findRow(rows, 'semanas cotizadas');
  const targetRow = findRow(rows, 'mínimo requerido');
  if (!currentRow || !targetRow) return;

  const current = parsePlainNumber(currentRow.valueText);
  const target = parsePlainNumber(targetRow.valueText);
  if (!(target > 0)) return;

  const ratio = Math.min(current / target, 1);
  const signature = `pension:${current}:${target}`;
  if (box.dataset.mlVizSignature === signature) return;

  box.querySelector(':scope > .ml-result-viz')?.remove();

  const viz = element('section', 'ml-result-viz ml-progress-viz');
  viz.dataset.mlViz = 'true';

  const head = element('div', 'ml-viz-head');
  head.append(element('strong', 'ml-viz-title', 'Avance al mínimo de semanas 2026'));
  head.append(element(
    'p',
    'ml-viz-copy',
    current >= target
      ? `Tu dato capturado alcanza el mínimo general mostrado por la herramienta: ${target} semanas.`
      : `Has capturado ${current} de ${target} semanas del mínimo general mostrado por la herramienta.`
  ));
  viz.append(head);

  const track = element('div', 'ml-progress-track');
  track.setAttribute('role', 'progressbar');
  track.setAttribute('aria-valuemin', '0');
  track.setAttribute('aria-valuemax', String(target));
  track.setAttribute('aria-valuenow', String(Math.min(current, target)));
  track.setAttribute('aria-label', `${current} de ${target} semanas`);

  const fill = element('span', 'ml-progress-fill');
  fill.style.width = `${ratio * 100}%`;
  track.append(fill);
  viz.append(track);

  const footer = element('div', 'ml-progress-foot');
  footer.append(element('span', '', `${Math.round(ratio * 100)}% del mínimo`));
  footer.append(element('strong', '', `${current} / ${target} semanas`));
  viz.append(footer);

  insertBeforeExplanation(box, viz);
  box.dataset.mlVizSignature = signature;
}

function hasShareButton(box) {
  return [...box.children].some((child) =>
    child.tagName === 'BUTTON' && /compartir por whatsapp/i.test(child.textContent || '')
  );
}

function enhanceResults() {
  const slug = window.location.pathname.split('/').filter(Boolean).at(-1);
  const boxes = [...document.querySelectorAll('.calculator-main .ml-result')].filter(hasShareButton);
  if (!boxes.length) return;

  boxes.forEach((box) => {
    if (slug === 'pension') {
      buildPensionProgress(box);
      return;
    }
    const spec = CHART_SPECS[slug];
    if (spec) buildBreakdown(box, slug, spec);
  });
}

function ensureHeroGraphic() {
  if (window.location.pathname !== '/') return;
  const host = document.querySelector('.hero-media-wrap');
  if (!host || host.querySelector('[data-ml-hero-viz]')) return;

  const wrap = element('div', 'ml-hero-data-viz');
  wrap.dataset.mlHeroViz = 'true';
  wrap.setAttribute('aria-hidden', 'true');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 280 150');
  svg.setAttribute('class', 'ml-hero-chart');

  [34, 76, 118].forEach((y) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', `M18 ${y} H262`);
    line.setAttribute('class', 'ml-hero-gridline');
    svg.append(line);
  });

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M22 112 C55 104 70 76 101 84 S145 110 171 72 S214 46 258 30');
  path.setAttribute('class', 'ml-hero-line');
  svg.append(path);

  [[22, 112], [101, 84], [171, 72], [258, 30]].forEach(([cx, cy], index) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(cx));
    circle.setAttribute('cy', String(cy));
    circle.setAttribute('r', '5');
    circle.setAttribute('class', 'ml-hero-dot');
    circle.style.setProperty('--ml-dot-delay', `${620 + index * 140}ms`);
    svg.append(circle);
  });

  const label = element('div', 'ml-hero-viz-label');
  label.append(element('span', '', 'Dato'));
  label.append(element('i', '', '→'));
  label.append(element('span', '', 'Cálculo'));
  label.append(element('i', '', '→'));
  label.append(element('span', '', 'Decisión'));

  wrap.append(svg, label);
  host.append(wrap);
}

export default function MotionDataViz() {
  useEffect(() => {
    let frame = 0;

    const apply = () => {
      frame = 0;
      ensureHeroGraphic();
      enhanceResults();
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(apply);
    };

    schedule();

    const root = document.getElementById('root');
    if (!root) return () => frame && window.cancelAnimationFrame(frame);

    const observer = new MutationObserver(schedule);
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    window.addEventListener('popstate', schedule);

    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
