const fs = require('fs/promises');
const path = require('path');

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist', 'light19', 'browser');
const SEO = path.join(ROOT, 'seo-texts');

const SEO_DIV_REGEX = /<div[^>]*data-seo-placeholder[^>]*>[\s\S]*?<\/div>/i;

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

    let stat;
    try {
      stat = await fs.stat(itemPath);
    } catch (err) {
      console.warn(`Cannot stat path for ${item}:`, err.message);
      continue;
    }

    if (!stat.isDirectory()) continue;

    const htmlPath = path.join(itemPath, 'index.html');
    const seoPath = path.join(SEO, `${item}.json`);

    let html;
    try {
      html = await fs.readFile(htmlPath, 'utf8');
    } catch (err) {
      console.warn(`Cannot read HTML file for ${item}:`, err.message);
      continue;
    }

    if (!SEO_DIV_REGEX.test(html)) {
      console.warn(`SEO placeholder NOT found in HTML: ${htmlPath}`);
      continue;
    }

    let seoText = '';
    try {
      const seoObj = JSON.parse(await fs.readFile(seoPath, 'utf8'));
      seoText = typeof seoObj.text === 'string' ? seoObj.text.trim() : '';
    } catch {
      seoText = '';
    }

    const finalSeoText = seoText.length > 0 ? seoText : '';

    let newHtml = html.replace(
      SEO_DIV_REGEX,
      `<div class="webshop-description">${finalSeoText}</div>`
    );

    newHtml = newHtml.replace(/\n{3,}/g, '\n\n');

    if (newHtml !== html) {
      try {
        await fs.writeFile(htmlPath, newHtml, 'utf8');
      } catch (err) {
        console.error(`Error writing HTML for ${item}:`, err.message);
      }
    }
  }

  console.log('All done!');
}

main();
