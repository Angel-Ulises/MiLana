# Portada disponible durante el arranque

## Problema y alcance

La captura muestra `Cargando contenido…` entre el encabezado y la portada final.
No prueba un bloqueo infinito. El arranque anterior montaba el fallback de
`React.Suspense` mientras descargaba `App`, después de descargar y ejecutar la
entrada común. Además, el HTML editorial previo estaba oculto con `html.js`.

El arreglo afecta el arranque de `/`. Mantiene el reparto de módulos por ruta y
no modifica calculadoras, fórmulas, Pensión, fuentes de confianza ni AdSense.
No incorpora los cambios de experiencia de la PR #131.

## Solución

- El build renderiza el hero del mismo `App` que se publica. No mantiene una
  segunda copia de los textos, seis destinos o fotografía.
- El HTML inicial ya contiene el título, las tres rutas principales y las otras
  tres en un desplegable nativo. Conserva el contenido SEO y sus enlaces.
- Inicio adelanta la descarga de `App` con un `modulepreload` de su hash real;
  no añade esa descarga a Finanzas, Carreras, Estados u otras áreas.
- No se vacía `#root` hasta que `App` está listo. Un módulo lento conserva
  contenido navegable, no una pantalla de espera ni un fondo vacío.
- Si la importación falla, permanece la portada y aparece un reintento manual
  que recarga el HTML y sus hashes. No hay bucles de recarga automáticos.
- La apertura del desplegable y el foco se conservan al montar React.

## Verificación

`npm run build` ejecuta la suite, presupuesto de entrada, generadores, controles
visuales, reservas, enlaces, grafo y SEO. El Chrome local del entorno de edición
está restringido por su sandbox; esos controles deben pasar en Chrome real del
runner oficial de CI, sin relajar restricciones locales.

`node --experimental-websocket scripts/verificar-arranque.mjs` comprueba el build
real y guarda capturas y métricas en el artifact `arranque-qa-*`:

1. Fixture de HTML anterior con App retenido: reproduce el fallback original.
2. Entrada JavaScript retenida: el hero ya es visible antes de ejecutar React.
3. App retenido con caché fría, latencia de 150 ms, 750 KB/s y CPU 4x.
4. Pantalla de 414 px y escritorio de 1440 px, además de móvil de 390 px.
5. App responde 503: enlaces conservados, aviso y reintento recuperable.
6. Navegación fuera, Atrás, Adelante y restauración BFCache real.

Todas las pruebas bloquean las fuentes externas para comprobar su fallback.
El muestreo por frame detecta la pantalla de carga o un título que desaparece.
Se compara la posición del título y de la primera opción antes y después del
montaje; no se presentan estos tiempos controlados como mediciones de producción.

## Límites

Esto no elimina el tiempo necesario para descargar CSS/HTML ni reemplaza las
pruebas en el teléfono concreto. Las áreas distintas de Inicio conservan su
comportamiento de carga separado. Publicar exige aprobación de despliegue.
