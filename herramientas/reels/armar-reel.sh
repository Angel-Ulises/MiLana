#!/usr/bin/env bash
# Arma un Reel vertical (1080×1920, H.264 + AAC) a partir de un video o una imagen:
# título corto arriba durante todo el clip y un cierre con el crédito del autor.
#
# Uso:
#   herramientas/reels/armar-reel.sh ENTRADA "Título corto" "Autor" [salida.mp4]
#
# Variables opcionales:
#   REEL_SEGUNDOS_IMAGEN=8   duración si la entrada es una imagen
#   REEL_CIERRE=2.5          segundos del cierre con crédito
#   REEL_RECORTE=1           llena la pantalla recortando en vez de usar fondo difuminado
#   REEL_FIRMA="milanaaqui.mx"  segunda línea del cierre (vacía para omitirla)
#   REEL_FUENTE=/ruta/fuente.ttf  fuente para los textos (por defecto Inter Bold o DejaVu Sans Bold)
set -euo pipefail

if [[ $# -lt 3 ]]; then
  sed -n '2,15p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
fi

ENTRADA=$1
TITULO=$2
AUTOR=$3
SALIDA=${4:-"${ENTRADA%.*}-reel.mp4"}
SEG_IMAGEN=${REEL_SEGUNDOS_IMAGEN:-8}
CIERRE=${REEL_CIERRE:-2.5}
FIRMA=${REEL_FIRMA-milanaaqui.mx}

command -v ffmpeg >/dev/null || { echo "Falta ffmpeg (sudo apt install ffmpeg / brew install ffmpeg)" >&2; exit 1; }
[[ -f $ENTRADA ]] || { echo "No existe: $ENTRADA" >&2; exit 1; }
[[ ${#TITULO} -le 70 ]] || { echo "El título tiene ${#TITULO} caracteres; usa 70 o menos para que se lea en el celular." >&2; exit 1; }

fuente() {
  if [[ -n ${REEL_FUENTE:-} ]]; then echo "$REEL_FUENTE"; return; fi
  local f
  for patron in 'Inter:style=Bold' 'DejaVu Sans:style=Bold' 'Arial:style=Bold'; do
    f=$(fc-match -f '%{file}' "$patron" 2>/dev/null || true)
    [[ -n $f && -f $f ]] && { echo "$f"; return; }
  done
  echo "No encontré una fuente; define REEL_FUENTE=/ruta/fuente.ttf" >&2; exit 1
}
FUENTE=$(fuente)

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
# Los textos van en archivos: así comillas, dos puntos y acentos no rompen el filtro de FFmpeg.
printf '%s' "$TITULO" | fold -s -w 22 | sed 's/[[:space:]]*$//' > "$TMP/titulo.txt"
printf '%s' "$AUTOR" > "$TMP/autor.txt"
printf '%s' "$FIRMA" > "$TMP/firma.txt"

es_imagen=0
case "${ENTRADA,,}" in *.jpg|*.jpeg|*.png|*.webp) es_imagen=1 ;; esac

if [[ $es_imagen == 1 ]]; then
  ENTRADAS=(-loop 1 -t "$SEG_IMAGEN" -framerate 30 -i "$ENTRADA")
  AUDIO_PRINCIPAL="anullsrc=r=48000:cl=stereo,atrim=0:${SEG_IMAGEN}[a0]"
else
  ENTRADAS=(-i "$ENTRADA")
  if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$ENTRADA" | grep -q .; then
    AUDIO_PRINCIPAL="[0:a]aresample=48000,aformat=channel_layouts=stereo[a0]"
  else
    DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$ENTRADA")
    AUDIO_PRINCIPAL="anullsrc=r=48000:cl=stereo,atrim=0:${DUR}[a0]"
  fi
fi

if [[ ${REEL_RECORTE:-0} == 1 ]]; then
  ENCUADRE="[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[base]"
else
  # Contenido completo al centro sobre una copia difuminada: no se corta nada de la imagen original.
  ENCUADRE="[0:v]split[f][c];[f]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30:2,eq=brightness=-0.12[fondo];[c]scale=1080:1920:force_original_aspect_ratio=decrease[centro];[fondo][centro]overlay=(W-w)/2:(H-h)/2,setsar=1,fps=30[base]"
fi

TEXTO="fontfile='${FUENTE}'"
FILTRO="${ENCUADRE};
[base]drawtext=${TEXTO}:textfile='${TMP}/titulo.txt':fontsize=76:line_spacing=14:fontcolor=white:box=1:boxcolor=0x13263B@0.82:boxborderw=34:x=(w-text_w)/2:y=280,format=yuv420p[v0];
color=c=0x13263B:s=1080x1920:r=30:d=${CIERRE},drawtext=${TEXTO}:text='Crédito':fontsize=40:fontcolor=0x9FC3E6:x=(w-text_w)/2:y=(h/2)-130,drawtext=${TEXTO}:textfile='${TMP}/autor.txt':fontsize=64:fontcolor=white:x=(w-text_w)/2:y=(h/2)-60,drawtext=${TEXTO}:textfile='${TMP}/firma.txt':fontsize=42:fontcolor=0xFBF8F2:x=(w-text_w)/2:y=(h/2)+70,format=yuv420p,setsar=1[v1];
${AUDIO_PRINCIPAL};
anullsrc=r=48000:cl=stereo,atrim=0:${CIERRE}[a1];
[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]"

ffmpeg -hide_banner -loglevel error -y "${ENTRADAS[@]}" -filter_complex "$FILTRO" -map '[v]' -map '[a]' \
  -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -profile:v high -level 4.1 \
  -c:a aac -b:a 160k -ar 48000 -movflags +faststart "$SALIDA"

echo "Reel listo: $SALIDA ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SALIDA" | cut -d. -f1) s, 1080×1920)"
