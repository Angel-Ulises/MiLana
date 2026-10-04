import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';

const DIST = new URL('../dist/', import.meta.url);
const PUBLIC = new URL('../public/', import.meta.url);
const RUNTIME_CSS_FILES = ['orbita-v3-internal.css','orbita-v3-hybrid.css','orbita-v3-experience.css','orbita-v3-glossary.css','orbita-v3-visuals.css','orbita-v3-audit.css','orbita-v3-movil.css'];
const RESERVAS = JSON.parse(await readFile(new URL('./reservas-alturas.json', import.meta.url), 'utf8').catch(() => '{}'));
const SKIP_ROUTES = new Set(['/404', '/widgets']);
const PROTECTED_PENSION = '/calculadoras/pension-imss';
const VISUAL_SECTIONS = new Set(['carreras', 'estados', 'finanzas', 'economia', 'aprende']);
const GLOSSARY_TERMS = ['ISR','UMA','CETES','CAT','RESICO','PTU','SBC','IMSS','LFT'];
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
const embedGuard = `<style data-orbita-embed-guard>html.ml-orbita-embed .ml-orbita-shell,html.ml-orbita-embed .ml-orbita-drawer,html.ml-orbita-embed .ml-orbita-search,html.ml-orbita-embed .ml-orbita-skip-link,html.ml-orbita-embed [data-orbita-static-reserve],html.ml-orbita-embed [data-orbita-ad-reserve]{display:none!important}</style>`;
const baseHead = `${boot}${embedGuard}<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=optional" rel="stylesheet"><link rel="stylesheet" href="/orbita-v3-base.css">`;
const runtimeBlocking = '<link rel="stylesheet" href="/orbita-v3-runtime.css" data-orbita-runtime-bundle>';
// Probado: cargar el runtime sin bloquear en páginas estáticas baja el primer pintado de 1.4 s a 0.56 s, pero el CLS sube hasta 0.39
// (/aprende/finiquito-vs-liquidacion). Se queda bloqueante hasta reducir el runtime o inlinear su CSS crítico.
const internalHead = '<!--RUNTIME-CSS--><script src="/orbita-v3-internal.js" defer data-orbita-internal-runtime></script><script src="/orbita-v3-experience.js" defer data-orbita-experience-runtime></script><script src="/orbita-v3-glossary.js" defer data-orbita-glossary-runtime></script><script src="/orbita-v3-visuals.js" defer data-orbita-visuals-runtime></script>';
const headForRoute = (route) => `${baseHead}${route === PROTECTED_PENSION ? '' : '<link rel="stylesheet" href="/orbita-v3-prepaint.css" data-orbita-prepaint>'+internalHead.replace('<!--RUNTIME-CSS-->', runtimeBlocking)}<script src="/orbita-v3-base.js" defer data-orbita-runtime></script>`;
const headerNav = nav.map(([key, href, label]) => `<a data-orbita-nav="${key}" href="${href}">${label}</a>`).join('');
const drawerNav = `<a href="/finanzas/mi-situacion">Mi situación</a>${nav.map(([key, href, label]) => `<a data-orbita-nav="${key}" href="${href}">${label === 'Finanzas' ? 'Finanzas personales' : label}</a>`).join('')}<button class="ml-orbita-mobile-easy" type="button" data-orbita-easy aria-pressed="false">Letra grande</button>`;
const results = searchItems.map(([,href,label])=>`<a data-orbita-search-item href="${href}">${label}</a>`).join('');
const shell = `<a class="ml-orbita-skip-link" href="#__CONTENT_ID__">Saltar al contenido</a><header class="ml-orbita-shell" data-orbita-shell><div class="ml-orbita-top"><a class="ml-orbita-logo" href="/" aria-label="MiLana, inicio"><span class="ml-orbita-logo-m" aria-hidden="true">M</span><span>MiLana</span></a><nav class="ml-orbita-nav" aria-label="Secciones">${headerNav}</nav><div class="ml-orbita-actions"><button class="ml-orbita-icon-btn" type="button" data-orbita-easy aria-pressed="false" title="Letra grande desactivada">Aa<span>Letra grande</span></button><button class="ml-orbita-icon-btn" type="button" data-orbita-search-open aria-label="Buscar">${iconSearch}</button><a class="ml-orbita-situation" href="/finanzas/mi-situacion">Mi situación</a><button class="ml-orbita-menu-btn" type="button" aria-label="Menú" aria-expanded="false" aria-controls="ml-orbita-drawer">${iconMenu}</button></div></div></header><nav class="ml-orbita-drawer" id="ml-orbita-drawer" aria-label="Menú" aria-hidden="true">${drawerNav}</nav><dialog class="ml-orbita-search" aria-labelledby="ml-orbita-search-title"><div class="ml-orbita-search-inner"><div class="ml-orbita-search-head"><h2 id="ml-orbita-search-title">Buscar en MiLana</h2><button class="ml-orbita-search-close" type="button" data-orbita-search-close aria-label="Cerrar">×</button></div><input type="search" autocomplete="off" placeholder="¿Qué quieres encontrar?" aria-label="Buscar herramientas o secciones"><div class="ml-orbita-search-list">${results}</div><p class="ml-orbita-search-empty" data-orbita-search-empty hidden>Sin resultados</p></div></dialog>`;

