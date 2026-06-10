const fs = require('fs');
const path = require('path');

// routes-extractor.js
// Hardcoded input file path
const inputPath = path.join(__dirname, '../src/app/data/discounts.json');

// Load JSON file
const raw = fs.readFileSync(inputPath, 'utf8');
const json = JSON.parse(raw);

// A Set to collect unique cleaned entries
const results = new Set();

// Iterate each line (assuming json is an array of strings)
json.forEach((line) => {
  if (typeof line !== 'string') return;

  if (line.includes(',')) {
    let beforeComma = line.split(',')[0].trim();

    // Remove parentheses and content inside
    beforeComma = beforeComma.replace(/\([^)]*\)/g, '').trim();

    if (beforeComma.length > 0) {
      results.add(beforeComma);
    }
  }
});

// --- Add hardcoded routes ---
const hardcodedRoutes = ['/winkels', '/contact', '/top5', '/privacy-policy', '/blackfriday', '/prikbord', '/blogs', '/code-delen', '/'];
hardcodedRoutes.forEach(route => results.add(route.replace(/^\//, '')));

// Sort alphabetically
const sorted = Array.from(results).sort((a, b) => a.localeCompare(b));

// =========================
// v2 preview routes (/v2/{slug})
// =========================
// Prerender a noindexed /v2/{slug} preview for every shop that has a v2 brand-
// content data file but is NOT on the go-live allowlist (i.e. the preview-only
// shops). Live shops are already prerendered at /{slug} from discounts.json, so
// they don't need a duplicate /v2/ render. Prerendering the previews means they
// also get their content inlined via TransferState (no client-side data needed).
//
// These are added to routes.txt ONLY — never to sitemap.xml (they are noindex).
const contentDir = path.join(__dirname, '../src/app/company-codes-v2/brand-content/data');
const liveSlugsFile = path.join(__dirname, '../src/app/company-codes-v2/brand-content/live-v2-slugs.ts');

const contentSlugs = fs.existsSync(contentDir)
  ? fs.readdirSync(contentDir).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, '').toLowerCase())
  : [];

// Parse the allowlisted (live) slugs straight out of live-v2-slugs.ts.
const liveSlugs = new Set();
if (fs.existsSync(liveSlugsFile)) {
  const txt = fs.readFileSync(liveSlugsFile, 'utf8');
  const setBody = txt.slice(txt.indexOf('new Set('), txt.indexOf('])') + 1);
  for (const m of setBody.matchAll(/'([^']+)'/g)) liveSlugs.add(m[1].toLowerCase());
}

const previewRoutes = contentSlugs
  .filter(slug => !liveSlugs.has(slug))
  .map(slug => `/v2/${slug}`)
  .sort((a, b) => a.localeCompare(b));

// =========================
// 1. routes.txt genereren
// =========================
const routesTxt = [...sorted.map((v) => `/${v}`), ...previewRoutes].join('\n');
fs.writeFileSync('routes.txt', routesTxt, 'utf8');

console.log(`routes.txt generated successfully (${previewRoutes.length} v2 preview route(s) appended).`);


// =========================
// 2. sitemap.xml genereren
// =========================
const BASE_URL = 'https://diski.nl';
const today = new Date().toISOString().split('T')[0];

const utilityRoutes = new Set(['winkels', 'contact', 'top5', 'privacy-policy', 'blogs', 'prikbord', 'blackfriday', 'code-delen', '']);

const urls = sorted.map((route) => {
  const pathPart = route === '' ? '/' : `/${route}/`;
  const isHome = route === '';
  const isUtility = utilityRoutes.has(route);
  const priority = isHome ? '1.0' : isUtility ? '0.6' : '0.8';
  const changefreq = isHome ? 'daily' : isUtility ? 'monthly' : 'weekly';
  return `
  <url>
    <loc>${escapeXml(BASE_URL + pathPart)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

// Schrijf naar Angular src map
fs.writeFileSync(
  path.join(__dirname, '../src/sitemap.xml'),
  sitemap,
  'utf8'
);

console.log('sitemap.xml generated successfully.');

function escapeXml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
}