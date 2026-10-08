import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Presupuesto de bytes de la entrada común, sin incluir módulos de páginas bajo demanda.
// Evita volver a cargar todas las calculadoras, estados y finanzas en una sola descarga.
const html = readFileSync('dist/index.html', 'utf8');
const match = html.match(/(?:src|href)="\/?(assets\/index-[^"\/]+\.js)"/);
if (!match) throw new Error('No se encontró la entrada JavaScript generada por Vite');
const bytes = statSync(join('dist', match[1])).size;
const maximum = 220_000;
if (bytes > maximum) throw new Error(`Entrada común demasiado grande: ${bytes} B > ${maximum} B; revisar imports estáticos en src/main.jsx`);
console.log(`presupuesto JS inicial: ${bytes} B de ${maximum} B (módulos por ruta separados)`);