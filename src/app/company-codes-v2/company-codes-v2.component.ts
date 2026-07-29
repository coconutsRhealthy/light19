import { Component, OnInit, OnDestroy, AfterViewInit, PLATFORM_ID, ElementRef, ViewChild, ViewChildren, QueryList, afterNextRender, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { DiscountsService } from '../services/discounts.service';
import { WebshopNameService } from '../services/webshop-name.service';
import { LogosService } from '../services/logos.service';
import { MetaService } from '../services/meta.service';
import { AffiliateLinkService } from '../services/affiliate-link.service';
import { VisitorProfileService } from '../services/visitor-profile.service';
import { ModalComponent } from '../modal/modal.component';
import { BrandContent, BrandVideo } from './brand-content/brand-content.model';
import { BUILD_DATE_ISO } from '../build-info';
import spottedSalesData from '../data/spotted-sales.json';

declare let gtag: Function;

interface CodeVM {
  code: string;        // the coupon code
  rawValue: string;    // e.g. "15", "20", "€7.50"
  valueText: string;   // display value, e.g. "15%", "€7,50"
  isPercent: boolean;
  label?: string;      // bracket label from the data, e.g. "beauty"
  date: Date;          // when the code was last spotted/checked
  rawDate: string;     // original "MM-DD" string (the modal expects this format)
  dateLabel: string;   // e.g. "27 mei 2026"
}

interface RelatedShopVM {
  slug: string;
  name: string;
  logo?: string;
  topDiscount?: string;
}

// One past sale spotting for this shop, from the R2 "spotted promotions" feed
// baked into spotted-sales.json at build time (so it's prerendered, no runtime
// fetch). `isNew` is measured against the build date, not runtime, to stay
// deterministic / hydration-safe.
interface SaleVM {
  text: string;       // Dutch summary of the sale, e.g. "Zomersale met 40% korting"
  dateLabel: string;  // "7 juli 2026"
  iso: string;        // "2026-07-07" (for <time datetime>)
  isNew: boolean;     // spotted within 7 days of the build date
}

// The bundled feed, keyed by the same slug the pages use.
const SPOTTED_SALES = spottedSalesData as { [slug: string]: { text: string; date: string }[] };

// A sale spotted within this many days of the build date gets the "Nieuw" badge.
const SALE_NEW_WINDOW_DAYS = 7;

const MONTHS_NL = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december'
];

// Used to top up the related-shops grid when a shop's own co-occurrence list
// yields too few live links (the thin-shop fallback, e.g. Zalando).
const DEFAULT_RELATED = ['nakdfashion', 'shein', 'ginatricot', 'gutsgusto', 'temu', 'loavies', 'bjornborg', 'zalando'];
const RELATED_MAX = 8;

// Shops whose <title> / meta description advertise a ceiling above the best live
// code. Keys are the route slug (lowercased, no bracket label) — the same form as
// `this.company`. Deliberate marketing choice, and it makes the snippet disagree
// with the codes listed on the page, so keep the list short and revisit it.
// Picked from GSC (28d window ending 2026-07-27): every one sits at average
// position 5-10 with a CTR under diski's own median for that position band, i.e.
// first-page traffic the snippet isn't converting. Columns: position, impressions,
// CTR vs the band median.
const TITLE_BOOST_SLUGS = new Set<string>([
  'esn',            // 7.0   7043   0.8% vs 2.6%
  'asos',           // 6.4   5208   0.5% vs 2.5%
  'lookfantastic',  // 8.2   7931   0.1% vs 1.5%
  'begolden',       // 6.4   4590   0.9% vs 2.5%
  'myproteinnl',    // 9.4   6522   0.3% vs 0.9%
  'loopearplugs',   // 8.1   4391   0.8% vs 1.5%
  'joybuy',         // 6.2  10172   2.3% vs 2.5%
  'emmasleepnl'     // 9.3   5025   0.5% vs 0.9%
]);
const TITLE_BOOST_PCT = 5;
// Hard ceiling, so a shop with an already-high code can't produce "tot 100% korting".
const TITLE_BOOST_CAP = 70;

