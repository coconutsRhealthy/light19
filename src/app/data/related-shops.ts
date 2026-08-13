// Pools and the deterministic draw behind the "andere winkels" grid that both
// brand-page templates render (v1 CompanyCodesComponent, v2 CompanyCodesV2Component).
//
// WHY THIS FILE EXISTS
// Each template used to carry its own hardcoded pool: a 24-slug array inside
// company-codes.component.ts and an 8-slug DEFAULT_RELATED in
// company-codes-v2.component.ts. Every page drew from the same short list, so the
// grid aimed the site's internal links at ~110 shops and starved everything else.
// Measured on the 2026-08-12 build (1,532 brand pages, 11.5k shop-to-shop links):
//
//   nakdfashion 732 inbound   shein 711   loavies 604   zalando 501   temu 402
//   ...while 1,206 of 1,532 brand pages had exactly ONE inbound internal link
//   (the homepage), and 5 had none.
//
// It also leaked brand names sitewide, which Google read as topical relevance on
// pages that sell nothing of the sort. GSC, quarter ending 2026-08-12:
//   - "zalando kortingscode" ranked with 20 different diski URLs; Zalando's name
//     sat in the body of 222 other shops' pages (Temu 237, Guts & Gusto 263,
//     Loavies 211).
//   - /strengthen.store/'s single top keyword was "zalando kortingscode",
//     /vloer.nu/'s was "shein kortingscode 2026", /fest/'s was "loavies
//     kortingscode juni 2026".
//
// THE DRAW
// Slots fill in this order, each stage skipping anything already taken:
//   1. the shop's own co-occurrence list (v2 only) — topical and editorial, so it
//      always wins the first slots;
//   2. up to RELATED_BOOST_SLOTS from RELATED_BOOST, seeded-shuffled;
//   3. the remainder from the full live pool, walked as a ring (see below).
//
// Stage 3 is what un-orphans the long tail, and it is a RING WALK rather than a
// shuffle on purpose. A per-page random draw leaves gaps: simulated over the 1,523
// live shops it left 158 of them with no shop-to-shop link at all, worse than the
// 5 we started with, because random coverage of n targets by n draws misses ~5% of
// them. Walking a fixed order from each page's own offset instead gives every shop
// the same number of inbound tail links by construction, with no gaps to chase.

/**
 * Shops that earn a bounded share of the grid: real search volume that is NOT yet
 * converting, i.e. everything a ranking nudge would pay off on.
 *
 * Criteria, from GSC over 2026-05-15 .. 2026-08-12: average position 6 or worse
 * (already-top-5 pages do not need the help) and at least 7,500 impressions. That
 * is the complete set matching those filters, not a top-N — see the warning below.
 * Columns: position, impressions, CTR.
 *
 * The band deliberately starts at 6 rather than 8. A narrower 8-14 band read as
 * the purer "striking distance" cut, but it excluded Zalando (7.6) — the site's
 * single biggest page at 116k impressions — and a build with that list dropped it
 * from 500 inbound internal links to 7. Whatever the sitewide boilerplate links
 * were worth, discovering their value by deleting them all at once on the crown
 * jewel is not a trade worth making.
 *
 * WHEN YOU REFRESH THIS LIST, filter GSC by impressions, never by clicks. The
 * first cut of this list came off a clicks-ranked top 100 and silently dropped 13
 * qualifying shops — every one of them a high-impression page with a CTR too low
 * to chart, which is precisely the profile that belongs here. lookfantastic
 * (18,886 impressions, 0.07% CTR) and blackroll (12,794 impressions and zero
 * clicks) were both missing.
 *
 * Revisit when rankings move: a shop that reaches the top 5 no longer needs the
 * boost and should make room for one that does. A slug with no live code is
 * skipped automatically, so a stale entry is harmless.
 */
