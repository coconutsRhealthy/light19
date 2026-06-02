# company-codes-v2 — what this is, how we got here, where it's going

A second-generation shop page for diski.nl, served at `/v2/:company` (noindexed,
parallel to the live `:company` v1 pages). Built as a pilot to test a specific bet:
**ground per-shop SEO copy in our own influencer-caption database** so we can scale to
~1,150 shops without tripping Google's "scaled content abuse" policy.

---

## The journey (how we worked, and why)

1. **Warm-up.** Built a from-scratch "perfect SEO" page for a fictional shop to pin down
   what best practice looks like (schema, freshness, E-E-A-T, CWV) — and to be honest about
   what Google has since nerfed (FAQ/HowTo rich results, fake ratings).
2. **Recon.** Mapped the real site: Angular 19 SSR on Cloudflare, `:company` → v1
   `company-codes` component, ~1,150 shops in `discounts.json`, ~579 existing SEO content
   files, affiliate plumbing. Flagged the strategic risk: mass AI pages = penalty bait.
3. **Built v2 as an isolated parallel.** New `/v2/:company` component, **noindexed**, not
   linked anywhere, real shops untouched — a safe sandbox to iterate in production.
   First hardcoded for Zalando, then generalized to be data-driven for any shop, pulling
   real codes from `discounts.json` with honest "checked-on" dates and editorial trust.
4. **The key move: caption grounding.** Found the influencer-caption MariaDB; `ai_canonical`
   already tags each caption with a shop slug (matches `discounts.json` 1:1). Generated
   genuinely unique, grounded copy from real captions for 4 shops. This is the *moat* — no
   aggregator has this source material. (Zalando is caption-poor, so it's self-authored.)
5. **Internal linking without a taxonomy.** Related shops via **shared-influencer
   co-occurrence** — "creators who post X also post Y." It reconstructs each shop's niche
   automatically (fashion pulls fashion; Geurwolkje, a fragrance brand, pulls home/lifestyle).
6. **Polish & parity.** Collapse codes after 15; reuse the real navbar/footer; logo
   placeholders; a static-HTML exporter to share with a colleague; and wired v1's exact
   modal + affiliate-redirect flow into v2.

## Why the architecture is shaped this way
- **One component + per-shop content objects** (`brand-content/*.ts`), not 1,150 components.
  Adding a shop = add one data object. Template is written once.
- **Noindexed parallel route** = ship to prod safely and keep iterating, zero risk to live
  rankings (triple lock: `noindex` + absent from sitemap + unlinked).
- **Grounding > volume.** The whole bet is that unique, caption-derived, genuinely
  differentiated copy beats templated AI — for both Google and conversions.

---

## Current state (as of early June 2026)
- **30 shops live on `/v2/...`:** the original 5 (nakdfashion, ginatricot, gutsgusto,
  geurwolkje, zalando) + a 25-shop batch generated 2026-06-02 from the
  **currently not-indexed** detail pages (see `input/CANDIDATES.md`): loopearplugs,
  cabaulifestyle, siroko, bodylab.nl, yesstyle, charlottetilbury, smartphoto.nl,
  photowall_sweden, trendcarpet, yehwang_wholesale, moovvmore.nl, wildrefill,
  legionathletics, florencenails, lampenlicht.nl, thegelexpert, calliegifts,
  mothersearth, jhpfashion.nl, merodacosmetics, kossonutrition.nl, vitaminfit.eu,
  twistshakebaby, fittasticsportswear, glutespop.com — all caption-grounded (≥15 captions).
- That batch targets not-indexed pages on purpose: nothing to lose in rankings, and each
  is backed by real caption material. `input/CANDIDATES.md` ranks all 340 not-indexed
  shops by caption coverage (139 have ≥1 caption; 201 have none).
- Committed on branch `claude_seo_improvements` (base component + modal/affiliate wiring).
  **Unpushed and not deployed** — production does not have v2 yet.
- Still a noindexed pilot; the real `:company` route is untouched (all v1).

## Where it's going (not built yet)
- **Serve v2 on the real route per shop, fall back to v1** — see `../live-rollout-plan.txt`
  (a `canMatch` guard; the critical part is making the forced `noindex` conditional so real
  pages stay indexable).
- **A generation engine** to scale the content past 5 shops — see
  `brand-content/CONTENT-GENERATION.md` for the exact recipe (queries + grounding rules),
  and `../../../scripts/python/extract_brand_captions.py` which already pulls the per-shop
  caption-grounding bundle (Instagram+TikTok) as JSON, ready to feed into generation.
  At scale: move the registry to lazy `import()` and run generation in reviewed batches.

## Map of this folder
- `company-codes-v2.component.*` — the page (data-driven for any shop).
- `brand-content/` — per-shop copy objects + `CONTENT-GENERATION.md` (how they're made).
- `live-rollout-plan.txt` — how to take v2 live on the real route later.
- (repo) `scripts/python/extract_brand_captions.py` — caption extractor that feeds generation.
