const fs = require('fs');
const path = require('path');

const DIST_FOLDER = path.join(__dirname, '../dist/light19/browser');
const BASE_URL = 'https://diski.nl';

function processFolder(folderPath) {
  const files = fs.readdirSync(folderPath);

  files.forEach(file => {
    const fullPath = path.join(folderPath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      processFolder(fullPath);
    } else if (file === 'index.html') {
      let html = fs.readFileSync(fullPath, 'utf8');

      // Bepaal canonical URL
      let relativePath = path.relative(DIST_FOLDER, folderPath).replace(/\\/g, '/'); // Windows-proof
      let canonicalUrl = relativePath ? `${BASE_URL}/${relativePath}/` : BASE_URL;

      // Vervang placeholder
      html = html.replace('<!--  canonical placeholder-->', `<link rel="canonical" href="${canonicalUrl}" />`);

      fs.writeFileSync(fullPath, html, 'utf8');
      console.log(`Updated canonical for ${fullPath}: ${canonicalUrl}`);
    }
  });
}

// Start
processFolder(DIST_FOLDER);
console.log('All index.html files processed.');
