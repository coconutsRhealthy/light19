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
const hardcodedRoutes = ['/giftcards', '/winkels', '/prikbord', '/wieheeftsale', '/top5', '/'];
hardcodedRoutes.forEach(route => results.add(route.replace(/^\//, '')));

// Sort alphabetically
const sorted = Array.from(results).sort((a, b) => a.localeCompare(b));

// Write to routes.txt with leading slash
const output = sorted.map((v) => `/${v}`).join('\n');
fs.writeFileSync('routes.txt', output, 'utf8');

console.log('routes.txt generated successfully.');
