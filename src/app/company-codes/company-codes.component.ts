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
import { pickRelatedSlugs } from '../data/related-shops';

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

      // No backup-code fallback here: fetch-discounts.js injects a shop's entry from
      // company-seo-content/backup-codes.json into discounts.json at build time when it
      // has no live code, so the filter above already found it. That keeps the rest of the
      // site (homepage table, /winkels, search, related-shops grids) able to see the shop
      // too — the old in-component fallback was invisible to every other consumer of
      // discounts.json.

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
    } else if(this.company?.toLowerCase() === "bol.com") {
        return "PAK KORTING";
    } else {
        return "PAK CODE";
    }
  }

  getCardButtonClasses(discountCode: string) {
    // Soft-modern look: ink pill, cream label. BF stays the same shape (kept
    // uppercase for the "Bekijk Deal" call-to-action).
    return "tw-font-body tw-font-semibold tw-text-cream tw-bg-ink hover:tw-opacity-90 tw-rounded-full tw-px-5 tw-py-2 tw-transition tw-duration-200 tw-uppercase tw-text-sm tw-whitespace-nowrap";
  }

  // The pool used to be a hardcoded 24-slug array shuffled down to 6, which meant
  // 1,078 v1 pages aimed ~6,500 internal links at those 24 shops. It now draws
  // from every live shop via src/app/data/related-shops.ts, which documents the
  // measurements behind the change and keeps the draw deterministic.
  private loadRelatedShops(currentSlug: string, allData: string[]): void {
    const currentSlugLc = currentSlug.toLowerCase();

    // Index the feed once: slug -> the card's name and percentage. First entry per
    // shop wins, matching the old allData.find() lookup.
    const index = new Map<string, RelatedShop>();
    for (const line of allData) {
      const parts = line.split(', ');
      const raw = parts[0] ?? '';
      const slug = raw.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
      if (!slug || index.has(slug)) continue;
      index.set(slug, {
        name: raw.replace(/\s*\(.*$/, '').trim(),
        slug,
        percentage: (parts[2] ?? '').trim() || '10'
      });
    }

    this.relatedShops = pickRelatedSlugs({
      seed: currentSlugLc,
      livePool: [...index.keys()],
      max: 6
    }).map(slug => index.get(slug)!);
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
