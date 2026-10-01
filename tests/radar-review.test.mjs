import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { promotionReport } from '../scripts/radar/promotion-lib.mjs';
import { reviewPromotionDiff, renderReviewMarkdown } from '../scripts/radar/review-lib.mjs';

const registry = JSON.parse(readFileSync(new URL('../src/data/radar-sources.json', import.meta.url), 'utf8'));
const baseEconomia = JSON.parse(readFileSync(new URL('../src/data/economia.json', import.meta.url), 'utf8'));

function candidate() {
  return {
    key: '1234567890abcdef1234',
    status: 'needs-review',
    sourceId: 'inegi-desocupacion',
    institution: 'INEGI',
    sourceName: 'Tasa de desocupación',
    sourceUrl: 'https://www.inegi.org.mx/servicios/xml/DESUNI_M_O.xml',
    publishedAt: '2026-10-05',
    title: 'Tasa de desocupación, serie unificada. Total (mensual)',
    summary: 'Tasa de desocupación. Periodo 2026/09: 3.1%.',
    category: 'Empleo y salarios',
    detectedFact: '3.1%',
    period: '2026/09',
    value: 3.1,
    valueStatus: null,
    signalType: 'dato-estadistico-observado',
    editorial: { draft: { detectedFact: '3.1%' } },
  };
}

function validHead() {
  const promotion = promotionReport(candidate(), registry, baseEconomia, { today: '2026-10-05' });
  assert.equal(promotion.ok, true, promotion.blockers.join('\n'));
  return promotion.nextEconomia;
}

test('revisor acepta una promoción quirúrgica generada por el pipeline', () => {
  const report = reviewPromotionDiff(baseEconomia, validHead(), registry, ['src/data/economia.json']);
  assert.equal(report.ok, true, report.blockers.join('\n'));
  assert.equal(report.addedArticle.sourceId, 'inegi-desocupacion');
  assert.equal(report.addedArticle.radarKey, '1234567890abcdef1234');
  assert.match(renderReviewMarkdown(report), /Estructura aprobada/);
});

test('revisor bloquea cambios a artículos existentes', () => {
  const head = validHead();
  head.articulos[1] = { ...head.articulos[1], titulo: `${head.articulos[1].titulo} alterado` };
  const report = reviewPromotionDiff(baseEconomia, head, registry, ['src/data/economia.json']);
  assert.equal(report.ok, false);
  assert.ok(report.blockers.some((item) => /Se modificó el artículo existente/.test(item)));
});

test('revisor bloquea archivos ajenos a economia.json', () => {
  const report = reviewPromotionDiff(baseEconomia, validHead(), registry, ['src/data/economia.json', 'src/App.jsx']);
  assert.equal(report.ok, false);
  assert.ok(report.blockers.some((item) => /archivos fuera de economia\.json/.test(item)));
});

test('revisor bloquea fuente no oficial aunque el resto del artículo sea válido', () => {
  const head = validHead();
  const newArticle = head.articulos[0];
  const sourceIndex = head.fuentes.findIndex((item) => item.id === newArticle.fuenteId);
  head.fuentes[sourceIndex] = { ...head.fuentes[sourceIndex], url: 'https://example.com/dato' };
  const report = reviewPromotionDiff(baseEconomia, head, registry, ['src/data/economia.json']);
  assert.equal(report.ok, false);
  assert.ok(report.blockers.some((item) => /no apunta a INEGI o Banco de México/.test(item)));
});

test('revisor bloquea URL directa y marcado ejecutable en el copy nuevo', () => {
  const head = validHead();
  head.articulos[0].queHacer = `${head.articulos[0].queHacer} https://example.com <script>alert(1)</script>`;
  const report = reviewPromotionDiff(baseEconomia, head, registry, ['src/data/economia.json']);
  assert.equal(report.ok, false);
  assert.ok(report.blockers.some((item) => /marcado o protocolo inseguro/.test(item)));
  assert.ok(report.blockers.some((item) => /URL directa/.test(item)));
});

test('revisor bloquea borrado de una nota previa', () => {
  const head = validHead();
  const removedSlug = baseEconomia.articulos[0].slug;
  head.articulos = head.articulos.filter((item) => item.slug !== removedSlug);
  const report = reviewPromotionDiff(baseEconomia, head, registry, ['src/data/economia.json']);
  assert.equal(report.ok, false);
  assert.ok(report.blockers.some((item) => item.includes(`Se eliminó el artículo existente ${removedSlug}`)));
});

test('workflow del revisor solo corre para PRs técnicos del bot y no escribe contenido', () => {
  const workflow = readFileSync(new URL('../.github/workflows/radar-review.yml', import.meta.url), 'utf8');
  assert.match(workflow, /startsWith\(github\.event\.pull_request\.head\.ref, 'radar\/promotion-'\)/);
  assert.match(workflow, /github\.event\.pull_request\.head\.repo\.full_name == github\.repository/);
  assert.match(workflow, /github\.event\.pull_request\.user\.login == 'github-actions\[bot\]'/);
  assert.match(workflow, /^\s+contents:\s*read\s*$/m);
  assert.doesNotMatch(workflow, /^\s+contents:\s*write\s*$/m);
  assert.match(workflow, /pull-requests:\s*write/);
  assert.match(workflow, /issues:\s*write/);
  assert.match(workflow, /Bloquear check si hay guardas incumplidas/);
  assert.doesNotMatch(workflow, /git\s+push|merge_pull_request|draft:\s*false/i);
});

test('revisor actualiza un semáforo compacto en el Issue origen', () => {
  const workflow = readFileSync(new URL('../.github/workflows/radar-review.yml', import.meta.url), 'utf8');
  assert.match(workflow, /Actualizar semáforo en el Issue origen/);
  assert.match(workflow, /radar-source-status/);
  assert.match(workflow, /LISTO PARA REVISIÓN HUMANA/);
  assert.match(workflow, /## 🔴 BLOQUEADO/);
  assert.match(workflow, /Estado público:\*\* todavía no publicado/);
  assert.match(workflow, /updateComment/);
  assert.match(workflow, /blockers\.slice\(0, 5\)/);
});
