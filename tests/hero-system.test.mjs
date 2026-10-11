import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('public/orbita-v3-audit.css', 'utf8');

test('todas las secciones comparten tipografía, peso y color de título', () => {
  for (const hero of ['.ml-hub-hero', '.finance-page-hero', '.ml-inv-hero', '.career-hero', '.state-hero', '.economy-hero', '.hubhead', '.profession-hero', '.advisor-hero']) assert.ok(css.includes(hero), hero);
  assert.match(css, /h1\{font-family:"Newsreader",Georgia,serif!important;font-weight:600!important;color:#13263B!important/);
  assert.match(css, /h1\{font-size:36px!important\}/);
  assert.match(css, /h1\{font-size:31px!important\}/);
  assert.match(css, /clamp\(40px,4\.2vw,56px\)/);
});

test('Economía muestra la ruta como el resto de secciones', () => {
  assert.match(readFileSync('src/economyPages.jsx', 'utf8'), /className="economy-breadcrumb" aria-label="Ruta"><a href="\/">Inicio<\/a>/);
});

test('los saltos dentro de la página aterrizan justo bajo la barra (66px), sin asomar la sección anterior', () => {
  assert.match(css, /html\.ml-orbita-enabled main :is\(\[id\],section,form,h2,h3,\[tabindex="-1"\]\)\{scroll-margin-top:66px\}/);
  for (const id of ['situaciones', 'datos-carreras', 'datos-profesion', 'comparar-trabajos', 'comparar', 'mis-numeros', 'mi-situacion-datos', 'costos', 'entender', 'simular', 'explorar', 'senales', 'encontrar', 'ml-calc-interpretation']) {
    assert.ok(css.includes(`#${id}`), id);
  }
  assert.match(css, /#aprende,#fuentes,#panorama-estado,\.ml-decision,#ml-calc-interpretation,#ml-main,#root\)\{scroll-margin-top:66px!important\}/);
  const js = readFileSync('public/orbita-v3-internal.js', 'utf8');
  assert.match(js, /const visible = caja\.top >= HEADER_OFFSET && fondo <= window\.innerHeight - 24;/);
  assert.match(js, /const marco = assistant\?\.isConnected \? assistant : target;/);
  assert.doesNotMatch(css, /scroll-margin-top:90px/);
});
