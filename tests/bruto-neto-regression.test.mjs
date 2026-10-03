import assert from 'node:assert/strict';
import test from 'node:test';
import { calcularBrutoNeto2026 } from '../src/lib/calculos-laborales-2026.mjs';

test('bruto a neto conserva las percepciones brutas aunque la base ISR sea menor', () => {
  const r = calcularBrutoNeto2026({
    brutoMensual: '30000',
    ingresoGravableISR: '20000',
    sbcDiario: '315.04',
    diasCotizados: '30',
    soloMinimo: true,
    periodo: '2026-09',
    empleadorUnico: true,
  });

  assert.equal(r.bruto, 30000);
  assert.equal(r.gravable, 20000);
  assert.equal(r.retenido, 0);
  assert.equal(r.cuotaObrera, 0);
  assert.equal(r.netoDespuesISRIMSS, 30000);
});
