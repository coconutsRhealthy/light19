// Fetches the discounts feed from R2 — the single source of truth, published by
// diski-input-insta's `npm run discounts` and also read at runtime by the diski app —
// and writes it to src/app/data/discounts.json in the legacy string format the Angular
// code already expects.
//
// Runs FIRST in `build:prod`, because everything downstream reads that file:
//   - discounts.service.ts   imports it statically (so it ships in the bundle,
//                            which is what puts the codes in the prerendered HTML)
//   - fill-routes.js         derives part of the route/sitemap universe from it
//
// discounts.json therefore becomes a GENERATED artifact. Editing it by hand no longer
// does anything — the next build overwrites it. Codes are edited in diski-input-insta.
// It stays committed so builds are reproducible and work offline: if R2 is unreachable
// we keep the last known-good copy rather than shipping a site with no codes.
//
// Feed shape (published schema):
//   { generated, count, discounts: [ { shop, code, value, added, condition? }, ... ] }
// Legacy line format (what this writes):
//   "footlocker (new app user), FL10, 10, zzz, 07-08"

const fs = require('fs');
const path = require('path');

const FEED_URL = 'https://pub-a3be569620e4415b916e737210363aee.r2.dev/discounts.json';
const OUT_PATH = path.join(__dirname, '../src/app/data/discounts.json');

// The "zzz" column is the influencer handle, blanked out before publishing. It no longer
// exists in the feed, but discounts.service.ts and fill-routes.js still split on commas
// by position, so the placeholder has to stay in the line we write.
const ANON_PLACEHOLDER = 'zzz';

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

async function main() {
  let feed;
  try {
    const res = await fetch(`${FEED_URL}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    feed = await res.json();
  } catch (err) {
    console.warn(`[fetch-discounts] Could not fetch feed (${err.message}); keeping existing ${path.basename(OUT_PATH)}.`);
    return;
  }

  // Refuse to act on a payload we don't recognise. Downstream, an empty or malformed
  // discounts.json would quietly strip code-only shops from the sitemap and ship pages
  // with no codes — better to build from the last known-good copy and say so.
  if (!feed || !Array.isArray(feed.discounts) || feed.discounts.length === 0) {
    console.warn('[fetch-discounts] Feed was empty or malformed; keeping existing file.');
    return;
  }

  const valid = feed.discounts.filter(isValidEntry);
  const skipped = feed.discounts.length - valid.length;
  if (skipped > 0) {
    console.warn(`[fetch-discounts] Skipped ${skipped} malformed entr${skipped === 1 ? 'y' : 'ies'}.`);
  }
  if (valid.length === 0) {
    console.warn('[fetch-discounts] No valid entries; keeping existing file.');
    return;
  }

  const lines = valid.map(toLegacyLine);
  fs.writeFileSync(OUT_PATH, JSON.stringify(lines, null, 2) + '\n');

  console.log(`[fetch-discounts] Wrote ${lines.length} discounts (feed generated ${feed.generated}).`);
}

main();
