import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(RAIZ, 'dist');
const vivienda = JSON.parse(readFileSync(resolve(RAIZ, 'src/data/viviendaEstados.json'), 'utf8'));
const dinero = (n) => new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN', maximumFractionDigits:0 }).format(Number(n) || 0);
const esc = (v) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const pp = (valor, nacional) => `${valor - nacional >= 0 ? '+' : ''}${(valor - nacional).toFixed(1)} pp vs. México`;
const pct = (valor, nacional) => `${valor - nacional >= 0 ? '+' : ''}${(((valor - nacional) / nacional) * 100).toFixed(1)}% vs. México`;

function escribir(ruta, transformar) {
  const archivo = resolve(DIST, ruta, 'index.html');
  const original = readFileSync(archivo, 'utf8');
  if (original.includes('data-static-vivienda="shf-2026-t2"')) return;
  const siguiente = transformar(original);
  if (siguiente === original) throw new Error(`No se encontró punto de inserción de vivienda en ${ruta}`);
  writeFileSync(archivo, siguiente, 'utf8');
}

const n = vivienda.nacional;
escribir('estados', (html) => {
  const bloque = `<section data-static-vivienda="shf-2026-t2"><h2>Vivienda hipotecaria por estado</h2><p>SHF reporta para ${esc(vivienda.periodoValores)} una mediana nacional de avalúo de <strong>${dinero(n.mediana)}</strong>. La apreciación interanual del segundo trimestre de 2026 fue de <strong>${n.apreciacion.toFixed(1)}%</strong>.</p><p>Estos datos corresponden a viviendas adquiridas mediante crédito hipotecario. No equivalen a renta, costo de vida, toda la oferta de vivienda ni capacidad de compra de una persona.</p><p><strong>Fuente:</strong> ${esc(vivienda.fuente)}. Publicado el 10 de agosto de 2026.</p></section>`;
  return html.replace('<h2>Elige tu estado</h2>', `${bloque}<h2>Elige tu estado</h2>`);
});

for (const e of vivienda.estados) {
  const bloque = `<section data-static-vivienda="shf-2026-t2"><h2>Vivienda en ${esc(e.estado)}</h2><p>En ${esc(vivienda.periodoValores)}, la mediana de avalúo de las viviendas adquiridas con crédito hipotecario en ${esc(e.estado)} fue de <strong>${dinero(e.mediana)}</strong> (${pct(e.mediana, n.mediana)}). El promedio de avalúo fue de ${dinero(e.promedio)}.</p><p>El Índice SHF registró una apreciación interanual de <strong>${e.apreciacion.toFixed(1)}%</strong> en el segundo trimestre de 2026 (${pp(e.apreciacion, n.apreciacion)}).</p><h3>Distribución de avalúos observados</h3><ul><li><strong>25% de las operaciones:</strong> por debajo de ${dinero(e.p25)}</li><li><strong>Mediana:</strong> ${dinero(e.mediana)}</li><li><strong>75% de las operaciones:</strong> por debajo de ${dinero(e.p75)}</li></ul><p>${esc(vivienda.nota)}</p><p><a href="/finanzas/vivienda">Entender mi decisión de vivienda</a> · <a href="/finanzas/ahorro">Planear ahorro</a> · <a href="/calculadoras/infonavit">Revisar Infonavit</a> · <a href="/finanzas/mi-situacion">Analizar mi situación</a></p><p><strong>Fuente:</strong> ${esc(vivienda.fuente)}. ${esc(vivienda.actualizado)}.</p></section>`;
  escribir(`estados/${e.slug}`, (html) => html.replace('<h2>Qué no significa esta información</h2>', `${bloque}<h2>Qué no significa esta información</h2>`));
}

console.log(`vivienda estatal: SHF ${vivienda.actualizado} enlazada en hub + ${vivienda.estados.length} estados`);
