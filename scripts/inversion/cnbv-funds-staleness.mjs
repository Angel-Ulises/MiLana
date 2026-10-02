import { CNBV_FUND_SAMPLE } from '../../src/data/cnbv-fund-sample.js';

const DAY_MS = 86_400_000;

function parseIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ''))) throw new Error(`Fecha inválida: ${value}`);
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error(`Fecha inválida: ${value}`);
  return date;
}

export function evaluarRevisionCNBV({ checkedAt, cadenceDays, today }) {
  const checked = parseIsoDate(checkedAt);
  const current = parseIsoDate(today);
  const elapsedDays = Math.floor((current.getTime() - checked.getTime()) / DAY_MS);
  if (elapsedDays < 0) throw new Error('La fecha de revisión no puede estar en el futuro');
  const cadence = Number(cadenceDays);
  if (!Number.isInteger(cadence) || cadence < 1 || cadence > 120) throw new Error('Cadencia inválida');
  return {
    needsReview: elapsedDays >= cadence,
    elapsedDays,
    cadenceDays: cadence,
    checkedAt,
    nextReviewDate: new Date(checked.getTime() + cadence * DAY_MS).toISOString().slice(0, 10),
  };
}

function arg(name) {
  const prefix = `--${name}=`;
  const value = process.argv.find((item) => item.startsWith(prefix));
  return value ? value.slice(prefix.length) : null;
}

const isCli = process.argv[1] && new URL(import.meta.url).pathname === process.argv[1];
if (isCli) {
  const today = arg('today') || new Date().toISOString().slice(0, 10);
  const cadenceDays = CNBV_FUND_SAMPLE.reviewCadenceDays ?? 30;
  const result = evaluarRevisionCNBV({ checkedAt: CNBV_FUND_SAMPLE.checkedAt, cadenceDays, today });
  const payload = {
    ...result,
    sourcePeriod: CNBV_FUND_SAMPLE.sourcePeriod,
    sourceUrl: CNBV_FUND_SAMPLE.sourceUrl,
    message: result.needsReview
      ? `Toca volver a comprobar el corte oficial de fondos CNBV. Última revisión editorial: ${CNBV_FUND_SAMPLE.checkedAt}; snapshot publicado: ${CNBV_FUND_SAMPLE.sourcePeriod}.`
      : `Aún no toca revisión. Próxima fecha: ${result.nextReviewDate}.`,
  };
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}
