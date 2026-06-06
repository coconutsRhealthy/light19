// DANGER: deletes EVERY contact in the Brevo account.
//
// Pages through all Brevo contacts and DELETEs each one. Intended to wipe a
// bad import so you can start from a clean slate. Deleting contacts does NOT
// delete lists — just the contacts (and their list memberships).
//
// Requires Node 18+ (global fetch). Run with Node 22:  nvm use 22
//
// SAFETY: without --yes-delete-everything it only COUNTS and lists a sample,
// and deletes nothing. You must pass the flag to actually delete.
//
// Usage:
//   BREVO_API_KEY=xkeysib-xxx node scripts/delete-all-brevo-contacts.mjs
//        -> counts contacts, deletes nothing (safe preview)
//   BREVO_API_KEY=xkeysib-xxx node scripts/delete-all-brevo-contacts.mjs --yes-delete-everything
//        -> actually deletes ALL contacts

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const CONFIRMED = process.argv.includes('--yes-delete-everything');
const CONCURRENCY = 5;

if (!BREVO_API_KEY) {
  console.error('Missing BREVO_API_KEY env var. See header for usage.');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- fetch every contact id (limit/offset pagination) ----------------------
async function fetchAllContacts() {
  const all = [];
  const limit = 1000;
  let offset = 0;

  for (;;) {
    const url = `https://api.brevo.com/v3/contacts?limit=${limit}&offset=${offset}&sort=desc`;
    const res = await fetch(url, {
      headers: { 'api-key': BREVO_API_KEY, accept: 'application/json' },
    });

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get('retry-after')) || 3;
      await sleep(retryAfter * 1000);
      continue;
    }
    if (!res.ok) {
      throw new Error(`Brevo GET contacts failed (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    const batch = data.contacts ?? [];
    if (batch.length === 0) break;

    for (const c of batch) all.push({ id: c.id, email: c.email });
    process.stdout.write(`\r  fetched ${all.length} contacts...`);
    offset += limit;
  }

  process.stdout.write('\n');
  return all;
}

// ---- delete one contact by id, retry on 429 / 5xx --------------------------
async function deleteContact(contact) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`https://api.brevo.com/v3/contacts/${contact.id}`, {
      method: 'DELETE',
      headers: { 'api-key': BREVO_API_KEY, accept: 'application/json' },
    });

    if (res.status === 204 || res.status === 404) return { ok: true }; // gone (or already gone)

    if (res.status === 429 || res.status >= 500) {
      const retryAfter = Number(res.headers.get('retry-after')) || 2 ** attempt;
      await sleep(retryAfter * 1000);
      continue;
    }

    return { ok: false, status: res.status, detail: await res.text() };
  }
  return { ok: false, status: 429, detail: 'exhausted retries' };
}

// ---- simple concurrency pool ----------------------------------------------
async function runPool(items, worker, concurrency) {
  let next = 0;
  const runners = Array.from({ length: concurrency }, async () => {
    while (next < items.length) await worker(items[next++]);
  });
  await Promise.all(runners);
}

// ---- main ------------------------------------------------------------------
async function main() {
  console.log('Fetching all Brevo contacts...');
  const contacts = await fetchAllContacts();
  console.log(`Total contacts in Brevo: ${contacts.length}`);

  if (contacts.length === 0) {
    console.log('Nothing to delete. Brevo is already empty.');
    return;
  }

  if (!CONFIRMED) {
    console.log('\nSample of contacts that WOULD be deleted (first 5):');
    for (const c of contacts.slice(0, 5)) console.log(`  - ${c.email} (id ${c.id})`);
    console.log(`\nThis is a SAFE PREVIEW — nothing was deleted.`);
    console.log(`To delete all ${contacts.length} contacts, re-run with:  --yes-delete-everything`);
    return;
  }

  console.log(`\nDeleting ${contacts.length} contacts (concurrency ${CONCURRENCY})...`);
  let done = 0;
  let ok = 0;
  const failures = [];

  await runPool(
    contacts,
    async (contact) => {
      const result = await deleteContact(contact);
      done++;
      if (result.ok) ok++;
      else failures.push({ email: contact.email, id: contact.id, status: result.status, detail: result.detail });
      if (done % 100 === 0 || done === contacts.length) {
        process.stdout.write(`\r  ${done}/${contacts.length} processed (${ok} deleted, ${failures.length} failed)`);
      }
    },
    CONCURRENCY,
  );
  process.stdout.write('\n');

  console.log(`\nDone. Deleted: ${ok}  |  Failed: ${failures.length}`);
  if (failures.length) {
    console.log('Some deletes failed (shown above counts). Re-run to retry — already-deleted contacts are skipped.');
    console.log(JSON.stringify(failures.slice(0, 10), null, 2));
  }
}

main().catch((err) => {
  console.error('\nAborted:', err.message);
  process.exit(1);
});
