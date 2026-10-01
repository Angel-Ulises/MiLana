const OFFICIAL_HOSTS = ['inegi.org.mx', 'banxico.org.mx'];

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function equal(a, b) {
  return JSON.stringify(stable(a)) === JSON.stringify(stable(b));
}

function validOfficialUrl(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return OFFICIAL_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

function words(value = '') {
  return String(value).trim().split(/\s+/).filter(Boolean).length;
}

function textHasUnsafeMarkup(value = '') {
  const text = String(value);
  return /<\s*(?:script|iframe|object|embed|form)\b/i.test(text)
    || /javascript\s*:/i.test(text)
    || /data\s*:\s*text\/html/i.test(text);
}

function directUrlInEditorial(value = '') {
  return /https?:\/\//i.test(String(value));
}

function articleBySlug(list = []) {
  return new Map(list.map((article) => [article.slug, article]));
}

function sourceById(list = []) {
  return new Map(list.map((source) => [source.id, source]));
}

export function reviewPromotionDiff(base, head, registry, changedFiles = []) {
  const blockers = [];
  const warnings = [];
  const baseArticles = Array.isArray(base?.articulos) ? base.articulos : [];
  const headArticles = Array.isArray(head?.articulos) ? head.articulos : [];
  const baseSources = Array.isArray(base?.fuentes) ? base.fuentes : [];
  const headSources = Array.isArray(head?.fuentes) ? head.fuentes : [];
  const baseArticleMap = articleBySlug(baseArticles);
  const headArticleMap = articleBySlug(headArticles);
  const baseSourceMap = sourceById(baseSources);
  const headSourceMap = sourceById(headSources);

  const normalizedFiles = changedFiles.map((file) => String(file).trim()).filter(Boolean);
  const unexpectedFiles = normalizedFiles.filter((file) => file !== 'src/data/economia.json');
  if (unexpectedFiles.length) blockers.push(`El PR toca archivos fuera de economia.json: ${unexpectedFiles.join(', ')}.`);
  if (normalizedFiles.length && !normalizedFiles.includes('src/data/economia.json')) blockers.push('El PR no modifica src/data/economia.json.');

  if (base?.nota !== head?.nota) blockers.push('La nota editorial global fue modificada.');

  for (const article of baseArticles) {
    const next = headArticleMap.get(article.slug);
    if (!next) blockers.push(`Se eliminó el artículo existente ${article.slug}.`);
    else if (!equal(article, next)) blockers.push(`Se modificó el artículo existente ${article.slug}.`);
  }

  for (const source of baseSources) {
    const next = headSourceMap.get(source.id);
    if (!next) blockers.push(`Se eliminó la fuente existente ${source.id}.`);
    else if (!equal(source, next)) blockers.push(`Se modificó la fuente existente ${source.id}.`);
  }

  const addedArticles = headArticles.filter((article) => !baseArticleMap.has(article.slug));
  const addedSources = headSources.filter((source) => !baseSourceMap.has(source.id));
  if (addedArticles.length !== 1) blockers.push(`La promoción debe añadir exactamente 1 artículo; añade ${addedArticles.length}.`);
  if (addedSources.length > 1) blockers.push(`La promoción puede añadir como máximo 1 ficha de fuente; añade ${addedSources.length}.`);

  const article = addedArticles[0] || null;
  const addedSource = addedSources[0] || null;
  if (article && headArticles[0]?.slug !== article.slug) blockers.push('El nuevo artículo no quedó al inicio del Radar.');

  if (article) {
    const required = ['slug', 'categoria', 'fecha', 'titulo', 'descripcion', 'datoPrincipal', 'datoEtiqueta', 'fotoId', 'fotoAlt', 'fuenteId', 'fuenteFecha', 'quePaso', 'porQueImporta', 'aQuienAfecta', 'queHacer', 'radarKey'];
    for (const field of required) if (!String(article[field] ?? '').trim()) blockers.push(`El artículo nuevo no tiene ${field}.`);

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug || '')) blockers.push('El slug nuevo no es seguro para URL.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(article.fecha || '')) blockers.push('La fecha del artículo no tiene formato ISO.');
    if (!/^[a-f0-9]{8,64}$/i.test(article.radarKey || '')) blockers.push('radarKey no tiene un formato válido.');
    if (baseArticles.some((item) => item.radarKey && item.radarKey === article.radarKey)) blockers.push('radarKey ya existía antes del PR.');
    if (!/^\d+$/.test(String(article.fotoId || ''))) blockers.push('fotoId no es numérico.');

    const registeredSource = headSourceMap.get(article.fuenteId);
    if (!registeredSource) blockers.push(`La fuente ${article.fuenteId} no está registrada en economia.json.`);
    else if (!validOfficialUrl(registeredSource.url)) blockers.push(`La fuente ${article.fuenteId} no apunta a INEGI o Banco de México.`);

    const allowedTools = new Set((registry?.sources || []).flatMap((source) => source.tools || []));
    for (const [label, tool] of [['principal', article.herramienta], ['secundaria', article.herramientaSecundaria]]) {
      if (!tool?.href || !allowedTools.has(tool.href)) blockers.push(`La herramienta ${label} no pertenece a la allowlist del Radar.`);
      if (!String(tool?.texto || '').trim()) blockers.push(`La herramienta ${label} no tiene texto visible.`);
    }
    if (article.herramienta?.href && article.herramienta?.href === article.herramientaSecundaria?.href) warnings.push('Las dos herramientas internas apuntan a la misma ruta.');

    const editorialFields = ['titulo', 'descripcion', 'quePaso', 'porQueImporta', 'aQuienAfecta', 'queHacer', 'fotoAlt'];
    for (const field of editorialFields) {
      if (textHasUnsafeMarkup(article[field])) blockers.push(`${field} contiene marcado o protocolo inseguro.`);
      if (directUrlInEditorial(article[field])) blockers.push(`${field} contiene una URL directa; los enlaces editoriales deben pasar por campos estructurados.`);
    }

    for (const [field, min, max] of [
      ['quePaso', 20, 120],
      ['porQueImporta', 20, 110],
      ['aQuienAfecta', 18, 110],
      ['queHacer', 20, 120],
    ]) {
      const count = words(article[field]);
      if (count < min) blockers.push(`${field} tiene ${count} palabras; mínimo ${min}.`);
      if (count > max) warnings.push(`${field} tiene ${count} palabras; objetivo máximo ${max}.`);
    }

    if (String(article.descripcion || '').length > 260) warnings.push('La descripción supera 260 caracteres.');
    if (String(article.titulo || '').length > 95) warnings.push('El título supera 95 caracteres.');
  }

  if (addedSource && !validOfficialUrl(addedSource.url)) blockers.push(`La nueva fuente ${addedSource.id} no es oficial de INEGI/Banco de México.`);

  if (head?.actualizado && base?.actualizado && head.actualizado < base.actualizado) blockers.push('El campo actualizado retrocedió de fecha.');
  if (article && article.fecha > (base?.actualizado || '') && head?.actualizado !== article.fecha) blockers.push('actualizado no coincide con la fecha de la nueva nota más reciente.');

  return {
    ok: blockers.length === 0,
    blockers,
    warnings,
    addedArticle: article ? {
      slug: article.slug,
      title: article.titulo,
      date: article.fecha,
      fact: article.datoPrincipal,
      sourceId: article.fuenteId,
      radarKey: article.radarKey,
    } : null,
    addedSource: addedSource ? { id: addedSource.id, url: addedSource.url } : null,
    changedFiles: normalizedFiles,
  };
}

