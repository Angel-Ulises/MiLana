import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { normalizar } from '../scripts/match/normalizar-catalogo.mjs';
import {
  alternarSeleccion, clasificarPorFiltros, datoDe, estadoEfectivo, fechaLegible, filasComparacion, GRUPOS_LECTURA,
  leerSeleccion, ordenar, soloDiferencias,
} from '../src/lib/matchCatalog.js';
import { MATCH_CATEGORIAS } from '../src/lib/matchCategorias.js';
import { esRutaFinanzas, esRutaMatch, rutaConExtras } from '../src/lib/routeMatcher.js';

const catalogo = JSON.parse(readFileSync('src/data/match-catalogo.json', 'utf8'));
const producto = (id) => catalogo.productos.find((p) => p.id === id);
const CORTE = '2026-10-12';

test('Las fuentes de Orion copiadas coinciden con el manifiesto SHA-256 de la entrega v2', () => {
  const manifiesto = JSON.parse(readFileSync('data/match/orion-v2/manifest-paquete-v2.json', 'utf8'));
  const archivos = manifiesto.archivos || manifiesto.files || manifiesto.contenido;
  const porRuta = new Map(archivos.map((a) => [a.ruta || a.path || a.archivo, a.sha256]));
  for (const ruta of ['credito/base-v1/catalogo_credito.json', 'credito/ampliacion/catalogo_ampliacion.json', 'ahorro-inversion/catalogo-acumulativo.json', 'indice-catalogo-acumulativo.json', 'metodologia-ux.md']) {
    const esperado = porRuta.get(ruta);
    assert.ok(esperado, `manifiesto sin ${ruta}`);
    const real = createHash('sha256').update(readFileSync(`data/match/orion-v2/${ruta}`)).digest('hex');
    assert.equal(real, esperado, ruta);
  }
});

test('El catálogo publicado es exactamente la normalización de las fuentes', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(normalizar())), catalogo);
});

test('45 fichas únicas en nueve categorías, con los conteos de la entrega', () => {
  assert.equal(catalogo.productos.length, 45);
  assert.equal(new Set(catalogo.productos.map((p) => p.id)).size, 45);
  const conteo = Object.fromEntries(catalogo.categorias.map((c) => [c.id, c.total]));
  assert.deepEqual(conteo, { hipotecas: 3, autos: 3, tarjetas: 8, creditos_personales: 6, cuentas: 3, ahorro: 3, inversion: 3, seguros: 6, afores: 10 });
});

test('N/D, no aplica y retenido nunca se convierten en cero ni en número', () => {
  for (const p of catalogo.productos) for (const d of p.datos) {
    if (['nd', 'na', 'retenido'].includes(d.estado.tipo) && d.valor === undefined) assert.equal(d.numero, undefined, `${p.id}.${d.clave}`);
    if (d.valor === undefined) assert.notEqual(d.estado.tipo, 'verificado', `${p.id}.${d.clave} sin valor no puede estar verificado`);
  }
  assert.equal(datoDe(producto('banamex_personal'), 'cat').estado.tipo, 'nd');
  assert.equal(datoDe(producto('digitt_refinanciamiento'), 'cat').estado.tipo, 'nd');
  for (const p of catalogo.productos.filter((x) => x.categoria === 'seguros')) assert.equal(datoDe(p, 'prima').estado.tipo, 'nd', p.id);
});

test('Cada dato visible conserva al menos una fuente con fecha de consulta', () => {
  for (const p of catalogo.productos) for (const d of p.datos) {
    assert.ok(d.fuentes.length > 0, `${p.id}.${d.clave}`);
    for (const ev of d.fuentes) {
      assert.ok(catalogo.fuentes[ev.f]?.url?.startsWith('http'), `${p.id}.${d.clave}`);
      assert.ok(ev.consulta, `${p.id}.${d.clave} sin fecha de consulta`);
    }
  }
});

test('Conflictos documentados bloquean el CAT: Stori y Nu no aparecen como verificados', () => {
  assert.equal(datoDe(producto('stori_green_clasica_mx'), 'cat').estado.tipo, 'conflicto');
  assert.equal(datoDe(producto('nu_tarjeta_credito'), 'cat').estado.tipo, 'conflicto');
  assert.equal(datoDe(producto('bbva_azul'), 'cat').estado.tipo, 'verificado');
});

test('El corte de CONSAR conserva precisión mensual y no se presenta como día 31', () => {
  assert.equal(catalogo.consar.corte, '2026-08');
  assert.equal(fechaLegible('2026-08'), 'agosto de 2026');
  const irn = datoDe(producto('afore_sura_sb9094'), 'irn');
  assert.ok(irn.fuentes.every((f) => f.corte === '2026-08' && f.publicacion === '2026-09-15'));
  assert.ok(!JSON.stringify(catalogo.productos.filter((p) => p.categoria === 'afores')).includes('2026-08-31'));
});

