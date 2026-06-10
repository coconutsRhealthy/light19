import { Component, OnInit, ViewChild, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AffiliateLinkService } from '../services/affiliate-link.service';
import { LogosService } from '../services/logos.service';
import { MetaService } from '../services/meta.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface WebshopKorting {
  webshop_name: string;
  url: string;
  korting_text: string;
  korting_text_nl: string;
  date: string;
  shop_category?: string;
  // Written only when an operator taps 👎 in the Telegram review bot ("bad/noise"
  // deal). The key is absent when not flagged — never written as false — so a
  // missing value means "not flagged" (for older entries: "unreviewed").
  thumbs_down?: boolean;
}

interface CategoryGroup {
  name: string;
  items: WebshopKorting[];
}

interface ShopRegistry {
  _meta?: { taxonomy?: string[]; count?: number; note?: string };
  shops: { [webshopName: string]: { url?: string; category?: string; resolved_on?: string } };
}

@Component({
  selector: 'app-blackfriday',
  imports: [FooterComponent, NavbarComponent, FormsModule],
  templateUrl: './blackfriday.component.html',
  styleUrls: ['./blackfriday.component.css', './../app.component.css'],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'nl' },
  ]
})
export class BlackfridayComponent implements OnInit {

  // Live deals feed, and the shop registry that provides each shop's category.
  // Both live on R2 so they update without an app redeploy.
  private promotionsUrl = 'https://pub-a3be569620e4415b916e737210363aee.r2.dev/spotted_promotions.json';
  private registryUrl = 'https://pub-a3be569620e4415b916e737210363aee.r2.dev/webshops_info/shop_registry.external.json';

  private readonly fallbackCategory = 'other';

  // Maps the feed's category slugs to a display label for the chips, section
  // headers and card tags. Unknown slugs fall back gracefully.
  private categoryLabels: { [slug: string]: string } = {
    'fashion': 'Fashion',
    'beauty': 'Beauty',
    'home-interior': 'Wonen & Interieur',
    'jewelry': 'Sieraden',
    'supplements-nutrition': 'Supplementen & Voeding',
    'electronics': 'Elektronica',
    'sports-fitness': 'Sport & Fitness',
    'baby-kids': 'Baby & Kids',
    'gifts-personalised': 'Cadeaus & Personalisatie',
    'kitchen-cookware': 'Keuken & Koken',
    'food-drinks': 'Eten & Drinken',
    'marketplace': 'Marketplace',
    'pets': 'Dieren',
    'travel-leisure': 'Reizen & vrije tijd',
    'other': 'Overig',
    'alle': 'Alle',
  };

  year = new Date().getFullYear();

  allDiscounts: WebshopKorting[] = [];
  groups: CategoryGroup[] = [];
  categories: { name: string; count: number }[] = [];
  // All sections shown stacked: Alle first, then the categories.
  sections: CategoryGroup[] = [];
  activeCategory = 'alle';

  // "Alle" is a synthetic category pinned at the top: every deal, newest first.
  alleDeals: WebshopKorting[] = [];

  // Each section is collapsed to its newest few deals, expandable per section.
  previewCount = 4;
  expandedCategories = new Set<string>();

  // The category bar is a single scrollable row; these drive the edge fades that
  // signal there's more to swipe to.
  catCanLeft = false;
  catCanRight = false;
  private catScrollEl?: HTMLElement;

  @ViewChild('catScroll') set catScroll(ref: ElementRef<HTMLElement> | undefined) {
    this.catScrollEl = ref?.nativeElement;
    if (this.catScrollEl) {
      setTimeout(() => this.updateCatFades());
    }
  }

  searchTerm = '';
  searchResults: WebshopKorting[] = [];

  logos: { [companyName: string]: string } = {};
  initialPageLoad = true;
  totalDeals = 0;

  constructor(
    private http: HttpClient,
    private affiliateLinkService: AffiliateLinkService,
    private meta: MetaService,
    private datePipe: DatePipe,
    private logosService: LogosService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.meta.updateTitle(`Black Friday ${this.year} — alle deals per categorie | Diski`);
    this.meta.updateMetaInfo(
      `Alle Black Friday ${this.year} sales en aanbiedingen overzichtelijk per categorie. Blader door mode, beauty, elektronica en meer, of zoek direct je favoriete webshop op diski.nl.`,
      "diski.nl",
      "black friday, black friday deals, sale, aanbiedingen, kortingscode"
    );
  }

