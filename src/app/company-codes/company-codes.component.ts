import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { LOCALE_ID } from '@angular/core';
import { ElementRef } from '@angular/core';

import { DiscountsService } from '../services/discounts.service';
import { WebshopNameService } from '../services/webshop-name.service';
import { CompanySeoTextService } from '../services/company-seo-text.service';
import { MetaService } from '../services/meta.service';

declare let gtag: Function;

@Component({
  selector: 'app-company-codes',
  templateUrl: './company-codes.component.html',
  styleUrls: ['./company-codes.component.css', './../app.component.css'],
  providers: [
    DatePipe,
    { provide: LOCALE_ID, useValue: 'nl' },
  ]
})
export class CompanyCodesComponent implements OnInit {
  company: string;
  webshopName: string;
  companySeoText: string;
  discountCodes: { code: string, discount: string, date: string }[] = [];
  isLoading = true;

  constructor(private route: ActivatedRoute, private datePipe: DatePipe, private elementRef: ElementRef,
                private discountsService: DiscountsService, private webshopNameService: WebshopNameService,
                private companySeoTextService: CompanySeoTextService, private meta: MetaService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.company = params.get('company');
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
        .filter(entry => entry.company.startsWith(companyName) || entry.company.startsWith(companyName))
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
        this.companySeoText = this.companySeoTextService.getCompanySeoText(this.company);
        var monthYear = this.meta.getDateString();
        this.meta.updateTitle("Werkende " + this.webshopName + " kortingscode in " + monthYear);
        this.meta.updateMetaInfo("De nieuwste werkende kortingscode van " + this.webshopName + " in " + monthYear + "; Bespaar met deze kortingscode op online shoppen bij " + this.webshopName, "diski.nl", this.webshopName + ", Kortingscode, Korting");
      } else {
        this.meta.updateTitle("404 Deze pagina is niet gevonden op diski.nl");
        this.meta.updateMetaInfo("404 Deze pagina bestaat niet op diski.nl", "diski.nl", "404");
      }

      this.discountCodes.sort((a, b) => a.code.startsWith(urlString) ? -1 : 1);

      if(this.company === 'leolive') {
        const firstGiftCard = this.discountCodes.find(code => code.code.startsWith(urlString));
        this.discountCodes = firstGiftCard ? [firstGiftCard] : [{
            code: 'Zie laatste insta post @wiegeeftkorting voor Le Olive code',
            discount: '10',
            date: this.getCurrentDateAsString()
        }];
      }

      this.isLoading = false;
    });
  }

  formatDate(date: string): string {
    const formattedDate = this.getDateFromDateString(date);
    return this.datePipe.transform(formattedDate, 'd MMM', '', 'nl');
  }

  getCurrentDateAsString(): string {
    const currentDate = new Date();
    return String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + String(currentDate.getDate()).padStart(2, '0');
  }

  getDateFromDateString(dateString) {
    dateString = dateString + "";
    var dateStringArray = dateString.split("-");
    var month = dateStringArray[0] - 1;
    var day = dateStringArray[1];
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

  shouldDisplayPercent(discount) {
    var shouldDisplayPercent = false;

    if(isFinite(discount) && discount.indexOf('€') === -1) {
      shouldDisplayPercent = true;
    }

    return shouldDisplayPercent;
  }

  get hasHttpCodes(): boolean {
    return this.discountCodes.some(code => code.code.startsWith('http'));
  }

  sendGiftcardEventsToGa() {
    if (typeof gtag === 'function') {
      gtag('event', 'giftcard', {
        'event_category': 'Giftcard',
        'event_label': 'giftcard_companypage_table'
      });

      gtag('event', 'giftcard', {
        'event_category': 'Giftcard',
        'event_label': 'giftcard_companypage_table_' + this.company
      });
    } else {
      console.error('gtag is not defined');
    }
  }
}
