# How v2 brand content is generated (caption-grounded)

This documents the **process** that produced the `*.ts` files in this folder, so a
future session can reproduce it for new shops. Each file is a `BrandContent` object
(see `brand-content.model.ts`) whose copy is **grounded in real influencer captions**
— that grounding is what keeps a 1,000+ page rollout out of Google's "scaled content
abuse" territory.

The output is one file per shop + a line in `index.ts`. The *input* is the influencer
caption database.

---

## 1. The data source

A local **MariaDB in XAMPP**: database `py_diski_influencers`, tables `instagram`
(~32k rows) and `tiktok` (~7k rows). Python project that maintains it:
`~/Documents/Projects/python/py_diski_influencers`.

Connect (read-only is fine — never write):
```
/Applications/XAMPP/xamppfiles/bin/mysql -uroot \
  --socket=/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock py_diski_influencers
```
Notes:
- Server is on the socket, not TCP 3306.
- zsh does NOT word-split variables — inline the mysql args, don't put them in a var.
- Append `2>&1 | grep -vi insecure` to drop the password warning.

Key columns: `influencer_name, caption, post_url, post_date, ai_analysis, ai_canonical`.
- **`ai_canonical`** = the canonical webshop slug, already filled in by their AI step,
  and it **matches `src/app/data/discounts.json` slugs 1:1** (e.g. `nakdfashion`,
  `ginatricot`, `gutsgusto`, `geurwolkje`). So **"captions for shop X" = `WHERE ai_canonical = '{slug}'`** — no fuzzy matching needed.
- **`ai_analysis`** = JSON like `[{"webshop":..., "code":..., "percentage":...}]`.

---

## 2. Pick the mode (grounded vs self-authored)

Count captions for the slug first:
```sql
SELECT COUNT(*) total, COUNT(DISTINCT influencer_name) creators
FROM instagram WHERE ai_canonical = '{slug}';
```
- **Rich (≈15+ captions) → caption-grounded** (the NA-KD / Gina Tricot / Guts & Gusto /
  Geurwolkje path).
- **Sparse (e.g. Zalando ~3) → self-authored** from general/verifiable knowledge, no
  fabricated specifics. (Many shops' codes don't come from this pipeline.)

---

## 3. Queries to mine (run per shop)

> **Shortcut:** instead of running these by hand, use the reusable extractor which runs
> all of them at once and returns one JSON bundle (count, mode, discount pattern, top
> creators, caption sample, related shops):
> ```
> python3 light19/scripts/python/extract_brand_captions.py {slug} --sample 40 --pretty
> ```
> It unions Instagram + TikTok and shells out to the XAMPP mysql client over the socket.
> The raw queries below are what it runs (kept here for reference / tweaking).

**Discount pattern** (what % the codes usually are):
```sql
SELECT JSON_UNQUOTE(JSON_EXTRACT(ai_analysis,'$[0].percentage')) pct, COUNT(*) c
FROM instagram WHERE ai_canonical='{slug}' AND ai_analysis IS NOT NULL
GROUP BY pct ORDER BY c DESC LIMIT 6;
```

**Top creators** (for the `creators` section / social proof):
```sql
SELECT influencer_name, COUNT(*) p FROM instagram WHERE ai_canonical='{slug}'
GROUP BY influencer_name ORDER BY p DESC LIMIT 12;
```

**Caption sample** (the raw material to mine for products, seasons, terms, tone):
```sql
SELECT CONCAT('@',influencer_name,' | ',REPLACE(LEFT(caption,240),'\n',' '))
FROM instagram WHERE ai_canonical='{slug}' AND caption IS NOT NULL AND CHAR_LENGTH(caption)>30
ORDER BY post_date DESC LIMIT 30;
```
> ⚠️ **Sample broadly, not just "most recent."** "Recent" biases toward the currently
> dominant language/season. Real lesson from NA-KD: English captions were the *majority*
> (471/644), and the handful of **German** captions revealed a *different* deal (10% vs
> the usual 15%). For production, spread the sample across time and languages so you don't
> miss a pocket. Multilingual input -> Dutch output is the model.

