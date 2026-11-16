// Vigía de leyes: detecta qué artículos citados por MiLana cambiaron en el texto oficial.
// Uso: node vigia-leyes.mjs <carpeta de trabajo> [--guardar]
//   - Descarga los PDF vigentes de diputados.gob.mx (o usa los que ya estén en la carpeta).
//   - Extrae el texto con `pdftotext -layout` (paquete poppler-utils).
//   - Calcula una huella por artículo, sin encabezados de página ni fecha de «Última reforma».
//   - Compara contra huellas.json. Con --guardar, escribe el estado actual como nueva base.
// Sale con código 1 si algo cambió, para que una automatización abra un aviso.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LEYES = {
  LFT: { url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf',
    articulos: ['20', '21', '48', '49', '50', '58', '59', '61', '66', '67', '68', '69', '71', '73', '74', '76', '79', '80', '81', '84', '87', '88', '89', '117', '120', '122', '123', '124', '126', '127', '132', '162', '485', '486', '516', '517', '518', '519'] },
  LSS: { url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LSS.pdf', articulos: ['27', '28', '106', '107', '147', '154', '162', '168', '170'] },
  LISR: { url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf', articulos: ['9', '93', '94', '96', '113-E', '150', '151', '152'] },
};
const RUIDO = /CÁMARA DE DIPUTADOS|Secretaría General|Secretaría de Servicios Parlamentarios|Última Reforma DOF|^\s*\d+ de \d+\s*$|^\s*LEY (FEDERAL|DEL)\b.*$/;

const dir = process.argv[2];
const guardar = process.argv.includes('--guardar');
if (!dir) { console.error('Falta la carpeta de trabajo'); process.exit(2); }

function textoDe(clave, url) {
  const pdf = join(dir, `${clave}.pdf`);
  if (!existsSync(pdf)) execFileSync('curl', ['-sS', '-L', '-m', '180', '-o', pdf, url]);
  return execFileSync('pdftotext', ['-layout', pdf, '-'], { maxBuffer: 256 * 1024 * 1024 }).toString('utf8');
}

function articulos(texto, lista) {
  const lineas = texto.split('\n');
  const reforma = (texto.match(/Última Reforma DOF (\d{2}-\d{2}-\d{4})/) || [])[1] || null;
  // El cuerpo de la ley termina donde empiezan los transitorios del decreto original.
  const inicio = /^\s*Art[íi]culo\s+(\d+(?:o\.)?(?:-[A-Z])?(?:\s+(?:Bis|Ter|Quáter))?)\s*\.(?:-|\s)/;
  const salida = {};
  let actual = null; let vistos = new Set();
  for (const l of lineas) {
    if (RUIDO.test(l)) continue;
    const m = l.match(inicio);
    if (m) {
      const n = m[1].replace(/o\.$/, '').replace(/\s+/g, ' ');
      // Solo la primera aparición: los decretos de reforma al final repiten números de artículo.
      actual = vistos.has(n) ? null : n;
      vistos.add(n);
      if (actual && lista.includes(actual)) salida[actual] = [];
    }
    if (actual && salida[actual]) salida[actual].push(l);
  }
  const huellas = {};
  for (const n of lista) {
    const cuerpo = (salida[n] || []).join(' ').replace(/\s+/g, ' ').trim();
    huellas[n] = cuerpo ? { huella: createHash('sha256').update(cuerpo).digest('hex').slice(0, 16), largo: cuerpo.length, inicio: cuerpo.slice(0, 90) } : null;
  }
  return { reforma, huellas };
}

const estado = {};
for (const [clave, { url, articulos: lista }] of Object.entries(LEYES)) estado[clave] = articulos(textoDe(clave, url), lista);

const base = join(dir, 'huellas.json');
const previo = existsSync(base) ? JSON.parse(readFileSync(base, 'utf8')) : null;
const cambios = [];
for (const [clave, e] of Object.entries(estado)) {
  for (const [n, h] of Object.entries(e.huellas)) {
    if (!h) { cambios.push(`${clave} art. ${n}: no se encontró en el texto (revisar el extractor)`); continue; }
    const antes = previo?.[clave]?.huellas?.[n];
    if (previo && antes && antes.huella !== h.huella) cambios.push(`${clave} art. ${n}: cambió el texto`);
    if (previo && !antes) cambios.push(`${clave} art. ${n}: artículo nuevo en la lista`);
  }
  if (previo && previo[clave]?.reforma !== e.reforma) console.log(`${clave}: la última reforma pasó de ${previo[clave]?.reforma} a ${e.reforma}`);
}
for (const [clave, e] of Object.entries(estado)) console.log(`${clave}: última reforma ${e.reforma}; ${Object.values(e.huellas).filter(Boolean).length} de ${Object.keys(e.huellas).length} artículos localizados`);
if (guardar || !previo) { writeFileSync(base, JSON.stringify(estado, null, 1)); console.log('Base guardada en', base); }
if (cambios.length) { console.log('\nCAMBIOS:\n' + cambios.map((c) => ' - ' + c).join('\n')); process.exit(previo ? 1 : 0); }
console.log(previo ? 'Sin cambios en los artículos vigilados.' : 'Primera corrida: base creada.');
