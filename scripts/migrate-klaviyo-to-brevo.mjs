// One-time backfill: copy all existing Klaviyo profiles into Brevo.
//
// Pages through every Klaviyo profile via the API and upserts each one into
// Brevo (POST /v3/contacts, updateEnabled:true), using the SAME attribute
// mapping as the Cloudflare Worker (cloudflare-worker/worker.js) so the
// backfilled contacts are identical to what the live mirror produces.
//
// Requires Node 18+ (uses global fetch). Run with Node 22:  nvm use 22
//
// Usage:
//   KLAVIYO_API_KEY=pk_xxx BREVO_API_KEY=xkeysib-xxx \
//     node scripts/migrate-klaviyo-to-brevo.mjs --dry-run
//   KLAVIYO_API_KEY=pk_xxx BREVO_API_KEY=xkeysib-xxx \
//     node scripts/migrate-klaviyo-to-brevo.mjs --limit=20
//   KLAVIYO_API_KEY=pk_xxx BREVO_API_KEY=xkeysib-xxx \
//     node scripts/migrate-klaviyo-to-brevo.mjs           # full run
//
// Optional env:
//   BREVO_LIST_ID=123        add every contact to this Brevo list id
//   KLAVIYO_REVISION=2023-10-15   override Klaviyo API revision
//
// Flags:
//   --dry-run     fetch from Klaviyo + print a sample, write NOTHING to Brevo
//   --limit=N     only process the first N profiles (handy for a test run)

import { writeFileSync } from 'node:fs';

const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LIST_ID = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : null;
const REVISION = process.env.KLAVIYO_REVISION || '2023-10-15';

const DRY_RUN = process.argv.includes('--dry-run');
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : null;

const BREVO_CONCURRENCY = 5; // stay comfortably under Brevo's rate limit

if (!KLAVIYO_API_KEY || !BREVO_API_KEY) {
  console.error('Missing KLAVIYO_API_KEY and/or BREVO_API_KEY env vars. See header for usage.');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- Brevo attribute mapping — copied VERBATIM from cloudflare-worker/worker.js
// Keep this in sync with the worker so backfill == live data.
function buildBrevoAttributes(firstName, props) {
  const p = props ?? {};
  const attrs = {};

  if (firstName) attrs.FIRSTNAME = firstName;
  if (p.company != null) attrs.COMPANY = p.company;
  if (p.path != null) attrs.PATH = p.path;
  if (p.site_visits != null) attrs.SITE_VISITS = p.site_visits;
  if (p.unlock_date) attrs.UNLOCK_DATE = String(p.unlock_date).slice(0, 10); // Brevo dates: YYYY-MM-DD

  // Brevo can't store nested objects → keep the count-maps as JSON text
  if (p.visited_companies != null) attrs.VISITED_COMPANIES = JSON.stringify(p.visited_companies);
  if (p.searched_terms != null) attrs.SEARCHED_TERMS = JSON.stringify(p.searched_terms);
  if (p.visited_pages != null) attrs.VISITED_PAGES = JSON.stringify(p.visited_pages);

  return attrs;
}

// ---- Klaviyo: fetch every profile (cursor pagination, 100 per page) --------
async function fetchAllKlaviyoProfiles() {
  const profiles = [];
  let url = 'https://a.klaviyo.com/api/profiles/?page%5Bsize%5D=100';

  while (url) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        revision: REVISION,
        accept: 'application/json',
      },
    });

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get('retry-after')) || 3;
      console.log(`  Klaviyo rate-limited, waiting ${retryAfter}s...`);
      await sleep(retryAfter * 1000);
      continue;
    }
    if (!res.ok) {
      throw new Error(`Klaviyo GET failed (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    for (const p of data.data ?? []) profiles.push(p);
    process.stdout.write(`\r  fetched ${profiles.length} profiles...`);

    if (LIMIT && profiles.length >= LIMIT) break;
    url = data.links?.next ?? null;
  }

  process.stdout.write('\n');
  return LIMIT ? profiles.slice(0, LIMIT) : profiles;
}

// ---- Brevo: upsert a single contact, with retry on 429 / 5xx ---------------
async function upsertBrevoContact(contact) {
  const payload = { email: contact.email, updateEnabled: true, attributes: contact.attributes };
  if (BREVO_LIST_ID) payload.listIds = [BREVO_LIST_ID];

  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) return { ok: true, status: res.status }; // 201 created / 204 updated

    if (res.status === 429 || res.status >= 500) {
      const retryAfter = Number(res.headers.get('retry-after')) || 2 ** attempt;
      await sleep(retryAfter * 1000);
      continue;
    }

    // 4xx other than 429 → permanent for this contact (e.g. invalid email)
    return { ok: false, status: res.status, detail: await res.text() };
  }
  return { ok: false, status: 429, detail: 'exhausted retries' };
}

// ---- simple concurrency pool ----------------------------------------------
async function runPool(items, worker, concurrency) {
  let next = 0;
  const runners = Array.from({ length: concurrency }, async () => {
    while (next < items.length) {
      const idx = next++;
      await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
}

// ---- main ------------------------------------------------------------------
async function main() {
  console.log(`Klaviyo → Brevo migration${DRY_RUN ? ' (DRY RUN)' : ''}${LIMIT ? `, limit ${LIMIT}` : ''}`);
  console.log('Fetching profiles from Klaviyo...');
  const profiles = await fetchAllKlaviyoProfiles();
  console.log(`Total Klaviyo profiles: ${profiles.length}`);

  const contacts = [];
  let skippedNoEmail = 0;
  for (const p of profiles) {
    const email = p.attributes?.email;
    if (!email) {
      skippedNoEmail++;
      continue;
    }
    contacts.push({
      email,
      attributes: buildBrevoAttributes(p.attributes?.first_name, p.attributes?.properties),
    });
  }
  console.log(`Mappable contacts (with email): ${contacts.length}  |  skipped (no email): ${skippedNoEmail}`);

  if (DRY_RUN) {
    console.log('\n--- DRY RUN: sample of what would be sent to Brevo (first 3) ---');
    console.log(JSON.stringify(contacts.slice(0, 3), null, 2));
    console.log('\nNothing was written to Brevo. Re-run without --dry-run to migrate.');
    return;
  }

  console.log(`\nUpserting ${contacts.length} contacts into Brevo (concurrency ${BREVO_CONCURRENCY})...`);
  let done = 0;
  let ok = 0;
  const failures = [];

  await runPool(
    contacts,
    async (contact) => {
      const result = await upsertBrevoContact(contact);
      done++;
      if (result.ok) ok++;
      else failures.push({ email: contact.email, status: result.status, detail: result.detail });
      if (done % 100 === 0 || done === contacts.length) {
        process.stdout.write(`\r  ${done}/${contacts.length} processed (${ok} ok, ${failures.length} failed)`);
      }
    },
    BREVO_CONCURRENCY,
  );
  process.stdout.write('\n');

  console.log(`\nDone. Succeeded: ${ok}  |  Failed: ${failures.length}`);
  if (failures.length) {
    const outPath = new URL('./brevo-migration-failures.json', import.meta.url).pathname;
    writeFileSync(outPath, JSON.stringify(failures, null, 2));
    console.log(`Wrote ${failures.length} failures to ${outPath}`);
    console.log('You can safely re-run the script — upsert is idempotent (it updates existing contacts).');
  }
}

main().catch((err) => {
  console.error('\nMigration aborted:', err.message);
  process.exit(1);
});
