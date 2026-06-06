import { Injectable, PLATFORM_ID, TransferState, makeStateKey, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { BrandContent } from './brand-content.model';
import { BRAND_CONTENT_LOADER } from './brand-content.token';

/**
 * Browser-safe accessor for a shop's brand content. It NEVER statically imports
 * the content, so nothing here pulls the data into the client bundle.
 *
 * Resolution order (fastest first):
 * - On the server (prerender/SSR): reads the slug via the injected
 *   BRAND_CONTENT_LOADER (file read) and stashes it in TransferState, which
 *   Angular inlines into that page's HTML.
 * - In the browser, TransferState hit: reads the same value straight back from
 *   TransferState — present on a direct/prerendered load (and on v2→v2 `<a href>`
 *   navigations), so no extra request and no content in the bundle.
 * - In the browser, TransferState miss: the page was entered via in-app routing
 *   (e.g. a `[routerLink]` from /winkels, the homepage table, or the modal),
 *   so the current page's HTML carries no content for this slug. We then fetch
 *   the shop's JSON from the static deploy (`/brand-content/{slug}.json`, copied
 *   there at build via angular.json assets — same origin/CDN, NOT bundled) and
 *   cache it back into TransferState so repeat visits this session don't refetch.
 */
@Injectable({ providedIn: 'root' })
export class BrandContentService {
  private state = inject(TransferState);
  private platformId = inject(PLATFORM_ID);
  private serverLoader = inject(BRAND_CONTENT_LOADER, { optional: true });

  private keyFor(slug: string) {
    return makeStateKey<BrandContent | null>(`bc:${(slug ?? '').toLowerCase()}`);
  }

  /**
   * SYNCHRONOUS fast path: TransferState hit (direct/prerendered load + hydration)
   * or SSR file read. Returns null in the browser when this page's HTML carries
   * no content for the slug (i.e. it was reached via in-app routing). Kept sync so
   * direct loads set content before the first change detection — no hydration
   * mismatch. For the null case in the browser, follow up with load().
   */
  get(slug: string): BrandContent | null {
    const key = this.keyFor(slug);

    if (this.state.hasKey(key)) {
      return this.state.get(key, null);
    }

    if (isPlatformServer(this.platformId) && this.serverLoader) {
      const content = this.serverLoader(slug);
      this.state.set(key, content);
      return content;
    }

    return null;
  }

  /**
   * ASYNC fallback for the browser in-app-navigation case (get() returned null
   * because the current page's TransferState has no entry for this slug). Fetches
   * the shop's JSON copied into the static deploy at build (`/brand-content/
   * {slug}.json` — same origin/CDN, NOT bundled), and caches it back into
   * TransferState so repeat visits this session don't refetch. This path never
   * runs during SSR/hydration, so it can safely resolve a tick later. Failures
   * degrade to null (same as a shop without content).
   */
  async load(slug: string): Promise<BrandContent | null> {
    const key = this.keyFor(slug);
    if (this.state.hasKey(key)) {
      return this.state.get(key, null);
    }

    const lc = (slug ?? '').toLowerCase();
    if (!lc) return null;
    try {
      const res = await fetch(`/brand-content/${encodeURIComponent(lc)}.json`);
      const content = res.ok ? (await res.json() as BrandContent) : null;
      this.state.set(key, content);
      return content;
    } catch {
      return null;
    }
  }
}
