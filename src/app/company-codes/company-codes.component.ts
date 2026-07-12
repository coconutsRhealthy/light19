import { Component, OnInit } from '@angular/core';
import { loadSeoContent } from './company-seo-content/index';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ElementRef } from '@angular/core';
import { DiscountsService } from '../services/discounts.service';
import { AffiliateLinkService } from '../services/affiliate-link.service';
import { WebshopNameService } from '../services/webshop-name.service';
import { MetaService } from '../services/meta.service';
import { LogosService } from '../services/logos.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { RouterModule } from '@angular/router';
import { PLATFORM_ID, PendingTasks, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { VisitorProfileService } from '../services/visitor-profile.service';
import { samsungPromotions, SamsungPromotion } from '../data/samsung-promotions';

import { ModalComponent } from '../modal/modal.component';

declare let gtag: Function;

interface Discount {
  company: string;
  discountCode: string;
  percentage: string;
  date: string;
  index: number;
  affiliateLink?: string | null;
}

interface RelatedShop {
  name: string;
  slug: string;
  percentage: string;
}

@Component({
  selector: 'app-company-codes',
  imports: [
    CommonModule,
    ModalComponent,
    FooterComponent,
    NavbarComponent,
    NotFoundComponent,
    RouterModule
  ],
  templateUrl: './company-codes.component.html',
  styleUrls: ['./company-codes.component.css'],
  providers: [DatePipe]
})
export class CompanyCodesComponent implements OnInit {
  company: string = "";
  webshopName: string = "";
  discountCodes: { code: string, discount: string, date: string, label?: string }[] = [];
  isLoading = true;
  copiedCode: string | null = null;
  seoContent: SafeHtml | null = null;
  seoContentLoading = true;
  relatedShops: RelatedShop[] = [];
  logos: { [companyName: string]: string } = {};

  affiliateLink: string | undefined;
  isModalVisible = false;
  selectedDiscount: any = null;

  monthYear: string = "";

  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private pendingTasks = inject(PendingTasks);

  constructor(private route: ActivatedRoute, private datePipe: DatePipe, private elementRef: ElementRef,
                private discountsService: DiscountsService, private affiliateLinkService: AffiliateLinkService,
                private webshopNameService: WebshopNameService, private meta: MetaService,
                private logosService: LogosService,
                private sanitizer: DomSanitizer, private visitorProfile: VisitorProfileService) { }

  ngOnInit() {
    this.logosService.getAllLogos().subscribe(data => this.logos = data);

    this.route.paramMap.subscribe(params => {
      this.company = params.get('company') as string;
      this.extractDiscountCodes(this.company);

      if(this.discountCodes.length > 0) {
        this.webshopName = this.getWebshopName(this.company);
      } else {

      }
    });
    this.elementRef.nativeElement.scrollTop = 0;
  }

  private extractDiscountCodes(companyName: string): void {
    this.discountsService.getDiscounts().subscribe((data) => {
      const allDiscountCodes = data.map((line) => {
        const [company, discountCode, percentage, , date] = line.split(', ');
        return {
          company,
          discountCode,
          percentage,
          date,
        };
      });

      this.discountCodes = allDiscountCodes
          .filter(entry => {
            const companyNoBrackets = entry.company.replace(/\s*\(.*?\)\s*/g, '');
            return companyNoBrackets.toLowerCase() === companyName.toLowerCase();
          })
        .map(entry => {
          const bracketMatch = entry.company.match(/\(([^)]*)\)/);
          const label = bracketMatch ? bracketMatch[1].trim() : undefined;

          return {
            code: entry.discountCode,
            discount: entry.percentage.toString(),
            date: entry.date,
            label: label,
          };
        });

      // No backup-code fallback here: fetch-discounts.js injects a shop's V1_BACKUP_CODES
      // entry into discounts.json at build time when it has no live code, so the filter
      // above already found it. That keeps the rest of the site (homepage table, /winkels,
      // search, related-shops grids) able to see the shop too — the old in-component
      // fallback was invisible to every other consumer of discounts.json.

      if(this.discountCodes.length > 0) {
        this.webshopName = this.getWebshopName(this.company);
        this.monthYear = this.meta.getDateString();
        const codeCount = this.discountCodes.length || 1;
        const pageUrl = "https://diski.nl/" + this.company + "/";
        const title = "Werkende " + this.webshopName + " kortingscode in " + this.monthYear;
        const description = codeCount + " actieve " + this.webshopName + " kortingscode" + (codeCount !== 1 ? 's' : '') + " in " + this.monthYear + "; Bespaar met deze kortingscodes op online shoppen bij " + this.webshopName;
        this.meta.updateTitle(title);
        this.meta.updateMetaInfo(description, "diski.nl", this.webshopName + ", Kortingscode, Korting");
        this.meta.updateOgTags(title, description, pageUrl);
        this.meta.setJsonLd('breadcrumb', {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Kortingscodes", "item": "https://diski.nl/" },
            { "@type": "ListItem", "position": 2, "name": this.webshopName + " kortingscode", "item": pageUrl }
          ]
        });
        const codeItems = this.discountCodes
          .slice(0, 10)
          .map((c, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "item": {
              "@type": "Offer",
              "name": this.webshopName + " kortingscode: " + c.code,
              "description": (c.discount ? c.discount + (isNaN(Number(c.discount)) ? '' : '%') + " korting bij " : "Korting bij ") + this.webshopName,
              "seller": { "@type": "Organization", "name": this.webshopName }
            }
          }));
        if (codeItems.length > 0) {
          this.meta.setJsonLd('offers', {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": this.webshopName + " kortingscodes",
            "itemListElement": codeItems
          });
        }
      } else {
        this.meta.updateTitle("404 Deze pagina is niet gevonden op diski.nl");
        this.meta.updateMetaInfo("404 Deze pagina bestaat niet op diski.nl", "diski.nl", "404");
      }

      this.affiliateLink = this.affiliateLinkService.getAffiliateLink(companyName)
      this.loadRelatedShops(companyName, data);

      this.route.fragment.subscribe(fragment => {
        if (!fragment) return;

        const params = new URLSearchParams(fragment);
        if (params.has('i')) {
          const index = Number(params.get('i'));

          if (!isNaN(index) && index >= 0 && index < this.discountCodes.length) {
              this.openModal(this.discountCodes[index]);
          }
        }
      });

      const doneTask = this.pendingTasks.add();
      loadSeoContent(this.company).then(html => {
        this.seoContent = html
          ? this.sanitizer.bypassSecurityTrustHtml(html)
          : null;
      }).finally(() => {
        this.seoContentLoading = false;
        doneTask();
      });

      this.isLoading = false;
    });
  }

  onSeoLinkClick(event: MouseEvent): void {
    if (!this.isBrowser) return;
    const anchor = (event.target as HTMLElement | null)?.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || !href.startsWith('#') || href.length < 2) return;
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `${location.pathname}${location.search}#${id}`);
  }

  formatDate(date: string): string {
    const formattedDate = this.getDateFromDateString(date);
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

  getWebshopName(companyName: string): string {
    var webshopName = this.webshopNameService.getWebshopName(companyName);

    if(webshopName === undefined) {
      webshopName = companyName.charAt(0).toUpperCase() + companyName.slice(1);
    }

    return webshopName;
  }

  shouldDisplayPercent(discount: string | number): boolean {
    let shouldDisplayPercent = false;

    if (isFinite(Number(discount)) && discount.toString().indexOf('€') === -1) {
      shouldDisplayPercent = true;
    }

    return shouldDisplayPercent;
  }

  // Samsung partner requirement: surface the official promo voorwaarden for each
  // live Samsung promotion on the /samsung page (same source as the modal).
  get samsungPromoList(): { code: string; label: string; promo: SamsungPromotion }[] {
    if (this.company?.toLowerCase() !== 'samsung') return [];
    return this.discountCodes
      .map(c => ({ code: c.code, label: c.label ?? '', promo: samsungPromotions[c.label ?? ''] }))
      .filter((x): x is { code: string; label: string; promo: SamsungPromotion } => !!x.promo);
  }

  sendAffEventsToGa() {
    const event = 'comp_codes';
    const eventCategory = 'Comp_codes';
    const eventLabelOverall = 'comp_codes_aff_open';
    const eventLabelSpecific = `${eventLabelOverall}_${this.company}`;

    if (typeof gtag === 'function') {
      gtag('event', event, {
        'event_category': eventCategory,
        'event_label': eventLabelOverall
      });

      gtag('event', event, {
        'event_category': eventCategory,
        'event_label': eventLabelSpecific
      });
    } else {
      console.error('gtag is not defined');
    }
  }

  trackCompanyInteraction() {
    this.visitorProfile.trackCompanyClick('company_click_detailpage', this.company);

    if (typeof gtag === 'function') {
      gtag('event', 'company_click_detailpage', {
        'event_category': 'Company_click',
        'event_label': `company_click_detailpage_${this.company}`
      });
    } else {
      console.error('gtag is not defined');
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
      () => {
        this.copiedCode = text;
        setTimeout(() => this.copiedCode = null, 2000);
      },
      (err) => {
        console.error('Failed to copy: ', err);
      }
    );
  }

  openNewPageWithCodeDetailModal(codeTableIndex: number) {
    if (!this.isBrowser) return;

    const baseUrl = window.location.origin;
    const url = `${baseUrl}/${this.company}#i=${encodeURIComponent(codeTableIndex)}`;

    window.open(url, '_blank');

    if(this.affiliateLink !== undefined) {
        location.href = this.affiliateLink;
    }
  }

  openModal(code: any) {
    this.selectedDiscount = {
      company: this.webshopName,
      companySlug: this.company,
      discountCode: code.code,
      percentage: code.discount,
      date: code.date,
      index: code.index ?? -1,
      affiliateLink: this.affiliateLink,
      label: code.label
    };

    this.isModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
    this.selectedDiscount = null;
  }

  getCardButtonText(discountCode: string) {
    if(discountCode.startsWith("BF_")) {
        return "Bekijk Deal";
    } else {
        return "PAK CODE";
    }
  }

  getCardButtonClasses(discountCode: string) {
    // Soft-modern look: ink pill, cream label. BF stays the same shape (kept
    // uppercase for the "Bekijk Deal" call-to-action).
    return "tw-font-body tw-font-semibold tw-text-cream tw-bg-ink hover:tw-opacity-90 tw-rounded-full tw-px-5 tw-py-2 tw-transition tw-duration-200 tw-uppercase tw-text-sm tw-whitespace-nowrap";
  }

  private loadRelatedShops(currentSlug: string, allData: string[]): void {
    const slugs: string[] = [
      'zalando',
      'shein',
      'nakdfashion',
      'loavies',
      'hunkemoller',
      'oduree.nl',
      'creamyfabrics',
      'idealofsweden',
      'desenio',
      'lookfantastic',
      'myproteinnl',
      'temu',
      'gymshark',
      'bylashbabe',
      'hellofresh.nl',
      'gutsgusto',
      'pinkgellac',
      'vitakruid',
      'spacenk.com',
      'leolive',
      'achateshop.com',
      'bellobox.nl',
      'geurwolkje',
      'ginatricot'
    ];

    const currentSlugLc = currentSlug.toLowerCase();

    const pool: RelatedShop[] = slugs
      .filter(slug => slug.toLowerCase() !== currentSlugLc)
      .map(slug => {
        const match = allData.find(line => {
          const rawCompany = line.split(', ')[0] ?? '';
          return rawCompany.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase() === slug.toLowerCase();
        });

        if (!match) return null;

        const parts = match.split(', ');
        const name = parts[0].replace(/\s*\(.*$/, '').trim();
        const percentage = (parts[2] ?? '').trim() || '10';
        return { name, slug, percentage };
      })
      .filter((shop): shop is RelatedShop => shop !== null);

    this.relatedShops = this.seededShuffle(pool, currentSlugLc).slice(0, 6);
  }

  // Shuffle deterministically instead of with Math.random(): ngOnInit runs twice —
  // once at prerender, once at hydration — and two different draws would make the
  // client tear down the prerendered list (@for tracks by slug) and swap the shops
  // out under the user. Seeding from the slug gives every shop its own stable
  // ordering that server and client both reproduce.
  private seededShuffle<T>(items: T[], seed: string): T[] {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

    const pool = [...items];
    for (let i = pool.length - 1; i > 0; i--) {
      h = (h * 1664525 + 1013904223) >>> 0; // LCG step — cheap, deterministic
      const j = h % (i + 1);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }

  formatRelatedPercentage(percentage: string): string {
    if (!percentage) return '';
    if (percentage.includes('€') || percentage.includes('vzk') || percentage.includes('gifts')) return percentage;
    return percentage + '%';
  }

  getRelatedLogoUrl(shopName: string): string | undefined {
    return this.logos[shopName];
  }
}
