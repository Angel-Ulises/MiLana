import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// R-15: desde el 1 de enero de 2027, ISR y sueldo neto siguen con tablas de 2026 hasta que se publiquen las nuevas.
test('R-15: el resultado avisa a la vista cuando usa valores de un año anterior', async (t) => {
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
  t.after(() => vite.close());
  const { default: ResultadoClaro } = await vite.ssrLoadModule('/src/resultadoClaro.jsx');
  const React = (await import('react')).default;
  const { renderToStaticMarkup } = await import('react-dom/server');
  const Real = globalThis.Date;
  const fijar = (iso) => { const f = new Real(iso).getTime(); globalThis.Date = class extends Real { constructor(...a) { if (a.length === 0) super(f); else super(...a); } static now() { return f; } }; };
  const pintar = (props) => renderToStaticMarkup(React.createElement(ResultadoClaro, { calculadora: 'isr', etiqueta: 'Te retienen', monto: '$2,383.65', ...props }));
  try {
    fijar('2026-12-31T12:00:00');
    assert.doesNotMatch(pintar({ valoresDe: 2026 }), /rc-aviso-anio/, 'en 2026 no hay aviso');
    fijar('2027-01-02T12:00:00');
    const html = pintar({ valoresDe: 2026 });
    assert.match(html, /class="rc-aviso-anio"/);
    assert.match(html, /Calculado con los valores oficiales de 2026\. Los de 2027 se agregan a MiLana en cuanto se publiquen\./);
    assert.doesNotMatch(pintar({}), /rc-aviso-anio/, 'sin valoresDe no hay aviso');
  } finally { globalThis.Date = Real; }
});

test('R-15: ISR y sueldo neto declaran el año de sus valores', () => {
  const s = readFileSync('src/calculadorasDirectas.jsx', 'utf8');
  for (const calc of ['isr', 'bruto-neto']) assert.match(s, new RegExp(`<ResultadoClaro calculadora="${calc}" valoresDe=\\{2026\\}`), calc);
});
