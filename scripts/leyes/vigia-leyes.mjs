// Vigía de leyes: avisa cuando cambia el texto de un artículo que MiLana usa.
// Descarga los PDF vigentes de diputados.gob.mx, calcula una huella por artículo (sin encabezados de página ni la
// fecha de «Última reforma») y la compara con data/leyes/huellas.json.
//
// Uso:
//   node scripts/leyes/vigia-leyes.mjs                 → compara; escribe salidas para GitHub Actions si existe GITHUB_OUTPUT
//   node scripts/leyes/vigia-leyes.mjs --guardar       → después de revisar un cambio, fija la base nueva
//   --pdfs <carpeta>  usa (o guarda) ahí los PDF; por defecto una carpeta temporal
// Requiere `pdftotext` (paquete poppler-utils). No cambia nada del sitio: solo informa.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const RAIZ = resolve(new URL('../..', import.meta.url).pathname);
const BASE = join(RAIZ, 'data/leyes/huellas.json');

// Artículos vigilados y páginas de MiLana que dependen de ellos.
export const LEYES = {
  LFT: { nombre: 'Ley Federal del Trabajo', url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf',
    articulos: ['20', '21', '48', '49', '50', '58', '59', '61', '66', '67', '68', '69', '71', '73', '74', '76', '79', '80', '81', '84', '87', '88', '89', '117', '120', '122', '123', '124', '126', '127', '132', '162', '485', '486', '516', '517', '518', '519'] },
  LSS: { nombre: 'Ley del Seguro Social', url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LSS.pdf', articulos: ['27', '28', '106', '107', '147', '154', '162', '168', '170'] },
  LISR: { nombre: 'Ley del Impuesto sobre la Renta', url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf', articulos: ['9', '93', '94', '96', '113-E', '150', '151', '152'] },
};
export const PAGINAS = {
  'LFT 48': ['/calculadoras/liquidacion'], 'LFT 49': ['/calculadoras/liquidacion'], 'LFT 50': ['/calculadoras/liquidacion'],
  'LFT 59': ['/aprende/jornada-2027'], 'LFT 61': ['/aprende/jornada-2027'], 'LFT 66': ['/aprende/jornada-2027'], 'LFT 68': ['/aprende/jornada-2027'],
  'LFT 69': ['/aprende/jornada-2027'], 'LFT 71': ['/aprende/jornada-2027'], 'LFT 73': ['/aprende/jornada-2027'], 'LFT 132': ['/aprende/jornada-2027'],
  'LFT 76': ['/calculadoras/vacaciones', '/calculadoras/finiquito', '/aprende/vacaciones-prima-vacacional'], 'LFT 79': ['/calculadoras/vacaciones', '/aprende/fechas-de-pago'],
  'LFT 80': ['/calculadoras/vacaciones', '/calculadoras/finiquito'], 'LFT 81': ['/aprende/fechas-de-pago'], 'LFT 84': ['/calculadoras/liquidacion'],
  'LFT 87': ['/calculadoras/aguinaldo', '/calculadoras/finiquito', '/aprende/fechas-de-pago'], 'LFT 88': ['/aprende/fechas-de-pago'], 'LFT 89': ['/calculadoras/liquidacion'],
  'LFT 117': ['/calculadoras/ptu'], 'LFT 120': ['/calculadoras/ptu', '/aprende/fechas-de-pago'], 'LFT 122': ['/calculadoras/ptu', '/aprende/fechas-de-pago'],
  'LFT 123': ['/calculadoras/ptu'], 'LFT 124': ['/calculadoras/ptu'], 'LFT 126': ['/aprende/fechas-de-pago'], 'LFT 127': ['/calculadoras/ptu', '/aprende/fechas-de-pago'],
  'LFT 162': ['/calculadoras/finiquito', '/calculadoras/liquidacion'], 'LFT 485': ['/calculadoras/liquidacion'], 'LFT 486': ['/calculadoras/finiquito', '/calculadoras/liquidacion'],
  'LFT 516': ['/aprende/fechas-de-pago', 'resultado: «¿Y si no me lo pagan?»'], 'LFT 517': ['resultado: «¿Y si no me lo pagan?»'], 'LFT 518': ['/aprende/fechas-de-pago', 'resultado: «¿Y si no me lo pagan?»'],
  'LSS 27': ['/calculadoras/bruto-a-neto'], 'LSS 28': ['/calculadoras/bruto-a-neto'], 'LSS 154': ['/calculadoras/pension-imss'], 'LSS 162': ['/calculadoras/pension-imss'],
  'LISR 9': ['/aprende/fechas-de-pago'], 'LISR 93': ['/calculadoras/aguinaldo'], 'LISR 94': ['/calculadoras/isr'], 'LISR 96': ['/calculadoras/isr', '/calculadoras/bruto-a-neto'],
  'LISR 113-E': ['/calculadoras/resico'], 'LISR 150': ['/aprende/fechas-de-pago'],
};
const RUIDO = /CÁMARA DE DIPUTADOS|Secretaría General|Secretaría de Servicios Parlamentarios|Última Reforma DOF|^\s*\d+ de \d+\s*$|^\s*LEY (FEDERAL|DEL)\b.*$/;
const INICIO = /^\s*Art[íi]culo\s+(\d+(?:o\.)?(?:-[A-Z])?(?:\s+(?:Bis|Ter|Quáter))?)\s*\.(?:-|\s)/;

export function huellas(texto, lista) {
  const reforma = (texto.match(/Última Reforma DOF (\d{2}-\d{2}-\d{4})/) || [])[1] || null;
  const cuerpos = {};
  const vistos = new Set();
  let actual = null;
  for (const linea of texto.split('\n')) {
    if (RUIDO.test(linea)) continue;
    const m = linea.match(INICIO);
    if (m) {
      const n = m[1].replace(/o\.$/, '').replace(/\s+/g, ' ');
      // Solo la primera aparición: los decretos al final del PDF repiten números de artículo.
      actual = vistos.has(n) ? null : n;
      vistos.add(n);
      if (actual && lista.includes(actual)) cuerpos[actual] = [];
    }
    if (actual && cuerpos[actual]) cuerpos[actual].push(linea);
  }
  const salida = {};
  for (const n of lista) {
    const cuerpo = (cuerpos[n] || []).join(' ').replace(/\s+/g, ' ').trim();
    salida[n] = cuerpo ? { huella: createHash('sha256').update(cuerpo).digest('hex').slice(0, 16), largo: cuerpo.length, inicio: cuerpo.slice(0, 90) } : null;
  }
  return { reforma, huellas: salida };
}

export function comparar(previo, actual) {
  const cambios = [];
  const reformas = [];
  for (const [clave, e] of Object.entries(actual)) {
    if (previo?.[clave]?.reforma && previo[clave].reforma !== e.reforma) reformas.push(`${LEYES[clave]?.nombre || clave}: la última reforma pasó del ${previo[clave].reforma} al ${e.reforma}`);
    for (const [n, h] of Object.entries(e.huellas)) {
      const antes = previo?.[clave]?.huellas?.[n];
      if (!h) cambios.push({ clave, articulo: n, motivo: 'no se encontró en el texto (revisar el extractor o si se derogó)' });
      else if (antes && antes.huella !== h.huella) cambios.push({ clave, articulo: n, motivo: 'cambió el texto' });
    }
  }
  return { cambios, reformas };
}

function pdfTexto(carpeta, clave, url) {
  const pdf = join(carpeta, `${clave}.pdf`);
  if (!existsSync(pdf)) execFileSync('curl', ['-sS', '-L', '--fail', '-m', '240', '-A', 'Mozilla/5.0 (compatible; MiLana-vigia)', '-o', pdf, url]);
  return execFileSync('pdftotext', ['-layout', pdf, '-'], { maxBuffer: 256 * 1024 * 1024 }).toString('utf8');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const guardar = args.includes('--guardar');
  const iPdfs = args.indexOf('--pdfs');
  const carpeta = iPdfs >= 0 ? resolve(args[iPdfs + 1]) : mkdtempSync(join(tmpdir(), 'leyes-'));
  const estado = {};
  for (const [clave, ley] of Object.entries(LEYES)) estado[clave] = huellas(pdfTexto(carpeta, clave, ley.url), ley.articulos);
  for (const [clave, e] of Object.entries(estado)) console.log(`${clave}: última reforma ${e.reforma}; ${Object.values(e.huellas).filter(Boolean).length} de ${Object.keys(e.huellas).length} artículos localizados`);
  if (guardar) { writeFileSync(BASE, `${JSON.stringify(estado, null, 1)}\n`); console.log('Base guardada en', BASE); process.exit(0); }
  const previo = JSON.parse(readFileSync(BASE, 'utf8'));
  const { cambios, reformas } = comparar(previo, estado);
  const hayCambio = cambios.length > 0 || reformas.length > 0;
  const lineas = [
    ...reformas.map((r) => `- ${r}`),
    ...cambios.map((c) => `- ${LEYES[c.clave].nombre}, artículo ${c.articulo}: ${c.motivo}. Revisar: ${(PAGINAS[`${c.clave} ${c.articulo}`] || ['(sin página asignada)']).join(', ')}`),
  ];
  console.log(hayCambio ? `\nCAMBIOS:\n${lineas.join('\n')}` : 'Sin cambios en los artículos vigilados.');
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `changed=${hayCambio}\nresumen_b64=${Buffer.from(lineas.join('\n'), 'utf8').toString('base64')}\n`);
  }
}
