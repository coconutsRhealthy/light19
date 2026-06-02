import { CanMatchFn } from '@angular/router';
import { getBrandContent } from './company-codes-v2/brand-content/index';
import { isLiveV2Slug } from './company-codes-v2/brand-content/live-v2-slugs';

/**
 * Decides whether the REAL /:company route should be served by v2 instead of v1.
 *
 * Matches only when the shop is BOTH on the go-live allowlist (live-v2-slugs.ts)
 * AND actually has a v2 brand-content object. When it returns false the router
 * falls through to the next :company route (the v1 CompanyCodesComponent), so
 * every other shop — including the original 5 preview-only pilot shops — keeps v1.
 *
 * Pure and synchronous (no DI, no browser APIs), so it runs correctly during
 * prerender/SSR as well as in the browser.
 */
export const hasV2Content: CanMatchFn = (_route, segments) => {
  const slug = segments[0]?.path?.toLowerCase();
  return isLiveV2Slug(slug) && !!getBrandContent(slug ?? '');
};
