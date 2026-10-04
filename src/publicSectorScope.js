import {
  REGIMENES_LABORALES_2026,
  esRegimenLFT,
  configAguinaldo2026,
  vacacionesFederalesLFTSE2026,
  permiteCalculoIMSS,
} from './lib/regimen-laboral-2026.mjs';

const PATH = () => location.pathname.replace(/\/$/, '') || '/';
const CALC = '/calculadoras/';
const SELECT_CLASS = 'ml-public-sector-scope';
const WARNING_CLASS = 'ml-public-scope-warning';

const text = (node) => (node?.textContent || '').replace(/\s+/g, ' ').trim();

function nativeValue(control, value) {
  const proto = control instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) setter.call(control, value); else control.value = value;
  control.dispatchEvent(new Event('input', { bubbles: true }));
  control.dispatchEvent(new Event('change', { bubbles: true }));
}

function findControl(root, pattern) {
  for (const label of root.querySelectorAll('label')) {
    if (!pattern.test(text(label))) continue;
    if (label.htmlFor) {
      const byId = document.getElementById(label.htmlFor);
      if (byId) return { label, control: byId };
    }
    const nested = label.querySelector('input,select,textarea');
    if (nested) return { label, control: nested };
    const next = label.nextElementSibling;
    if (next?.matches?.('input,select,textarea')) return { label, control: next };
  }
  return null;
}

function option(value, label) {
  const node = document.createElement('option');
  node.value = value;
  node.textContent = label;
  return node;
}

function createPanel(root, { id, label, options, value = options[0][0], help }) {
  let panel = root.querySelector(`:scope > .${SELECT_CLASS}[data-scope-id="${id}"]`);
  if (panel) return panel;
  panel = document.createElement('section');
  panel.className = SELECT_CLASS;
  panel.dataset.scopeId = id;
  panel.dataset.orbitaIgnoreQuestion = 'true';
  const labelNode = document.createElement('label');
  labelNode.htmlFor = id;
  labelNode.textContent = label;
  const select = document.createElement('select');
  select.id = id;
  select.dataset.publicScopeSelect = 'true';
  for (const [v, l] of options) select.appendChild(option(v, l));
  select.value = value;
  const helpNode = document.createElement('p');
  helpNode.className = 'calc-help';
  helpNode.textContent = help;
  panel.append(labelNode, select, helpNode);
  const intro = root.querySelector(':scope > .calc-intro, :scope > p:first-child');
  intro?.after(panel) || root.prepend(panel);
  return panel;
}

function clearWarning(root) {
  root.querySelector(`:scope > .${WARNING_CLASS}`)?.remove();
}

function warning(root, title, body, extra) {
  const existing = root.querySelector(`:scope > .${WARNING_CLASS}`);
  if (existing?.dataset.scopeTitle === title && existing?.dataset.scopeBody === body) return existing;
  existing?.remove();
  const box = document.createElement('section');
  box.className = WARNING_CLASS;
  box.dataset.orbitaIgnoreQuestion = 'true';
  box.dataset.scopeTitle = title;
  box.dataset.scopeBody = body;
  box.innerHTML = `<strong></strong><p></p>`;
  box.querySelector('strong').textContent = title;
  box.querySelector('p').textContent = body;
  if (extra instanceof Node) box.appendChild(extra);
  root.querySelector(`:scope > .${SELECT_CLASS}`)?.after(box) || root.prepend(box);
  return box;
}

function block(root, blocked) {
  root.dataset.publicScopeBlocked = blocked ? 'true' : 'false';
  document.documentElement.classList.toggle('ml-public-scope-blocked-route', blocked);
  if (!blocked) clearWarning(root);
}

function employmentPanel(root, id) {
  return createPanel(root, {
    id,
    label: '¿Qué régimen gobierna esta relación de trabajo?',
    options: Object.values(REGIMENES_LABORALES_2026).map((item) => [item.value, item.label]),
    help: 'No elijas solo por el nombre del patrón: revisa tu nombramiento, contrato o recibo. Una dependencia pública puede tener personal bajo reglas distintas.',
  });
}

function publicEmploymentWarning(root, tool, regimen) {
  const federal = regimen === 'lftse-federal';
  const local = regimen === 'publico-local';
  warning(
    root,
    `${tool}: esta fórmula no se extrapola a tu régimen.`,
    federal
      ? 'El personal federal sujeto a LFTSE tiene prestaciones y bases propias; confianza, mando y honorarios pueden tener un tratamiento distinto. MiLana detiene la fórmula LFT antes de darte una cifra engañosa.'
      : local
        ? 'Los gobiernos estatales y municipales pueden tener estatutos, institutos y prestaciones propios. Identifica la norma local antes de calcular.'
        : 'Confianza, mando, honorarios y otros vínculos públicos no forman un régimen único. Revisa tu nombramiento o contrato antes de aplicar una fórmula laboral.'
  );
}

