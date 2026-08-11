import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AnalyticsEventService } from '../services/analytics-event.service';

/** Mirrors the pre-paint guard in index.html — keep both in sync. */
const DISMISSED_KEY = 'boodschappen_bar_dismissed';

/** The page the bar advertises. It hides itself there. */
const TARGET = 'goedkoopste-supermarkt';

/**
 * The sitewide announcement bar for the grocery price-comparison page.
 *
 * Same slot, and the same rules, as the app-waitlist bar it sits next to in
 * NavbarComponent: rendered once so it rides along on every page with a navbar,
 * dismissal is sitewide via one localStorage flag, and index.html hides it
 * pre-paint for visitors who already closed it.
 *
 * Unlike that bar this one is a plain link, not a form — so the whole text is
 * the anchor, and only the close button is outside it.
 *
 * Naming: the page lives at /goedkoopste-supermarkt (the keyword it targets) but
 * is called "Boodschappen" in the navbar (the clearest label next to "Beste
 * deals"). This component follows the navbar label.
 */
@Component({
  selector: 'app-boodschappen-bar',
  imports: [RouterModule],
  templateUrl: './boodschappen-bar.component.html',
  // Same reason as NavbarComponent: the host generates no box, so the bar and the
  // nav stay siblings in the page flow and nothing becomes a containing block for
  // the nav's `lg:sticky`.
  styles: [':host { display: contents; }'],
})
export class BoodschappenBarComponent implements OnInit {
  dismissed = false;
  onTargetPage = false;

  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private router: Router,
    private analyticsEventService: AnalyticsEventService,
  ) {}

  ngOnInit(): void {
    if (this.isBrowser) {
      this.dismissed = localStorage.getItem(DISMISSED_KEY) === '1';
    }

    // Kept in sync with navigation, not just read once: the bar outlives every
    // client-side route change, so a visitor who clicks through to the page
    // would otherwise keep being advertised the page they are already on.
    this.onTargetPage = this.isTarget(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => (this.onTargetPage = this.isTarget(e.urlAfterRedirects)));
  }

  track(): void {
    this.analyticsEventService.sendEventToGa(
      'boodschappen_bar_click',
      `boodschappen_bar_${this.pageKey()}`,
    );
  }

  dismiss(): void {
    this.dismissed = true;
    if (this.isBrowser) {
      localStorage.setItem(DISMISSED_KEY, '1');
    }
  }

  private isTarget(url: string): boolean {
    return this.path(url) === TARGET;
  }

  /**
   * Which page the click came from, as the GA event label suffix — so we can see
   * where the bar actually earns its clicks. '/' reports 'homepage', every other
   * page reports its path ('winkels', 'blogs/uniqlo', 'atmooz.com').
   */
  private pageKey(): string {
    const path = this.path(this.router.url);
    return path === '' ? 'homepage' : path;
  }

  /** Router URL minus query/hash and surrounding slashes. */
  private path(url: string): string {
    return url.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');
  }
}
