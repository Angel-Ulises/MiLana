const MONTHS = {
  enero:'01', febrero:'02', marzo:'03', abril:'04', mayo:'05', junio:'06', julio:'07', agosto:'08', septiembre:'09', octubre:'10', noviembre:'11', diciembre:'12',
};

const TERMS = [
  { id:'cetes-28', label:'1 mes', days:28 },
  { id:'cetes-91', label:'3 meses', days:91 },
  { id:'cetes-182', label:'6 meses', days:182 },
  { id:'cetes-364', label:'1 año', days:364 },
  { id:'cetes-728', label:'2 años', days:728 },
];

export function htmlToText(html) {
  return String(html ?? '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&aacute;/gi, 'á').replace(/&eacute;/gi, 'é').replace(/&iacute;/gi, 'í').replace(/&oacute;/gi, 'ó').replace(/&uacute;/gi, 'ú')
    .replace(/&ntilde;/gi, 'ñ').replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function isoDate(day, monthName, year) {
  const month = MONTHS[String(monthName).toLowerCase()];
  if (!month) throw new Error(`Mes no reconocido: ${monthName}`);
  return `${year}-${month}-${String(day).padStart(2,'0')}`;
}

export function parseCetesOfficialTable(html) {
  const text = htmlToText(html);
  const dateMatch = text.match(/CETES\s+(\d{1,2})\s+(Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre)\s+(\d{4})/i);
  if (!dateMatch) throw new Error('No se encontró la fecha de la tabla CETES');

  const products = TERMS.map((term) => {
    const escaped = term.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const row = text.match(new RegExp(`${escaped}\\s+([0-9]+(?:\\.[0-9]+)?)\\s+([0-9]+(?:\\.[0-9]+)?)`, 'i'));
    if (!row) throw new Error(`No se encontró fila para ${term.label}`);
    return {
      id: term.id,
      displayTerm: term.label,
      days: term.days,
      indicativePrice: Number(row[1]),
      grossAnnualRatePct: Number(row[2]),
    };
  });

  return { sourceDate: isoDate(dateMatch[1], dateMatch[2], dateMatch[3]), products };
}

export function compareCetesSnapshots(current, remote) {
  const changes = [];
  if (current.sourceDate !== remote.sourceDate) changes.push(`fecha ${current.sourceDate} → ${remote.sourceDate}`);
  for (const remoteProduct of remote.products) {
    const local = current.products.find((item) => item.id === remoteProduct.id);
    if (!local) { changes.push(`${remoteProduct.id}: nuevo plazo`); continue; }
    if (Number(local.indicativePrice) !== Number(remoteProduct.indicativePrice)) changes.push(`${remoteProduct.id}: precio ${local.indicativePrice} → ${remoteProduct.indicativePrice}`);
    if (Number(local.grossAnnualRatePct) !== Number(remoteProduct.grossAnnualRatePct)) changes.push(`${remoteProduct.id}: tasa ${local.grossAnnualRatePct} → ${remoteProduct.grossAnnualRatePct}`);
  }
  return { changed: changes.length > 0, changes };
}