test('Sólo Afores ofrece orden numérico; los CAT publicitarios no se ordenan', () => {
  for (const id of ['hipotecas', 'autos', 'tarjetas', 'creditos_personales', 'cuentas', 'ahorro', 'inversion', 'seguros']) assert.deepEqual(MATCH_CATEGORIAS[id].ordenes, [], id);
  const afores = catalogo.productos.filter((p) => p.categoria === 'afores');
  const { ordenados, excluidos } = ordenar(afores, { clave: 'irn', direccion: 'desc' }, CORTE);
  assert.equal(excluidos.length, 0);
  assert.equal(ordenados[0].id, 'afore_profuturo_sb9094');
  const irns = ordenados.map((p) => datoDe(p, 'irn').numero);
  assert.deepEqual(irns, [...irns].sort((a, b) => b - a));
});

test('Un dato no comparable sale del orden y se explica, sin ir al final como si fuera peor', () => {
  const tarjetas = catalogo.productos.filter((p) => p.categoria === 'tarjetas');
  const { ordenados, excluidos } = ordenar(tarjetas, { clave: 'cat', direccion: 'asc' }, CORTE);
  const fuera = excluidos.map((x) => x.producto.id);
  assert.ok(fuera.includes('stori_green_clasica_mx'));
  assert.ok(fuera.includes('nu_tarjeta_credito'));
  assert.ok(!ordenados.some((p) => fuera.includes(p.id)));
  assert.ok(excluidos.every((x) => x.motivo));
});

test('El patrocinio no altera orden, desempate ni selección', () => {
  const afores = catalogo.productos.filter((p) => p.categoria === 'afores');
  const base = ordenar(afores, { clave: 'comision_saldo', direccion: 'asc' }, CORTE).ordenados.map((p) => p.id);
  const patrocinadas = afores.map((p, i) => (i % 2 ? { ...p, relacionComercial: { tipo: 'patrocinio', entidad: 'X', descripcion: 'Prueba.' } } : p));
  assert.deepEqual(ordenar(patrocinadas, { clave: 'comision_saldo', direccion: 'asc' }, CORTE).ordenados.map((p) => p.id), base);
  assert.equal(base[0], 'afore_pensionissste_sb9094');
});

test('Sin afiliaciones aprobadas al corte: ninguna ficha se etiqueta como patrocinada', () => {
  assert.ok(catalogo.productos.every((p) => p.relacionComercial === null));
});

test('Una vigencia vencida pasa a Caducado y un plazo editorial vencido a Revisión vencida', () => {
  const cat = datoDe(producto('banregio_win'), 'cat');
  assert.equal(estadoEfectivo(cat, CORTE, 'tarjetas').tipo, 'verificado');
  assert.equal(estadoEfectivo(cat, '2026-10-31', 'tarjetas').tipo, 'caducado');
  const cat2 = datoDe(producto('bbva_azul'), 'cat');
  assert.equal(estadoEfectivo(cat2, '2026-11-12', 'tarjetas').tipo, 'revision');
  assert.equal(ordenar([producto('banregio_win')], { clave: 'cat' }, '2026-10-31').excluidos.length, 1);
});

test('Filtros con tres resultados: coincide, no coincide y no comprobable', () => {
  const tarjetas = catalogo.productos.filter((p) => p.categoria === 'tarjetas');
  const r = clasificarPorFiltros(tarjetas, { anualidad: 'si' }, MATCH_CATEGORIAS.tarjetas.filtros);
  assert.ok(r.coinciden.some((p) => p.id === 'banregio_win'));
  assert.ok(r.noCoinciden.some((p) => p.id === 'bbva_azul'));
  assert.ok(r.sinComprobar.some((x) => x.producto.id === 'klar_tarjeta_credito'));
  assert.equal(r.coinciden.length + r.noCoinciden.length + r.sinComprobar.length, tarjetas.length);
});

test('Comparación: filas agrupadas y «sólo diferencias» no pierde filas distintas', () => {
  const ps = [producto('afore_sura_sb9094'), producto('afore_pensionissste_sb9094')];
  const grupos = filasComparacion(ps, GRUPOS_LECTURA);
  const dif = soloDiferencias(grupos).flatMap((g) => g.filas.map((f) => f.clave));
  assert.ok(dif.includes('irn'));
  assert.ok(dif.includes('comision_saldo'));
  assert.ok(!dif.includes('siefore_cohorte'));
});

