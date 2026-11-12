// Actualizaciones verificadas posteriores a la entrega de Orion (los JSON de orion-v2 no se editan).
// Lectura delegada del 2026-11-10 (data/match/actualizaciones/2026-11-10-lectura-delegada.json):
// 10 Afores SB 90–94 (IRN septiembre 2026), Klar Light 30 días y Win Banregio.
// Reglas: solo se tocan los IDs y campos listados; cada campo conserva su valor anterior en el historial;
// si la fuente del campo o el corte previo no coinciden con lo esperado, el build falla.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const LECTURA_DELEGADA = JSON.parse(readFileSync(resolve(RAIZ, 'data/match/actualizaciones/2026-11-10-lectura-delegada.json'), 'utf8'));

const PROCEDENCIA = 'Lectura delegada del 10-11-2026 (transcripción aportada por el equipo de MiLana; esta sesión no reabrió la URL).';
const PROCEDENCIA_CORTA = 'lectura delegada del 10-11-2026; esta sesión no reabrió la URL';
const pct = (n) => `${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;

// ---------- Ahorro e inversión (Afores y Klar) ----------
function historialAhorro(texto, fuentePrevia, nota) {
  return { texto, nota, fuente: { ...fuentePrevia } };
}

export function actualizarAforeIRN(p, lectura = LECTURA_DELEGADA) {
  const fila = lectura.fuentes.consar_irn.irnSB9094[p.id];
  if (!fila) return p;
  const c = p.campos.irn;
  const fuente = c.fuentes[0];
  if (c.fuentes.length !== 1 || fuente.url !== lectura.fuentes.consar_irn.url) throw new Error(`IRN con otra fuente: ${p.id}`);
  if (fuente.fecha_corte !== '2026-08') return p; // solo actualiza el corte de agosto de la entrega de Orion
  // Control cruzado: la columna de agosto de la lectura delegada debe coincidir con el valor de Orion.
  if (Math.abs(fila.agosto2026 - c.valor) > 1e-9) {
    return { ...p, conflictoActualizacion: `IRN agosto 2026: Orion ${c.valor}, lectura delegada ${fila.agosto2026}. No se actualizó.` };
  }
  const nueva = {
    ...fuente,
    consulta_iso: lectura.fechaLectura,
    verificacion_iso: null,
    fecha_corte: lectura.fuentes.consar_irn.corte,
    fecha_corte_precision: 'mes',
    fecha_corte_nota: 'La fuente identifica septiembre de 2026, sin día de cierre expreso.',
    fecha_publicacion: null,
    fecha_publicacion_precision: null,
    fecha_publicacion_nota: 'La lectura delegada no transcribe la fecha de publicación de estadísticas.',
    vigencia: { desde: null, hasta: null, texto: `Último corte visible: septiembre 2026; cifras preliminares; indicador histórico. ${PROCEDENCIA}` },
  };
  return {
    ...p,
    campos: { ...p.campos, irn: { ...c, valor: fila.septiembre2026, fuentes: [nueva], supuestos_y_limites: String(c.supuestos_y_limites || '').replace(/^Agosto de 2026/, 'Septiembre de 2026') } },
    advertencias: [
      'La categoría cubre las diez administradoras que figuran en la tabla de CONSAR para SB 90–94. IRN con corte de septiembre de 2026 (cifras preliminares); comisiones con corte de agosto de 2026. No otras cohortes ni periodos.',
      ...p.advertencias.slice(1),
    ],
    historialActualizacion: [historialAhorro(`IRN ${pct(c.valor)} con corte de agosto de 2026 (consulta del 12-10-2026).`, fuente, 'Sustituido por el corte de septiembre de 2026.')],
    actualizacion: { campos: ['irn'], corte: '2026-09', corteAnterior: '2026-08', revisado: lectura.fechaLectura, procedencia: PROCEDENCIA },
  };
}

const CAMPOS_KLAR = ['tasa_anual', 'gat_nominal', 'gat_real', 'plazo', 'monto_ejemplo_gat', 'segmento'];
export function actualizarKlarLight30(p, lectura = LECTURA_DELEGADA) {
  const k = lectura.fuentes.klar_gat;
  if (p.id !== k.producto) return p;
  const valores = { tasa_anual: k.tasaAnual, gat_nominal: k.gatNominal, gat_real: k.gatReal, plazo: k.plazoDias, monto_ejemplo_gat: k.montoEjemplo, segmento: k.segmento };
  const campos = { ...p.campos };
  const historial = [];
  for (const clave of CAMPOS_KLAR) {
    const c = campos[clave];
    if (!c || c.fuentes.length !== 1 || c.fuentes[0].url !== k.url) throw new Error(`Campo Klar con otra fuente: ${clave}`);
    const previa = c.fuentes[0];
    if (previa.vigencia?.hasta !== '2026-11-07') return p; // solo sustituye la tabla de octubre de Orion
    if (typeof c.valor === 'number' ? Math.abs(c.valor - valores[clave]) > 1e-9 : String(c.valor) !== String(valores[clave])) {
      historial.push(historialAhorro(`${clave}: ${c.valor} (tabla calculada del 7 de octubre al 7 de noviembre de 2026).`, previa, 'Valor anterior, no usar como vigente.'));
    }
    campos[clave] = {
      ...c,
      valor: valores[clave],
      fuentes: [{ ...previa, consulta_iso: lectura.fechaLectura, vigencia: { desde: k.vigencia.desde, hasta: k.vigencia.hasta, texto: `Depósitos a plazo: la tabla dice calculado del 5 de noviembre al 7 de diciembre de 2026; no hay día único de cálculo. ${PROCEDENCIA}` } }],
    };
  }
  return {
    ...p,
    campos,
    advertencias: [
      'Tabla de Depósitos a Plazo, segmento Light, calculada del 5 de noviembre al 7 de diciembre de 2026.',
      ...p.advertencias.slice(1),
    ],
    historialActualizacion: [
      historialAhorro('Tasa 6.2 %, GAT nominal 6.42 % y GAT real 2.25 % con la tabla calculada del 7 de octubre al 7 de noviembre de 2026 (consulta del 12-10-2026).', p.campos.tasa_anual.fuentes[0], 'Vigencia anterior vencida; las cifras de la tabla nueva son iguales.'),
      ...historial,
    ],
    actualizacion: { campos: CAMPOS_KLAR, vigencia: k.vigencia, vigenciaAnterior: { desde: '2026-10-07', hasta: '2026-11-07' }, revisado: lectura.fechaLectura, procedencia: PROCEDENCIA },
  };
}

// ---------- Crédito base (Win Banregio) ----------
export function registroBanregioRecompensas(lectura = LECTURA_DELEGADA) {
  const b = lectura.fuentes.banregio_recompensas;
  return { id: 'banregio_recompensas', url: b.url, titulo: b.titulo, localizador: 'Costo Anual Total (CAT) Tarjeta Win Banregio', fecha_consulta: lectura.fechaLectura, fecha_emision: null, tipo: 'primaria' };
}

export function actualizarBanregioWin(p, lectura = LECTURA_DELEGADA) {
  const b = lectura.fuentes.banregio_recompensas;
  if (p.id !== b.producto) return p;
  const { cat, tasa, anualidad, beneficios } = p.campos;
  if (cat.fecha_calculo !== '2026-04-30' || cat.vigente_hasta !== '2026-10-30') return p; // solo sustituye el CAT de la entrega de Orion
  if (tasa.fuente_id !== 'win_pdf' || anualidad.fuente_id !== 'win' || beneficios.fuente_id !== 'win') throw new Error('Win Banregio con fuentes inesperadas');
  if (beneficios.valor.recompensas_fisica_pct !== b.recompensasFisicaPct || beneficios.valor.recompensas_virtual_en_linea_pct !== b.recompensasVirtualEnLineaPct) throw new Error('Recompensas Win distintas: revisar antes de actualizar');
  if (anualidad.valor.monto !== b.anualidadSinIVA) throw new Error('Anualidad Win distinta: revisar antes de actualizar');
  const localizador = 'Costo Anual Total (CAT) Tarjeta Win Banregio';
  const campos = {
    ...p.campos,
    cat: {
      ...cat,
      valor: { ...cat.valor, porcentaje: b.catPromedioSinIVA, tipo: 'promedio', iva: 'sin_IVA' },
      fuente_url: b.url, fuente_id: 'banregio_recompensas', fecha_consulta: lectura.fechaLectura,
      fecha_calculo: b.calculo, vigente_desde: null, vigente_hasta: b.vigenteHasta, estado: 'vigente_al_corte', localizador,
      nota: `«Tasa Variable» (${PROCEDENCIA_CORTA}).`,
    },
    // Promedio ponderado y tipo, de la página de recompensas (10-11-2026). Fórmulas mínima y máxima e IVA, del folleto PDF (12-10-2026).
    tasa: {
      ...tasa,
      valor: { ...tasa.valor, tipo: b.tasaTipo, promedio_ponderado_anual_pct: b.tasaPromedioPonderada },
      fuente_urls: [b.url, tasa.fuente_url], fuente_ids: ['banregio_recompensas', 'win_pdf'],
      fechas_consulta: [lectura.fechaLectura, tasa.fecha_consulta],
      localizador,
      nota: `Tipo y promedio ponderado: ${b.url} (cálculo al 31-08-2026, oferta al 28-02-2027; ${PROCEDENCIA_CORTA}). Fórmulas mínima/máxima e IVA: folleto PDF consultado el 12-10-2026, sin vigencia explícita.`,
    },
    anualidad: {
      ...anualidad,
      fuente_urls: [b.url, anualidad.fuente_url], fuente_ids: ['banregio_recompensas', 'win'],
      fechas_consulta: [lectura.fechaLectura, anualidad.fecha_consulta],
      localizador,
      nota: `La página de recompensas confirma «comisión anual $0 Sin IVA» (${PROCEDENCIA_CORTA}).`,
    },
    beneficios: {
      ...beneficios,
      fuente_urls: [b.url, beneficios.fuente_url], fuente_ids: ['banregio_recompensas', 'win'],
      fechas_consulta: [lectura.fechaLectura, beneficios.fecha_consulta],
      localizador,
      nota: `${beneficios.nota || ''} La página de recompensas confirma 1 % física y 2 % en compras en línea con la virtual (${PROCEDENCIA_CORTA}).`.trim(),
    },
  };
  return {
    ...p,
    campos,
    historialActualizacion: [
      { valor: `CAT 40.6 % promedio sin IVA, cálculo del 30-04-2026, vigente hasta el 30-10-2026 (consulta del 12-10-2026).`, nota: 'Sustituido por el CAT con cálculo del 31-08-2026.', fuente_url: cat.fuente_url, fuente_id: cat.fuente_id, fecha_consulta: cat.fecha_consulta, fecha_calculo: cat.fecha_calculo, vigente_hasta: cat.vigente_hasta, localizador: cat.localizador },
      { valor: 'Tasa promedio ponderada anual 34.2 % (folleto PDF consultado el 12-10-2026).', nota: 'Sustituida por 34.1 % (cálculo del 31-08-2026).', fuente_url: tasa.fuente_url, fuente_id: tasa.fuente_id, fecha_consulta: tasa.fecha_consulta, localizador: tasa.localizador },
    ],
    actualizacion: { campos: ['cat', 'tasa', 'anualidad', 'beneficios'], calculo: b.calculo, vigenteHasta: b.vigenteHasta, calculoAnterior: '2026-04-30', revisado: lectura.fechaLectura, procedencia: PROCEDENCIA },
  };
}
