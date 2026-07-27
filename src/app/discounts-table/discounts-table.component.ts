import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import { DiscountsService } from '../services/discounts.service';
import { AffiliateLinkService } from '../services/affiliate-link.service';
import { AnalyticsEventService } from '../services/analytics-event.service';
import { VisitorProfileService } from '../services/visitor-profile.service';
import { LogosService } from '../services/logos.service';
import { MetaService } from '../services/meta.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ModalShopsComponent } from '../modal-shops/modal-shops.component';
import { FeaturedDealsComponent } from '../featured-deals/featured-deals.component';
import { RouterModule } from '@angular/router';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    sendCopyCodeToGa: (company: string) => void;
  }
}

interface Discount {
  company: string;
  discountCode: string;
  percentage: string;
  influencer: string;
  date: string;
  index: number;
  affiliateLink?: string | null;
}

@Component({
  selector: 'app-discounts-table',
  imports: [FooterComponent, NavbarComponent, FormsModule, ModalShopsComponent, RouterModule, FeaturedDealsComponent],
  templateUrl: './discounts-table.component.html',
  styleUrls: ['./discounts-table.component.css'],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'nl' },
  ]
})
export class DiscountsTableComponent implements OnInit {
  discounts: Discount[] = [];
  filteredDiscounts: Discount[] = [];
  searchTerm: string = '';
  page: number = 1;
  itemsPerPage: number = 18;
  sortByCompanyAscending = false;
  sortByDateAscending = false;
  logos: { [companyName: string]: string } = {};
  isNewlookBannerExpanded = false;
  isNewlookBannerVisible = true;
  initialPageLoad = true;
  lastSentTerm: string = '';
  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private platformId = inject(PLATFORM_ID);

  dateStringLatestShops: string = '';
  newShopsCount: number = 0;
  latestShops: string[] = [];
  isShopsModalVisible: boolean = false;

  newsletterEmail: string = '';
  newsletterSubmitted: boolean = false;
  newsletterError: boolean = false;

  bolHref!: string;
  bolImgSrc!: string;
  bolPixelSrc!: string;
  bolType!: string;

  // ga* mirror the events the old homepage fired, so reporting stays continuous
  // across the redesign (event_category differs per event, hence the raw gtag
  // call in trackSocialCard rather than AnalyticsEventService.sendEventToGa).
  socialCards = [
    { tag: 'Instagram', title: 'Volg @wiegeeftkorting', desc: 'Dagelijkse codes, sale-alerts en de beste vondsten op je tijdlijn.', cta: 'Volgen', href: 'https://www.instagram.com/wiegeeftkorting/', gaEvent: 'insta', gaCategory: 'Social', gaLabel: 'insta_top' },
    { tag: 'Prikbord',           title: 'Deel een code die werkt', desc: 'Zelf een goede code gespot? Zet hem op het prikbord en help de rest.', cta: 'Naar prikbord →', href: '/prikbord', gaEvent: 'prikbord', gaCategory: 'Prikbord', gaLabel: 'prikbord_intable_homepage' },
  ];

  trackSocialCard(card: { gaEvent: string; gaCategory: string; gaLabel: string }): void {
    if (!this.isBrowser) return;
    const gtag = (window as any).gtag;
    if (typeof gtag === 'function') {
      gtag('event', card.gaEvent, { event_category: card.gaCategory, event_label: card.gaLabel });
    }
  }

  /** Hand-picked, static brands for the "beste sale" block. Deliberately NOT
   *  wired to the Black Friday feed (external R2 JSON) — this stays a static
   *  teaser that just links through to /blackfriday. */
  saleBrandsRaw = [
    { key: 'zalando',  name: 'Zalando',  tag: 'Mode & kleding' },
    { key: 'douglas',  name: 'Douglas',  tag: 'Beauty' },
    { key: 'coolblue', name: 'Coolblue', tag: 'Elektronica' },
  ];

  get saleBrands(): { key: string; name: string; tag: string; logo?: string }[] {
    return this.saleBrandsRaw.map(b => ({ ...b, logo: this.logos[b.key] }));
  }

