import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { filter } from 'rxjs/operators';
const WEBHOOK_URL = 'https://emailtest.eijeeijeeije.workers.dev';
const STORAGE_KEY = 'diski_visitor_profile';
const SESSION_KEY = 'diski_session_init';
const EMAIL_KEY = 'discount_email';

interface ProfileEvent {
  type: string;
  company?: string;
  searchValue?: string;
  pageValue?: string;
  datetime: string;
}

interface VisitorProfile {
  events: ProfileEvent[];
  siteVisits: number;
}

@Injectable({ providedIn: 'root' })
export class VisitorProfileService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private http = inject(HttpClient);

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(e => {
      this.trackPageView((e as NavigationEnd).urlAfterRedirects);
    });

    this.initSession();
  }

  trackCompanyClick(type: string, company: string): void {
    this.record({ type, company });
  }

  trackSearch(term: string): void {
    this.record({ type: 'search', searchValue: term });
  }

  trackPageView(path: string): void {
    this.record({ type: 'page_view', pageValue: path });
  }

  getProfile(): VisitorProfile {
    if (!isPlatformBrowser(this.platformId)) return { events: [], siteVisits: 0 };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        events: parsed.events ?? [],
        siteVisits: parsed.siteVisits ?? 0
      };
    } catch {
      return { events: [], siteVisits: 0 };
    }
  }

  private initSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    sessionStorage.setItem(SESSION_KEY, '1');

    const profile = this.getProfile();
    profile.siteVisits += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));

    const email = localStorage.getItem(EMAIL_KEY);
    if (!email) return;

    this.sendProfileUpdate(email, profile);
  }

  subscribeEmail(email: string, company: string, path: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem(EMAIL_KEY, email);

    const profile = this.getProfile();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const body = {
      data: {
        type: 'profile',
        attributes: {
          email,
          first_name: email.split('@')[0],
          properties: {
            company,
            unlock_date: new Date().toISOString(),
            path,
            ...this.buildProfileProperties(profile)
          }
        }
      }
    };

    this.http.post(WEBHOOK_URL, body, { headers, responseType: 'text' }).subscribe({
      error: (err) => console.error('Fout bij unlock:', err)
    });
  }

  subscribeNewsletter(email: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem(EMAIL_KEY, email);

    const profile = this.getProfile();
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const body = {
      data: {
        type: 'profile',
        attributes: {
          email,
          first_name: email.split('@')[0],
          properties: {
            // Sentinel written to Brevo's PATH attribute so newsletter-form
            // signups are distinguishable from code-gate unlocks (which write a
            // real URL path). Filter Brevo on PATH = 'newsletter-signup'.
            // Caveat: last-touch — overwritten if this contact later unlocks a code.
            path: 'newsletter-signup',
            ...this.buildProfileProperties(profile)
          }
        }
      }
    };

    this.http.post(WEBHOOK_URL, body, { headers, responseType: 'text' }).subscribe({
      error: (err) => console.error('Fout bij nieuwsbrief inschrijving:', err)
    });
  }

  private sendProfileUpdate(email: string, profile: VisitorProfile): void {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const body = {
      data: {
        type: 'profile',
        attributes: {
          email,
          properties: this.buildProfileProperties(profile)
        }
      }
    };

    this.http.patch(WEBHOOK_URL, body, { headers, responseType: 'text' }).subscribe({
      error: (err) => console.error('Fout bij profiel update:', err)
    });
  }

  private buildProfileProperties(profile: VisitorProfile): Record<string, any> {
    return {
      visited_companies: this.toCountMap(profile.events.filter(e => e.company).map(e => e.company as string)),
      searched_terms: this.toCountMap(profile.events.filter(e => e.searchValue).map(e => e.searchValue as string)),
      visited_pages: this.toCountMap(profile.events.filter(e => e.pageValue).map(e => e.pageValue as string)),
      site_visits: profile.siteVisits
    };
  }

  private toCountMap(values: string[]): Record<string, number> {
    return values.reduce((acc, val) => {
      acc[val] = (acc[val] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private record(event: Omit<ProfileEvent, 'datetime'>): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const profile = this.getProfile();
    profile.events.push({ ...event, datetime: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }
}
