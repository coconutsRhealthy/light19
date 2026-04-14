import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const GA_ID = 'G-DVP906XC65';
const FB_PIXEL_ID = '790112370507856';
const STORAGE_KEY = 'diski_cookie_consent';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private platformId = inject(PLATFORM_ID);

  consentGiven = signal(false);
  consentDecided = signal(false);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'accepted') {
      this.consentGiven.set(true);
      this.consentDecided.set(true);
      this.loadAnalyticsScripts();
    } else if (stored === 'declined') {
      this.consentDecided.set(true);
    }
  }

  acceptAll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(STORAGE_KEY, 'accepted');
    this.consentGiven.set(true);
    this.consentDecided.set(true);
    this.loadAnalyticsScripts();
  }

  declineAll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(STORAGE_KEY, 'declined');
    this.consentDecided.set(true);
  }

  private loadAnalyticsScripts(): void {
    this.loadGa();
    this.loadFbPixel();
  }

  private loadGa(): void {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    (window as any).gtag('config', GA_ID);
  }

  private loadFbPixel(): void {
    const win = window as any;
    if (win.fbq) return;

    const n: any = win.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!win._fbq) win._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    win.fbq('init', FB_PIXEL_ID);
    win.fbq('track', 'PageView');
  }
}
