import { BrandContent } from './brand-content.model';
import { bodylabnlContent } from './bodylabnl';
import { cabaulifestyleContent } from './cabaulifestyle';
import { calliegiftsContent } from './calliegifts';
import { charlottetilburyContent } from './charlottetilbury';
import { fittasticsportswearContent } from './fittasticsportswear';
import { florencenailsContent } from './florencenails';
import { geurwolkjeContent } from './geurwolkje';
import { ginatricotContent } from './ginatricot';
import { glutespopcomContent } from './glutespopcom';
import { gutsgustoContent } from './gutsgusto';
import { jhpfashionnlContent } from './jhpfashionnl';
import { kossonutritionnlContent } from './kossonutritionnl';
import { lampenlichtnlContent } from './lampenlichtnl';
import { legionathleticsContent } from './legionathletics';
import { loopearplugsContent } from './loopearplugs';
import { merodacosmeticsContent } from './merodacosmetics';
import { moovvmorenlContent } from './moovvmorenl';
import { mothersearthContent } from './mothersearth';
import { nakdfashionContent } from './nakdfashion';
import { photowallswedenContent } from './photowallsweden';
import { sirokoContent } from './siroko';
import { smartphotonlContent } from './smartphotonl';
import { thegelexpertContent } from './thegelexpert';
import { trendcarpetContent } from './trendcarpet';
import { twistshakebabyContent } from './twistshakebaby';
import { vitaminfiteuContent } from './vitaminfiteu';
import { wildrefillContent } from './wildrefill';
import { yehwangwholesaleContent } from './yehwangwholesale';
import { yesstyleContent } from './yesstyle';
import { zalandoContent } from './zalando';

/**
 * Pilot registry. Synchronous import is fine for a handful of shops; at scale
 * (1,000+ shops) switch this to a lazy `import()` per slug so each shop's copy
 * is its own chunk (mirrors the existing company-seo-content loader pattern).
 *
 * Keyed by each object's own `.slug`, so the file/export name can be sanitised
 * (no dots) while the route still matches the real shop slug (e.g. 'bodylab.nl').
 */
const REGISTRY: Record<string, BrandContent> = {
  [bodylabnlContent.slug]: bodylabnlContent,
  [cabaulifestyleContent.slug]: cabaulifestyleContent,
  [calliegiftsContent.slug]: calliegiftsContent,
  [charlottetilburyContent.slug]: charlottetilburyContent,
  [fittasticsportswearContent.slug]: fittasticsportswearContent,
  [florencenailsContent.slug]: florencenailsContent,
  [geurwolkjeContent.slug]: geurwolkjeContent,
  [ginatricotContent.slug]: ginatricotContent,
  [glutespopcomContent.slug]: glutespopcomContent,
  [gutsgustoContent.slug]: gutsgustoContent,
  [jhpfashionnlContent.slug]: jhpfashionnlContent,
  [kossonutritionnlContent.slug]: kossonutritionnlContent,
  [lampenlichtnlContent.slug]: lampenlichtnlContent,
  [legionathleticsContent.slug]: legionathleticsContent,
  [loopearplugsContent.slug]: loopearplugsContent,
  [merodacosmeticsContent.slug]: merodacosmeticsContent,
  [moovvmorenlContent.slug]: moovvmorenlContent,
  [mothersearthContent.slug]: mothersearthContent,
  [nakdfashionContent.slug]: nakdfashionContent,
  [photowallswedenContent.slug]: photowallswedenContent,
  [sirokoContent.slug]: sirokoContent,
  [smartphotonlContent.slug]: smartphotonlContent,
  [thegelexpertContent.slug]: thegelexpertContent,
  [trendcarpetContent.slug]: trendcarpetContent,
  [twistshakebabyContent.slug]: twistshakebabyContent,
  [vitaminfiteuContent.slug]: vitaminfiteuContent,
  [wildrefillContent.slug]: wildrefillContent,
  [yehwangwholesaleContent.slug]: yehwangwholesaleContent,
  [yesstyleContent.slug]: yesstyleContent,
  [zalandoContent.slug]: zalandoContent
};

export function getBrandContent(slug: string): BrandContent | null {
  return REGISTRY[slug?.toLowerCase()] ?? null;
}
