/**
 * Samsung-specific promotion details.
 *
 * Samsung is a key partner that requires each live promotion to be communicated
 * with its exact, official wording (promo description, looptijd, voorwaarden and
 * the official landingspagina). This file is the single source of truth for that
 * copy — it is consumed both by the discount modal and by the /samsung page, so
 * the two never drift apart.
 *
 * Keyed by the bracket label (the "geldig op"-qualifier) exactly as it appears in
 * discounts.json — e.g. the row `samsung (Galaxy Tab), geen code nodig, ...` maps
 * to the 'Galaxy Tab' entry below. We key on the label rather than the code
 * because the current Samsung promos are automatic basket discounts / cart gifts
 * with no code ('geen code nodig'), so the code alone can't tell them apart.
 *
 * Only promotions that are currently live in discounts.json AND were officially
 * confirmed by Samsung belong here. Text is verbatim from Samsung — do not
 * paraphrase. Numbered notes (¹, ²) in promoText map to the matching lines in
 * conditions.
 */
export interface SamsungPromotion {
  code: string;          // discounts.json code, e.g. 'GALAXYFIT' or 'geen code nodig'
  promoText: string;     // official promo description (verbatim)
  period: string;        // official looptijd / einddatum (verbatim)
  conditions: string[];  // official voorwaarden lines (verbatim; numbered notes become list items)
  landingUrl: string;    // official Samsung landingspagina
}

// Keyed by the discounts.json bracket label (see file header).
export const samsungPromotions: Record<string, SamsungPromotion> = {
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
  'monitoren': {
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
};

export function getSamsungPromotion(label: string): SamsungPromotion | undefined {
  return samsungPromotions[label];
}
