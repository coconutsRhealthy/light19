// Fetches the shop registry (the same R2 feed the Black Friday page loads at
// runtime) and bakes a bare slug -> webshop URL map into a bundled JSON, so the
// discount modal can resolve its "Naar winkel" link PRERENDERED — no runtime
// fetch at the moment the user clicks out. Runs as part of `build:prod`
// (before `ng build`).
//
// Only the `url` is kept; the registry's `category` / `resolved_on` are engine-
// side metadata the frontend has no use for (64KB registry -> ~19KB map).
//
// Output shape (src/app/data/shop-urls.json), keyed by the SAME slug the
// company pages use (route param == lowercased, bracket-stripped company name):
//   { "123jaloezie.nl": "https://www.123jaloezie.nl/", ... }
//
// Best-effort: if the registry can't be fetched (offline build), the existing
// committed JSON is left untouched so the build still compiles with the last
// known data instead of wiping every shop link.

const fs = require('fs');
const path = require('path');

const REGISTRY_URL = 'https://pub-a3be569620e4415b916e737210363aee.r2.dev/webshops_info/shop_registry.json';
const OUT_PATH = path.join(__dirname, '../src/app/data/shop-urls.json');

function slugify(shopName) {
  return (shopName || '').replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
}

async function main() {
  let registry;
  try {
    const res = await fetch(`${REGISTRY_URL}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    registry = await res.json();
  } catch (err) {
    console.warn(`[generate-shop-urls] Could not fetch registry (${err.message}); keeping existing ${path.basename(OUT_PATH)}.`);
    return;
  }

  const shops = registry && registry.shops;
  if (!shops || typeof shops !== 'object') {
    console.warn('[generate-shop-urls] Registry had no `shops` object; keeping existing file.');
    return;
  }

  const map = {};
  for (const [name, info] of Object.entries(shops)) {
    const url = info && typeof info.url === 'string' ? info.url.trim() : '';
    if (!url) continue;
    map[slugify(name)] = url;
  }

  if (Object.keys(map).length === 0) {
    console.warn('[generate-shop-urls] Registry yielded zero URLs; keeping existing file.');
    return;
  }

  const sorted = Object.fromEntries(Object.keys(map).sort().map(k => [k, map[k]]));
  fs.writeFileSync(OUT_PATH, JSON.stringify(sorted, null, 2) + '\n');
  console.log(`[generate-shop-urls] Wrote ${Object.keys(sorted).length} shop URLs to ${path.basename(OUT_PATH)}.`);
}

main();
