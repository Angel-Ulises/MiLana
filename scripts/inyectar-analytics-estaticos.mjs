import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIST=resolve('dist');
const SCRIPT='<script defer src="/milana-analytics.js"></script>';
let tocados=0;

function recorrer(dir){
 for(const nombre of readdirSync(dir)){
  const ruta=join(dir,nombre);
  const stat=statSync(ruta);
  if(stat.isDirectory())recorrer(ruta);
  else if(nombre.endsWith('.html'))inyectar(ruta);
 }
}

function inyectar(ruta){
 let html=readFileSync(ruta,'utf8');
 if(html.includes('/milana-analytics.js'))return;
 if(!html.includes('</body>'))throw new Error(`HTML sin </body>: ${ruta}`);
 html=html.replace('</body>',`${SCRIPT}</body>`);
 writeFileSync(ruta,html,'utf8');
 tocados+=1;
}

recorrer(DIST);
console.log(`analytics MiLana: script común inyectado en ${tocados} HTML`);
