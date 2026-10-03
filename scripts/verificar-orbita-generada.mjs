import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIST = resolve('dist');
const calcDir = join(DIST, 'calculadoras');
const errors = [];
const slugs = readdirSync(calcDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(calcDir, entry.name, 'index.html')))
  .map((entry) => entry.name)
  .sort();

for (const slug of slugs) {
  const fullPath = join(calcDir, slug, 'index.html');
  const full = readFileSync(fullPath, 'utf8');
  if (!full.includes('data-orbita-shell')) errors.push(`${slug}: la calculadora completa perdió el shell Órbita`);
  if (!full.includes("q.get('embed')==='1'")) errors.push(`${slug}: falta protección de ?embed=1 en el boot generado`);
  if (!full.includes('data-orbita-embed-guard')) errors.push(`${slug}: falta guard visual pre-paint de embed`);
}

const home = readFileSync(join(DIST, 'index.html'), 'utf8');
for (const id of ['calculadoras', 'situaciones', 'aprende', 'fuentes']) {
  if (!new RegExp(`id=["']${id}["']`).test(home)) errors.push(`inicio: falta id=${id} en HTML generado`);
}
if (!home.includes('/carreras/profesion/medicina')) errors.push('inicio/search shell: falta profesión Medicina en HTML generado');

if (existsSync(join(DIST, 'widgets', 'calculadoras'))) errors.push('no deben generarse rutas físicas /widgets/calculadoras/*');

if (errors.length) {
  console.error(`Órbita generada: ${errors.length} error(es)`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}
console.log(`Órbita generada: ${slugs.length} calculadoras completas; embed limpio por ?embed=1; anclas estáticas verificadas`);