  /** First unique companies that have a logo — used for the "populaire shops" row. */
  get popularLogoBrands(): { name: string; slug: string; logo: string }[] {
    const seen = new Set<string>();
    const out: { name: string; slug: string; logo: string }[] = [];
    for (const d of this.discounts) {
      const slug = this.getCompanySlug(d.company);
      if (seen.has(slug)) continue;
      const logo = this.getLogoUrl(d.company);
      if (!logo) continue;
      seen.add(slug);
      out.push({ name: this.getDisplayName(d.company), slug, logo });
      if (out.length >= 12) break;
    }
    return out;
  }

  constructor(private discountsService: DiscountsService, private affiliateLinkService: AffiliateLinkService, private analyticsEventService: AnalyticsEventService,
                private meta: MetaService, private datePipe: DatePipe, private logosService: LogosService,
                private visitorProfile: VisitorProfileService) {
    const monthYear = this.meta.getDateString();
    const title = "Diski | Online shoppen met kortingscodes in " + monthYear;
    const description = "De nieuwste werkende kortingscodes van een groot aantal webshops; Bespaar op online shoppen in " + monthYear + " via diski.nl";
    this.meta.updateTitle(title);
    this.meta.updateMetaInfo(description, "diski.nl", "Kortingscode, Korting");
    this.meta.updateOgTags(title, description, "https://diski.nl");
    this.meta.setJsonLd('organization', {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Diski",
      "url": "https://diski.nl",
      "logo": "https://cdn.jsdelivr.net/gh/wgknl/diski-assets/logos/webp/avatar.webp",
      "sameAs": [
        "https://www.instagram.com/wiegeeftkorting/",
        "https://www.tiktok.com/@andyyrobe"
      ]
    });
    this.meta.setJsonLd('website', {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Diski",
      "url": "https://diski.nl",
      "description": description
    });
  }

  ngOnInit() {
    this.initialPageLoad = true;

    if (this.isBrowser && window.innerWidth < 768) {
      this.itemsPerPage = 18;
    } else {
      this.itemsPerPage = 30;
    }

    this.discountsService.getDiscounts().subscribe((data) => {
      this.discounts = data.map((line, index) => {
        const [company, discountCode, percentage, influencer, date] = line.split(', ');
        return {
          company,
          discountCode,
          percentage,
          influencer,
          date,
          index: index
        };
      });
      this.filteredDiscounts = this.discounts;
      this.updateLatestDiscountInfo();

      this.initialPageLoad = false;
    });

    this.logosService.getAllLogos().subscribe(data => {
      this.logos = data;
    });

    if(this.isBrowser) {
        this.fillBolVariables()
    }
  }

  /** True while there's a search term — used to surface the results grid above the
   *  editorial sections on the homepage. */
  get isSearching(): boolean {
    return this.searchTerm.trim().length > 0;
  }

  onSearch() {
    const normalizedSearchTerm = this.searchTerm.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalize = (company: string) => company.toLowerCase().replace(/[^a-z0-9]/g, '');

    let matches = this.discounts.filter((discount) =>
      normalize(discount.company).includes(normalizedSearchTerm)
    );

    // Rank exact matches first, then prefix matches, then the rest — so the shop
    // you typed (e.g. "hunkemoller") lands at the top instead of buried in the feed.
    // Keep the original feed order within each rank (stable via the index tiebreak).
    if (normalizedSearchTerm) {
      const rank = (company: string): number => {
        const c = normalize(company);
        if (c === normalizedSearchTerm) return 0;
        if (c.startsWith(normalizedSearchTerm)) return 1;
        return 2;
      };
      matches = matches
        .map((d, i) => ({ d, i }))
        .sort((a, b) => rank(a.d.company) - rank(b.d.company) || a.i - b.i)
        .map((x) => x.d);
    }

    this.filteredDiscounts = matches;
    this.page = 1;

    if (this.searchTerm.length >= 5 || normalizedSearchTerm === 'temu') {
      const termToSend = normalizedSearchTerm.slice(0, 5);
      if (termToSend !== this.lastSentTerm) {
        this.lastSentTerm = termToSend;
        this.visitorProfile.trackSearch(termToSend);
        this.analyticsEventService.sendEventToGa("Search_typing", "search_typing_" + termToSend);
      }
    }
  }

