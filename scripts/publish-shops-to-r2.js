// Publishes the page universe to R2 as shops.json — the feed that tells the diski
// app which shops have a page on diski.nl even when they have no code today.
//
//   node scripts/publish-shops-to-r2.js
//   node scripts/publish-shops-to-r2.js --dry-run          (build it, don't upload)
//   node scripts/publish-shops-to-r2.js --out <path>       (also write a local copy)
//
// WHY THIS EXISTS
// The codes feed (discounts.json, published by diski-input-insta) carries real codes
// and nothing else — 767 shops today. This repo knows about 1230 shops that have
// earned a page, and fills the gap itself: fetch-discounts.js writes a newsletter row
// for the 897 with no live code, which is what keeps their pages alive.
//
// The app cannot do that. 414 of those shops have brand content and no affiliate link,
// and that fact lives only in this repo. So the app simply did not know they existed.
//
// WHAT THIS PUBLISHES — facts, not rendering. A row says "this shop has a page, here is
// its affiliate link, here is which content renders it". It deliberately does NOT carry
// the newsletter text or the 10%: those are THIS site's answer to "no code", and the app
// gives a different one (a newsletter CTA behind the affiliate click-out where there is
// a link to fire, a follow where there isn't). Ship the question, let each consumer
// answer it. Putting `aanmelden voor nieuwsbrief, 10` in a feed is how you end up with a
// consumer rendering "10% korting" for a shop that has no offer — the same trap the old
// invented dummy/backup codes fell into.
//
// NON-FATAL BY DESIGN. This runs inside build:prod, and the WEBSITE does not need the
// upload to succeed — it reads its own generated discounts.json, not this feed. So a
// missing .env or a dead network warns and exits 0. Failing the site build over an app
// feed would be the wrong trade.
//
// Credentials: light19/.env (gitignored) — R2_ACCOUNT_ID / R2_ACCESS_KEY / R2_SECRET_KEY,
// the same three the diski-input-insta publisher uses. Copy them from
// diski-input-insta/.env or claude_diski_data/.env. This is the first thing in this repo
// that WRITES to the bucket; everything else here only reads it.
//
// Zero dependencies: SigV4 signed with node:crypto, sent with global fetch. Needs Node 22
// for process.loadEnvFile — the same requirement build:prod already has.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { buildUniverse } = require('./shop-universe');

const ENV_PATH = path.join(__dirname, '../.env');
if (fs.existsSync(ENV_PATH)) process.loadEnvFile(ENV_PATH);

const BUCKET = 'promotions';
const KEY = 'shops.json';
const REGION = 'auto';
const PUBLIC_URL = `https://pub-a3be569620e4415b916e737210363aee.r2.dev/${KEY}`;

// =========================
// 1. Build the payload
// =========================

// `shop` is the LOWERCASED slug, because that is the join key every consumer already
// uses — the codes feed, shop_registry.json, logos.json and the app's Catalog all key
// on it. The original casing is a light19 URL detail (fill-routes.js takes it verbatim)
// and means nothing to the app, so it stays out of the feed.
function buildPayload() {
  const universe = buildUniverse();

  const shops = universe.map(entry => {
    const row = { shop: entry.key };
    if (entry.affiliateUrl) row.affiliate = entry.affiliateUrl;
    if (entry.page) row.page = entry.page;
    return row;
  });

  return {
    generated: new Date().toISOString(),
    count: shops.length,
    shops,
  };
}

// =========================
// 2. Sign + upload (AWS SigV4, no SDK)
// =========================

const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');
const hmac = (key, data) => crypto.createHmac('sha256', key).update(data).digest();

function signingKey(secret, datestamp) {
  let key = Buffer.from(`AWS4${secret}`, 'utf8');
  for (const part of [datestamp, REGION, 's3', 'aws4_request']) key = hmac(key, part);
  return key;
}

async function upload(body, creds) {
  const host = `${creds.accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${BUCKET}/${KEY}`;
  const contentType = 'application/json; charset=utf-8';
  const payloadHash = sha256(body);

  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const datestamp = amzDate.slice(0, 8);

  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = [
    'PUT',
    canonicalUri,
    '',
    `content-type:${contentType}`,
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
    '',
    signedHeaders,
    payloadHash,
  ].join('\n');

  const scope = `${datestamp}/${REGION}/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    sha256(canonicalRequest),
  ].join('\n');

  const signature = hmac(signingKey(creds.secretKey, datestamp), stringToSign).toString('hex');

  const response = await fetch(`https://${host}${canonicalUri}`, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
      Authorization:
        `AWS4-HMAC-SHA256 Credential=${creds.accessKey}/${scope}, ` +
        `SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`R2 upload failed: ${response.status} ${response.statusText}\n${await response.text()}`);
  }
}

function readCredentials() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKey = process.env.R2_ACCESS_KEY;
  const secretKey = process.env.R2_SECRET_KEY;
  if (!accountId || !accessKey || !secretKey) return null;
  return { accountId, accessKey, secretKey };
}

// =========================
// 3. Main
// =========================

async function main() {
  const payload = buildPayload();
  const body = JSON.stringify(payload);

  const withAffiliate = payload.shops.filter(s => s.affiliate).length;
  const withPage = payload.shops.filter(s => s.page).length;
  console.log(
    `[publish-shops] ${payload.count} shops, ${(body.length / 1024).toFixed(0)} KB ` +
    `(${withAffiliate} with an affiliate link, ${withPage} with brand content).`,
  );

  const outIndex = process.argv.indexOf('--out');
  if (outIndex !== -1 && process.argv[outIndex + 1]) {
    const outPath = path.resolve(process.argv[outIndex + 1]);
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n');
    console.log(`[publish-shops] Wrote ${outPath}`);
  }

  if (process.argv.includes('--dry-run')) {
    console.log('[publish-shops] --dry-run: nothing uploaded.');
    return;
  }

  const creds = readCredentials();
  if (!creds) {
    console.warn(
      '[publish-shops] No R2 credentials (R2_ACCOUNT_ID / R2_ACCESS_KEY / R2_SECRET_KEY ' +
      'in light19/.env) — skipping the upload. The website build is unaffected; the app ' +
      'keeps whatever shops.json it last fetched.',
    );
    return;
  }

  try {
    await upload(body, creds);
    console.log(`[publish-shops] Published to s3://${BUCKET}/${KEY}`);
    console.log(`[publish-shops] ${PUBLIC_URL}`);
  } catch (err) {
    // Deliberately not fatal — see the header. The site does not read this feed.
    console.warn(`[publish-shops] Upload failed, continuing the build: ${err.message}`);
  }
}

main().catch(err => {
  // A throw from buildUniverse() means the affiliate service or the content dirs changed
  // shape. That IS worth failing on: fetch-discounts.js reads the same set, so the site
  // is about to be wrong too.
  console.error(`\n[publish-shops] ${err.message}\n`);
  process.exit(1);
});
