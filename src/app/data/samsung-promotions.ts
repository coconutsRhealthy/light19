/**
 * Samsung-specific promotion details.
 *
 * Samsung is a key partner that requires each live promotion to be communicated
 * with its exact, official wording (promo description, looptijd, voorwaarden and
 * the official landingspagina). This file is the single source of truth for that
 * copy — it is consumed both by the discount modal and by the /samsung page, so
 * the two never drift apart.
 *
 * Keyed by the discount code exactly as it appears in discounts.json (use
 * 'geen code nodig' for the code-less promo). Only promotions that are currently
 * live in discounts.json AND were officially confirmed by Samsung belong here.
 * Text is verbatim from Samsung — do not paraphrase.
 */
export interface SamsungPromotion {
  code: string;          // discounts.json code, e.g. 'UBEREATS' or 'geen code nodig'
  promoText: string;     // official promo description (verbatim)
  period: string;        // official looptijd / einddatum (verbatim)
  conditions: string[];  // official voorwaarden lines (verbatim; numbered notes become list items)
  landingUrl: string;    // official Samsung landingspagina
}

export const samsungPromotions: Record<string, SamsungPromotion> = {
  'UBEREATS': {
    code: 'UBEREATS',
    promoText: '€85 Uber Eats voucher bij aankoop van een Samsung TV of Soundbar',
    period: 't/m 07.06.2026',
    conditions: [
      'Uitsluitend de eerste 1500 bestellingen.',
      'Algemene actievoorwaarden van toepassing.',
    ],
    landingUrl: 'https://www.samsung.com/nl/offer/football-moments/',
  },
  'geen code nodig': {
    code: 'geen code nodig',
    promoText: 'Nu tot €1000 Vakantiegeld voordeel en 15% voordeel op TV en Soundbar bundels',
    period: '11.05.2026 t/m 07.06.2026',
    conditions: [
      'Algemene actievoorwaarden van toepassing.',
    ],
    landingUrl: 'https://www.samsung.com/nl/offer/football-moments',
  },
  'GALAXYFIT': {
    code: 'GALAXYFIT',
    promoText: 'Profiteer nu van extra scherpe prijzen¹ en ontvang tijdelijk tot €115 voordeel² op een geselecteerde Galaxy Watch',
    period: '11.05.2026 t/m 07.06.2026',
    conditions: [
      '1. Actieperiode: 18.05.2026 t/m 31.05.2026. Algemene actievoorwaarden van toepassing. Het voordeel is reeds verrekend in de prijs.',
      '2. Actieperiode: 11.05.2026 t/m 07.06.2026. Algemene actievoorwaarden van toepassing.',
    ],
    landingUrl: 'https://www.samsung.com/nl/watches/galaxy-watch-ultra-2025/buy/',
  },
};

export function getSamsungPromotion(code: string): SamsungPromotion | undefined {
  return samsungPromotions[code];
}
