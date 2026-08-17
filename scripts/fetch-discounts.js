// Builds src/app/data/discounts.json, the file every page of the site reads.
//
// Three inputs:
//   1. R2 — the live codes, published by diski-input-insta's `node scripts/run-all.js`
//      and read at runtime by the diski app too. R2 is the source of truth for live codes.
//   2. Newsletter rows — for shops with an AFFILIATE LINK and no live code. The page has
//      a commercial job to do, so it must stay online; it just has no code to show, so it
//      shows a newsletter sign-up instead of pretending to have one.
//   3. Backup codes — a fallback code per shop, for shops whose live codes have been
//      pruned. v2's come from each brand-content JSON's `backupCode`; v1's from the
//      generated V1_BACKUP_CODES map. A shop gets its backup code injected ONLY if it
//      has no entry in the feed. A real code always wins.
//
// Backup codes used to be applied inside the components, at the moment a brand page
// rendered. That kept them invisible to everything else: discounts.json never learned
// about the shop, so the homepage table, /winkels, the search and the related-shops
// grids all behaved as if it didn't exist — even though its page was online with a
// working code. Injecting them here instead means every consumer sees one consistent
// picture, and the two component fallbacks (plus their duplicated date formula) are gone.
//
// Because every content page now has an entry here — live or backup — discounts.json is
// once again the single answer to "which pages exist". fill-routes.js relies on that, so
// assertEveryContentPageHasCode() fails the build if a content page ends up with neither.
//
// Runs after stamp-build.js (it needs BUILD_DATE_ISO) and before fill-routes.js.
//
// discounts.json is a GENERATED artifact: hand-edits are overwritten by the next build.
// Codes are edited in diski-input-insta. It stays committed so builds are reproducible
// and work offline — if R2 is unreachable we keep the last known-good copy rather than
// shipping a site with no codes.
//
// Feed shape (published schema):
//   { generated, count, discounts: [ { shop, code, value, added, condition? }, ... ] }
// Legacy line format (what this writes):
//   "footlocker (new app user), FL10, 10, zzz, 07-08"

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FEED_URL = 'https://pub-a3be569620e4415b916e737210363aee.r2.dev/discounts.json';
const OUT_PATH = path.join(ROOT, 'src/app/data/discounts.json');
const BUILD_INFO_PATH = path.join(ROOT, 'src/app/build-info.ts');
const V1_INDEX_PATH = path.join(ROOT, 'src/app/company-codes/company-seo-content/index.ts');
const V1_BACKUP_PATH = path.join(ROOT, 'src/app/company-codes/company-seo-content/backup-codes.json');
const V2_DATA_DIR = path.join(ROOT, 'src/app/company-codes-v2/brand-content/data');
const AFFILIATE_SERVICE_PATH = path.join(ROOT, 'src/app/services/affiliate-link.service.ts');

// What a shop with an affiliate link but no live code shows instead of a code. One
// honest placeholder, not a per-shop value: there is nothing shop-specific to say.
const NEWSLETTER_CODE = 'aanmelden voor nieuwsbrief';

// The "zzz" column is the influencer handle, blanked out before publishing. It no longer
// exists in the feed, but the components and fill-routes.js still split on commas by
// position, so the placeholder has to stay in the line we write.
const ANON_PLACEHOLDER = 'zzz';

// Strip a trailing "(condition)" and lowercase — the slug normalisation every consumer
// of discounts.json already applies.
const toSlug = (company) => company.replace(/\s*\([^)]*\)\s*/g, '').trim().toLowerCase();

// =========================
// 1. The live feed (R2)
// =========================

function toLegacyLine(entry) {
  const company = entry.condition ? `${entry.shop} (${entry.condition})` : entry.shop;
  const monthDay = entry.added.slice(5); // "2026-07-08" -> "07-08"
  return `${company}, ${entry.code}, ${entry.value}, ${ANON_PLACEHOLDER}, ${monthDay}`;
}

function isValidEntry(entry) {
  return (
    entry &&
    typeof entry.shop === 'string' && entry.shop &&
    typeof entry.code === 'string' && entry.code &&
    typeof entry.added === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.added)
  );
}