// Below this, a leading number in stacked notation is read as BOGO ("1+1"), not as
// a percentage worth putting in the title.
const MIN_HEADLINE_PCT = 5;

/**
 * v2 showcase page — data-driven for any shop that has a brand-content data file.
 * Served live and indexable on the real /:company route (the guard routes such
 * shops here; every other shop falls through to the v1 component). Codes come from
 * discounts.json; per-shop copy comes from the brand-content registry (grounded in
 * influencer captions where available).
 */
@Component({
  selector: 'app-company-codes-v2',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, ModalComponent],
  templateUrl: './company-codes-v2.component.html',
  styleUrls: ['./company-codes-v2.component.css']
})
export class CompanyCodesV2Component implements OnInit, OnDestroy, AfterViewInit {
  company = '';
  displayName = '';
  logoUrl = '';
  content: BrandContent | null = null;

  monthYear = '';
  // "Laatst gecontroleerd" = the build/regeneration date (a real event: codes are
  // re-verified from discounts.json on each build), NOT a runtime new Date(). This
  // keeps the freshness signal honest and avoids an SSR/CSR hydration mismatch.
  lastCheckedLabel = '';
  lastCheckedIso = '';
  // Highest percentage across this shop's codes, and — for shops that only hand out
  // fixed amounts off (Temu, HelloFresh, AliExpress) — the highest euro amount.
  // Both feed the title/description headline only; the codes render from rawValue.
  maxDiscount = 0;      // rank only: "40+10" ranks as 50 so it beats a flat 25
  maxDiscountText = ''; // what the title prints: "40+10", "50+30", "25"
  maxEuro = 0;

  regularCodes: CodeVM[] = [];
  relatedShops: RelatedShopVM[] = [];
  saleHistory: SaleVM[] = [];

  affiliateLink: string | undefined;
  isModalVisible = false;
  selectedDiscount: any = null;

  readonly codeCollapseLimit = 15;
  showAllCodes = false;

  // Hero lede: on mobile it clamps to 2 lines with a "Meer" toggle so codes sit
  // higher above the fold. ledeOverflows gates the toggle — a short lede that
  // already fits 2 lines gets no toggle. Both are measured client-side.
  ledeExpanded = false;
  ledeOverflows = false;
  @ViewChild('ledeText') private ledeTextRef?: ElementRef<HTMLElement>;

  get visibleRegularCodes(): CodeVM[] {
    return this.showAllCodes ? this.regularCodes : this.regularCodes.slice(0, this.codeCollapseLimit);
  }

  readonly saleCollapseLimit = 6;
  showAllSales = false;

  get visibleSaleHistory(): SaleVM[] {
    return this.showAllSales ? this.saleHistory : this.saleHistory.slice(0, this.saleCollapseLimit);
  }

  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private allLogos: { [name: string]: string } = {};

  // ---- brand video(s): muted autoplay loop on scroll-into-view, tap for sound ----
  // A shop can carry one or more clips; `video` (singular) is the legacy shorthand.
  mutedFlags: boolean[] = [];           // per-clip sound state (index-aligned with videoList)
  private videoObserver?: IntersectionObserver;
  private inView = new WeakMap<Element, boolean>();
  @ViewChildren('brandVideo') private videoRefs!: QueryList<ElementRef<HTMLVideoElement>>;

  /** Normalised list: explicit `videos`, else the single `video`, else empty. */
  get videoList(): BrandVideo[] {
    return this.content?.videos ?? (this.content?.video ? [this.content.video] : []);
  }

