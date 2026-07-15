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
