import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { DiscountsService } from '../services/discounts.service';
import { WebshopNameService } from '../services/webshop-name.service';
import { LogosService } from '../services/logos.service';
import { MetaService } from '../services/meta.service';
import { BrandContent } from './brand-content/brand-content.model';
import { getBrandContent } from './brand-content/index';

interface CodeVM {
  code: string;        // the coupon code, or an outbound URL for deals
  isDeal: boolean;     // true when `code` is a URL (cashback/giftcard)
  rawValue: string;    // e.g. "15", "20", "€7.50"
  valueText: string;   // display value, e.g. "15%", "€7,50"
  isPercent: boolean;
  label?: string;      // bracket label from the data, e.g. "beauty"
  date: Date;          // when the code was last spotted/checked
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
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './company-codes-v2.component.html',
  styleUrls: ['./company-codes-v2.component.css']
})
export class CompanyCodesV2Component implements OnInit {
  company = '';
  displayName = '';
  logoUrl = '';
  content: BrandContent | null = null;

  monthYear = '';
  lastUpdatedLabel = '';
  lastUpdatedIso = '';
  maxDiscount = 0;

  regularCodes: CodeVM[] = [];
  dealCodes: CodeVM[] = [];
  relatedShops: RelatedShopVM[] = [];
  copiedCode: string | null = null;

  readonly codeCollapseLimit = 15;
  showAllCodes = false;

  get visibleRegularCodes(): CodeVM[] {
    return this.showAllCodes ? this.regularCodes : this.regularCodes.slice(0, this.codeCollapseLimit);
  }

  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private allLogos: { [name: string]: string } = {};

  constructor(
    private route: ActivatedRoute,
    private discounts: DiscountsService,
    private names: WebshopNameService,
    private logos: LogosService,
    private meta: MetaService
  ) {}

  ngOnInit(): void {
    this.logos.getAllLogos().subscribe(all => {
      this.allLogos = all;
      this.logoUrl = all[this.company] ?? this.logoUrl;
    });

    this.route.paramMap.subscribe(params => {
      this.company = (params.get('company') ?? '').toLowerCase();
      this.showAllCodes = false;
      this.content = getBrandContent(this.company);
      this.displayName = this.content?.name
        ?? this.names.getWebshopName(this.company)
        ?? this.company.charAt(0).toUpperCase() + this.company.slice(1);
      this.logoUrl = this.allLogos[this.company] ?? this.logoUrl;

      this.discounts.getDiscounts().subscribe(lines => this.build(lines));
    });
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
          dateLabel: this.formatDate(date)
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    this.regularCodes = parsed.filter(c => !c.isDeal);
    this.dealCodes = parsed.filter(c => c.isDeal);

    this.maxDiscount = this.regularCodes
      .filter(c => c.isPercent)
      .reduce((max, c) => Math.max(max, Number(c.rawValue)), 0);

    const newest = parsed.reduce<Date | null>(
      (acc, c) => (!acc || c.date > acc ? c.date : acc), null
    ) ?? now;
    this.lastUpdatedLabel = this.formatDate(newest);
    this.lastUpdatedIso = this.toIsoDate(newest);

    this.buildRelatedShops(lines);
    this.applySeo();
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

    // Preview only: keep this route out of the index while we pilot.
    this.meta.setNoIndex();

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
      'dateModified': this.lastUpdatedIso,
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

  copy(code: string): void {
    this.copiedCode = code;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
  }
}
