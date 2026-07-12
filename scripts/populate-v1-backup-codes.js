/**
 * populate-v1-backup-codes.js  —  ONE-OFF, MANUAL, needs the local MariaDB.
 *
 * v1 (company-codes) is frozen — no new pages will ever be generated — so this is
 * run once to fill a fallback code for every v1 shop, and re-run only if you want
 * to refresh. It writes a static map:
 *
 *     src/app/company-codes/company-seo-content/backup-codes.ts
 *
 * consumed by CompanyCodesComponent: when discounts.json has no live code for a
 * shop, the component shows this backup code so the page renders its content
 * instead of the "404 niet gevonden" shell.
 *
 * Same 3-step waterfall as the v2 engine (per shop, first hit wins):
 *   1. light19 discounts.json  -> the shop's MOST RECENT live code (by MM-DD date)
 *   2. diski.discounts (MariaDB) -> the MOST RECENT archived code (by date)
 *   3. synthesize -> a deterministic ACTIE/OFF/SHOP + 10/15 code (stable per slug)
 *
 * The DB is touched ONLY here (dev-time). The generated map is committed static
 * data; the app build and runtime never touch the DB.
 *
 * Usage:  node scripts/populate-v1-backup-codes.js
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DISCOUNTS_JSON = path.join(ROOT, 'src/app/data/discounts.json');
const V1_INDEX = path.join(ROOT, 'src/app/company-codes/company-seo-content/index.ts');
const OUT = path.join(ROOT, 'src/app/company-codes/company-seo-content/backup-codes.json');

const MYSQL_BIN = process.env.MYSQL_BIN || '/Applications/XAMPP/xamppfiles/bin/mysql';
const MYSQL_SOCKET = process.env.MYSQL_SOCKET || '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock';
const DISKI_DB = process.env.DISKI_DB || 'diski';

const SYNTH_WORDS = ['ACTIE', 'OFF', 'SHOP'];
const SYNTH_NUMS = ['10', '15'];
// 12 stable combinations: word+number and number+word.
const SYNTH_COMBOS = [];
for (const w of SYNTH_WORDS) for (const n of SYNTH_NUMS) for (const order of ['suffix', 'prefix']) SYNTH_COMBOS.push({ w, n, order });

// A backup code must be typeable: non-empty, not a URL, single token.
const validCode = (c) => {
  c = (c || '').trim();
  return c.length > 0 && !c.toLowerCase().startsWith('http') && !c.includes(' ');
};

// --- v1 slugs = the authoritative `case '...'` labels in index.ts ---
const v1Slugs = [];
{
  const idx = fs.readFileSync(V1_INDEX, 'utf8');
  const re = /case\s+'([^']+)':/g;
  let m;
  while ((m = re.exec(idx))) v1Slugs.push(m[1]);
}

// --- step 1: most-recent valid code per slug in discounts.json (date = MM-DD) ---
const live = {}; // slug -> { date, code, discount }
for (const line of JSON.parse(fs.readFileSync(DISCOUNTS_JSON, 'utf8'))) {
  if (typeof line !== 'string' || !line.includes(',')) continue;
  const parts = line.split(',').map(s => s.trim());
  const slug = parts[0].replace(/\([^)]*\)/g, '').trim().toLowerCase();
  const code = parts[1] || '';
  const discount = parts[2] || '';
  const date = parts[4] || '';
  if (!slug || !validCode(code)) continue;
  if (!live[slug] || date > live[slug].date) live[slug] = { date, code: code.trim(), discount: discount.trim() };
}

// --- step 2: most-recent valid code per company in diski.discounts ---
const archive = {}; // slug -> { code, discount }
{
  const out = execFileSync(MYSQL_BIN, ['-uroot', `--socket=${MYSQL_SOCKET}`, DISKI_DB, '--batch', '-e',
    'SELECT company, discount_code, discount_percentage, `date` FROM discounts ORDER BY company, `date` DESC'],
    { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
  const lines = out.split('\n').filter(Boolean);
  lines.shift(); // header
  for (const ln of lines) {
    const [company, code, pct] = ln.split('\t');
    const slug = (company || '').trim().toLowerCase();
    if (!slug || archive[slug]) continue;
    if (validCode(code)) archive[slug] = { code: code.trim(), discount: (pct || '').trim() };
  }
}

// --- step 3: deterministic synthetic code, stable per slug ---
const synth = (slug) => {
  const h = BigInt('0x' + crypto.createHash('md5').update(slug).digest('hex'));
  const { w, n, order } = SYNTH_COMBOS[Number(h % BigInt(SYNTH_COMBOS.length))];
  return { code: order === 'suffix' ? `${w}${n}` : `${n}${w}`, discount: n };
};

// --- resolve the waterfall for every v1 slug ---
const counts = { live: 0, archive: 0, generated: 0 };
const rows = [];
for (const slug of v1Slugs) {
  const lc = slug.toLowerCase();
  let backup, source;
  if (live[lc]) { backup = { code: live[lc].code, discount: live[lc].discount }; source = 'live'; }
  else if (archive[lc]) { backup = archive[lc]; source = 'archive'; }
  else { backup = synth(lc); source = 'generated'; }
  counts[source]++;
  rows.push({ slug, backup });
}
rows.sort((a, b) => a.slug.localeCompare(b.slug));

// --- write the map ---
// Plain JSON, slug -> {code, discount}. Nothing in the Angular app imports this: the
// only reader is scripts/fetch-discounts.js, which at build time injects a shop's backup
// code into discounts.json when the R2 feed has no live code for it. Keeping it out of
// the app is also what keeps these 578 entries out of the client bundle.
const map = {};
for (const r of rows) map[r.slug] = { code: r.backup.code, discount: r.backup.discount };
fs.writeFileSync(OUT, JSON.stringify(map, null, 2) + '\n', 'utf8');
console.log(`wrote ${rows.length} v1 backup codes -> ${path.relative(ROOT, OUT)}`);
console.log(`  live ${counts.live}, archive ${counts.archive}, generated ${counts.generated}`);
