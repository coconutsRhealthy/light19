import { CanMatchFn } from '@angular/router';
import { isLiveV2Slug } from './company-codes-v2/brand-content/live-v2-slugs';

/**
 * Decides whether the REAL /:company route should be served by v2 instead of v1.
 *
 * Matches only when the shop is on the go-live allowlist (live-v2-slugs.ts).
 * When it returns false the router falls through to the next :company route (the
 * v1 CompanyCodesComponent), so every other shop — including the original 5
 * preview-only pilot shops — keeps v1.
 *
 * The allowlist is the single source of truth for "live v2": every allowlisted
 * slug is guaranteed to have a brand-content data file (enforced at content-
 * generation time). We deliberately do NOT also look up the content here — that
 * would pull the server-only content loader into the browser bundle, defeating
 * the whole point. The allowlist is plain strings, safe to ship to the client.
 *
 * Pure and synchronous (no DI, no browser APIs), so it runs correctly during
 * prerender/SSR as well as in the browser.
 */
export const hasV2Content: CanMatchFn = (_route, segments) => {
  return isLiveV2Slug(segments[0]?.path?.toLowerCase());
};
