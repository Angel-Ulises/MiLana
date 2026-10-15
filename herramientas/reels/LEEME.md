# Reels verticales en segundos

`armar-reel.sh` convierte un video o una imagen en un Reel de 1080×1920 listo para Instagram y Facebook:

- título corto arriba durante todo el clip (máximo 70 caracteres; se parte en líneas solo);
- el contenido completo al centro, sobre una copia difuminada (o llenando la pantalla con `REEL_RECORTE=1`);
- cierre de 2.5 s con «Crédito», el nombre del autor y `milanaaqui.mx`.

```bash
# Video (conserva su audio)
herramientas/reels/armar-reel.sh clip.mp4 "¿Cuánto te queda de aguinaldo?" "Nombre del autor"

# Imagen (8 s por defecto, con audio silencioso para que la plataforma lo acepte)
REEL_SEGUNDOS_IMAGEN=6 herramientas/reels/armar-reel.sh foto.jpg "Inflación de septiembre" "Nombre del autor" reel.mp4
```

Requiere `ffmpeg` (Ubuntu: `sudo apt install ffmpeg`; macOS: `brew install ffmpeg`). Usa Inter Bold si está instalada y si no DejaVu Sans Bold; se puede fijar otra con `REEL_FUENTE=/ruta/fuente.ttf`. Tarda unos segundos por clip.

El título queda a 280 px del borde superior para no quedar debajo de los controles de Instagram. Revisa el crédito antes de publicar: el script escribe exactamente el nombre que recibe.
