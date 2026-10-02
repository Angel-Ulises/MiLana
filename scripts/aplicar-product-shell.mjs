import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = resolve('dist');
const NAV = [
  ['calculadoras', 'Calculadoras', '/#calculadoras'],
  ['carreras', 'Carreras', '/carreras'],
  ['estados', 'Estados', '/estados'],
  ['finanzas', 'Finanzas', '/finanzas'],
  ['economia', 'Economía', '/economia'],
  ['aprende', 'Aprende', '/aprende'],
];

const EMBED_BOOT = `<script data-milana-embed-boot>(function(){try{if(new URLSearchParams(location.search).get('embed')==='1')document.documentElement.classList.add('ml-embed')}catch(e){}})();</script>`;
const SHELL_STYLE = `<link rel="stylesheet" href="/product-shell.css" data-milana-product-shell-style>`;

function htmlFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) htmlFiles(path, out);
    else if (path.endsWith('.html')) out.push(path);
  }
  return out;
}

function routeFromFile(file) {
  const rel = relative(DIST, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'/index.html'.length)}`;
  return `/${rel}`;
}

function sectionForRoute(route) {
  const first = route.split('/').filter(Boolean)[0] || '';
  if (NAV.some(([id]) => id === first)) return first;
  return null;
}

function navLinks(current) {
  return NAV.map(([id, label, href]) => {
    const active = current === id ? ' aria-current="page"' : '';
    return `<a href="${href}" data-shell-section="${id}"${active}>${label}</a>`;
  }).join('');
}

export function productShellMarkup(route = '/') {
  const current = sectionForRoute(route);
  const advisorCurrent = route === '/finanzas/mi-situacion' ? ' aria-current="page"' : '';
  const links = navLinks(current);
  return `<header class="ml-product-shell" data-milana-product-shell><div class="ml-product-shell__inner"><a class="ml-product-brand" href="/" aria-label="MiLana, inicio"><span class="ml-product-brand__mark" aria-hidden="true">M</span><span class="ml-product-brand__name">MiLana</span></a><nav class="ml-product-nav" aria-label="Principal">${links}</nav><a class="ml-product-cta" href="/finanzas/mi-situacion"${advisorCurrent}>Mi situación</a><details class="ml-product-menu"><summary aria-label="Abrir menú principal">Menú</summary><div class="ml-product-menu__panel"><nav aria-label="Principal móvil">${links}</nav></div></details></div></header>`;
}

export function applyProductShell(html, route = '/') {
  let out = html;
  out = out.replace(/<header class="ml-product-shell"[\s\S]*?<\/header>/i, '');
  out = out.replace(/<header class="top"[\s\S]*?<\/header>/i, '');

  if (!out.includes('data-milana-embed-boot')) {
    out = out.replace('</head>', `${EMBED_BOOT}</head>`);
  }
  if (!out.includes('data-milana-product-shell-style')) {
    out = out.replace('</head>', `${SHELL_STYLE}</head>`);
  }

  const shell = productShellMarkup(route);
  out = out.replace(/<body([^>]*)>/i, (match) => `${match}${shell}`);
  return out;
}

function run() {
  let changed = 0;
  let legacyRemoved = 0;
  const files = htmlFiles(DIST);
  for (const file of files) {
    const route = routeFromFile(file);
    if (route === '/404.html') continue;
    const before = readFileSync(file, 'utf8');
    if (/<header class="top"/i.test(before)) legacyRemoved += 1;
    const after = applyProductShell(before, route);
    if ((after.match(/<header class="ml-product-shell"/g) || []).length !== 1) {
      throw new Error(`${route}: product shell duplicado o ausente`);
    }
    if (after !== before) {
      writeFileSync(file, after, 'utf8');
      changed += 1;
    }
  }

  for (const required of ['aprende/index.html', 'widgets/index.html']) {
    const html = readFileSync(join(DIST, required), 'utf8');
    if (!html.includes('data-milana-product-shell')) throw new Error(`${required}: falta product shell`);
  }
  console.log(`product shell: ${files.length} HTML revisados, ${changed} actualizados, ${legacyRemoved} headers legacy sustituidos`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) run();
