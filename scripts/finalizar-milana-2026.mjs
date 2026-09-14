import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const read = (p) => readFileSync(p, 'utf8');
const write = (p, s) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, s, 'utf8'); };
const replaceExact = (path, from, to, label = from.slice(0, 50)) => {
  const s = read(path);
  if (!s.includes(from)) throw new Error(`${path}: no encontré ${label}`);
  write(path, s.replace(from, to));
};
const replaceRe = (path, re, to, label) => {
  const s = read(path);
  if (!re.test(s)) throw new Error(`${path}: no encontré ${label}`);
  write(path, s.replace(re, to));
};

// ---------------------------------------------------------------------------
// 1) Inicio: imagen nítida, contenido directo y navegación sin parche visual.
// ---------------------------------------------------------------------------
const app = 'src/App.jsx';
replaceExact(app,
`function Foto({ name, alt = '', sizes, className, eager = false, focal, movil }) {
  const srcset = (base, anchos, ext) =>
    anchos.map(w => \`/images/gen/\${base}-\${w}.\${ext} \${w}w\`).join(', ');
  // El src es solo el respaldo para navegadores que ignoran srcset: no
  // conviene que sea la variante mas pesada.
  const respaldo = 1440;
  return (
    <picture className={className}>`,
`const HERO_INICIO = 'https://images.pexels.com/photos/6963026/pexels-photo-6963026.jpeg';

function Foto({ name, alt = '', sizes, className, eager = false, focal, movil }) {
  const srcset = (base, anchos, ext) =>
    anchos.map(w => \`/images/gen/\${base}-\${w}.\${ext} \${w}w\`).join(', ');
  const respaldo = 1440;

  // El hero de Inicio usa el original de Pexels servido responsivamente.
  // La fotografía anterior tenía profundidad de campo y una capa de degradado
  // que en móvil se percibían como desenfoque. Esta toma es horizontal,
  // nítida y mantiene la acción financiera visible en todos los tamaños.
  if (name === 'inicio') {
    const widths = [640, 960, 1280, 1600, 2200, 2600];
    const remoteSrcset = widths.map(w => \`\${HERO_INICIO}?auto=compress&cs=tinysrgb&w=\${w} \${w}w\`).join(', ');
    return (
      <picture className={className}>
        <img
          src={\`\${HERO_INICIO}?auto=compress&cs=tinysrgb&w=1600\`}
          srcSet={remoteSrcset}
          sizes={sizes}
          alt={alt}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          width="1500"
          height="1000"
          style={{ objectPosition: '52% 48%' }}
        />
      </picture>
    );
  }

  return (
    <picture className={className}>`, 'función Foto');

replaceExact(app,
`        decoding="async"
        style={focal ? { objectPosition: focal } : undefined}`,
`        decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
        style={focal ? { objectPosition: focal } : undefined}`, 'fetchPriority de fotografías');

replaceExact(app,
`  { id: 'bruto-neto', nombre: 'Bruto a Neto', desc: 'Salario neto real', comp: CalcBrutoNeto },`,
`  { id: 'bruto-neto', nombre: 'Bruto a Neto', desc: 'Neto después de ISR e IMSS', comp: CalcBrutoNeto },`, 'descripción bruto a neto');

replaceRe(app, /const LECTURAS = \[[\s\S]*?\n\];\n\nexport default function App\(\)/,
`const LECTURAS = [
  { href: '/aprende/finiquito-vs-liquidacion/', min: '6 min', tema: 'Trabajo', titulo: 'Finiquito vs. liquidación: qué cambia realmente' },
  { href: '/aprende/leer-recibo-nomina/', min: '7 min', tema: 'Sueldo', titulo: 'Cómo leer tu recibo de nómina sin perderte' },
  { href: '/aprende/aguinaldo-bruto-neto/', min: '5 min', tema: 'Prestaciones', titulo: 'Aguinaldo bruto y neto: por qué no son la misma cifra' },
];

export default function App()`, 'bloque LECTURAS');

replaceExact(app,
`      ) : (
        <main>
          <section className="hero">`,
`      ) : (
        <main className="home-main">
          <section className="hero">`, 'main de Inicio');

replaceExact(app,
`                <h1>Entiende lo que tienes. Decide lo que sigue.</h1>
                <p className="hero-lede">MiLana reúne calculadoras, explicaciones y datos oficiales para ayudarte a pasar de la duda a una decisión concreta, sin lenguaje de banco y sin promesas fáciles.</p>
                <div className="hero-actions">
                  <a className="btn btn-primary" href="/#situaciones">Explorar mi situación</a>
                  <a className="btn btn-secondary" href="/#calculadoras">Ver calculadoras</a>
                </div>`,
`                <h1>Entiende tu dinero. Decide con claridad.</h1>
                <p className="hero-lede">Calcula tu sueldo y prestaciones en México, entiende cada resultado y revisa sus fuentes antes de tomar una decisión.</p>
                <div className="hero-actions">
                  <a className="btn btn-primary" href="/#calculadoras">Ver calculadoras</a>
                  <a className="btn btn-secondary" href="/#situaciones">Elegir mi situación</a>
                </div>`, 'copy del hero');

replaceExact(app,
`                  <Foto name="inicio" sizes="(max-width: 1023px) 102vw, (max-width: 1279px) 88vw, (max-width: 1599px) 83vw, 1230px" eager />`,
`                  <Foto name="inicio" alt="Pareja revisando documentos y finanzas en una computadora" sizes="(max-width: 1023px) 100vw, (max-width: 1279px) 58vw, 760px" eager />`, 'imagen del hero');

replaceExact(app,
`  const idsVisibles = filtro ? filtro : (verTodas ? ORDEN_INICIO : ORDEN_INICIO.slice(0, 5));`,
`  const idsVisibles = filtro ? filtro : (verTodas ? ORDEN_INICIO : ORDEN_INICIO.slice(0, 6));`, 'seis calculadoras principales');

replaceExact(app,
`                  <article key={c.id} className={\`calculator-card\${i === 0 && !verTodas && !filtro ? ' feature-card' : ''}\`}>
                    <span className="card-tag">{c.tag}</span>`,
`                  <article key={c.id} className={\`calculator-card\${i === 0 && !verTodas && !filtro ? ' feature-card' : ''}\`}>
                    <CalculatorIcon id={c.id} />
                    <span className="card-tag">{c.tag}</span>`, 'iconos de tarjetas');

