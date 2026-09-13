# Contexto de MiLana

Este archivo existe para que una sesión nueva no arranque en blanco. Resume
en qué estado está el proyecto, qué decisiones ya se tomaron y por qué, y
dónde están las trampas que ya nos costaron tiempo.

Última actualización: 13 de septiembre de 2026.

---

## Qué es MiLana

Sitio de calculadoras financieras y fiscales para México: `milanaaqui.mx`
(sirve en `www.milanaaqui.mx`, ver "Trampas"). Vite + React, desplegado en
Vercel, repositorio `Angel-Ulises/MiLana`.

La tesis del producto, definida por Ulises y ChatGPT, es que MiLana **no es
un sitio de calculadoras**: es un sitio de decisiones que usa calculadoras
como herramienta. Esa frase explica casi todas las decisiones de
arquitectura de abajo.

## Cómo se reparte el trabajo

Esto es una regla del dueño del proyecto, no una preferencia negociable:

- **ChatGPT decide el 100% de lo visual.** Estética, encuadre, tipografía,
  color, composición, qué foto va dónde. Entrega valores concretos y CSS.
- **Claude hace la programación.** Implementa lo que ChatGPT especifica,
  **sin interpretar**. Si una decisión visual es ambigua, se le pregunta a
  ChatGPT en vez de resolverla por cuenta propia.

El motivo es concreto: en intentos anteriores, Claude pedía a ChatGPT que
describiera lo que quería y luego lo interpretaba, y el resultado era
consistentemente peor de lo especificado. Por eso ahora ChatGPT entrega
valores exactos y Claude los aplica tal cual.

Claude sí decide, y debe decidir, todo lo técnico: estructura, rendimiento,
SEO, accesibilidad, validaciones, pruebas.

## Reglas permanentes del dueño

- Ninguna IA maneja credenciales ni pagos. Él autentica todo personalmente.
- No se guardan secretos en archivos ni en memoria.
- Nada se publica en ninguna red social sin su aprobación explícita, una por
  una.
- Nunca se publica en su perfil personal de Facebook, solo en páginas de
  marca.
- Su nombre real no debe aparecer públicamente en MiLana.
- Los comandos se le entregan **completos y armados**, con las rutas reales
  ya puestas. No edita comandos.

---

## Arquitectura

### Rutas reales, no estado interno

Cada calculadora y cada situación tiene su propia URL indexable, servida
como HTML estático real generado en el build:

- `/calculadoras/<slug>` — las 10 calculadoras
- `/situaciones/<slug>` — las 3 rutas de decisión

`scripts/generar-paginas.mjs` corre después de `vite build` y emite cada
HTML con su `title`, `description`, `canonical`, Open Graph y JSON-LD ya
escritos, sin depender de que el rastreador ejecute JavaScript. También
regenera `sitemap.xml` (15 URLs).

`App.jsx` solo traduce ruta ↔ contenido; los 13 HTML cargan el mismo bundle.

### Archivos de datos: dónde vive cada cosa

| Archivo | Qué contiene | Quién lo escribe |
|---|---|---|
| `src/data/paginas.json` | Slugs y metadata SEO de las 10 calculadoras | Claude |
| `src/data/contenido-calculadoras.json` | El contenido editorial de cada calculadora | ChatGPT |
| `src/data/situaciones.json` | Las 3 rutas de decisión completas | ChatGPT (redacción) |
| `src/data/fotos.json` | Punto focal y fuente móvil de cada foto | ChatGPT (valores) |
| `src/data/articulos.json` | Los 10 mini-artículos | ChatGPT |
| `src/data/regulatory-data.json` | Tarifas, tasas, UMA, salario mínimo, semanas | Claude |
| `assets-master/FUENTES.json` | Procedencia y licencia de cada fotografía | Claude |

**Regla dura:** ninguna cifra que cambie cada año va en el texto editorial.
Tarifas, UMA, salario mínimo, límite de PTU, semanas de pensión: todo eso
vive en `regulatory-data.json`. El texto explica la mecánica y el
fundamento, nunca congela números.

### Estructura de una página de calculadora

Orden fijo, definido por ChatGPT:

1. Breadcrumb
2. Icono + categoría + H1 + propósito → todo esto es el encabezado
3. Fotografía, integrada en ese mismo encabezado
4. La calculadora
5. Cómo leer tu resultado, qué significa, cómo se calcula, supuestos y
   límites, fundamento y fuentes, preguntas frecuentes, qué revisar después

El propósito **no** es un bloque suelto: forma parte del encabezado. El H1,
el propósito y el formulario comparten el mismo eje izquierdo.

### Fotografía

11 fotos de Pexels, elegidas por ChatGPT contra un brief propio
(documental, sin marcas ni pantallas legibles, sin billetes ni playas
genéricas). Cinco venían en vertical y ChatGPT dictó el recorte a 3:2 foto
por foto; los verticales originales se conservan porque cuatro se
reaprovechan en móvil.

