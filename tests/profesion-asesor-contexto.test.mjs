import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const context=fs.readFileSync(new URL('../src/advisorProfessionContext.jsx',import.meta.url),'utf8');
const advisor=fs.readFileSync(new URL('../src/advisorPage.jsx',import.meta.url),'utf8');
const entry=fs.readFileSync(new URL('../src/advisorEntry.jsx',import.meta.url),'utf8');
const linker=fs.readFileSync(new URL('../scripts/enlazar-profesiones-asesor.mjs',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));

test('contexto de profesión usa solo un slug público de allowlist',()=>{
  assert.match(context,/URLSearchParams\(window\.location\.search\)\.get\('contexto'\)/);
  assert.match(context,/datos\.profesiones\.find/);
  assert.doesNotMatch(context,/ingresoNeto|gastosEsenciales|pagosDeuda|fondoActual/);
});

test('contexto profesional no prellena el formulario del asesor',()=>{
  assert.match(advisor,/ingresoNeto:''/);
  assert.match(advisor,/gastosEsenciales:''/);
  assert.match(advisor,/fondoActual:''/);
  assert.match(context,/No se cargó como tu ingreso neto/i);
  assert.doesNotMatch(advisor,/setForm\([^)]*contexto|set\('ingresoNeto'\).*contexto/);
});

test('perfil profesional enlaza al asesor solo con contexto público',()=>{
  assert.match(entry,/mi-situacion\?contexto=/);
  assert.doesNotMatch(entry,/ingresoNeto=|gastos=|deuda=|fondo=/);
  assert.match(linker,/mi-situacion\?contexto=/);
});

test('build enlaza HTML estático antes de inyecciones finales',()=>{
  assert.match(pkg.scripts.build,/node scripts\/enlazar-profesiones-asesor\.mjs/);
  assert.ok(pkg.scripts.build.indexOf('generar-carreras.mjs') < pkg.scripts.build.indexOf('enlazar-profesiones-asesor.mjs'));
  assert.ok(pkg.scripts.build.indexOf('enlazar-profesiones-asesor.mjs') < pkg.scripts.build.indexOf('inyectar-social-preview.mjs'));
});
