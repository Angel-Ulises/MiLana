// MiLana Match: reglas puras de lectura, filtros, orden y comparación.
// Principios (metodología de Orion, 12-10-2026): sin puntaje universal; N/D nunca es 0;
// sólo se ordena entre datos comparables; el patrocinio no participa en ningún orden.

export const BASE_MATCH = '/finanzas/match';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Fechas con la precisión que publica la fuente: '2026-08' es un mes, nunca el día 31.
export function fechaLegible(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const m = iso.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (!m) return iso;
  const mes = MESES[Number(m[2]) - 1];
  if (!mes) return iso;
  return m[3] ? `${Number(m[3])} de ${mes} de ${m[1]}` : `${mes} de ${m[1]}`;
}

export function hoyISO(fecha = new Date()) {
  const z = (n) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${z(fecha.getMonth() + 1)}-${z(fecha.getDate())}`;
}

function sumarDias(iso, dias) {
  const [y, m, d] = iso.split('-').map(Number);
  const f = new Date(Date.UTC(y, m - 1, d || 1));
  f.setUTCDate(f.getUTCDate() + dias);
  return f.toISOString().slice(0, 10);
}

// Plazos editoriales de revisión propuestos por la metodología. No son vigencia comercial.
export function plazoRevisionDias(dato, categoria) {
  if (categoria === 'afores') return 45; // CONSAR publica cortes mensuales.
  if (dato.grupo === 'indicadores' || dato.grupo === 'costos') return 30;
  return 90;
}

// Estado visible a una fecha: caducado si la vigencia publicada terminó; revisión vencida si pasó el plazo editorial.
export function estadoEfectivo(dato, hoy, categoria) {
  const base = dato.estado || { tipo: 'nd', etiqueta: 'N/D' };
  if (!hoy || ['nd', 'na', 'conflicto', 'retenido', 'caducado'].includes(base.tipo)) return base;
  const ev = dato.fuentes || [];
  const fin = ev.map((f) => f.hasta).filter(Boolean).sort()[0];
  if (fin && fin < hoy) return { tipo: 'caducado', etiqueta: 'Caducado', detalle: `La vigencia publicada terminó el ${fechaLegible(fin)}. Se conserva como referencia y no se usa para ordenar.` };
  const consulta = ev.map((f) => f.consulta).filter(Boolean).sort()[0];
  if (consulta && sumarDias(consulta, plazoRevisionDias(dato, categoria)) < hoy) {
    return { tipo: 'revision', etiqueta: 'Revisión vencida', detalle: `Consultamos este dato el ${fechaLegible(consulta)} y está pendiente de una nueva revisión. Puede haber cambiado.` };
  }
  return base;
}

export const MICROTEXTO_ESTADO = {
  nd: 'No encontramos este dato en las fuentes revisadas. N/D no equivale a cero ni a «no cobra».',
  na: 'Este indicador no corresponde a este tipo de producto.',
  conflicto: 'Encontramos condiciones distintas en fuentes oficiales. No lo usamos para ordenar ni comparar costos.',
  retenido: 'El dato existe en la fuente, pero falta confirmar su vigencia o alcance. No lo usamos para comparar.',
  caducado: 'La vigencia publicada terminó. Se conserva como referencia histórica.',
  revision: 'Pendiente de una nueva revisión. Puede haber cambiado.',
};

export function datoDe(producto, clave) {
  return producto?.datos?.find((d) => d.clave === clave) || null;
}

// Un dato entra a un orden numérico sólo si está verificado a la fecha y tiene un número único publicado.
export function esComparable(dato, hoy, categoria) {
  if (!dato || typeof dato.numero !== 'number') return false;
  return estadoEfectivo(dato, hoy, categoria).tipo === 'verificado';
}

const porNombre = (a, b) => `${a.entidad} ${a.nombre}`.localeCompare(`${b.entidad} ${b.nombre}`, 'es');

// Orden: alfabético por defecto. Un criterio numérico separa lo que no puede ordenarse y explica por qué.
export function ordenar(productos, criterio, hoy) {
  const lista = [...productos];
  if (!criterio || criterio.clave === 'nombre') return { ordenados: lista.sort(porNombre), excluidos: [] };
  const ordenados = []; const excluidos = [];
  for (const p of lista) {
    const d = datoDe(p, criterio.clave);
    if (esComparable(d, hoy, p.categoria)) ordenados.push(p);
    else excluidos.push({ producto: p, motivo: d ? estadoEfectivo(d, hoy, p.categoria).etiqueta : 'Dato no documentado' });
  }
  const signo = criterio.direccion === 'desc' ? -1 : 1;
  ordenados.sort((a, b) => signo * (datoDe(a, criterio.clave).numero - datoDe(b, criterio.clave).numero) || porNombre(a, b));
  excluidos.sort((a, b) => porNombre(a.producto, b.producto));
  return { ordenados, excluidos };
}

// Filtros de coincidencia: true coincide, false no coincide, null no podemos comprobarlo.
export function evaluarFiltros(producto, filtros, definiciones) {
  return Object.entries(filtros).filter(([, v]) => v !== '' && v !== null && v !== undefined).map(([id, valor]) => {
    const def = definiciones.find((f) => f.id === id);
    const actual = producto.atributos?.[def?.atributo];
    const resultado = actual === null || actual === undefined ? null : def.tipo === 'booleano' ? actual === (valor === 'si') : actual === valor;
    return { id, etiqueta: def?.etiqueta || id, resultado };
  });
}

export function clasificarPorFiltros(productos, filtros, definiciones) {
  const coinciden = []; const sinComprobar = []; const noCoinciden = [];
  for (const p of productos) {
    const r = evaluarFiltros(p, filtros, definiciones);
    if (r.some((x) => x.resultado === false)) noCoinciden.push(p);
    else if (r.some((x) => x.resultado === null)) sinComprobar.push({ producto: p, pendientes: r.filter((x) => x.resultado === null) });
    else coinciden.push(p);
  }
  return { coinciden, sinComprobar, noCoinciden };
}

const textoValor = (d) => (d?.valor === undefined || d?.valor === null ? null : [].concat(d.valor).join(' · '));

// Filas de comparación agrupadas; cada celda conserva el dato completo para mostrar estado y fuente.
export function filasComparacion(productos, grupos) {
  const claves = new Map();
  for (const p of productos) for (const d of p.datos) {
    const llave = `${d.clave}::${d.etiqueta}`;
    if (!claves.has(llave)) claves.set(llave, { llave, clave: d.clave, etiqueta: d.etiqueta, grupo: d.grupo });
  }
  const filas = [...claves.values()].map((f) => {
    const celdas = productos.map((p) => p.datos.find((d) => `${d.clave}::${d.etiqueta}` === f.llave) || null);
    const textos = celdas.map((c) => (c ? `${textoValor(c) ?? ''}|${c.estado?.tipo}` : 'ausente'));
    return { ...f, celdas, iguales: textos.every((t) => t === textos[0]) };
  });
  const orden = grupos.map(([id]) => id);
  return grupos.map(([id, titulo]) => ({ id, titulo, filas: filas.filter((f) => f.grupo === id) }))
    .filter((g) => g.filas.length)
    .sort((a, b) => orden.indexOf(a.id) - orden.indexOf(b.id));
}

export function soloDiferencias(grupos) {
  return grupos.map((g) => ({ ...g, filas: g.filas.filter((f) => !f.iguales) })).filter((g) => g.filas.length);
}

export const MAX_COMPARAR = 4;

// La selección viaja en la URL sólo con identificadores de producto, nunca con datos personales.
export function leerSeleccion(search, idsValidos) {
  const raw = new URLSearchParams(search || '').get('comparar') || '';
  const validos = new Set(idsValidos);
  return [...new Set(raw.split(',').map((x) => x.trim()).filter((x) => validos.has(x)))].slice(0, MAX_COMPARAR);
}

export function alternarSeleccion(actual, id) {
  if (actual.includes(id)) return { seleccion: actual.filter((x) => x !== id), mensaje: 'quitado' };
  if (actual.length >= MAX_COMPARAR) return { seleccion: actual, mensaje: 'limite' };
  return { seleccion: [...actual, id], mensaje: 'agregado' };
}

export function rutaCategoria(categoria) { return `${BASE_MATCH}/${categoria.slug}`; }
export function rutaFicha(categoria, producto) { return `${BASE_MATCH}/${categoria.slug}/${producto.slug}`; }

// Conteos honestos: documentadas no es lo mismo que comparables con un criterio.
export function resumenCobertura(catalogo, hoy) {
  const porCategoria = catalogo.categorias.map((c) => {
    const lista = catalogo.productos.filter((p) => p.categoria === c.id);
    const entidades = new Set(lista.map((p) => p.entidad));
    return { ...c, total: lista.length, entidades: entidades.size };
  });
  const entidades = new Set(catalogo.productos.map((p) => p.entidad));
  const patrocinadas = catalogo.productos.filter((p) => p.relacionComercial).length;
  return { total: catalogo.productos.length, entidades: entidades.size, patrocinadas, porCategoria, corte: catalogo.fechaCorte, hoy };
}

export const GRUPOS_LECTURA = [
  ['indicadores', 'Indicadores principales'],
  ['costos', 'Costos y comisiones'],
  ['condiciones', 'Condiciones del producto'],
  ['coberturas', 'Coberturas'],
  ['requisitos', 'Requisitos publicados'],
  ['respaldo', 'Entidad, registro y respaldo'],
];

export function dominio(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}