  /** Clips start muted; the badge label reads from this. */
  isMuted(i: number): boolean { return this.mutedFlags[i] !== false; }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    // Initial wiring is done by afterNextRender (post-hydration; see constructor).
    // Here we only re-wire when the rendered <video> set changes — e.g. client-side
    // navigation between v2 shops (component reused, no hydration involved).
    this.videoRefs.changes.subscribe(() => this.setupVideos());
  }

  private setupVideos(): void {
    this.videoObserver?.disconnect();
    const els = this.videoRefs.map(r => r.nativeElement);
    if (!els.length) return;
    this.videoObserver = new IntersectionObserver(entries => {
      for (const e of entries) {
        this.inView.set(e.target, e.isIntersecting);
        const el = e.target as HTMLVideoElement;
        if (e.isIntersecting) { this.schedulePlay(el); } else { el.pause(); }
      }
    }, { threshold: 0.5 });
    for (const el of els) { el.muted = true; this.videoObserver.observe(el); }
  }

  /**
   * Defer the autoplay fetch until the browser is idle. On desktop a clip can be in
   * the viewport at load, so playing immediately would pull ~1MB while the page is
   * still loading its critical content. requestIdleCallback yields that bandwidth to
   * the above-the-fold render first, then starts the clip a beat later (timeout
   * fallback so it always starts). Re-checks visibility so a quick scroll-past doesn't
   * play offscreen. No visual change on a normal connection.
   */
  private schedulePlay(el: HTMLVideoElement): void {
    const start = () => { if (this.inView.get(el)) el.play().catch(() => {}); };
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void }).requestIdleCallback;
    if (ric) { ric(start, { timeout: 2000 }); } else { setTimeout(start, 1200); }
  }

  /** Tap a clip (or its badge) to toggle that clip's sound. The tap is the user
   *  gesture browsers require before a video may play audio. */
  toggleVideoSound(i: number): void {
    const el = this.videoRefs?.get(i)?.nativeElement;
    if (!el) return;
    el.muted = !el.muted;
    this.mutedFlags[i] = el.muted;
    if (!el.muted && el.paused) el.play().catch(() => {});
  }

  /**
   * Href for a related-shop link: the real `/{slug}/` page (indexable). Keeps the
   * project-wide trailing slash.
   */
  relatedHref(slug: string): string {
    return `/${slug}/`;
  }

  /**
   * In-page anchor scroll for the TOC / skip link. With `<base href="/">` a bare
   * `href="#id"` resolves to the homepage (https://diski.nl/#id) instead of the
   * current page, so we intercept the click, scroll to the section ourselves, and
   * set the hash on the CURRENT url (history API ignores <base>).
   */
  scrollToSection(event: Event, id: string): void {
    if (!this.isBrowser) return;
    const el = document.getElementById(id);
    if (!el) return;
    event.preventDefault();
    el.scrollIntoView({ behavior: 'smooth' });
    history.replaceState(null, '', `${location.pathname}${location.search}#${id}`);
  }

  /** Does the (mobile-clamped) hero lede overflow 2 lines? Decides whether the
   *  "Meer" toggle is shown. Only meaningful while collapsed — when expanded the
   *  clamp is off so height would read as non-overflowing. Bound as a property so
   *  it can (de)register directly as a resize listener. */
  private measureLede = (): void => {
    if (!this.isBrowser || this.ledeExpanded) return;
    const el = this.ledeTextRef?.nativeElement;
    if (!el) return;
    this.ledeOverflows = el.scrollHeight - el.clientHeight > 2;
  };

  constructor(
    private route: ActivatedRoute,
    private discounts: DiscountsService,
    private names: WebshopNameService,
    private logos: LogosService,
    private meta: MetaService,
    private affiliateLinkService: AffiliateLinkService,
    private visitorProfile: VisitorProfileService
  ) {
    // Wire up the video(s) AFTER hydration. ngAfterViewInit runs too early: on a
    // server-rendered page Angular hydration replaces the <video> DOM nodes shortly
    // after, leaving any observer attached in ngAfterViewInit watching detached
    // elements (so the live clips never muted/played). afterNextRender fires after
    // the post-hydration render, so setupVideos sees the real, connected elements.
    afterNextRender(() => {
      this.setupVideos();
      this.measureLede();
      window.addEventListener('resize', this.measureLede);
    });
  }

  ngOnInit(): void {
    this.logos.getAllLogos().subscribe(all => {
      this.allLogos = all;
      this.logoUrl = all[this.company] ?? this.logoUrl;
    });

    // Grounded content is resolved by brandContentResolver BEFORE this component
    // activates, so it's always present here — no in-component loading, no skeleton,
    // no flicker. route.data emits synchronously on subscribe (so a direct load has
    // content before the first change detection — no hydration mismatch) and re-emits
    // when navigating between v2 shops (the component instance is reused).
    this.route.data.subscribe(data => {
      this.company = (this.route.snapshot.paramMap.get('company') ?? '').toLowerCase();
      this.showAllCodes = false;
      this.showAllSales = false;
      this.ledeExpanded = false;
      this.ledeOverflows = false;
      if (this.isBrowser) setTimeout(() => this.measureLede(), 0);
      this.isModalVisible = false;
      this.selectedDiscount = null;
      this.mutedFlags = [];

      this.content = (data['brandContent'] as BrandContent | null) ?? null;
      this.applyDisplayName();
      this.logoUrl = this.allLogos[this.company] ?? this.logoUrl;

      this.discounts.getDiscounts().subscribe(lines => this.build(lines));
    });
  }

  ngOnDestroy(): void {
    this.videoObserver?.disconnect();
    if (this.isBrowser) window.removeEventListener('resize', this.measureLede);
  }

  private applyDisplayName(): void {
    this.displayName = this.content?.name
      ?? this.names.getWebshopName(this.company)
      ?? this.company.charAt(0).toUpperCase() + this.company.slice(1);
  }

  private build(lines: string[]): void {
    const now = new Date();
    const year = now.getFullYear();
    this.monthYear = `${MONTHS_NL[now.getMonth()]} ${year}`;

    const parsed: CodeVM[] = lines
      .map(line => line.split(', '))
      .filter(parts => {
        const nameNoBrackets = (parts[0] ?? '').replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
        return nameNoBrackets === this.company;
      })
      .map(parts => {
        const companyRaw = parts[0] ?? '';
        const code = parts[1] ?? '';
        const rawValue = (parts[2] ?? '').trim();
        const dateStr = (parts[4] ?? '').trim();

        const bracket = companyRaw.match(/\(([^)]*)\)/);
        const label = bracket ? bracket[1].trim() : undefined;
        const isPercent = isFinite(Number(rawValue)) && rawValue !== '' && !rawValue.includes('€');
        const date = this.parseDate(dateStr, year);

        return {
          code,
          rawValue,
          valueText: this.formatValue(rawValue, isPercent),
          isPercent,
          label,
          date,
          rawDate: dateStr,
          dateLabel: this.formatDate(date)
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    this.regularCodes = parsed;
    this.affiliateLink = this.affiliateLinkService.getAffiliateLink(this.company);

    // Page-level "laatst gecontroleerd" from the baked build date (deterministic, SSR-safe).
    const [by, bm, bd] = (BUILD_DATE_ISO || '').split('-').map(Number);
    const checked = (by && bm && bd) ? new Date(by, bm - 1, bd) : now;
    this.lastCheckedIso = BUILD_DATE_ISO || this.toIsoDate(now);
    this.lastCheckedLabel = this.formatDate(checked);

    // No backup-code fallback here: fetch-discounts.js injects a shop's backupCode into
    // discounts.json at build time when it has no live code, so `parsed` above already
    // contains it. That keeps the rest of the site (homepage table, /winkels, search,
    // related-shops grids) able to see the shop too.

    const headline = this.regularCodes
      .map(c => this.percentHeadlineOf(c.rawValue))
      .reduce((best, h) => (h.rank > best.rank ? h : best), { rank: 0, text: '' });
    this.maxDiscount = headline.rank;
    this.maxDiscountText = headline.text;
    this.maxEuro = this.regularCodes
      .reduce((max, c) => Math.max(max, this.euroValueOf(c.rawValue)), 0);

    this.buildSaleHistory(checked);
    this.buildRelatedShops(lines);
    this.applySeo();

    // Deep link: opening /{company}#i={index} (e.g. in the new tab spawned by
    // the affiliate flow) re-opens the code modal for that code — mirrors v1.
    const fragment = this.route.snapshot.fragment;
    if (fragment) {
      const params = new URLSearchParams(fragment);
      if (params.has('i')) {
        const i = Number(params.get('i'));
        if (!isNaN(i) && i >= 0 && i < this.regularCodes.length) {
          this.openModal(this.regularCodes[i]);
        }
      }
    }
  }

  /**
   * Sale history: every past sale we spotted for this shop (from the R2 "spotted
   * promotions" feed, baked into spotted-sales.json at build time so it renders
   * prerendered with no runtime fetch). Deduped + newest-first already; here we
   * just format the dates and flag the recent ones. "Recent" is measured against
   * the BUILD date (buildDate), not runtime, so the badge stays deterministic and
   * doesn't drift / cause a hydration mismatch as the static HTML ages.
   */
  private buildSaleHistory(buildDate: Date): void {
    const entries = SPOTTED_SALES[this.company] ?? [];
    this.saleHistory = entries.map(e => {
      const d = this.parseIsoDate(e.date);
      const ageDays = (buildDate.getTime() - d.getTime()) / 86400000;
      return {
        text: e.text,
        dateLabel: this.formatDate(d),
        iso: e.date,
        isNew: ageDays <= SALE_NEW_WINDOW_DAYS,
      };
    });
  }

  private parseIsoDate(iso: string): Date {
    const [y, m, d] = (iso || '').split('-').map(Number);
    return (y && m && d) ? new Date(y, m - 1, d) : new Date(NaN);
  }

  /**
   * Builds the related-shops grid. Candidates come from the shop's co-occurrence
   * list (content.related), topped up with a default pool when too thin, and
   * filtered to shops that actually have codes (a live page) in the data.
   */
  private buildRelatedShops(lines: string[]): void {
    // Index every shop in the data once: slug -> highest % discount available.
    const index = new Map<string, number>();
    for (const parts of lines.map(l => l.split(', '))) {
      const slug = (parts[0] ?? '').replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
      if (!slug) continue;
      const raw = (parts[2] ?? '').trim();
      const pct = isFinite(Number(raw)) && raw !== '' && !raw.includes('€') ? Number(raw) : 0;
      index.set(slug, Math.max(index.get(slug) ?? 0, pct));
    }

    const candidates = [...(this.content?.related ?? []), ...DEFAULT_RELATED];
    const seen = new Set<string>([this.company]);
    const out: RelatedShopVM[] = [];

    for (const slug of candidates) {
      const s = slug.toLowerCase();
      if (seen.has(s) || !index.has(s)) continue;   // skip self, dupes, and shops without a live page
      seen.add(s);
      const pct = index.get(s) ?? 0;
      out.push({
        slug: s,
        name: this.displayNameFor(s),
        logo: this.allLogos[s],
        topDiscount: pct > 0 ? `${pct}%` : undefined
      });
      if (out.length >= RELATED_MAX) break;
    }

    this.relatedShops = out;   // default pool is already merged into candidates above
  }

  private displayNameFor(slug: string): string {
    const mapped = this.names.getWebshopName(slug);
    if (mapped) return mapped;
    const noTld = slug.replace(/\.(nl|com|de|eu|be)$/i, '').replace(/[-_.]/g, ' ');
    return noTld.charAt(0).toUpperCase() + noTld.slice(1);
  }

  // ---- SEO: title, meta, structured data -------------------------------------

  private applySeo(): void {
    const name = this.displayName;
    // Trailing slash, matching v1 and the canonical set-canonicals.js writes.
    // Used for og:url (social platforms cache on it, so a mismatch splits the
    // page in two) and for the JSON-LD @id / mainEntityOfPage below.
    const pageUrl = `https://diski.nl/${this.company}/`;
    const count = this.regularCodes.length;
    // Headline value, best-notation-wins: a percentage if the shop has one, else the
    // largest fixed amount off, else nothing quantifiable. `ceiling` carries the
    // "tot X" for the title; `savings` is the same figure without the trailing
    // "korting", because "Bespaar tot 20% korting" reads as a double negative in NL.
    // Two ceilings. `trueCeiling` is what the codes on the page actually give;
    // `ceiling` may be nudged up for the slugs in TITLE_BOOST_SLUGS. Snippet copy
    // (title, meta description, og/twitter) uses `ceiling`; the JSON-LD below uses
    // `trueCeiling`, because an Article claiming 30% beside an Offer claiming 25%
    // on the same URL is a contradiction a parser can see, not just marketing copy.
    let trueCeiling = '';
    let ceiling = '';
    if (this.maxDiscount > 0) {
      trueCeiling = `tot ${this.maxDiscountText}%`;
      // The boost only applies to a plain single number — bumping "40+10" to "45+10"
      // would misstate which half of a stacked offer got bigger.
      const boostable = TITLE_BOOST_SLUGS.has(this.company) && !this.maxDiscountText.includes('+');
      ceiling = boostable
        ? `tot ${Math.min(this.maxDiscount + TITLE_BOOST_PCT, TITLE_BOOST_CAP)}%`
        : trueCeiling;
    } else if (this.maxEuro > 0) {
      trueCeiling = `tot ${this.formatEuro(this.maxEuro)}`;
      ceiling = trueCeiling;
    }

    // No quantifiable value: lead on the code count instead of the empty "→ korting"
    // the euro-only / odd-notation shops used to get.
    const countPhrase = `${count} code${count === 1 ? '' : 's'} getest`;
    const valuePhrase = ceiling ? `${ceiling} korting` : countPhrase;

    const title = `Werkende ${name} kortingscode ${this.monthYear} → ${valuePhrase} | Diski`;
    const describe = (limit: string) =>
      `${count} werkende ${name} kortingscode${count === 1 ? '' : 's'} in ${this.monthYear}, ` +
      `dagelijks gecontroleerd door onze redactie. ` +
      (limit
        ? `Bespaar ${limit} op je bestelling bij ${name}.`
        : `Bekijk alle geldige codes en aanbiedingen van ${name}.`);
    const description = describe(ceiling);
    const schemaDescription = describe(trueCeiling);

    this.meta.updateTitle(title);
    this.meta.updateMetaInfo(description, 'diski.nl', `${name}, Kortingscode, Korting`);
    this.meta.updateOgTags(title, description, pageUrl);

    // Every v2 page is live on the real /:company route, so it must be indexable;
    // actively clear any stale noindex left by a prior navigation.
    this.meta.setIndex();

    this.meta.setJsonLd('v2-organization', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://diski.nl/#organization',
      'name': 'Diski',
      'url': 'https://diski.nl/',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://cdn.jsdelivr.net/gh/wgknl/diski-assets/logos/webp/avatar.webp'
      },
      'sameAs': [
        'https://www.instagram.com/wiegeeftkorting/',
        'https://www.tiktok.com/@andyyrobe'
      ]
    });

    this.meta.setJsonLd('v2-website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': 'https://diski.nl/#website',
      'url': 'https://diski.nl/',
      'name': 'Diski',
      'inLanguage': 'nl-NL',
      'publisher': { '@id': 'https://diski.nl/#organization' }
    });

    this.meta.setJsonLd('v2-breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Kortingscodes', 'item': 'https://diski.nl/' },
        { '@type': 'ListItem', 'position': 2, 'name': `${name} kortingscode`, 'item': pageUrl }
      ]
    });

    this.meta.setJsonLd('v2-article', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': pageUrl + '#article',
      'headline': `${name} Kortingscode ${this.monthYear}`,
      // Unboosted on purpose — must agree with the v2-offers ItemList below.
      'description': schemaDescription,
      'dateModified': this.lastCheckedIso,
      'inLanguage': 'nl-NL',
      'author': { '@type': 'Organization', 'name': 'Redactie Diski', 'url': 'https://diski.nl/' },
      'publisher': { '@id': 'https://diski.nl/#organization' },
      'mainEntityOfPage': { '@id': pageUrl },
      'about': { '@type': 'Organization', 'name': name }
    });

    const faq = this.content?.faq ?? [];
    if (faq.length) {
      this.meta.setJsonLd('v2-faq', {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faq.map(item => ({
          '@type': 'Question',
          'name': item.q,
          'acceptedAnswer': { '@type': 'Answer', 'text': item.a }
        }))
      });
    }

    const offerItems = this.regularCodes.map((c, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'item': {
        '@type': 'Offer',
        'name': `${name} kortingscode: ${c.code}`,
        'description': `${c.valueText} korting bij ${name}${c.label ? ' (' + c.label + ')' : ''}.`,
        'category': 'Kortingscode',
        'validFrom': this.toIsoDate(c.date),
        'seller': { '@type': 'Organization', 'name': name }
      }
    }));

    const vids = this.videoList;
    if (vids.length) {
      // One VideoObject per clip, emitted as a single top-level JSON-LD array (valid,
      // and keeps one script id so a later navigation overwrites rather than stacks).
      this.meta.setJsonLd('v2-video', vids.map(v => ({
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        'name': v.title ?? `${name} in beeld`,
        'description': v.description ?? `Video van ${name}.`,
        'thumbnailUrl': v.poster,
        'contentUrl': v.src,
        'uploadDate': this.toIsoDateTime(v.uploadDate ?? this.lastCheckedIso),
        'inLanguage': 'nl-NL',
        'publisher': { '@id': 'https://diski.nl/#organization' },
        ...(v.duration ? { 'duration': `PT${Math.round(v.duration)}S` } : {})
      })));
    }

    if (offerItems.length) {
      this.meta.setJsonLd('v2-offers', {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': `${name} kortingscodes ${this.monthYear}`,
        'numberOfItems': offerItems.length,
        'itemListElement': offerItems
      });
    }
  }

  // ---- helpers ---------------------------------------------------------------

  private parseDate(monthDay: string, year: number): Date {
    const [mm, dd] = monthDay.split('-').map(Number);
    if (!mm || !dd) return new Date(year, 0, 1);
    return new Date(year, mm - 1, dd);
  }

  private formatDate(d: Date): string {
    return `${d.getDate()} ${MONTHS_NL[d.getMonth()]} ${d.getFullYear()}`;
  }

  private toIsoDate(d: Date): string {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  // Normalize a date(-time) string to a full ISO 8601 value that carries a timezone,
  // as Google's VideoObject uploadDate requires. A bare "YYYY-MM-DD" is anchored to
  // midnight UTC; values that already include a time + offset are passed through.
  private toIsoDateTime(value: string): string {
    if (!value) return value;
    if (/T.*(Z|[+-]\d{2}:?\d{2})$/.test(value)) return value;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00:00Z`;
    return value;
  }

  private formatValue(rawValue: string, isPercent: boolean): string {
    if (isPercent) return `${rawValue}%`;
    return rawValue.replace('.', ',');
  }

  // ---- headline value for the SEO copy ---------------------------------------
  //
  // Deliberately separate from CodeVM.isPercent, which drives what the code tile
  // shows: a "40+10" stays "40+10" on the page, but the title may honestly say
  // "tot 40% korting". These two only read the value, never rewrite it.

  /**
   * The percentage a value advertises, as a `rank` for picking the best code and
   * the `text` to print. Stacked offers keep their notation — "40+10" ranks as 50
   * so it wins over a flat 25, but still prints as "tot 40+10% korting", because
   * collapsing it to "tot 40%" hides the second half of the offer.
   * `rank: 0` means "not a percentage".
   */
  private percentHeadlineOf(rawValue: string): { rank: number; text: string } {
    const none = { rank: 0, text: '' };
    const v = rawValue.trim().replace(/^tot\s+/i, '');
    if (v === '' || /[€$£]/.test(v)) return none;
    if (isFinite(Number(v))) return { rank: Number(v), text: v };   // "15", "tot 50"

    const parts = v.split('+').map(p => p.trim());
    if (parts.length >= 2 && parts.every(p => p !== '')) {
      const nums = parts.map(Number);
      if (nums.every(n => isFinite(n))) {
        // "40+10", "tot 50+30" — sum to rank, keep the notation to print. The floor
        // on the lead keeps BOGO notation like "1+1" out of the title.
        if (nums[0] < MIN_HEADLINE_PCT) return none;
        return { rank: nums.reduce((a, b) => a + b, 0), text: parts.join('+') };
      }
      // Non-numeric lead ("2F1+15"): only the trailing number is a percentage, and
      // printing "2F1+15%" would be wrong — the 2-for-1 isn't a percentage.
      const tail = Number(parts[parts.length - 1]);
      if (isFinite(tail) && tail >= MIN_HEADLINE_PCT) {
        return { rank: tail, text: String(tail) };
      }
    }
    return none;                                          // "60dgn", "vzk", "1mnd"
  }

  /** Euro amount a value advertises, or 0 if it isn't in euros. */
  private euroValueOf(rawValue: string): number {
    const m = rawValue.match(/€\s*(\d+(?:[.,]\d{1,2})?)/);
    return m ? Number(m[1].replace(',', '.')) : 0;
  }

  private formatEuro(amount: number): string {
    return Number.isInteger(amount)
      ? `€${amount}`
      : `€${amount.toFixed(2).replace('.', ',')}`;
  }

  // ---- code click → modal / affiliate flow (mirrors v1 company-codes) --------

  onCodeClick(code: CodeVM, index: number): void {
    this.trackCompanyInteraction();
    if (this.affiliateLink) {
      // Affiliate present: open the code modal in a NEW tab (via deep link) and
      // send the CURRENT tab to the affiliate link.
      this.sendAffEventsToGa();
      this.openNewPageWithCodeDetailModal(index);
    } else {
      // No affiliate: just open the modal here.
      this.openModal(code);
    }
  }

  private openNewPageWithCodeDetailModal(codeIndex: number): void {
    if (!this.isBrowser) return;
    // Deep-link to the page we're on (mirrors v1's new-tab behaviour).
    const base = `/${this.company}`;
    const url = `${window.location.origin}${base}#i=${encodeURIComponent(codeIndex)}`;
    window.open(url, '_blank');
    if (this.affiliateLink !== undefined) {
      location.href = this.affiliateLink;
    }
  }

  openModal(code: CodeVM): void {
    this.selectedDiscount = {
      company: this.displayName,
      companySlug: this.company,
      discountCode: code.code,
      percentage: code.rawValue,
      date: code.rawDate,
      index: -1,
      affiliateLink: this.affiliateLink,
      label: code.label
    };
    this.isModalVisible = true;
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.selectedDiscount = null;
  }

  private trackCompanyInteraction(): void {
    this.visitorProfile.trackCompanyClick('company_click_detailpage', this.company);

    if (typeof gtag !== 'function') return;
    gtag('event', 'company_click_detailpage', { 'event_category': 'Company_click', 'event_label': `company_click_detailpage_${this.company}` });
  }

  private sendAffEventsToGa(): void {
    if (typeof gtag !== 'function') return;
    gtag('event', 'comp_codes', { 'event_category': 'Comp_codes', 'event_label': 'comp_codes_aff_open' });
    gtag('event', 'comp_codes', { 'event_category': 'Comp_codes', 'event_label': `comp_codes_aff_open_${this.company}` });
  }
}
