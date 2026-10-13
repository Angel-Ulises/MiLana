// MiLana Match: normaliza la entrega acumulativa v2 de Orion (tres esquemas) a un catálogo de lectura.
// No inventa datos: un valor nulo conserva su estado (ND, no aplica, retenido, conflicto…) y nunca se convierte en 0.
// Uso: node scripts/match/normalizar-catalogo.mjs  → escribe src/data/match-catalogo.json
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const ORIGEN = resolve(RAIZ, 'data/match/orion-v2');
const leer = (ruta) => JSON.parse(readFileSync(resolve(ORIGEN, ruta), 'utf8'));

export const CATEGORIAS = [
  { id: 'hipotecas', slug: 'hipotecas', nombre: 'Hipotecas', origen: ['credito_hipotecario'] },
  { id: 'autos', slug: 'automotriz', nombre: 'Crédito automotriz', origen: ['credito_automotriz'] },
  { id: 'tarjetas', slug: 'tarjetas', nombre: 'Tarjetas de crédito', origen: ['tarjeta_credito'] },
  { id: 'creditos_personales', slug: 'creditos-personales', nombre: 'Créditos personales', origen: ['credito_personal', 'credito_personal_consolidacion', 'credito_personal_financiamiento_colectivo'] },
  { id: 'cuentas', slug: 'cuentas', nombre: 'Cuentas', origen: ['cuentas'] },
  { id: 'ahorro', slug: 'ahorro', nombre: 'Ahorro y SOFIPOs', origen: ['ahorro_sofipos'] },
  { id: 'inversion', slug: 'inversiones', nombre: 'Inversiones', origen: ['inversion'] },
  { id: 'seguros', slug: 'seguros', nombre: 'Seguros', origen: ['seguros'] },
  { id: 'afores', slug: 'afores', nombre: 'Afores', origen: ['afores'] },
];

// ---------- Texto ----------
const ACENTOS = {
  comision: 'comisión', comisiones: 'comisiones', minimo: 'mínimo', minima: 'mínima', maximo: 'máximo', maxima: 'máxima',
  anios: 'años', anio: 'año', credito: 'crédito', linea: 'línea', garantia: 'garantía', version: 'versión', poliza: 'póliza',
  proteccion: 'protección', contratacion: 'contratación', reposicion: 'reposición', extravio: 'extravío', administracion: 'administración',
  inversion: 'inversión', numero: 'número', deposito: 'depósito', depositos: 'depósitos', documentacion: 'documentación',
  exencion: 'exención', disposicion: 'disposición', intereses: 'intereses', interes: 'interés', vehiculos: 'vehículos', vehiculo: 'vehículo',
  danos: 'daños', medicos: 'médicos', medica: 'médica', cobertura: 'cobertura', ingreso: 'ingreso', unico: 'único', publico: 'público',
  periodicidad: 'periodicidad', telefonos: 'teléfonos', identificacion: 'identificación', antiguedad: 'antigüedad', aplicacion: 'aplicación',
  economica: 'económica', basica: 'básica', basicas: 'básicas', transaccion: 'transacción', categoria: 'categoría', regulatorio: 'regulatorio',
  catalogo: 'catálogo', limite: 'límite', limites: 'límites', metodologia: 'metodología', historico: 'histórico', caducado: 'caducado',
  calculo: 'cálculo', vigencia: 'vigencia', pagina: 'página', condicion: 'condición', condiciones: 'condiciones', evaluacion: 'evaluación',
  autorizacion: 'autorización', liquidacion: 'liquidación', penalizacion: 'penalización', invitacion: 'invitación', naturaleza: 'naturaleza',
  deducion: 'deducción', mecanica: 'mecánica', caracter: 'carácter', perdidas: 'pérdidas', organicas: 'orgánicas', determinacion: 'determinación',
  financiacion: 'financiación', operacion: 'operación', operaciones: 'operaciones', ocupacion: 'ocupación', renovacion: 'renovación',
  dias: 'días', formula: 'fórmula', asignacion: 'asignación', aprobacion: 'aprobación', tardio: 'tardío', historicos: 'históricos', institucion: 'institución', mas: 'más', fisicos: 'físicos', fisica: 'física', sumas: 'sumas', ultimo: 'último', unica: 'única', tecnica: 'técnica',
};
const SIGLAS = { cat: 'CAT', gat: 'GAT', irn: 'IRN', iva: 'IVA', spei: 'SPEI', reca: 'RECA', ipab: 'IPAB', mxn: 'MXN', usd: 'USD', udi: 'UDI', faq: 'FAQ', pfae: 'PFAE', condusef: 'CONDUSEF', sofipo: 'SOFIPO', hsbc: 'HSBC', cnbv: 'CNBV', msi: 'MSI', curp: 'CURP', rfc: 'RFC', et: 'ET' };

