import { createHash } from 'node:crypto';

const MESES = {
  ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6,
  jul: 7, ago: 8, sep: 9, oct: 10, nov: 11, dic: 12,
};

export function decodeEntities(text = '') {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

export function stripHtml(text = '') {
  return decodeEntities(text)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(?:p|li|tr|div|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[\t\r ]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function tag(block, names) {
  for (const name of names) {
    const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i');
    const match = block.match(re);
    if (match) return stripHtml(match[1]);
  }
  return '';
}

function tagLang(block, name, lang) {
  const re = new RegExp(`<${name}[^>]*xml:lang=["']${lang}["'][^>]*>([\\s\\S]*?)<\\/${name}>`, 'i');
  return stripHtml(block.match(re)?.[1] || '');
}

function attr(block, tagName, attrName) {
  const re = new RegExp(`<${tagName}[^>]*${attrName}=["']([^"']+)["'][^>]*>`, 'i');
  return block.match(re)?.[1] || '';
}

function attrsFromTag(tagText) {
  const attrs = {};
  for (const match of tagText.matchAll(/([\w:-]+)=["']([^"']*)["']/g)) attrs[match[1]] = decodeEntities(match[2]);
  return attrs;
}

export function normalizeDate(value) {
  if (!value) return null;
  const raw = String(value).trim();
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const dmy = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (dmy) {
    let year = Number(dmy[3]);
    if (year < 100) year += year >= 70 ? 1900 : 2000;
    return `${String(year).padStart(4, '0')}-${String(Number(dmy[2])).padStart(2, '0')}-${String(Number(dmy[1])).padStart(2, '0')}`;
  }

  const es = raw.toLowerCase().match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)(?:\s+de)?\s+(\d{4})/i);
  if (es) {
    const key = es[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 3);
    const month = MESES[key];
    if (month) return `${es[3]}-${String(month).padStart(2, '0')}-${String(Number(es[1])).padStart(2, '0')}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.valueOf())) return parsed.toISOString().slice(0, 10);
  return null;
}

export function parseFeed(xml, source) {
  const blocks = [
    ...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi),
  ].map((m) => m[1]);

  if (!blocks.length) {
    blocks.push(...[...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)].map((m) => m[1]));
  }

  return blocks.map((block) => {
    const title = tag(block, ['title', 'titulo', 'nombre']);
    const description = tag(block, ['description', 'summary', 'content', 'descripcion', 'valor']);
    const link = tag(block, ['link', 'url']) || attr(block, 'link', 'href') || source.url;
    const guid = tag(block, ['guid', 'id']) || link || title;
    const publishedRaw = tag(block, ['pubDate', 'published', 'updated', 'fecha']);
    return {
      sourceId: source.id,
      institution: source.institution,
      sourceName: source.name,
      sourceUrl: link || source.url,
      externalId: guid,
      title,
      summary: description,
      publishedAt: normalizeDate(publishedRaw),
      rawPublishedAt: publishedRaw,
    };
  }).filter((item) => item.title || item.summary);
}

export function parseInegiSeries(xml, source) {
  const metadata = xml.match(/<METADATA\b[^>]*>([\s\S]*?)<\/METADATA>/i)?.[1] || '';
  const nemonic = tag(metadata, ['Nemonic']) || source.id;
  const name = tagLang(metadata, 'Name', 'es') || tag(metadata, ['Name']) || source.name;
  const unit = tagLang(metadata, 'Unit', 'es') || tag(metadata, ['Unit']);
  const lastUpdateRaw = tag(metadata, ['LastUpdate', 'CreationDate']);
  const decimalsRaw = tag(metadata, ['NoOfDecimals']);
  const decimals = Number.isFinite(Number(decimalsRaw)) ? Math.max(0, Math.min(6, Number(decimalsRaw))) : 3;
  const publishedAt = normalizeDate(lastUpdateRaw);
  const isPercent = /porcent|variaci[oó]n/i.test(unit) || /inflaci[oó]n|desocupaci[oó]n|variaci[oó]n anual/i.test(name);

  const observations = [...xml.matchAll(/<Obs\b([^>]*)\/?\s*>/gi)].map((match) => attrsFromTag(match[1]));
  return observations.map((obs) => {
    const numeric = Number(obs.CurrentValue);
    if (!obs.TimePeriod || !Number.isFinite(numeric)) return null;
    const rounded = numeric.toFixed(decimals).replace(/\.0+$|(?<=\.[0-9]*?)0+$/g, '');
    const status = obs.ValueStatus ? ` · estatus: ${obs.ValueStatus}` : '';
    const suffix = isPercent ? '%' : unit ? ` ${unit}` : '';
    return {
      sourceId: source.id,
      institution: source.institution,
      sourceName: source.name,
      sourceUrl: source.url,
      externalId: `${nemonic}:${obs.TimePeriod}:${rounded}`,
      title: name,
      summary: `${name}. Periodo ${obs.TimePeriod}: ${rounded}${suffix}${status}.`,
      publishedAt,
      rawPublishedAt: lastUpdateRaw,
      period: obs.TimePeriod,
      value: numeric,
      valueStatus: obs.ValueStatus || null,
    };
  }).filter(Boolean);
}

export function parseBanxicoList(html, source) {
  const text = stripHtml(html);
  const lines = text.split('\n').map((x) => x.trim()).filter(Boolean);
  const items = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const match = line.match(/^(\d{2}\/\d{2}\/\d{2})\s*(?:\||[-–—])?\s*(.*)$/);
    if (!match) continue;
    let title = match[2].trim();
    if (!title && lines[i + 1] && !/^\d{2}\/\d{2}\/\d{2}/.test(lines[i + 1])) title = lines[i + 1].trim();
    if (!title || /^(Texto completo|Minuta|Presentaci[oó]n|Recuadros|Video|Infograf[ií]a)$/i.test(title)) continue;
    items.push({
      sourceId: source.id,
      institution: source.institution,
      sourceName: source.name,
      sourceUrl: source.url,
      externalId: `${match[1]}:${title}`,
      title,
      summary: title,
      publishedAt: normalizeDate(match[1]),
      rawPublishedAt: match[1],
    });
  }

  return items;
}

export function candidateKey(item) {
  const canonical = [item.sourceId, item.publishedAt || '', item.externalId || '', item.title || '']
    .join('|')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  return createHash('sha256').update(canonical).digest('hex').slice(0, 20);
}

function searchable(item) {
  return `${item.title || ''} ${item.summary || ''}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function isRelevant(item, source) {
  if (!source.keywords?.length) return true;
  const haystack = searchable(item);
  return source.keywords.some((keyword) => haystack.includes(
    keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(),
  ));
}

export function extractFact(text = '') {
  const clean = stripHtml(text);
  const percent = clean.match(/-?\d+(?:[.,]\d+)?\s*%/);
  if (percent) return percent[0].replace(',', '.');
  const basis = clean.match(/-?\d+(?:[.,]\d+)?\s*(?:puntos?\s+base|pb)/i);
  if (basis) return basis[0];
  return null;
}

export function buildCandidate(item, source, notBefore) {
  if (!item.publishedAt || item.publishedAt < notBefore) return null;
  if (!isRelevant(item, source)) return null;
  const fact = extractFact(`${item.title} ${item.summary}`);
  return {
    key: candidateKey(item),
    status: 'needs-review',
    sourceId: source.id,
    institution: source.institution,
    sourceName: source.name,
    sourceUrl: item.sourceUrl || source.url,
    publishedAt: item.publishedAt,
    title: item.title || source.name,
    summary: item.summary || item.title || '',
    category: source.category,
    detectedFact: fact,
    editorial: {
      whyItMatters: source.whyItMatters,
      audience: source.audience,
      tools: source.tools,
      rule: 'No publicar automáticamente. Verificar el dato en la fuente oficial y redactar con contexto antes de pasar a economia.json.',
    },
  };
}

export function knownArticleFingerprints(economia) {
  const set = new Set();
  for (const article of economia?.articulos || []) {
    const sourceId = article.fuenteId || '';
    const date = article.fecha || '';
    const title = article.titulo || '';
    set.add(`${sourceId}|${date}|${title.toLowerCase().replace(/\s+/g, ' ').trim()}`);
  }
  return set;
}

export function candidateLooksPublished(candidate, economia) {
  const sourceArticles = (economia?.articulos || []).filter((a) => a.fuenteId === candidate.sourceId && a.fecha === candidate.publishedAt);
  if (!sourceArticles.length) return false;
  const words = searchable(candidate).split(/\s+/).filter((w) => w.length >= 5);
  return sourceArticles.some((article) => {
    const articleText = searchable({ title: article.titulo, summary: `${article.quePaso || ''} ${article.descripcion || ''}` });
    const shared = words.filter((w) => articleText.includes(w));
    return shared.length >= Math.min(3, Math.max(1, Math.ceil(words.length * 0.2)));
  });
}
