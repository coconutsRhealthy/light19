/**
 * Webshops that may NOT appear on /blackfriday.
 *
 * WHY A BLOCKLIST AND NOT AN ALLOWLIST
 * The promotions feed rotates daily and the registry keeps growing, so an
 * allowlist silently hides shops it has never heard of — including the best
 * ones. A blocklist keeps the page open by default and only removes what we
 * have actually judged. The trade is that a genuinely new bad brand shows up
 * until someone adds it here, so this list needs an occasional pass.
 *
 * THE BAR  (measured 2026-08-12, 90-day window)
 *     block if  NL brand search volume <= 500  AND  diski homepage demand <= 10
 *
 * Both gates must fail. A shop nobody in the Netherlands searches for AND that
 * our own visitors never touch has nothing to offer a first-time visitor except
 * the impression that this page is a directory of unknown brands. Anything that
 * clears either bar stays — including shops with no national profile but real
 * traffic from our own audience (jhypes, otensien, whitefoxboutique).
 *
 * Volume is Ahrefs, country nl. Demand is GA4 CopyCode + LogoShopHomepage +
 * FeaturedDeal + Search_typing, unique users, all on pagePath=/.
 *
 * MEASUREMENT WARNING — READ THIS BEFORE ADDING A NAME
 * Measure the brand BOTH ways — the slug spelling and the spaced spelling — and
 * take the HIGHER number. A slug runs the words together, which nobody types, so
 * a multi-word brand reads as near-zero traffic; but some brands really are one
 * word, and there the spaced form is the wrong one. Neither spelling is reliable
 * alone. Every one of these sat in a draft of this list until re-measured:
 *     msmode             5.700  ->  "ms mode"               98.000
 *     ginatricot         5.700  ->  "gina tricot"           85.000
 *     jdsports           4.300  ->  "jd sports"             81.000
 *     cottonclub         5.200  ->  "cotton club"           61.000
 *     pinkgellac         7.700  ->  "pink gellac"           61.000
 *     vvvcadeaukaarten     900  ->  "vvv cadeaukaart"       54.000
 *     ullapopken         1.100  ->  "ulla popken"           44.000
 *     littledutch          450  ->  "little dutch"          42.000
 *     nelsonschoenen       100  ->  "nelson schoenen"       23.000
 *     sophiamae            500  ->  "sophia mae"            22.000
 *     emmasleepnl            0  ->  "emma sleep"            18.000
 *     loungeunderwear      100  ->  "lounge underwear"      16.000
 *     sizzthebrand         250  ->  "sizz the brand"        13.000
 *     olcaygulsenbeauty     20  ->  "olcay gulsen beauty"    6.500
 *     drksonline           200  ->  "drks"                   4.200
 * And the other direction, where the slug is right:
 *     boozyshop          5.200  ->  "boozy shop"               200
 *     bubbleroom         4.200  ->  "bubble room"               50
 * Four separate rounds of checking caught these. Assume any single spelling is
 * wrong until you have measured both.
 *
 * TUNING (shops blocked, out of the 236 that had a live promo on 2026-08-12)
 *     vol<=100  & demand<=10    39 shops,  85 promos
 *     vol<=250  & demand<=10    53 shops, 121 promos
 *     vol<=500  & demand<=10    62 shops, 138 promos   <- current
 *     vol<=10000 & demand<=50  118 shops
 *     vol<=15000 & demand<=50  124 shops
 * The higher tiers were computed but NOT adopted. Raising the bar grows the
 * false-block zone faster than it grows the list: every rescue above was found
 * while checking those tiers, and each one is a brand the page should keep.
 * Do not jump to them without hand-checking every name that gets added.
 *
 * Regenerate the demand side with scripts/ga4/blackfriday_shop_demand.py.
 * Matching is on the feed's exact webshop_name.
 */
