// READ-ONLY segmentation analysis. Pulls all Klaviyo profiles, de-inflates
// site_visits, buckets contacts into engagement tiers, and for each tier
// reports: size, visits/week, tenure, and the most common brands / searches /
// pages (ranked by how many MEMBERS have them — immune to count-map inflation).
//
// Writes NOTHING. Only GETs from Klaviyo.
//
// Requires Node 18+. Usage:
//   KLAVIYO_API_KEY=pk_xxx node scripts/segment-analysis.mjs

const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const REVISION = process.env.KLAVIYO_REVISION || '2023-10-15';

// Owner / tester accounts to exclude from the analysis.
const EXCLUDE = new Set([
  'lennart@diski.nl',
  'wouterr.hamelink@gmail.com',
  'wouter.hamelink@gmail.com',
  'info@diski.nl',
]);

if (!KLAVIYO_API_KEY) { console.error('Missing KLAVIYO_API_KEY env var.'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NOW = Date.now();
const DAY = 86400000;

const estimateVisits = (sv) => Math.max(1, Math.round(Math.sqrt(2 * sv)));

async function fetchAllKlaviyoProfiles() {
  const profiles = [];
  let url = 'https://a.klaviyo.com/api/profiles/?page%5Bsize%5D=100';
  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`, revision: REVISION, accept: 'application/json' },
    });
    if (res.status === 429) { await sleep((Number(res.headers.get('retry-after')) || 3) * 1000); continue; }
    if (!res.ok) throw new Error(`Klaviyo GET failed (${res.status}): ${await res.text()}`);
    const data = await res.json();
    for (const p of data.data ?? []) profiles.push(p);
    process.stdout.write(`\r  fetched ${profiles.length} profiles...`);
    url = data.links?.next ?? null;
  }
  process.stdout.write('\n');
  return profiles;
}

function tierOf(t) {
  if (t <= 1) return 'One-and-done';
  if (t <= 3) return 'Casual';
  if (t <= 9) return 'Regular';
  return 'Power';
}

const median = (arr) => {
  if (!arr.length) return NaN;
  const a = arr.slice().sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};

// Tally distinct members per key in a count-map; optional key transform.
function addPresence(tally, map, transform) {
  if (!map || typeof map !== 'object') return;
  const seen = new Set();
  for (const rawKey of Object.keys(map)) {
    const k = transform ? transform(rawKey) : rawKey;
    if (!k || seen.has(k)) continue;
    seen.add(k);
    tally.set(k, (tally.get(k) ?? 0) + 1);
  }
}

function topN(tally, groupSize, n) {
  return [...tally.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, c]) => `${k} (${c}, ${((c / groupSize) * 100).toFixed(0)}%)`);
}

async function main() {
  console.log('Fetching all Klaviyo profiles (read-only)...');
  const profiles = await fetchAllKlaviyoProfiles();

  const groups = {
    'One-and-done': [],
    Casual: [],
    Regular: [],
    Power: [],
  };
  let excluded = 0;

  for (const p of profiles) {
    const email = (p.attributes?.email || '').toLowerCase();
    if (!email || EXCLUDE.has(email)) { excluded++; continue; }

    const props = p.attributes?.properties ?? {};
    const sv = typeof props.site_visits === 'number' && props.site_visits > 0 ? props.site_visits : 1;
    const t = estimateVisits(sv);

    const created = props.unlock_date || p.attributes?.created;
    const days = created ? Math.max((NOW - Date.parse(created)) / DAY, 0) : null;

    groups[tierOf(t)].push({
      email,
      t,
      days,
      visitedCompanies: props.visited_companies,
      searchedTerms: props.searched_terms,
      visitedPages: props.visited_pages,
    });
  }

  const total = Object.values(groups).reduce((a, g) => a + g.length, 0);
  console.log(`\nAnalyzed ${total} contacts (excluded ${excluded} owner/empty).\n`);

  for (const [name, members] of Object.entries(groups)) {
    if (!members.length) continue;
    const size = members.length;

    // visits/week — only over members with >= 14 days tenure (avoids recent-signup noise)
    const mature = members.filter((m) => m.days != null && m.days >= 14);
    const perWeek = mature.map((m) => m.t / (m.days / 7));
    const tenureWeeks = members.filter((m) => m.days != null).map((m) => m.days / 7);

    const brands = new Map();
    const searches = new Map();
    const pages = new Map();
    for (const m of members) {
      addPresence(brands, m.visitedCompanies);
      addPresence(searches, m.searchedTerms);
      addPresence(pages, m.visitedPages, (k) => k.split('#')[0]); // strip #i=.. fragments
    }

    console.log(`===== ${name.toUpperCase()} =====`);
    console.log(`  Size:               ${size} (${((size / total) * 100).toFixed(1)}% of base)`);
    console.log(`  Est. visits (median/mean): ${median(members.map((m) => m.t))} / ${(members.reduce((a, m) => a + m.t, 0) / size).toFixed(1)}`);
    console.log(`  Visits/week (median, n=${mature.length} mature): ${perWeek.length ? median(perWeek).toFixed(2) : 'n/a'}`);
    console.log(`  Tenure weeks (median): ${tenureWeeks.length ? median(tenureWeeks).toFixed(1) : 'n/a'}`);
    console.log(`  Top brands (visited):  ${topN(brands, size, 8).join(', ') || '—'}`);
    console.log(`  Top searches:          ${topN(searches, size, 8).join(', ') || '—'}`);
    console.log(`  Top pages:             ${topN(pages, size, 8).join(', ') || '—'}`);
    console.log('');
  }
}

main().catch((err) => { console.error('\nAnalysis aborted:', err.message); process.exit(1); });
