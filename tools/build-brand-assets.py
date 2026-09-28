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


def cut_letters(
    image: Image.Image, band: tuple[int, int]
) -> list[tuple[str, int, int]]:
    """Trace the wordmark into one SVG path per letter.

    The intro reveals the wordmark one letter at a time. Setting those letters
    in a text font was visibly not the logo, and cutting them out as bitmaps
    was worse: the source wordmark is 76px tall and the intro draws it near
    370px, so a 5x upscale of a bitmap is visibly soft. Tracing the outline and
    shipping vector fixes it at any size and costs about 1.6 KB for the word.

    Each letter is given half of the gap on either side of it as empty space in
    its viewBox, so the page lays them out with no gap of its own. The drawn
    letterspacing is not even -- AR is three pixels against RI and IS at ten and
    eleven -- so a single CSS gap value would quietly restyle the word.

    Returns (path data, viewBox width, viewBox height) left to right. Raises
    rather than guessing if the wordmark does not come apart cleanly, because a
    wrong count would ship the wrong letters.
    """
    strip = crop_band(image, band)
    runs = ink_columns(strip)
    if len(runs) != 4:
        raise SystemExit(
            f"expected 4 letters in the wordmark, measured {len(runs)}. "
            "The letterforms probably changed; cut them by hand."
        )

    contours = trace_contours(np.array(strip.getchannel("A")))

    # Assign each contour to the letter whose ink run is nearest its middle.
    # Nearest-centre rather than a containment test: the contour runs at alpha
    # 128 while the runs are measured at INK_CUT, so the contour sits about a
    # pixel and a half outside the run on each side and any containment test
    # needs a tolerance guessed to cover that. Nearest-centre needs none, and a
    # letter with a counter simply contributes two contours to the same group.
    centres = [(x0 + x1) / 2 for x0, x1 in runs]
    groups: list[list[list[tuple]]] = [[] for _ in runs]
    for contour in contours:
        xs = [p[0] for p in contour]
        middle = (min(xs) + max(xs)) / 2
        groups[min(range(len(runs)), key=lambda i: abs(centres[i] - middle))].append(
            contour
        )
    for i, group in enumerate(groups):
        if not group:
            raise SystemExit(
                f"letter {i + 1} at x {runs[i][0]}..{runs[i][1]} traced to "
                "nothing. The artwork probably has an edge the tracer cannot "
                "follow."
            )

    # The letterspacing is measured on the contours, not on the ink runs, so it
    # is the gap the SVG actually draws rather than the gap the threshold found.
    spans = [
        (
            min(p[0] for c in group for p in c),
            max(p[0] for c in group for p in c),
        )
        for group in groups
    ]

    letters = []
    for i, group in enumerate(groups):
        lo, hi = spans[i]
        left = round((spans[i - 1][1] + lo) / 2) if i else round(lo)
        right = round((hi + spans[i + 1][0]) / 2) if i < len(groups) - 1 else round(hi)
        parts = []
        for contour in group:
            pts = simplify(contour, TRACE_EPSILON)
            if len(pts) < 3:
                continue
            d = [f"M{pts[0][0] - left:.2f} {pts[0][1]:.2f}"]
            d += [f"L{x - left:.2f} {y:.2f}" for x, y in pts[1:]]
            parts.append("".join(d) + "Z")
        letters.append(("".join(parts), right - left + 1, strip.height))
    return letters


# Marching squares, one entry per corner code, listing the cell edges the
# contour crosses. Bits are tl=1, tr=2, br=4, bl=8; edges are T, R, B, L.
#
# Codes 5 and 10 are saddles and cross two pairs of edges. Every other code
# crosses one pair, which is exactly why these two are written out as pairs of
# pairs: treat them as a single pair and the counters of A and R vanish.
_TRACE_TABLE = {
    1: (("L", "T"),),
    2: (("T", "R"),),
    3: (("L", "R"),),
    4: (("R", "B"),),
    5: (("L", "T"), ("R", "B")),
    6: (("T", "B"),),
    7: (("L", "B"),),
    8: (("B", "L"),),
    9: (("B", "T"),),
    10: (("T", "R"), ("B", "L")),
    11: (("B", "R"),),
    12: (("R", "L"),),
    13: (("R", "T"),),
    14: (("T", "L"),),
}

# Half the alpha range, so the contour sits on the perceived edge of the ink
# rather than on the first or last fully opaque pixel.
_TRACE_LEVEL = 128.0

# Douglas-Peucker tolerance, in source pixels. A third of a pixel is well under
# what shows at display size, and it takes the wordmark from ~1900 contour
# points to 130.
TRACE_EPSILON = 0.3


