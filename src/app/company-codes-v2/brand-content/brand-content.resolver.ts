import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { BrandContent } from './brand-content.model';
import { BrandContentService } from './brand-content.service';

/**
 * Resolves a shop's grounded brand content BEFORE the v2 component activates, so
 * the page renders complete on navigation — no empty state, skeleton, or flicker.
 *
 * - Direct/prerendered load, hydration, and SSR: BrandContentService.get()
 *   resolves synchronously from TransferState (or the SSR file read), so there is
 *   zero added navigation delay.
 * - Client-side in-app navigation (e.g. a [routerLink] from /winkels): get()
 *   misses TransferState, so we await load(), which fetches the shop JSON from the
 *   static deploy. The router holds on the current page for that (~tens of ms)
 *   fetch, then swaps straight to the finished page.
 *
 * load() never rejects (it catches and returns null), so navigation can't break;
 * a slug without content simply resolves to null (the @if-guarded sections stay
 * hidden), exactly as before.
 */
export const brandContentResolver: ResolveFn<BrandContent | null> = (route) => {
  const slug = (route.paramMap.get('company') ?? '').toLowerCase();
  const svc = inject(BrandContentService);
  return svc.get(slug) ?? svc.load(slug);
};
