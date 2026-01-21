import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AnalyticsEventService } from '../services/analytics-event.service';

declare let gtag: Function;

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() isVisible = false;
  @Output() closed = new EventEmitter<void>();
  isCopied = false;

  discountCode: string = '';

  private _discount: any = null;

  @Input()
  set discount(value: any) {
    this._discount = value;
    if (value) {
      this.loadDiscountCode(value);
    }
  }

  get discount(): any {
    return this._discount;
  }

  constructor(private analyticsEventService: AnalyticsEventService) {}

  private async loadDiscountCode(discount: any) {
    this.discountCode = await this.getDiscountCode(discount);
  }

  getCorrectFormatOfCodeDate(rawCodeDate: string): string {
    var day = rawCodeDate.split("-")[1];
    var month = rawCodeDate.split("-")[0];

    if(day.charAt(0) === "0") {
      day = day.substring(1);
    }

    switch(month) {
      case '01':
        month = "januari";
        break;
      case '02':
        month = "februari";
        break;
      case '03':
        month = "maart";
        break;
      case '04':
        month = "april";
        break;
      case '05':
        month = "mei";
        break;
      case '06':
        month = "juni";
        break;
      case '07':
        month = "juli";
        break;
      case '08':
        month = "augustus";
        break;
      case '09':
        month = "september";
        break;
      case '10':
        month = "oktober";
        break;
      case '11':
        month = "november";
        break;
      case '12':
        month = "december";
        break;
    }

    return day + " " + month;
  }

  getCorrectFormatDiscountPercentage(rawDiscountPercentage: string): string {
    if(!rawDiscountPercentage.includes("€") && !rawDiscountPercentage.includes("vzk") && !rawDiscountPercentage.includes("gifts")) {
      rawDiscountPercentage = rawDiscountPercentage + "%";
    }

    return rawDiscountPercentage;
  }

  closeModal() {
    this.isVisible = false;
    this.discountCode = '';
    this.closed.emit();
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
      () => {
        this.showTooltip();
      },
      (err) => {
        console.error('Failed to copy: ', err);
      }
    );
  }

  showTooltip() {
    this.isCopied = true;
    setTimeout(() => {
      this.isCopied = false;
    }, 1500);
  }

  sendEventToGa(eventName: string, eventLabel: string): void {
    var eventLabelToUse = "copycode_" + eventLabel.toLowerCase();
    this.analyticsEventService.sendEventToGa(eventName, eventLabelToUse);
  }

  sendGiftcardEventsToGa(company: string): void {
    if (typeof gtag === 'function') {
      const companyLowerCase = company.toLowerCase();
      gtag('event', 'giftcard', {
        'event_category': 'Giftcard',
        'event_label': 'giftcard_inmodal'
      });

      gtag('event', 'giftcard', {
        'event_category': 'Giftcard',
        'event_label': 'giftcard_inmodal_' + companyLowerCase
      });
    } else {
      console.error('gtag is not defined');
    }
  }

  getDiscountUrl(): string {
    if (this.discount?.discountCode.startsWith('http')) {
      return this.discount.discountCode;
    }

    if (this.discount?.affiliateLink) {
      return this.discount.affiliateLink;
    }

    let companyName = this.discount.company?.replace(/\s*\(.*?\)\s*$/, '') ?? '';

    const query = encodeURIComponent(`${companyName} nl`);
    return `https://search.brave.com/search?q=${query}`;
  }

    isBlackFriday(discount: any): boolean {
      return discount?.discountCode?.startsWith('BF_');
    }

  async getDiscountCode(discount: any): Promise<string> {
    if (!discount.company.toLowerCase().startsWith('zzzzzdummy')) {
      return discount.discountCode;
    }

    try {
      const res = await fetch('https://tight-field-ba6b.eijeeijeeije.workers.dev');
      if (!res.ok) throw new Error('Fout bij ophalen code');

      const data = await res.json();
      return data.code;
    } catch (err) {
      console.error('Kon de kortingscode niet ophalen:', err);
      return discount.discountCode;
    }
  }
}