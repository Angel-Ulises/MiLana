#!/usr/bin/env python3
"""Genera las variantes responsivas de cada imagen a partir de su master.

Por que existe: los heroes se veian suaves/borrosos porque el navegador
recibia SIEMPRE un JPG de 1000x667 y lo escalaba hacia arriba en pantallas
retina. Aqui se generan varios anchos en WebP (mucho mas eficiente) y en JPEG
como respaldo, para que <picture srcset> entregue a cada pantalla la
resolucion que le toca y no haya que estirar nada.

Los masters viven en assets-master/ y NUNCA se recomprimen: son la fuente.
Si un master mide menos que un ancho objetivo, ese ancho se omite (ampliar
no crea detalle, solo peso).

    python3 scripts/generar-imagenes.py
"""

from pathlib import Path
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Falta Pillow. Instala con: pip3 install --user pillow")

RAIZ = Path(__file__).resolve().parent.parent
MASTERS = RAIZ / "assets-master"
SALIDA = RAIZ / "public" / "images" / "gen"

# Anchos objetivo. El hero ocupa hasta 64vw en escritorio, asi que en una
# pantalla retina de 1440 CSS px necesita ~1840 px reales; 2400 cubre 4K.
ANCHOS = [480, 768, 1024, 1440, 1920, 2400]

# Los masters que terminan en -movil son los verticales originales y solo se
# usan en pantallas de hasta 640 CSS px. Ni con densidad 3x pasan de ~1300 px
# fisicos, asi que generar 1920 o 2400 seria publicar archivos enormes que
# nadie descarga: en vertical, 2400 de ancho son 3600 de alto.
ANCHOS_MOVIL = [480, 768, 1024, 1440]

CALIDAD_WEBP = 82
CALIDAD_JPEG = 86


def generar(master: Path) -> list:
    with Image.open(master) as im:
        im = im.convert("RGB")
        ancho_master = im.width
        hechas = []
        # El ancho nativo se publica SOLO cuando el master se queda corto: si
        # mide menos que el mayor ancho objetivo, generarlo evita tirar
        # resolucion. Pero con masters de 6000 px publicar el nativo metia al
        # srcset variantes de varios MB que ninguna pantalla necesita y que un
        # navegador podria llegar a descargar. Por encima de 2400 px no hay
        # ganancia visible ni en 4K, asi que ahi se corta.
        anchos = ANCHOS_MOVIL if master.stem.endswith("-movil") else ANCHOS
        objetivos = sorted({a for a in anchos if a <= ancho_master})
        if ancho_master < max(anchos):
            objetivos = sorted(set(objetivos) | {ancho_master})
        for ancho in objetivos:
            if ancho > ancho_master:
                continue  # ampliar no recupera detalle
            alto = round(im.height * ancho / ancho_master)
            escalada = im.resize((ancho, alto), Image.LANCZOS)
            base = SALIDA / f"{master.stem}-{ancho}"
            escalada.save(base.with_suffix(".webp"), "WEBP", quality=CALIDAD_WEBP, method=6)
            escalada.save(base.with_suffix(".jpg"), "JPEG", quality=CALIDAD_JPEG,
                          optimize=True, progressive=True)
            hechas.append(ancho)
        # Si el master es mas chico que el ancho minimo, al menos publicarlo tal cual.
        if not hechas:
            base = SALIDA / f"{master.stem}-{ancho_master}"
            im.save(base.with_suffix(".webp"), "WEBP", quality=CALIDAD_WEBP, method=6)
            im.save(base.with_suffix(".jpg"), "JPEG", quality=CALIDAD_JPEG, optimize=True)
            hechas.append(ancho_master)
    return hechas


def main() -> int:
    if not MASTERS.exists():
        sys.exit(f"No existe {MASTERS}. Ahi van las imagenes originales sin comprimir.")
    SALIDA.mkdir(parents=True, exist_ok=True)

    archivos = sorted(p for p in MASTERS.iterdir()
                      if p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"))
    if not archivos:
        sys.exit(f"No hay imagenes en {MASTERS}.")

    for master in archivos:
        with Image.open(master) as im:
            tam = im.size
        anchos = generar(master)
        aviso = "" if tam[0] >= 2400 else "   <-- master por debajo de 2400 px: pedir uno mayor"
        print(f"{master.name:34} master {tam[0]}x{tam[1]}  ->  {anchos}{aviso}")

    print(f"\nListo. Variantes en {SALIDA.relative_to(RAIZ)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
