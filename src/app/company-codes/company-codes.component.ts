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
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { RouterModule } from '@angular/router';
import { PLATFORM_ID, PendingTasks, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { VisitorProfileService } from '../services/visitor-profile.service';

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
  discountCodes: { code: string, discount: string, date: string }[] = [];
  isLoading = true;
  copiedCode: string | null = null;
  seoContent: SafeHtml | null = null;

  affiliateLink: string | undefined;
  isModalVisible = false;
  selectedDiscount: any = null;

  monthYear: string = "";

  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private pendingTasks = inject(PendingTasks);

  constructor(private route: ActivatedRoute, private datePipe: DatePipe, private elementRef: ElementRef,
                private discountsService: DiscountsService, private affiliateLinkService: AffiliateLinkService,
                private webshopNameService: WebshopNameService, private meta: MetaService,
                private sanitizer: DomSanitizer, private visitorProfile: VisitorProfileService) { }

  ngOnInit() {
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

      const urlString = 'https://';

      this.discountCodes = allDiscountCodes
          .filter(entry => {
            const companyNoBrackets = entry.company.replace(/\s*\(.*?\)\s*/g, '');
            const companyNoBracketsLc = companyNoBrackets.toLowerCase();

//             if(companyNoBracketsLc === 'leolive') {
//                 if(!entry.discountCode.startsWith(urlString)) {
//                     return false;
//                 }
//             }

            return companyNoBracketsLc === companyName.toLowerCase();
          })
        .map(entry => {
          let date;

          if (entry.discountCode.startsWith(urlString)) {
            date = this.getCurrentDateAsString();
          } else {
            date = entry.date;
          }

          return {
            code: entry.discountCode,
            discount: entry.percentage.toString(),
            date: date,
          };
        });

      if(this.discountCodes.length > 0) {
        this.webshopName = this.getWebshopName(this.company);
        this.monthYear = this.meta.getDateString();
        const codeCount = this.discountCodes.filter(c => !c.code.startsWith('http')).length;
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
          .filter(c => !c.code.startsWith('http'))
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
      this.discountCodes.sort((a, b) => a.code.startsWith(urlString) ? -1 : 1);

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
      }).finally(() => doneTask());

      this.isLoading = false;
    });
  }

  formatDate(date: string): string {
    const formattedDate = this.getDateFromDateString(date);
    return this.datePipe.transform(formattedDate, 'd MMM') ?? '';
  }

  getCurrentDateAsString(): string {
    const currentDate = new Date();
    return String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + String(currentDate.getDate()).padStart(2, '0');
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

  get hasHttpCodes(): boolean {
    return this.discountCodes.some(code => code.code.startsWith('http'));
  }

  sendGiftcardEventsToGa(wlsckUrl: string) {
    const isCashback = wlsckUrl.includes("foldersnl");

    const event = isCashback ? 'cashback' : 'giftcard';
    const eventCategory = isCashback ? 'Cashback' : 'Giftcard';
    const eventLabelOverall = isCashback ? 'cashback_companypage_table' : 'giftcard_companypage_table';
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
      discountCode: code.code,
      percentage: code.discount,
      date: code.date,
      index: code.index ?? -1,
      affiliateLink: this.affiliateLink
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
    if(discountCode.startsWith("BF_")) {
        return "tw-font-semibold tw-text-white tw-bg-blue-900 hover:tw-bg-blue-1000 tw-rounded-md tw-px-4 tw-py-2 tw-transition tw-duration-200 tw-shadow-sm hover:tw-shadow-md tw-uppercase";
    } else {
        return "tw-font-semibold tw-text-white tw-bg-sky-500 hover:tw-bg-sky-600 tw-rounded-md tw-px-4 tw-py-2 tw-transition tw-duration-200 tw-shadow-sm hover:tw-shadow-md tw-uppercase";
    }
  }
}
