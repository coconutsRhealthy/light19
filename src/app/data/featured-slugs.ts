// The shops that are eligible for the "beste deals en kortingscodes" rail on the
// homepage. This is the ONLY hand-maintained input to that section: everything a
// card shows (the code, its value, the sale line) comes from the live data.
//
// A slug listed here renders only when it actually has something to show — a code
// in discounts.json and/or a sale in spotted-sales.json. Listing a slug with
// neither is harmless; it's simply skipped until data shows up for it.
//
// Order here does NOT matter: cards are sorted by most recently spotted activity.
//
// Slugs are the same ones the brand pages use, i.e. the company name lowercased
// with any "(bracket)" suffix stripped — e.g. "na-kd", "gymshark", "oral-b".
// Shops PINNED to the rail: each is guaranteed a code card, in the order listed
// here, directly after any hand-written top deals and ahead of the random draw.
//
// Use this when a specific shop must appear today — the card is built from the
// LIVE feed, so it shows that shop's most recent code automatically; you never
// write the code by hand. (That's the difference from top-deals.json, which is
// free text and pulls nothing from the feed.)
//
// A pinned slug with no code in discounts.json is skipped, exactly like a
// featured one — it never leaves a blank card. Pinning more shops than there are
// slots (MAX_CARDS, minus any top deals) simply drops the overflow off the end.
//
// Keep this SHORT. Every pin costs one of the five slots and squeezes out the
// random rotation that gives the rail its variety. Clear it when the promotion
// is over — pins do not expire on their own.
export const PINNED_SLUGS: string[] = [
  'douglas'
];

export const FEATURED_SLUGS: string[] = [
  'nakdfashion',
  'gymshark',
  'temu',
  'shein',
  'lookfantastic',
  'myproteinnl',
  'pinkgellac',
  'ginatricot',
  'creamyfabrics',
  'bylashbabe',
  'oduree.nl',
  'loavies'
];
