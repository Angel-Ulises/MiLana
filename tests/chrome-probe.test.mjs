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
  browserReady({}, '/chrome', { run, ci: false });
  browserReady({}, '/chrome', { run, ci: false });
  assert.notEqual(profiles[0], profiles[1]);
  for (const profile of profiles) assert.equal(existsSync(profile), false);
});

test('CI exige Chrome y ejecuta el test real sin sonda redundante ni skips', () => {
  assert.equal(browserReady({ skip: () => assert.fail('no debe omitir') }, '/chrome', {
    ci: true, run: () => assert.fail('el test real debe probar CDP'),
  }), true);
  assert.throws(() => browserReady({}, undefined, { ci: true }), /no instalado/);
});
