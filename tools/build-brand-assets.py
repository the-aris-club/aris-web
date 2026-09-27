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


def ink_columns(image: Image.Image) -> list[tuple[int, int]]:
    """Column ranges that contain ink, as whole runs.

    Same threshold as ink_bands, transposed. Used to cut the wordmark into
    individual letters: the gaps between ARIS are wide enough that the runs
    come back as exactly four.
    """
    columns = (np.array(image.getchannel("A")) >= INK_CUT).sum(axis=0)
    runs: list[tuple[int, int]] = []
    start: int | None = None
    for x, count in enumerate(columns):
        if count and start is None:
            start = x
        elif not count and start is not None:
            runs.append((start, x - 1))
            start = None
    if start is not None:
        runs.append((start, len(columns) - 1))
    return runs


def cut_letters(image: Image.Image, band: tuple[int, int]) -> list[Image.Image]:
    """Cut the wordmark band into one image per letter.

    The intro reveals the wordmark one letter at a time, and setting those
    letters in a text font looked wrong: no published typeface matches the
    drawn one closely enough, and Michroma was visibly not it. Cutting them
    out of the artwork makes the intro the same letters as the logo, at the
    logo's own weight and proportions, with no font in the path.

    The letters carry their own share of the letterspacing as transparent
    padding, so the page lays them out with no gap of its own. Returns them
    left to right. Raises rather than guessing if the wordmark does not come
    apart cleanly, because a wrong count would ship the wrong letters.
    """
    strip = crop_band(image, band)
    runs = ink_columns(strip)
    if len(runs) != 4:
        raise SystemExit(
            f"expected 4 letters in the wordmark, measured {len(runs)}. "
            "The letterforms probably changed; cut them by hand."
        )

    # Each letter is given half of the gap on either side of it as transparent
    # padding, so butting the four together with no CSS gap reproduces the
    # drawn letterspacing exactly. The gaps in this wordmark are not even --
    # AR is much tighter than RI and IS -- so a single CSS gap value would
    # quietly restyle it.
    letters = []
    for i, (x0, x1) in enumerate(runs):
        left = (runs[i - 1][1] + x0) // 2 if i else x0
        right = (x1 + runs[i + 1][0]) // 2 if i < len(runs) - 1 else x1
        letters.append(strip.crop((left, 0, right + 1, strip.height)))

    # Bottom-align onto a common height, so the shared baseline survives and the
    # page never has to know which letter is the tallest.
    tallest = max(letter.height for letter in letters)
    padded = []
    for letter in letters:
        canvas = Image.new("RGBA", (letter.width, tallest), (0, 0, 0, 0))
        canvas.paste(letter, (0, tallest - letter.height))
        padded.append(canvas)
    return padded


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

    # The intro reveals the wordmark one letter at a time. Those letters are
    # cut out of the artwork rather than typed, so they carry the drawn weight
    # and proportions. Trimmed, so each one is tight and the page can line them
    # up on a common baseline by bottom rather than by guesswork.
    print("wordmark cut into four letters, for the intro reveal")
    for letter, name in zip(cut_letters(keyed, wordmark_band), "aris", strict=True):
        write(letter, f"letter-{name}.webp", quality=92, method=6)

    print("app icon, transparent square, mark only")
    icon = centre_on_square(mark).resize((512, 512), Image.LANCZOS)
    write(icon, "icon.png", app, optimize=True)

    # Named apple-icon.png, not apple-touch-icon.png. The App Router's file
    # convention is `apple-icon`, and an explicit metadata.icons block overrides
    # it, so the old name would sit in app/ unused while the page kept serving
    # whatever apple-icon.png happened to be there.
    print("apple icon, plated white because iOS drops transparency")
    plated = centre_on_square(mark, (255, 255, 255)).resize((180, 180), Image.LANCZOS)
    write(plated.convert("RGB"), "apple-icon.png", app, optimize=True)

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
