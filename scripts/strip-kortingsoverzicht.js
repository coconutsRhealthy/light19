const fs = require('fs');
const path = require('path');

const SEO_DIR = path.join(__dirname, '../src/app/company-codes/company-seo-content');
const NEW_DIR = path.join(SEO_DIR, 'new_files_to_add');

const SUBDIRS = [
  path.join(NEW_DIR, 'Brand page 23-04'),
  path.join(NEW_DIR, 'Brand page 24-04'),
  path.join(NEW_DIR, 'brand pages 28-04', 'Brand pages 28-04'),
];

const SKIP_FILES = new Set(['diski-seo-sharkclean (1).txt']);
const SKIP_SLUGS = new Set(['cecil']);

const slugs = [];
for (const dir of SUBDIRS) {
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.txt'))) {
    if (SKIP_FILES.has(file)) continue;
    const slug = file.replace(/^diski-seo-/, '').replace(/\.txt$/, '');
    if (SKIP_SLUGS.has(slug)) continue;
    slugs.push(slug);
  }
}

const re = /(<!-- == KORTINGSOVERZICHT == -->)\n[\s\S]*?\n(<!-- == OVER HET MERK == -->)/;

let stripped = 0;
let unchanged = 0;
const issues = [];

for (const slug of slugs) {
  const p = path.join(SEO_DIR, `${slug}.ts`);
  if (!fs.existsSync(p)) {
    issues.push(`${slug}: file missing`);
    continue;
  }
  const src = fs.readFileSync(p, 'utf8');
  if (!re.test(src)) {
    unchanged++;
    issues.push(`${slug}: pattern not found`);
    continue;
  }
  const out = src.replace(re, '$1\n\n$2');
  if (out !== src) {
    fs.writeFileSync(p, out, 'utf8');
    stripped++;
  } else {
    unchanged++;
  }
}

console.log(`Stripped: ${stripped}`);
console.log(`Unchanged: ${unchanged}`);
if (issues.length) {
  console.log(`Issues (${issues.length}):`);
  for (const i of issues.slice(0, 20)) console.log(`  - ${i}`);
  if (issues.length > 20) console.log(`  ... and ${issues.length - 20} more`);
}
