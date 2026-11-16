import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calcularAguinaldo, calcularAguinaldoNeto, calcularISR } from '../src/lib/calculos-revisados.mjs';
import { calcularFiniquito2026, calcularBrutoNeto2026 } from '../src/lib/calculos-laborales-2026.mjs';

const casos = JSON.parse(readFileSync('public/casos-calculadoras.json', 'utf8'));

function ejecutar(v) {
  switch (v.tipo) {
    case 'aguinaldo': return calcularAguinaldo(v.argumentos);
    case 'aguinaldo-neto': return calcularAguinaldoNeto(v.argumentos);
    case 'isr': return calcularISR(v.argumentos);
    case 'finiquito': return calcularFiniquito2026(v.argumentos);
    case 'bruto-neto': return calcularBrutoNeto2026(v.argumentos);
    default: throw new Error(`Tipo de caso no soportado: ${v.tipo}`);
  }
}

test('los cuatro casos editoriales coinciden con el motor real de MiLana', () => {
  const slugs = ['finiquito', 'aguinaldo', 'isr', 'bruto-a-neto'];
  for (const slug of slugs) {
    const caso = casos[slug];
    assert.ok(caso, `falta caso ${slug}`);
    const resultado = ejecutar(caso.verificacion);
    const real = resultado[caso.verificacion.campo];
    assert.ok(Number.isFinite(real), `${slug}: resultado no numérico`);
    assert.ok(Math.abs(real - caso.verificacion.esperado) < 1e-6, `${slug}: el ejemplo se separó del motor`);
  }
});

test('cada caso explica entradas, resultado y límite del ejemplo', () => {
  for (const [slug, caso] of Object.entries(casos).filter(([k]) => !k.startsWith('_'))) {
    assert.ok(caso.titulo?.length > 15, slug);
    assert.ok(caso.resumen?.length > 40, slug);
    assert.ok(Array.isArray(caso.entradas) && caso.entradas.length >= 3, slug);
    assert.ok(Array.isArray(caso.resultados) && caso.resultados.length >= 1, slug);
    assert.ok(caso.nota?.length > 40, slug);
  }
});

test('el cliente de casos no lee salarios, fechas ni resultados del formulario', () => {
  const js = readFileSync('public/casos-calculadoras-2026.js', 'utf8');
  assert.ok(js.includes("fetch('/casos-calculadoras.json'"));
  assert.ok(!js.includes('FormData('));
  assert.ok(!js.includes('.value'));
  assert.ok(!js.includes('localStorage'));
  assert.ok(!js.includes('sessionStorage'));
});

test('los casos se publican tanto para usuarios como para rastreadores', () => {
  const index = readFileSync('index.html', 'utf8');
  const seo = readFileSync('scripts/inyectar-seo-estatico.mjs', 'utf8');
  assert.ok(index.includes('/casos-calculadoras-2026.js'));
  assert.ok(seo.includes('public/casos-calculadoras.json'));
  assert.ok(seo.includes('data-static-case'));
});

test('R-39: el ejemplo de sueldo neto da lo mismo que la calculadora rápida con el mismo sueldo', async () => {
  const { sbcEstimado } = await import('../src/lib/calculos-directos.mjs');
  const caso = casos['bruto-a-neto'];
  const bruto = String(caso.verificacion.argumentos.brutoMensual);
  // Mismos argumentos que usa CalcBrutoNetoDirecta (src/calculadorasDirectas.jsx).
  const calculadora = calcularBrutoNeto2026({
    brutoMensual: bruto, ingresoGravableISR: bruto, seguridadSocial: 'imss', sbcDiario: String(sbcEstimado(bruto)),
    diasCotizados: '30', soloMinimo: false, periodo: '2026-11', empleadorUnico: true,
  });
  assert.equal(caso.verificacion.argumentos.sbcDiario, String(sbcEstimado(bruto)), 'el ejemplo usa el SBC que estima la calculadora');
  assert.ok(Math.abs(calculadora.netoDespuesISRIMSS - caso.verificacion.esperado) < 1e-6, 'neto del ejemplo = neto de la calculadora');
  const mostrado = Object.fromEntries(caso.resultados.map((r) => [r.etiqueta, r.valor]));
  assert.ok(Math.abs(mostrado['ISR estimado'] - calculadora.retenido) < 1e-6);
  assert.ok(Math.abs(mostrado['Cuota obrera IMSS estimada'] - calculadora.cuotaObrera) < 1e-6);
  assert.ok(Math.abs(mostrado['Neto después de ISR e IMSS'] - calculadora.netoDespuesISRIMSS) < 1e-6);
});
