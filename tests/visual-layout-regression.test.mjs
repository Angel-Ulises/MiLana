import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const internal=readFileSync('public/orbita-v3-internal.js','utf8');
const active=['finiquito','liquidacion','aguinaldo','vacaciones','isr','resico','ptu','bruto-a-neto','infonavit'];

test('calculadoras activas tienen propósito móvil completo y sin elipsis',()=>{
  for(const id of active) assert.match(internal,new RegExp(`['\"]?${id.replaceAll('-', '\\-')}['\"]?\\s*:`),`${id}: falta propósito móvil`);
  const block=internal.match(/const COMPACT_PURPOSES = \{([\s\S]*?)\n  \};/)?.[1] || '';
  assert.ok(block);
  for(const value of [...block.matchAll(/:\s*'([^']+)'/g)].map((m)=>m[1])){
    assert.ok(value.length <= 118, `propósito móvil demasiado largo (${value.length})`);
    assert.match(value,/[.!?]$/);
    assert.doesNotMatch(value,/…|\.\.\.$/);
  }
  assert.match(internal,/PURPOSE_MEDIA\.matches && compact/);
  assert.match(internal,/orb-purpose-ready/);
});

test('el componente de reserva publicitaria no ocupa espacio ficticio',()=>{
  const component=readFileSync('src/AdReserve.jsx','utf8');
  assert.match(component,/return null/);
  assert.doesNotMatch(component,/data-orbita-ad-reserve|orb-ad-leaderboard/);
});

test('la tarjeta final de glosario no hereda la altura del placeholder',()=>{
  const css=readFileSync('public/orbita-v3-prepaint.css','utf8');
  assert.match(css,/\.orb-glossary-reserve\{min-height:/);
  assert.doesNotMatch(css,/\.orb-glossary-reserve,\s*\.orb-glossary\{min-height/);
});
