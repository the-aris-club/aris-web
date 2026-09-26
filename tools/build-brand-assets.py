"""Build the Aris brand asset set from the source logo.

Requires Pillow and numpy, which are not project dependencies because this runs
by hand, not as part of the app build:

    python3 tools/build-brand-assets.py \\
        ~/Downloads/aris-logo.png apps/web/public/brand \\
        apps/web/app ~/Downloads/aris-banner.png

The source PNG has a noisy near-white background (253-255, compression
artefacts) rather than a flat #fff, so this keys on the *minimum* channel with
a tolerance ramp instead of an exact colour match. The logo's two ink colours
are navy #003070 and blue #00A0F0, both far from white, so no solid pixel is
lost; only anti-aliased edge pixels land in the ramp band, which is exactly
where partial alpha belongs.

Edge pixels are decontaminated (colour un-blended from the white backdrop) so
the mark does not grow a white halo when placed on a dark surface.

Three output shapes, deliberately kept separate because they are not
interchangeable:

- lockup: full A + orbit + wordmark, aspect preserved, transparent.
- square: mark only, centred on a transparent square. Favicons and PWA tiles.
- plated: mark only, centred on a solid plate. Apple touch icons, which iOS
  composites on a black or white field and would otherwise render invisible.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

WHITE_CUT = 246  # at or above this the pixel counts as background
INK_CUT = 214  # at or below this the pixel is solid ink
PAD_RATIO = 0.1  # breathing room around the mark in square variants

# Ink row bands measured from the source canvas.
MARK_BAND = (274, 714)
LOCKUP_BAND = (274, 973)
# Those bands are absolute pixel offsets, so a differently sized source would
# crop the wrong rows and still produce a plausible-looking image. Fail loudly
# instead, and re-measure with the row-profile snippet in the commit message.
CANVAS = (1254, 1254)

NAVY = "#003070"
BLUE = "#00A0F0"


def key_out_background(image: Image.Image) -> Image.Image:
    """Turn the noisy near-white backdrop into a soft alpha ramp."""
    rgba = np.asarray(image.convert("RGB")).astype(np.float64)
    minimum = rgba.min(axis=2)

    alpha = np.clip((WHITE_CUT - minimum) / (WHITE_CUT - INK_CUT), 0.0, 1.0)
    a = alpha[..., None]

    # Un-blend the white backdrop out of edge pixels, otherwise every
    # antialiased border keeps a white fringe.
    ink = np.where(a > 0.0, (rgba - (1.0 - a) * 255.0) / np.maximum(a, 1e-6), 0.0)
    ink = np.clip(ink, 0, 255)

    out = np.concatenate([ink, alpha[..., None] * 255.0], axis=2)
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def band(image: Image.Image, y0: int, y1: int) -> Image.Image:
    return image.crop((0, y0, image.width, y1 + 1))


def trim(image: Image.Image) -> Image.Image:
    box = image.split()[3].getbbox()
    return image.crop(box) if box else image


def centre_on_square(
    image: Image.Image, rgb: tuple[int, int, int] | None = None
) -> Image.Image:
    """Centre an image on a square canvas, transparent or on a solid plate."""
    overlay = image.convert("RGBA")
    size = int(max(overlay.size) * (1 + PAD_RATIO * 2))
    fill = (0, 0, 0, 0) if rgb is None else (*rgb, 255)
    canvas = Image.new("RGBA", (size, size), fill)
    canvas.alpha_composite(
        overlay, ((size - overlay.width) // 2, (size - overlay.height) // 2)
    )
    return canvas


def write(
    image: Image.Image, name: str, folder: Path | None = None, **options: object
) -> None:
    path = (folder or OUT) / name
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.suffix == ".webp":
        image.save(path, "WEBP", quality=92, method=6)
    elif path.suffix in {".jpg", ".jpeg"}:
        image.convert("RGB").save(
            path, "JPEG", quality=88, optimize=True, progressive=True
        )
    else:
        image.save(path, "PNG", optimize=True)
    print(f"  {name:28} {image.width}x{image.height}  {path.stat().st_size // 1024} KB")


def build_og_image(source: Path) -> Image.Image:
    """Crop the supplied banner to the 1.91:1 Open Graph ratio.

    Letterboxing would look deliberate but wastes a third of a small preview,
    so this fills the frame and biases the crop left, where the lockup and the
    four department icons sit. The lab photography on the right is what gets
    cropped away.
    """
    banner = Image.open(source).convert("RGB")
    return ImageOps.fit(
        banner, (1200, 630), method=Image.LANCZOS, centering=(0.38, 0.5)
    )


def main() -> None:
    global OUT  # noqa: PLW0603
    OUT = Path(sys.argv[2])
    app = Path(sys.argv[3])
    banner = Path(sys.argv[4]) if len(sys.argv) > 4 else None
    OUT.mkdir(parents=True, exist_ok=True)

    source = Image.open(sys.argv[1])
    if source.size != CANVAS:
        raise SystemExit(
            f"source is {source.width}x{source.height}, expected {CANVAS[0]}x{CANVAS[1]}.\n"
            "MARK_BAND and LOCKUP_BAND are absolute pixel offsets and would crop "
            "the wrong rows. Re-measure them before regenerating."
        )

    keyed = key_out_background(source)
    lockup = trim(band(keyed, *LOCKUP_BAND))
    mark = trim(band(keyed, *MARK_BAND))

    print(f"ink navy {NAVY} blue {BLUE}")
    print(f"lockup {lockup.width}x{lockup.height}, mark {mark.width}x{mark.height}")

    print("lockup, aspect preserved, transparent")
    write(lockup, "aris-logo.webp", quality=92, method=6)
    write(lockup, "aris-logo.png", optimize=True)

    wide = lockup.resize(
        (1024, round(lockup.height * 1024 / lockup.width)), Image.LANCZOS
    )
    write(wide, "aris-logo-1024.png", optimize=True)
    write(wide, "aris-logo-1024.webp", quality=92, method=6)

    # The lockup is 4:3, which is too tall for a nav bar. The mark alone is
    # roughly 16:9 and is what belongs in a header, an avatar or a favicon.
    print("mark only, for the nav bar")
    write(mark, "aris-mark.webp", quality=92, method=6)
    write(mark, "aris-mark.png", optimize=True)

    print("app icon, transparent square, mark only")
    icon = centre_on_square(mark).resize((512, 512), Image.LANCZOS)
    write(icon, "icon.png", app, optimize=True)

    print("apple touch icon, plated white because iOS drops transparency")
    plated = centre_on_square(mark, (255, 255, 255)).resize((180, 180), Image.LANCZOS)
    write(plated.convert("RGB"), "apple-touch-icon.png", app, optimize=True)

    if banner is not None:
        print("open graph image, 1200x630 cropped from the banner")
        write(build_og_image(banner), "opengraph-image.jpg", app, quality=88)

    print(f"-> {OUT}\n-> {app}")


OUT: Path

if __name__ == "__main__":
    main()
