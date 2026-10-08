import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NAVEGACION_MILANA, seccionNavegacion } from '../src/lib/siteNavigation.js';

const pages=['src/App.jsx','src/financePages.jsx','src/advisorPage.jsx','src/careerPages.jsx','src/statePages.jsx','src/stateComparePage.jsx','src/careerComparePage.jsx'];

test('Órbita y React comparten las mismas siete secciones en idéntico orden',()=>{
  const expected=[
    ['calculadoras','/#calculadoras','Calculadoras'],['carreras','/carreras','Carreras'],
    ['estados','/estados','Estados'],['finanzas','/finanzas','Finanzas'],
    ['invertir','/invertir','Invertir'],['economia','/economia','Economía'],['aprende','/aprende','Aprende']
  ];
  assert.deepEqual(NAVEGACION_MILANA,expected);
  const generator=readFileSync('scripts/aplicar-orbita-base.mjs','utf8');
  const shared=readFileSync('src/siteHeader.jsx','utf8');
  assert.match(generator,/import \{ NAVEGACION_MILANA \} from '\.\.\/src\/lib\/siteNavigation\.js'/);
  assert.match(generator,/const nav = NAVEGACION_MILANA/);
  assert.match(generator,/const headerNav = nav\.map/);
  assert.match(generator,/const drawerNav =/);
  assert.match(shared,/NAVEGACION_MILANA\.map/);
  assert.match(shared,/aria-current=\{actual === id \? 'page' : undefined\}/);
});

test('React ya no contiene siete copias del menú ni cambios de enlaces después de pintar',()=>{
  const header=readFileSync('src/siteHeader.jsx','utf8');
  assert.match(header,/<nav className="desktop-nav" aria-label="Principal">/);
  for(const file of pages){
    const code=readFileSync(file,'utf8');
    assert.match(code,/SiteHeader/,`Header compartido en ${file}`);
    assert.doesNotMatch(code,/<nav className="desktop-nav"/,`No debe copiar menú en ${file}`);
  }
  const economic=readFileSync('src/economyNavigation.jsx','utf8');
  const expansion=readFileSync('src/financeExpansion.jsx','utf8');
  assert.doesNotMatch(economic,/querySelector\('\.desktop-nav'\)|data-ml-economy-nav/);
  assert.doesNotMatch(expansion,/asegurarNavegacion|data-ml-finance-nav/);
});

test('sección actual se selecciona por prefijo completo, sin interferir con rutas distintas',()=>{
  for(const [url,expected] of [
    ['/calculadoras/isr','calculadoras'],['/calculadoras/bruto-a-neto','calculadoras'],
    ['/carreras','carreras'],['/carreras/comparar','carreras'],
    ['/estados/nuevo-leon','estados'],['/estados/comparar','estados'],
    ['/finanzas/presupuesto','finanzas'],['/finanzas/inversion','invertir'],['/invertir','invertir'],['/economia','economia'],
    ['/aprende/finiquito-vs-liquidacion','aprende'],['/','null'],['/finanzasx','null']
  ]) assert.equal(seccionNavegacion(url),expected==='null'?null:expected,url);
});