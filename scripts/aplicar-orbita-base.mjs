import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';

const DIST = new URL('../dist/', import.meta.url);
const SKIP_ROUTES = new Set(['/404', '/widgets']);
const STATIC_TOP_ROUTES = new Set([
  '/aprende',
  '/aprende/aguinaldo-bruto-neto',
  '/aprende/finiquito-vs-liquidacion',
  '/aprende/leer-recibo-nomina',
  '/aprende/pension-imss-ley-97',
  '/aprende/resico-ingresos-cobrados',
  '/aprende/vacaciones-prima-vacacional',
  '/sobre', '/contacto', '/metodo', '/privacidad', '/financiamiento',
]);
const nav = [
  ['calculadoras', '/#calculadoras', 'Calculadoras'],
  ['carreras', '/carreras', 'Carreras'],
  ['estados', '/estados', 'Estados'],
  ['finanzas', '/finanzas', 'Finanzas'],
  ['economia', '/economia', 'Economía'],
  ['aprende', '/aprende', 'Aprende'],
];

const [careerData, stateData, financeData, professionData] = await Promise.all([
  readFile(new URL('../src/data/carreras.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../src/data/estados.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../src/data/finanzas.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../src/data/profesiones.json', import.meta.url), 'utf8').then(JSON.parse),
]);
const cleanTitle = (title='') => title.replace(/\s*\|\s*MiLana.*$/i, '').trim();
const searchItems = [
  ...nav,
  ['finiquito','/calculadoras/finiquito','Finiquito'],
  ['liquidacion','/calculadoras/liquidacion','Liquidación'],
  ['aguinaldo','/calculadoras/aguinaldo','Aguinaldo'],
  ['isr','/calculadoras/isr','ISR'],
  ['resico','/calculadoras/resico','RESICO'],
  ['ptu','/calculadoras/ptu','PTU'],
  ['bruto','/calculadoras/bruto-a-neto','Bruto a Neto'],
  ['vacaciones','/calculadoras/vacaciones','Vacaciones'],
  ['infonavit','/calculadoras/infonavit','Infonavit'],
  ['pension','/calculadoras/pension-imss','Pensión IMSS'],
  ...careerData.paginas.filter(x=>x.slug).map(x=>[`carrera-${x.slug}`, `/carreras/${x.slug}`, cleanTitle(x.titulo)]),
  ['carreras-comparar','/carreras/comparar','Comparar carreras'],
  ['carreras-ocupaciones','/carreras/ocupaciones','Carrera y ocupación'],
  ...professionData.profesiones.map(x=>[`profesion-${x.slug}`, `/carreras/profesion/${x.slug}`, x.nombre]),
  ...stateData.estados.map(x=>[`estado-${x.slug}`, `/estados/${x.slug}`, `Estado: ${x.estado}`]),
  ['estados-comparar','/estados/comparar','Comparar estados'],
  ...financeData.paginas.filter(x=>x.slug).map(x=>[`finanzas-${x.slug}`, `/finanzas/${x.slug}`, cleanTitle(x.titulo)]),
  ['mi-situacion','/finanzas/mi-situacion','Mi situación financiera'],
  ['inversion','/finanzas/inversion','Inversión educativa'],
  ['inversion-comparar','/finanzas/inversion/comparar','Comparar instrumentos de inversión'],
  ['cetes','/finanzas/inversion/cetes','CETES'],
  ['fondos','/finanzas/inversion/fondos','Fondos de inversión'],
];
const iconSearch = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>';
const iconMenu = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>';
const boot = `<script data-orbita-boot>(function(){var q=new URLSearchParams(location.search);var r=document.documentElement;if(q.get('embed')==='1'){r.classList.add('ml-orbita-embed');return}var p=location.pathname.replace(/\\\/$/,'')||'/';r.classList.add('ml-orbita-enabled');var s=p.indexOf('/calculadoras')===0?'calculadoras':p.indexOf('/carreras')===0?'carreras':p.indexOf('/estados')===0?'estados':p.indexOf('/finanzas')===0?'finanzas':p.indexOf('/economia')===0?'economia':p.indexOf('/aprende')===0?'aprende':'inicio';r.dataset.orbitaSection=s;try{if(localStorage.getItem('ml-orbita-easy')==='1')r.classList.add('ml-orbita-easy')}catch(e){}})();</script>`;
const embedGuard = `<style data-orbita-embed-guard>html.ml-orbita-embed .ml-orbita-shell,html.ml-orbita-embed .ml-orbita-drawer,html.ml-orbita-embed .ml-orbita-search,html.ml-orbita-embed .ml-orbita-skip-link{display:none!important}</style>`;
const head = `${boot}${embedGuard}<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="/orbita-v3-base.css">`;
const headerNav = nav.map(([key, href, label]) => `<a data-orbita-nav="${key}" href="${href}">${label}</a>`).join('');
const drawerNav = `<a href="/finanzas/mi-situacion">Mi situación</a>${nav.map(([key, href, label]) => `<a data-orbita-nav="${key}" href="${href}">${label === 'Finanzas' ? 'Finanzas personales' : label}</a>`).join('')}<button class="ml-orbita-mobile-easy" type="button" data-orbita-easy aria-pressed="false">Modo fácil</button>`;
const results = searchItems.map(([,href,label])=>`<a data-orbita-search-item href="${href}">${label}</a>`).join('');
const shell = `<a class="ml-orbita-skip-link" href="#__CONTENT_ID__">Saltar al contenido</a><header class="ml-orbita-shell" data-orbita-shell><div class="ml-orbita-top"><a class="ml-orbita-logo" href="/" aria-label="MiLana, inicio"><span class="ml-orbita-logo-m" aria-hidden="true">M</span><span>MiLana</span></a><nav class="ml-orbita-nav" aria-label="Secciones">${headerNav}</nav><div class="ml-orbita-actions"><button class="ml-orbita-icon-btn" type="button" data-orbita-easy aria-pressed="false" title="Modo fácil desactivado">Aa<span>Modo fácil</span></button><button class="ml-orbita-icon-btn" type="button" data-orbita-search-open aria-label="Buscar">${iconSearch}</button><a class="ml-orbita-situation" href="/finanzas/mi-situacion">Mi situación</a><button class="ml-orbita-menu-btn" type="button" aria-label="Menú" aria-expanded="false" aria-controls="ml-orbita-drawer">${iconMenu}</button></div></div></header><nav class="ml-orbita-drawer" id="ml-orbita-drawer" aria-label="Menú" aria-hidden="true">${drawerNav}</nav><dialog class="ml-orbita-search" aria-labelledby="ml-orbita-search-title"><div class="ml-orbita-search-inner"><div class="ml-orbita-search-head"><h2 id="ml-orbita-search-title">Buscar en MiLana</h2><button class="ml-orbita-search-close" type="button" data-orbita-search-close aria-label="Cerrar">×</button></div><input type="search" autocomplete="off" placeholder="¿Qué quieres encontrar?" aria-label="Buscar herramientas o secciones"><div class="ml-orbita-search-list">${results}</div><p class="ml-orbita-search-empty" data-orbita-search-empty hidden>Sin resultados</p></div></dialog>`;
const runtime = '<script src="/orbita-v3-base.js" defer data-orbita-runtime></script>';

