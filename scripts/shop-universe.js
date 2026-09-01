// The page universe: every shop that has earned a page on diski.nl, and why.
//
// Two things earn a page:
//   - an affiliate link  -> the page has a commercial job to do
//   - brand content (v1 or v2) -> there is editorial work worth keeping online
//
// This module is the SINGLE definition of that set. Two scripts read it and they
// must never disagree:
//
//   fetch-discounts.js      subtracts the live codes and writes a newsletter row
//                           for the remainder, so every page has an entry in
//                           discounts.json (which is what makes the page exist).
//   publish-shops-to-r2.js  publishes the whole set to R2, so the APP can do its
//                           own subtraction against whatever codes feed it holds.
//
// The app cannot derive this set. 414 of these shops have brand content and no
// affiliate link, and both of those facts live only in this repo — one in
// affiliate-link.service.ts, one in two content directories. Before the feed
// existed those shops simply did not exist in the app.
//
// CASING, which is load-bearing in two different directions:
//   `slug` keeps the ORIGINAL casing from affiliate-link.service.ts. A couple of
//   entries are capitalised ('FBTO Zorg', 'Independer Zorg') and fill-routes.js
//   takes a slug verbatim, so that casing IS the live URL. Lowercasing it would
//   silently move an indexed page.
//   `key` is that slug lowercased, and it is the join key everywhere else — the
//   codes feed, the registry, the logos map and the app all key on it.
// Affiliate entries come first so their casing wins a tie against content, which
// is the order fetch-discounts.js has always used.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const V1_INDEX_PATH = path.join(ROOT, 'src/app/company-codes/company-seo-content/index.ts');
const V2_DATA_DIR = path.join(ROOT, 'src/app/company-codes-v2/brand-content/data');
const AFFILIATE_SERVICE_PATH = path.join(ROOT, 'src/app/services/affiliate-link.service.ts');

// The affiliateLinks map, read with a regex rather than eval'd. The leading
// `^\s*'` can't match a commented-out entry (`//     'snipes': '...'`), which the
// file parks a couple of.
function readAffiliateLinks() {
  const source = fs.readFileSync(AFFILIATE_SERVICE_PATH, 'utf8');
  const block = source.match(/affiliateLinks[^=]*=\s*\{([\s\S]*?)\n  \};/);
  if (!block) {
    throw new Error(`Could not find the affiliateLinks object in ${path.basename(AFFILIATE_SERVICE_PATH)}.`);
  }

  // 29 of the entries are parked with an empty string — the shop is in the map (so it
  // still earns a page) but there is no link to send anyone to yet. They are kept as a
  // key with a null value, never as '', so a consumer can only ever test truthiness.
  const links = new Map();
  for (const m of block[1].matchAll(/^\s*'([^']+)'\s*:\s*'([^']*)'/gm)) {
    links.set(m[1], m[2].trim() || null);
  }
  return links;
}

// The slugs that have a brand page. For v1 the authoritative slug is the switch
// label in index.ts, not the filename (`case 'about you'` -> ./about-you). For v2
// the filename IS the slug.
function readContentSlugs() {
  const v1 = new Set(
    [...fs.readFileSync(V1_INDEX_PATH, 'utf8').matchAll(/case\s+'([^']+)':/g)].map(m => m[1].toLowerCase())
  );
  const v2 = new Set(
    fs.readdirSync(V2_DATA_DIR).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, '').toLowerCase())
  );
  return { v1, v2 };
}

/**
 * Every shop with a page, deduped on the lowercased key, affiliate entries first.
 *
 *   { slug, key, affiliateUrl, page }   page: 'v2' | 'v1' | null
 *
 * v2 wins when a slug has both, because v2 is the component that renders it.
 */
function buildUniverse() {
  const affiliate = readAffiliateLinks();
  const content = readContentSlugs();

  const universe = [];
  const seen = new Set();

  for (const slug of [...affiliate.keys(), ...content.v1, ...content.v2]) {
    const key = slug.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    universe.push({
      slug,
      key,
      affiliateUrl: affiliate.get(slug) ?? affiliate.get(key) ?? null,
      page: content.v2.has(key) ? 'v2' : content.v1.has(key) ? 'v1' : null,
    });
  }

  return universe;
}

module.exports = { buildUniverse, readAffiliateLinks, readContentSlugs };
