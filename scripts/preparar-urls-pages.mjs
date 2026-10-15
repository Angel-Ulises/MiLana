import { prepararUrlsPages } from './cloudflare-pages.mjs';

const reporte = prepararUrlsPages();
console.log(`Pages: ${reporte.canonicas.length} URLs del sitemap servidas como .html sin slash final; ${reporte.moved.length} HTML movidos; ${reporte.redirects} redirects.`);
