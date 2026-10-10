import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TEMAS_EXPLORADOR, esRutaInternaSegura, obtenerTemaExplorador, resolverDecision } from '../src/lib/decisionRoutes.js';

test('el explorador cubre decisiones concretas y no inventa un perfil', () => {
  assert.deepEqual(TEMAS_EXPLORADOR.map((t) => t.id), ['dinero', 'carrera', 'inversion', 'mudanza']);
  assert.equal(new Set(TEMAS_EXPLORADOR.map((t) => t.id)).size, TEMAS_EXPLORADOR.length);
  for (const tema of TEMAS_EXPLORADOR) {
    assert.equal(tema.opciones.length, 3);
    assert.equal(new Set(tema.opciones.map((o) => o.id)).size, tema.opciones.length);
    assert.ok(tema.titulo && tema.pregunta && tema.bajada);
    for (const opcion of tema.opciones) {
      assert.ok(opcion.titulo && opcion.explicacion && opcion.principal.detalle);
      assert.equal(opcion.relacionadas.length, 2);
      const links = [opcion.principal, ...opcion.relacionadas];
      assert.equal(new Set(links.map((r) => r.href)).size, links.length);
      for (const ruta of links) {
        assert.ok(ruta.titulo);
        assert.equal(esRutaInternaSegura(ruta.href), true, `Ruta insegura: ${ruta.href}`);
        assert.equal(ruta.href.includes('//'), false);
        assert.equal(ruta.href.includes('?'), false);
      }
      assert.equal(resolverDecision(tema.id, opcion.id)?.opcion.id, opcion.id);
    }
  }
});

test('una elección inexistente no recibe resultado ni recomendación por defecto', () => {
  assert.equal(obtenerTemaExplorador('desconocido'), null);
  assert.equal(resolverDecision('desconocido', 'flujo'), null);
  assert.equal(resolverDecision('dinero', 'no-existe'), null);
  assert.equal(esRutaInternaSegura('https://externo.mx'), false);
  assert.equal(esRutaInternaSegura('//externo.mx'), false);
  assert.equal(esRutaInternaSegura('/finanzas?tracking=1'), false);
});

test('usa exclusivamente destinos de secciones ya publicadas', () => {
  const destinos = new Set([
    '/finanzas/presupuesto', '/finanzas/mi-situacion', '/finanzas/ahorro',
    '/finanzas/fondo-emergencia', '/finanzas/deuda-y-credito',
    '/carreras/comparar', '/carreras/mejor-pagadas', '/carreras/ocupaciones',
    '/carreras/por-estado', '/carreras', '/calculadoras/bruto-a-neto',
    '/finanzas/inversion', '/finanzas/inversion/comparar', '/finanzas/inversion/cetes',
    '/estados/comparar', '/finanzas/vivienda',
  ]);
  for (const tema of TEMAS_EXPLORADOR) {
    for (const opcion of tema.opciones) {
      for (const link of [opcion.principal, ...opcion.relacionadas]) {
        assert.ok(destinos.has(link.href), `Destino no reconocido: ${link.href}`);
      }
    }
  }
});

test('el explorador se integra solo en hubs y usa controles accesibles', () => {
  const finances = readFileSync(new URL('../src/financePages.jsx', import.meta.url), 'utf8');
  const careers = readFileSync(new URL('../src/careerPages.jsx', import.meta.url), 'utf8');
  const explorer = readFileSync(new URL('../src/decisionExplorer.jsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../src/decision-explorer.css', import.meta.url), 'utf8');
  assert.match(finances, /<DecisionExplorer initialTopic="dinero" \/>/);
  assert.match(careers, /<DecisionExplorer initialTopic="carrera" \/>/);
  assert.match(explorer, /role="group"/);
  assert.match(explorer, /tabIndex=\{-1\}/);
  assert.match(explorer, /titulo.current\?\.focus/);
  assert.match(explorer, /type="button"/);
  assert.match(explorer, /onClick=\{\(\) => cambiarTema\(item.id\)\}/);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /max-width:410px/);
  assert.doesNotMatch(explorer, /fetch\(|localStorage|sessionStorage|tracking|analytics|navigator\.sendBeacon/);
});
