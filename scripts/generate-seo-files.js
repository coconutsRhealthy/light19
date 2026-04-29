const fs = require('fs');
const path = require('path');

const SEO_DIR = path.join(__dirname, '../src/app/company-codes/company-seo-content');
const NEW_DIR = path.join(SEO_DIR, 'new_files_to_add');
const INDEX_PATH = path.join(SEO_DIR, 'index.ts');

const SUBDIRS = [
  path.join(NEW_DIR, 'Brand page 23-04'),
  path.join(NEW_DIR, 'Brand page 24-04'),
  path.join(NEW_DIR, 'brand pages 28-04', 'Brand pages 28-04'),
];

const SKIP_FILES = new Set(['diski-seo-sharkclean (1).txt']);
const SKIP_SLUGS = new Set(['cecil']);

const HEADER =
  '<div class="tw-mt-10 tw-mb-16 tw-bg-white tw-rounded-3xl tw-shadow-lg tw-border tw-border-pink-100 tw-p-6 md:tw-p-10 tw-max-w-4xl tw-mx-auto">\n' +
  '    <div class="tw-prose tw-prose-lg tw-max-w-4xl tw-mx-auto tw-py-8">\n';

const FOOTER = '    </div>\n</div>\n';

function constName(slug) {
  const parts = slug.split(/[.\-]/).filter(Boolean);
  const startsWithDigit = /^[0-9]/.test(parts[0]);
  if (startsWithDigit) {
    const camel = parts[0] + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
    return `company${camel}SeoContent`;
  }
  const camel = parts[0] + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  return `${camel}SeoContent`;
}

const created = [];
const skipped = [];

for (const dir of SUBDIRS) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt'));
  for (const file of files) {
    if (SKIP_FILES.has(file)) {
      skipped.push(`${file} (explicit skip)`);
      continue;
    }
    const slug = file.replace(/^diski-seo-/, '').replace(/\.txt$/, '');
    if (SKIP_SLUGS.has(slug)) {
      skipped.push(`${slug} (explicit skip)`);
      continue;
    }
    const targetPath = path.join(SEO_DIR, `${slug}.ts`);
    if (fs.existsSync(targetPath)) {
      skipped.push(`${slug} (already exists)`);
      continue;
    }
    const inner = fs.readFileSync(path.join(dir, file), 'utf8').replace(/\r\n/g, '\n').replace(/\s+$/, '');
    const cn = constName(slug);
    const out = `export const ${cn} = \`\n${HEADER}${inner}\n${FOOTER}\`;\nexport default ${cn};\n`;
    fs.writeFileSync(targetPath, out, 'utf8');
    created.push(slug);
  }
}

const indexSrc = fs.readFileSync(INDEX_PATH, 'utf8');
const lines = indexSrc.split('\n');

const caseLineRe = /^(\s*)case '([^']+)': return import\('([^']+)'\)\.then\(m => m\.default\);(.*)$/;
const cases = [];
let firstCaseIdx = -1;
let lastCaseIdx = -1;
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(caseLineRe);
  if (m) {
    if (firstCaseIdx === -1) firstCaseIdx = i;
    lastCaseIdx = i;
    cases.push({ indent: m[1], key: m[2], importPath: m[3], tail: m[4], original: lines[i] });
  }
}

const indent = cases[0].indent;
const existingKeys = new Set(cases.map(c => c.key));
for (const slug of created) {
  if (!existingKeys.has(slug)) {
    cases.push({ indent, key: slug, importPath: `./${slug}`, tail: '', original: '' });
    existingKeys.add(slug);
  }
}

cases.sort((a, b) => a.key.localeCompare(b.key));
const newCaseBlock = cases.map(c => `${c.indent}case '${c.key}': return import('${c.importPath}').then(m => m.default);`);

const newLines = [
  ...lines.slice(0, firstCaseIdx),
  ...newCaseBlock,
  ...lines.slice(lastCaseIdx + 1),
];

fs.writeFileSync(INDEX_PATH, newLines.join('\n'), 'utf8');

console.log(`Created ${created.length} new .ts files.`);
console.log(`Skipped: ${skipped.length}`);
for (const s of skipped) console.log(`  - ${s}`);
console.log(`index.ts now has ${cases.length} cases.`);
