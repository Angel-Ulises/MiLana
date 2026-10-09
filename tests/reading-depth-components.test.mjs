import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { buildSync } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Bundle JSX only for this Node check. Browser behavior is covered separately.
test('Las explicaciones de resultados heredan la profundidad, sin ocultar su contenido', async () => {
  const dir = mkdtempSync('tests/.reading-depth-');
  const previous = globalThis.sessionStorage;
  try {
    const build = buildSync({ entryPoints: ['src/MeaningOnDemand.jsx'], bundle: true, write: false,
      platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic' });
    const file = `${dir}/component.mjs`;
    writeFileSync(file, build.outputFiles[0].text);
    const { default: Meaning } = await import(pathToFileURL(process.cwd() + '/' + file));
    for (const level of ['inicio', 'medio', 'experto']) {
      globalThis.sessionStorage = { getItem: () => level };
      const html = renderToStaticMarkup(React.createElement(Meaning, { detalle: 'Contexto disponible.' }));
      assert.equal(/<details[^>]* open(?:="")?[ >]/.test(html), level === 'experto', level + ' debe definir la apertura inicial');
      assert.match(html, /<summary>/);
      assert.match(html, /Contexto disponible\./);
    }
    globalThis.sessionStorage = { getItem: () => 'experto' };
    const controlled = renderToStaticMarkup(React.createElement(Meaning, {
      detalle: 'Resultado restaurado.', manualOpen: false, onManualChange() {},
    }));
    assert.doesNotMatch(controlled, /<details[^>]* open(?:="")?[ >]/, 'Un bloque restaurado conserva el cierre de su propietario');
  } finally {
    if (previous === undefined) delete globalThis.sessionStorage;
    else globalThis.sessionStorage = previous;
    rmSync(dir, { recursive: true, force: true });
  }
});