  ngOnInit() {
    this.initialPageLoad = true;

    // Only load data in the browser. During prerender (build time) this leaves
    // the static HTML as a clean loading skeleton instead of a frozen build-time
    // snapshot, while the client still fetches fresh data on every page load.
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const t = new Date().getTime();
    const promotions$ = this.http.get<WebshopKorting[]>(`${this.promotionsUrl}?t=${t}`);
    // The registry is best-effort: if it fails, deals still render (all in "Overig").
    const registry$ = this.http.get<ShopRegistry>(`${this.registryUrl}?t=${t}`).pipe(
      catchError(() => of(null))
    );

    forkJoin({ promotions: promotions$, registry: registry$ }).subscribe(({ promotions, registry }) => {
      const shops = registry?.shops ?? {};

      this.allDiscounts = promotions
        // Drop deals an operator flagged 👎 as bad/noise in the review bot.
        // Only true is ever written; absent means not-flagged, so keep those.
        .filter((item) => item.thumbs_down !== true)
        .map((item) => ({
        ...item,
        url: this.affiliateLinkService.getAffiliateLink(item.webshop_name) || item.url,
        // Category comes from the registry; fall back to the feed's own value (if any),
        // then to "other" when the shop can't be resolved.
        shop_category: shops[item.webshop_name]?.category || item.shop_category || this.fallbackCategory,
      }));

      this.buildGroups();
      this.buildAlle();
      this.buildSections();
      this.totalDeals = this.allDiscounts.length;
      this.initialPageLoad = false;
    });

    this.logosService.getAllLogos().subscribe(data => {
      this.logos = data;
    });
  }

  /** Bucket the flat feed into categories, newest first within each, biggest category first. */
  private buildGroups() {
    const map = new Map<string, WebshopKorting[]>();
    for (const d of this.allDiscounts) {
      const cat = d.shop_category || this.fallbackCategory;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(d);
    }

    this.groups = Array.from(map.entries())
      .map(([name, items]) => ({
        name,
        items: items.sort((a, b) => b.date.localeCompare(a.date)),
      }))
      .sort((a, b) => b.items.length - a.items.length);

    this.categories = this.groups.map(g => ({ name: g.name, count: g.items.length }));
  }

  /** "Alle": every deal, newest first. */
  private buildAlle() {
    this.alleDeals = [...this.allDiscounts].sort((a, b) => b.date.localeCompare(a.date));
  }

  /** Stacked sections: Alle pinned on top (when it has deals), then the categories. */
  private buildSections() {
    this.sections = [
      ...(this.alleDeals.length ? [{ name: 'alle', items: this.alleDeals }] : []),
      ...this.groups,
    ];
  }

  get isSearching(): boolean {
    return this.searchTerm.trim().length > 0;
  }

  isExpanded(name: string): boolean {
    return this.expandedCategories.has(name);
  }

  toggleCategory(name: string) {
    if (this.expandedCategories.has(name)) {
      this.expandedCategories.delete(name);
    } else {
      this.expandedCategories.add(name);
    }
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!term) {
      this.searchResults = [];
      return;
    }
    this.searchResults = this.allDiscounts.filter((d) => {
      const normalized = d.webshop_name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalized.includes(term);
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
  }

  selectCategory(name: string) {
    this.activeCategory = name;
    this.clearSearch();
    // Defer so sections are rendered (e.g. after clearing a search) before scrolling.
    setTimeout(() => {
      document.getElementById('sec-' + name)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  @HostListener('window:resize')
  updateCatFades() {
    const el = this.catScrollEl;
    if (!el) return;
    this.catCanLeft = el.scrollLeft > 4;
    this.catCanRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
  }

  /** Section heading: a friendlier title for Alle, the plain label otherwise. */
  sectionTitle(name: string): string {
    if (name === 'alle') return 'Alle deals';
    return this.categoryLabel(name);
  }

  categoryLabel(slug: string | undefined): string {
    if (!slug) return this.categoryLabels[this.fallbackCategory];
    const label = this.categoryLabels[slug];
    if (label) return label;
    // Graceful fallback for an unmapped slug: "home-interior" -> "Home interior".
    const pretty = slug.replace(/[-_]+/g, ' ');
    return pretty.charAt(0).toUpperCase() + pretty.slice(1);
  }

  formatDate(date: string): string {
    return this.datePipe.transform(new Date(date), 'd MMM') ?? '';
  }

  getLogoUrl(companyName: string): string | undefined {
    const cleanName = companyName.replace(/\s*\(.*$/, '');
    return this.logos[cleanName];
  }
}
