import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Guías de Aprende: «En 30 segundos» arriba y la profundidad a demanda.
// La primera sección queda abierta; las demás se pliegan con su título visible.
// El texto no cambia (solo se envuelve); fuentes y llamadas a la acción quedan fuera de los pliegues.
const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { guias } = JSON.parse(readFileSync(resolve(RAIZ, 'src/data/aprende-resumen.json'), 'utf8'));
const escapar = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function profundizarGuia(html, puntos) {
  if (html.includes('data-guide-depth')) return html;
  const ini = html.indexOf('<article class="article">');
  const fin = html.indexOf('</article>', ini);
  if (ini < 0 || fin < 0) throw new Error('guía sin <article class="article">');
  let art = html.slice(ini, fin);
  const meta = art.match(/<div class="meta">[\s\S]*?<\/div>/);
  if (!meta) throw new Error('guía sin fecha de revisión');
  const resumen = `<aside class="guide-tldr" data-guide-depth aria-label="En 30 segundos"><strong>En 30 segundos</strong><ul>${puntos.map((p) => `<li>${escapar(p)}</li>`).join('')}</ul></aside>`;
  const despuesMeta = art.indexOf(meta[0]) + meta[0].length;
  const corte = ['<div class="cta">', '<section class="sources">'].map((m) => art.indexOf(m, despuesMeta)).filter((i) => i >= 0);
  const finCuerpo = corte.length ? Math.min(...corte) : art.length;
  const cuerpo = art.slice(despuesMeta, finCuerpo);
  const partes = cuerpo.split(/(?=<h2>)/);
  const [primera, ...resto] = partes[0].startsWith('<h2>') ? partes : [partes[0] + (partes[1] || ''), ...partes.slice(2)];
  const plegadas = resto.map((sec) => {
    const m = sec.match(/^<h2>([\s\S]*?)<\/h2>([\s\S]*)$/);
    return m ? `<details class="guide-more"><summary><h2>${m[1]}</h2></summary><div class="guide-more-body">${m[2]}</div></details>` : sec;
  }).join('');
  art = art.slice(0, despuesMeta) + resumen + primera + plegadas + art.slice(finCuerpo);
  return html.slice(0, ini) + art + html.slice(fin);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let n = 0;
  for (const [slug, puntos] of Object.entries(guias)) {
    const archivo = resolve(RAIZ, 'dist', 'aprende', slug, 'index.html');
    if (!existsSync(archivo)) throw new Error(`falta la guía ${slug}`);
    writeFileSync(archivo, profundizarGuia(readFileSync(archivo, 'utf8'), puntos), 'utf8');
    n++;
  }
  console.log(`guías: ${n} con «En 30 segundos» y profundidad a demanda`);
}
