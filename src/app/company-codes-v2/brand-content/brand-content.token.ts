import { InjectionToken } from '@angular/core';
import { BrandContent } from './brand-content.model';

/**
 * Synchronous lookup of a shop's brand content by slug. Provided ONLY on the
 * server (see brand-content.server.ts + app.config.server.ts), where it reads
 * the JSON data files from disk at prerender/SSR time. It is intentionally
 * absent in the browser injector, so the brand-content data never enters the
 * client bundle — the browser reads each page's content back from TransferState
 * (see BrandContentService).
 */
export type BrandContentLoader = (slug: string) => BrandContent | null;

export const BRAND_CONTENT_LOADER = new InjectionToken<BrandContentLoader>('BRAND_CONTENT_LOADER');