const sectionForRoute = (route) => {
  if (route.startsWith('/carreras')) return 'carreras';
  if (route.startsWith('/estados')) return 'estados';
  if (route.startsWith('/finanzas')) return 'finanzas';
  if (route.startsWith('/economia')) return 'economia';
  if (route.startsWith('/aprende')) return 'aprende';
  return '';
};
const heroClasses = {
  carreras:['career-hero','profession-hero'],
  estados:['state-hero','state-detail-hero','sc-hero'],
  finanzas:['finance-page-hero','advisor-hero','investment-hero'],
  economia:['economy-hero','economy-article-hero'],
  aprende:['hubhead','learn-hero'],
};
const visibleText = (html) => html
  .replace(/<script\b[\s\S]*?<\/script>/gi,' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi,' ')
  .replace(/<[^>]+>/g,' ')
  .replace(/&nbsp;|&#160;/gi,' ')
  .replace(/\s+/g,' ');
function insertAfterHero(html, section, markup){
  for(const cls of heroClasses[section] || []){
    const hit=html.indexOf(cls);
    if(hit<0) continue;
    const close=html.indexOf('</section>',hit);
    if(close>=0) return html.slice(0,close+10)+markup+html.slice(close+10);
  }
  const main=html.match(/<main\b[^>]*>/i);
  if(!main) return html;
  const at=(main.index || 0)+main[0].length;
  return html.slice(0,at)+markup+html.slice(at);
}
function injectStaticReserves(html,route){
  if(route===PROTECTED_PENSION) return html;
  const section=sectionForRoute(route);
  if(!VISUAL_SECTIONS.has(section)) return html;
  const text=visibleText(html).toUpperCase();
  const detectedTerms=GLOSSARY_TERMS.filter((term)=>new RegExp(`(^|[^A-ZÁÉÍÓÚÑ])${term}([^A-ZÁÉÍÓÚÑ]|$)`).test(text)).slice(0,5);
  const mobileRows=Math.max(1,Math.ceil(detectedTerms.length/2));
  const glossaryM=detectedTerms.length ? 128 + Math.max(0,mobileRows-1)*50 : 0;
  const glossary=detectedTerms.length?`<div class="orb-runtime-reserve orb-glossary-reserve" style="--orb-glossary-reserve-d:104px;--orb-glossary-reserve-m:${glossaryM}px" data-orbita-static-reserve data-orbita-glossary-reserve aria-hidden="true"></div>`:'';
  const visual='<div class="orb-runtime-reserve orb-visual-reserve" data-orbita-static-reserve data-orbita-visual-reserve aria-hidden="true"></div>';
  // Guías de Aprende: sin visual de sección y el glosario después del artículo, para que el título sea lo primero.
  if(section==='aprende' && /^\/aprende\/[^/]+/.test(route)){
    const end=html.indexOf('</article>');
    return end>=0 ? html.slice(0,end+10)+glossary+html.slice(end+10) : html;
  }
  return insertAfterHero(html,section,`${glossary}${visual}`);
}
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
const runtimeCss=(await Promise.all(RUNTIME_CSS_FILES.map((name)=>readFile(new URL(name,PUBLIC),'utf8')))).join('\n\n');
await writeFile(new URL('orbita-v3-runtime.css',DIST),runtimeCss);
let changed=0, skipped=0;
const originals = await files(DIST);
for(const path of originals){
  const route=routeFor(path);
  if(SKIP_ROUTES.has(route)||route.startsWith('/widgets/')){skipped++;continue}
  let html=await readFile(path,'utf8');
  if(html.includes('data-orbita-shell')) continue;
  if(!html.includes('</head>')||!/<body(?:\s|>)/i.test(html)) throw new Error(`HTML sin estructura esperada: ${route}`);
  const hasRoot = html.includes('id="root"');
  const contentId = hasRoot ? 'root' : 'ml-main';
  if(!hasRoot && /<main(?:\s|>)/i.test(html) && !html.includes('id="ml-main"')) html=html.replace(/<main(\s|>)/i, '<main id="ml-main"$1');
  // Altura de reserva del visual de sección por ruta (scripts/reservas-alturas.json); prepaint.css la usa como min-height.
  const reserva=RESERVAS[route];
  if(reserva) html=html.replace(/<html\b([^>]*)>/i,(tag,attrs)=>/\sstyle=/.test(attrs)?tag:`<html${attrs} style="${reserva.m?`--orb-reserve-m:${reserva.m}px;`:''}${reserva.d?`--orb-reserve-d:${reserva.d}px`:''}">`);
  if(!hasRoot) html=injectStaticReserves(html,route);
  // No se inyectan reservas publicitarias vacías; AdSense real se gestiona fuera de esta capa.
  const frame = shell.replace('__CONTENT_ID__', contentId);
  const staticAttr = STATIC_TOP_ROUTES.has(route) ? ' data-orbita-static-top="true"' : '';
  // Preload estático solo en Inicio, para que lo vea el preload scanner.
  // Justo después de <meta name="viewport"> (antes el viewport por defecto de 980px hacía coincidir la media query); en móvil (≤620px) la foto del hero está oculta, así que no se precarga.
  if(route==='/') html=html.replace(/(<meta\s+name=["']viewport["'][^>]*>)/i,'$1<link rel="preload" as="image" href="/images/gen/inicio-1440.webp" fetchpriority="high" media="(min-width: 621px)">');
  // Sin <link rel="icon" > el navegador pide /favicon.ico (404).
  if(!/<link[^>]+rel="(?:shortcut )?icon"/i.test(html)) html=html.replace('</head>','<link rel="icon" type="image/svg+xml" href="/favicon.svg"></head>');
  html=html.replace('</head>',`${headForRoute(route)}</head>`).replace(/<body([^>]*)>/i,`<body$1${staticAttr}>${frame}`);
  await writeFile(path,html);
  changed++;
}
console.log(`Órbita v3 base: ${changed} HTML con marco; ${skipped} excluidos; embeds por ?embed=1.`);