  get uniqueFilteredDiscounts(): Discount[] {
    const seen = new Set<string>();
    return this.filteredDiscounts.filter(discount => {
      const slug = this.getCompanySlug(discount.company);
      if (seen.has(slug)) return false;
      seen.add(slug);
      return true;
    });
  }

  get paginatedDiscounts(): Discount[] {
    const start = (this.page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.uniqueFilteredDiscounts.slice(start, end);
  }

  nextPage() {
    if (this.page < this.totalPages) this.page++;
  }

  prevPage() {
    if (this.page > 1) this.page--;
  }

  get totalPages(): number {
    return Math.ceil(this.uniqueFilteredDiscounts.length / this.itemsPerPage);
  }

  getCompanySlug(companyName: string): string {
    return companyName.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
  }

  getDisplayName(companyName: string): string {
    return companyName.replace(/\s*\(.*$/, '').trim();
  }

  trackBrandClick(company: string): void {
    this.visitorProfile.trackCompanyClick('company_click_homepage', company);
    if (this.isBrowser && typeof window.sendCopyCodeToGa === 'function') {
      window.sendCopyCodeToGa(company);
    }
  }

  /** Dedicated tracking for the "Populaire shops" logo strip. Fires its own
   *  GA event (LogoShopHomepage) so logo clicks are separable in GA, unlike the
   *  shared CopyCode event used by trackBrandClick. */
  trackLogoShopClick(company: string): void {
    this.visitorProfile.trackCompanyClick('company_click_homepage', company);
    this.analyticsEventService.sendEventToGa('LogoShopHomepage', company);
  }

  onCardClick(discount: Discount, event: MouseEvent) {
    this.trackBrandClick(discount.company);

    const affiliateLink = this.affiliateLinkService.getAffiliateLink(discount.company);
    if (affiliateLink !== undefined && this.isBrowser) {
      event.preventDefault();
      const brandPageUrl = `${window.location.origin}/${this.getCompanySlug(discount.company)}/`;
      window.open(brandPageUrl, '_blank');
      location.href = affiliateLink;
    }
  }

  /** Same behaviour as onCardClick, for the static "beste sale" brand tiles.
   *  b.key is already the lowercase slug used both for the detail page and the
   *  affiliate lookup. Without an affiliate link the routerLink handles the nav. */
  onSaleBrandClick(brand: { key: string; name: string }, event: MouseEvent) {
    this.trackBrandClick(brand.name);

    const affiliateLink = this.affiliateLinkService.getAffiliateLink(brand.key);
    if (affiliateLink !== undefined && this.isBrowser) {
      event.preventDefault();
      const brandPageUrl = `${window.location.origin}/${brand.key}/`;
      window.open(brandPageUrl, '_blank');
      location.href = affiliateLink;
    }
  }

  openShopsModal() {
    this.isShopsModalVisible = true;
  }

  closeShopsModal() {
    this.isShopsModalVisible = false;
  }

  submitNewsletter(event: Event): void {
    event.preventDefault();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.newsletterEmail || !emailPattern.test(this.newsletterEmail)) {
      this.newsletterError = true;
      return;
    }

    this.newsletterError = false;
    this.visitorProfile.subscribeNewsletter(this.newsletterEmail);
    this.newsletterSubmitted = true;
    this.analyticsEventService.sendEventToGa('newsletter_signup', 'newsletter_signup_homepage');
  }

  formatDate(date: string): string {
    const formattedDate = this.getDateFromDateString(date);
    if (isNaN(formattedDate.getTime())) {
      return '';
    }
    return this.datePipe.transform(formattedDate, 'd MMM') ?? '';
  }

  getDateFromDateString(dateString: string) {
    dateString = dateString + "";
    var dateStringArray = dateString.split("-");
    var month = Number(dateStringArray[0]) - 1;
    var day = Number(dateStringArray[1]);
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, month, day);
  }

