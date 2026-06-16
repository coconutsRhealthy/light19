/**
 * Structured per-shop copy. The v2 component renders these fields with the
 * shared blueprint, so adding a shop = adding one of these objects (no new
 * component, no new template). Copy should be grounded in real source material
 * (influencer captions, verifiable brand facts) — not templated filler.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export interface TitledText {
  h: string;
  p: string;
}

export interface BrandVideo {
  src: string;          // mp4 URL (hosted on R2/CDN, never bundled)
  poster: string;       // still-frame image URL — also the VideoObject thumbnailUrl
  w: number;            // intrinsic width  (for aspect-ratio box, no layout shift)
  h: number;            // intrinsic height
  duration?: number;    // seconds (for VideoObject duration)
  title?: string;       // VideoObject name + visible caption
  description?: string; // VideoObject description
  uploadDate?: string;  // ISO date (VideoObject uploadDate; required for rich results)
  caption?: string;     // short visible line under the video
}

export interface BrandContent {
  slug: string;          // matches discounts.json + ai_canonical, e.g. "nakdfashion"
  name: string;          // display name, e.g. "NA-KD"
  heroLede: string;      // one-paragraph intro under the H1
  about: string[];       // paragraphs for the "Over {name}" section
  why: TitledText[];     // "Waarom shoppen bij {name}" bullets
  trending?: string[];   // "Populair nu" — grounded in real caption themes
  codeInfo?: string[];   // "Zo werkt een {name} kortingscode" paragraphs
  creators?: string[];   // real creator handles who style the brand (E-E-A-T)
  tips: TitledText[];    // savings tips
  faq: FaqItem[];        // matches the visible FAQ + FAQPage JSON-LD
  related?: string[];    // related shop slugs (shared-influencer co-occurrence, ranked)
  video?: BrandVideo;    // optional caption-grounded clip (muted autoplay, tap for sound)
}
