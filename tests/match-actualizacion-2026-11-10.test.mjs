import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LECTURA_DELEGADA, actualizarAforeIRN, actualizarKlarLight30, actualizarBanregioWin } from '../scripts/match/actualizaciones-verificadas.mjs';

const catalogo = JSON.parse(readFileSync('src/data/match-catalogo.json', 'utf8'));
const ahorro = JSON.parse(readFileSync('data/match/orion-v2/ahorro-inversion/catalogo-acumulativo.json', 'utf8'));
const producto = (id) => catalogo.productos.find((p) => p.id === id);
const dato = (p, clave) => p.datos.find((d) => d.clave === clave);
const fuente = (f) => ({ ...catalogo.fuentes[f.f], ...f });

const SEPTIEMBRE = { afore_azteca_sb9094: 7.73, afore_banamex_sb9094: 8.40, afore_coppel_sb9094: 7.58, afore_inbursa_sb9094: 8.92, afore_invercap_sb9094: 8.73, afore_pensionissste_sb9094: 7.59, afore_principal_sb9094: 8.14, afore_profuturo_sb9094: 9.56, afore_sura_sb9094: 9.04, afore_xxi_banorte_sb9094: 8.98 };

test('la evidencia delegada guarda URL, fecha y procedencia sin decir que esta sesión reabrió las páginas', () => {
  assert.equal(LECTURA_DELEGADA.fechaLectura, '2026-11-10');
  assert.match(LECTURA_DELEGADA.procedencia, /Lectura delegada/);
  assert.match(LECTURA_DELEGADA.procedencia, /no reabrió/);
  assert.equal(LECTURA_DELEGADA.fuentes.consar_irn.url, 'https://www.consar.gob.mx/gobmx/aplicativo/siset/Series.aspx?cd=212');
  assert.equal(LECTURA_DELEGADA.fuentes.klar_gat.urlLeida, 'https://www.klar.mx/gat');
  assert.equal(LECTURA_DELEGADA.fuentes.banregio_recompensas.url, 'https://recompensas.banregio.com/');
  for (const f of Object.values(LECTURA_DELEGADA.fuentes)) assert.ok(f.extracto.length >= 3);
});

test('las 10 Afores SB 90–94 usan el IRN de septiembre de 2026 y guardan el de agosto en el historial', () => {
  for (const [id, valor] of Object.entries(SEPTIEMBRE)) {
    const p = producto(id);
    const irn = dato(p, 'irn');
    assert.equal(irn.numero, valor, id);
    assert.equal(irn.estado.codigo, 'historico_misma_cohorte_corte', id);
    assert.deepEqual(irn.fuentes.map(fuente).map((f) => [f.url, f.corte, f.consulta]), [[LECTURA_DELEGADA.fuentes.consar_irn.url, '2026-09', '2026-11-10']], id);
    assert.match(irn.nota, /^Septiembre de 2026, cifras preliminares/, id);
    const agosto = LECTURA_DELEGADA.fuentes.consar_irn.irnSB9094[id].agosto2026;
    assert.equal(p.historial.length, 1, id);
    assert.ok(p.historial[0].texto.includes('agosto de 2026'), id);
    assert.equal(fuente(p.historial[0].fuentes[0]).corte, '2026-08', id);
    assert.ok(p.historial[0].texto.includes(agosto.toFixed(2)), id);
    // Las comisiones no están en la lectura delegada: conservan el corte y la consulta de Orion.
    assert.ok(dato(p, 'comision_saldo').fuentes.map(fuente).every((f) => f.corte === '2026-08' && f.consulta === '2026-10-12'), id);
    assert.match(p.estadoUso, /2026-09/, id);
  }
});

test('si la columna de agosto no coincide con Orion, la Afore no se actualiza y queda el conflicto', () => {
  const original = ahorro.productos.find((p) => p.id === 'afore_azteca_sb9094');
  const alterada = structuredClone(LECTURA_DELEGADA);
  alterada.fuentes.consar_irn.irnSB9094.afore_azteca_sb9094.agosto2026 = 7.70;
  const r = actualizarAforeIRN(original, alterada);
  assert.equal(r.campos.irn.valor, original.campos.irn.valor);
  assert.match(r.conflictoActualizacion, /No se actualizó/);
});