const ETIQUETAS = {
  cat: 'CAT publicado', cat_porcentaje: 'CAT', cat_por_tipo_vivienda: 'CAT por tipo de vivienda', supuestos_cat: 'Supuestos del CAT',
  tasa: 'Tasa de interés', tasa_promedio: 'Tasa promedio', tasa_intervalo: 'Intervalo de tasa', tasa_ordinaria: 'Tasa ordinaria anual',
  rango_tasa_individual: 'Tasa individual', tasa_maxima_publicada: 'Tasa máxima publicada', tasa_observada: 'Tasa observada',
  tasa_anual: 'Tasa anual', tipo_tasa: 'Tipo de tasa', gat_nominal: 'GAT nominal', gat_real: 'GAT real', gat: 'GAT', irn: 'Indicador de Rendimiento Neto (IRN)',
  comision_saldo: 'Comisión sobre saldo', anualidad: 'Anualidad', comisiones: 'Comisiones', otros_costos: 'Otros costos',
  monto: 'Monto o línea de crédito', montos: 'Montos', plazo: 'Plazo', plazos: 'Plazos', requisitos: 'Requisitos publicados',
  prima: 'Prima', suma_asegurada: 'Suma asegurada', rama: 'Ramo', proteccion: 'Protección del saldo', proteccion_publicada: 'Protección del saldo',
  liquidez: 'Disponibilidad del dinero', entidad: 'Entidad', emisor: 'Emisor', nombre_producto: 'Nombre del producto en documento',
  limite_credito: 'Límite de crédito', seguro_obligatorio: 'Seguro obligatorio', contrato_reca: 'Registro de contrato (RECA)', reca: 'Registro de contrato (RECA)',
  siefore_cohorte: 'Siefore', cohorte_anios_nacimiento: 'Generación (años de nacimiento)', metodologia_irn: 'Ponderación del IRN',
  precio_indicativo: 'Precio indicativo', valor_nominal: 'Valor nominal', otras_tasas_por_plazo: 'Tasas de otros plazos',
  tasa_hero_web: 'Tasa anunciada en portada', tasa_alternativa_documental: 'Tasa en documento alterno', destino: 'Destino del crédito',
};

const ACRONIMO_UNIDAD = [
  [/_pct$|_porcentaje$/i, '%'], [/_mxn$/i, 'MXN'], [/_anios$/i, 'años'], [/_meses$/i, 'meses'], [/_usd$/i, 'USD'],
];

