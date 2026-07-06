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
- Lives on branch `claude_seo_improvements` (base component + modal/affiliate wiring).
  **Deployed and live in production** (verified 2026-06-12). NOTE: in this project,
  deployment is **independent of git push** — deploys are run locally from the Mac
  (`npm run build:prod` + deploy), often with uncommitted local changes. So the branch
  being unpushed / ahead of `origin/main` tells you nothing about what production serves.
  To know what's actually live, fetch the live URL.
- The 25 are now **served on the real `:company` route and indexable** (see below); the
  original 5 are deliberately kept on v1 and remain noindexed `/v2/` previews only.

> **Update 2026-06-12:** the lists in this section are now historical. The allowlist has
> grown to **251 slugs (242 live on the real `:company` route)** across batches through
> June 11, all **deployed live in production**. Of the original 5 pilots, only `zalando`
> remains on v1. `brand-content/live-v2-slugs.ts` is the source of truth for what's live.
>
> **Update 2026-07-05 — the allowlist is RETIRED.** It had become a hand-maintained
> mirror of "has a v2 content file" (every one of the 353 data files was allowlisted;
> the noindexed-preview tier had 0 members), so it added complexity without changing
> behaviour. It is gone. **Having a `brand-content/data/{slug}.json` file now IS being
> live on v2** — no separate go-live switch. The router guard reads an auto-generated
> manifest (`brand-content/v2-content-slugs.ts`, rebuilt from `data/` on every prod
> build) instead of the deleted `live-v2-slugs.ts`. Related change: a shop's page now
> stays prerendered as long as it has v1 or v2 content, **independent of whether
> `discounts.json` still lists a code for it** (see `scripts/fill-routes.js`). Read the
> two sections below as history — where they say "allowlist", substitute "has a v2
> content file".

## Live rollout — IMPLEMENTED (2026-06-02) for the 25, NOT the original 5
The `canMatch` approach from `../live-rollout-plan.txt` is now wired up, with one
deliberate change: an explicit **allowlist** instead of "any shop with v2 content".
- `brand-content/live-v2-slugs.ts` — the allowlist of the 25 go-live slugs (single source
  of truth). The original 5 pilot shops are intentionally NOT on it, so they stay on v1.
- `has-v2-content.guard.ts` — `CanMatchFn`: matches the real `:company` route only when the
  slug is allowlisted AND has v2 content; otherwise falls through to the v1 component.
- `app.routes.ts` — guarded `:company → v2` route sits above the `:company → v1` route; the
  `v2/:company` preview route carries `data: { preview: true }`.
- **noindex handling** — `applySeo()` only calls `meta.setNoIndex()` on the preview route
  (`data.preview`); on the live route it calls `meta.setIndex()` (clears any stale noindex).
  `setNoIndex()` now uses `updateTag` (no stacked tags). Verified by prerender: all 25
  `/{slug}/index.html` render v2 with NO noindex; original 5 + all other shops render v1.
- The modal deep-link (`openNewPageWithCodeDetailModal`) is now path-aware (`/v2/{slug}` in
  preview, `/{slug}` live). Self-canonical is added at build by `scripts/set-canonicals.js`,
  and the 25 are already in `sitemap.xml`/`routes.txt` (as of 2026-07-05 `routes.txt` is
  the UNION of `discounts.json` + v1 + v2 content slugs; `sitemap.xml` is still limited to
  shops with a live code — see `scripts/fill-routes.js`).
- **To ship changes:** run `npm run build:prod` and deploy locally from the Mac (no remote
  push required — deploys can include uncommitted local changes).
  Add a shop later → add its slug to `live-v2-slugs.ts`; revert a shop → remove it.

## Where the content comes from (separate project)
The DB → caption-matching → synthesis → QA pipeline that PRODUCES this content lives
in a **separate project**, not in this frontend:
**`~/Documents/Projects/claude_code/claude_diski_content_engine`** (Python + MariaDB + LLM).
That project's only output is the validated `BrandContent` JSON files it writes to
`brand-content/data/{slug}.json` here. The recipe/guardrails (`docs/CONTENT-GENERATION.md`),
the output contract (`schema/brand_content.schema.json`), and the input-data analysis
all live there. This repo just **consumes** the JSON at build; as of 2026-07-05 dropping a
`{slug}.json` into `brand-content/data/` is all it takes to publish the shop on v2 (the
`live-v2-slugs.ts` allowlist that used to gate this is retired — see the 2026-07-05 update above).

## Map of this folder
- `company-codes-v2.component.*` — the page (data-driven for any shop).
- `brand-content/data/*.json` — per-shop copy (produced by the content-engine project).
- `brand-content/*.ts` — the loader plumbing (model, token, server loader, service, allowlist).
- `live-rollout-plan.txt` — how v2 is served on the real route.
