import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('el Radar instala dependencias antes de probar y recolectar fuentes', () => {
  const workflow = readFileSync(new URL('../.github/workflows/radar-collector.yml', import.meta.url), 'utf8');
  const steps = workflow.split(/^      - /m).slice(1);
  const node = steps.findIndex((step) => /uses: actions\/setup-node@/.test(step));
  const install = steps.findIndex((step) => /^        run: npm ci --ignore-scripts --no-audit --no-fund\s*$/m.test(step));
  const tests = steps.findIndex((step) => /^        run: npm test\s*$/m.test(step));
  const collect = steps.findIndex((step) => /^        run: node scripts\/radar\/collect\.mjs /m.test(step));

  assert.ok(node >= 0, 'debe configurar Node');
  assert.ok(install > node, 'debe instalar dependencias (npm ci, con package-lock.json) después de configurar Node');
  assert.ok(tests > install, 'debe instalar dependencias antes de ejecutar las pruebas');
  assert.ok(collect > tests, 'debe aprobar las pruebas antes de recolectar fuentes');
  assert.doesNotMatch(steps[install], /^        (?:if|continue-on-error):/m, 'la instalación debe ser obligatoria');
});

test('las instalaciones de los flujos usan npm ci y el lockfile está versionado', () => {
  for (const archivo of ['ci.yml', 'radar-collector.yml']) {
    const texto = readFileSync(new URL(`../.github/workflows/${archivo}`, import.meta.url), 'utf8');
    assert.match(texto, /run: npm ci --ignore-scripts/, `${archivo} debe usar npm ci`);
    assert.doesNotMatch(texto, /run: npm install/, `${archivo} no debe usar npm install`);
  }
  assert.ok(existsSync(new URL('../package-lock.json', import.meta.url)), 'package-lock.json debe estar en el repositorio');
  assert.doesNotMatch(readFileSync(new URL('../.gitignore', import.meta.url), 'utf8'), /^package-lock\.json\s*$/m, 'el lockfile no debe estar ignorado');
});
