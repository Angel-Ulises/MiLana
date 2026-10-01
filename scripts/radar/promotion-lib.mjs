const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const TOOL_LABELS = {
  '/finanzas/presupuesto': 'Ordenar mi presupuesto',
  '/carreras': 'Explorar carreras y salarios',
  '/finanzas/ahorro': 'Planear una meta de ahorro',
  '/finanzas/fondo-emergencia': 'Construir fondo de emergencia',
  '/carreras/por-estado': 'Comparar salarios por estado',
  '/finanzas/deuda-y-credito': 'Revisar deuda y crédito',
  '/finanzas/vivienda': 'Explorar vivienda y capacidad de pago',
};

const ALLOWED_SOURCE_HOSTS = ['inegi.org.mx', 'banxico.org.mx'];

function normalizeSpaces(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function wordCount(value = '') {
  return normalizeSpaces(value).split(' ').filter(Boolean).length;
}

function stripAccents(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function slugify(value = '') {
  return stripAccents(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

export function todayInMexico(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

export function decodeCandidatePayload(issueBody = '') {
  const match = String(issueBody).match(/<!--\s*radar-payload:([A-Za-z0-9+/=]+)\s*-->/);
  if (!match) throw new Error('El Issue no contiene payload estructurado del Radar');
  let parsed;
  try {
    parsed = JSON.parse(Buffer.from(match[1], 'base64').toString('utf8'));
  } catch {
    throw new Error('El payload estructurado del Radar no se pudo decodificar');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('El payload del Radar no tiene forma de objeto');
  }
  return parsed;
}

export function formatDateEs(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) return String(date || '');
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day || month > 12 || day > 31) return String(date);
  return `${day} de ${MONTHS[month - 1]} de ${year}`;
}

export function formatPeriodEs(period) {
  const match = String(period || '').match(/^(\d{4})\/(\d{2})(?:\/(\d{2}))?$/);
  if (!match) return normalizeSpaces(period || 'periodo reportado');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const part = match[3] || '';
  const monthName = MONTHS[month - 1];
  if (!monthName) return String(period);
  if (part === '01') return `primera quincena de ${monthName} de ${year}`;
  if (part === '02') return `segunda quincena de ${monthName} de ${year}`;
  return `${monthName} de ${year}`;
}

function sourceHostAllowed(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return ALLOWED_SOURCE_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

function publicSourceFor(source) {
  const promotion = source?.promotion || {};
  if (!promotion.publicSourceId || !promotion.publicSourceName || !promotion.publicSourceUrl) return null;
  return {
    id: promotion.publicSourceId,
    nombre: promotion.publicSourceName,
    url: promotion.publicSourceUrl,
    cadencia: source.cadence || 'según publicación oficial',
    proximaRevision: 'por calendario oficial',
  };
}

function toolFromHref(href) {
  if (!href || !TOOL_LABELS[href]) return null;
  return { texto: TOOL_LABELS[href], href };
}

function titleFor(candidate, source, fact, periodText) {
  switch (source.id) {
    case 'inegi-inpc-mensual':
      return `La inflación anual fue de ${fact} en ${periodText}`;
    case 'inegi-inpc-quincenal':
      return `La inflación anual fue de ${fact} en la ${periodText}`;
    case 'inegi-consumo':
      return `El consumo privado registró una variación anual de ${fact} en ${periodText}`;
    case 'inegi-desocupacion':
      return `La tasa de desocupación fue de ${fact} en ${periodText}`;
    case 'banxico-politica': {
      const text = stripAccents(candidate.title || '').toLowerCase();
      if (fact && /mantiene|sin cambio|permanece/.test(text)) return `Banxico mantiene la tasa objetivo en ${fact}`;
      if (fact && /reduce|disminuye|baja|recorta/.test(text)) return `Banxico reduce la tasa objetivo a ${fact}`;
      if (fact && /incrementa|aumenta|sube|eleva/.test(text)) return `Banxico eleva la tasa objetivo a ${fact}`;
      return fact ? `Banxico publica una decisión de política monetaria con tasa objetivo de ${fact}` : 'Banxico publica una nueva decisión de política monetaria';
    }
    case 'banxico-regional':
      return periodText && periodText !== 'periodo reportado'
        ? `Banxico publica su reporte regional para ${periodText}`
        : `Banxico publica una nueva edición de su reporte sobre economías regionales`;
    default:
      return normalizeSpaces(candidate.title || source.name || 'Nueva señal económica oficial');
  }
}

function descriptionFor(title, source) {
  const suffix = source.id.startsWith('inegi-')
    ? 'MiLana lo aterriza con contexto, límites del dato y herramientas para revisar tus propios números.'
    : 'MiLana explica qué cambia, qué no cambia automáticamente y cómo aterrizarlo a decisiones financieras o laborales.';
  return `${title}. ${suffix}`;
}

function whatHappenedFor(candidate, source, fact, periodText) {
  const statusText = candidate.valueStatus ? ` El registro aparece con estatus ${candidate.valueStatus}.` : '';
  if (source.kind === 'inegi-series') {
    return `${source.institution} actualizó la serie oficial de ${source.name.toLowerCase()}. Para ${periodText}, el valor publicado es ${fact}.${statusText} La fecha de esta nota corresponde a la actualización visible en la fuente oficial, no necesariamente al mes o quincena que mide el indicador.`;
  }
  const base = candidate.editorial?.draft?.whatHappened || candidate.summary || candidate.title;
  return `${normalizeSpaces(base)} La referencia se conserva como publicación oficial de ${source.institution} y debe leerse dentro del alcance descrito por la propia institución.`;
}

function whyItMattersFor(source) {
  return `${normalizeSpaces(source.whyItMatters)} Es una señal agregada del entorno económico: ayuda a entender contexto y dirección, pero no permite concluir por sí sola que todos los hogares, salarios, créditos o negocios estén cambiando en la misma magnitud.`;
}

function audienceFor(source) {
  return `${normalizeSpaces(source.audience)} El efecto concreto depende de ubicación, ingreso, tipo de empleo, deudas, gastos y condiciones particulares; por eso el dato nacional o regional debe contrastarse con números propios antes de tomar una decisión.`;
}

function actionFor(source) {
  switch (source.id) {
    case 'inegi-inpc-mensual':
    case 'inegi-inpc-quincenal':
      return 'Compara primero cuánto cambiaron tus gastos esenciales y tu ingreso durante el mismo periodo. Usa la inflación como referencia del entorno, no como sustituto de tu presupuesto, y revisa si tu poder de compra realmente mejoró, se mantuvo o se deterioró.';
    case 'inegi-consumo':
      return 'Usa el indicador como contexto sobre el gasto agregado de los hogares. Para una decisión personal, revisa flujo mensual, deuda y ahorro: una variación nacional del consumo no es una señal para gastar más ni para recortar automáticamente tus compras.';
    case 'inegi-desocupacion':
      return 'No uses la tasa nacional como sustituto del mercado de tu profesión o ciudad. Compárala con salario, demanda, formalidad y oportunidades por estado antes de decidir si conviene cambiar de empleo, carrera o ubicación.';
    case 'banxico-politica':
      return 'Antes de contratar o mover una deuda, compara CAT, tasa, comisiones, seguros, plazo y monto total a pagar. Si estás ahorrando, compara liquidez y condiciones del producto: la tasa objetivo no se traslada de forma idéntica ni inmediata a cada banco.';
    case 'banxico-regional':
      return 'Compara primero el salario y tamaño del mercado laboral de tu profesión y después revisa el contexto del estado o región. Evita usar un promedio nacional o regional como si describiera automáticamente una vacante, empresa o ciudad específica.';
    default:
      return 'Usa el dato como contexto, abre la fuente oficial y contrástalo con tus números antes de convertirlo en una decisión personal.';
  }
}

function periodForTitle(candidate, source) {
  if (candidate.period) return formatPeriodEs(candidate.period);
  if (source.id === 'banxico-regional') {
    const title = normalizeSpaces(candidate.title || candidate.summary || '');
    const quarter = title.match(/\b([1-4])(?:er|o|º)?\s*trimestre\s+(?:de\s+)?(20\d{2})/i);
    if (quarter) return `${quarter[1]}T ${quarter[2]}`;
    const range = title.match(/(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s*[-–—]\s*(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(20\d{2})/i);
    if (range) return `${range[1]}–${range[2]} de ${range[3]}`;
  }
  return 'periodo reportado';
}

function slugToken(candidate) {
  if (candidate.period) return candidate.period.replace(/\//g, '-');
  return candidate.publishedAt || candidate.key || 'actualizacion';
}

export function buildArticleProposal(candidate, source) {
  const promotion = source?.promotion || {};
  const fact = normalizeSpaces(candidate.detectedFact || candidate.editorial?.draft?.detectedFact || '');
  const periodText = periodForTitle(candidate, source);
  const title = titleFor(candidate, source, fact || 'dato actualizado', periodText);
  const firstTool = toolFromHref(source.tools?.[0]);
  const secondTool = toolFromHref(source.tools?.[1]);
  const article = {
    slug: slugify(`${promotion.slugPrefix || source.id}-${slugToken(candidate)}`),
    categoria: source.category,
    fecha: candidate.publishedAt,
    titulo: title,
    descripcion: descriptionFor(title, source),
    datoPrincipal: fact || (source.id === 'banxico-regional' ? 'Reporte' : 'Dato oficial'),
    datoEtiqueta: promotion.dataLabel || 'dato oficial',
    fotoId: promotion.photoId || '',
    fotoAlt: promotion.photoAlt || '',
    fuenteId: promotion.publicSourceId || source.id,
    fuenteFecha: formatDateEs(candidate.publishedAt),
    quePaso: whatHappenedFor(candidate, source, fact || 'el valor visible en la fuente', periodText),
    porQueImporta: whyItMattersFor(source),
    aQuienAfecta: audienceFor(source),
    queHacer: actionFor(source),
    herramienta: firstTool,
    herramientaSecundaria: secondTool,
    radarKey: candidate.key,
  };
  return { article, publicSource: publicSourceFor(source) };
}

export function validatePromotion(candidate, source, economia, article, publicSource, options = {}) {
  const blockers = [];
  const warnings = [];
  const today = options.today || todayInMexico();

  if (!candidate || typeof candidate !== 'object') blockers.push('Candidato ausente o inválido.');
  if (candidate?.status !== 'needs-review') blockers.push('El candidato no está en estado needs-review.');
  if (!candidate?.key || !/^[a-f0-9]{8,64}$/i.test(candidate.key)) blockers.push('El candidato no tiene una clave válida.');
  if (!source) blockers.push('La fuente del candidato no existe en el registro del Radar.');
  if (source && !sourceHostAllowed(candidate?.sourceUrl || source.url)) blockers.push('La URL de origen no pertenece a INEGI o Banco de México.');
  if (!candidate?.publishedAt || !/^\d{4}-\d{2}-\d{2}$/.test(candidate.publishedAt)) blockers.push('La fecha de publicación no es válida.');
  if (candidate?.publishedAt && candidate.publishedAt > today) blockers.push(`La fecha ${candidate.publishedAt} está en el futuro respecto a ${today}.`);
  if (!source?.promotion) blockers.push('La fuente no tiene metadatos de promoción configurados.');
  if (!publicSource) blockers.push('No se pudo construir la ficha pública de la fuente.');

  const requiredText = ['slug', 'categoria', 'fecha', 'titulo', 'descripcion', 'datoPrincipal', 'datoEtiqueta', 'fotoId', 'fotoAlt', 'fuenteId', 'fuenteFecha', 'quePaso', 'porQueImporta', 'aQuienAfecta', 'queHacer', 'radarKey'];
  for (const field of requiredText) {
    if (!normalizeSpaces(article?.[field])) blockers.push(`Falta el campo requerido ${field}.`);
  }
  if (article?.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) blockers.push('El slug no es seguro para URL.');
  if (article?.fotoId && !/^\d+$/.test(String(article.fotoId))) blockers.push('fotoId debe ser numérico.');
  if (!article?.herramienta || !TOOL_LABELS[article.herramienta.href]) blockers.push('La herramienta principal no está en la allowlist interna.');
  if (!article?.herramientaSecundaria || !TOOL_LABELS[article.herramientaSecundaria.href]) blockers.push('La herramienta secundaria no está en la allowlist interna.');

  const existingArticles = Array.isArray(economia?.articulos) ? economia.articulos : [];
  if (existingArticles.some((item) => item.slug === article?.slug)) blockers.push(`Ya existe un artículo con slug ${article?.slug}.`);
  if (existingArticles.some((item) => item.radarKey && item.radarKey === candidate?.key)) blockers.push('Este candidato ya fue promovido anteriormente.');

  const sectionRules = [
    ['quePaso', 20, 110],
    ['porQueImporta', 20, 100],
    ['aQuienAfecta', 18, 100],
    ['queHacer', 20, 110],
  ];
  for (const [field, min, max] of sectionRules) {
    const count = wordCount(article?.[field] || '');
    if (count < min) blockers.push(`${field} es demasiado corto (${count} palabras; mínimo ${min}).`);
    if (count > max) warnings.push(`${field} es largo (${count} palabras; objetivo máximo ${max}).`);
  }
  const descriptionLength = String(article?.descripcion || '').length;
  if (descriptionLength < 90) blockers.push(`La descripción es demasiado corta (${descriptionLength} caracteres).`);
  if (descriptionLength > 260) warnings.push(`La descripción es larga (${descriptionLength} caracteres).`);

  if (candidate?.valueStatus && !article?.quePaso?.includes(candidate.valueStatus)) blockers.push('El estatus preliminar/observado se perdió en Qué pasó.');
  if (candidate?.period && !article?.quePaso?.includes(formatPeriodEs(candidate.period))) blockers.push('El periodo del dato se perdió en Qué pasó.');
  if (candidate?.detectedFact && !article?.datoPrincipal?.includes(candidate.detectedFact)) blockers.push('La cifra principal no coincide con el candidato.');

  return { ok: blockers.length === 0, blockers, warnings, today };
}

export function applyPromotion(economia, article, publicSource, candidate) {
  const next = JSON.parse(JSON.stringify(economia || {}));
  if (!Array.isArray(next.fuentes)) next.fuentes = [];
  if (!Array.isArray(next.articulos)) next.articulos = [];
  if (publicSource && !next.fuentes.some((source) => source.id === publicSource.id)) next.fuentes.push(publicSource);
  next.articulos.unshift(article);
  if (!next.actualizado || candidate.publishedAt > next.actualizado) next.actualizado = candidate.publishedAt;
  return next;
}

export function promotionReport(candidate, registry, economia, options = {}) {
  const source = registry?.sources?.find((item) => item.id === candidate?.sourceId) || null;
  const { article, publicSource } = source ? buildArticleProposal(candidate, source) : { article: {}, publicSource: null };
  const validation = validatePromotion(candidate, source, economia, article, publicSource, options);
  return {
    ok: validation.ok,
    candidateKey: candidate?.key || null,
    sourceId: candidate?.sourceId || null,
    article,
    publicSource,
    blockers: validation.blockers,
    warnings: validation.warnings,
    validatedAt: validation.today,
    nextEconomia: validation.ok ? applyPromotion(economia, article, publicSource, candidate) : null,
  };
}
