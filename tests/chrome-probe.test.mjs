import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { browserReady } from './helpers/chrome-probe.mjs';

test('las sondas Chrome usan perfiles únicos y los limpian', () => {
  const profiles = [];
  const run = (_, args) => {
    const profile = args.find((arg) => arg.startsWith('--user-data-dir=')).split('=')[1];
    assert.ok(existsSync(profile));
    profiles.push(profile);
    return { status: 0 };
  };
  browserReady({}, '/chrome', { run, ci: true });
  browserReady({}, '/chrome', { run, ci: true });
  assert.notEqual(profiles[0], profiles[1]);
  for (const profile of profiles) assert.equal(existsSync(profile), false);
});

test('CI falla con stderr si Chrome no arranca, sin omitir pruebas', () => {
  assert.throws(() => browserReady({ skip: () => assert.fail('no debe omitir') }, '/chrome', {
    ci: true, run: () => ({ status: 1, stderr: 'launcher failure' }),
  }), /launcher failure/);
  assert.throws(() => browserReady({}, undefined, { ci: true }), /no instalado/);
});
