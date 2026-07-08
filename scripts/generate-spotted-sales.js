// Fetches the live "spotted promotions" feed (the same R2 feed the Black Friday
// page loads at runtime) and bakes a per-slug SALE HISTORY into a bundled JSON,
// so the v2 company pages can render it PRERENDERED — no runtime fetch in the
// browser. Runs as part of `build:prod` (before `ng build`).
//
// Output shape (src/app/data/spotted-sales.json), keyed by the SAME slug the
// company pages use (the feed's `webshop_name` is already that slug):
//   { "idealofsweden": [ { "text": "...", "date": "2026-07-07" }, ... ], ... }
// Each shop's list is deduped (identical Dutch text collapsed to its most-recent
// spot) and sorted newest-first.
//
// Best-effort: if the feed can't be fetched (offline build), the existing
// committed JSON is left untouched so the build still compiles with the last
// known data instead of wiping the section.

const fs = require('fs');
const path = require('path');

const FEED_URL = 'https://pub-a3be569620e4415b916e737210363aee.r2.dev/spotted_promotions.json';
const OUT_PATH = path.join(__dirname, '../src/app/data/spotted-sales.json');

function slugify(webshopName) {
  // The feed already stores slugs in `webshop_name`; just normalise casing and
  // strip any stray bracket suffix / whitespace so it matches discounts.json.
  return (webshopName || '').replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
}

async function main() {
  let feed;
  try {
    const res = await fetch(`${FEED_URL}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    feed = await res.json();
  } catch (err) {
    console.warn(`[generate-spotted-sales] Could not fetch feed (${err.message}); keeping existing ${path.basename(OUT_PATH)}.`);
    return;
  }

  if (!Array.isArray(feed)) {
    console.warn('[generate-spotted-sales] Feed was not an array; keeping existing file.');
    return;
  }

  // slug -> Map<text, date> keeping the most-recent date per identical text.
  const bySlug = new Map();

  for (const item of feed) {
    // Drop operator-flagged noise, mirroring the Black Friday component.
    if (item.thumbs_down === true) continue;

    const slug = slugify(item.webshop_name);
    if (!slug) continue;

    const text = (item.korting_text_nl || item.korting_text || '').trim();
    if (!text) continue;

    const date = String(item.date || '').slice(0, 10); // YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;

    if (!bySlug.has(slug)) bySlug.set(slug, new Map());
    const texts = bySlug.get(slug);
    const existing = texts.get(text);
    if (!existing || date > existing) texts.set(text, date);
  }

  const out = {};
  let totalEntries = 0;
  for (const [slug, texts] of bySlug) {
    const list = [...texts.entries()]
      .map(([text, date]) => ({ text, date }))
      .sort((a, b) => b.date.localeCompare(a.date)); // newest first
    out[slug] = list;
    totalEntries += list.length;
  }

  // Deterministic key order so the committed JSON diffs cleanly build-to-build.
  const sorted = {};
  for (const slug of Object.keys(out).sort()) sorted[slug] = out[slug];

  fs.writeFileSync(OUT_PATH, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
  console.log(`[generate-spotted-sales] Wrote ${Object.keys(sorted).length} shops, ${totalEntries} deduped sale entries to ${path.relative(process.cwd(), OUT_PATH)}.`);
}

main();
