# MiLana: preparación aislada para Cloudflare Pages

## Alcance

Preparación sobre `da7a24622f67aa5f8876d3c9df00e3dd41856bd2`, head del PR #133. Incluye ese avance sin fusionarlo. No cambia `main`, Vercel, dominio, DNS, fórmulas, contenido, Pensión, AdSense ni datos de usuarios.

El empaquetado usa únicamente assets estáticos. No introduce Functions, Workers, KV, base de datos, servicios de pago, credenciales ni integración GitHub. No hay un comando de despliegue automático en `package.json`.

## Preparación y pruebas reproducibles

1. Usar el runner de CI existente con Node 20 y Chrome. Instalar dependencias igual que `.github/workflows/ci.yml`: `npm install --ignore-scripts --no-audit --no-fund`.
2. Ejecutar `CI=true npm run build:cloudflare`. El build completo mantiene todas las verificaciones existentes; con `CI=true`, no se permite omitir las pruebas de navegador porque Chrome no esté disponible.
3. Revisar `.qa/cloudflare/manifest-preview.json`. Contiene rutas, tamaño, transformación y SHA-256 de cada archivo. El manifiesto permanece fuera de la salida publicada.
4. Usar Node 22 o posterior para Wrangler 4.149.0 (su versión fijada exige Node >=22). Ejecutar localmente `WRANGLER_SEND_METRICS=false npx --yes wrangler@4.149.0 pages dev dist-cloudflare-preview --ip 127.0.0.1 --port 8788 --compatibility-date=2026-10-06`.
5. En otra terminal, ejecutar `npm run verify:cloudflare -- http://127.0.0.1:8788`. Comprueba todas las rutas, redirects con query, canonical, 404 real, headers, caché y bytes de archivos públicos esenciales.
6. Repetir el verificador HTTP con la URL de un preview `.pages.dev` autorizado. El servidor local de Wrangler no sustituye la comprobación del despliegue real.
7. En el preview final verificar navegación, búsqueda, calculadoras, guardados y práctica progresiva en escritorio y móvil. Los tests existentes deben volver a pasar en el commit final; resultados históricos del PR #133 no son resultados de este cambio.

`npm run package:cloudflare` sólo empaqueta un `dist` ya generado. No significa que ese `dist` haya aprobado las pruebas. Las dependencias heredadas usan rangos y el repo no tenía lockfile: guardar sus versiones en el registro de la ejecución; no prometer builds binariamente idénticos de instalaciones futuras.

## Adaptación de rutas

El generador actual produce `/ruta/index.html`, pero sus URLs canónicas son `/ruta`. Pages normaliza directorios a `/ruta/`; por ello el empaquetado transforma sólo su copia a `/ruta.html`, que Pages sirve como `/ruta`.

- Conserva los bytes de todos los HTML y assets.
- Mantiene `index.html` en raíz, `404.html`, `robots.txt`, `ads.txt` y `sitemap.xml`.
- Agrega redirects exactos de `/ruta/` y `/ruta/index.html` a `/ruta`.
- Traduce las tres redirecciones heredadas de `vercel.json`, incluidas sus variantes, directamente al destino final.
- No agrega un rewrite global de SPA. Las rutas inexistentes deben responder HTTP 404.
- Falla si hay colisiones, configuración Pages previa, symlinks, más de 20,000 archivos o un archivo mayor de 25 MiB.

## Indexación, seguridad y privacidad

`dist-cloudflare-preview` lleva `X-Robots-Tag: noindex, nofollow, noarchive` global. Conservar canonicals y sitemap en `https://www.milanaaqui.mx`. Noindex es una instrucción a buscadores, no una contraseña: una URL de preview sigue siendo pública.

Los headers `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` y caché immutable sólo bajo `/assets/*` conservan el contrato de Vercel. Los cargadores actuales de AdSense/GA4 ya comprueban el hostname de producción; no se alteran para esta preparación.

El modo opcional `node scripts/preparar-cloudflare.mjs --production` prepara otra carpeta independiente y elimina el noindex global, manteniéndolo en los hosts `.pages.dev`. Es sólo empaquetado local; requiere revisión antes de cualquier uso futuro. **Nunca subir la carpeta preview al dominio de producción.**

Los guardados actuales se quedan en el navegador y origen existentes. Una prueba en otro hostname no hereda localStorage de producción. No se exportan ni trasladan datos de usuarios durante esta preparación.

## Direct Upload y límite de autoridad

El plan gratuito de Pages sirve assets estáticos sin cargo por solicitudes y admite 20,000 archivos, 25 MiB por archivo y 500 builds/mes. Drag-and-drop del dashboard admite 1,000 archivos; verificar el manifiesto final. Los términos y límites pueden cambiar.

Direct Upload permite subir una carpeta/ZIP precompilado y evita conceder acceso persistente de GitHub. El proyecto creado de esta forma no se convierte después en uno de integración Git; se puede seguir con cargas directas o crear otro proyecto cuando se autorice.

Antes de una publicación de prueba: confirmar acceso a la cuenta correcta, modalidad gratuita, nombre de proyecto aislado, noindex y ausencia de funciones/pagos. Detenerse ante nuevos permisos OAuth, tokens, instalación de GitHub App o términos que pidan aceptación explícita. No modificar el dominio ni DNS. No publicar nuevas ramas que disparen previews Vercel. `chatgpt/*` está excluido por el `vercel.json` actual; verificarlo otra vez antes de cualquier push autorizado.

El cambio posterior de hosting exige una decisión separada. Debe incluir comprobación de dominios www/apex, TTL y redirecciones, prueba real y plan de reversión conservando Vercel; este trabajo no lo ejecuta.

## Fuentes oficiales consultadas

- [Serving Pages, URLs y 404](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- [Headers](https://developers.cloudflare.com/pages/configuration/headers/)
- [Redirects](https://developers.cloudflare.com/pages/configuration/redirects/)
- [Previews e indexación](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Límites](https://developers.cloudflare.com/pages/platform/limits/)
- [Precio de assets estáticos y Functions](https://developers.cloudflare.com/pages/functions/pricing/)
- [Pruebas locales con Wrangler](https://developers.cloudflare.com/pages/functions/local-development/)
