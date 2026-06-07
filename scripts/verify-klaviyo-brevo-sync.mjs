// Verify the Klaviyo → Brevo migration: sample N profiles, pull each from
// BOTH platforms, and compare the mapped fields field-by-field.
//
// For each Klaviyo profile it computes the EXPECTED Brevo attributes using the
// same buildBrevoAttributes mapping as the worker/migration, then fetches the
// actual Brevo contact and diffs them. Reports per-profile PASS/FAIL.
//
// Requires Node 18+ (global fetch). Run with Node 22:  nvm use 22
//
// Usage:
//   KLAVIYO_API_KEY=pk_xxx BREVO_API_KEY=xkeysib-xxx \
//     node scripts/verify-klaviyo-brevo-sync.mjs            # samples 50
//   ... node scripts/verify-klaviyo-brevo-sync.mjs --sample=100

const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const REVISION = process.env.KLAVIYO_REVISION || '2023-10-15';

const sampleArg = process.argv.find((a) => a.startsWith('--sample='));
const SAMPLE = sampleArg ? Number(sampleArg.split('=')[1]) : 50;
const CONCURRENCY = 5;

// The 8 fields the migration maps. We compare exactly these.
const KNOWN_ATTRS = [
  'FIRSTNAME', 'COMPANY', 'PATH', 'SITE_VISITS',
  'UNLOCK_DATE', 'VISITED_COMPANIES', 'SEARCHED_TERMS', 'VISITED_PAGES',
];

if (!KLAVIYO_API_KEY || !BREVO_API_KEY) {
  console.error('Missing KLAVIYO_API_KEY and/or BREVO_API_KEY env vars. See header for usage.');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- same mapping as cloudflare-worker/worker.js + migration ---------------
function buildBrevoAttributes(firstName, props) {
  const p = props ?? {};
  const attrs = {};
  if (firstName) attrs.FIRSTNAME = firstName;
  if (p.company != null) attrs.COMPANY = p.company;
  if (p.path != null) attrs.PATH = p.path;
  if (p.site_visits != null) attrs.SITE_VISITS = p.site_visits;
  if (p.unlock_date) attrs.UNLOCK_DATE = String(p.unlock_date).slice(0, 10);
  if (p.visited_companies != null) attrs.VISITED_COMPANIES = JSON.stringify(p.visited_companies);
  if (p.searched_terms != null) attrs.SEARCHED_TERMS = JSON.stringify(p.searched_terms);
  if (p.visited_pages != null) attrs.VISITED_PAGES = JSON.stringify(p.visited_pages);
  return attrs;
}

// ---- normalize a value for comparison so type/format quirks don't false-fail
function normalize(attr, value) {
  if (value == null || value === '') return undefined;
  if (attr === 'SITE_VISITS') return Number(value);
  if (attr === 'UNLOCK_DATE') return toYMD(value);
  return String(value);
}

// Brevo may return dates as YYYY-MM-DD, ISO, or DD-MM-YYYY depending on account.
function toYMD(value) {
  const s = String(value);
  let m = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/); // Y-M-D / ISO
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/); // D-M-Y
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return s;
}

// ---- fetch first N Klaviyo profiles ---------------------------------------
async function fetchKlaviyoSample(n) {
  const profiles = [];
  let url = `https://a.klaviyo.com/api/profiles/?page%5Bsize%5D=${Math.min(n, 100)}`;
  while (url && profiles.length < n) {
    const res = await fetch(url, {
      headers: { Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`, revision: REVISION, accept: 'application/json' },
    });
    if (res.status === 429) { await sleep((Number(res.headers.get('retry-after')) || 3) * 1000); continue; }
    if (!res.ok) throw new Error(`Klaviyo GET failed (${res.status}): ${await res.text()}`);
    const data = await res.json();
    for (const p of data.data ?? []) profiles.push(p);
    url = data.links?.next ?? null;
  }
  return profiles.slice(0, n);
}

// ---- fetch one Brevo contact by email -------------------------------------
async function fetchBrevoContact(email) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      headers: { 'api-key': BREVO_API_KEY, accept: 'application/json' },
    });
    if (res.status === 404) return null;
    if (res.status === 429 || res.status >= 500) { await sleep((Number(res.headers.get('retry-after')) || 2 ** attempt) * 1000); continue; }
    if (!res.ok) throw new Error(`Brevo GET ${email} failed (${res.status}): ${await res.text()}`);
    return res.json();
  }
  throw new Error(`Brevo GET ${email}: exhausted retries`);
}

// ---- concurrency pool ------------------------------------------------------
async function runPool(items, worker, concurrency) {
  let next = 0;
  const out = [];
  const runners = Array.from({ length: concurrency }, async () => {
    while (next < items.length) { const i = next++; out[i] = await worker(items[i]); }
  });
  await Promise.all(runners);
  return out;
}

// ---- main ------------------------------------------------------------------
async function main() {
  console.log(`Sampling ${SAMPLE} Klaviyo profiles and comparing against Brevo...\n`);
  const profiles = await fetchKlaviyoSample(SAMPLE);

  const results = await runPool(profiles, async (p) => {
    const email = p.attributes?.email;
    if (!email) return { email: '(no email)', status: 'SKIP', diffs: [] };

    const expected = buildBrevoAttributes(p.attributes?.first_name, p.attributes?.properties);
    const brevo = await fetchBrevoContact(email);
    if (!brevo) return { email, status: 'MISSING', diffs: ['contact not found in Brevo'] };

    const actual = brevo.attributes ?? {};
    const diffs = [];
    for (const attr of KNOWN_ATTRS) {
      const e = normalize(attr, expected[attr]);
      const a = normalize(attr, actual[attr]);
      if (e !== a) diffs.push(`${attr}: klaviyo=${JSON.stringify(e)} brevo=${JSON.stringify(a)}`);
    }
    return { email, status: diffs.length ? 'MISMATCH' : 'OK', diffs };
  }, CONCURRENCY);

  let ok = 0, mismatch = 0, missing = 0, skip = 0;
  for (const r of results) {
    if (r.status === 'OK') { ok++; continue; }
    if (r.status === 'SKIP') { skip++; continue; }
    if (r.status === 'MISSING') missing++;
    if (r.status === 'MISMATCH') mismatch++;
    console.log(`[${r.status}] ${r.email}`);
    for (const d of r.diffs) console.log(`        ${d}`);
  }

  console.log(`\n----- SUMMARY -----`);
  console.log(`Sampled:   ${results.length}`);
  console.log(`Identical: ${ok}`);
  console.log(`Mismatch:  ${mismatch}`);
  console.log(`Missing:   ${missing}`);
  if (skip) console.log(`Skipped:   ${skip} (no email)`);
  console.log(ok === results.length ? '\n✅ All sampled profiles are identical across Klaviyo and Brevo.' : '\n⚠️ Differences found — see lines above.');
}

main().catch((err) => { console.error('\nVerification aborted:', err.message); process.exit(1); });
