import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
const read = p => readFileSync(p, 'utf8');

test('approved identity uses self-contained paths and the fixed brand palette', () => {
  for (const file of ['milana-horizontal.svg', 'milana-symbol.svg', 'logo-milana.svg', 'favicon.svg']) {
    const svg = read(`public/${file}`);
    assert.match(svg, /<path\b/);
    assert.doesNotMatch(svg, /<(?:text|image|script|foreignObject)\b|href=|font-family/i);
    assert.match(svg, /#2D6CAA/);
    assert.match(svg, /aria-label="[^"]*MiLana"/);
  }
  assert.match(read('public/milana-horizontal.svg'), /#13263B/);
  assert.match(read('public/favicon.svg'), /#FBF8F2/);
  assert.match(read('public/logo-milana.svg'), /width="512" height="512"/);
});

test('React brand links retain accessible names and reserve logo dimensions', () => {
  let count = 0;
  let sharedUsages = 0;
  for (const name of readdirSync('src').filter(name => name.endsWith('.jsx'))) {
    const src = read(`src/${name}`);
    if (src.includes('<SiteHeader')) sharedUsages++;
    if (!src.includes('className="brand"')) continue;
    count++;
    assert.match(src, /className="brand" href="\/" aria-label="MiLana, inicio"/);
    assert.match(src, /className="brand-logo" src="\/milana-horizontal.svg" width="144" height="27" alt="" aria-hidden="true"/);
    assert.doesNotMatch(src, /className="brand-mark"/);
  }
  assert.ok(count + sharedUsages >= 14, 'Los headers compartidos siguen incluyendo un enlace de marca accesible');
  assert.ok(sharedUsages >= 7, 'La navegación centralizada debe reemplazar siete copias');
});

test('generated shell uses the same lockup with a 48px accessible link target', () => {
  const shell = read('scripts/aplicar-orbita-base.mjs');
  assert.match(shell, /class="ml-orbita-logo" href="\/" aria-label="MiLana, inicio"><img class="ml-orbita-brand-image" src="\/milana-horizontal.svg" width="144" height="27" alt="" aria-hidden="true">/);
  assert.match(read('public/orbita-v3-base.css'), /\.ml-orbita-logo\{min-height:48px/);
  assert.match(read('public/orbita-v3-base.css'), /\.ml-orbita-brand-image\{display:block;width:144px;height:27px;flex:none;object-fit:contain/);
});

test('compact brand leaves room for all three 48px mobile controls at 320px', () => {
  assert.match(read('public/orbita-v3-base.css'), /@media\(max-width:359px\)\{\.ml-orbita-brand-image\{width:112px;height:21px/);
  assert.ok(112 + 10 + 3 * 48 + 2 * 8 <= 320 - 32);
});
