import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Mejora 2026-11 (fase 3): la calculadora real (encabezado, formulario y explicación) va en el HTML inicial.
// Se renderiza la misma App de React al compilar; en el navegador, src/main.jsx conserva lo que la persona
// haya escrito y monta React encima (startCalcWhenReady). No añade JavaScript al visitante.
export async function prerenderCalculadoras(slugs) {
  const vite = await createServer({ server: { middlewareMode: true }, logLevel: 'error' });
  try {
    const { default: App } = await vite.ssrLoadModule('/src/App.jsx');
    const salida = {};
    for (const slug of slugs) {
      const html = renderToStaticMarkup(React.createElement(App, { rutaSSR: slug }));
      const estilo = html.match(/^<style>[\s\S]*?<\/style>/)?.[0] || '';
      const inicio = html.indexOf('<div class="ml-panel">');
      if (inicio < 0) throw new Error(`No se encontró el panel de la calculadora ${slug}`);
      let profundidad = 0;
      let fin = -1;
      for (const tag of html.slice(inicio).matchAll(/<\/?div\b[^>]*>/g)) {
        profundidad += tag[0].startsWith('</') ? -1 : 1;
        if (profundidad === 0) { fin = inicio + tag.index + tag[0].length; break; }
      }
      if (fin < 0) throw new Error(`Panel incompleto en ${slug}`);
      const panel = html.slice(inicio, fin);
      if ((panel.match(/<h1\b/g) || []).length !== 1) throw new Error(`${slug}: el panel debe tener un H1`);
      if (!panel.includes('data-calc-directo')) throw new Error(`${slug}: falta el formulario directo`);
      salida[slug] = estilo + panel;
    }
    return salida;
  } finally { await vite.close(); }
}
