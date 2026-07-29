#!/usr/bin/env python3
"""Generate the diski.nl Open Graph share card -> public/logos/webp/diski-og.webp.

WHY THIS EXISTS
  The first OG banner (committed 2026-07-10 in a0b649a) was a one-off binary with
  no source, drawn in the pre-rebrand sans-serif and carrying an out-of-date brand
  mark (its dot hung ~0.2 of the d's height BELOW the baseline instead of sitting
  beside it). Regenerating it by hand meant redrawing it by hand. This script makes
  the card reproducible from the repo's own brand assets, so the next tweak is a
  parameter change rather than an archaeology exercise.

SINGLE SOURCE OF TRUTH
  - the brand mark is public/favicon.svg, rasterised via rsvg-convert. The card
    never re-draws the "d" + dot itself, which is exactly the mistake that let the
    navbar/footer marks drift out of sync with the favicon.
  - colours come from tailwind.config.js (mirrored in PALETTE below).
  - type comes from public/fonts/*.woff2, decompressed in memory with fontTools,
    so the card uses the same Fraunces/Montserrat cuts the site ships.

USAGE
  python3 -m venv .venv && ./.venv/bin/pip install -r requirements.txt
  ./.venv/bin/python build_og.py            # writes the webp
  ./.venv/bin/python build_og.py --measure  # print layout bands, don't write

  rsvg-convert must be on PATH (brew install librsvg).
"""
import argparse
import io
import os
import shutil
import subprocess
import sys

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFilter, ImageFont

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FONT_DIR = os.path.join(REPO, "public", "fonts")
FAVICON = os.path.join(REPO, "public", "favicon.svg")
OUT = os.path.join(REPO, "public", "logos", "webp", "diski-og.webp")

# Mirrors tailwind.config.js -> theme.extend.colors
PALETTE = {
    "cream":  (0xFF, 0xF6, 0xD9),
    "ink":    (0x43, 0x30, 0x2E),
    "butter": (0xFF, 0xE7, 0xA1),
    "link":   (0x5B, 0x8A, 0xA6),
    "dot":    (0x9D, 0xBF, 0xD0),
}

W, H = 1200, 630          # the OG spec size; 1.91:1
SS = 2                    # supersample factor - draw at 2x, downsample with LANCZOS

# Layout, in final (1x) pixels. Measured off the original card so the composition
# is preserved and only the mark + typeface change.
CARD_INSET = 57
CARD_RADIUS = 48
TILE_SIZE = 148
TILE_TOP = 121
WORDMARK_BASELINE = 406   # baseline of "diski."
WORDMARK_SIZE = 132
# These two are the ascender top, not the ink top: Montserrat's ascent leaves ~7px
# of air above the caps at this size, so they sit 7px above the measured ink band.
TAGLINE_TOP = 437
TAGLINE_SIZE = 34
URL_TOP = 505
URL_SIZE = 26

TAGLINE = "Werkende kortingscodes voor honderden webshops"
URL = "diski.nl"


def load_font(basename, size):
    """woff2 -> in-memory ttf -> PIL font. Keeps public/fonts as the only copy."""
    path = os.path.join(FONT_DIR, basename)
    ttf = TTFont(path)
    ttf.flavor = None
    buf = io.BytesIO()
    ttf.save(buf)
    buf.seek(0)
    return ImageFont.truetype(buf, size)


def render_mark(px):
    """Rasterise public/favicon.svg at px square, preserving alpha."""
    if not shutil.which("rsvg-convert"):
        sys.exit("rsvg-convert not found on PATH (brew install librsvg)")
    out = subprocess.run(
        ["rsvg-convert", "-w", str(px), "-h", str(px), FAVICON],
        check=True, capture_output=True).stdout
    return Image.open(io.BytesIO(out)).convert("RGBA")