async function fetchLiveLines() {
  let feed;
  try {
    const res = await fetch(`${FEED_URL}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    feed = await res.json();
  } catch (err) {
    console.warn(`[fetch-discounts] Could not fetch feed (${err.message}); keeping existing ${path.basename(OUT_PATH)}.`);
    return null;
  }

  // Refuse to act on a payload we don't recognise. An empty or malformed feed would
  // strip every code-only shop from the site and the sitemap.
  if (!feed || !Array.isArray(feed.discounts) || feed.discounts.length === 0) {
    console.warn('[fetch-discounts] Feed was empty or malformed; keeping existing file.');
    return null;
  }

  const valid = feed.discounts.filter(isValidEntry);
  const skipped = feed.discounts.length - valid.length;
  if (skipped > 0) {
    console.warn(`[fetch-discounts] Skipped ${skipped} malformed entr${skipped === 1 ? 'y' : 'ies'}.`);
  }
  if (valid.length === 0) {
    console.warn('[fetch-discounts] No valid entries; keeping existing file.');
    return null;
  }

  console.log(`[fetch-discounts] Feed: ${valid.length} live codes (generated ${feed.generated}).`);
  return valid.map(toLegacyLine);
}

// =========================
// 2. Affiliate shops (the newsletter fallback)
// =========================

// The slugs that have an affiliate link — the keys of the affiliateLinks map, read with a
// regex rather than eval'd. The leading `^\s*'` can't match a commented-out entry
// (`//     'snipes': '...'`), which the file parks a couple of.
//
// Returns the keys with their ORIGINAL CASING. A couple of them are capitalised
// ('FBTO Zorg', 'Independer Zorg') and fill-routes.js takes a slug verbatim, so the case
// here is the case of the live URL. Lowercasing would silently move those pages to a new
// URL and 404 the indexed one. Comparisons are done lowercased at the call site instead.
function readAffiliateSlugs() {
  const source = fs.readFileSync(AFFILIATE_SERVICE_PATH, 'utf8');
  const block = source.match(/affiliateLinks[^=]*=\s*\{([\s\S]*?)\n  \};/);
  if (!block) {
    throw new Error(`Could not find the affiliateLinks object in ${path.basename(AFFILIATE_SERVICE_PATH)}.`);
  }
  return [...block[1].matchAll(/^\s*'([^']+)'\s*:/gm)].map(m => m[1]);
}

// =========================
// 3. Backup codes
// =========================

// v2: every brand-content file carries a backupCode, filled by the content engine.
function readV2Backups() {
  const backups = new Map();
  for (const file of fs.readdirSync(V2_DATA_DIR)) {
    if (!file.endsWith('.json')) continue;
    const content = JSON.parse(fs.readFileSync(path.join(V2_DATA_DIR, file), 'utf8'));
    const code = content.backupCode?.code;
    if (code) {
      backups.set(file.replace(/\.json$/, '').toLowerCase(), {
        code,
        discount: (content.backupCode.discount ?? '').trim(),
      });
    }
  }
  return backups;
}

// v1: a generated map, slug -> {code, discount}, written by populate-v1-backup-codes.js.
function readV1Backups() {
  const map = JSON.parse(fs.readFileSync(V1_BACKUP_PATH, 'utf8'));
  return new Map(
    Object.entries(map).map(([slug, backup]) => [slug.toLowerCase(), backup])
  );
}

// The slugs that have a brand page. For v1 the authoritative slug is the switch label in
// index.ts, not the filename (`case 'about you'` -> ./about-you). For v2 the filename IS
// the slug.
function readContentSlugs() {
  const v1 = new Set(
    [...fs.readFileSync(V1_INDEX_PATH, 'utf8').matchAll(/case\s+'([^']+)':/g)].map(m => m[1].toLowerCase())
  );
  const v2 = new Set(
    fs.readdirSync(V2_DATA_DIR).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, '').toLowerCase())
  );
  return { v1, v2 };
}

// Neither fallback is a freshly-checked offer, so don't date it like one: 45–75 days
// before the build, with the offset derived from the slug so the fallback pages don't all
// share one templated date. Deterministic — this is the formula the two component
// fallbacks each used to carry.
//
// The age is load-bearing, not cosmetic. It keeps injected rows out of the homepage's
// "X nieuwe shops" counter (which counts shops carrying the newest date in the feed) and
// out of the modal's email gate (which demands an email for anything added in the last 5
// days). Both fallbacks need that exclusion, so both use this.
function agedSpotDate(slug, buildDate) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;

  const spotted = new Date(buildDate.getTime() - (45 + (hash % 31)) * 86400000);
  return String(spotted.getMonth() + 1).padStart(2, '0') + '-' + String(spotted.getDate()).padStart(2, '0');
}

