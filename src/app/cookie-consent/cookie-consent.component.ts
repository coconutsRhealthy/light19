import { Component, inject } from '@angular/core';
import { CookieConsentService } from '../services/cookie-consent.service';

@Component({
  selector: 'app-cookie-consent',
  templateUrl: './cookie-consent.component.html',
})
export class CookieConsentComponent {
  consent = inject(CookieConsentService);

  accept(): void {
    this.consent.acceptAll();
  }

  decline(): void {
    this.consent.declineAll();
  }
}
