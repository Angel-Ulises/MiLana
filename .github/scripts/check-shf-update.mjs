const INDEX_URL = 'https://www.gob.mx/shf/documentos/indice-shf-de-precios-de-la-vivienda-en-mexico-2025-a-2026';
const CURRENT_PERIOD = '2026-T2';
const NEXT_PERIOD = '2026-T3';
const NOT_BEFORE = '2026-10-26';
const ALLOWED_HOSTS = new Set(['www.gob.mx', 'gob.mx']);

function limpiarHtml(html = '') {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&iacute;|&#237;/gi, 'í')
    .replace(/&Iacute;|&#205;/g, 'Í')
    .replace(/&oacute;|&#243;/gi, 'ó')
    .replace(/&Oacute;|&#211;/g, 'Ó')
    .replace(/\s+/g, ' ')
    .trim();
}

export function detectarT3(html = '') {
  const texto = limpiarHtml(html);
  const patrones = [
    /Índice\s+SHF(?:\s+datos\s+abiertos)?\s+T3\s+2026/i,
    /Indice\s+SHF(?:\s+datos\s+abiertos)?\s+T3\s+2026/i,
    /Índice\s+SHF[^.]{0,80}(?:tercer|3er)\s+trimestre\s+(?:de\s+)?2026/i,
    /Indice_SHF[^"'\s<>]{0,100}(?:3[_-]?trim|T3)[^"'\s<>]{0,100}2026/i,
  ];
  return patrones.some((re) => re.test(texto) || re.test(String(html)));
}

export function debeRevisar(hoy = new Date(), notBefore = NOT_BEFORE) {
  const inicio = new Date(`${notBefore}T00:00:00-06:00`);
  return hoy.getTime() >= inicio.getTime();
}

function validarUrl(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new Error(`Fuente SHF no autorizada: ${parsed.hostname}`);
  }
  return parsed;
}

async function descargarIndice() {
  validarUrl(INDEX_URL);
  const respuesta = await fetch(INDEX_URL, {
    redirect: 'follow',
    headers: {
      'user-agent': 'MiLana-SHFFreshness/1.0 (+https://www.milanaaqui.mx/)',
      accept: 'text/html,application/xhtml+xml',
    },
  });

  let final;
  try {
    final = validarUrl(respuesta.url || INDEX_URL);
  } catch (error) {
    return { ok: false, status: respuesta.status, motivo: error.message, url: INDEX_URL };
  }

  if (!respuesta.ok) {
    return { ok: false, status: respuesta.status, motivo: 'fuente-no-disponible', url: final.toString() };
  }

  const html = await respuesta.text();
  if (html.length < 500) {
    return { ok: false, status: respuesta.status, motivo: 'respuesta-demasiado-corta', url: final.toString() };
  }

  return { ok: true, status: respuesta.status, html, url: final.toString() };
}

export async function revisar({ hoy = new Date(), force = false, html = null } = {}) {
  if (!force && !debeRevisar(hoy)) {
    return {
      nuevaPublicacion: false,
      estado: 'aun-no-corresponde',
      periodoActual: CURRENT_PERIOD,
      proximoPeriodo: NEXT_PERIOD,
      revisarDesde: NOT_BEFORE,
      url: INDEX_URL,
    };
  }

  if (typeof html === 'string') {
    return {
      nuevaPublicacion: detectarT3(html),
      estado: detectarT3(html) ? 'nuevo-shf-disponible' : 'sin-publicacion-nueva',
      periodoActual: CURRENT_PERIOD,
      proximoPeriodo: NEXT_PERIOD,
      revisarDesde: NOT_BEFORE,
      url: INDEX_URL,
      status: 200,
    };
  }

  const remoto = await descargarIndice();
  if (!remoto.ok) {
    return {
      nuevaPublicacion: false,
      estado: remoto.motivo || 'fuente-no-disponible',
      periodoActual: CURRENT_PERIOD,
      proximoPeriodo: NEXT_PERIOD,
      revisarDesde: NOT_BEFORE,
      url: remoto.url || INDEX_URL,
      status: remoto.status || 0,
    };
  }

  const disponible = detectarT3(remoto.html);
  return {
    nuevaPublicacion: disponible,
    estado: disponible ? 'nuevo-shf-disponible' : 'sin-publicacion-nueva',
    periodoActual: CURRENT_PERIOD,
    proximoPeriodo: NEXT_PERIOD,
    revisarDesde: NOT_BEFORE,
    url: remoto.url,
    status: remoto.status,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  revisar({ force: process.env.FORCE_CHECK === '1' })
    .then((resultado) => process.stdout.write(`${JSON.stringify(resultado)}\n`))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
