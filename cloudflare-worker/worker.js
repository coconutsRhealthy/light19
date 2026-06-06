export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const klaviyoHeaders = {
      "Content-Type": "application/json",
      "Authorization": `Klaviyo-API-Key ${env.KLAVIYO_API_KEY}`,
      "revision": "2023-10-15"
    };

    try {
      const body = await request.json();
      const email = body?.data?.attributes?.email;

      if (!email) {
        return new Response(JSON.stringify({ error: "No email provided" }), { status: 400, headers: corsHeaders });
      }

      const firstName = body?.data?.attributes?.first_name;

      // Step 1: look up existing profile by email
      const searchRes = await fetch(
        `https://a.klaviyo.com/api/profiles/?filter=equals(email,"${email}")`,
        { method: "GET", headers: klaviyoHeaders }
      );
      const searchData = await searchRes.json();
      const existingProfile = searchData?.data?.[0];

      if (request.method === "PATCH" && !existingProfile) {
        return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404, headers: corsHeaders });
      }

      if (existingProfile) {
        // Profile exists: merge and PATCH
        const profileId = existingProfile.id;
        const existingProps = existingProfile?.attributes?.properties ?? {};
        const incomingProps = body?.data?.attributes?.properties ?? {};
        const finalProps = mergeProperties(existingProps, incomingProps);

        const patchBody = {
          data: {
            type: "profile",
            id: profileId,
            attributes: {
              ...body.data.attributes,
              properties: finalProps
            }
          }
        };

        const patchRes = await fetch(`https://a.klaviyo.com/api/profiles/${profileId}/`, {
          method: "PATCH",
          headers: klaviyoHeaders,
          body: JSON.stringify(patchBody)
        });
        const text = await patchRes.text();

        // Mirror the exact same (merged) data to Brevo — runs after the
        // response, never blocks or breaks the Klaviyo path.
        ctx.waitUntil(sendToBrevo(env, email, firstName, finalProps));

        return new Response(text, { status: patchRes.status, headers: corsHeaders });

      } else {
        // Profile doesn't exist (POST only): create new
        const klaviyoRes = await fetch("https://a.klaviyo.com/api/profiles/", {
          method: "POST",
          headers: klaviyoHeaders,
          body: JSON.stringify(body)
        });
        const text = await klaviyoRes.text();

        // Mirror the exact same data to Brevo — runs after the response,
        // never blocks or breaks the Klaviyo path.
        const incomingProps = body?.data?.attributes?.properties ?? {};
        ctx.waitUntil(sendToBrevo(env, email, firstName, incomingProps));

        return new Response(text, { status: klaviyoRes.status, headers: corsHeaders });
      }

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
  }
};

// ---- Brevo mirror ----------------------------------------------------------

async function sendToBrevo(env, email, firstName, props) {
  try {
    if (!env.BREVO_API_KEY) return; // safe no-op until the secret is configured

    const payload = {
      email,
      updateEnabled: true, // upsert: create if new, update if the contact already exists
      attributes: buildBrevoAttributes(firstName, props)
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

    if (!res.ok) {
      console.error(`Brevo sync failed (${res.status}): ${await res.text()}`);
    }
  } catch (err) {
    // A Brevo failure must never affect the Klaviyo response
    console.error("Brevo sync error:", err?.message ?? err);
  }
}

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
  if (p.searched_terms != null)   attrs.SEARCHED_TERMS   = JSON.stringify(p.searched_terms);
  if (p.visited_pages != null)    attrs.VISITED_PAGES    = JSON.stringify(p.visited_pages);

  return attrs;
}

// ---- Klaviyo merge helpers --------------------------------------------------

function mergeProperties(existing, incoming) {
  const merged = { ...existing };

  for (const key of Object.keys(incoming)) {
    const existingVal = existing[key];
    const incomingVal = incoming[key];

    if (typeof incomingVal === 'number' && typeof existingVal === 'number') {
      // Add numbers together
      merged[key] = existingVal + incomingVal;
    } else if (isCountMap(incomingVal) && isCountMap(existingVal)) {
      // Merge count maps
      merged[key] = mergeCountMaps(existingVal, incomingVal);
    } else if (existingVal === undefined || existingVal === null) {
      // Only set if not already present (e.g. unlock_date, path, company)
      merged[key] = incomingVal;
    }
    // If existing value is present and not a number/countmap → keep existing, ignore incoming
  }

  return merged;
}

function isCountMap(val) {
  return val !== null &&
    typeof val === 'object' &&
    !Array.isArray(val) &&
    Object.values(val).every(v => typeof v === 'number');
}

function mergeCountMaps(existing, incoming) {
  const merged = { ...existing };
  for (const [key, count] of Object.entries(incoming)) {
    merged[key] = (merged[key] ?? 0) + count;
  }
  return merged;
}
