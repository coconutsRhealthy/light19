export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (!env.BREVO_API_KEY) {
      return new Response(JSON.stringify({ error: "BREVO_API_KEY not configured" }), { status: 500, headers: corsHeaders });
    }

    try {
      const body = await request.json();
      const email = body?.data?.attributes?.email;

      if (!email) {
        return new Response(JSON.stringify({ error: "No email provided" }), { status: 400, headers: corsHeaders });
      }

      const firstName = body?.data?.attributes?.first_name;
      const incomingProps = body?.data?.attributes?.properties ?? {};

      // Look the contact up first, purely to get FIRST_SEEN right:
      //  - present → preserve the stored FIRST_SEEN (true first interaction)
      //  - absent  → brand-new contact, so today IS its first-seen
      //  - unknown → a transient Brevo error; omit FIRST_SEEN rather than risk
      //              clobbering an existing value (Brevo keeps what it has).
      const look = await lookupBrevoContact(env, email);
      let firstSeen;
      if (look.status === "present") {
        firstSeen = look.contact?.attributes?.FIRST_SEEN;
      } else if (look.status === "absent") {
        firstSeen = new Date().toISOString().slice(0, 10);
      }

      // Brevo's stored EVENTS set (append-only) — read now so we can merge, never
      // clobber, whatever intentional conversions this contact already has. Only
      // trust the read when the lookup actually succeeded (present/absent); on a
      // transient "unknown" we must NOT touch EVENTS or we'd wipe the stored set.
      const existingEvents = look.contact?.attributes?.EVENTS;
      const eventsKnown = look.status === "present" || look.status === "absent";

      // updateEnabled makes this a single upsert for both POST (new unlock) and
      // PATCH (returning visitor). If a contact ever went missing, a PATCH now
      // recreates it from the client's cumulative totals instead of failing.
      const payload = {
        email,
        updateEnabled: true,
        attributes: buildBrevoAttributes(firstName, incomingProps, firstSeen, existingEvents, eventsKnown)
      };

      if (env.BREVO_LIST_ID) {
        payload.listIds = [Number(env.BREVO_LIST_ID)];
      }

      const res = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "api-key": env.BREVO_API_KEY,
          "Content-Type": "application/json",
          "accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      if (!res.ok) {
        console.error(`Brevo upsert failed (${res.status}): ${text}`);
      }
      // Brevo returns 201 + {id} on create, 204 (empty) on update.
      return new Response(text, { status: res.status, headers: corsHeaders });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
  }
};

// ---- Brevo helpers ---------------------------------------------------------

// Returns { status: "present"|"absent"|"unknown", contact }. A lookup error is
// "unknown" (not "absent") so we never treat a transient failure as a new contact.
async function lookupBrevoContact(env, email) {
  try {
    const res = await fetch("https://api.brevo.com/v3/contacts/" + encodeURIComponent(email), {
      method: "GET",
      headers: { "api-key": env.BREVO_API_KEY, "accept": "application/json" }
    });
    if (res.status === 404) return { status: "absent", contact: null };
    if (res.ok) return { status: "present", contact: await res.json() };
    return { status: "unknown", contact: null };
  } catch {
    return { status: "unknown", contact: null };
  }
}

function buildBrevoAttributes(firstName, props, firstSeen, existingEvents, eventsKnown) {
  const p = props ?? {};
  const attrs = {};

  if (firstName) attrs.FIRSTNAME = firstName;
  if (p.company != null) attrs.COMPANY = p.company;
  if (p.path != null) attrs.PATH = p.path;
  if (p.site_visits != null) attrs.SITE_VISITS = p.site_visits;
  if (p.unlock_date) attrs.UNLOCK_DATE = String(p.unlock_date).slice(0, 10); // Brevo dates: YYYY-MM-DD
  if (firstSeen) attrs.FIRST_SEEN = String(firstSeen).slice(0, 10);

  // EVENTS: durable, append-only set of intentional conversions
  // (code_unlock, newsletter, app_waitlist), stored as a comma-separated text
  // attribute. Read-merged against Brevo's stored value so it only ever GROWS —
  // unlike PATH (last-touch) it survives later overwrites, localStorage clears
  // and multi-device. Only touched when the client sends an `event` (i.e. on an
  // actual conversion); plain profile syncs omit it and leave Brevo's value be.
  if (eventsKnown && p.event != null && String(p.event).trim() !== "") {
    const prior = String(existingEvents ?? "")
      .split(",").map(s => s.trim()).filter(Boolean);
    attrs.EVENTS = Array.from(new Set([...prior, String(p.event).trim()])).join(",");
  }

  // Brevo can't store nested objects → keep the count-maps as JSON text
  if (p.visited_companies != null) attrs.VISITED_COMPANIES = JSON.stringify(p.visited_companies);
  if (p.searched_terms != null)   attrs.SEARCHED_TERMS   = JSON.stringify(p.searched_terms);
  if (p.visited_pages != null)    attrs.VISITED_PAGES    = JSON.stringify(p.visited_pages);

  return attrs;
}
