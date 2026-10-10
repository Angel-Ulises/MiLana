import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { preparePages } from './cloudflare-pages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
if (args.some(arg => !['--preview', '--production'].includes(arg)) || args.length > 1) {
  throw new Error('Uso: node scripts/preparar-cloudflare.mjs [--preview|--production]');
}
const mode = args[0] === '--production' ? 'production' : 'preview';
const report = preparePages({ root, mode });
report.commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
report.node = process.version;
mkdirSync(join(root, '.qa/cloudflare'), { recursive: true });
writeFileSync(join(root, '.qa/cloudflare', `manifest-${mode}.json`), JSON.stringify(report, null, 2) + '\n');
console.log(`Pages ${mode}: ${report.fileCount} archivos, ${report.totalBytes} bytes, ${report.routes.length} rutas, ${report.redirects} redirects.`);
console.log(`Mayor: ${report.largestFile.path} (${report.largestFile.bytes} bytes). Direct Upload dashboard: ${report.dashboardUploadFits ? 'dentro del límite' : 'usar Wrangler'}.`);
console.log('Sólo preparación local. No se ha publicado ni cambiado dominio, DNS o Vercel.');
