import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AnalyticsEventService } from '../services/analytics-event.service';
import { VisitorProfileService } from '../services/visitor-profile.service';
import { FormsModule } from '@angular/forms';

declare let gtag: Function;
declare let fbq: Function;

@Component({
  selector: 'app-modal',
  imports: [FormsModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() isVisible = false;
  @Output() closed = new EventEmitter<void>();
  isCopied = false;

  discountCode: string = '';

  private _discount: any = null;

  mailAddress: string = '';
  emailPlaceholder: string = 'jouw@email.nl';
  isUnlocked: boolean = false;
  acceptedPrivacy: boolean = false;
  showPrivacyError: boolean = false;
  showEmailBlock: boolean = true;

  @Input()
  set discount(value: any) {
    this._discount = value;
    if (value) {
      this.discountCode = value.discountCode;

      const savedEmail = localStorage.getItem('discount_email');

      const allowedBrands = [
        'nakdfashion',
        'ginatricot',
        'gutsgusto',
        'pinkgellac',
        'tessv',
        'gymshark',
        'shein'
      ];

      const companySlug = this.discount?.companySlug?.toLowerCase();

      if (savedEmail || !allowedBrands.includes(companySlug)) {
        this.mailAddress = savedEmail ?? '';
        this.isUnlocked = true;
        this.showEmailBlock = false;
      } else {
        this.showEmailBlock = true;
      }
    }
  }

  get discount(): any {
    return this._discount;
  }

  constructor(private analyticsEventService: AnalyticsEventService,
              private visitorProfile: VisitorProfileService) {}

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
    this.mailAddress = '';
    this.acceptedPrivacy = false;
    this.showPrivacyError = false;
    this.isUnlocked = false;
    this.discountCode = '';
    this.closed.emit();
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
      () => {
        this.showTooltip();
        if (typeof fbq === 'function') {
          fbq('trackCustom', 'CopyCode', {
            company: this.discount?.company ?? '',
            code: text,
          });
        }
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

  get canShare(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.share;
  }

  shareCode(): void {
    this.analyticsEventService.sendEventToGa('ShareCode', 'sharecode_' + (this.discount?.company ?? '').toLowerCase());

    const url = this.discount?.affiliateLink ?? window.location.href;
    const rawCompany = (this.discount?.company ?? '').replace(/\.(nl|com)$/i, '');
    const company = rawCompany.charAt(0).toUpperCase() + rawCompany.slice(1);
    const percentage = this.getCorrectFormatDiscountPercentage(this.discount?.percentage ?? '');
    const code = this.discount?.discountCode ?? '';

    let text = `Gebruik kortingscode ${code} bij ${company} voor ${percentage} korting!`;

    if (this.discount?.affiliateLink) {
      text += ` Shop ${company} met korting via: ${url}`;
    }

    text += `\nMeer kortingscodes? Kijk op diski.nl`;

    navigator.share({
      title: `${company} kortingscode`,
      text,
    }).catch((err: DOMException) => {
      if (err.name !== 'AbortError') console.error(err);
    });
  }

  unlockCode() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.mailAddress || !emailPattern.test(this.mailAddress)) {
          this.mailAddress = '';
          this.emailPlaceholder = 'Een geldig mailadres 😉';
          return;
      }

      if (!this.acceptedPrivacy) {
        this.showPrivacyError = true;
        return;
      }

      this.showPrivacyError = false;
      this.isUnlocked = true;

      this.visitorProfile.subscribeEmail(
        this.mailAddress,
        this.discount?.company ?? '',
        window.location.pathname
      );
  }
}