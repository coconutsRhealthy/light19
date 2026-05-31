import { BrandContent } from './brand-content.model';
import { nakdfashionContent } from './nakdfashion';
import { zalandoContent } from './zalando';
import { ginatricotContent } from './ginatricot';
import { gutsgustoContent } from './gutsgusto';
import { geurwolkjeContent } from './geurwolkje';

/**
 * Pilot registry. Synchronous import is fine for a handful of shops; at scale
 * (1,000+ shops) switch this to a lazy `import()` per slug so each shop's copy
 * is its own chunk (mirrors the existing company-seo-content loader pattern).
 */
const REGISTRY: Record<string, BrandContent> = {
  [nakdfashionContent.slug]: nakdfashionContent,
  [zalandoContent.slug]: zalandoContent,
  [ginatricotContent.slug]: ginatricotContent,
  [gutsgustoContent.slug]: gutsgustoContent,
  [geurwolkjeContent.slug]: geurwolkjeContent
};

export function getBrandContent(slug: string): BrandContent | null {
  return REGISTRY[slug?.toLowerCase()] ?? null;
}