- `assets-master/` — los masters. **No se versionan** (40 MB). Se
  reconstruyen desde `FUENTES.json`.
- `public/images/gen/` — las variantes: 480, 768, 1024, 1440, 1920 y 2400 px
  en WebP y JPEG. Los masters `-movil` se cortan en 1440.
- `npm run imagenes` regenera todo.
- `python3 scripts/verificar-imagenes.py` comprueba que cada variante
  corresponda a su master. **Correrlo siempre después de regenerar.**

---

## Trampas conocidas

Cada una de estas ya costó tiempo. Vale la pena leerlas antes de tocar nada.

### El dominio sirve en `www`

`milanaaqui.mx` redirige a `www.milanaaqui.mx`. Durante un tiempo todos los
canonical, el Open Graph, el sitemap y el robots.txt declaraban la versión
sin `www`: le decíamos a Google que la URL buena es una que redirige a otra
parte. Ya está unificado en `www`. **Cualquier URL nueva debe usar `www`.**

### Masters viejos sobrescribiendo a los nuevos

`assets-master/aguinaldo.jpg`, `finiquito.jpg`, `inicio.jpg` e `isr.jpg`
estuvieron versionados con su versión vieja de 1000 px. Al sincronizar el
repo, sobrescribían a los masters nuevos de alta resolución; al regenerar
después, los anchos 480 y 768 salían de la foto vieja y de 1024 en adelante
de la nueva. La misma calculadora servía **dos fotografías distintas según
el tamaño de pantalla**, y nada fallaba. Por eso existe
`verificar-imagenes.py`.

### El srcset tiene que pedir lo que el master puede dar

Las fotos se veían suaves por dos razones simultáneas: los masters eran de
1000 px **y** `ANCHOS_IMAGEN` en `App.jsx` tampoco pedía más de 1000. Si se
cambia la lista de anchos en `generar-imagenes.py`, hay que cambiarla
también en `App.jsx`.

Además, el atributo `sizes` debe describir el ancho **real medido**, no el
que uno supone. El hero decía 64vw cuando en móvil ocupa 102vw.

### El cuerpo que sirve el servidor no puede ir vacío

Las rutas de situación incluyen su contenido como HTML estático dentro de
`#root`, que React sustituye al montar. Sin eso, un rastreador que no
ejecuta JavaScript veía una página vacía — justo lo contrario de lo que
necesita AdSense. **Las páginas de calculadora todavía no tienen ese
respaldo; sería una mejora pendiente.**

### El build falla a propósito si el contenido está mal

`generar-paginas.mjs` valida `contenido-calculadoras.json` antes de generar
nada: claves faltantes, secciones demasiado cortas, enlaces a destinos que
no existen. Como ese archivo llega por lotes desde ChatGPT, el error típico
es semántico y antes llegaba a producción sin avisar.

---

## Estado actual

Terminado y en producción:

- Inicio rediseñado con Hero V2.
- URLs reales e indexables para las 10 calculadoras.
- Contenido editorial completo en las 10, cada una con su `FAQPage`.
- Las 3 rutas de decisión en `/situaciones`.
- Las 11 fotografías, con sus variantes y sus puntos focales.
- Canonical, sitemap y robots unificados en `www`.

Pendiente y depende de Ulises:

- **Salir de Vercel Hobby antes de activar AdSense.** Los términos de Hobby
  lo limitan a uso personal o no comercial. ChatGPT lo marcó como condición
  previa a monetizar y sugirió evaluar Cloudflare Pages.
- **Volver a pedir revisión de AdSense**, pero solo después de lo anterior.
- **Dar de alta el sitio en Search Console** y enviar el sitemap.

Pendiente técnico:

- Respaldo estático en el `#root` de las páginas de calculadora, como el que
  ya tienen las situaciones.
- Quedan archivos sueltos en la raíz del repo (`App.jsx`,
  `generar-paginas.mjs`, `paginas.json`, `contenido-calculadoras.json`) de
  una subida que se aplanó. No rompen nada, pero confunden: el sitio usa los
  de `src/` y `scripts/`.

Siguiente fase según el plan de ChatGPT (Fase 8 de su numeración): pasar de
calcular a decidir — comparar escenarios, interpretar el resultado señalando
qué variable lo mueve más, siguiente paso concreto, checklist de documentos,
guardar escenarios en `localStorage` sin cuentas.

---

## Comandos

```bash
npm install
npm run dev        # desarrollo
npm run build      # build + genera las 13 páginas + sitemap
npm run imagenes   # regenera las variantes desde assets-master/
python3 scripts/verificar-imagenes.py   # comprueba variantes vs master
```

Para verificar cambios visuales se usa Playwright contra el `dist/`
construido, midiendo posiciones y tamaños reales en varias combinaciones de
viewport y densidad de píxel. No basta con mirar una captura.
