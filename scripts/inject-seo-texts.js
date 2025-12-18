const fs = require('fs/promises');
const path = require('path');

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist', 'light19', 'browser');
const SEO = path.join(ROOT, 'seo-texts');

async function main() {
  console.log('Starting SEO injector…');

  let items;
  try {
    items = await fs.readdir(DIST);
  } catch (err) {
    console.error('Cannot read dist folder:', err);
    return;
  }

  for (const item of items) {
    const itemPath = path.join(DIST, item);

    // Alleen directories behandelen
    let stat;
    try {
      stat = await fs.stat(itemPath);
    } catch (err) {
      console.warn(`Cannot stat path for ${item}:`, err.message);
      continue;
    }
    if (!stat.isDirectory()) {
      console.log(`Skipping non-directory: ${item}`);
      continue;
    }

    const htmlPath = path.join(itemPath, 'index.html');
    const seoPath = path.join(SEO, `${item}.json`);

    // Lees HTML
    let html;
    try {
      html = await fs.readFile(htmlPath, 'utf8');
    } catch (err) {
      console.warn(`Cannot read HTML file for ${item}:`, err.message);
      continue;
    }

    // Lees SEO text als aanwezig
    let seoText = '';
    try {
      const seoObj = JSON.parse(await fs.readFile(seoPath, 'utf8'));
      seoText = seoObj.text?.trim() || '';
    } catch (_) {
      // Geen JSON aanwezig = gewoon verwijderen
      seoText = '';
    }

    // Check of placeholder aanwezig is
    if (!html.includes('webshop-description-placeholder')) {
      console.warn(`Placeholder NOT found in HTML: ${htmlPath}`);
    }

    // Vervang of verwijder placeholder
    let newHtml;
    if (seoText.length > 0) {
      newHtml = html.replace(/webshop-description-placeholder/g, `<div class="webshop-description">${seoText}</div>`);
    } else {
      newHtml = html.replace(/webshop-description-placeholder/g, '');
    }

    // Schrijf HTML terug
    try {
      await fs.writeFile(htmlPath, newHtml, 'utf8');
    } catch (err) {
      console.error(`Error writing HTML for ${item}:`, err.message);
    }
  }

  console.log('All done!');
}

main();
