import { Component, OnInit, OnDestroy, PLATFORM_ID, ElementRef, ViewChild, inject } from '@angular/core';
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
import { BrandContent } from './brand-content/brand-content.model';
import { BUILD_DATE_ISO } from '../build-info';

declare let gtag: Function;

interface CodeVM {
  code: string;        // the coupon code, or an outbound URL for deals
  isDeal: boolean;     // true when `code` is a URL (cashback/giftcard)
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

const MONTHS_NL = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december'
];

// Used to top up the related-shops grid when a shop's own co-occurrence list
// yields too few live links (the thin-shop fallback, e.g. Zalando).
const DEFAULT_RELATED = ['nakdfashion', 'shein', 'ginatricot', 'gutsgusto', 'temu', 'loavies', 'bjornborg', 'zalando'];
const RELATED_MAX = 8;

/**
 * v2 showcase page — data-driven for ANY shop via the /v2/:company route.
 * Codes come from discounts.json; per-shop copy comes from the brand-content
 * registry (grounded in influencer captions where available). Served noindexed
 * so it never competes with the live pages while we pilot.
 */
@Component({
  selector: 'app-company-codes-v2',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, ModalComponent],
  templateUrl: './company-codes-v2.component.html',
  styleUrls: ['./company-codes-v2.component.css']
})
export class CompanyCodesV2Component implements OnInit, OnDestroy {
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
  maxDiscount = 0;

  regularCodes: CodeVM[] = [];
  dealCodes: CodeVM[] = [];
  relatedShops: RelatedShopVM[] = [];

  affiliateLink: string | undefined;
  isModalVisible = false;
  selectedDiscount: any = null;

  readonly codeCollapseLimit = 15;
  showAllCodes = false;

  get visibleRegularCodes(): CodeVM[] {
    return this.showAllCodes ? this.regularCodes : this.regularCodes.slice(0, this.codeCollapseLimit);
  }

  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private allLogos: { [name: string]: string } = {};

  // ---- brand video: muted autoplay loop on scroll-into-view, tap for sound ----
  videoMuted = true;
  private videoEl?: HTMLVideoElement;
  private videoObserver?: IntersectionObserver;

