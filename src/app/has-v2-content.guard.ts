import { CanMatchFn } from '@angular/router';
import { hasV2ContentSlug } from './company-codes-v2/brand-content/v2-content-slugs';

/**
 * Decides whether the REAL /:company route should be served by v2 instead of v1.
 *
 * Matches when the shop has a v2 brand-content data file (the generated
 * v2-content-slugs.ts manifest, rebuilt from brand-content/data/ on every prod
 * build). When it returns false the router falls through to the next :company
 * route (the v1 CompanyCodesComponent).
 *
 * There is no separate go-live allowlist anymore: having a v2 content file IS
 * being live on v2. (The old live-v2-slugs.ts allowlist was a hand-maintained
 * mirror of exactly this set, so it added complexity without changing behaviour.)
 *
 * We deliberately do NOT look up the content object here — that would pull the
 * server-only content loader into the browser bundle. The manifest is plain
 * strings, safe to ship to the client, and generated so it can never drift from
 * the data dir.
 *
 * Pure and synchronous (no DI, no browser APIs), so it runs correctly during
 * prerender/SSR as well as in the browser.
 */
export const hasV2Content: CanMatchFn = (_route, segments) => {
  return hasV2ContentSlug(segments[0]?.path?.toLowerCase());
};