replaceRe(app, /<button className="btn btn-secondary" onClick=\{\(\) => \{ setFiltro\(null\); setVerTodas\(true\); document\.getElementById\('calculadoras'\)\?\.scrollIntoView\(\{behavior:'smooth'\}\); \}\}\s*style=\{\{cursor:'pointer',fontFamily:'inherit'\}\}>\s*Explorar explicaciones\s*<\/button>/,
`<a className="btn btn-secondary" href="/aprende/">Ver todas las guías</a>`, 'CTA de Aprende');

replaceExact(app,
`                  <a key={l.id} className="article-row" href={rutaDe(l.id)}
                     onClick={(e) => { e.preventDefault(); setActiva(l.id); }}>`,
`                  <a key={l.href} className="article-row" href={l.href}>`, 'enlaces de artículos');

replaceExact(app,
`                <div><span>03</span><p>Estado de verificación claro cuando un dato requiere revisión.</p></div>`,
`                <div><span>03</span><p>Alcance, límites y fecha de comprobación visibles en cada herramienta.</p></div>`, 'tercer punto de confianza');

replaceExact(app,
`          <p>MiLana © 2026 · Hecho en México · <a href="/privacidad" style={{textDecoration:'underline'}}>Privacidad</a></p>`,
`          <nav className="astra-footer-links" aria-label="Información de MiLana">
            <a href="/aprende/">Aprende</a>
            <a href="/sobre/">Sobre MiLana</a>
            <a href="/metodo/">Cómo revisamos</a>
            <a href="/contacto/">Contacto y correcciones</a>
            <a href="/privacidad/">Privacidad</a>
            <a href="/financiamiento/">Cómo nos financiamos</a>
          </nav>
          <p>MiLana © 2026 · Hecho en México.</p>`, 'footer completo');

// ---------------------------------------------------------------------------
// 2) Astra JS: se conserva menú/a11y/medición, se elimina el reordenamiento
//    del DOM y la reescritura de contenido ya integrado en React.
// ---------------------------------------------------------------------------
replaceRe('public/astra-2026.js', /  function setupHome\(\) \{[\s\S]*?\n  \}\n\n  function setupCalculator\(\)/,
`  function setupHome() {
    const hero = qs('.hero');
    if (!hero || hero.dataset.astraReady === 'true') return;
    hero.dataset.astraReady = 'true';
    const calculators = qs('#calculadoras');
    qsa('.calculator-card a[href^="/calculadoras/"]', calculators).forEach(a => a.addEventListener('click', () => {
      track('home_calculator_click', { calculator: a.getAttribute('href').split('/').filter(Boolean).at(-1) || 'unknown' });
    }));
  }

  function setupCalculator()`, 'setupHome Astra');

// ---------------------------------------------------------------------------
// 3) Capa visual final: fotos nítidas, orden estable, tarjetas y móvil.
// ---------------------------------------------------------------------------
let astraCss = read('public/astra-2026.css');
const finalCss = `

/* ============================================================
   CIERRE DE PRODUCTO — experiencia final 2026-09-14
   ============================================================ */
.home-main { display:flex; flex-direction:column; }
.home-main > .hero { order:0; }
.home-main > .calculators { order:1; }
.home-main > .situations { order:2; }
.home-main > .learn-section { order:3; }
.home-main > .trust-band { order:4; }
.home-main > .path-section { display:none !important; }

/* La foto manda como fotografía: degradado corto en escritorio y sin velo en móvil. */
.hero-media::before {
  background: linear-gradient(90deg, #FBF8F2 0%, rgb(251 248 242 / .84) 7%, rgb(251 248 242 / .24) 17%, transparent 28%) !important;
}
.hero-media::after { background:none !important; }
.hero-media img {
  filter:none !important;
  transform:none !important;
  image-rendering:auto;
  object-position:52% 48% !important;
}
.calculator-hero-media img { filter:none !important; transform:none !important; }
.calculator-hero-media::after {
  background: linear-gradient(90deg, #FBF8F2 0%, rgb(251 248 242 / .78) 8%, rgb(251 248 242 / .18) 20%, transparent 31%) !important;
}

.calculator-card { position:relative; }
.calculator-card > span[style*="width: 44px"] { margin-bottom:18px; }
.calculator-card .card-tag { margin-top:2px; }
.calculator-card:hover { border-color:#B8C7D3; box-shadow:0 14px 34px rgba(19,38,59,.09); }
.feature-card > span[style*="width: 44px"] { background:rgba(255,255,255,.10) !important; color:#fff !important; }

.article-row { transition:background 140ms ease, padding-left 140ms ease; }
.article-row:hover { background:rgba(255,255,255,.58); padding-left:10px; padding-right:10px; }
.site-footer { border-top:1px solid var(--ml-border); }
.astra-footer-links { margin-top:22px; }
.astra-footer-links a { font-weight:600; }

@media (max-width:1023px) {
  .hero-media-wrap { min-height:360px !important; }
  .hero-media { min-height:360px !important; }
  .hero-media::before { background:linear-gradient(180deg, #FBF8F2 0%, rgb(251 248 242 / .32) 7%, transparent 18%) !important; }
  .hero h1 { font-size:clamp(46px, 8vw, 62px); line-height:1; }
}
@media (max-width:640px) {
  .site-header { height:66px; }
  .astra-mobile-menu { top:66px; }
  .hero-grid { padding-top:34px !important; }
  .hero-copy { padding-bottom:24px !important; }
  .hero h1 { font-size:clamp(42px, 12vw, 52px); line-height:.98; }
  .hero-lede { margin-top:18px; font-size:16px; line-height:1.55; }
  .hero-proof { margin-top:18px; gap:10px 14px; }
  .hero-media-wrap, .hero-media { min-height:285px !important; }
  .hero-media::before, .hero-media::after { background:none !important; }
  .hero-media img { object-position:52% 48% !important; }
  .calculator-hero-media::after { background:none !important; }
  .calculator-hero-media { height:220px !important; }
  .calculators { padding-top:54px; }
  .calculator-card { min-height:0; padding:22px; }
  .calculator-card h3 { margin-top:16px; }
  .situation-card { min-height:0; }
  .learn-section .article-row { grid-template-columns:48px 1fr 18px; min-height:104px; }
}
`;
if (!astraCss.includes('CIERRE DE PRODUCTO — experiencia final')) astraCss += finalCss;
write('public/astra-2026.css', astraCss);