  sortByCompany() {
    this.sortByCompanyAscending = !this.sortByCompanyAscending;
    this.filteredDiscounts.sort((a, b) => {
      const comparison = a.company.localeCompare(b.company);
      return this.sortByCompanyAscending ? comparison : -comparison;
    });
  }

  sortByDate() {
    this.sortByDateAscending = !this.sortByDateAscending;
    this.filteredDiscounts.sort((a, b) => {
      const dateA = this.getDateFromDateString(a.date);
      const dateB = this.getDateFromDateString(b.date);

      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;

      const adjustedDateA = (dateA.getMonth() === 0 || dateA.getMonth() === 1 || dateA.getMonth() === 2) &&
        (dateB.getMonth() === 11 || dateB.getMonth() === 10 || dateB.getMonth() === 9)
        ? new Date(nextYear, dateA.getMonth(), dateA.getDate())
        : new Date(currentYear, dateA.getMonth(), dateA.getDate());

      const adjustedDateB = (dateB.getMonth() === 0 || dateB.getMonth() === 1 || dateB.getMonth() === 2) &&
        (dateA.getMonth() === 11 || dateA.getMonth() === 10 || dateA.getMonth() === 9)
        ? new Date(nextYear, dateB.getMonth(), dateB.getDate())
        : new Date(currentYear, dateB.getMonth(), dateB.getDate());

      return this.sortByDateAscending
        ? adjustedDateA.getTime() - adjustedDateB.getTime()
        : adjustedDateB.getTime() - adjustedDateA.getTime();
    });
  }

  getCorrectFormatDiscountPercentage(rawDiscountPercentage: string): string {
    if(!rawDiscountPercentage.includes("€") && !rawDiscountPercentage.includes("vzk") && !rawDiscountPercentage.includes("gifts")) {
      rawDiscountPercentage = rawDiscountPercentage + "%";
    }

    return rawDiscountPercentage;
  }