test('Klar Light 30 días: misma tasa y GAT con la vigencia del 5 de noviembre al 7 de diciembre de 2026, sin mezclar Plus ni Platino', () => {
  const p = producto('klar_deposito_light_30');
  for (const [clave, numero] of [['tasa_anual', 6.2], ['gat_nominal', 6.42], ['gat_real', 2.25]]) {
    const d = dato(p, clave);
    assert.equal(d.numero, numero, clave);
    assert.deepEqual(d.fuentes.map(fuente).map((f) => [f.url, f.consulta, f.desde, f.hasta]), [['https://www.klar.mx/gat/', '2026-11-10', '2026-11-05', '2026-12-07']], clave);
    assert.ok(!('calculo' in d.fuentes[0]), 'la fuente da un intervalo, no una fecha de cálculo puntual');
  }
  assert.equal(dato(p, 'segmento').valor, 'Light');
  assert.equal(dato(p, 'minimo_inversion').fuentes.map(fuente)[0].consulta, '2026-10-12', 'campos de otra página no cambian');
  assert.equal(p.historial.length, 1);
  assert.match(p.historial[0].texto, /7 de octubre al 7 de noviembre/);
  const otroKlar = actualizarKlarLight30({ id: 'klar_deposito_plus_30', campos: {} });
  assert.deepEqual(otroKlar, { id: 'klar_deposito_plus_30', campos: {} });
});

test('Win Banregio: CAT 40.3 % con cálculo al 31-08-2026 y oferta al 28-02-2027; tasa 34.1 % con fuentes y fechas separadas', () => {
  const p = producto('banregio_win');
  const cat = dato(p, 'cat');
  assert.equal(cat.numero, 40.3);
  assert.equal(cat.estado.codigo, 'vigente_al_corte');
  assert.deepEqual(cat.fuentes.map(fuente).map((f) => [f.url, f.consulta, f.calculo, f.hasta]), [['https://recompensas.banregio.com/', '2026-11-10', '2026-08-31', '2027-02-28']]);
  const tasa = dato(p, 'tasa');
  assert.ok(tasa.valor.includes('Promedio ponderado anual: 34.1 %'));
  assert.ok(tasa.valor.some((v) => v.startsWith('Fórmula mínima')), 'las fórmulas del folleto se conservan');
  assert.deepEqual(tasa.fuentes.map(fuente).map((f) => [f.url, f.consulta, f.localizador]), [
    ['https://recompensas.banregio.com/', '2026-11-10', 'Costo Anual Total (CAT) Tarjeta Win Banregio'],
    ['https://portalbanregio.s3.amazonaws.com/assets/naranja/img/Tarjetas-Credito.pdf', '2026-10-12', 'Páginas 3–6'],
  ]);
  assert.equal(dato(p, 'anualidad').numero, 0);
  assert.ok(dato(p, 'comisiones').fuentes.map(fuente).every((f) => f.consulta === '2026-10-12'), 'comisiones sin respaldo nuevo no cambian');
  assert.ok(dato(p, 'requisitos').fuentes.map(fuente).every((f) => f.consulta === '2026-10-12'));
  assert.equal(p.historial.length, 2);
  assert.match(p.historial[0].texto, /CAT 40\.6 %/);
  assert.match(p.historial[1].texto, /34\.2 %/);
  assert.deepEqual(actualizarBanregioWin({ id: 'bbva_azul', campos: {} }), { id: 'bbva_azul', campos: {} });
});

test('solo las 12 fichas autorizadas (más CETES de #103/#160) llevan registro de actualización', () => {
  const actualizadas = catalogo.productos.filter((p) => p.actualizacion).map((p) => p.id).sort();
  assert.deepEqual(actualizadas, [...Object.keys(SEPTIEMBRE), 'banregio_win', 'cetes_1_mes', 'klar_deposito_light_30'].sort());
  assert.equal(producto('cetes_1_mes').actualizacion.fechaTabla, '2026-11-11', 'CETES conserva el corte del 11-11-2026 (#160)');
  assert.equal(catalogo.fechaCorte, '2026-10-12', 'el corte general del catálogo no se presenta como revisado hoy');
});
