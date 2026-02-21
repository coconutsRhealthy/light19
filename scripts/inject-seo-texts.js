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
    const formattedWebshopName =
      item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();

    let newHtml = html.replace(
      SEO_DIV_REGEX,
      `<div class="tw-mt-10 tw-mb-16 tw-bg-white tw-rounded-3xl tw-shadow-lg tw-border tw-border-pink-100 tw-p-6 md:tw-p-10 tw-max-w-4xl tw-mx-auto">

          <!-- ALTIJD ZICHTBAAR -->
          <h3 class="tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-pink-800 tw-mb-6 tw-text-center">
              Over ${formattedWebshopName}
          </h3>

          <h4 class="tw-mt-3 tw-text-sm md:tw-text-base tw-text-center tw-text-gray-600">
              ...de uiterst subjectieve, kritische, eerlijke en soms ook grappige Diski review ✍️😉
          </h4>

          <details class="tw-group tw-mt-6">

              <summary class="tw-flex tw-flex-col tw-items-center tw-cursor-pointer tw-text-pink-700 hover:tw-text-pink-900 tw-transition tw-list-none">

                  <!-- PIJL -->
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="tw-w-6 tw-h-6 tw-transition-transform tw-duration-300 group-open:tw-rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                  >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>

                  <!-- TEKST -->
                  <span class="tw-text-xs tw-mt-1 tw-opacity-70">
                      <span class="group-open:tw-hidden">Lees meer</span>
                      <span class="tw-hidden group-open:tw-inline">Inklappen</span>
                  </span>

              </summary>

              <!-- UITKLAPBARE CONTENT -->

                <div class="tw-mt-6 tw-text-gray-700 tw-text-[15px] md:tw-text-base tw-leading-relaxed [&>p]:tw-mb-2">
                    ${finalSeoText}
                </div>

          </details>

      </div>`
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