  getLogoUrl(companyName: string): string | undefined {
    const cleanName = companyName.replace(/\s*\(.*$/, '');
    return this.logos[cleanName];
  }

  toggleNewlookBanner() {
    this.isNewlookBannerExpanded = !this.isNewlookBannerExpanded;
  }

  closeNewlookBanner(event: MouseEvent) {
    event.stopPropagation();
    this.isNewlookBannerVisible = false;
  }

  isBlackFriday(discount: any): boolean {
    return discount?.influencer?.startsWith('BF_');
  }

  getBlackFridayButtonClasses(index: number) {
     if(index < 6) {
         return "tw-w-full tw-rounded-2xl tw-p-3 lg:tw-p-4 tw-flex tw-justify-between tw-items-center tw-text-left tw-h-full tw-border tw-border-yellow-400 tw-shadow-lg active:tw-scale-[0.98] tw-transition-all tw-duration-200";
     } else {
        return "tw-w-full tw-bg-white tw-rounded-2xl tw-shadow-md hover:tw-shadow-lg active:tw-scale-[0.98] tw-transition-all tw-duration-200 tw-p-3 lg:tw-p-4 tw-flex tw-justify-between tw-items-center tw-border tw-border-gray-100 tw-text-left tw-h-full"
     }
  }

  getBlackFridaySpottedAtTextClasses(index: number) {
      if(index < 6) {
          return "tw-text-xs tw-mt-1 tw-text-gray-700";
      } else {
          return "tw-text-xs tw-text-gray-400 tw-mt-1";
      }
  }

  updateLatestDiscountInfo(): void {
    if (this.discounts.length === 0) return;
    const lastUpdated = this.discounts[0].date;
    this.dateStringLatestShops = this.formatDate(lastUpdated);

    const shopsOnLatestDate = this.discounts
      .filter(d => d.date === lastUpdated)
      .map(d => {
        let name = d.company.trim();
        name = name.replace(/\s*\(.*?\)/g, '');
        return name;
      });

    this.latestShops = Array.from(new Set(shopsOnLatestDate)).sort((a, b) => a.localeCompare(b));
    this.newShopsCount = this.latestShops.length;
  }

  get sendCopyCodeToGa() {
    if (this.isBrowser) {
      return window.sendCopyCodeToGa;
    }
    return () => {};
  }

  fillBolVariables() {

    const banners = [
        {
            href: "https://partner.bol.com/click/click?p=1&t=url&s=1507667&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fl%2Fbabyspullen%2F11271%2F&f=BAN&name=Baby&subid=",
            imgSrc: "https://bannersimages.s-bol.com/Category_Baby-affiliate_banner-728x90.png",
            pixelSrc: "https://partner.bol.com/click/impression?p=1&s=1507667&t=url&f=BAN&name=Baby&subid=",
            type: "baby",
        },
        {
            href: "https://partner.bol.com/click/click?p=1&t=url&s=1507667&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fl%2Fhuishouden%2F12001%2F&f=BAN&name=Huishouden&subid=",
            imgSrc: "https://bannersimages.s-bol.com/Category_Housekeeping-affiliate_banner-728x90.png",
            pixelSrc: "https://partner.bol.com/click/impression?p=1&s=1507667&t=url&f=BAN&name=Huishouden&subid=",
            type: "huishouden",
        },
        {
            href: "https://partner.bol.com/click/click?p=1&t=url&s=1507667&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fsf%2Fkokenentafelen%2F&f=BAN&name=Koken&subid=",
            imgSrc: "https://bannersimages.s-bol.com/Category_Koken-affiliate_banner-728x90.png",
            pixelSrc: "https://partner.bol.com/click/impression?p=1&s=1507667&t=url&f=BAN&name=Koken&subid=",
            type: "koken",
        },
        {
            href: "https://partner.bol.com/click/click?p=1&t=url&s=1507667&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fl%2Fverzorgingsproducten%2F12442%2F&f=BAN&name=Dagelijkse%20verzorging&subid=",
            imgSrc: "https://bannersimages.s-bol.com/Category_Personalcare-affiliate_banner-728x90.png",
            pixelSrc: "https://partner.bol.com/click/impression?p=1&s=1507667&t=url&f=BAN&name=Dagelijkse%20verzorging&subid=",
            type: "dagelijkseverzorging",
        },
        {
            href: "https://partner.bol.com/click/click?p=1&t=url&s=1507667&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fsf%2Fwooninspiratie%2F&f=BAN&name=Wonen&subid=",
            imgSrc: "https://bannersimages.s-bol.com/Category_Living-affiliate_banner-728x90.png",
            pixelSrc: "https://partner.bol.com/click/impression?p=1&s=1507667&t=url&f=BAN&name=Wonen&subid=",
            type: "wonen",
        },
        {
            href: "https://partner.bol.com/click/click?p=1&t=url&s=1507667&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fsf%2Fnieuwecollectie%2F&f=BAN&name=Mode&subid=",
            imgSrc: "https://bannersimages.s-bol.com/Category_Mode-affiliate_banner-728x90.png",
            pixelSrc: "https://partner.bol.com/click/impression?p=1&s=1507667&t=url&f=BAN&name=Mode&subid=",
            type: "mode",
        },
        {
            href: "https://partner.bol.com/click/click?p=1&t=url&s=1507667&url=https%3A%2F%2Fwww.bol.com%2Fnl%2Fnl%2Fcmp%2Fdrogisterijdeals%2F1916%2F&f=BAN&name=Dagelijkse%20inkopen&subid=",
            imgSrc: "https://bannersimages.s-bol.com/Category_Bulk-affiliate_banner-728x90.png",
            pixelSrc: "https://partner.bol.com/click/impression?p=1&s=1507667&t=url&f=BAN&name=Dagelijkse%20inkopen&subid=",
            type: "dagelijkseinkopen",
        },
    ];

    const randomBanner = banners[Math.floor(Math.random() * banners.length)];

    this.bolHref = randomBanner.href;
    this.bolImgSrc = randomBanner.imgSrc;
    this.bolPixelSrc = randomBanner.pixelSrc;
    this.bolType = randomBanner.type;
  }

  sendBolEventToGa(): void {
    this.analyticsEventService.sendEventToGa(
      'Bolbanner',
      'bolbanner_' + this.bolType
    );
  }
}
