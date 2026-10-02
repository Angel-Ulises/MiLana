import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  isInternalOnlyPath,
  shouldSkipVercelBuild,
} from '../scripts/vercel-build-policy.mjs';

test('clasifica como internos workflows, pruebas, Radar y README', () => {
  assert.equal(isInternalOnlyPath('.github/workflows/radar-review.yml'), true);
  assert.equal(isInternalOnlyPath('tests/radar-review.test.mjs'), true);
  assert.equal(isInternalOnlyPath('scripts/radar/collect.mjs'), true);
  assert.equal(isInternalOnlyPath('README.md'), true);
});

test('no ignora archivos que pueden afectar el sitio o su build', () => {
  for (const path of [
    'src/App.jsx',
    'src/data/economia.json',
    'public/sitemap.xml',
    'scripts/generar-economia.mjs',
    'package.json',
    'vercel.json',
    'vite.config.js',
  ]) {
    assert.equal(isInternalOnlyPath(path), false, `${path} debe forzar build`);
  }
});

test('solo omite Vercel cuando TODOS los cambios son internos', () => {
  assert.equal(shouldSkipVercelBuild([
    '.github/workflows/radar-promote.yml',
    'tests/radar-promotion.test.mjs',
    'scripts/radar/promotion-lib.mjs',
  ]), true);
  assert.equal(shouldSkipVercelBuild([
    '.github/workflows/radar-promote.yml',
    'src/data/economia.json',
  ]), false);
  assert.equal(shouldSkipVercelBuild([]), false);
});

test('vercel.json conserva el detector y reduce previews de ramas de trabajo', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.equal(config.ignoreCommand, 'node scripts/vercel-ignore-build.mjs');
  assert.equal(config.git.deploymentEnabled.main, true);
  assert.equal(config.git.deploymentEnabled['chatgpt/*'], false);
  assert.equal(config.git.deploymentEnabled['claude/*'], false);
  assert.equal(config.git.deploymentEnabled['main'], true);
});