**Related shops** (internal linking via shared-influencer co-occurrence — no taxonomy needed):
```sql
SELECT ai_canonical rel, COUNT(DISTINCT influencer_name) shared
FROM instagram
WHERE influencer_name IN (SELECT DISTINCT influencer_name FROM instagram WHERE ai_canonical='{slug}')
  AND ai_canonical IS NOT NULL AND ai_canonical NOT IN ('{slug}','UNKNOWN')
GROUP BY ai_canonical ORDER BY shared DESC LIMIT 16;
```
Store the top ~12 slugs in the object's `related` field. The component cross-filters to
shops that actually have codes and tops up from a default pool. (This automatically
reconstructs the niche: fashion shops pull fashion neighbours; Geurwolkje, a fragrance
brand, pulls home/lifestyle/gift neighbours.)

---

## 4. Synthesize the BrandContent object

Fill the schema fields (`brand-content.model.ts`): `heroLede, about[], why[], trending[],
codeInfo[], creators[], tips[], faq[], related[]`. Ground each in what the captions
actually say — the code mechanic (e.g. "personal NAAM15 code = 15% off, 48h, excl. sale &
newest collection"), the trending products, which creators push it, the real terms.

**Grounding guardrails (this is the whole point — keep them):**
- **Synthesize, never paste** captions verbatim (copyright). Captions are raw material.
- **Only state what's in the data or genuinely verifiable.** Hedge with "meestal",
  "vrijwel alle" instead of fabricating absolutes.
- **Brand facts from general knowledge** (founding year, HQ city) are NOT self-verifying —
  use sparingly and flag for a human to confirm.
- **No fake signals.** We deliberately did NOT add a fake star rating / AggregateRating —
  fabricated ratings are a spam/trust risk.
- **Differentiate genuinely** per shop; never a template with the brand name swapped in.

---

## 5. Write a data file (no registry, no .ts)

Brand content is plain **JSON data**, NOT TypeScript, and it is NEVER bundled —
neither into the browser nor the server bundle. It is read from disk at
prerender time and inlined into each page's HTML via TransferState. Adding a shop
is literally "drop a file":

- Save as `src/app/company-codes-v2/brand-content/data/{slug}.json`, where
  `{slug}` is the REAL slug (dots and all, e.g. `bodylab.nl.json`,
  `glutespop.com.json`) — it must match `discounts.json` / `ai_canonical`.
- The file is a raw `BrandContent` object (same fields as `brand-content.model.ts`).
- That's it — no `index.ts`, no imports, no registry edits. The server loader
  (`brand-content.server.ts`) reads `data/{slug}.json` by name at build.
- To PREVIEW it (noindexed `/v2/{slug}`): `scripts/fill-routes.js` auto-adds a
  `/v2/{slug}` prerender route for every data file NOT on the go-live allowlist.
- To take it LIVE on the real `/{slug}` route: add the slug to
  `brand-content/live-v2-slugs.ts` (it must also be in `discounts.json`/routes.txt
  so it prerenders).

Verify (Node v22 via nvm; shell default node is too old):
```
export PATH="$HOME/.nvm/versions/node/v22.14.0/bin:$PATH"
npm run build:prod
# content is inlined in the prerendered HTML, and absent from every JS bundle:
grep -c "korting bij" dist/light19/browser/{slug}/index.html          # > 0
grep -rl "<a distinctive phrase from the copy>" dist/light19/browser/*.js   # nothing
```

(One-off migration of the original `.ts` content objects to JSON was done with
`scripts/migrate-brand-content-to-json.js`.)

---

## Pilot shops done this way
nakdfashion, ginatricot, gutsgusto, geurwolkje (caption-grounded) + zalando (self-authored,
caption-poor). See also `../live-rollout-plan.txt` for serving v2 on the real route later.

## Scaling note
At 1,000+ shops this should become an automated engine (a script in the Python stack that
runs these queries, calls the model to emit the BrandContent object, and writes the file),
run in reviewed batches — NOT 1,000 blind generations. The engine just writes
`data/{slug}.json` files; bundle size is already O(1) per page regardless of shop count
(content is read from disk at prerender and inlined per page via TransferState, never
bundled or served as a CDN asset — see the data-flow note in `../README.md`).
