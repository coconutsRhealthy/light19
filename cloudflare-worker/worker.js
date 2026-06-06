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

        const patchBody = {
          data: {
            type: "profile",
            id: profileId,
            attributes: {
              ...body.data.attributes,
              properties: mergeProperties(existingProps, incomingProps)
            }
          }
        };

        const patchRes = await fetch(`https://a.klaviyo.com/api/profiles/${profileId}/`, {
          method: "PATCH",
          headers: klaviyoHeaders,
          body: JSON.stringify(patchBody)
        });
        const text = await patchRes.text();
        return new Response(text, { status: patchRes.status, headers: corsHeaders });

      } else {
        // Profile doesn't exist (POST only): create new
        const klaviyoRes = await fetch("https://a.klaviyo.com/api/profiles/", {
          method: "POST",
          headers: klaviyoHeaders,
          body: JSON.stringify(body)
        });
        const text = await klaviyoRes.text();
        return new Response(text, { status: klaviyoRes.status, headers: corsHeaders });
      }

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
  }
};

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
