import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  esRutaProfesion, esRutaOcupaciones, esRutaCompararCarreras,
  esRutaCompararEstados, esRutaEstado, esRutaCarreras,
  esRutaFondosCNBV, esRutaCetesReferencia, esRutaCompararInstrumentos,
  esRutaInversionEducativa, esRutaAsesor, esRutaFinanzas, esRutaEconomia, esRutaInvertir,
  rutaConExtras,
} from '../src/lib/routeMatcher.js';

const selectores = [
  ['profesion', esRutaProfesion],
  ['ocupaciones', esRutaOcupaciones],
  ['compararCarreras', esRutaCompararCarreras],
  ['compararEstados', esRutaCompararEstados],
  ['estados', esRutaEstado],
  ['carreras', esRutaCarreras],
  ['fondosCNBV', esRutaFondosCNBV],
  ['cetesReferencia', esRutaCetesReferencia],
  ['compararInstrumentos', esRutaCompararInstrumentos],
  ['inversion', esRutaInversionEducativa],
  ['asesor', esRutaAsesor],
  ['finanzas', esRutaFinanzas],
  ['economia', esRutaEconomia],
  ['invertir', esRutaInvertir],
];
const prioridad = [
  ['/carreras/profesion/medicina', 'profesion'],
  ['/carreras/ocupaciones', 'ocupaciones'],
  ['/carreras/comparar', 'compararCarreras'],
  ['/estados/comparar', 'compararEstados'],
  ['/estados/nuevo-leon', 'estados'],
  ['/estados', 'estados'],
  ['/carreras', 'carreras'],
  ['/carreras/mejor-pagadas', 'carreras'],
  ['/finanzas/inversion/fondos', 'fondosCNBV'],
  ['/finanzas/inversion/cetes', 'cetesReferencia'],
  ['/finanzas/inversion/comparar', 'compararInstrumentos'],
  ['/finanzas/inversion', 'inversion'],
  ['/finanzas/mi-situacion', 'asesor'],
  ['/finanzas/deuda-y-credito', 'finanzas'],
  ['/economia', 'economia'],
  ['/invertir', 'invertir'],
  ['/economia/banxico-mantiene-tasa-650-septiembre-2026', 'economia'],
  ['/calculadoras/isr', null],
  ['/', null],
];
test('Las rutas conservan su prioridad sin importar otros módulos de página', () => {
  for (const [p, id] of prioridad) {
    for (const pathname of [p, p === '/' ? p : p + '/']) {
      const first = selectores.find(([, matcher]) => matcher(pathname))?.[0] || null;
      assert.equal(first, id, pathname);
    }
  }
});
test('Los complementos se cargan solo donde sus portales existen', () => {
  const home = rutaConExtras('/');
  assert.equal(home.stateEntry, true);
  assert.equal(home.advisorEntry, true);
  assert.equal(home.stateHousing, false);
  const carrera = rutaConExtras('/carreras');
  assert.equal(carrera.occupationEntry, true);
  assert.equal(carrera.stateEntry, true);
  const estado = rutaConExtras('/estados/nuevo-leon');
  assert.equal(estado.stateHousing, true);
  assert.equal(estado.stateOccupations, true);
  assert.equal(estado.stateCompareEntry, true);
  assert.equal(estado.savedStateContext, false);
  const finances = rutaConExtras('/finanzas/ahorro');
  assert.equal(finances.savedStateContext, true);
  assert.equal(finances.investmentEntry, true);
  const investment = rutaConExtras('/finanzas/inversion');
  assert.equal(investment.investmentEntry, false);
  assert.equal(investment.investmentCompareEntry, true);
  const economy = rutaConExtras('/economia');
  assert.ok(Object.values(economy).every(v => v === false));
});
test('La entrada ofrece lazy-loading por ruta y mantiene intactas las hojas compartidas', () => {
  const source = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
  for (const file of ['App', 'careerPages', 'statePages', 'financePages', 'economyPages', 'careerProfessionPages', 'advisorPage']) {
    assert.match(source, new RegExp('React\\.lazy\\(\\(\\) => import\\(\'\\./' + file + '\\.jsx\'\\)\\)'));
    assert.doesNotMatch(source, new RegExp('^import\\s+\\w+\\s+from\\s+\'\\./' + file + '\\.jsx\'', 'm'));
  }
  assert.match(source, /<JourneyCompanion \/>/);
  assert.match(source, /<React\.Suspense fallback=\{null\}>/);
  assert.match(source, /import '\.\/economy-ux\.css'/);
  assert.match(source, /import '\.\/design-home\.css'/, 'Los estilos globales no pueden esperar al módulo de calculadoras');
});