function setupLftOnly(root, tool, id) {
  const panel = employmentPanel(root, id);
  const select = panel.querySelector('select');
  const apply = () => {
    const allowed = esRegimenLFT(select.value);
    block(root, !allowed);
    if (!allowed) publicEmploymentWarning(root, tool, select.value);
  };
  if (!select.dataset.scopeBound) {
    select.dataset.scopeBound = '1';
    select.addEventListener('change', apply);
  }
  apply();
}

function setupAguinaldo(root) {
  const panel = employmentPanel(root, 'aguinaldo-regimen');
  const select = panel.querySelector('select');
  const diasField = () => findControl(root, /Días de prestación/i);
  const salarioField = () => findControl(root, /Salario mensual fijo/i) || findControl(root, /Base mensual usada/i);

  const apply = () => {
    const cfg = configAguinaldo2026(select.value);
    block(root, !cfg.calculable);
    const dias = diasField();
    const salario = salarioField();
    if (dias?.label && !dias.label.dataset.originalText) dias.label.dataset.originalText = text(dias.label);
    if (salario?.label && !salario.label.dataset.originalText) salario.label.dataset.originalText = text(salario.label);
    if (!cfg.calculable) {
      publicEmploymentWarning(root, 'Aguinaldo', select.value);
      return;
    }
    if (select.value === 'lftse-federal') {
      if (salario?.label && text(salario.label) !== 'Base mensual usada para tu aguinaldo (MXN)') salario.label.textContent = 'Base mensual usada para tu aguinaldo (MXN)';
      if (dias?.label && text(dias.label) !== 'Días de prestación (mínimo federal LFTSE: 40)') dias.label.textContent = 'Días de prestación (mínimo federal LFTSE: 40)';
      if (dias?.control) {
        dias.control.min = '40';
        if (Number(dias.control.value || 0) < 40) nativeValue(dias.control, '40');
      }
      const note = document.createElement('p');
      note.className = 'calc-help';
      note.textContent = 'Escenario federal sujeto a LFTSE: MiLana parte de 40 días. Captura como base la que realmente use tu nombramiento/nómina; no asumas que equivale a todas tus percepciones.';
      warning(root, 'Aguinaldo federal: sí puede estimarse, pero con la base correcta.', 'La LFTSE federal fija al menos 40 días; esta rama no se aplica a confianza, mando, honorarios ni a estatutos locales.', note);
      root.dataset.publicScopeBlocked = 'false';
      document.documentElement.classList.remove('ml-public-scope-blocked-route');
    } else {
      clearWarning(root);
      if (salario?.label?.dataset.originalText && text(salario.label) !== salario.label.dataset.originalText) salario.label.textContent = salario.label.dataset.originalText;
      if (dias?.label?.dataset.originalText && text(dias.label) !== dias.label.dataset.originalText) dias.label.textContent = dias.label.dataset.originalText;
      if (dias?.control) {
        dias.control.removeAttribute('min');
        if (dias.control.value === '40') nativeValue(dias.control, '15');
      }
    }
  };

  if (!select.dataset.scopeBound) {
    select.dataset.scopeBound = '1';
    select.addEventListener('change', apply);
  }
  if (!root.dataset.publicAguinaldoSubmitBound) {
    root.dataset.publicAguinaldoSubmitBound = '1';
    root.addEventListener('submit', (event) => {
      if (select.value !== 'lftse-federal') return;
      const dias = diasField()?.control;
      if (Number(dias?.value || 0) >= 40) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      dias?.focus();
      warning(root, 'Revisa los días de aguinaldo.', 'Para el escenario federal LFTSE seleccionado, captura al menos 40 días.');
    }, true);
  }
  apply();
}

function securityPanel(root, id, tool) {
  const panel = createPanel(root, {
    id,
    label: '¿En qué sistema de seguridad social cotizas para este empleo?',
    options: [['imss','IMSS'],['issste','ISSSTE'],['otro','Instituto estatal, otro o no estoy seguro']],
    help: 'La base y las cuotas cambian por instituto; no conviertas cotizaciones ISSSTE o estatales a reglas IMSS.',
  });
  const select = panel.querySelector('select');
  const apply = () => {
    const allowed = permiteCalculoIMSS(select.value);
    block(root, !allowed);
    if (!allowed) warning(
      root,
      select.value === 'issste' ? `${tool}: no voy a aplicar reglas IMSS a ISSSTE.` : `${tool}: primero identifica tu instituto.`,
      select.value === 'issste'
        ? 'ISSSTE usa Sueldo Básico y cuotas o requisitos propios. Aplicar SBC, cuota obrera o semanas IMSS produciría una lectura engañosa.'
        : 'Un instituto estatal u otro sistema puede tener bases, cuotas y requisitos propios.'
    );
  };
  if (!select.dataset.scopeBound) { select.dataset.scopeBound = '1'; select.addEventListener('change', apply); }
  apply();
}

