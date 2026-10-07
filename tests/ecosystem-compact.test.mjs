import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const finanzas = readFileSync(new URL('../src/financePages.jsx', import.meta.url), 'utf8');
const carreras = readFileSync(new URL('../src/careerPages.jsx', import.meta.url), 'utf8');
const explorador = readFileSync(new URL('../src/decisionExplorer.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/ecosystem-compact.css', import.meta.url), 'utf8');
const entrada = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');

test('Finanzas contiene un hub guiado con herramientas y asesor sin bloques repetidos', () => {
  const hub = finanzas.split('function Hub() {')[1]?.split('function Presupuesto() {')[0] || '';
  assert.match(hub, /<DecisionExplorer initialTopic="dinero" \/>/);
  assert.match(hub, /className="finance-hub ecosystem-hub"/);
  assert.match(hub, /href="\/finanzas\/mi-situacion"/);
  assert.doesNotMatch(hub, /className="finance-advisor-preview"/);
  assert.doesNotMatch(hub, /className="finance-route-list"/);
  const herramientas = [
    '/finanzas/presupuesto','/finanzas/fondo-emergencia','/finanzas/deuda-y-credito',
    '/finanzas/ahorro','/finanzas/vivienda','/calculadoras/pension-imss',
  ];
  for (const destino of herramientas) assert.ok(hub.includes(destino), `Falta acceso a ${destino}`);
  assert.match(finanzas, /className="ecosystem-hero-link" href="#explorar"/);
});

test('Carreras conserva los datos y preguntas sin repetir dos secciones de navegación', () => {
  const hub = carreras.split('function Hub() {')[1]?.split('function MejorPagadas() {')[0] || '';
  assert.match(hub, /<DecisionExplorer initialTopic="carrera" \/>/);
  assert.match(hub, /className="career-hub-section ecosystem-hub"/);
  assert.match(hub, /className="ecosystem-more-questions"/);
  assert.match(hub, /Explora como buscarías en Google/);
  assert.match(hub, /Preguntas que abren otras preguntas/);
  assert.doesNotMatch(hub, /<section className="career-question-section"/);
  assert.doesNotMatch(hub, /<section className="career-money-bridge"/);
  assert.match(hub, /className="career-money-inline"/);
  assert.match(hub, /perfiles\.slice\(0, 2\)/);
  assert.match(hub, /perfiles\.slice\(2\)/);
  assert.match(hub, /profesiones\.profesiones\.slice\(8\)/);
  for (const destino of ['/carreras/mejor-pagadas','/carreras/mas-demandadas','/carreras/por-estado','/carreras/peor-pagadas','/calculadoras/bruto-a-neto']) {
    assert.ok(hub.includes(destino), destino);
  }
  assert.match(carreras, /compact && <a className="ecosystem-hero-link"/);
});

test('el explorador no ocupa espacio con resultados ficticios', () => {
  assert.match(explorador, /\{decision && \(/);
  assert.doesNotMatch(explorador, /className="ml-decision-empty"/);
  assert.match(explorador, /aria-live="polite"/);
  assert.match(explorador, /aria-pressed=/);
  assert.doesNotMatch(explorador, /localStorage|sessionStorage|fetch\(/);
});

test('el diseño compacto respeta móvil, accesibilidad y el resto del sitio', () => {
  assert.match(entrada, /import '\.\/ecosystem-compact\.css'/);
  assert.match(css, /\.ecosystem-hub/);
  assert.match(css, /\.finance-hub-page/);
  assert.match(css, /\.career-hero-compact/);
  assert.match(css, /@media\(max-width:760px\)/);
  assert.match(css, /@media\(max-width:440px\)/);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(carreras, /<details className="ecosystem-more-questions">/);
});
