"""Build the Aris brand asset set from the source logo.

Requires Pillow and numpy, which are not project dependencies because this runs
by hand, not as part of the app build:

    python3 tools/build-brand-assets.py \\
        ~/Downloads/aris-logo.png apps/web/public/brand \\
        apps/web/app ~/Downloads/aris-banner.png

Two source shapes are handled, because the artwork has been delivered both ways:

- Already transparent (RGBA with a transparent border). Used as-is. This is the
  current source.
- Opaque on a noisy near-white backdrop, 253-255 with compression artefacts
  rather than a flat #fff. Keyed out on the *minimum* channel with a tolerance
  ramp, and the edge pixels un-blended from the white so the mark does not grow
  a halo on dark surfaces.

The mark and the wordmark are separated by measuring rows of ink, so the script
survives a resize or a re-crop of the source instead of silently slicing the
wrong rows out of a new logo.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

WHITE_CUT = 246  # at or above this the pixel counts as background
INK_CUT = 214  # at or below this the pixel is solid ink
PAD_RATIO = 0.1  # breathing room around the mark in square variants
MIN_BAND = 3  # rows; ignores 1-2px speckle when finding gaps

NAVY = "#003070"
BLUE = "#00A0F0"


def already_transparent(image: Image.Image) -> bool:
    alpha = np.asarray(image.convert("RGBA"))[..., 3]
    return bool(alpha.min() == 0)


def key_out_background(image: Image.Image) -> Image.Image:
    """Turn a noisy near-white backdrop into a soft alpha ramp."""
    rgb = np.asarray(image.convert("RGB")).astype(np.float64)
    minimum = rgb.min(axis=2)

    alpha = np.clip((WHITE_CUT - minimum) / (WHITE_CUT - INK_CUT), 0.0, 1.0)
    a = alpha[..., None]

    ink = np.where(a > 0.0, (rgb - (1.0 - a) * 255.0) / np.maximum(a, 1e-6), 0.0)
    out = np.concatenate([np.clip(ink, 0, 255), alpha[..., None] * 255.0], axis=2)
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def ink_bands(image: Image.Image) -> list[tuple[int, int]]:
    """Contiguous vertical runs of ink, measured on the alpha channel."""
    alpha = np.asarray(image.convert("RGBA"))[..., 3]
    rows = (alpha > 32).sum(axis=1)

    bands: list[tuple[int, int]] = []
    start: int | None = None
    for y, count in enumerate(rows):
        if count > 0 and start is None:
            start = y
        elif count == 0 and start is not None:
            if y - start >= MIN_BAND:
                bands.append((start, y - 1))
            start = None
    if start is not None and len(rows) - start >= MIN_BAND:
        bands.append((start, len(rows) - 1))
    return bands


def crop_band(image: Image.Image, band: tuple[int, int]) -> Image.Image:
    return image.crop((0, band[0], image.width, band[1] + 1))


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


def build_hero(source: Path) -> Image.Image:
    """Take the banner's right-hand lab scene, with no text and no lockup.

    The banner is a finished marketing piece: it carries its own logo and its
    own headline, so using it whole as a hero background puts the club's wordmark
    underneath the page headline. Cropping to the lab scene gives a background
    with room for text and no competing typography. The hero is already faded and
    blurred by the page, so the upscale is not visible.
    """
    banner = Image.open(source).convert("RGB")
    box = (1400, 0, banner.width, banner.height)
    return banner.crop(box)


OUT: Path


def main() -> None:
    global OUT  # noqa: PLW0603
    OUT = Path(sys.argv[2])
    app = Path(sys.argv[3])
    banner = Path(sys.argv[4]) if len(sys.argv) > 4 else None
    OUT.mkdir(parents=True, exist_ok=True)

    source = Image.open(sys.argv[1])
    keyed = source.convert("RGBA")
    if already_transparent(source):
        print("source already transparent, used as-is")
    else:
        print("source is opaque, keying out the near-white backdrop")
        keyed = key_out_background(source)

    bands = ink_bands(keyed)
    if len(bands) < 2:
        raise SystemExit(
            f"expected a mark band and a wordmark band, measured {bands}. "
            "The lockup layout probably changed; split the artwork by hand."
        )
    mark_band, wordmark_band = bands[0], bands[-1]
    print(f"ink bands {bands}")

    lockup = trim(keyed)
    mark = trim(crop_band(keyed, mark_band))
    print(
        f"ink navy {NAVY} blue {BLUE}\n"
        f"mark band {mark_band}, wordmark band {wordmark_band}\n"
        f"lockup {lockup.width}x{lockup.height}, mark {mark.width}x{mark.height}"
    )

    print("lockup, aspect preserved, transparent")
    write(lockup, "aris-logo.webp", quality=92, method=6)
    write(lockup, "aris-logo.png", optimize=True)

    # No upscaled variant. The current source is a 500px canvas, so the artwork
    # is only ~370px wide and a 1024px copy would be soft and 380 KB of it.
    # Structured data only needs something comfortably above 112px.
    if lockup.width < 512:
        print(f"  (skipping upscale, source artwork is only {lockup.width}px)")

    # The lockup is roughly 4:3 and too tall for a nav bar, so the mark alone
    # ships separately at about 16:9.
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
        # Full-bleed copy for the mid-page image block.
        write(Image.open(banner).convert("RGB"), "aris-banner.webp", quality=88)
        # Text-free lab scene for the hero, which carries the page headline.
        write(build_hero(banner), "aris-hero.webp", quality=88)

    print(f"-> {OUT}\n-> {app}")


if __name__ == "__main__":
    main()
