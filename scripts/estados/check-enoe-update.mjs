import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync('src/data/actualizacionEstados.json', 'utf8'));
const actual = JSON.parse(readFileSync('src/data/mercadoLaboralEstados.json', 'utf8'));

export function urlCandidata(fecha = config.proximaPublicacion) {
  const [year, month] = String(fecha).split('-');
  const mm = String(Number(month)).padStart(2, '0');
  return `https://${config.dominioPermitido}/contenidos/saladeprensa/boletines/${year}/enoe/enoe${year}_${mm}.pdf`;
}

export function debeRevisar(hoy = new Date(), fecha = config.proximaPublicacion) {
  const corte = new Date(`${fecha}T00:00:00-06:00`);
  return hoy.getTime() >= corte.getTime();
}

export function validarConfiguracion() {
  if (actual.actualizado !== config.periodoActual) throw new Error(`Periodo estatal ${actual.actualizado} no coincide con ${config.periodoActual}`);
  if (actual.publicado !== config.publicacionActual) throw new Error(`Fecha estatal ${actual.publicado} no coincide con ${config.publicacionActual}`);
  const url = new URL(urlCandidata());
  if (url.protocol !== 'https:' || url.hostname !== config.dominioPermitido) throw new Error('Dominio de actualización no autorizado');
  return true;
}

async function comprobarPdf(url) {
  const respuesta = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': 'MiLana-EstadoFreshness/1.0 (+https://www.milanaaqui.mx/)' },
  });
  if (!respuesta.ok) return { disponible: false, status: respuesta.status };
  const final = new URL(respuesta.url);
  if (final.hostname !== config.dominioPermitido && final.hostname !== 'inegi.org.mx') {
    throw new Error(`Redirección fuera de INEGI: ${final.hostname}`);
  }
  const tipo = respuesta.headers.get('content-type') || '';
  const buffer = Buffer.from(await respuesta.arrayBuffer());
  const firmaPdf = buffer.subarray(0, 4).toString('ascii') === '%PDF';
  const parecePdf = /application\/pdf/i.test(tipo) || firmaPdf;
  if (!parecePdf || buffer.length < 20_000) return { disponible: false, status: respuesta.status, motivo: 'respuesta-no-pdf' };
  return { disponible: true, status: respuesta.status, bytes: buffer.length, url: respuesta.url };
}

export async function revisar({ hoy = new Date(), force = false } = {}) {
  validarConfiguracion();
  const candidata = urlCandidata();
  if (!force && !debeRevisar(hoy)) {
    return {
      nuevaPublicacion: false,
      estado: 'aun-no-corresponde',
      periodoActual: config.periodoActual,
      proximoPeriodo: config.proximoPeriodo,
      proximaPublicacion: config.proximaPublicacion,
      url: candidata,
    };
  }
  const resultado = await comprobarPdf(candidata);
  return {
    nuevaPublicacion: Boolean(resultado.disponible),
    estado: resultado.disponible ? 'nueva-enoe-disponible' : 'sin-publicacion-nueva',
    periodoActual: config.periodoActual,
    proximoPeriodo: config.proximoPeriodo,
    proximaPublicacion: config.proximaPublicacion,
    url: resultado.url || candidata,
    status: resultado.status,
    bytes: resultado.bytes || 0,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  revisar({ force: process.env.FORCE_CHECK === '1' })
    .then((resultado) => {
      process.stdout.write(`${JSON.stringify(resultado)}\n`);
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
