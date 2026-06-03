import { Injectable, PLATFORM_ID, TransferState, makeStateKey, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { BrandContent } from './brand-content.model';
import { BRAND_CONTENT_LOADER } from './brand-content.token';

/**
 * Browser-safe accessor for a shop's brand content. It NEVER imports the content
 * itself, so nothing here pulls the data into the client bundle.
 *
 * - On the server (prerender/SSR): reads the slug via the injected
 *   BRAND_CONTENT_LOADER (file read) and stashes it in TransferState, which
 *   Angular inlines into that page's HTML.
 * - In the browser: reads the same value straight back from TransferState — set
 *   synchronously during hydration, so it matches the server-rendered DOM with
 *   no extra request and no content in the bundle.
 *
 * There is deliberately no client-side fetch fallback: every v2 page is
 * prerendered (live and /v2/ preview alike) and all internal shop links are full
 * `<a href>` navigations, so the browser only ever needs the CURRENT page's
 * content — which is always present in its own TransferState.
 */
@Injectable({ providedIn: 'root' })
export class BrandContentService {
  private state = inject(TransferState);
  private platformId = inject(PLATFORM_ID);
  private serverLoader = inject(BRAND_CONTENT_LOADER, { optional: true });

  get(slug: string): BrandContent | null {
    const key = makeStateKey<BrandContent | null>(`bc:${(slug ?? '').toLowerCase()}`);

    if (this.state.hasKey(key)) {
      return this.state.get(key, null);
    }

    if (isPlatformServer(this.platformId) && this.serverLoader) {
      const content = this.serverLoader(slug);
      this.state.set(key, content);
      return content;
    }

    // Browser with no transferred state: only reachable if a v2 page is entered
    // via in-app routing (which the app never does). Content stays null.
    return null;
  }
}
