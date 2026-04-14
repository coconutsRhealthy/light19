import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CookieConsentComponent } from './cookie-consent/cookie-consent.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CookieConsentComponent],
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent {
  title = 'light19';
}
