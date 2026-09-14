import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calcularFiniquito2026,
  calcularLiquidacion2026,
  calcularBrutoNeto2026,
  calcularCuotaObreraIMSS2026,
} from '../src/lib/calculos-laborales-2026.mjs';

const cerca = (actual, esperado, tolerancia = 0.01) => {
  assert.ok(Math.abs(actual - esperado) <= tolerancia, `${actual} no está cerca de ${esperado}`);
};

test('finiquito: caso de referencia julio a septiembre 2026', () => {
  const r = calcularFiniquito2026({
    salarioMensual: '18000', fechaIngreso: '2026-07-01', fechaSalida: '2026-09-14',
    diasTrabajadosNoPagados: '0', vacacionesPendientes: '0', causa: 'renuncia', zona: 'general',
    diasAguinaldo: '15', primaVacacionalPct: '25', diasVacacionesAnuales: '12',
  });
  assert.equal(r.diasAguinaldo, 76);
  cerca(r.aguinaldoProporcional, 1873.97);
  cerca(r.pagoVacaciones, 1499.18);
  cerca(r.primaVacacional, 374.79);
  cerca(r.totalBruto, 3747.95);
  assert.equal(r.primaAntiguedad, 0);
});

test('finiquito: renuncia antes de 15 años no agrega prima de antigüedad', () => {
  const r = calcularFiniquito2026({
    salarioMensual: '18000', fechaIngreso: '2011-09-18', fechaSalida: '2026-09-14',
    causa: 'renuncia', zona: 'general', diasAguinaldo: '15', primaVacacionalPct: '25',
  });
  assert.equal(r.aniosCompletos, 14);
  assert.equal(r.primaAntiguedad, 0);
});

test('finiquito: aniversario de 15 años cuenta exactamente 15 años para prima', () => {
  const r = calcularFiniquito2026({
    salarioMensual: '60000', fechaIngreso: '2011-09-14', fechaSalida: '2026-09-14',
    causa: 'renuncia', zona: 'general', diasAguinaldo: '15', primaVacacionalPct: '25',
  });
  assert.equal(r.aniosCompletos, 15);
  assert.equal(r.aniosEquivalentes, 15);
  cerca(r.topePrimaDiario, 630.08);
  cerca(r.primaAntiguedad, 113414.40);
});

test('liquidación: 90 días usa salario diario integrado y 20 días no se agregan por defecto', () => {
  const r = calcularLiquidacion2026({
    salarioMensual: '18000', fechaIngreso: '2026-01-01', fechaSalida: '2026-09-14',
    relacionIndeterminada: true, incluirVeinteDias: false, zona: 'general',
    diasAguinaldo: '15', primaVacacionalPct: '25', diasVacacionesAnuales: '12',
  });
  cerca(r.factorIntegracion, 1.0493150685, 0.0000001);
  cerca(r.salarioDiarioIntegrado, 629.5890411, 0.0001);
  cerca(r.indemnizacionTresMeses, 56663.01);
  assert.equal(r.indemnizacionVeinteDias, 0);
});

test('liquidación: 20 días por año solo aparece cuando el usuario activa ese escenario', () => {
  const base = {
    salarioMensual: '18000', fechaIngreso: '2024-01-01', fechaSalida: '2026-09-14',
    relacionIndeterminada: true, zona: 'general', diasAguinaldo: '15', primaVacacionalPct: '25',
  };
  const sin = calcularLiquidacion2026({ ...base, incluirVeinteDias: false });
  const con = calcularLiquidacion2026({ ...base, incluirVeinteDias: true });
  assert.equal(sin.indemnizacionVeinteDias, 0);
  assert.ok(con.indemnizacionVeinteDias > 0);
});

test('liquidación rechaza usar el modo sin confirmar relación por tiempo indeterminado', () => {
  assert.throws(() => calcularLiquidacion2026({
    salarioMensual: '18000', fechaIngreso: '2026-01-01', fechaSalida: '2026-09-14',
    relacionIndeterminada: false,
  }), /tiempo indeterminado/);
});

test('IMSS: caso de referencia SBC 1000, 30 días', () => {
  const r = calcularCuotaObreraIMSS2026({ sbcDiario: '1000', diasCotizados: '30', soloMinimo: false });
  cerca(r.cuotaObrera, 790.27);
});

test('IMSS: aplica tope de 25 UMA al SBC', () => {
  const r = calcularCuotaObreraIMSS2026({ sbcDiario: '4000', diasCotizados: '30', soloMinimo: false });
  cerca(r.sbcAplicado, 2932.75);
  cerca(r.cuotaObrera, 2399.28);
});

test('bruto a neto: separa bruto, base ISR y SBC', () => {
  const r = calcularBrutoNeto2026({
    brutoMensual: '30000', ingresoGravableISR: '30000', sbcDiario: '1000', diasCotizados: '30',
    soloMinimo: false, periodo: '2026-09', empleadorUnico: true,
  });
  cerca(r.retenido, 4519.65);
  cerca(r.cuotaObrera, 790.27);
  cerca(r.netoDespuesISRIMSS, 24690.08);
});

test('bruto a neto: salario mínimo declarado no retiene ISR ni cuota obrera', () => {
  const r = calcularBrutoNeto2026({
    brutoMensual: '9451.20', ingresoGravableISR: '9451.20', sbcDiario: '315.04', diasCotizados: '30',
    soloMinimo: true, periodo: '2026-09', empleadorUnico: true,
  });
  assert.equal(r.retenido, 0);
  assert.equal(r.cuotaObrera, 0);
  cerca(r.netoDespuesISRIMSS, 9451.20);
});

test('bruto a neto: exige declaración explícita de salario mínimo', () => {
  assert.throws(() => calcularBrutoNeto2026({
    brutoMensual: '20000', ingresoGravableISR: '20000', sbcDiario: '700', diasCotizados: '30',
    periodo: '2026-09', empleadorUnico: true,
  }), /Indica si percibiste/);
});