// ---------------------------------------------------------------------------
// 4) Metadata: quitar FAQ invisible, añadir Website y una imagen social nítida.
// ---------------------------------------------------------------------------
let index = read('index.html');
index = index.replace('<title>MiLana — Calculadoras Financieras México 2026</title>', '<title>MiLana | Calculadoras de sueldo y prestaciones México 2026</title>');
index = index.replace('Calcula gratis tu finiquito, liquidación, ISR, aguinaldo, RESICO, PTU, crédito Infonavit y pensión IMSS. Cada calculadora muestra su fuente y fecha de revisión.', 'Calcula sueldo, ISR, aguinaldo, finiquito, liquidación, vacaciones y más en México. Cada herramienta explica su resultado, alcance y fuentes 2026.');
index = index.replace('<meta name="twitter:card" content="summary" />', '<meta name="twitter:card" content="summary_large_image" />');
if (!index.includes('images.pexels.com"')) index = index.replace('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>', '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link rel="preconnect" href="https://images.pexels.com">');
if (!index.includes('name="theme-color"')) index = index.replace('<meta name="viewport" content="width=device-width, initial-scale=1.0" />', '<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <meta name="theme-color" content="#FBF8F2" />');
const socialImage = 'https://images.pexels.com/photos/6963026/pexels-photo-6963026.jpeg?auto=compress&cs=tinysrgb&w=1600';
if (!index.includes('property="og:image"')) index = index.replace('<meta property="og:url" content="https://www.milanaaqui.mx/" />', `<meta property="og:url" content="https://www.milanaaqui.mx/" />\n    <meta property="og:image" content="${socialImage}" />\n    <meta property="og:image:alt" content="Pareja revisando sus finanzas en una computadora" />`);
if (!index.includes('name="twitter:image"')) index = index.replace('<meta name="twitter:description" content="Finiquito, liquidación, ISR, aguinaldo, RESICO y más. Consulta la fuente y fecha de revisión de cada cálculo. 100% gratis." />', `<meta name="twitter:description" content="Finiquito, liquidación, ISR, aguinaldo, RESICO y más. Consulta el alcance y las fuentes de cada cálculo." />\n    <meta name="twitter:image" content="${socialImage}" />`);
index = index.replace(/    <script type="application\/ld\+json">\s*\{[\s\S]*?"FAQPage"[\s\S]*?<\/script>/, `    <script type="application/ld+json">
    {"@context":"https://schema.org","@graph":[{"@type":"WebSite","name":"MiLana","url":"https://www.milanaaqui.mx/","inLanguage":"es-MX","description":"Calculadoras y explicaciones de sueldo, prestaciones e impuestos en México."},{"@type":"Organization","name":"MiLana","url":"https://www.milanaaqui.mx/"}]}
    </script>`);
index = index.replace('    <script defer src="/astra-content-2026.js"></script>\n', '');
write('index.html', index);

// ---------------------------------------------------------------------------
// 5) Fuente de la nueva fotografía principal.
// ---------------------------------------------------------------------------
let fuentes = read('assets-master/FUENTES.json');
fuentes = fuentes.replace(
`{ "id": "inicio", "uso": "Hero del Inicio", "pexels": 9869384, "fotografo": "Ron Lach", "pagina": "https://www.pexels.com/photo/couple-working-together-at-home-9869384/", "master": "4973x3315", "recorte": null, "focal": { "desktop": "72% 44%", "tablet": "68% 44%", "movil": "64% 42%" } }`,
`{ "id": "inicio", "uso": "Hero del Inicio", "pexels": 6963026, "fotografo": "Mikhail Nilov", "pagina": "https://www.pexels.com/photo/a-couple-looking-at-the-laptop-together-6963026/", "master": "Pexels CDN, original horizontal", "recorte": null, "focal": { "desktop": "52% 48%", "tablet": "52% 48%", "movil": "52% 48%" }, "_nota": "Sustituye la toma anterior: el desenfoque de profundidad de campo más el degradado del hero se percibían borrosos en móvil. Se sirve responsivamente desde el CDN original de Pexels." }`);
write('assets-master/FUENTES.json', fuentes);
let fotos = read('src/data/fotos.json');
fotos = fotos.replace(`"inicio":      { "focal": "72% 44%", "focalTablet": "68% 44%", "focalMovil": "64% 42%" }`, `"inicio":      { "focal": "52% 48%", "focalTablet": "52% 48%", "focalMovil": "52% 48%" }`);
write('src/data/fotos.json', fotos);

// ---------------------------------------------------------------------------
// 6) Páginas editoriales y de confianza con un sistema visual compartido.
// ---------------------------------------------------------------------------
const staticCss = `:root{--ink:#13263B;--text:#18283A;--muted:#5E6B78;--soft:#7A8794;--blue:#2D6CAA;--blue2:#245C93;--sky:#F2F7FB;--border:#D9E1E8;--ivory:#FBF8F2;--green:#28735A}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--text);background:#fff;font:16px/1.7 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}a{color:var(--blue);text-decoration:none}a:hover{text-decoration:underline;text-underline-offset:3px}.top{position:sticky;top:0;z-index:20;border-bottom:1px solid rgba(217,225,232,.8);background:rgba(255,255,255,.94);backdrop-filter:blur(12px)}.topin{width:min(calc(100% - 40px),1120px);height:66px;margin:auto;display:flex;align-items:center;gap:22px}.brand{margin-right:auto;display:flex;align-items:center;gap:9px;color:var(--ink);font-weight:800;font-size:19px;text-decoration:none}.mark{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:var(--ink);color:white}.nav{display:flex;gap:20px;font-size:13px;font-weight:650}.wrap{width:min(calc(100% - 40px),1080px);margin:auto}.article{max-width:760px;margin:0 auto;padding:58px 0 80px}.crumb{font-size:13px;color:var(--soft);margin-bottom:28px}.eyebrow{margin:0 0 12px;color:var(--blue);font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:800}h1,h2,h3{color:var(--ink)}h1,h2{font-family:Newsreader,Georgia,serif;letter-spacing:-.03em}h1{font-size:clamp(42px,7vw,64px);line-height:1.02;margin:0 0 18px}h2{font-size:30px;line-height:1.1;margin:42px 0 12px}h3{font-size:18px;margin:26px 0 8px}.lede{font-size:19px;line-height:1.6;color:var(--muted);margin:0 0 28px}.meta{display:flex;gap:8px 18px;flex-wrap:wrap;padding:14px 0 24px;border-bottom:1px solid var(--border);color:var(--soft);font-size:13px}.article p,.article li{color:var(--muted)}.article strong{color:var(--text)}.callout{margin:28px 0;padding:18px 20px;border-radius:16px;background:var(--sky);border:1px solid #DCEAF7}.callout strong{display:block;color:var(--ink);margin-bottom:4px}.cta{display:flex;justify-content:space-between;gap:18px;align-items:center;margin:42px 0 0;padding:22px;border-radius:18px;background:var(--ink);color:white}.cta a{flex:none;background:white;color:var(--ink);padding:11px 15px;border-radius:11px;font-weight:750}.sources{margin-top:42px;padding-top:24px;border-top:1px solid var(--border);font-size:14px}.sources ul{padding-left:20px}.hub{padding:64px 0 84px}.hubhead{max-width:760px;margin-bottom:36px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.card{min-height:250px;display:flex;flex-direction:column;padding:22px;border:1px solid var(--border);border-radius:18px;background:white}.card:hover{box-shadow:0 14px 34px rgba(19,38,59,.08);text-decoration:none}.tag{color:var(--blue);font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase}.card h2{font-family:Inter,system-ui,sans-serif;font-size:20px;letter-spacing:-.02em;margin:18px 0 10px}.card p{margin:0;color:var(--muted);font-size:14px}.card .more{margin-top:auto;padding-top:20px;font-weight:750}.footer{border-top:1px solid var(--border);background:var(--ivory);padding:34px 0;color:var(--muted);font-size:13px}.footerin{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}.footlinks{display:flex;gap:14px 20px;flex-wrap:wrap}.notice{padding:20px;border-left:4px solid var(--green);background:#EDF7F2}.button{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 16px;border-radius:12px;background:var(--blue);color:white;font-weight:750}.button:hover{background:var(--blue2);text-decoration:none}@media(max-width:820px){.grid{grid-template-columns:1fr 1fr}.nav{display:none}.cta{align-items:flex-start;flex-direction:column}}@media(max-width:580px){.grid{grid-template-columns:1fr}.article{padding-top:40px}.hub{padding-top:42px}.cta a{width:100%;text-align:center}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}`;
write('public/static-2026.css', staticCss);
write('public/static-2026.js', `(()=>{const prod=['milanaaqui.mx','www.milanaaqui.mx'].includes(location.hostname);if(!prod)return;window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','G-M4819QE19R');const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=G-M4819QE19R';document.head.appendChild(s);if(location.pathname.startsWith('/aprende/'))gtag('event','resource_view',{page_path:location.pathname});})();`);

const head = (title, description, canonical, extra = '') => `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#FBF8F2"><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="https://www.milanaaqui.mx${canonical}"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,500;6..72,600&display=swap" rel="stylesheet"><link rel="stylesheet" href="/static-2026.css"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:type" content="article"><meta property="og:url" content="https://www.milanaaqui.mx${canonical}">${extra}</head><body>`;
const top = `<header class="top"><div class="topin"><a class="brand" href="/"><span class="mark">M</span><span>MiLana</span></a><nav class="nav" aria-label="Principal"><a href="/#calculadoras">Calculadoras</a><a href="/#situaciones">Tu situación</a><a href="/aprende/">Aprende</a><a href="/metodo/">Cómo revisamos</a></nav></div></header>`;
const footer = `<footer class="footer"><div class="wrap footerin"><span>MiLana · Dinero claro para decidir mejor.</span><nav class="footlinks"><a href="/sobre/">Sobre MiLana</a><a href="/metodo/">Cómo revisamos</a><a href="/contacto/">Contacto</a><a href="/privacidad/">Privacidad</a><a href="/financiamiento/">Financiamiento</a></nav></div></footer><script defer src="/static-2026.js"></script></body></html>`;

const articles = [
  {
    slug:'finiquito-vs-liquidacion', tag:'Trabajo', mins:'6 min',
    title:'Finiquito vs. liquidación: qué cambia realmente',
    description:'Entiende la diferencia entre finiquito y liquidación en México, qué conceptos pueden integrar cada pago y qué revisar antes de aceptar una cifra.',
    lede:'Las dos palabras suelen mezclarse, pero responden a preguntas distintas. El finiquito cubre cantidades ya generadas; una liquidación puede sumar indemnizaciones según la forma en que terminó la relación laboral.',
    body:`<h2>Empieza por la causa de la salida</h2><p>Cuando una relación laboral termina, primero hay que separar <strong>lo que ya habías generado</strong> de las cantidades que podrían existir por la forma de terminación. Salarios pendientes, aguinaldo proporcional, vacaciones generadas y prima vacacional pertenecen al primer grupo. Una indemnización por despido puede añadir otros componentes, pero no convierte automáticamente todos los casos en la misma fórmula.</p><h2>Qué suele formar un finiquito</h2><p>El finiquito puede aparecer tanto en una renuncia como en otras formas de terminación porque liquida conceptos pendientes. Para revisarlo conviene tener a la mano tu salario, fecha de ingreso, último día trabajado, días de salario pendientes, vacaciones ya adquiridas que no se pagaron o disfrutaron y las prestaciones que realmente te otorga la empresa.</p><div class="callout"><strong>No uses una sola “regla de tres”.</strong> Aguinaldo, vacaciones, prima vacacional y prima de antigüedad tienen bases y condiciones distintas. MiLana los separa para que puedas comparar cada concepto.</div><h2>Qué cambia en una liquidación</h2><p>En un escenario de despido injustificado para una relación por tiempo indeterminado pueden entrar indemnizaciones además del finiquito. Los tres meses y la prima de antigüedad no deben mezclarse con prestaciones devengadas. El componente de veinte días por año tampoco debe encenderse por defecto: su procedencia depende del supuesto jurídico concreto.</p><h2>Antes de firmar o aceptar un convenio</h2><p>Compara la propuesta por renglones, no solo por el total. Revisa que las fechas sean correctas, que el salario utilizado corresponda, que las prestaciones contractuales estén reflejadas y que no te presenten como automático un concepto que depende del caso. Si hay comisiones, bonos, salario variable o un conflicto sobre la causa de terminación, una calculadora general ya no sustituye la revisión de documentos.</p><div class="cta"><div><strong>¿Quieres ponerle números?</strong><br>Empieza por la herramienta que corresponde a la forma en que terminó tu relación laboral.</div><a href="/situaciones/terminar-relacion-laboral">Ver ruta laboral</a></div>`,
    sources:[['Ley Federal del Trabajo, arts. 48–50','https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf'],['Ley Federal del Trabajo, arts. 76–80, 87 y 162','https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf']]
  },
  {
    slug:'leer-recibo-nomina', tag:'Sueldo', mins:'7 min',
    title:'Cómo leer tu recibo de nómina sin perderte',
    description:'Guía para entender sueldo bruto, ingreso gravable, ISR, SBC, IMSS y neto en un recibo de nómina mexicano.',
    lede:'Bruto, gravable, SBC y neto no son cuatro nombres para la misma cantidad. Entender esa diferencia evita el error más común al revisar una nómina: aplicar todos los descuentos sobre una sola base.',
    body:`<h2>1. El bruto es el punto de partida, no la base de todo</h2><p>Tu percepción bruta reúne los conceptos que aparecen antes de deducciones. Eso no significa que todo el bruto reciba exactamente el mismo tratamiento fiscal o de seguridad social. En una nómina pueden coexistir percepciones gravadas, partes exentas y conceptos que integran de forma distinta al salario base de cotización.</p><h2>2. Para ISR importa el ingreso gravable del periodo</h2><p>La retención mensual de ISR sobre salarios utiliza la tarifa aplicable al periodo y la base gravable correspondiente. No es un porcentaje fijo del sueldo. Por eso una estimación seria debe separar el ingreso que se toma para ISR de otras cifras del recibo y declarar el periodo que está calculando.</p><h2>3. Para IMSS mira el SBC y los días cotizados</h2><p>El <strong>salario base de cotización (SBC)</strong> es una referencia propia de seguridad social. No conviene sustituirlo silenciosamente por el sueldo bruto mensual. Para estimar la cuota obrera también importan los días cotizados y los límites previstos por la ley.</p><div class="callout"><strong>La pregunta útil no es “¿qué porcentaje me descuentan?”.</strong> Es “¿sobre qué base se calculó cada descuento y por qué?”.</div><h2>4. El neto puede incluir más cosas que ISR e IMSS</h2><p>Créditos, pensiones alimenticias, caja de ahorro, préstamos, ausencias, ajustes, prestaciones o deducciones internas pueden modificar el depósito final. Por eso la calculadora Bruto a Neto de MiLana muestra explícitamente “neto después de ISR e IMSS”: es una comparación de esas dos piezas, no una promesa de que coincidirá con todos los recibos.</p><div class="cta"><div><strong>Revisa tus bases por separado.</strong><br>Ten a la mano bruto, ingreso gravable, SBC diario y días cotizados.</div><a href="/calculadoras/bruto-a-neto">Abrir Bruto a Neto</a></div>`,
    sources:[['Ley del Impuesto sobre la Renta, art. 96','https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf'],['Ley del Seguro Social, arts. 27, 28 y 36','https://www.diputados.gob.mx/LeyesBiblio/pdf/LSS.pdf'],['Anexo 8 de la RMF 2026','https://sidof.segob.gob.mx/notas/docFuente/5777219']]
  },
  {
    slug:'aguinaldo-bruto-neto', tag:'Prestaciones', mins:'5 min',
    title:'Aguinaldo bruto y neto: por qué no son la misma cifra',
    description:'Cómo interpretar el aguinaldo bruto, la parte proporcional y el posible efecto del ISR sin confundir prestación con depósito.',
    lede:'Primero calcula la prestación bruta. Después analiza el tratamiento fiscal. Mezclar ambos pasos desde el inicio hace que una cifra aparentemente sencilla se vuelva difícil de comprobar.',
    body:`<h2>La prestación nace en la ley laboral</h2><p>El artículo 87 de la Ley Federal del Trabajo establece el aguinaldo anual y el derecho proporcional cuando no se trabajó el año completo. Si tu contrato o política de prestaciones da más días que el mínimo legal, el cálculo debe usar la prestación real, no reducirla al mínimo.</p><h2>La fecha sí importa</h2><p>Para una parte proporcional necesitas ubicar cuántos días del año correspondieron a la relación laboral dentro del escenario que estás revisando. Una persona que ingresó a mitad de año no genera lo mismo que otra que trabajó el periodo completo, aunque ambas tengan el mismo salario mensual.</p><h2>Bruto no significa depósito final</h2><p>La Ley del Impuesto sobre la Renta prevé un tratamiento fiscal para gratificaciones y una parte puede estar exenta bajo las condiciones aplicables. El excedente y el método de retención pueden hacer que el recibo muestre un neto distinto del bruto. Por eso MiLana mantiene separados el cálculo bruto del aguinaldo y una estimación general de nómina.</p><div class="callout"><strong>Compara primero el bruto.</strong> Si el bruto no coincide, revisa salario, días de prestación y periodo. Solo después tiene sentido explicar una diferencia fiscal.</div><div class="cta"><div><strong>Calcula tu prestación.</strong><br>Usa tu salario, fecha de ingreso y días de aguinaldo reales.</div><a href="/calculadoras/aguinaldo">Abrir Aguinaldo</a></div>`,
    sources:[['Ley Federal del Trabajo, art. 87','https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf'],['Ley del Impuesto sobre la Renta, art. 93','https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf']]
  },
  {
    slug:'vacaciones-prima-vacacional', tag:'Prestaciones', mins:'6 min',
    title:'Vacaciones y prima vacacional: qué revisar según tu antigüedad',
    description:'Entiende los días de vacaciones, el aniversario laboral y la prima vacacional para revisar una prestación en México.',
    lede:'Las vacaciones se entienden mejor por ciclos de antigüedad que por año calendario. Esa diferencia es especialmente importante cuando revisas una salida de la empresa o un saldo pendiente.',
    body:`<h2>El aniversario laboral ordena el cálculo</h2><p>La Ley Federal del Trabajo aumenta el periodo vacacional conforme a la antigüedad. Para saber qué periodo te corresponde conviene ubicar tu fecha de ingreso y los aniversarios cumplidos. En una terminación, la parte proporcional del ciclo vigente no debe confundirse con días ya adquiridos de ciclos anteriores que aún estén pendientes.</p><h2>Vacaciones y prima son conceptos distintos</h2><p>Los días de vacaciones representan descanso pagado. La prima vacacional es una cantidad adicional calculada sobre el salario correspondiente al periodo vacacional. Una cifra de vacaciones sin su prima, cuando esta procede, no cuenta toda la prestación.</p><h2>Tu contrato puede mejorar el mínimo</h2><p>La ley fija mínimos, pero una empresa puede otorgar más días o una prima superior. Si ese es tu caso, usa la prestación contractual para revisar tu situación. Una calculadora que siempre fuerce el mínimo legal puede subestimar lo que realmente te corresponde.</p><div class="callout"><strong>Para una salida laboral separa dos bolsas.</strong> Días ya adquiridos y pendientes, por un lado; proporción del ciclo actual, por otro.</div><div class="cta"><div><strong>¿Cuántos días te corresponden?</strong><br>Comprueba primero tu antigüedad y luego revisa cualquier saldo pendiente.</div><a href="/calculadoras/vacaciones">Abrir Vacaciones</a></div>`,
    sources:[['Ley Federal del Trabajo, arts. 76, 79 y 80','https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf']]
  },
  {
    slug:'resico-ingresos-cobrados', tag:'Impuestos', mins:'6 min',
    title:'RESICO: por qué importa lo efectivamente cobrado',
    description:'Guía para entender la base de ingresos en RESICO personas físicas y por qué facturado, cobrado e IVA no deben mezclarse.',
    lede:'En RESICO no basta con mirar cuánto facturaste. Para el cálculo mensual de personas físicas importa identificar el ingreso efectivamente cobrado dentro del alcance legal del régimen.',
    body:`<h2>Primero confirma que el régimen aplica a tu caso</h2><p>RESICO para personas físicas tiene requisitos de entrada y permanencia. Una calculadora de impuesto no puede decidir por sí sola si puedes tributar ahí. Esa condición depende de tu situación fiscal, tus actividades y los supuestos de exclusión previstos por la ley.</p><h2>Facturar y cobrar pueden ocurrir en momentos distintos</h2><p>El artículo 113-E parte de los ingresos efectivamente cobrados por las actividades comprendidas en el régimen. Si una factura se emitió en un mes y se cobró después, el momento del cobro es una pieza que debes distinguir al preparar el cálculo.</p><h2>No mezcles IVA con la base de ISR</h2><p>La herramienta de MiLana pide ingresos cobrados sin IVA para estimar el ISR del régimen. El IVA tiene su propia mecánica y no debe sumarse como si fuera ingreso sujeto a la tabla de RESICO.</p><div class="callout"><strong>La tasa no es una etiqueta personal.</strong> Depende del nivel de ingresos que se ubica en la tabla legal. Por eso la calculadora aplica la tabla al dato capturado en vez de pedirte elegir una tasa.</div><div class="cta"><div><strong>Estima el ISR del mes.</strong><br>Captura ingresos efectivamente cobrados sin IVA dentro del alcance de la herramienta.</div><a href="/calculadoras/resico">Abrir RESICO</a></div>`,
    sources:[['Ley del Impuesto sobre la Renta, arts. 113-E y siguientes','https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf']]
  },
  {
    slug:'pension-imss-ley-97', tag:'Retiro', mins:'7 min',
    title:'Pensión IMSS Ley 97: qué revisar antes de confiar en una cifra',
    description:'Edad, semanas, régimen y saldo: qué datos revisar antes de interpretar una estimación de pensión IMSS bajo Ley 97.',
    lede:'Una pensión no se explica con una sola multiplicación. Antes de mirar un monto necesitas confirmar régimen, edad, semanas reconocidas y la información real de tu cuenta individual.',
    body:`<h2>Empieza por saber bajo qué reglas estás</h2><p>La fecha de aseguramiento y el régimen aplicable cambian el marco de una pensión. La herramienta de MiLana está acotada a orientación sobre requisitos de Ley 97; no intenta convertir esa orientación en un monto garantizado.</p><h2>Edad y semanas son requisitos, no una promesa de monto</h2><p>La Ley del Seguro Social establece requisitos de edad y semanas para las prestaciones de cesantía y vejez, con reglas transitorias que han cambiado gradualmente. Cumplir un umbral es distinto de saber cuánto recibirás.</p><h2>El monto depende de información que una calculadora pública no tiene</h2><p>El saldo de la cuenta individual, aportaciones, rendimiento, modalidad de pensión y datos oficiales del expediente influyen en el resultado. Inventar una “pensión garantizada” solo con edad y semanas produciría una precisión falsa.</p><div class="callout"><strong>Usa MiLana como lista de comprobación.</strong> Para un monto real, contrasta tus semanas reconocidas y los datos de tu cuenta con los canales oficiales correspondientes.</div><div class="cta"><div><strong>Revisa primero los requisitos.</strong><br>La orientación te dice qué dato debes confirmar antes de proyectar dinero.</div><a href="/calculadoras/pension-imss">Abrir Pensión IMSS</a></div>`,
    sources:[['Ley del Seguro Social, cesantía y vejez','https://www.diputados.gob.mx/LeyesBiblio/pdf/LSS.pdf'],['IMSS','https://www.imss.gob.mx/pensiones']]
  }
];

const articleSchema = (a) => `<script type="application/ld+json">${JSON.stringify({ '@context':'https://schema.org','@type':'Article',headline:a.title,description:a.description,inLanguage:'es-MX',dateModified:'2026-09-14',author:{'@type':'Organization',name:'MiLana'},publisher:{'@type':'Organization',name:'MiLana',url:'https://www.milanaaqui.mx/'},mainEntityOfPage:`https://www.milanaaqui.mx/aprende/${a.slug}/` })}</script>`;
for (const a of articles) {
  const sources = a.sources.map(([name,url]) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a></li>`).join('');
  const html = `${head(`${a.title} | MiLana`, a.description, `/aprende/${a.slug}/`, articleSchema(a))}${top}<main class="wrap"><article class="article"><nav class="crumb"><a href="/">Inicio</a> / <a href="/aprende/">Aprende</a> / ${a.tag}</nav><p class="eyebrow">${a.tag}</p><h1>${a.title}</h1><p class="lede">${a.lede}</p><div class="meta"><span>${a.mins} de lectura</span><span>Revisado el 14 de septiembre de 2026</span></div>${a.body}<section class="sources"><h2>Fuentes para revisar</h2><p>Estas fuentes respaldan el marco general explicado arriba. La calculadora correspondiente publica además su alcance y fecha de comprobación.</p><ul>${sources}</ul></section></article></main>${footer}`;
  write(`public/aprende/${a.slug}/index.html`, html);
}
const cards = articles.map(a => `<a class="card" href="/aprende/${a.slug}/"><span class="tag">${a.tag} · ${a.mins}</span><h2>${a.title}</h2><p>${a.description}</p><span class="more">Leer guía →</span></a>`).join('');
const hubSchema = `<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'CollectionPage',name:'Aprende con MiLana',url:'https://www.milanaaqui.mx/aprende/',inLanguage:'es-MX',hasPart:articles.map(a=>({'@type':'Article',headline:a.title,url:`https://www.milanaaqui.mx/aprende/${a.slug}/`}))})}</script>`;
write('public/aprende/index.html', `${head('Aprende | MiLana','Guías claras para entender sueldo, prestaciones, impuestos y decisiones laborales en México.','/aprende/',hubSchema)}${top}<main class="wrap hub"><header class="hubhead"><p class="eyebrow">Aprende</p><h1>Entiende la cifra antes de decidir.</h1><p class="lede">Guías breves para saber qué significa un resultado, qué dato lo cambia y qué conviene comprobar después.</p></header><section class="grid" aria-label="Guías de MiLana">${cards}</section></main>${footer}`);

const simplePage = (path, title, description, body) => write(path, `${head(`${title} | MiLana`,description,'/'+path.replace(/^public\//,'').replace(/index\.html$/,''))}${top}<main class="wrap"><article class="article"><nav class="crumb"><a href="/">Inicio</a></nav>${body}</article></main>${footer}`);
simplePage('public/sobre/index.html','Sobre MiLana','Qué es MiLana, qué resuelve y cuáles son los límites de sus calculadoras.',`<p class="eyebrow">Sobre MiLana</p><h1>Números que puedas explicar.</h1><p class="lede">MiLana es un proyecto gratuito para entender sueldo, prestaciones e impuestos en México sin esconder la fórmula detrás de una cifra.</p><h2>Qué hacemos</h2><p>Construimos calculadoras con un alcance explícito, explicamos qué significa el resultado y enlazamos las fuentes que sostienen las reglas principales. Cuando una herramienta necesita un dato para no adivinar, lo pide.</p><h2>Qué significa “comprobado”</h2><p>Significa que el cálculo publicado pasó casos de referencia definidos para ese alcance y que las fuentes y la fecha de comprobación están visibles. No significa que MiLana pueda decidir hechos laborales, fiscales o jurídicos que dependen de documentos individuales.</p><h2>Qué no hacemos</h2><p>No vendemos una cifra como resolución oficial, no inventamos testimonios ni credenciales y no guardamos en un servidor propio los salarios o fechas que escribes para calcular. Si tu caso sale del alcance publicado, la herramienta lo dice o pide más información.</p><div class="callout"><strong>La meta del producto es simple.</strong> Que una persona pueda calcular, entender por qué salió esa cifra y saber cuál es el siguiente dato que debe revisar.</div><p><a class="button" href="/#calculadoras">Ver calculadoras</a></p>`);
simplePage('public/metodo/index.html','Cómo revisamos','Método de MiLana para comprobar fuentes, fórmulas, casos de referencia y alcance.',`<p class="eyebrow">Método</p><h1>Cómo revisamos y corregimos.</h1><p class="lede">Una fuente no vuelve correcta una fórmula por sí sola. Por eso separamos evidencia normativa, implementación y casos de referencia.</p><h2>1. Fuente antes que resumen</h2><p>Priorizamos leyes vigentes, DOF, SAT, IMSS, Infonavit, CONASAMI e INEGI. Una fuente secundaria puede ayudar a detectar un problema, pero no reemplaza la fuente primaria cuando esta está disponible.</p><h2>2. Alcance antes que aproximación</h2><p>Si una regla depende de periodo, zona, tipo de relación, base salarial o situación fiscal, la herramienta pide ese dato o limita expresamente el escenario. Evitamos supuestos silenciosos cuando pueden cambiar dinero.</p><h2>3. Casos de referencia</h2><p>Los cambios que afectan resultados pasan por casos normales, bordes y entradas que deben rechazarse. Fechas civiles, topes y condiciones se prueban por separado cuando pueden cambiar el cálculo.</p><h2>4. Publicación</h2><p>Cada calculadora muestra periodo, alcance, fuentes y fecha de comprobación. Las limitaciones forman parte del producto: no se esconden en una nota genérica.</p><div class="callout"><strong>Última comprobación material:</strong> 14 de septiembre de 2026.</div><p><a href="/contacto/">Reportar una corrección</a></p>`);
simplePage('public/contacto/index.html','Contacto y correcciones','Canal público para reportar errores, fuentes desactualizadas y problemas de accesibilidad de MiLana.',`<p class="eyebrow">Contacto</p><h1>Correcciones y reportes.</h1><p class="lede">MiLana mantiene un canal público y trazable para errores de cálculo, fuentes, enlaces y accesibilidad.</p><div class="notice"><strong>Reporta un problema en el repositorio público.</strong> Describe qué herramienta usaste, qué esperabas ver y qué ocurrió. No publiques RFC, CURP, recibos de nómina, domicilios, teléfonos ni otros datos personales.</div><p style="margin-top:24px"><a class="button" href="https://github.com/Angel-Ulises/MiLana/issues/new" target="_blank" rel="noopener noreferrer">Abrir reporte en GitHub</a></p><h2>Qué información ayuda</h2><ul><li>URL o nombre de la calculadora.</li><li>Tipo de problema: cálculo, texto, fuente, enlace o accesibilidad.</li><li>Pasos para reproducirlo usando datos ficticios si hacen falta.</li><li>Fuente oficial que contradice una regla, si aplica.</li></ul><p>Los reportes públicos permiten conservar el historial de la corrección sin exponer un correo personal como canal del proyecto.</p>`);
simplePage('public/financiamiento/index.html','Cómo se financia MiLana','Cómo puede financiarse MiLana y cómo se separan contenido, publicidad y futuras relaciones comerciales.',`<p class="eyebrow">Transparencia</p><h1>Cómo se financia MiLana.</h1><p class="lede">La utilidad de una calculadora no cambia para favorecer a un anunciante o a un producto.</p><h2>Publicidad</h2><p>El sitio puede utilizar servicios publicitarios de Google cuando la cuenta y la plataforma lo permitan. La existencia de publicidad no modifica fórmulas, resultados, fuentes ni el orden de las recomendaciones editoriales.</p><h2>Afiliación</h2><p>MiLana no publica actualmente una recomendación financiera como afiliada sin identificarla. Si en el futuro existe un enlace remunerado, se marcará cerca del enlace y se mantendrá separado del resultado de las calculadoras.</p><h2>Qué no se vende</h2><p>Los valores que escribes en las calculadoras se procesan en tu navegador para obtener el resultado. MiLana no necesita vender salarios, fechas o importes capturados para operar las herramientas.</p><div class="callout"><strong>Regla editorial.</strong> Primero utilidad y evidencia; después, si existe, una relación comercial explícita.</div>`);
simplePage('public/privacidad/index.html','Privacidad','Qué datos procesa MiLana, qué ocurre dentro del navegador y qué servicios externos pueden recibir datos técnicos de uso.',`<p class="eyebrow">Privacidad</p><h1>Qué pasa con tus datos.</h1><p class="lede">Puedes usar las calculadoras sin crear una cuenta. Los salarios, fechas e importes que capturas se procesan en tu navegador para realizar el cálculo.</p><h2>Datos de las calculadoras</h2><p>MiLana no envía a un servidor propio los valores que escribes en los formularios para calcular el resultado. No solicitamos RFC, CURP ni nombre para usar las herramientas.</p><h2>Analítica</h2><p>En producción utilizamos Google Analytics para conocer páginas vistas y eventos generales de uso. La instrumentación de MiLana no envía a Analytics salarios, importes calculados, nombres, RFC o texto libre de los formularios.</p><h2>Publicidad</h2><p>El sitio puede cargar servicios de Google relacionados con publicidad. Esos servicios pueden utilizar cookies u otros identificadores de acuerdo con sus propias políticas y con la configuración del navegador.</p><h2>Enlaces externos</h2><p>Las fuentes oficiales y el canal de reportes abren sitios de terceros. Sus políticas de privacidad son independientes de MiLana.</p><div class="callout"><strong>Última actualización:</strong> 14 de septiembre de 2026.</div><p><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacidad de Google</a> · <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">Preferencias de anuncios</a></p>`);

write('public/404.html', `${head('Página no encontrada | MiLana','La página que buscas no existe o cambió de dirección.','/404.html','<meta name="robots" content="noindex">')}${top}<main class="wrap"><article class="article"><p class="eyebrow">404</p><h1>Esta página no está aquí.</h1><p class="lede">Puedes volver al inicio, abrir las calculadoras o consultar las guías para encontrar lo que necesitas.</p><p><a class="button" href="/">Volver a MiLana</a> &nbsp; <a href="/aprende/">Ver guías</a></p></article></main>${footer}`);

// ---------------------------------------------------------------------------
// 7) Rutas y sitemap: redirects limpios, artículos indexables y sin lastmod
//    ficticio que cambie por recompilar.
// ---------------------------------------------------------------------------
write('vercel.json', JSON.stringify({
  cleanUrls:true,
  trailingSlash:false,
  redirects:[
    { source:'/guias', destination:'/aprende', permanent:true },
    { source:'/guias/aguinaldo-2026', destination:'/aprende/aguinaldo-bruto-neto', permanent:true },
    { source:'/guias/bruto-neto-recibo', destination:'/aprende/leer-recibo-nomina', permanent:true }
  ]
}, null, 2) + '\n');

replaceRe('scripts/generar-paginas.mjs', /function sitemap\(urls, urlsSituacion = \[\]\) \{[\s\S]*?\n\}\n\n\/\*\*/, `function sitemap(urls, urlsSituacion = []) {
  const entrada = (loc, prioridad, frecuencia) =>
    \`  <url>\\n    <loc>\${loc}</loc>\\n    <changefreq>\${frecuencia}</changefreq>\\n    <priority>\${prioridad}</priority>\\n  </url>\`;
  const estaticas = [
    '/aprende',
    '/aprende/finiquito-vs-liquidacion',
    '/aprende/leer-recibo-nomina',
    '/aprende/aguinaldo-bruto-neto',
    '/aprende/vacaciones-prima-vacacional',
    '/aprende/resico-ingresos-cobrados',
    '/aprende/pension-imss-ley-97',
    '/sobre', '/metodo', '/contacto', '/privacidad', '/financiamiento'
  ].map(p => \`\${origen}\${p}\`);
  const cuerpo = [
    entrada(\`\${origen}/\`, '1.0', 'weekly'),
    ...urlsSituacion.map(u => entrada(u, '0.9', 'monthly')),
    ...urls.map(u => entrada(u, '0.9', 'monthly')),
    ...estaticas.map(u => entrada(u, u.includes('/aprende') ? '0.8' : '0.5', 'monthly')),
  ].join('\\n');
  writeFileSync(resolve(DIST, 'sitemap.xml'), \`<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n\${cuerpo}\\n</urlset>\\n\`, 'utf8');
}

/**`, 'función sitemap');
replaceRe('scripts/generar-paginas.mjs', /console\.log\("sitemap\.xml actualizado con " \+ \(urls\.length \+ urlsSituacion\.length \+ 2\) \+ " URLs"\);/, `console.log('sitemap.xml actualizado con calculadoras, situaciones, guías y páginas de confianza');`, 'log sitemap');

// ---------------------------------------------------------------------------
// 8) Pruebas de integridad del producto.
// ---------------------------------------------------------------------------
write('tests/site-integrity.test.mjs', `import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';const r=p=>readFileSync(p,'utf8');test('se publican seis guías editoriales',()=>{for(const s of ['finiquito-vs-liquidacion','leer-recibo-nomina','aguinaldo-bruto-neto','vacaciones-prima-vacacional','resico-ingresos-cobrados','pension-imss-ley-97'])assert.ok(existsSync('public/aprende/'+s+'/index.html'),s)});test('Inicio no declara FAQ invisible ni usa el parche de contenido',()=>{const h=r('index.html');assert.ok(!h.includes('FAQPage'));assert.ok(!h.includes('astra-content-2026.js'));assert.ok(h.includes('WebSite'))});test('el sitemap no fabrica lastmod con cada build',()=>{const s=r('scripts/generar-paginas.mjs');assert.ok(!s.includes('<lastmod>'));assert.ok(s.includes('/aprende/finiquito-vs-liquidacion'))});test('hay canal público de correcciones sin pedir datos personales',()=>{const h=r('public/contacto/index.html');assert.ok(h.includes('/issues/new'));assert.match(h,/No publiques RFC/)});test('la fuente del hero está documentada',()=>{const f=r('assets-master/FUENTES.json');assert.ok(f.includes('6963026'));assert.ok(f.includes('Mikhail Nilov'))});`);

// Ya no se usa el parche de contenido dinámico; se conserva el archivo solo
// hasta que el PR quede validado, pero no se carga en ninguna página.
console.log(`Cierre integral aplicado: ${articles.length} guías, hero nítido, confianza y sitemap.`);