export function humanizar(clave, anidado = false) {
  if (!anidado && ETIQUETAS[clave]) return ETIQUETAS[clave];
  let base = String(clave);
  for (const [re] of ACRONIMO_UNIDAD) base = base.replace(re, '');
  const palabras = base.split('_').filter(Boolean).map((p) => {
    const l = p.toLowerCase();
    if (SIGLAS[l]) return SIGLAS[l];
    if (/^\d+$/.test(p)) return p;
    return ACENTOS[l] || l;
  });
  const texto = palabras.join(' ');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const CODIGOS = {
  sin_IVA: 'sin IVA', 'más_IVA': 'más IVA', mas_IVA: 'más IVA', con_IVA: 'con IVA', incluye_IVA: 'IVA incluido', incluido_en_tabla: 'incluido en la tabla',
  promedio_ponderado: 'promedio ponderado', ND: 'N/D', exenta_segun_web: 'exenta según la página', sin_IVA_segun_nota_general: 'sin IVA según nota general',
  vigente_segun_fecha_publicada: 'vigente según la fecha publicada', depende_tipo_vivienda: 'depende del tipo de vivienda',
};
function textoCodigo(s) {
  if (CODIGOS[s]) return CODIGOS[s];
  if (!/\s/.test(s) && /_/.test(s)) return s.replace(/_/g, ' ');
  return s;
}

const nf = (n, max = 2) => new Intl.NumberFormat('es-MX', { maximumFractionDigits: max }).format(n);
const dinero = (n, moneda = 'MXN') => `$${nf(n, 2)} ${moneda}`;

function unidadDeClave(clave = '') {
  for (const [re, u] of ACRONIMO_UNIDAD) if (re.test(clave)) return u;
  if (/(^|_)(pct|porcentaje|cat|gat|irn)($|_)/i.test(clave) || /^tasa|^promedio/i.test(clave)) return '%';
  if (/^(monto|ingreso|limite_credito|anualidad)/i.test(clave)) return 'MXN';
  if (/^edad/i.test(clave)) return 'años';
  return null;
}

function numeroConUnidad(n, unidad, clave) {
  const u = unidad || unidadDeClave(clave);
  switch (u) {
    case '%': case 'porcentaje': case 'porcentaje_del_indicador': return `${nf(n)} %`;
    case 'porcentaje_anual': return `${nf(n)} % anual`;
    case 'porcentaje del monto dispuesto': return `${nf(n)} % del monto dispuesto`;
    case 'porcentaje_anual_antes_impuestos': return `${nf(n)} % anual antes de impuestos`;
    case 'porcentaje_anual_bruto': return `${nf(n)} % anual bruto`;
    case 'porcentaje_publicado_antes_impuestos': return `${nf(n)} % antes de impuestos`;
    case 'porcentaje_anual_sobre_saldo': return `${nf(n)} % anual sobre saldo`;
    case 'MXN': case 'MXN cuando numérico': return dinero(n);
    case 'MXN_mas_IVA': return `${dinero(n)} más IVA`;
    case 'MXN_por_titulo': return `${dinero(n)} por título`;
    case 'UDI': return `${nf(n, 0)} UDI`;
    case 'USD': return dinero(n, 'USD');
    case 'dias': return `${nf(n, 0)} días`;
    case 'anios': case 'años': return `${nf(n, 0)} años`;
    case 'meses': return `${nf(n, 0)} meses`;
    default: return nf(n);
  }
}

function esVacio(v) { return v === null || v === undefined || (Array.isArray(v) && v.length === 0); }

// Convierte un valor de Orion en texto legible o lista de textos; null si no hay valor publicado.
export function formatearValor(valor, unidad, clave) {
  if (esVacio(valor)) return null;
  if (typeof valor === 'number') return numeroConUnidad(valor, unidad, clave);
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
  if (typeof valor === 'string') return textoCodigo(valor);
  if (Array.isArray(valor)) {
    if (valor.every((x) => typeof x === 'number')) {
      if (valor.length === 2 && (unidad === 'UDI' || /rango/i.test(clave))) return `${numeroConUnidad(valor[0], unidad, clave)} a ${numeroConUnidad(valor[1], unidad, clave)}`;
      return valor.map((x) => numeroConUnidad(x, unidad, clave)).join(' · ');
    }
    return valor.map((x) => (typeof x === 'object' && x ? lineaObjeto(x, unidad) : formatearValor(x, unidad, clave))).filter(Boolean);
  }
  if (typeof valor === 'object') {
    if (clave === 'cat' || clave === 'cat_porcentaje') return textoCat(valor);
    if ('concepto' in valor) return lineaComision(valor);
    if (typeof valor.monto === 'number' && (valor.moneda || valor.periodicidad)) return lineaComision({ concepto: null, ...valor });
    const llaves = Object.keys(valor);
    if (llaves.length === 2 && typeof valor.desde === 'number' && typeof valor.hasta === 'number') {
      // Rangos de años calendario (p. ej. generación 1990–1994) no llevan separador de miles.
      const año = (n) => (n >= 1900 && n <= 2100 ? String(n) : numeroConUnidad(n, unidad, clave));
      return `${año(valor.desde)} a ${año(valor.hasta)}`;
    }
    const lineas = Object.entries(valor).map(([k, v]) => {
      if (/^nota_supuestos$|^estado_al_corte$/.test(k)) return null;
      const t = esVacio(v) ? 'N/D' : (typeof v === 'object' ? [].concat(formatearValor(v, unidadHija(unidad), k)).join('; ') : formatearValor(v, unidadHija(unidad), k));
      return `${humanizar(k, true)}: ${t}`;
    }).filter(Boolean);
    return lineas.length === 1 ? lineas[0] : lineas;
  }
  return String(valor);
}

function unidadHija(unidad) {
  return ['porcentaje', 'MXN', 'MXN cuando numérico', 'anios', 'UDI'].includes(unidad) ? unidad : null;
}

function lineaObjeto(o, unidad) {
  if ('concepto' in o) return lineaComision(o);
  const t = formatearValor(o, unidad, '');
  return Array.isArray(t) ? t.join('; ') : t;
}

function lineaComision(c) {
  const partes = [];
  if (typeof c.monto === 'number') partes.push(dinero(c.monto, c.moneda || 'MXN'));
  else if (typeof c.porcentaje === 'number') partes.push(`${nf(c.porcentaje)} %${c.base ? ` sobre ${c.base}` : ''}`);
  else if (Array.isArray(c.rango_MXN)) partes.push(`${dinero(c.rango_MXN[0])} a ${dinero(c.rango_MXN[1])}`);
  else if (c.importe) partes.push(textoCodigo(String(c.importe)));
  else partes.push('importe N/D');
  if (c.base && typeof c.porcentaje !== 'number') partes.push(`base: ${c.base}`);
  if (c.periodicidad && c.periodicidad !== 'ND') partes.push(textoCodigo(c.periodicidad));
  if (c.iva) partes.push(c.iva === 'ND' ? 'IVA: N/D' : textoCodigo(c.iva));
  for (const k of ['financiable', 'variacion', 'aplica', 'condicion', 'exencion']) if (c[k]) partes.push(`${humanizar(k, true)}: ${c[k]}`);
  return c.concepto ? `${c.concepto}: ${partes.join(', ')}` : partes.join(', ');
}

function textoCat(v) {
  if (typeof v !== 'object') return formatearValor(v, '%', 'cat');
  const sufijo = [v.tipo && textoCodigo(v.tipo), v.iva && textoCodigo(v.iva)].filter(Boolean).join(', ');
  if (typeof v.porcentaje === 'number') return `${nf(v.porcentaje)} %${sufijo ? ` (${sufijo})` : ''}`;
  if (v.escenarios_porcentaje) {
    const esc = Object.entries(v.escenarios_porcentaje).map(([k, x]) => `${humanizar(k, true)} ${nf(x)} %`).join(' · ');
    return `Según tipo de vivienda: ${esc}${sufijo ? ` (${sufijo})` : ''}`;
  }
  return null;
}

// Número principal para ordenar o mostrar; null cuando no hay valor único publicado.
function numeroPrincipal(valor) {
  if (typeof valor === 'number') return valor;
  if (valor && typeof valor === 'object' && typeof valor.porcentaje === 'number') return valor.porcentaje;
  if (valor && typeof valor === 'object' && !Array.isArray(valor) && typeof valor.monto === 'number') return valor.monto;
  return null;
}

// Limitaciones explícitas de un valor de CAT (supuestos no publicados), expresadas como texto.
function limitesCat(valor) {
  if (!valor || typeof valor !== 'object') return [];
  const out = [];
  if (valor.nota_supuestos) out.push(valor.nota_supuestos);
  if (valor.supuestos) out.push(valor.supuestos);
  if (valor.identidad_escenario_CAT) out.push(valor.identidad_escenario_CAT);
  if (valor.vigencia_literal) out.push(`Vigencia literal en la fuente: «${valor.vigencia_literal}».`);
  return out;
}

// ---------- Estados ----------
// Código original de Orion → estado visible de la metodología (sección 7).
export const ESTADOS = {
  verificado: ['verificado', 'Verificado en fuente'],
  vigente_al_corte: ['verificado', 'Vigente al corte'],
  vigencia_publicada: ['verificado', 'Vigencia publicada'],
  corte_publicado: ['verificado', 'Corte publicado'],
  historico_misma_cohorte_corte: ['verificado', 'Histórico del mismo corte'],
  instantanea_fechada: ['verificado', 'Dato con fecha'],
  historico_fechado: ['verificado', 'Histórico con fecha'],
  opciones_documentadas: ['observado', 'Opciones documentadas'],
  observado: ['observado', 'Observado en fuente'],
  observado_sin_vigencia_explicita: ['observado', 'Sin vigencia publicada'],
  observado_condicionado: ['observado', 'Observado con condiciones'],
  normalizado: ['observado', 'Observado en fuente'],
  criterio_editorial: ['observado', 'Criterio editorial'],
  corroboracion_regulatoria_indizada: ['observado', 'Registro indizado'],
  mecanica_documentada_importe_ND: ['nd', 'Mecánica documentada, importe N/D'],
  ND: ['nd', 'N/D'],
  no_aplica: ['na', 'No aplica'],
  discrepante: ['conflicto', 'En conflicto'],
  conflicto_fuentes: ['conflicto', 'En conflicto'],
  conflicto_retenido: ['conflicto', 'En conflicto'],
  vigencia_inconsistente: ['conflicto', 'Vigencia inconsistente'],
  vencido: ['caducado', 'Caducado'],
  historico_sin_vigencia_confirmada: ['caducado', 'Histórico sin vigencia'],
  historico_retenido: ['retenido', 'Retenido'],
  sin_vencimiento_explicito_retenido: ['retenido', 'Retenido'],
  sin_vigencia_explicita_retenido: ['retenido', 'Retenido'],
  retenido_corroboracion_individual_ipab_pendiente: ['retenido', 'Retenido: cobertura pendiente de corroborar'],
  vigencia_no_publicada: ['observado', 'Vigencia no publicada'],
};
function estado(codigo) {
  const [tipo, etiqueta] = ESTADOS[codigo] || ['observado', textoCodigo(String(codigo || 'Sin estado'))];
  return { codigo: codigo || null, tipo, etiqueta };
}

// ---------- Grupos de lectura ----------
function grupoDe(clave) {
  if (/^(cat|supuestos_cat|cat_por|tasa|rango_tasa|gat|irn|rendimiento|precio|valor_nominal|otras_tasas|metodologia_irn|tipo_rendimiento|tipo_tasa|costo_fondo)/.test(clave)) return 'indicadores';
  if (/comision|anualidad|administracion|costo|apertura$|atraso|cobranza|interes_moratorio|intereses|spei|reposicion|cargo|prepago|deducible|coaseguro|prima|seguro_prima|condiciones_comisiones|disparador|iva_/.test(clave)) return 'costos';
  if (/requisit|edad|ingreso|score|historial|documentos|experiencia|residencia|segmento|elegibilidad/.test(clave)) return 'requisitos';
  if (/cobertura|suma|exclusion|rama|paquete|enfermedad|ahorro_rescate|vigencia_poliza|base_deducible/.test(clave)) return 'coberturas';
  if (/proteccion|riesgo|garantia|registro|reca|estatus|sector|version|tipo_entidad|emisor|entidad|siefore|cohorte|marca|tasa_garantizada/.test(clave)) return 'respaldo';
  return 'condiciones';
}
// Los grupos y sus títulos visibles viven en src/lib/matchCatalog.js (GRUPOS_LECTURA).

// Campos que se muestran aparte (no como dato) o se excluyen por ser metadatos editoriales.
const NO_DATO = new Set(['discrepancias', 'conflictos', 'historial_no_usar_como_vigente', 'historico_caducado', 'nombre', 'nombre_producto', 'entidad', 'emisor', 'tipo_entidad', 'moneda', 'elegibilidad_catalogo', 'exclusiones_catalogo']);

// ---------- Fuentes ----------
function fuenteCredito(d, registro) {
  const urls = d.fuente_urls?.length ? d.fuente_urls : [d.fuente_url].filter(Boolean);
  const ids = d.fuente_ids?.length ? d.fuente_ids : [d.fuente_id];
  return urls.map((url, i) => {
    const reg = registro.get(ids[i]) || [...registro.values()].find((f) => f.url === url) || {};
    const principal = i === 0;
    return {
      titulo: reg.titulo || dominio(url),
      url,
      localizador: principal ? (d.localizador || null) : (reg.localizador || null),
      acceso: reg.acceso || null,
      fechas: {
        consulta: d.fecha_consulta || reg.fecha_consulta || null,
        emision: principal ? (d.fecha_emision ?? null) : (reg.fecha_emision ?? null),
        calculo: principal ? (d.fecha_calculo ?? null) : null,
        referencia: principal ? (d.fecha_referencia ?? null) : null,
        corte: null, corteNota: null, publicacion: null,
        desde: principal ? (d.vigente_desde ?? null) : null,
        hasta: principal ? (d.vigente_hasta ?? null) : null,
        vigenciaTexto: null,
      },
    };
  });
}

function fuenteAhorro(f) {
  return {
    titulo: f.titulo || dominio(f.url),
    url: f.url,
    localizador: null,
    acceso: f.acceso || null,
    fechas: {
      consulta: f.consulta_iso || null,
      emision: f.fecha_emision ?? null,
      calculo: f.fecha_calculo ?? null,
      referencia: null,
      corte: f.fecha_corte ?? null,
      corteNota: f.fecha_corte_nota || null,
      publicacion: f.fecha_publicacion ?? null,
      desde: f.vigencia?.desde ?? null,
      hasta: f.vigencia?.hasta ?? null,
      vigenciaTexto: f.vigencia?.texto || null,
    },
  };
}

export function dominio(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

// ---------- Datos ----------
function dato(clave, valorCrudo, unidad, codigoEstado, fuentes, extra = {}) {
  const valor = formatearValor(valorCrudo, unidad, clave);
  const limites = [...(clave === 'cat' || clave === 'cat_porcentaje' ? limitesCat(valorCrudo) : []), ...(extra.limites || [])].filter(Boolean);
  // Un valor nulo nunca se presenta como dato verificado: hereda N/D si el estado declarado no lo explica.
  let codigo = codigoEstado;
  if (valor === null && ['verificado', 'observado'].includes(estado(codigo).tipo)) codigo = 'ND';
  return {
    clave,
    etiqueta: extra.etiqueta || humanizar(clave),
    grupo: grupoDe(clave),
    valor,
    numero: numeroPrincipal(valorCrudo),
    estado: estado(codigo),
    nota: extra.nota || null,
    limites,
    fuentes,
  };
}

function datosCredito(campos, registro) {
  const out = [];
  for (const [clave, d] of Object.entries(campos)) {
    if (NO_DATO.has(clave)) continue;
    if (Array.isArray(d)) {
      d.forEach((item, i) => {
        const ctx = item.contexto || {};
        const concepto = ctx.concepto || (item.valor && typeof item.valor === 'object' ? item.valor.concepto : null);
        const etiqueta = concepto ? `${humanizar(clave)}: ${concepto}` : `${humanizar(clave)}: concepto no especificado en la fuente`;
        const d = dato(clave, item.valor, ctx.unidad || null, item.estado || 'observado_sin_vigencia_explicita', fuenteCredito(item, registro), { nota: item.nota, etiqueta });
        // El contexto de la fuente (IVA, periodicidad) acompaña al importe, no se pierde.
        if (typeof d.valor === 'string' && (ctx.iva || ctx.periodicidad)) d.valor = [d.valor, ctx.periodicidad, ctx.iva && (/IVA/i.test(ctx.iva) ? ctx.iva : `IVA: ${textoCodigo(ctx.iva)}`)].filter(Boolean).join(', ');
        out.push(d);
      });
      continue;
    }
    if (!d || typeof d !== 'object' || !('valor' in d)) continue;
    out.push(dato(clave, d.valor, null, d.estado, fuenteCredito(d, registro), { nota: d.nota }));
  }
  return out;
}

function datosAhorro(campos) {
  return Object.entries(campos).map(([clave, d]) => dato(clave, d.valor, d.unidad, d.estado, (d.fuentes || []).map(fuenteAhorro), { nota: d.supuestos_y_limites || null }));
}

function notaLista(items, registro) {
  return (items || []).map((x) => ({
    texto: typeof x.valor === 'string' ? x.valor : [].concat(formatearValor(x.valor, null, '')).join('; '),
    nota: x.nota || null,
    fuentes: fuenteCredito(x, registro),
  }));
}

// Un conflicto que toca el CAT bloquea ese dato y sus funciones dependientes (criterio 3 de Orion).
function conflictoAfectaCat(items) {
  return (items || []).some((x) => {
    const v = x.valor;
    if (v && typeof v === 'object') return Object.keys(v).some((k) => /cat/i.test(k)) || /^cat/i.test(String(v.campo || ''));
    return false;
  });
}

function tipoEntidadDe(texto = '') {
  const t = texto.toLowerCase();
  if (/banca múltiple|banco|institución de banca/.test(t)) return 'banco';
  if (/financiera popular|s\.f\.p|sofipo/.test(t)) return 'sofipo';
  if (/seguros|aseguradora|compañía de seguros|grupo nacional provincial/.test(t)) return 'aseguradora';
  if (/casa de bolsa|fondo de inversión|operadora|gobierno federal/.test(t)) return 'valores';
  return 'otra';
}

const SUBCATEGORIAS = {
  tarjeta_credito: 'Tarjeta de crédito', credito_personal: 'Crédito personal', credito_personal_consolidacion: 'Crédito para consolidar deudas',
  credito_personal_financiamiento_colectivo: 'Financiamiento colectivo', credito_hipotecario: 'Crédito hipotecario', credito_automotriz: 'Crédito automotriz',
  ahorro_bancario: 'Ahorro bancario a la vista', sofipo_plazo: 'Depósito a plazo en SOFIPO', vida_temporal: 'Vida temporal',
  gastos_medicos_mayores: 'Gastos médicos mayores', auto_amplia: 'Auto, cobertura amplia',
};

function subcategoriaAhorro(p) {
  if (p.subcategoria && SUBCATEGORIAS[p.subcategoria]) return SUBCATEGORIAS[p.subcategoria];
  const rama = p.campos?.rama?.valor || '';
  if (p.categoria === 'seguros') {
    if (/vida/i.test(rama)) return 'Vida temporal';
    if (/médicos/i.test(rama)) return 'Gastos médicos mayores';
    if (/autom/i.test(rama)) return 'Auto, cobertura amplia';
  }
  if (p.categoria === 'cuentas') return 'Cuenta de depósito';
  if (p.categoria === 'inversion') {
    if (/cetes/i.test(p.id)) return 'Deuda gubernamental';
    if (/bonddia/i.test(p.id)) return 'Fondo de deuda';
    return 'Liquidez en casa de bolsa';
  }
  if (p.categoria === 'afores') return 'Siefore Básica 90–94';
  return null;
}

// Métrica principal por categoría: un solo indicador propio, nunca uno cruzado entre categorías.
const METRICA = {
  hipotecas: ['cat'], autos: ['cat'], tarjetas: ['cat'], creditos_personales: ['cat'],
  cuentas: [], ahorro: ['gat_nominal'], seguros: ['prima'], afores: ['irn'],
  inversion: ['tasa_observada', 'rendimiento_12_meses_publicado', 'tasa_anual'],
};
const SECUNDARIOS = {
  tarjetas: ['anualidad', 'tasa', 'tasa_promedio', 'tasa_ordinaria'],
  creditos_personales: ['tasa', 'comision_contratacion', 'monto', 'plazo'],
  hipotecas: ['tasa', 'montos', 'plazos'],
  autos: ['tasa', 'montos', 'plazos'],
  cuentas: ['comision_manejo', 'administracion_mensual_base', 'saldo_promedio_minimo', 'saldo_minimo', 'proteccion', 'proteccion_publicada'],
  ahorro: ['tasa_anual', 'plazo', 'liquidez', 'proteccion', 'proteccion_publicada'],
  inversion: ['liquidez', 'minimo_plataforma', 'minimo', 'riesgo_y_respaldo', 'riesgo'],
  seguros: ['rama', 'suma_asegurada_opciones', 'deducible_opciones', 'deducibles_publicados', 'edad_contratacion'],
  afores: ['comision_saldo', 'cohorte_anios_nacimiento'],
};

function categoriaEditorial(origen) {
  const c = CATEGORIAS.find((x) => x.origen.includes(origen));
  if (!c) throw new Error(`Categoría sin mapa: ${origen}`);
  return c.id;
}

function enlaceOficial(datos, preferidas) {
  for (const clave of preferidas) {
    const d = datos.find((x) => x.clave === clave && x.fuentes[0]?.url);
    if (d) return d.fuentes[0].url;
  }
  return datos.find((x) => x.fuentes[0]?.url)?.fuentes[0].url || null;
}

function slugDe(id) { return id.toLowerCase().replace(/_/g, '-'); }

export function normalizar() {
  const indice = leer('indice-catalogo-acumulativo.json');
  const base = leer('credito/base-v1/catalogo_credito.json');
  const ampl = leer('credito/ampliacion/catalogo_ampliacion.json');
  const ahorro = leer('ahorro-inversion/catalogo-acumulativo.json');
  const regBase = new Map(base.fuentes.map((f) => [f.id, f]));
  const regAmpl = new Map(ampl.fuentes.map((f) => [f.id, f]));
  const usoPorId = new Map(indice.productos.map((p) => [p.id, p]));
  const productos = [];

  for (const p of base.productos) {
    const datos = datosCredito(p.campos, regBase);
    const fuenteNombre = fuenteCredito(p.nombre, regBase);
    const discrepancias = notaLista(p.discrepancias, regBase);
    productos.push({
      id: p.id, slug: slugDe(p.id), modulo: 'credito-base', categoria: categoriaEditorial(p.categoria),
      subcategoria: SUBCATEGORIAS[p.categoria] || null,
      nombre: p.nombre.valor, entidad: p.entidad.valor, tipoEntidad: p.tipo_entidad?.valor || null,
      datos, discrepancias, historial: notaLista(p.historial_no_usar_como_vigente, regBase),
      alertas: p.alertas || [], conflictoCat: conflictoAfectaCat(p.discrepancias),
      enlaceOficial: fuenteNombre[0]?.url || enlaceOficial(datos, ['cat']),
      motivoExclusion: null, decisionEditorial: null,
    });
  }

  for (const p of ampl.productos) {
    const d = p.datos;
    const datos = datosCredito(d, regAmpl);
    const listaConflictos = [...(d.discrepancias || []), ...(d.conflictos || [])];
    const nombreDato = d.nombre || d.nombre_producto;
    const entidadDato = d.entidad || d.emisor;
    productos.push({
      id: p.id, slug: slugDe(p.id), modulo: 'credito-ampliacion', categoria: categoriaEditorial(p.categoria),
      subcategoria: SUBCATEGORIAS[p.categoria] || null,
      nombre: p.nombre_corto || nombreDato?.valor, entidad: entidadDato?.valor || null,
      tipoEntidad: d.tipo_entidad?.valor || d.sector_regulado?.valor || null,
      nombreDocumento: d.nombre_producto?.valor && d.nombre_producto.valor !== p.nombre_corto ? d.nombre_producto.valor : null,
      datos, discrepancias: notaLista(listaConflictos, regAmpl),
      historial: notaLista([...(d.historial_no_usar_como_vigente || []), ...(d.historico_caducado || [])], regAmpl),
      alertas: [d.elegibilidad_catalogo?.valor, ...(Array.isArray(d.exclusiones?.valor) ? [`Variantes fuera de esta ficha: ${d.exclusiones.valor.join(', ')}.`] : [])].filter(Boolean),
      conflictoCat: conflictoAfectaCat(listaConflictos),
      enlaceOficial: nombreDato ? fuenteCredito(nombreDato, regAmpl)[0]?.url : enlaceOficial(datos, ['cat']),
      motivoExclusion: p.motivo_exclusion || null, decisionEditorial: p.decision_editorial || null,
    });
  }

  for (const p of ahorro.productos) {
    const datos = datosAhorro(p.campos);
    const fProducto = (p.producto.fuentes || []).map(fuenteAhorro);
    productos.push({
      id: p.id, slug: slugDe(p.id), modulo: 'ahorro-inversion', categoria: categoriaEditorial(p.categoria),
      subcategoria: subcategoriaAhorro(p),
      nombre: p.producto.valor, entidad: p.entidad.valor, tipoEntidad: null,
      datos, discrepancias: [], historial: [], alertas: p.advertencias || [], conflictoCat: false,
      enlaceOficial: fProducto[0]?.url || enlaceOficial(datos, []),
      motivoExclusion: null, decisionEditorial: null,
    });
  }

  for (const p of productos) {
    const uso = usoPorId.get(p.id);
    if (!uso) throw new Error(`Producto fuera del índice: ${p.id}`);
    p.estadoUso = uso.estado_uso;
    p.ofertaIndividualVerificada = uso.oferta_individual_comparable_verificada === true;
    p.tipoEntidadClase = p.categoria === 'seguros' ? 'aseguradora' : p.categoria === 'afores' ? 'afore' : tipoEntidadDe(`${p.tipoEntidad || ''} ${p.entidad || ''}`);
    p.relacionComercial = null; // Ninguna afiliación aprobada o activa al corte (registro de afiliados, 12-10-2026).
    // Un conflicto sobre el CAT bloquea el dato aunque su estado individual diga verificado.
    if (p.conflictoCat) for (const d of p.datos) if (d.clave === 'cat' && d.valor !== null) d.estado = { ...estado('conflicto_fuentes'), etiqueta: 'En conflicto', origen: d.estado.codigo };
    const metricaClave = METRICA[p.categoria].find((k) => p.datos.some((d) => d.clave === k)) || null;
    p.metrica = metricaClave;
    p.secundarios = (SECUNDARIOS[p.categoria] || []).filter((k) => k !== metricaClave && p.datos.some((d) => d.clave === k)).slice(0, 3);
    p.atributos = atributos(p);
  }

  const orden = CATEGORIAS.map((c) => c.id);
  productos.sort((a, b) => orden.indexOf(a.categoria) - orden.indexOf(b.categoria) || a.nombre.localeCompare(b.nombre, 'es'));
  return compactar({
    version: indice.version,
    fechaCorte: indice.fecha_corte_investigacion,
    origen: 'Entrega acumulativa v2 de Orion (MiLana Match), 12-10-2026. SHA-256 del ZIP: 0d06850301d9f2042eac585e343592427f6e96dfc13aa2e9776b0a1b89fdc146.',
    reglas: [...base.reglas_lectura, ampl.regla_uso, ...Object.values(ahorro.reglas_datos)],
    consar: { corte: ahorro.revision.fecha_corte_consar, precision: ahorro.revision.fecha_corte_consar_precision },
    categorias: CATEGORIAS.map(({ id, slug, nombre }) => ({ id, slug, nombre, total: productos.filter((p) => p.categoria === id).length })),
    productos,
  });
}

// Las fuentes se repiten entre datos: se guardan una vez y cada evidencia conserva sus propias fechas.
// Se omiten claves nulas para que el catálogo pese menos; la ausencia se interpreta como «no publicada».
function compactar(cat) {
  const tabla = []; const indice = new Map();
  const sinNulos = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined && !(Array.isArray(v) && !v.length)));
  const evidencia = (f) => {
    const llave = JSON.stringify([f.titulo, f.url, f.localizador, f.acceso]);
    if (!indice.has(llave)) { indice.set(llave, tabla.length); tabla.push(sinNulos({ titulo: f.titulo, url: f.url, localizador: f.localizador, acceso: f.acceso })); }
    return { f: indice.get(llave), ...sinNulos(f.fechas) };
  };
  for (const p of cat.productos) {
    p.datos = p.datos.map((d) => sinNulos({ ...d, fuentes: d.fuentes.map(evidencia) }));
    for (const lista of ['discrepancias', 'historial']) p[lista] = p[lista].map((x) => sinNulos({ ...x, fuentes: x.fuentes.map(evidencia) }));
  }
  return { ...cat, fuentes: tabla };
}

