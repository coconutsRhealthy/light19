================================================================================
Open Graph share card generator — public/logos/webp/diski-og.webp
================================================================================

WHAT THIS IS
  Builds the 1200x630 image that shows up when a diski.nl link is shared on
  WhatsApp / Facebook / LinkedIn / Slack. Referenced from src/index.html:15 as
  <meta property="og:image" content="https://diski.nl/logos/webp/diski-og.webp">

  Unlike ../gsc/ and ../ga4/ (local-only analysis tooling, gitignored) this
  folder IS committed, because it produces a committed asset. Only its .venv/ is
  ignored.

WHY IT EXISTS
  The first version of the card (committed 2026-07-10 in a0b649a) was a one-off
  binary with no source. By 2026-07-29 it had drifted off-brand: it was drawn in
  the pre-rebrand sans-serif, and its brand mark had the dot hanging below the
  d's baseline instead of sitting beside it. With no source file, "regenerate the
  OG image" meant redrawing it from scratch. Now it's a parameter change.

HOW IT STAYS ON-BRAND
  Nothing about the design is hardcoded twice:
    - the mark      -> rasterised from public/favicon.svg via rsvg-convert.
                       The card NEVER redraws the "d" + dot itself. Re-composing
                       the mark by hand is exactly how the navbar/footer copies
                       drifted out of sync with the favicon (fixed 2026-07-29).
    - the colours   -> PALETTE in build_og.py mirrors tailwind.config.js.
    - the type      -> public/fonts/*.woff2, decompressed in memory by fontTools,
                       so the card uses the same Fraunces 700 / Montserrat 600
                       cuts the site ships. No system fonts involved.

  If the brand mark, palette or fonts change, re-run the script — don't edit the
  webp.

SETUP  (one-off)
  brew install librsvg                 # provides rsvg-convert
  cd scripts/og
  python3 -m venv .venv
  ./.venv/bin/pip install -r requirements.txt

USAGE
  ./.venv/bin/python build_og.py                    # writes the webp
  ./.venv/bin/python build_og.py --png /tmp/og.png  # also dump a PNG to eyeball
  ./.venv/bin/python build_og.py --measure          # print ink bands, write nothing

  --measure is the regression check: it prints the vertical bands of dark pixels
  so a new render can be compared against the previous composition. As of
  2026-07-29 the expected bands are:
      mark      y[147,242]  h=96   (ONE band — d and dot overlap vertically,
                                    i.e. the dot is beside the d, not below it.
                                    The old broken card had TWO bands here.)
      wordmark  y[308,406]  h=99
      tagline   y[444,475]  h=32

LAYOUT
  Constants at the top of build_og.py, in final 1x pixels. The composition was
  measured off the original card and deliberately preserved — only the mark and
  the typeface changed. Drawing happens at 2x and is LANCZOS-downsampled, which
  is what keeps the serif edges clean at this size.

AFTER REGENERATING
  Social platforms cache OG images aggressively. To force a refresh:
    - Facebook/WhatsApp : developers.facebook.com/tools/debug/ -> Scrape Again
    - LinkedIn          : linkedin.com/post-inspector/
  Nothing needs to change in index.html — the filename is stable on purpose, so
  the URL keeps working.
