const fs = require('fs');
const path = require('path');

const DIST_PATH = path.join(process.cwd(), 'dist', 'light19', 'browser');
const SEO_TEXTS_PATH = path.join(process.cwd(), 'seo-texts');

// Detecteer alle companies
const companies = fs.readdirSync(SEO_TEXTS_PATH).filter(f => f.endsWith('.json'));

companies.forEach(fileName => {
  const company = path.basename(fileName, '.json');

  const htmlPath = path.join(DIST_PATH, company, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    console.warn(`HTML file not found for ${company}, skipping SEO injection.`);
    return;
  }

  let seoContent = '';
  const seoFilePath = path.join(SEO_TEXTS_PATH, fileName);
  if (fs.existsSync(seoFilePath)) {
    try {
      const seoObj = JSON.parse(fs.readFileSync(seoFilePath, 'utf-8'));
      seoContent = seoObj.text?.trim() || '';
    } catch (err) {
      console.error(`Error parsing SEO JSON for ${company}:`, err);
    }
  }

  const html = fs.readFileSync(htmlPath, 'utf-8');

  // Regex: match <div id="companySeoTextPlaceholder" ...></div> inclusief Angular attributen
  const placeholderRegex = /<div[^>]*id=["']companySeoTextPlaceholder["'][^>]*><\/div>/;

  let injectedHtml;
  if (seoContent.length > 0) {
    injectedHtml = html.replace(
      placeholderRegex,
      `<div id="companySeoText">${seoContent}</div>`
    );
  } else {
    // verwijder placeholder volledig
    //todo: het verwijderen werkt nog niet
    injectedHtml = html.replace(placeholderRegex, '');
  }

  fs.writeFileSync(htmlPath, injectedHtml, 'utf-8');
  console.log(`SEO text injected for ${company}`);
});