// Atributos observables para filtros: true/false si el dato publicado lo permite, null si no se puede comprobar.
function atributos(p) {
  const d = (k) => p.datos.find((x) => x.clave === k);
  const a = { tipoEntidad: p.tipoEntidadClase };
  if (p.categoria === 'tarjetas') {
    const an = d('anualidad');
    a.sinAnualidad = !an || typeof an.numero !== 'number' || ['nd', 'conflicto', 'retenido'].includes(an.estado.tipo) ? null : an.numero === 0;
  }
  if (p.categoria === 'ahorro') {
    const liq = d('liquidez'); const plazo = d('plazo');
    a.disponibilidad = liq && /24\/7|diaria/i.test([].concat(liq.valor).join(' ')) ? 'diaria' : plazo?.valor ? 'plazo' : null;
    const prot = d('proteccion') || d('proteccion_publicada');
    const tp = prot && prot.valor ? [].concat(prot.valor).join(' ') : '';
    a.proteccion = /IPAB/.test(tp) ? 'IPAB' : /SOFIPO/.test(tp) ? 'Fondo de Protección SOFIPO' : null;
  }
  if (p.categoria === 'seguros') a.ramo = p.subcategoria;
  if (p.categoria === 'inversion') a.instrumento = p.subcategoria;
  return a;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const salida = resolve(RAIZ, 'src/data/match-catalogo.json');
  const cat = normalizar();
  writeFileSync(salida, JSON.stringify(cat, null, 1) + '\n', 'utf8');
  console.log(`MiLana Match: ${cat.productos.length} fichas normalizadas en ${cat.categorias.length} categorías → ${salida}`);
}