test('La URL sólo lleva identificadores válidos de producto, hasta cuatro', () => {
  const ids = catalogo.productos.map((p) => p.id);
  assert.deepEqual(leerSeleccion('?comparar=bbva_azul,falso,hsbc_zero,bbva_azul', ids), ['bbva_azul', 'hsbc_zero']);
  assert.equal(leerSeleccion('?comparar=' + ids.slice(0, 6).join(','), ids).length, 4);
  assert.equal(alternarSeleccion(['a', 'b', 'c', 'd'], 'e').mensaje, 'limite');
});

test('Rutas: Match tiene vista propia dentro de Finanzas y no carga extras ajenos', () => {
  assert.ok(esRutaMatch('/finanzas/match'));
  assert.ok(esRutaMatch('/finanzas/match/tarjetas/bbva-azul'));
  assert.ok(!esRutaMatch('/finanzas/presupuesto'));
  assert.ok(esRutaFinanzas('/finanzas/match'), 'Finanzas también coincide; main.jsx debe evaluar Match primero');
  assert.match(readFileSync('src/main.jsx', 'utf8'), /const finanzas = !match && esRutaFinanzas\(\)/);
  const extras = rutaConExtras('/finanzas/match/tarjetas');
  assert.equal(extras.investmentEntry, false);
  assert.equal(extras.savedStateContext, false);
});

test('cetes_1_mes usa el snapshot CETES verificado sólo en los campos de la tabla oficial, con fecha explícita', async () => {
  const { CETES_REFERENCE } = await import('../src/data/cetes-reference.js');
  const p = producto('cetes_1_mes');
  const tabla = ['tasa_observada', 'plazo_tabla', 'precio_indicativo', 'otras_tasas_por_plazo'];
  const m = (dias) => CETES_REFERENCE.products.find((x) => x.days === dias);
  assert.equal(datoDe(p, 'tasa_observada').numero, m(28).grossAnnualRatePct);
  assert.equal(datoDe(p, 'precio_indicativo').valor, '$9.94 MXN por título');
  assert.deepEqual(datoDe(p, 'otras_tasas_por_plazo').valor, [`3 meses: ${m(91).grossAnnualRatePct} % anual bruto`, `6 meses: ${m(182).grossAnnualRatePct} % anual bruto`, `1 año: ${m(364).grossAnnualRatePct} % anual bruto`, `2 años: ${m(728).grossAnnualRatePct} % anual bruto`]);
  for (const clave of tabla) {
    const ev = datoDe(p, clave).fuentes;
    assert.equal(ev.length, 1, clave);
    assert.equal(catalogo.fuentes[ev[0].f].url, CETES_REFERENCE.sourceUrl, clave);
    assert.equal(ev[0].corte, CETES_REFERENCE.sourceDate, `${clave}: fecha de la tabla explícita`);
    assert.equal(ev[0].consulta, CETES_REFERENCE.checkedAt, clave);
    assert.match(ev[0].vigenciaTexto, /no es fecha de subasta/, clave);
  }
  // Los campos de otras páginas oficiales conservan su consulta original: no se mezclan cortes.
  for (const d of p.datos.filter((x) => !tabla.includes(x.clave))) assert.ok(d.fuentes.every((f) => f.consulta === '2026-10-12' && !f.corte), d.clave);
  assert.equal(p.actualizacion.fechaSubasta, null);
  assert.equal(p.actualizacion.corteAnterior, '2026-10-12');
  assert.match(p.alertas[0], /6 de noviembre de 2026/);
  assert.ok(!p.alertas.some((a) => /12 octubre/.test(a)), 'sin advertencia con la fecha vieja');
});

test('la actualización CETES no se aplica con un snapshot anterior o incompleto', async () => {
  const { actualizarCetesTabla } = await import('../scripts/match/normalizar-catalogo.mjs');
  const { CETES_REFERENCE } = await import('../src/data/cetes-reference.js');
  const crudo = JSON.parse(readFileSync('data/match/orion-v2/ahorro-inversion/catalogo-acumulativo.json', 'utf8')).productos.find((p) => p.id === 'cetes_1_mes');
  assert.equal(actualizarCetesTabla(crudo, { ...CETES_REFERENCE, sourceDate: '2026-10-01' }), crudo, 'una tabla anterior al corte de Orion no lo sustituye');
  assert.throws(() => actualizarCetesTabla(crudo, { ...CETES_REFERENCE, products: CETES_REFERENCE.products.slice(1) }), /incompleto/);
});

test('tasas por plazo y ponderaciones conservan la unidad de porcentaje del campo', () => {
  assert.deepEqual(datoDe(producto('afore_sura_sb9094'), 'metodologia_irn').valor, ['10 años peso: 50 %', '5 años peso: 30 %', '3 años peso: 20 %']);
});