def build():
    w, h = W * SS, H * SS
    img = Image.new("RGB", (w, h), PALETTE["butter"])

    # Soft warm glow top-left, echoing the original card's lit corner. Drawn on a
    # small buffer and upscaled - cheaper than blurring at full res, and the
    # smoothing is what we want anyway.
    glow = Image.new("L", (w // 8, h // 8), 0)
    ImageDraw.Draw(glow).ellipse(
        [-w // 40, -h // 20, w // 12, h // 10], fill=90)
    glow = glow.filter(ImageFilter.GaussianBlur(w // 90)).resize((w, h), Image.LANCZOS)
    img.paste(Image.new("RGB", (w, h), (255, 252, 224)), (0, 0), glow)

    # Card shadow, then the card itself.
    shadow = Image.new("L", (w, h), 0)
    ImageDraw.Draw(shadow).rounded_rectangle(
        [CARD_INSET * SS, (CARD_INSET + 6) * SS,
         (W - CARD_INSET) * SS, (H - CARD_INSET + 8) * SS],
        radius=CARD_RADIUS * SS, fill=70)
    shadow = shadow.filter(ImageFilter.GaussianBlur(9 * SS))
    img.paste(Image.new("RGB", (w, h), (196, 168, 96)), (0, 0), shadow)

    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle(
        [CARD_INSET * SS, CARD_INSET * SS,
         (W - CARD_INSET) * SS, (H - CARD_INSET) * SS],
        radius=CARD_RADIUS * SS, fill=PALETTE["cream"])

    # Brand mark, centred.
    mark = render_mark(TILE_SIZE * SS)
    img.paste(mark, ((w - TILE_SIZE * SS) // 2, TILE_TOP * SS), mark)

    # Wordmark "diski." - ink, with the trailing period in the dot colour, exactly
    # as the navbar/footer render it. Centred as one string, so the period is part
    # of the optical centre.
    fraunces = load_font("fraunces-latin-700.woff2", WORDMARK_SIZE * SS)
    word, period = "diski", "."
    w_word = draw.textlength(word, font=fraunces)
    w_period = draw.textlength(period, font=fraunces)
    x = (w - (w_word + w_period)) / 2
    draw.text((x, WORDMARK_BASELINE * SS), word,
              font=fraunces, fill=PALETTE["ink"], anchor="ls")
    draw.text((x + w_word, WORDMARK_BASELINE * SS), period,
              font=fraunces, fill=PALETTE["dot"], anchor="ls")

    # Tagline + url.
    mont600 = load_font("montserrat-latin-600.woff2", TAGLINE_SIZE * SS)
    draw.text((w / 2, TAGLINE_TOP * SS), TAGLINE,
              font=mont600, fill=PALETTE["ink"], anchor="ma")
    mont_url = load_font("montserrat-latin-600.woff2", URL_SIZE * SS)
    draw.text((w / 2, URL_TOP * SS), URL,
              font=mont_url, fill=PALETTE["link"], anchor="ma")

    return img.resize((W, H), Image.LANCZOS)


def measure(img):
    """Print ink bands, so the layout can be compared against the previous card."""
    import numpy as np
    a = np.array(img.convert("RGB"))
    ink = (np.abs(a.astype(int) - np.array(PALETTE["ink"])).sum(2) < 90)
    rows = ink.any(1)
    runs, s = [], None
    for i, v in enumerate(rows):
        if v and s is None:
            s = i
        if not v and s is not None:
            runs.append((s, i - 1)); s = None
    if s is not None:
        runs.append((s, len(rows) - 1))
    for y0, y1 in runs:
        _, xx = np.where(ink[y0:y1 + 1])
        print(f"  ink band y[{y0},{y1}] h={y1-y0+1} "
              f"x[{xx.min()},{xx.max()}] cx={(xx.min()+xx.max())/2:.1f}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--measure", action="store_true",
                    help="print layout bands instead of writing the file")
    ap.add_argument("--png", help="also write a PNG here (for eyeballing)")
    args = ap.parse_args()

    img = build()
    if args.png:
        img.save(args.png)
    if args.measure:
        measure(img)
        return
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    img.save(OUT, "WEBP", quality=90, method=6)
    print(f"wrote {OUT}  ({os.path.getsize(OUT)} bytes)")


if __name__ == "__main__":
    main()
