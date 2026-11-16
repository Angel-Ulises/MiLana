import { startHomeWhenReady } from './homeStartup.js';

// Mejora 2026-11 (fase 3): la calculadora llega prerenderizada en el HTML y se puede escribir en ella
// antes de que cargue React. Al montar, se copian los valores escritos a los campos de React.
const setValor = typeof HTMLInputElement === 'undefined' ? undefined : Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;

export function capturarCampos(root) {
  return [...root.querySelectorAll('[data-calc-directo] input')].map((el, i) => ({
    i, name: el.name, type: el.type, value: el.value, checked: el.checked,
    // Valor con el que llegó en el HTML. Si no cambió, la persona no escribió nada.
    defecto: el.defaultValue,
  }));
}

export function restaurarCampos(root, guardados) {
  const nuevos = [...root.querySelectorAll('[data-calc-directo] input')];
  for (const g of guardados) {
    if (g.type === 'radio') {
      const radios = nuevos.filter((el) => el.type === 'radio' && el.name === g.name);
      const previos = guardados.filter((x) => x.type === 'radio' && x.name === g.name);
      const destino = radios[previos.indexOf(g)];
      if (g.checked && destino && !destino.checked) destino.click();
      continue;
    }
    if (!g.name || !g.value || g.type === 'checkbox') continue;
    // Un valor que viene del HTML (por ejemplo, la fecha de hoy al momento de compilar) no se copia:
    // React ya calculó el suyo con el día de la visita.
    if (g.value === g.defecto) continue;
    const destino = nuevos.find((el) => el.name === g.name);
    if (!destino || destino.value === g.value) continue;
    if (setValor) setValor.call(destino, g.value); else destino.value = g.value;
    destino.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

export function startCalcWhenReady({ root, load, mount }) {
  return startHomeWhenReady({
    root,
    load,
    mount: (Pagina, listo) => {
      const guardados = capturarCampos(root);
      mount(Pagina, () => { listo?.(); restaurarCampos(root, guardados); });
    },
  });
}
