import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AnalyticsEventService } from '../services/analytics-event.service';
import { VisitorProfileService } from '../services/visitor-profile.service';
import { DiscountsService } from '../services/discounts.service';
import { getSamsungPromotion, SamsungPromotion } from '../data/samsung-promotions';
import { FormsModule } from '@angular/forms';
import shopUrls from '../data/shop-urls.json';

@Component({
  selector: 'app-modal',
  imports: [FormsModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  private static readonly EVERGREEN_BRANDS = new Set<string>([
    'nakdfashion',
    'ginatricot',
    'gutsgusto',
    'pinkgellac',
    'tessv',
    'gymshark',
    'shein',
  ]);
  private static readonly RECENT_DAYS = 5;

  @Input() isVisible = false;
  @Output() closed = new EventEmitter<void>();
  isCopied = false;

  discountCode: string = '';
  discountUrl: string | null = null;

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
    this.discountUrl = value ? this.resolveDiscountUrl() : null;
    if (value) {
      this.discountCode = value.discountCode;

      const savedEmail = localStorage.getItem('discount_email');
      const companySlug = this.discount?.companySlug?.toLowerCase();
      const recentSlugs = this.discountsService.getRecentlyAddedSlugs(ModalComponent.RECENT_DAYS);
      const requiresEmail =
        ModalComponent.EVERGREEN_BRANDS.has(companySlug) || recentSlugs.has(companySlug);

      if (savedEmail || !requiresEmail) {
        this.mailAddress = savedEmail ?? '';
        this.isUnlocked = true;
        this.showEmailBlock = false;
        // Denominator for the normal flow: modal opened with the code visible
        // immediately (ungated brand, or a returning user who already unlocked).
        this.trackCodeEvent('code_open_nogate', companySlug);
      } else {
        this.showEmailBlock = true;
        // Denominator for the email-gate funnel: the gate was actually shown.
        this.trackCodeEvent('code_gate_shown', companySlug);
      }
    }
  }

  get discount(): any {
    return this._discount;
  }

  // Samsung partner requirement: show the official promo details (looptijd,
  // voorwaarden, landingspagina) for each live, confirmed Samsung promotion.
  get samsungPromotion(): SamsungPromotion | undefined {
    if (this._discount?.companySlug?.toLowerCase() !== 'samsung') return undefined;
    return getSamsungPromotion(this._discount.label);
  }

  constructor(private analyticsEventService: AnalyticsEventService,
              private visitorProfile: VisitorProfileService,
              private discountsService: DiscountsService) {}

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
        // The user actually took the code — the key conversion.
        const slug = this.discount?.companySlug?.toLowerCase();
        // Aggregate copy count (overall total + historical continuity)...
        this.trackCodeEvent('code_copy', slug);
        // ...plus a funnel-split variant: showEmailBlock is true only for the gated
        // flow (mirrors code_gate_shown), false for the no-gate flow (mirrors
        // code_open_nogate).
        this.trackCodeEvent(this.showEmailBlock ? 'code_copy_gated' : 'code_copy_nogate', slug);
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

  /**
   * Where "Naar winkel" points: the affiliate link if we have one, otherwise the
   * shop's own URL from the prerendered registry map. Null when we know neither
   * — the footer CTA is then hidden rather than sent somewhere it can't reach.
   */
  private resolveDiscountUrl(): string | null {
    if (this.discount?.affiliateLink) {
      return this.discount.affiliateLink;
    }

    const slug = this.toSlug(this.discount?.companySlug ?? this.discount?.company ?? '');
    return (shopUrls as Record<string, string>)[slug] ?? null;
  }

  private toSlug(companyName: string): string {
    return companyName.replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
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

      // Numerator for the email-gate funnel: the user actually submitted their
      // email to reveal the code. unlock / gate_shown = fill-in rate.
      this.trackCodeEvent('code_unlock_email', this.discount?.companySlug?.toLowerCase());
  }

  /**
   * Fire a code-interaction event to GA, both an overall label (for the total)
   * and a per-company label (to compare brands). Used for the email-gate funnel
   * (code_gate_shown / code_unlock_email) and the copy action
   * (code_copy, plus the split code_copy_gated / code_copy_nogate).
   */
  private trackCodeEvent(action: string, companySlug?: string): void {
    this.analyticsEventService.sendEventToGa(action, action);
    if (companySlug) {
      this.analyticsEventService.sendEventToGa(action, `${action}_${companySlug}`);
    }
  }
}