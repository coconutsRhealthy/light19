// READ-ONLY segmentation analysis, sourced from BREVO (the curated dataset:
// SITE_VISITS is the de-inflated estimate for dormant contacts and the true
// value for returners/new; FIRST_SEEN is the real first-seen date).
//
// Buckets contacts into engagement tiers and for each tier reports: size,
// visits/week, tenure, and the most common brands / searches / pages (ranked
// by how many MEMBERS have them — immune to count-map inflation).
//
// Writes NOTHING. Only GETs from Brevo.
//
// Requires Node 18+. Usage:
//   BREVO_API_KEY=xkeysib-xxx node scripts/segment-analysis.mjs

const BREVO_API_KEY = process.env.BREVO_API_KEY;

// Owner / tester accounts to exclude from the analysis.
const EXCLUDE = new Set([
  'lennart@diski.nl',
  'wouterr.hamelink@gmail.com',
  'wouter.hamelink@gmail.com',
  'info@diski.nl',
]);

if (!BREVO_API_KEY) { console.error('Missing BREVO_API_KEY env var.'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NOW = Date.now();
const DAY = 86400000;

async function fetchAllBrevoContacts() {
  const all = [];
  const limit = 1000;
  let offset = 0;
  for (;;) {
    const url = `https://api.brevo.com/v3/contacts?limit=${limit}&offset=${offset}&sort=desc`;
    const res = await fetch(url, { headers: { 'api-key': BREVO_API_KEY, accept: 'application/json' } });
    if (res.status === 429) { await sleep((Number(res.headers.get('retry-after')) || 3) * 1000); continue; }
    if (!res.ok) throw new Error(`Brevo GET contacts failed (${res.status}): ${await res.text()}`);
    const data = await res.json();
    const batch = data.contacts ?? [];
    if (batch.length === 0) break;
    for (const c of batch) all.push(c);
    process.stdout.write(`\r  fetched ${all.length} contacts...`);
    offset += limit;
  }
  process.stdout.write('\n');
  return all;
}

// Brevo stores the count-maps as JSON text — parse back to objects.
function parseMap(v) {
  if (!v) return null;
  if (typeof v === 'object') return v;
  try { return JSON.parse(v); } catch { return null; }
}

function tierOf(sv) {
  if (sv <= 1) return 'One-and-done';
  if (sv <= 3) return 'Casual';
  if (sv <= 9) return 'Regular';
  return 'Power';
}

const median = (arr) => {
  if (!arr.length) return NaN;
  const a = arr.slice().sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};

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
  console.log('Fetching all Brevo contacts (read-only)...');
  const contacts = await fetchAllBrevoContacts();

  const groups = { 'One-and-done': [], Casual: [], Regular: [], Power: [] };
  let excluded = 0;

  for (const c of contacts) {
    const email = (c.email || '').toLowerCase();
    if (!email || EXCLUDE.has(email)) { excluded++; continue; }

    const a = c.attributes ?? {};
    const sv = typeof a.SITE_VISITS === 'number' && a.SITE_VISITS > 0 ? a.SITE_VISITS : 1;
    const created = a.FIRST_SEEN || a.UNLOCK_DATE;
    const days = created ? Math.max((NOW - Date.parse(created)) / DAY, 0) : null;

    groups[tierOf(sv)].push({
      email,
      sv,
      days,
      visitedCompanies: parseMap(a.VISITED_COMPANIES),
      searchedTerms: parseMap(a.SEARCHED_TERMS),
      visitedPages: parseMap(a.VISITED_PAGES),
    });
  }

  const total = Object.values(groups).reduce((acc, g) => acc + g.length, 0);
  console.log(`\nAnalyzed ${total} contacts (excluded ${excluded} owner/empty).\n`);

  for (const [name, members] of Object.entries(groups)) {
    if (!members.length) continue;
    const size = members.length;

    const mature = members.filter((m) => m.days != null && m.days >= 14);
    const perWeek = mature.map((m) => m.sv / (m.days / 7));
    const tenureWeeks = members.filter((m) => m.days != null).map((m) => m.days / 7);

    const brands = new Map();
    const searches = new Map();
    const pages = new Map();
    for (const m of members) {
      addPresence(brands, m.visitedCompanies);
      addPresence(searches, m.searchedTerms);
      addPresence(pages, m.visitedPages, (k) => k.split('#')[0]);
    }

    console.log(`===== ${name.toUpperCase()} =====`);
    console.log(`  Size:               ${size} (${((size / total) * 100).toFixed(1)}% of base)`);
    console.log(`  SITE_VISITS (median/mean): ${median(members.map((m) => m.sv))} / ${(members.reduce((acc, m) => acc + m.sv, 0) / size).toFixed(1)}`);
    console.log(`  Visits/week (median, n=${mature.length} mature): ${perWeek.length ? median(perWeek).toFixed(2) : 'n/a'}`);
    console.log(`  Tenure weeks (median): ${tenureWeeks.length ? median(tenureWeeks).toFixed(1) : 'n/a'}`);
    console.log(`  Top brands (visited):  ${topN(brands, size, 8).join(', ') || '—'}`);
    console.log(`  Top searches:          ${topN(searches, size, 8).join(', ') || '—'}`);
    console.log(`  Top pages:             ${topN(pages, size, 8).join(', ') || '—'}`);
    console.log('');
  }
}

main().catch((err) => { console.error('\nAnalysis aborted:', err.message); process.exit(1); });
