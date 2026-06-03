import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BrandContent } from './brand-content.model';
import { BrandContentLoader } from './brand-content.token';

/**
 * SERVER-ONLY brand-content loader. Imported solely by app.config.server.ts, so
 * `node:fs` and the (potentially huge) set of content files never reach the
 * browser bundle. Reads one shop's JSON from the source data dir at
 * prerender/SSR time; the component then seeds it into TransferState so the
 * client gets it back from the page HTML (never via the bundle or the CDN).
 *
 * The data files live in the source tree and are NOT copied to the browser
 * output (not in `public/`), so they are never web-reachable. This is correct
 * for the prerendered/static deploy: every v2 page is prerendered, so the read
 * only happens at build time, relative to the project root (process.cwd()).
 *
 * NOTE: if v2 ever moves to live Node SSR (rendering pages on demand instead of
 * prerendering), switch the anchor from process.cwd() to an import.meta.url-
 * relative path and copy `data/` next to the server bundle at build.
 */
const DATA_DIR = join(process.cwd(), 'src/app/company-codes-v2/brand-content/data');

// Tiny in-process cache so repeated lookups for the same slug during a single
// build don't re-read/parse the file.
const cache = new Map<string, BrandContent | null>();

export const serverBrandContentLoader: BrandContentLoader = (slug: string): BrandContent | null => {
  const key = (slug ?? '').toLowerCase();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key) ?? null;

  let content: BrandContent | null = null;
  try {
    content = JSON.parse(readFileSync(join(DATA_DIR, `${key}.json`), 'utf8')) as BrandContent;
  } catch {
    content = null; // no data file for this slug
  }
  cache.set(key, content);
  return content;
};