// Anchored to the same build date the pages stamp themselves with, so a backup code's
// "gespot op" can never be newer than the build that produced it.
function readBuildDate() {
  const match = fs.readFileSync(BUILD_INFO_PATH, 'utf8').match(/BUILD_DATE_ISO\s*=\s*'(\d{4})-(\d{2})-(\d{2})'/);
  if (!match) throw new Error(`Could not read BUILD_DATE_ISO from ${BUILD_INFO_PATH}. Does stamp-build.js run first?`);
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

// =========================
// 4. Guard: discounts.json must cover every content page
// =========================

// fill-routes.js derives the whole route + sitemap universe from discounts.json, so a
// content page missing from it simply would not exist — no route, no page, silently. That
// used to be impossible (routes were the union of discounts + content), so make the new
// invariant loud instead of assumed. A brand page with no live code AND no backup code is
// a content bug; fail the build and name it rather than dropping the page.
function assertEveryContentPageHasCode(slugs, content) {
  const missing = [
    ...[...content.v1].filter(s => !slugs.has(s)).map(s => `v1: ${s}`),
    ...[...content.v2].filter(s => !slugs.has(s)).map(s => `v2: ${s}`),
  ];

  if (missing.length) {
    throw new Error(
      `${missing.length} brand page(s) have neither a live code nor a backup code, so they ` +
      `would get no route and vanish from the site:\n` +
      missing.slice(0, 10).map(s => `  ${s}`).join('\n') +
      (missing.length > 10 ? `\n  ...and ${missing.length - 10} more` : '') +
      `\n\nAdd a backupCode to the brand-content file (v2) or to backup-codes.ts (v1).`
    );
  }
}

// =========================
// 5. Main
// =========================

async function main() {
  const liveLines = await fetchLiveLines();
  if (!liveLines) return; // fetch failed — keep the committed copy, warning already logged

  const liveSlugs = new Set(liveLines.map(line => toSlug(line.split(',')[0])));
  const buildDate = readBuildDate();

  // An affiliate shop with no live code falls back to the newsletter row — NOT to a backup
  // code. The point of the affiliate fallback is to keep a page that has a commercial job
  // to do online without inventing a discount for it, so a backup code here would just
  // reintroduce the thing we're removing.
  //
  // Today this matches nothing: every affiliate shop is in the feed, because
  // diski-input-insta still fills a dummy code for the ones with no real code. It starts
  // firing when that step is removed there.
  const newsletterShops = readAffiliateSlugs().filter(slug => !liveSlugs.has(slug.toLowerCase()));
  const newsletterLines = newsletterShops.map(
    slug => `${slug}, ${NEWSLETTER_CODE}, , ${ANON_PLACEHOLDER}, ${agedSpotDate(slug.toLowerCase(), buildDate)}`
  );
  const newsletterSlugs = new Set(newsletterShops.map(slug => slug.toLowerCase()));

  // v2 wins where a slug has both: if a shop has a v2 brand page, that's the page being
  // served, so its engine-provided backup code is the authoritative one.
  const backups = new Map([...readV1Backups(), ...readV2Backups()]);

  const backupLines = [];
  for (const [slug, backup] of backups) {
    if (liveSlugs.has(slug) || newsletterSlugs.has(slug)) continue; // real code, then newsletter
    backupLines.push(
      `${slug}, ${backup.code}, ${backup.discount}, ${ANON_PLACEHOLDER}, ${agedSpotDate(slug, buildDate)}`
    );
  }

  // Injected rows go last: the feed is newest-first, and consumers lean on that ordering
  // (winkels takes a shop's first occurrence as its latest offer; the homepage reads
  // discounts[0].date as "last updated"). An injected shop has no other entry by
  // definition, so appending can't displace a real code.
  const lines = [...liveLines, ...backupLines, ...newsletterLines];

  const content = readContentSlugs();
  assertEveryContentPageHasCode(new Set(lines.map(line => toSlug(line.split(',')[0]))), content);

  fs.writeFileSync(OUT_PATH, JSON.stringify(lines, null, 2) + '\n');

  console.log(
    `[fetch-discounts] Wrote ${lines.length} discounts: ` +
    `${liveLines.length} live + ${backupLines.length} backup + ${newsletterLines.length} newsletter ` +
    `(covering all ${content.v1.size} v1 + ${content.v2.size} v2 brand pages).`
  );
}

main().catch(err => {
  console.error(`\n[fetch-discounts] ${err.message}\n`);
  process.exit(1);
});
