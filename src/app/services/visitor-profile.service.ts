import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

const STORAGE_KEY = 'diski_visitor_profile';

interface ProfileEvent {
  type: string;
  company?: string;
  searchValue?: string;
  pageValue?: string;
  datetime: string;
}

interface VisitorProfile {
  events: ProfileEvent[];
}

@Injectable({ providedIn: 'root' })
export class VisitorProfileService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(e => {
      this.trackPageView((e as NavigationEnd).urlAfterRedirects);
    });
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
    if (!isPlatformBrowser(this.platformId)) return { events: [] };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { events: [] };
    } catch {
      return { events: [] };
    }
  }

  private record(event: Omit<ProfileEvent, 'datetime'>): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const profile = this.getProfile();
    profile.events.push({ ...event, datetime: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }
}