  /**
   * ViewChild setter — fires whenever the (conditionally rendered) <video> appears,
   * including when the reused component re-renders for a different shop. Browser-only:
   * preload="none" means nothing downloads until the IntersectionObserver calls play().
   */
  @ViewChild('brandVideo') set brandVideoRef(ref: ElementRef<HTMLVideoElement> | undefined) {
    if (!this.isBrowser || !ref) return;
    const el = ref.nativeElement;
    if (this.videoEl === el) return;
    this.videoEl = el;
    el.muted = true;
    this.videoMuted = true;
    this.videoObserver?.disconnect();
    this.videoObserver = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) { el.play().catch(() => {}); }
        else { el.pause(); }
      }
    }, { threshold: 0.5 });
    this.videoObserver.observe(el);
  }

  /** Tap the video (or the badge) to toggle sound. The tap is the user gesture
   *  browsers require before a video may play audio. */
  toggleVideoSound(): void {
    const el = this.videoEl;
    if (!el) return;
    el.muted = !el.muted;
    this.videoMuted = el.muted;
    if (!el.muted && el.paused) el.play().catch(() => {});
  }

  /** True on the /v2/ preview route (route data.preview); false on the live /:company route. */
  private get isPreview(): boolean {
    return this.route.snapshot.data['preview'] === true;
  }

  /**
   * Href for a related-shop link. Path-aware like the modal deep-link: on the live
   * route it points at the real `/{slug}/` page (indexable, never the noindexed
   * preview); in preview it stays in `/v2/{slug}/`. Always keeps the project-wide
   * trailing slash.
   */
  relatedHref(slug: string): string {
    return this.isPreview ? `/v2/${slug}/` : `/${slug}/`;
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

  constructor(
    private route: ActivatedRoute,
    private discounts: DiscountsService,
    private names: WebshopNameService,
    private logos: LogosService,
    private meta: MetaService,
    private affiliateLinkService: AffiliateLinkService,
    private visitorProfile: VisitorProfileService
  ) {}

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
      this.isModalVisible = false;
      this.selectedDiscount = null;

      this.content = (data['brandContent'] as BrandContent | null) ?? null;
      this.applyDisplayName();
      this.logoUrl = this.allLogos[this.company] ?? this.logoUrl;

      this.discounts.getDiscounts().subscribe(lines => this.build(lines));
    });
  }

  ngOnDestroy(): void {
    this.videoObserver?.disconnect();
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
        const isDeal = code.startsWith('http');
        const isPercent = isFinite(Number(rawValue)) && rawValue !== '' && !rawValue.includes('€');
        const date = this.parseDate(dateStr, year);

        return {
          code,
          isDeal,
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

    this.regularCodes = parsed.filter(c => !c.isDeal);
    this.dealCodes = parsed.filter(c => c.isDeal);
    this.affiliateLink = this.affiliateLinkService.getAffiliateLink(this.company);

    this.maxDiscount = this.regularCodes
      .filter(c => c.isPercent)
      .reduce((max, c) => Math.max(max, Number(c.rawValue)), 0);

    // Page-level "laatst gecontroleerd" from the baked build date (date-only).
    const [by, bm, bd] = (BUILD_DATE_ISO || '').split('-').map(Number);
    const checked = (by && bm && bd) ? new Date(by, bm - 1, bd) : now;
    this.lastCheckedIso = BUILD_DATE_ISO || this.toIsoDate(now);
    this.lastCheckedLabel = this.formatDate(checked);

    this.buildRelatedShops(lines);
    this.applySeo();

    // Deep link: opening /v2/{company}#i={index} (e.g. in the new tab spawned by
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
    const pageUrl = `https://diski.nl/${this.company}`;
    const count = this.regularCodes.length;
    const valuePhrase = this.maxDiscount > 0 ? `tot ${this.maxDiscount}% korting` : 'korting';

    const title = `Werkende ${name} kortingscode ${this.monthYear} → ${valuePhrase} | Diski`;
    const description =
      `${count} werkende ${name} kortingscode${count === 1 ? '' : 's'} in ${this.monthYear}, ` +
      `dagelijks gecontroleerd door onze redactie. Bespaar ${valuePhrase}` +
      `${this.dealCodes.length ? ' plus cashback' : ''} op je bestelling bij ${name}.`;

    this.meta.updateTitle(title);
    this.meta.updateMetaInfo(description, 'diski.nl', `${name}, Kortingscode, Korting`);
    this.meta.updateOgTags(title, description, pageUrl);

    // Noindex ONLY on the /v2/ preview route (data.preview). On the real
    // /:company route (allowlisted go-live shops) the page must be indexable,
    // so we actively clear any stale noindex left by a prior preview navigation.
    if (this.isPreview) {
      this.meta.setNoIndex();
    } else {
      this.meta.setIndex();
    }

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
        'https://www.tiktok.com/@wiegeeftkorting2'
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
      'description': description,
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

    const offerItems = [...this.regularCodes, ...this.dealCodes].map((c, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'item': {
        '@type': 'Offer',
        'name': c.isDeal
          ? `${c.valueText} cashback bij ${name}`
          : `${name} kortingscode: ${c.code}`,
        'description': c.isDeal
          ? `${c.valueText} cashback op je bestelling bij ${name}.`
          : `${c.valueText} korting bij ${name}${c.label ? ' (' + c.label + ')' : ''}.`,
        'category': c.isDeal ? 'Aanbieding' : 'Kortingscode',
        'validFrom': this.toIsoDate(c.date),
        'seller': { '@type': 'Organization', 'name': name }
      }
    }));

    const video = this.content?.video;
    if (video) {
      this.meta.setJsonLd('v2-video', {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        'name': video.title ?? `${name} in beeld`,
        'description': video.description ?? `Video van ${name}.`,
        'thumbnailUrl': video.poster,
        'contentUrl': video.src,
        'uploadDate': video.uploadDate ?? this.lastCheckedIso,
        'inLanguage': 'nl-NL',
        'publisher': { '@id': 'https://diski.nl/#organization' },
        ...(video.duration ? { 'duration': `PT${Math.round(video.duration)}S` } : {})
      });
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

  private formatValue(rawValue: string, isPercent: boolean): string {
    if (isPercent) return `${rawValue}%`;
    return rawValue.replace('.', ',');
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
    // Deep-link to the page we're actually on: /v2/{company} in preview,
    // /{company} on the live route. Mirrors v1's new-tab behaviour.
    const base = this.isPreview ? `/v2/${this.company}` : `/${this.company}`;
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
