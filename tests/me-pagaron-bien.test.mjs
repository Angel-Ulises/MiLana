import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compararDeposito } from '../src/lib/calculos-directos.mjs';
import { calcularAguinaldoNeto } from '../src/lib/calculos-revisados.mjs';

const r = calcularAguinaldoNeto({ sueldoMensual: '12000' }); // bruto 6,000 · neto 5,633.71 · tolerancia $60 (1%)
const comparar = (deposito, base = r) => compararDeposito({ ...base, deposito });

test('¿Me pagaron bien?: exacto, dentro de tolerancia, menos o más', () => {
  // El neto interno trae más decimales; se compara contra el monto que se muestra en pantalla ($5,633.71).
  assert.equal(r.bruto, 6000); assert.equal(Math.round(r.neto * 100) / 100, 5633.71);
  const exacto = comparar('5,633.71');
  assert.deepEqual([exacto.veredicto, exacto.diferencia, exacto.margen], ['exacto', 0, 60]);
  const cerca = comparar('5,630');
  assert.deepEqual([cerca.veredicto, cerca.diferencia], ['tolerancia', -3.71]);
  const menos = comparar('4800');
  assert.deepEqual([menos.veredicto, menos.diferencia], ['menos', -833.71]);
  const mas = comparar('6000');
  assert.deepEqual([mas.veredicto, mas.diferencia, mas.superaBruto], ['mas', 366.29, false]);
  assert.equal(comparar('9000').superaBruto, true);
  for (const vacio of ['', '0', 'abc', null]) assert.equal(comparar(vacio), null);
});

test('un centavo de diferencia ya no es «exacto», pero sigue dentro de la tolerancia', () => {
  assert.deepEqual([comparar('5633.72').veredicto, comparar('5633.72').diferencia], ['tolerancia', 0.01]);
  assert.deepEqual([comparar('5633.70').veredicto, comparar('5633.70').diferencia], ['tolerancia', -0.01]);
});

test('límite de 1% (bruto $6,000 → $60.00): el límite exacto entra y un centavo más ya no', () => {
  // neto 5,633.71 ± 60.00
  assert.deepEqual([comparar('5693.71').veredicto, comparar('5693.71').diferencia], ['tolerancia', 60]);
  assert.deepEqual([comparar('5693.70').veredicto], ['tolerancia']);
  assert.deepEqual([comparar('5693.72').veredicto, comparar('5693.72').diferencia], ['mas', 60.01]);
  assert.deepEqual([comparar('5573.71').veredicto, comparar('5573.71').diferencia], ['tolerancia', -60]);
  assert.deepEqual([comparar('5573.72').veredicto], ['tolerancia']);
  assert.deepEqual([comparar('5573.70').veredicto, comparar('5573.70').diferencia], ['menos', -60.01]);
});

test('mínimo de $50: aplica cuando 1% del aguinaldo bruto es menor, con límites exactos y a un centavo', () => {
  const chico = { neto: 2000, bruto: 2000 }; // 1% = $20 → rige el mínimo de $50
  assert.equal(comparar('2000', chico).margen, 50);
  assert.equal(comparar('2050.00', chico).veredicto, 'tolerancia');
  assert.equal(comparar('2049.99', chico).veredicto, 'tolerancia');
  assert.equal(comparar('2050.01', chico).veredicto, 'mas');
  assert.equal(comparar('1950.00', chico).veredicto, 'tolerancia');
  assert.equal(comparar('1950.01', chico).veredicto, 'tolerancia');
  assert.equal(comparar('1949.99', chico).veredicto, 'menos');
  // Cruce: con bruto de $5,000 ambos criterios dan $50; arriba de eso manda el 1%.
  assert.equal(comparar('1', { neto: 5000, bruto: 5000 }).margen, 50);
  assert.equal(comparar('1', { neto: 5000, bruto: 5000.5 }).margen, 50.01);
  // La tolerancia se redondea a centavos y el límite sigue siendo exacto.
  const fino = { neto: 7000, bruto: 7333.33 }; // 1% = 73.3333 → $73.33
  assert.equal(comparar('7073.33', fino).veredicto, 'tolerancia');
  assert.equal(comparar('7073.34', fino).veredicto, 'mas');
});

test('texto visible: muestra diferencia y tolerancia, y no afirma causas como hechos', async (t) => {
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
  t.after(() => vite.close());
  const { VeredictoDeposito } = await vite.ssrLoadModule('/src/calcAguinaldo.jsx');
  const React = (await import('react')).default;
  const { renderToStaticMarkup } = await import('react-dom/server');
  const texto = (deposito) => renderToStaticMarkup(React.createElement(VeredictoDeposito, { c: comparar(deposito) }))
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/\s+/g, ' ').trim();

  assert.equal(texto(''), '');
  const exacto = texto('5633.71');
  assert.match(exacto, /Coincide con el cálculo\./); assert.match(exacto, /sin diferencia/);

  const cerca = texto('5630');
  assert.match(cerca, /Casi igual: te llegaron \$3\.71 menos/);
  assert.match(cerca, /dentro de la tolerancia de \$60\.00/);
  assert.match(cerca, /lo mayor entre \$50 y 1% de tu aguinaldo antes de impuestos/);
  assert.match(cerca, /puede venir del redondeo/); assert.match(cerca, /no podemos saber la causa/);
  assert.doesNotMatch(cerca, /Coincide con el cálculo|Sí cuadra/);
  assert.match(texto('5693.71'), /te llegaron \$60\.00 más .* dentro de la tolerancia de \$60\.00/);

  const mas = texto('5693.72');
  assert.match(mas, /Te llegaron \$60\.01 más/); assert.match(mas, /rebasa la tolerancia de \$60\.00/);
  assert.match(mas, /Puede deberse, por ejemplo/); assert.match(mas, /no podemos saber la causa/);
  assert.doesNotMatch(mas, /Suele pasar/);

  const menos = texto('4800');
  assert.match(menos, /Te llegaron \$833\.71 menos/); assert.match(menos, /rebasa la tolerancia de \$60\.00/);
  assert.match(menos, /No siempre es un error/); assert.match(menos, /¿Y si no me lo pagan\?/);
  for (const t2 of [exacto, cerca, mas, menos]) assert.doesNotMatch(t2, /te pagaron (bien|mal)|es correcto|está mal/i);
});

test('el comparador remite a la ayuda y no manda importes a la medición', () => {
  const jsx = readFileSync('src/calcAguinaldo.jsx', 'utf8');
  assert.match(jsx, /registrarEvento\('comparar_deposito', \{ calculadora: 'aguinaldo' \}\)/);
  assert.doesNotMatch(jsx, /registrarEvento\('comparar_deposito',[^)]*(veredicto|diferencia|deposito)/);
  assert.doesNotMatch(jsx, /localStorage|sessionStorage/);
});
