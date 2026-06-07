// One-time backfill: copy each Klaviyo profile's `created` timestamp (the true
// "first entered the system" date) into the Brevo FIRST_SEEN attribute.
//
// Needed because Brevo's own createdAt for migrated contacts is the import date
// (2026-06-07), not the original Klaviyo creation date.
//
// Create the Brevo attribute first: Contacts → Settings → Contact attributes →
//   FIRST_SEEN  (type: Date)
//
// Requires Node 18+. Run with Node 22.
//
// Usage:
//   KLAVIYO_API_KEY=pk_xxx BREVO_API_KEY=xkeysib-xxx node scripts/backfill-first-seen.mjs --dry-run
//   KLAVIYO_API_KEY=pk_xxx BREVO_API_KEY=xkeysib-xxx node scripts/backfill-first-seen.mjs --limit=20
//   KLAVIYO_API_KEY=pk_xxx BREVO_API_KEY=xkeysib-xxx node scripts/backfill-first-seen.mjs

import { writeFileSync } from 'node:fs';

const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const REVISION = process.env.KLAVIYO_REVISION || '2023-10-15';

const DRY_RUN = process.argv.includes('--dry-run');
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : null;
const CONCURRENCY = 5;

if (!KLAVIYO_API_KEY || !BREVO_API_KEY) {
  console.error('Missing KLAVIYO_API_KEY and/or BREVO_API_KEY env vars. See header for usage.');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
    if (LIMIT && profiles.length >= LIMIT) break;
    url = data.links?.next ?? null;
  }
  process.stdout.write('\n');
  return LIMIT ? profiles.slice(0, LIMIT) : profiles;
}

async function setFirstSeen(email, firstSeen) {
  const payload = { email, updateEnabled: true, attributes: { FIRST_SEEN: firstSeen } };
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { ok: true, status: res.status };
    if (res.status === 429 || res.status >= 500) { await sleep((Number(res.headers.get('retry-after')) || 2 ** attempt) * 1000); continue; }
    return { ok: false, status: res.status, detail: await res.text() };
  }
  return { ok: false, status: 429, detail: 'exhausted retries' };
}

async function runPool(items, worker, concurrency) {
  let next = 0;
  const runners = Array.from({ length: concurrency }, async () => {
    while (next < items.length) await worker(items[next++]);
  });
  await Promise.all(runners);
}

async function main() {
  console.log(`Backfilling Brevo FIRST_SEEN from Klaviyo created${DRY_RUN ? ' (DRY RUN)' : ''}${LIMIT ? `, limit ${LIMIT}` : ''}`);
  const profiles = await fetchAllKlaviyoProfiles();

  const targets = [];
  let skipped = 0;
  for (const p of profiles) {
    const email = p.attributes?.email;
    const created = p.attributes?.created;
    if (!email || !created) { skipped++; continue; }
    targets.push({ email, firstSeen: String(created).slice(0, 10) }); // Brevo date: YYYY-MM-DD
  }
  console.log(`Profiles with email + created: ${targets.length}  |  skipped: ${skipped}`);

  if (DRY_RUN) {
    console.log('\n--- DRY RUN: first 5 FIRST_SEEN values that would be written ---');
    for (const t of targets.slice(0, 5)) console.log(`  ${t.email} -> ${t.firstSeen}`);
    console.log('\nNothing written. Re-run without --dry-run to apply.');
    return;
  }

  console.log(`\nWriting FIRST_SEEN for ${targets.length} contacts (concurrency ${CONCURRENCY})...`);
  let done = 0, ok = 0;
  const failures = [];
  await runPool(targets, async (t) => {
    const r = await setFirstSeen(t.email, t.firstSeen);
    done++;
    if (r.ok) ok++; else failures.push({ email: t.email, status: r.status, detail: r.detail });
    if (done % 100 === 0 || done === targets.length) {
      process.stdout.write(`\r  ${done}/${targets.length} processed (${ok} ok, ${failures.length} failed)`);
    }
  }, CONCURRENCY);
  process.stdout.write('\n');

  console.log(`\nDone. Succeeded: ${ok}  |  Failed: ${failures.length}`);
  if (failures.length) {
    const outPath = new URL('./first-seen-backfill-failures.json', import.meta.url).pathname;
    writeFileSync(outPath, JSON.stringify(failures, null, 2));
    console.log(`Wrote failures to ${outPath}. Safe to re-run (idempotent).`);
  }
}

main().catch((err) => { console.error('\nBackfill aborted:', err.message); process.exit(1); });