async function files(dir) {
  const out=[];
  for (const entry of await readdir(dir,{withFileTypes:true})) {
    const path=join(dir.pathname,entry.name);
    if(entry.isDirectory()) out.push(...await files(new URL(entry.name+'/',dir)));
    else if(entry.name.endsWith('.html')) out.push(path);
  }
  return out;
}
function routeFor(path) {
  const rel=relative(DIST.pathname,path).split(sep).join('/');
  if(rel==='index.html') return '/';
  if(rel==='404.html') return '/404';
  return '/'+rel.replace(/\/index\.html$/,'').replace(/\.html$/,'');
}
function isCalculator(route) { return /^\/calculadoras\/[^/]+$/.test(route); }
function noIndexWidget(html) {
  const robots = '<meta name="robots" content="noindex, nofollow" />';
  if (/<meta\b[^>]*\bname=["\']robots["\'][^>]*>/i.test(html)) {
    return html.replace(/<meta\b[^>]*\bname=["\']robots["\'][^>]*>/i, robots);
  }
  return html.replace('</head>', `    ${robots}\n  </head>`);
}
async function writeWidgetVariant(route, html) {
  const slug=route.split('/').filter(Boolean).at(-1);
  const dest=join(DIST.pathname, 'widgets', 'calculadoras', slug, 'index.html');
  await mkdir(dirname(dest), { recursive:true });
  await writeFile(dest, noIndexWidget(html));
}

let changed=0, skipped=0, widgets=0;
const originals = await files(DIST);
for(const path of originals){
  const route=routeFor(path);
  if(SKIP_ROUTES.has(route)||route.startsWith('/widgets/')){skipped++;continue}
  let html=await readFile(path,'utf8');
  if(isCalculator(route)){ await writeWidgetVariant(route, html); widgets++; }
  if(html.includes('data-orbita-shell')) continue;
  if(!html.includes('</head>')||!/<body(?:\s|>)/i.test(html)) throw new Error(`HTML sin estructura esperada: ${route}`);
  const hasRoot = html.includes('id="root"');
  const contentId = hasRoot ? 'root' : 'ml-main';
  if(!hasRoot && /<main(?:\s|>)/i.test(html) && !html.includes('id="ml-main"')) html=html.replace(/<main(\s|>)/i, '<main id="ml-main"$1');
  const frame = shell.replace('__CONTENT_ID__', contentId);
  const staticAttr = STATIC_TOP_ROUTES.has(route) ? ' data-orbita-static-top="true"' : '';
  html=html.replace('</head>',`${head}</head>`).replace(/<body([^>]*)>/i,`<body$1${staticAttr}>${frame}`).replace('</body>',`${runtime}</body>`);
  await writeFile(path,html);
  changed++;
}
console.log(`Órbita v3 base: ${changed} HTML con marco; ${skipped} excluidos; ${widgets} URLs físicas de widget limpias.`);
