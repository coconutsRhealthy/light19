import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ElementRef } from '@angular/core';
import { DiscountsService } from '../services/discounts.service';
import { AffiliateLinkService } from '../services/affiliate-link.service';
import { WebshopNameService } from '../services/webshop-name.service';
import { CompanySeoTextService } from '../services/company-seo-text.service';
import { MetaService } from '../services/meta.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { RouterModule } from '@angular/router';

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
  companySeoText: string = "";
  discountCodes: { code: string, discount: string, date: string }[] = [];
  isLoading = true;
  copiedCode: string | null = null;

  affiliateLink: string | undefined;
  isModalVisible = false;
  selectedDiscount: any = null;

  monthYear: string = "";

  constructor(private route: ActivatedRoute, private datePipe: DatePipe, private elementRef: ElementRef,
                private discountsService: DiscountsService, private affiliateLinkService: AffiliateLinkService,
                private webshopNameService: WebshopNameService, private companySeoTextService: CompanySeoTextService,
                private meta: MetaService) { }

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

            if(companyNoBracketsLc === 'leolive') {
                if(!entry.discountCode.startsWith(urlString)) {
                    return false;
                }
            }

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
        this.companySeoText = this.companySeoTextService.getCompanySeoText(this.company) ?? '';
        this.monthYear = this.meta.getDateString();
        this.meta.updateTitle("Werkende " + this.webshopName + " kortingscode in " + this.monthYear);
        this.meta.updateMetaInfo("De nieuwste werkende kortingscode van " + this.webshopName + " in " + this.monthYear + "; Bespaar met deze kortingscode op online shoppen bij " + this.webshopName, "diski.nl", this.webshopName + ", Kortingscode, Korting");
      } else {
        this.meta.updateTitle("404 Deze pagina is niet gevonden op diski.nl");
        this.meta.updateMetaInfo("404 Deze pagina bestaat niet op diski.nl", "diski.nl", "404");
      }

      this.affiliateLink = this.affiliateLinkService.getAffiliateLink(companyName)
      this.discountCodes.sort((a, b) => a.code.startsWith(urlString) ? -1 : 1);

      const queryParams = new URLSearchParams(window.location.search);
      if(queryParams.has('i')) {
        const index = Number(queryParams.get('i'));
        if (!isNaN(index) && index >= 0 && index < this.discountCodes.length) {
          this.openModal(this.discountCodes[index]);
        }
      }

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
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/${this.company}?i=${encodeURIComponent(codeTableIndex)}`;

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
        return "Black Friday";
    } else {
        return "PAK CODE";
    }
  }

  getCardButtonClasses(discountCode: string) {
    if(discountCode.startsWith("BF_")) {
        return "tw-font-semibold tw-text-white tw-bg-gray-900 hover:tw-bg-gray-1000 tw-rounded-md tw-px-4 tw-py-2 tw-transition tw-duration-200 tw-shadow-sm hover:tw-shadow-md tw-uppercase";
    } else {
        return "tw-font-semibold tw-text-white tw-bg-sky-500 hover:tw-bg-sky-600 tw-rounded-md tw-px-4 tw-py-2 tw-transition tw-duration-200 tw-shadow-sm hover:tw-shadow-md tw-uppercase";
    }
  }
}
