/**
 * Allowlist of shops that v2 serves on the REAL /:company route (indexed,
 * replacing v1 for that shop). Everything else with v2 content stays a
 * noindexed /v2/ preview only.
 *
 * Why an explicit allowlist (and not "any shop with v2 content"):
 *   - This is a real, indexable production change, so going live must be a
 *     deliberate, auditable per-shop decision — a half-finished content file
 *     should never auto-publish and get indexed.
 *   - It deliberately EXCLUDES the original 5 pilot shops (nakdfashion,
 *     ginatricot, gutsgusto, geurwolkje, zalando): those keep their existing
 *     live v1 pages untouched. They remain reachable only as /v2/ previews.
 *
 * This batch is the 25 generated 2026-06-02 from currently NOT-INDEXED detail
 * pages (see input/CANDIDATES.md) — safe to index because they rank nowhere today.
 *
 * To take another shop live later: add its slug here (and make sure it has a
 * brand-content object + is in routes.txt so it prerenders). To revert a shop
 * to v1: remove it here.
 */
export const LIVE_V2_SLUGS: ReadonlySet<string> = new Set([
  'loopearplugs',
  'cabaulifestyle',
  'siroko',
  'bodylab.nl',
  'yesstyle',
  'charlottetilbury',
  'smartphoto.nl',
  'photowall_sweden',
  'trendcarpet',
  'yehwang_wholesale',
  'moovvmore.nl',
  'wildrefill',
  'legionathletics',
  'florencenails',
  'lampenlicht.nl',
  'thegelexpert',
  'calliegifts',
  'mothersearth',
  'jhpfashion.nl',
  'merodacosmetics',
  'kossonutrition.nl',
  'vitaminfit.eu',
  'twistshakebaby',
  'fittasticsportswear',
  'glutespop.com',
  // Added 2026-06-05: second batch promoted from preview to live (each has a
  // brand-content data file and a discounts.json route entry).
  'fotocadeau.nl',
  'geurwolkje',
  'gymshark',
  'hunkemoller',
  'idealofsweden',
  'lookfantastic',
  'myproteinnl',
  'temu',
  'vitakruid',
  // Added 2026-06-07: third batch promoted to live. Each has a brand-content
  // data file and a discounts.json route entry (verified in routes.txt/sitemap).
  '4shine.nl',
  'aimnsportswear',
  'aj-sports.nl',
  'amanoknitwear',
  'badjasparadijs',
  'bbdebiestraatseweide',
  'biteswelove',
  'boomba',
  'bozasieraden',
  'bslm',
  'bstn.com',
  'cecil',
  'cityfit.reformer',
  'curlsbyiris.nl',
  'deachterstehoef',
  'dedic8apparel',
  'doreandrose',
  'edgardcooper',
  'elinerosinajewelry',
  'fejo_studio',
  'fiquethelabel',
  'freciousslowjuice',
  'gastonluga',
  'greenpan',
  'hippegeboortekaartjes',
  'hollandandbarrett',
  'homefitnesscode',
  'ixxi',
  'jackery',
  'jeuliajewelry',
  'jjshouse',
  'kaptenandson',
  'kidsdepartment',
  'kpactive',
  'kymocleaning',
  'lyko',
  'marfum.nl',
  'marleyspoon.nl',
  'mayafreya',
  'mommiesandmiracles',
  'mvolo.nl',
  'mysample.nl',
  'nextextreme',
  'ninjakitchen',
  'nkgellak',
  'nounthestudio',
  'numsy.nl',
  'oliviakate',
  'opberghoekje.nl',
  'organicbasics',
  'osloskinlab',
  'osock_performance',
  'prepmymeal.nl',
  'safira',
  'samiol.com',
  'spacenk.com',
  'sparkleanddream.nl',
  'street-one.nl',
  'stylewe',
  'tefal',
  'thebrandfelice',
  'tommyteleshopping',
  'unwindjewelry',
  'vildthelabel',
  'volero.nl',
  'vulpesbabycare',
  'yvesrocher',
  'zappie',
  'zelesta.nl',
]);

export function isLiveV2Slug(slug: string | undefined | null): boolean {
  return !!slug && LIVE_V2_SLUGS.has(slug.toLowerCase());
}
