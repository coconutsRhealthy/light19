// READ-ONLY diagnostic: is `site_visits` inflated by the worker's additive
// merge? Pulls every Klaviyo profile and checks site_visits against how long
// the profile has existed (unlock_date, falling back to Klaviyo `created`).
//
// A discount site realistically gets at most ~1-2 sessions/day from a person.
// If many profiles show far higher implied rates — or values impossible for
// how recently they were created — site_visits is inflated.
//
// Writes NOTHING. Only GETs from Klaviyo.
//
// Requires Node 18+. Usage:
//   KLAVIYO_API_KEY=pk_xxx node scripts/analyze-site-visits.mjs

const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const REVISION = process.env.KLAVIYO_REVISION || '2023-10-15';

if (!KLAVIYO_API_KEY) {
  console.error('Missing KLAVIYO_API_KEY env var.');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NOW = Date.now();
const DAY = 86400000;

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

function percentile(sortedAsc, p) {
  if (!sortedAsc.length) return NaN;
  const idx = Math.min(sortedAsc.length - 1, Math.floor((p / 100) * sortedAsc.length));
  return sortedAsc[idx];
}

function sumValues(obj) {
  if (!obj || typeof obj !== 'object') return null;
  return Object.values(obj).reduce((a, v) => a + (typeof v === 'number' ? v : 0), 0);
}

async function main() {
  console.log('Fetching all Klaviyo profiles (read-only)...');
  const profiles = await fetchAllKlaviyoProfiles();

  const rows = [];
  let noVisits = 0, noDate = 0;

  for (const p of profiles) {
    const props = p.attributes?.properties ?? {};
    const sv = props.site_visits;
    if (typeof sv !== 'number' || sv <= 0) { noVisits++; continue; }

    const dateStr = props.unlock_date || p.attributes?.created;
    const t = dateStr ? Date.parse(dateStr) : NaN;
    if (Number.isNaN(t)) { noDate++; continue; }

    const days = Math.max((NOW - t) / DAY, 0);
    const daysEff = Math.max(days, 1); // avoid divide-by-zero for brand-new profiles
    rows.push({
      email: p.attributes?.email,
      sv,
      days,
      perDay: sv / daysEff,
      perWeek: (sv / daysEff) * 7,
      unlock: String(dateStr).slice(0, 10),
      pageSum: sumValues(props.visited_pages),
    });
  }

  const svSorted = rows.map((r) => r.sv).sort((a, b) => a - b);
  const pwSorted = rows.map((r) => r.perWeek).sort((a, b) => a - b);
  const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : NaN);

  const over1 = rows.filter((r) => r.perDay > 1).length;
  const over3 = rows.filter((r) => r.perDay > 3).length;
  const over10 = rows.filter((r) => r.perDay > 10).length;

  // "Impossible" = high site_visits on a very recently created profile
  const impossible = rows
    .filter((r) => r.days <= 14 && r.sv >= 15)
    .sort((a, b) => b.perDay - a.perDay);

  const worst = rows.slice().sort((a, b) => b.perDay - a.perDay).slice(0, 12);

  console.log(`\n===== site_visits analysis =====`);
  console.log(`Profiles total:            ${profiles.length}`);
  console.log(`With usable site_visits:   ${rows.length}`);
  console.log(`Skipped (no/zero visits):  ${noVisits}`);
  console.log(`Skipped (no usable date):  ${noDate}`);

  console.log(`\nsite_visits distribution:`);
  console.log(`  min ${svSorted[0]}  |  median ${percentile(svSorted, 50)}  |  p90 ${percentile(svSorted, 90)}  |  p99 ${percentile(svSorted, 99)}  |  max ${svSorted[svSorted.length - 1]}`);
  console.log(`  mean ${mean(svSorted).toFixed(1)}`);

  console.log(`\nImplied visits/week (site_visits ÷ weeks since first seen):`);
  console.log(`  median ${percentile(pwSorted, 50).toFixed(1)}  |  p90 ${percentile(pwSorted, 90).toFixed(1)}  |  p99 ${percentile(pwSorted, 99).toFixed(1)}  |  max ${pwSorted[pwSorted.length - 1].toFixed(1)}`);

  console.log(`\nPlausibility check (a real person rarely exceeds ~1-2 sessions/day):`);
  console.log(`  > 1  visit/day:  ${over1} (${((over1 / rows.length) * 100).toFixed(1)}%)`);
  console.log(`  > 3  visits/day: ${over3} (${((over3 / rows.length) * 100).toFixed(1)}%)`);
  console.log(`  > 10 visits/day: ${over10} (${((over10 / rows.length) * 100).toFixed(1)}%)`);

  console.log(`\nPhysically-impossible cases (created ≤14 days ago but site_visits ≥15): ${impossible.length}`);
  for (const r of impossible.slice(0, 8)) {
    console.log(`  ${r.email}  site_visits=${r.sv}  first_seen=${r.unlock} (${r.days.toFixed(1)}d ago)  => ${r.perDay.toFixed(1)}/day`);
  }

  console.log(`\nTop 12 highest implied frequency:`);
  console.log(`  ${'email'.padEnd(34)} sv     days   /day   /week  pageSum`);
  for (const r of worst) {
    console.log(`  ${String(r.email).padEnd(34)} ${String(r.sv).padEnd(6)} ${r.days.toFixed(0).padEnd(6)} ${r.perDay.toFixed(1).padEnd(6)} ${r.perWeek.toFixed(0).padEnd(6)} ${r.pageSum ?? '-'}`);
  }
}

main().catch((err) => { console.error('\nAnalysis aborted:', err.message); process.exit(1); });
