import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('las pruebas no arrancan archivos de navegador en paralelo', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(pkg.scripts.test, /--test-concurrency=1\b/);
  assert.match(pkg.scripts.test, /tests\/\*\.test\.mjs/);
});

test('CI y Radar preparan caché de fuentes propia del runner', () => {
  for (const name of ['ci.yml', 'radar-collector.yml']) {
    const workflow = readFileSync(new URL(`../.github/workflows/${name}`, import.meta.url), 'utf8');
    assert.match(workflow, /XDG_CACHE_HOME: \$\{\{ runner\.temp \}\}\/milana-cache/);
    assert.match(workflow, /run: mkdir -p "\$XDG_CACHE_HOME\/fontconfig"/);
    assert.ok(workflow.indexOf('Preparar caché de fuentes') < workflow.indexOf('Instalar dependencias'));
  }
});
