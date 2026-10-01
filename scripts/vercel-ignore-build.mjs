import { execFileSync } from 'node:child_process';
import { shouldSkipVercelBuild } from './vercel-build-policy.mjs';

function changedFiles() {
  const output = execFileSync('git', ['diff', '--name-only', 'HEAD^', 'HEAD'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

try {
  const files = changedFiles();
  if (shouldSkipVercelBuild(files)) {
    console.log(`Vercel: omitir build; ${files.length} cambio(s) solo operativos.`);
    for (const file of files) console.log(`- ${file}`);
    process.exit(0);
  }

  console.log('Vercel: ejecutar build; hay cambios que pueden afectar el sitio.');
  for (const file of files) console.log(`- ${file}`);
  process.exit(1);
} catch (error) {
  console.error(`Vercel: no pude clasificar el diff; ejecutar build por seguridad. ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
