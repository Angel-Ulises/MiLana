import { candidateLooksPublished } from './collector-lib.mjs';

function normalizeFact(value = '') {
  return String(value).trim().replace(',', '.').replace(/\s+/g, ' ');
}

export function candidateAlreadyPublished(candidate, economia, source) {
  const articles = Array.isArray(economia?.articulos) ? economia.articulos : [];
  if (!candidate?.key) return false;

  // La promoción controlada guarda radarKey: es la identidad canónica y evita
  // que una nota ya fusionada vuelva a ocupar el cupo de candidatos del Radar.
  if (articles.some((article) => article.radarKey && article.radarKey === candidate.key)) return true;

  // Conserva la heurística previa para fuentes cuyo id interno coincide con
  // el id publicado en economia.json.
  if (candidateLooksPublished(candidate, economia)) return true;

  // Algunas fuentes técnicas se consolidan bajo una ficha pública distinta
  // (p. ej. INPC mensual/quincenal -> inegi-inpc). Para contenido heredado que
  // todavía no tenga radarKey, exigimos misma fuente pública + fecha + cifra.
  const publicSourceId = source?.promotion?.publicSourceId;
  const fact = normalizeFact(candidate.detectedFact);
  if (!publicSourceId || !fact) return false;

  return articles.some((article) => (
    article.fuenteId === publicSourceId
    && article.fecha === candidate.publishedAt
    && normalizeFact(article.datoPrincipal) === fact
  ));
}