def trace_contours(alpha: np.ndarray, level: float = _TRACE_LEVEL) -> list[list[tuple]]:
    """Marching squares over the alpha channel, returning closed contours.

    Each grid edge's crossing point is computed once and cached, so two cells
    sharing an edge agree bit for bit and the segments chain by exact match
    instead of a tolerance search.
    """
    padded = np.pad(alpha.astype(np.float64), 1, mode="constant")
    rows, cols = padded.shape

    def lerp(p: float, q: float) -> float:
        return 0.5 if q == p else (level - p) / (q - p)

    across: dict[tuple[int, int], float] = {}
    down: dict[tuple[int, int], float] = {}

    def point(name: str, y: int, x: int) -> tuple[float, float]:
        if name == "T":
            across.setdefault((y, x), x + lerp(padded[y, x], padded[y, x + 1]))
            return (across[(y, x)], float(y))
        if name == "B":
            across.setdefault(
                (y + 1, x), x + lerp(padded[y + 1, x], padded[y + 1, x + 1])
            )
            return (across[(y + 1, x)], float(y + 1))
        if name == "L":
            down.setdefault((y, x), y + lerp(padded[y, x], padded[y + 1, x]))
            return (float(x), down[(y, x)])
        down.setdefault((y, x + 1), y + lerp(padded[y, x + 1], padded[y + 1, x + 1]))
        return (float(x + 1), down[(y, x + 1)])

    segments = []
    for y in range(rows - 1):
        for x in range(cols - 1):
            code = (
                (1 if padded[y, x] >= level else 0)
                | (2 if padded[y, x + 1] >= level else 0)
                | (4 if padded[y + 1, x + 1] >= level else 0)
                | (8 if padded[y + 1, x] >= level else 0)
            )
            for first, second in _TRACE_TABLE.get(code, ()):
                segments.append((point(first, y, x), point(second, y, x)))

    def key(pt: tuple[float, float]) -> tuple[float, float]:
        # The +1 on both axes undoes the pad, putting the result back in the
        # source image's coordinate frame.
        return (round(pt[0], 6) + 1.0, round(pt[1], 6) + 1.0)

    # Start point -> the segments leaving it. A saddle has two leaving the same
    # point, so this is a list and the walk takes whichever is still unused.
    leaving: dict[tuple[float, float], list[int]] = {}
    for i, (start_pt, _end) in enumerate(segments):
        leaving.setdefault(key(start_pt), []).append(i)

    used = [False] * len(segments)
    contours = []
    for first_unused in range(len(segments)):
        if used[first_unused]:
            continue
        used[first_unused] = True
        contour = [key(segments[first_unused][0]), key(segments[first_unused][1])]
        while True:
            nxt = next(
                (i for i in leaving.get(contour[-1], []) if not used[i]),
                None,
            )
            if nxt is None:
                break
            used[nxt] = True
            contour.append(key(segments[nxt][1]))
            if contour[-1] == contour[0]:
                break
        if len(contour) > 3:
            contours.append(contour)
    return contours


def simplify(points: list[tuple], epsilon: float) -> list[tuple]:
    """Douglas-Peucker. Collapses the contour's staircase into real edges.

    Straight runs in this wordmark are long and the curves are generous, so a
    third of a pixel is well under what shows at display size while taking the
    path from ~1900 points per letter to a few dozen.
    """
    if len(points) < 3:
        return [tuple(p) for p in points]
    pts = np.asarray(points, dtype=np.float64)
    keep = np.zeros(len(pts), dtype=bool)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        head, tail = pts[i], pts[j]
        leg = tail - head
        length = float(np.hypot(*leg))
        middle = pts[i + 1 : j]
        if length == 0:
            distance = np.hypot(middle[:, 0] - head[0], middle[:, 1] - head[1])
        else:
            distance = (
                np.abs(
                    (middle[:, 0] - head[0]) * leg[1]
                    - (middle[:, 1] - head[1]) * leg[0]
                )
                / length
            )
        worst = int(np.argmax(distance))
        if distance[worst] > epsilon:
            keep[i + 1 + worst] = True
            stack.append((i, i + 1 + worst))
            stack.append((i + 1 + worst, j))
    return [tuple(p) for p in pts[keep]]


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

    # The intro reveals the wordmark one letter at a time, drawn near five times
    # the height of the source. Bitmaps go soft at that size, so these are
    # traced outlines: one path per letter, each carrying its own share of the
    # letterspacing so the page adds no gap of its own.
    print("wordmark traced into four letter outlines, for the intro reveal")
    letters_dir = OUT / "letters"
    letters_dir.mkdir(parents=True, exist_ok=True)
    for name, (d, w, h) in zip("aris", cut_letters(keyed, wordmark_band), strict=True):
        # width and height as well as the viewBox. An SVG with only a viewBox
        # has no intrinsic size, and `width: auto` on an <img> then resolves to
        # zero in some engines; carrying the dimensions makes each file stand on
        # its own wherever it ends up being used.
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
            f'viewBox="0 0 {w} {h}" fill="{NAVY}"><path d="{d}"/></svg>\n'
        )
        path = letters_dir / f"{name}.svg"
        path.write_text(svg, encoding="utf-8")
        print(
            f"  letter-{name}.svg            {w}x{h}  {path.stat().st_size // 1024 + 1} KB"
        )

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
        # aris-hero.webp is NOT generated here. The hero is a separately
        # commissioned 16:9 lab scene, not a crop of the banner: the banner is
        # 1983x793 with its own wordmark, and every crop of it that leaves room
        # for the page headline comes out portrait and too small to cover 100vw
        # without upscaling. Regenerating it from the banner would overwrite the
        # real asset with the crop this replaced, so the banner only feeds the
        # banner and the OG image.

    print(f"-> {OUT}\n-> {app}")


if __name__ == "__main__":
    main()
