#!/usr/bin/env python3
"""Comprueba que cada variante generada corresponda a SU master.

Por que existe: las variantes se llaman igual siempre (finiquito-768.webp),
asi que si un master cambia y solo se regeneran algunos anchos, la misma
calculadora termina sirviendo dos fotos distintas segun el tamano de
pantalla, sin que nada falle. Nos paso: cuatro masters de alta resolucion
fueron sobrescritos por sus versiones viejas de 1000 px al sincronizar el
repo, y quedaron mezcladas.

Compara cada variante contra el master reducido al mismo tamano y mide la
diferencia media por canal. Fotos iguales dan un valor muy bajo aunque
cambie la compresion; fotos distintas se disparan.

    python3 scripts/verificar-imagenes.py
"""

from pathlib import Path
import sys

try:
    from PIL import Image, ImageChops, ImageStat
except ImportError:
    sys.exit("Falta Pillow. Instala con: pip3 install --user pillow")

RAIZ = Path(__file__).resolve().parent.parent
MASTERS = RAIZ / "assets-master"
GEN = RAIZ / "public" / "images" / "gen"

# Por encima de esto la variante ya no es la misma fotografia.
TOLERANCIA = 12.0

COMPARA = (96, 64)


def huella(im):
    return im.convert("RGB").resize(COMPARA, Image.LANCZOS)


def main():
    problemas, revisadas = [], 0

    for master in sorted(MASTERS.glob("*.jpg")):
        with Image.open(master) as im:
            ref = huella(im)

        for variante in sorted(GEN.glob(f"{master.stem}-*")):
            # No confundir "finiquito-768" con "finiquito-movil-768".
            resto = variante.stem[len(master.stem) + 1:]
            if not resto.isdigit():
                continue

            with Image.open(variante) as v:
                dif = ImageChops.difference(ref, huella(v))
            media = sum(ImageStat.Stat(dif).mean) / 3
            revisadas += 1

            if media > TOLERANCIA:
                problemas.append(f"{variante.name}: no corresponde a {master.name} (diferencia {media:.1f})")

    if problemas:
        print("\nVariantes que no corresponden a su master:")
        for p in problemas:
            print(f"  - {p}")
        print("\nRegenera con: python3 scripts/generar-imagenes.py\n")
        sys.exit(1)

    print(f"{revisadas} variantes revisadas: todas corresponden a su master.")


main()