export const BLACKFRIDAY_BLOCKED_SHOPS: ReadonlySet<string> = new Set([
  "24uomo",                    // vol  150  demand   0  fashion
  "3bearsporridge",            // vol   20  demand   0  food-drinks
  "8849tech",                  // vol    0  demand   0  electronics
  "adventure.beds",            // vol  150  demand   0  baby-kids
  "agtronica",                 // vol  150  demand   7  electronics
  "akuwoodpenal",              // vol    0  demand   0  home-interior
  "alpha.lion",                // vol   50  demand   0  supplements-nutrition
  "amanoknitwear",             // vol    0  demand   0  fashion
  "amisamour",                 // vol    0  demand   4  fashion
  "aromadiffusing.nl",         // vol  150  demand   0  home-interior
  "athleticbees.com",          // vol    0  demand   6  fashion
  "bibiboutique.be",           // vol   30  demand   0  fashion
  "biotechusa",                // vol  100  demand   0  supplements-nutrition
  "buckedup",                  // vol  150  demand   0  supplements-nutrition
  "butlerloftet",              // vol   60  demand   0  fashion
  "bybrielshuysje",            // vol   70  demand   0  home-interior
  "citybeach",                 // vol   80  demand   0  fashion
  "colorescience",             // vol    0  demand   1  beauty
  "daye",                      // vol   20  demand   0  other
  "elevatedfashion.eu",        // vol  250  demand   0  fashion
  "emmanoah",                  // vol   70  demand   4  baby-kids
  "everready.nl",              // vol  100  demand   4  beauty
  "evryjewels",                // vol  100  demand   0  jewelry
  "fatmoose",                  // vol  150  demand   5  baby-kids
  "featherwomen",              // vol  500  demand   2  beauty
  "fejo_studio",               // vol  200  demand   0  baby-kids
  "finelaserclinic",           // vol  300  demand   0  beauty
  "fittasticsportswear",       // vol   60  demand   2  sports-fitness
  "glowmode",                  // vol    0  demand   2  sports-fitness
  "goodevas.com",              // vol   20  demand   3  baby-kids
  "gympin",                    // vol  150  demand   0  sports-fitness
  "hugesupplements",           // vol  300  demand   2  supplements-nutrition
  "hydrojug",                  // vol   20  demand   0  sports-fitness
  "indya",                     // vol   10  demand   0  fashion
  "insentials.supplements",    // vol  150  demand   2  supplements-nutrition
  "jeuliajewelry",             // vol   40  demand   2  jewelry
  "kidsdepartment",            // vol   90  demand   0  baby-kids
  "kudlworld",                 // vol   60  demand   1  baby-kids
  "little_monkeez.nl",         // vol   60  demand   2  baby-kids
  "loragal",                   // vol   10  demand   0  fashion
  "merakitech",                // vol   20  demand   0  kitchen-cookware
  "micas",                     // vol    0  demand   6  fashion
  "minioliestore",             // vol   60  demand   1  baby-kids
  "mysample.nl",               // vol   10  demand   0  beauty
  "nextextreme",               // vol   30  demand   6  sports-fitness
  "olivida.nl",                // vol   30  demand   6  beauty
  "osloskinlab",               // vol   60  demand   3  beauty
  "osock_performance",         // vol    0  demand   5  sports-fitness
  "padelmarket",               // vol  100  demand   1  sports-fitness
  "plotpackers",               // vol    0  demand   1  travel-leisure
  "rawnutrition",              // vol  150  demand   0  supplements-nutrition
  "rungne",                    // vol   80  demand   0  sports-fitness
  "saeroo",                    // vol    0  demand   4  fashion
  "safira",                    // vol   10  demand   6  jewelry
  "samiol.com",                // vol   40  demand   0  fashion
  "sandandsky",                // vol   30  demand   3  beauty
  "silksilky_official",        // vol  150  demand   2  fashion
  "stylekorean",               // vol   80  demand   1  beauty
  "stylewe",                   // vol   10  demand   0  fashion
  "trendcarpet",               // vol   20  demand   2  home-interior
  "vitalstyle.nl",             // vol  150  demand   4  pets
  "viverelondon",              // vol    0  demand   0  fashion
]);
