import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('el Radar instala dependencias antes de probar y recolectar fuentes', () => {
  const workflow = readFileSync(new URL('../.github/workflows/radar-collector.yml', import.meta.url), 'utf8');
  const steps = workflow.split(/^      - /m).slice(1);
  const node = steps.findIndex((step) => /uses: actions\/setup-node@/.test(step));
  const install = steps.findIndex((step) => /^        run: npm install --ignore-scripts --no-audit --no-fund\s*$/m.test(step));
  const tests = steps.findIndex((step) => /^        run: npm test\s*$/m.test(step));
  const collect = steps.findIndex((step) => /^        run: node scripts\/radar\/collect\.mjs /m.test(step));

  assert.ok(node >= 0, 'debe configurar Node');
  assert.ok(install > node, 'debe instalar dependencias después de configurar Node');
  assert.ok(tests > install, 'debe instalar dependencias antes de ejecutar las pruebas');
  assert.ok(collect > tests, 'debe aprobar las pruebas antes de recolectar fuentes');
  assert.doesNotMatch(steps[install], /^        (?:if|continue-on-error):/m, 'la instalación debe ser obligatoria');
});