function setupVacaciones(root) {
  const panel = employmentPanel(root, 'vac-regimen');
  const select = panel.querySelector('select');
  const apply = () => {
    const regimen = select.value;
    if (esRegimenLFT(regimen)) { block(root, false); return; }
    block(root, true);
    if (regimen !== 'lftse-federal') { publicEmploymentWarning(root, 'Vacaciones', regimen); return; }
    const wrap = document.createElement('div');
    wrap.className = 'ml-public-vacation-tool';
    wrap.innerHTML = '<label for="vac-meses-lftse">Meses consecutivos de servicio</label><input id="vac-meses-lftse" inputmode="decimal" type="number" min="0" step="0.01" placeholder="Ej: 8"><button type="button">Revisar vacaciones federales</button><div aria-live="polite"></div>';
    wrap.querySelector('button').addEventListener('click', () => {
      const out = wrap.querySelector('[aria-live]');
      try {
        const r = vacacionesFederalesLFTSE2026(wrap.querySelector('input').value);
        out.innerHTML = r.elegible
          ? '<strong>20 días laborales al año</strong><p>La LFTSE federal los distribuye en dos periodos de 10 días después de más de seis meses consecutivos de servicio.</p>'
          : '<strong>Todavía no se activa esa regla.</strong><p>La LFTSE federal exige más de seis meses consecutivos de servicio.</p>';
      } catch (error) { out.textContent = error.message; }
    });
    warning(root, 'Vacaciones federales LFTSE', 'No uso la tabla de Vacaciones Dignas de la LFT para este escenario. Tampoco invento una prima vacacional LFT.', wrap);
  };
  if (!select.dataset.scopeBound) { select.dataset.scopeBound = '1'; select.addEventListener('change', apply); }
  apply();
}

function setupHousing(root) {
  const panel = createPanel(root, {
    id: 'vivienda-instituto',
    label: '¿De qué instituto es el crédito que quieres simular?',
    options: [['infonavit','Infonavit'],['fovissste','FOVISSSTE'],['otro','Otro o no estoy seguro']],
    help: 'Esta calculadora solo simula un crédito cuando tú capturas condiciones de Infonavit; no convierte automáticamente un crédito público distinto.',
  });
  const select = panel.querySelector('select');
  const apply = () => {
    const allowed = select.value === 'infonavit';
    block(root, !allowed);
    if (!allowed) warning(root, select.value === 'fovissste' ? 'FOVISSSTE no es Infonavit.' : 'Primero identifica el crédito.', 'No voy a reutilizar tasa, pago o condiciones de Infonavit para un crédito de otro instituto.');
  };
  if (!select.dataset.scopeBound) { select.dataset.scopeBound='1'; select.addEventListener('change', apply); }
  apply();
}

function calculatorRoot() {
  return document.querySelector('.calculator-main > form, .calculator-main > div:first-child');
}

function applyScope() {
  const assistantReady = Boolean(document.querySelector('.calculator-main > .ml-calc-assistant'));
  document.documentElement.classList.toggle('orb-calc-assistant-ready', assistantReady);
  if (!PATH().startsWith(CALC)) return;
  const root = calculatorRoot();
  if (!root) return;
  const path = PATH();
  if (path === `${CALC}finiquito`) setupLftOnly(root, 'Finiquito', 'fin-regimen');
  else if (path === `${CALC}liquidacion`) setupLftOnly(root, 'Liquidación', 'liq-regimen');
  else if (path === `${CALC}aguinaldo`) setupAguinaldo(root);
  else if (path === `${CALC}bruto-a-neto`) securityPanel(root, 'bn-instituto', 'Bruto → Neto');
  else if (path === `${CALC}vacaciones`) setupVacaciones(root);
  else if (path === `${CALC}pension-imss`) securityPanel(root, 'pension-instituto', 'Pensión');
  else if (path === `${CALC}infonavit`) setupHousing(root);
  else if (path === `${CALC}ptu`) setupLftOnly(root, 'PTU', 'ptu-regimen');
}

let scheduled = false;
function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { scheduled = false; applyScope(); });
}

if (typeof document !== 'undefined') {
  schedule();
  const target = document.getElementById('root') || document.body;
  new MutationObserver(schedule).observe(target, { childList: true, subtree: true });
  addEventListener('popstate', schedule);
}
