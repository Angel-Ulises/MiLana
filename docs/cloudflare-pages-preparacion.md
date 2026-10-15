# URLs canónicas en Cloudflare Pages

MiLana se publica en Cloudflare Pages con el directorio `dist`. Pages responde **308** de `/ruta` a `/ruta/` cuando el HTML está en `ruta/index.html`. El sitemap, los canonical y los enlaces internos usan `/ruta`, sin slash final (`trailingSlash: false` en `vercel.json`). Search Console lo registra como «Page with redirect».

El sitemap en vivo también incluye `/calculadoras`, el índice de las diez calculadoras. El build lo vuelve a emitir para que esa URL quede en el mismo conjunto y responda 200.

## Qué hace el build

`scripts/preparar-urls-pages.mjs` corre después de normalizar las URLs y antes de las auditorías de `dist`:

- Mueve `ruta/index.html` a `ruta.html`. Pages sirve `/ruta` con **200** y redirige `/ruta.html` a `/ruta`.
- Escribe `dist/_redirects`: `/ruta/` y `/ruta/index.html` van a `/ruta` con 308. Las rutas de `vercel.json` (`/guias` y sus guías) van a su destino de Aprende, incluidas las variantes con slash, `.html` e `index.html`.
- Conserva `public/_headers` (noindex sólo en `*.pages.dev`) y añade `nosniff`, `Referrer-Policy` y caché immutable de `/assets/*`. No agrega noindex global.
- Comprueba en disco que cada `<loc>` del sitemap tiene `ruta.html` (o `index.html` en la raíz), que ya no existe `ruta/index.html` y que el canonical es exactamente esa URL.

`scripts/verificar-sitemap-sin-redirect.mjs` cierra el build. Levanta Wrangler Pages `4.149.0` en local, sin cuenta ni despliegue, y pide cada URL del sitemap sin seguir redirects. Falla si alguna no responde 200, si el canonical no coincide, si `/ruta/` o `/ruta.html` no vuelven a `/ruta` en un solo salto, si una heredada de `/guias` no llega a su destino, o si una ruta inexistente no es 404.

## Publicación

El directorio de salida sigue siendo `dist`. El comando de build de Pages tiene que ser `npm run build`, que ya incluye los dos scripts. No cambia el dominio ni el DNS. Esta preparación no se fusiona sola: hay que revisarla antes de dejar que el siguiente despliegue de `main` la publique.
