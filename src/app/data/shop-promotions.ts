/**
 * Per-shop promotion details, shown as the "Actievoorwaarden" block in the code
 * modal (and, for Samsung, on the brand page body too).
 *
 * Some partners require each live promotion to be communicated with their exact,
 * official wording — promo description, looptijd, voorwaarden and the official
 * landingspagina. This file is the single source of truth for that copy, so the
 * modal and the page can never drift apart.
 *
 * SHAPE — two levels of key:
 *
 *   slug  ->  bracket label  ->  ShopPromotion
 *
 * The outer key is the brand-page slug (lowercased, no bracket suffix), exactly as
 * `companySlug` carries it. The inner key is the discounts.json bracket label, i.e.
 * the "geldig op"-qualifier: the row `samsung (Galaxy Tab), geen code nodig, ...`
 * maps to slug 'samsung', label 'Galaxy Tab'.
 *
 * We key on the label rather than the code because Samsung's promos are automatic
 * basket discounts / cart gifts with no code ('geen code nodig'), so the code alone
 * cannot tell them apart.
 *
 * Shops that run ONE promotion have no bracket label in the feed, so they use the
 * empty-string key '' — see DEFAULT_LABEL. getShopPromotion() falls back to it when
 * a code carries no label, so a single-promo shop needs just one entry.
 *
 * Only promotions that are currently live in discounts.json AND were officially
 * confirmed by the partner belong here. Text is verbatim — do not paraphrase.
 * Numbered notes (¹, ²) in promoText map to the matching lines in conditions.
 *
 * A slug that is absent renders no block at all, which is the default for the
 * ~1500 shops that don't need one.
 */
export interface ShopPromotion {
  code: string;           // discounts.json code, e.g. 'MONITOR26' or 'geen code nodig'
  promoText: string;      // the promo description — the only required field
  heading?: string;       // block title; defaults to 'Actievoorwaarden'
  period?: string;        // looptijd / einddatum (verbatim)
  conditions?: string[];  // voorwaarden lines (verbatim; numbered notes become list items)
  landingUrl?: string;    // official landingspagina ("Bekijk de actiepagina →")
}

/** Inner key for shops whose codes carry no bracket label (a single promotion). */
export const DEFAULT_LABEL = '';

export const shopPromotions: Record<string, Record<string, ShopPromotion>> = {
  // Single promotion, no bracket label in the feed -> the DEFAULT_LABEL key.
  // Not a code deal: the discount sits in the Aanvuldeals campaign itself, so the
  // block explains what the visitor is clicking through to rather than listing
  // voorwaarden. period/conditions are deliberately omitted.
  //
  // No landingUrl on purpose. The bol.com affiliate link in affiliate-link.service.ts
  // already points at this same campaign (1916), and the modal's "Naar winkel →"
  // button uses it. Adding the plain bol.com URL here would put a second link to the
  // same page in the modal, and that one would be untracked — so the visitor could
  // reach the deal through a link that earns nothing.
  'bol.com': {
    '': {
      code: 'geen code nodig',
      heading: 'Over deze deal',
      promoText:
        'Met de Aanvuldeals vul je je voorraad extra voordelig aan: toiletpapier, ' +
        'vaatwastabletten, koffie, luiers en verzorging. Vaak met volumevoordeel — ' +
        'hoe meer je pakt, hoe lager de prijs per stuk. Geen code nodig, de korting ' +
        'zit al in de actie.',
    },
  },
  samsung: {
    'Galaxy Tab': {
      code: 'geen code nodig',
      promoText: 'Ontvang tijdelijk een (Keyboard) Book Cover Cadeau* bij aankoop van een geselecteerde Galaxy Tab, direct toegevoegd in je winkelwagen.',
      period: 't/m 05-07-2026',
      conditions: [
        '*Actieperiode: 01/06/2026 t/m 05/07/2026. Actievoorwaarden van toepassing.',
      ],
      landingUrl: 'https://www.samsung.com/nl/tablets/all-tablets',
    },
    'Galaxy producten': {
      code: 'geen code nodig',
      promoText: 'Ontvang tijdelijk 10% voordeel op geselecteerde Samsung Galaxy Producten bij een minimale besteding van €300*',
      period: '08-06-2026 t/m 30-06-2026',
      conditions: [
        '*Actieperiode: 08-06-2026 t/m 30-06-2026. Geldig op Galaxy Smartphones, Tablets, Books, Buds, Watches en Geheugen & Opslag. Actievoorwaarden van toepassing.',
        'Deelnemende modellen: Alle Galaxy Smartphones, alle Galaxy Tablets, alle Galaxy Books, alle Galaxy Buds, alle Galaxy Watches en alle Geheugen & Opslag.',
      ],
      landingUrl: 'https://www.samsung.com/nl/offer/football-moments/',
    },
    "TV's · Soundbars · Huishouden · Monitoren": {
      code: 'geen code nodig',
      promoText: "Ontvang tot 20% voordeel op TV's, Soundbars, Huishouden & Monitoren bij besteding vanaf €500",
      period: '08-06-2026 t/m 30-06-2026',
      conditions: [
        "Actieperiode: 08-06-2026 t/m 30-06-2026. Ontvang 20% voordeel bij besteding vanaf €2000, 15% voordeel vanaf €1000 en 10% voordeel vanaf €500. Alleen van toepassing op TV's, Soundbars, Huishoudelijke apparaten en Monitoren. Algemene actievoorwaarden van toepassing. Zolang de voorraad strekt.",
      ],
      landingUrl: 'https://www.samsung.com/nl/offer/football-moments/',
    },
    monitoren: {
      code: 'MONITOR26',
      promoText: 'Tijdelijk €100 voordeel met vouchercode op de Samsung ViewFinity S8 of Odyssey G8 monitor',
      period: '15.06.2026 t/m 05.07.2026',
      conditions: [
        'De vouchercode MONITOR26 is eenmalig te gebruiken.',
        'Actievoorwaarden van toepassing.',
        'Zolang de voorraad strekt.',
      ],
      landingUrl: 'https://www.awin1.com/cread.php?s=4794175&v=8330&q=606453&r=1870794',
    },
  },
};

/**
 * The promotion block for a given code, or undefined when the shop has none.
 *
 * Falls back to the DEFAULT_LABEL entry when the code carries no bracket label, so
 * single-promo shops need only one entry keyed ''.
 */
export function getShopPromotion(slug?: string, label?: string): ShopPromotion | undefined {
  if (!slug) return undefined;
  const forShop = shopPromotions[slug.toLowerCase()];
  if (!forShop) return undefined;
  return forShop[label ?? DEFAULT_LABEL] ?? forShop[DEFAULT_LABEL];
}

/** Every promotion for a shop, as [label, promo] pairs. Used by the brand page body. */
export function getShopPromotions(slug?: string): [string, ShopPromotion][] {
  if (!slug) return [];
  return Object.entries(shopPromotions[slug.toLowerCase()] ?? {});
}
