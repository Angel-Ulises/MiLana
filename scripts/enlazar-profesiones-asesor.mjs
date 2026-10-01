import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const datos = JSON.parse(readFileSync('src/data/profesiones.json','utf8'));
let actualizados = 0;

for (const profesion of datos.profesiones) {
  const archivo = `dist/carreras/profesion/${profesion.slug}/index.html`;
  if (!existsSync(archivo)) continue;
  let html = readFileSync(archivo,'utf8');
  const href = `/finanzas/mi-situacion?contexto=${encodeURIComponent(profesion.slug)}`;
  if (html.includes(`href="${href}"`)) continue;
  const enlace = `<a href="${href}">Analizar este contexto en Mi situación</a>`;
  if (html.includes('</main>')) {
    html = html.replace('</main>', `<p>${enlace}</p></main>`);
    writeFileSync(archivo,html,'utf8');
    actualizados += 1;
  }
}

console.log(`profesiones→asesor: ${actualizados} perfiles enlazados`);