export function renderReviewMarkdown(report) {
  const icon = report.ok ? '✅' : '⛔';
  const article = report.addedArticle;
  const blockers = report.blockers.length ? report.blockers.map((item) => `- ${item}`).join('\n') : '- Ninguno';
  const warnings = report.warnings.length ? report.warnings.map((item) => `- ${item}`).join('\n') : '- Ninguna';
  return [
    '<!-- radar-pr-review -->',
    `## ${icon} Revisión automática del Radar`,
    '',
    report.ok
      ? '**Estructura aprobada automáticamente. Esto NO equivale a aprobación editorial ni autoriza el merge.**'
      : '**Promoción bloqueada por guardas estructurales. No debe fusionarse mientras existan bloqueos.**',
    '',
    article ? `**Nota nueva:** \`${article.slug}\` · ${article.date} · ${article.fact} · fuente \`${article.sourceId}\`` : '**Nota nueva:** no identificada',
    '',
    '### Bloqueos',
    blockers,
    '',
    '### Advertencias',
    warnings,
    '',
    '### Qué sí comprobó este revisor',
    '- El PR es quirúrgico y no altera artículos/fuentes previos.',
    '- La nueva nota conserva estructura, fuente oficial y `radarKey`.',
    '- Enlaces internos, foto y campos mínimos siguen la allowlist del Radar.',
    '- No hay marcado ejecutable ni URLs directas dentro del copy editorial.',
    '',
    '### Qué sigue siendo humano',
    '- Confirmar cifra, periodo y alcance en la fuente oficial.',
    '- Revisar tono, interpretación y utilidad real.',
    '- Revisar la vista previa de Vercel en móvil y escritorio.',
    '- Decidir si se fusiona el PR.',
  ].join('\n');
}
