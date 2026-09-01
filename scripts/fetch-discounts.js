// Builds src/app/data/discounts.json, the file every page of the site reads.
//
// Two inputs:
//   1. R2 — the live codes, published by diski-input-insta's `node scripts/run-all.js`
//      and read at runtime by the diski app too. R2 is the source of truth for live codes.
//   2. Newsletter rows — ONE fallback, for any shop that has earned a page but has no
//      live code: it has an affiliate link, or it has brand content. It shows a
//      newsletter sign-up rather than a code, because there is no code to show.
//
// There used to be two invented fallbacks instead. diski-input-insta filled a "dummy
// code" for affiliate partners with none, and each brand page carried a "backupCode"
// (its last real code, an archived one, or — for ~89 shops — a code synthesised out of
// {ACTIE,OFF,SHOP} x {10,15}). Both reached the site as ordinary codes, so a visitor
// could not tell an invented code from a real one, and neither could we. The guarantee
// they provided was right; inventing a discount to provide it was not.
//
// The fallback lives in the DATA, not in the components. It used to be applied at render
// time, which kept it invisible to everything else: discounts.json never learned about
// the shop, so the homepage table, /winkels, the search and the related-shops grids all
// behaved as if it didn't exist — even though its page was online. Injecting here means
// every consumer sees one consistent picture.
//
// Because every content page gets a row here — live or newsletter — discounts.json is the
// single answer to "which pages exist". fill-routes.js relies on that, so
// assertEveryContentPageHasCode() fails the build if a content page ever ends up without.
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
const { buildUniverse, readContentSlugs } = require('./shop-universe');

const ROOT = path.join(__dirname, '..');
const FEED_URL = 'https://pub-a3be569620e4415b916e737210363aee.r2.dev/discounts.json';
const OUT_PATH = path.join(ROOT, 'src/app/data/discounts.json');
const BUILD_INFO_PATH = path.join(ROOT, 'src/app/build-info.ts');

// What a shop with no live code shows instead of a code. One honest placeholder, not a
// per-shop value: there is nothing shop-specific to say when you have no offer.
const NEWSLETTER_CODE = 'aanmelden voor nieuwsbrief';

// Signing up for a shop's newsletter is worth ~10% off a first order almost everywhere,
// so the row advertises 10% and the card renders "10% korting". Unlike the invented codes
// this replaced, the number is not derived from anything — it is the standing value of
// the offer we are actually making, and it is the same for every shop.
const NEWSLETTER_VALUE = '10';

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
// 2. Which shops have earned a page
// =========================

// Both readers now live in shop-universe.js, because publish-shops-to-r2.js needs
// exactly the same set and two copies of this logic would drift. See that file for
// what earns a page and why the casing matters.

// =========================
// 3. Dating an injected row
// =========================

// A newsletter sign-up doesn't expire, so unlike the invented codes this replaced, its
// date could honestly be the build date. It is a week earlier instead, because two
// consumers read recency as a signal and both would misread it:
//
//   1. The homepage counts every shop carrying the NEWEST date in the feed as a "nieuwe
//      shop" (discounts-table.component.ts, updateLatestDiscountInfo). Build-dated rows
//      would announce ~751 new shops on every build.
//   2. The modal's email gate demands an email for anything added in the last 5 days
//      (modal.component.ts, RECENT_DAYS). A newsletter row must not sit behind that.
//
// A week clears both, and it cannot collide with the counter: codes reach the feed every
// two to three days, so the newest live code is never a week old.
//
// One shared date for all of them, deliberately. The old backup codes spread themselves
// over 31 hashed dates to look individually spotted — there is nothing to disguise here.
const NEWSLETTER_AGE_DAYS = 7;

function newsletterDate(buildDate) {
  const d = new Date(buildDate.getTime() - NEWSLETTER_AGE_DAYS * 86400000);
  return String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// Anchored to the same build date the pages stamp themselves with, so an injected row's
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
// content page missing from it simply would not exist — no route, no page, silently. The
// fallback rule above puts every content slug in by construction, so this should be
// impossible; it is here to make that structural, not assumed. If it ever fires, the
// fallback loop has a hole and 862 brand pages are one build away from vanishing.
function assertEveryContentPageHasCode(slugs, content) {
  const missing = [
    ...[...content.v1].filter(s => !slugs.has(s)).map(s => `v1: ${s}`),
    ...[...content.v2].filter(s => !slugs.has(s)).map(s => `v2: ${s}`),
  ];

  if (missing.length) {
    throw new Error(
      `${missing.length} brand page(s) got no row in discounts.json, so they would get no ` +
      `route and vanish from the site:\n` +
      missing.slice(0, 10).map(s => `  ${s}`).join('\n') +
      (missing.length > 10 ? `\n  ...and ${missing.length - 10} more` : '') +
      `\n\nEvery brand page should fall back to a newsletter row — check the fallback loop.`
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

  const content = readContentSlugs();

  // ONE fallback, one rule: a shop that should have a page but has no live code shows a
  // newsletter sign-up, never an invented code. Two things earn a page:
  //   - an affiliate link  -> the page has a commercial job to do
  //   - brand content      -> there is editorial work worth keeping online
  //
  // Affiliate slugs keep their original casing, because that is the live URL
  // ('FBTO Zorg'). Content slugs are lowercased, which is the casing their backup-code
  // rows used before this replaced them, so no URL moves. Affiliate first, so it wins a tie.
  // buildUniverse() already dedupes on the lowercased key and puts affiliate entries
  // first, so all that is left here is the subtraction: a shop with a live code needs
  // no newsletter row.
  const fallbackShops = buildUniverse()
    .filter(entry => !liveSlugs.has(entry.key))
    .map(entry => entry.slug);

  const newsletterLines = fallbackShops.map(
    slug => `${slug}, ${NEWSLETTER_CODE}, ${NEWSLETTER_VALUE}, ${ANON_PLACEHOLDER}, ${newsletterDate(buildDate)}`
  );

  // Injected rows go last: the feed is newest-first, and consumers lean on that ordering
  // (winkels takes a shop's first occurrence as its latest offer; the homepage reads
  // discounts[0].date as "last updated"). An injected shop has no other entry by
  // definition, so appending can't displace a real code.
  const lines = [...liveLines, ...newsletterLines];

  assertEveryContentPageHasCode(new Set(lines.map(line => toSlug(line.split(',')[0]))), content);

  fs.writeFileSync(OUT_PATH, JSON.stringify(lines, null, 2) + '\n');

  console.log(
    `[fetch-discounts] Wrote ${lines.length} discounts: ` +
    `${liveLines.length} live + ${newsletterLines.length} newsletter ` +
    `(covering all ${content.v1.size} v1 + ${content.v2.size} v2 brand pages).`
  );
}

main().catch(err => {
  console.error(`\n[fetch-discounts] ${err.message}\n`);
  process.exit(1);
});
