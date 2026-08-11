// url-path.js
//
// Percent-encoding for the URL paths we emit in build artifacts (canonical tags,
// sitemap.xml). Shared by set-canonicals.js and fill-routes.js so those two can
// never drift apart.
//
// WHY THIS EXISTS: a handful of shop slugs contain spaces — 'lounge by zalando',
// 'about you', 'odido thuis', 'FBTO Zorg'. A raw space is not legal in a URL, so
// `<link rel="canonical" href="https://diski.nl/lounge by zalando/">` and the
// matching <loc> were invalid, and Google is free to drop or re-normalize them.
// Meanwhile Angular's router already renders the internal links as
// /lounge%20by%20zalando/ — so the canonical disagreed with every link pointing
// at the page, which is exactly the signal a canonical is supposed to settle.
//
// THE RULE: match Angular's own path serializer character for character. Not
// plain encodeURIComponent — Angular deliberately leaves @ : $ , & unencoded in a
// path segment and encodes parentheses (they delimit its auxiliary-route syntax).
// '&' matters here: 'h&m' and 'peek&cloppenburg' render as /h&m/, so encoding it
// to /h%26m/ would invent a second URL for a page that is already indexed under
// the literal form. Percent-encoding is not cosmetic — it changes URL identity —
// so the safe move is to emit precisely what the site links to.
//
// Mirrors encodeUriSegment/encodeUriString in @angular/router's url_tree.ts.
function encodePathSegment(segment) {
  return encodeURIComponent(segment)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/%26/gi, '&');
}

// Encodes each segment of a '/'-joined path, leaving the separators intact so
// multi-segment routes like 'blogs/space-nk' survive.
function encodePath(routePath) {
  return routePath.split('/').map(encodePathSegment).join('/');
}

module.exports = { encodePathSegment, encodePath };
