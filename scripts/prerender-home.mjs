import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Usar la portada real como única fuente del hero, sin duplicar textos, rutas o
// fotos. Sólo se ejecuta al compilar; no aumenta el JavaScript del visitante.
export async function prerenderHomeHero() {
  const vite = await createServer({ server: { middlewareMode: true }, logLevel: 'error' });
  try {
    const { default: App } = await vite.ssrLoadModule('/src/App.jsx');
    const html = renderToStaticMarkup(React.createElement(App));
    const start = html.indexOf('<section class="hero">');
    if (start < 0) throw new Error('No se encontró el hero de Inicio para prerenderizar');
    let depth = 0;
    for (const tag of html.slice(start).matchAll(/<\/?section\b[^>]*>/g)) {
      depth += tag[0].startsWith('</') ? -1 : 1;
      if (depth === 0) {
        const hero = html.slice(start, start + tag.index + tag[0].length);
        // Antes de JavaScript, este control también tiene un destino útil.
        return hero.replace(/<button([^>]*class="orb-home-search"[^>]*)>([\s\S]*?)<\/button>/,
          '<a$1 href="/calculadoras">$2</a>');
      }
    }
    throw new Error('El hero de Inicio quedó incompleto');
  } finally { await vite.close(); }
}

// El preload scanner descubre App en el HTML, sin esperar a descargar/ejecutar
// primero el paquete común. Sólo Inicio lo precarga: las otras áreas no pagan App.
export function preloadHomeModule(dist) {
  const manifest = JSON.parse(readFileSync(join(dist, '.vite/manifest.json'), 'utf8'));
  const page = manifest['src/App.jsx'];
  if (!page?.file || !/^assets\/[^"<>]+\.js$/.test(page.file)) throw new Error('Falta App en el manifest de Vite');
  const file = join(dist, 'index.html');
  const html = readFileSync(file, 'utf8');
  writeFileSync(file, html.replace('</head>', `<link rel="modulepreload" href="/${page.file}" data-home-preload></head>`));
}
