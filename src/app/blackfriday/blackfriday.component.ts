import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AffiliateLinkService } from '../services/affiliate-link.service';
import { LogosService } from '../services/logos.service';
import { MetaService } from '../services/meta.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

interface WebshopKorting {
  webshop_name: string;
  url: string;
  korting_text: string;
  korting_text_nl: string;
  date: string;
  shop_category?: string;
}

interface CategoryGroup {
  name: string;
  items: WebshopKorting[];
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

  // DEV: when true, load the local dummy feed (public/spotted_promotions.dev.json)
  // which includes a shop_category per entry. Flip to false to use the live R2 feed.
  private useLocalData = true;
  private prodJsonUrl = 'https://pub-a3be569620e4415b916e737210363aee.r2.dev/spotted_promotions.json';
  private devJsonUrl = '/spotted_promotions.dev.json';
  private get jsonUrl(): string {
    return this.useLocalData ? this.devJsonUrl : this.prodJsonUrl;
  }

  private readonly fallbackCategory = 'Overig';

  // A little flair: an emoji per category for the chips and section headers.
  private categoryIcons: { [key: string]: string } = {
    'Mode': '👗',
    'Beauty': '💄',
    'Elektronica': '📱',
    'Wonen': '🛋️',
    'Sport': '🏃',
    'Reizen': '✈️',
    'Eten & Drinken': '🍷',
    'Kids & Baby': '🧸',
    'Telecom': '📶',
    'Gezondheid': '🌿',
    'Overig': '🛍️',
  };

  year = new Date().getFullYear();

  allDiscounts: WebshopKorting[] = [];
  groups: CategoryGroup[] = [];
  categories: { name: string; count: number }[] = [];
  activeCategory = 'all';

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
    private logosService: LogosService
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

    const urlWithNoCache = `${this.jsonUrl}?t=${new Date().getTime()}`;

    this.http.get<WebshopKorting[]>(urlWithNoCache).subscribe((data) => {
      this.allDiscounts = data.map((item) => ({
        ...item,
        url: this.affiliateLinkService.getAffiliateLink(item.webshop_name) || item.url,
        shop_category: item.shop_category || this.fallbackCategory,
      }));

      this.buildGroups();
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

  get isSearching(): boolean {
    return this.searchTerm.trim().length > 0;
  }

  /** Category view: all sections, or just the active one. */
  get visibleGroups(): CategoryGroup[] {
    if (this.activeCategory === 'all') return this.groups;
    return this.groups.filter(g => g.name === this.activeCategory);
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
  }

  categoryIcon(name: string): string {
    return this.categoryIcons[name] || '🛍️';
  }

  formatDate(date: string): string {
    return this.datePipe.transform(new Date(date), 'd MMM') ?? '';
  }

  getLogoUrl(companyName: string): string | undefined {
    const cleanName = companyName.replace(/\s*\(.*$/, '');
    return this.logos[cleanName];
  }
}
