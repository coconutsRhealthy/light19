/**
 * One-off migration: convert the per-shop BrandContent *.ts object files in
 * src/app/company-codes-v2/brand-content/ into raw JSON data files in
 * src/app/company-codes-v2/brand-content/data/{slug}.json (filename = the real
 * slug from the object, dots and all). The content files are pure object
 * literals, so we strip the TS wrapper and evaluate them to recover the object.
 *
 * Safe to re-run. Does NOT delete the .ts files (that's a separate manual step
 * once the JSON is verified).
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/app/company-codes-v2/brand-content');
const outDir = path.join(dir, 'data');
fs.mkdirSync(outDir, { recursive: true });

// Files in brand-content/ that are NOT per-shop content objects.
const SKIP = new Set([
  'brand-content.model.ts',
  'index.ts',
  'live-v2-slugs.ts',
  'brand-content.token.ts',
  'brand-content.server.ts',
  'brand-content.service.ts',
]);

const files = fs.readdirSync(dir).filter(f =>
  f.endsWith('.ts') && !SKIP.has(f)
);

let count = 0;
for (const file of files) {
  const src = fs.readFileSync(path.join(dir, file), 'utf8');
  // Drop import lines, and turn `export const xContent: BrandContent = {` (or
  // without the type annotation) into a `return {` so we can eval the literal.
  const body = src
    .replace(/^\s*import[^\n]*\n/gm, '')
    .replace(/export\s+const\s+[A-Za-z0-9_]+\s*(:\s*BrandContent)?\s*=\s*/, 'return ');

  let obj;
  try {
    obj = new Function(body)(); // body is `...comments... return { ... };`
  } catch (e) {
    console.error(`FAILED to parse ${file}: ${e.message}`);
    process.exitCode = 1;
    continue;
  }
  if (!obj || typeof obj.slug !== 'string') {
    console.error(`SKIP ${file}: no .slug on the parsed object`);
    process.exitCode = 1;
    continue;
  }
  const outPath = path.join(outDir, `${obj.slug}.json`);
  fs.writeFileSync(outPath, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  console.log(`${file}  ->  data/${obj.slug}.json`);
  count++;
}

console.log(`\nMigrated ${count} content file(s) to ${path.relative(process.cwd(), outDir)}`);