export const RELATED_BOOST: readonly string[] = [
  'zalando',         //  7.6  116858   2.08%
  'temu',            // 13.7   66556   0.29%
  'about you',       //  6.4   59843   2.29%
  'nakdfashion',     //  7.3   45344   1.35%
  'aliexpress',      //  7.2   41758   1.70%
  'bol.com',         //  7.1   41604   2.57%
  'loavies',         //  6.4   27208   1.94%
  'sunweb',          // 10.2   25390   0.30%
  'upfront',         //  7.2   23979   1.99%
  'esn',             //  7.4   23559   0.74%
  'wehkamp',         //  9.5   23396   0.94%
  'bodyandfit.com',  //  9.2   21876   1.96%
  'amazon',          // 12.6   19846   1.39%
  'lookfantastic',   //  9.1   18886   0.07%
  'adidas',          // 11.0   14296   0.31%
  'plutosport',      //  7.3   14320   3.58%
  'douglas',         // 10.2   14231   0.73%
  'decathlon',       //  9.2   14203   1.46%
  'myproteinnl',     //  9.9   14031   0.16%
  'snipes',          //  9.7   13384   0.46%
  'hunkemoller',     //  8.9   12866   1.04%
  'blackroll',       //  6.6   12794   0.00%
  'asos',            //  6.7   11996   0.38%
  'h&m',             //  8.5   11503   0.37%
  'gymshark',        // 10.2   11245   0.64%
  'myjewellery',     //  6.2   10646   0.97%
  'yoursurprise',    //  9.7   10629   0.53%
  'airup',           //  9.2   10558   1.60%
  'ibood',           // 11.8   10471   1.16%
  'creamyfabrics',   //  6.1   10369   5.23%
  'bijenkorf',       //  8.8   10301   2.47%
  'emmasleepnl',     // 10.8   10015   0.44%
  'fotofabriek.nl',  //  8.1    9474   1.10%
  'greetz.nl',       // 13.1    9297   0.02%
  'bonprix',         // 13.5    8481   0.37%
  'praxis',          // 12.4    8427   0.80%
  'etsy',            //  8.3    8421   1.75%
  'plein',           // 11.8    8037   1.16%
  'otrium',          // 12.6    8020   1.92%
  'omoda',           // 10.5    7999   1.01%
  'getyourguide',    //  9.5    7908   0.46%
  'loopearplugs',    //  8.8    7842   0.88%
  'burga',           //  8.9    7726   1.49%
  'pinkgellac'       //  7.5    7674   3.53%
];

/**
 * How many of a page's grid slots the boost list may take. Deliberately a minority
 * of RELATED_MAX: the rest goes to the long tail, which is the half of the problem
 * a curated list cannot fix. Raising this re-creates the concentration documented
 * at the top of this file, so treat it as a ceiling rather than a dial.
 */
export const RELATED_BOOST_SLOTS = 3;

/**
 * Deterministic shuffle. ngOnInit runs twice — once at prerender, once at
 * hydration — and two different draws would make the client tear down the
 * prerendered list (@for tracks by slug) and swap the shops out under the user.
 * Seeding from the shop's own slug gives every page its own stable ordering that
 * server and client both reproduce, which is also what spreads the links: 1,500
 * pages each draw a different subset of the same pool.
 */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    h = (h * 1664525 + 1013904223) >>> 0; // LCG step — cheap, deterministic
    const j = h % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

export interface RelatedPickOptions {
  /** The current shop's slug (lowercased). Seeds the draw and is excluded from it. */
  seed: string;
  /** Every slug that has a live page, i.e. a code in discounts.json. */
  livePool: readonly string[];
  /** The shop's own co-occurrence list, if it has one. Takes the first slots. */
  own?: readonly string[];
  /** How many slugs to return. */
  max: number;
}

/**
 * Picks the slugs for one page's related-shops grid. Returns lowercased slugs that
 * are guaranteed live, de-duplicated, and never the current shop.
 *
 * Callers still map slugs to their own view model (v1 and v2 render different
 * cards); this only decides WHICH shops appear.
 */
export function pickRelatedSlugs(opts: RelatedPickOptions): string[] {
  const { seed, max } = opts;
  const live = new Set(opts.livePool.map(s => s.toLowerCase()));
  const taken = new Set<string>([seed.toLowerCase()]);
  const out: string[] = [];

  const take = (slugs: readonly string[], limit: number): void => {
    for (const raw of slugs) {
      if (out.length >= max || limit <= 0) return;
      const s = raw.toLowerCase();
      if (taken.has(s) || !live.has(s)) continue;   // skip self, dupes, and shops without a live page
      taken.add(s);
      out.push(s);
      limit--;
    }
  };

  take(opts.own ?? [], max);
  take(seededShuffle(RELATED_BOOST, seed), RELATED_BOOST_SLOTS);
  take(ringFrom(opts.livePool, seed), max);

  return out;
}

/**
 * The live pool in a stable order, rotated to start just past the current shop and
 * strided so consecutive picks land far apart alphabetically rather than on the
 * seed's immediate neighbours.
 *
 * RING_STRIDE is prime, so it is coprime with any pool size that is not a multiple
 * of it and the walk therefore visits every shop before repeating. Each page taking
 * the first k entries means each shop is picked as the k-th neighbour of exactly
 * one other shop — even coverage without a random draw's gaps.
 */
function ringFrom(livePool: readonly string[], seed: string): string[] {
  const ordered = [...livePool].map(s => s.toLowerCase()).sort();
  const n = ordered.length;
  if (n === 0) return [];

  // Fall back to a hash when the seed is not itself in the pool (a shop can render
  // before its own code lands in the feed), so the start is still stable per page.
  let start = ordered.indexOf(seed.toLowerCase());
  if (start < 0) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    start = h % n;
  }

  const stride = n % RING_STRIDE === 0 ? 1 : RING_STRIDE;
  const out: string[] = [];
  for (let k = 1; k <= n; k++) out.push(ordered[(start + k * stride) % n]);
  return out;
}

const RING_STRIDE = 257;
