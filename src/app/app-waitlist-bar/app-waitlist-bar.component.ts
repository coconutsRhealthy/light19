import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AnalyticsEventService } from '../services/analytics-event.service';
import { VisitorProfileService } from '../services/visitor-profile.service';

/** Mirrors the pre-paint guard in index.html — keep both in sync. */
const DISMISSED_KEY = 'app_waitlist_bar_dismissed';

/**
 * The sticky "de Diski-app komt eraan" signup bar.
 *
 * Rendered once, inside NavbarComponent, so it rides along on every page that
 * shows the navbar instead of living in the homepage component. Dismissal is
 * sitewide: one localStorage flag, and index.html hides the bar pre-paint for
 * visitors who already closed it.
 */
@Component({
  selector: 'app-waitlist-bar',
  imports: [FormsModule],
  templateUrl: './app-waitlist-bar.component.html',
  // Same reason as NavbarComponent: the host must generate no box, or the bar's
  // own `sticky top-0` would pin against this host instead of the page scroll.
  styles: [':host { display: contents; }'],
})
export class AppWaitlistBarComponent implements OnInit {
  email = '';
  submitted = false;
  error = false;
  dismissed = false;

  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private router: Router,
    private analyticsEventService: AnalyticsEventService,
    private visitorProfile: VisitorProfileService,
  ) {}

  ngOnInit(): void {
    if (this.isBrowser) {
      this.dismissed = localStorage.getItem(DISMISSED_KEY) === '1';
    }
  }

  submit(event: Event): void {
    event.preventDefault();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email || !emailPattern.test(this.email)) {
      this.error = true;
      return;
    }

    this.error = false;
    this.visitorProfile.subscribeAppWaitlist(this.email);
    this.submitted = true;
    this.analyticsEventService.sendEventToGa(
      'app_waitlist_signup',
      `app_waitlist_signup_${this.pageKey()}`,
    );
  }

  dismiss(): void {
    this.dismissed = true;
    if (this.isBrowser) {
      localStorage.setItem(DISMISSED_KEY, '1');
    }
  }

  /**
   * Which page the signup came from, as the GA event label suffix. Read off the
   * router rather than location so it stays right after client-side navigation.
   * '/' keeps returning 'homepage' so the label is unchanged from when the bar
   * was homepage-only and the existing GA series stays continuous; every other
   * page reports its path ('winkels', 'blogs/uniqlo', 'atmooz.com').
   */
  private pageKey(): string {
    const path = this.router.url.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');
    return path === '' ? 'homepage' : path;
  }
}
