import test from 'node:test';
import assert from 'node:assert/strict';
import {
  configAguinaldo2026,
  esRegimenLFT,
  validarAguinaldoPorRegimen2026,
  vacacionesFederalesLFTSE2026,
  permiteCalculoIMSS,
} from '../src/lib/regimen-laboral-2026.mjs';

test('aguinaldo distingue LFT de LFTSE federal', () => {
  assert.equal(configAguinaldo2026('lft').diasMinimos, 15);
  assert.equal(configAguinaldo2026('lftse-federal').diasMinimos, 40);
  assert.equal(configAguinaldo2026('publico-local').calculable, false);
  assert.equal(configAguinaldo2026('publico-especial').calculable, false);
  assert.throws(() => validarAguinaldoPorRegimen2026({ regimen:'lftse-federal', dias:'39' }), /40 días/);
  assert.doesNotThrow(() => validarAguinaldoPorRegimen2026({ regimen:'lftse-federal', dias:'40' }));
});

test('finiquito y liquidación LFT no se extrapolan a régimen público', () => {
  assert.equal(esRegimenLFT('lft'), true);
  for (const regimen of ['lftse-federal','publico-local','publico-especial']) assert.equal(esRegimenLFT(regimen), false);
});

test('vacaciones LFTSE federal requieren más de seis meses y son dos periodos de diez días', () => {
  assert.deepEqual(vacacionesFederalesLFTSE2026('6'), { mesesServicio:6, elegible:false, diasAnuales:0, periodos:0, diasPorPeriodo:0 });
  assert.deepEqual(vacacionesFederalesLFTSE2026('6.01'), { mesesServicio:6.01, elegible:true, diasAnuales:20, periodos:2, diasPorPeriodo:10 });
  assert.throws(() => vacacionesFederalesLFTSE2026('-1'));
});

test('cálculos IMSS se bloquean para ISSSTE u otro instituto', () => {
  assert.equal(permiteCalculoIMSS('imss'), true);
  assert.equal(permiteCalculoIMSS('issste'), false);
  assert.equal(permiteCalculoIMSS('otro'), false);
});
