import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const global = (vercel.headers ?? []).find((rule) => rule.source === '/(.*)');
const headers = new Map((global?.headers ?? []).map((header) => [header.key.toLowerCase(), header.value]));

test('Vercel aplica headers defensivos compatibles con el sitio estático', () => {
  assert.equal(headers.get('x-content-type-options'), 'nosniff');
  assert.equal(headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
});

test('la política global no bloquea el uso legítimo de /widgets en iframes', () => {
  assert.equal(headers.has('x-frame-options'), false);
});
